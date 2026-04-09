"""撩咖 FastAPI 入口 — 路由 / CORS / rate limit / 流式 chat"""
from __future__ import annotations

import logging
from collections import defaultdict, deque
from datetime import datetime, timezone
from pathlib import Path
from time import time

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from backend.ai import (
    AIReplyError,
    build_fallback_reply,
    build_history,
    generate_reply,
    stream_reply,
)
from backend.auth import (
    get_current_user_optional,
    hash_password,
    issue_token,
    normalize_email,
    verify_password,
)
from backend.config import settings
from backend.db import Base, engine, get_db
from backend.models import Character, Message, OtpCode, User
from backend.schemas import (
    AuthResponse,
    CharacterCreate,
    CharacterOut,
    CharacterUpdate,
    ChatRequest,
    ChatResponse,
    LoginRequest,
    OtpSendRequest,
    OtpSendResponse,
    OtpVerifyRequest,
    RegisterRequest,
    UserOut,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("liaoka")


# ═══════════════════════════════════════════════════════════
# FastAPI 初始化
# ═══════════════════════════════════════════════════════════

app = FastAPI(title="撩咖 · AI 陪聊 API", version="0.4.0")

# CORS 白名单 — 不再用 "*" (和 allow_credentials=True 冲突且不安全)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

Base.metadata.create_all(bind=engine)


# ═══════════════════════════════════════════════════════════
# 简易内存 rate limit — 每 IP 每分钟 N 次 /chat
# 生产环境建议换成 slowapi + Redis
# ═══════════════════════════════════════════════════════════

_rate_window: dict[str, deque] = defaultdict(lambda: deque())
_RATE_LIMIT_WINDOW_SECONDS = 60

try:
    _RATE_LIMIT_MAX = int(settings.rate_limit_chat.split("/")[0])
except (ValueError, IndexError):
    _RATE_LIMIT_MAX = 20


def _check_rate_limit(ip: str) -> None:
    # 测试环境 bypass rate limit, 避免 pytest 自己把自己限了
    if settings.environment.lower() == "test":
        return
    now = time()
    window = _rate_window[ip]
    # 清掉 60 秒之前的记录
    while window and window[0] < now - _RATE_LIMIT_WINDOW_SECONDS:
        window.popleft()
    if len(window) >= _RATE_LIMIT_MAX:
        raise HTTPException(
            status_code=429,
            detail=f"请求太频繁，每分钟最多 {_RATE_LIMIT_MAX} 次, 请稍后再试",
        )
    window.append(now)


def _client_ip(request: Request) -> str:
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# ═══════════════════════════════════════════════════════════
# 静态资源 (4 个前端版本 + 当前默认)
# ═══════════════════════════════════════════════════════════

_frontend_root = Path(__file__).parent.parent / "frontend"
_static_dir = _frontend_root / "web"
_static_v1_dir = _frontend_root / "web-v1"
_static_v2_dir = _frontend_root / "web-v2"
_static_v3_dir = _frontend_root / "web-v3"
_static_v4_dir = _frontend_root / "web-v4"

for path, mount in [
    (_static_dir, "/static"),
    (_static_v1_dir, "/static-v1"),
    (_static_v2_dir, "/static-v2"),
    (_static_v3_dir, "/static-v3"),
    (_static_v4_dir, "/static-v4"),
]:
    if path.exists():
        app.mount(mount, StaticFiles(directory=str(path)), name=mount.strip("/"))


def _serve_index(directory: Path):
    index = directory / "index.html"
    if index.exists():
        return FileResponse(str(index), media_type="text/html")
    return {"message": "撩咖 API 运行中, 前端未构建"}


@app.get("/", include_in_schema=False)
def root():
    # 默认 v4 — Hinge 风沉浸式重设计
    return _serve_index(_static_v4_dir if _static_v4_dir.exists() else _static_dir)


@app.get("/v1", include_in_schema=False)
@app.get("/v1/", include_in_schema=False)
def v1():
    return _serve_index(_static_v1_dir)


@app.get("/v2", include_in_schema=False)
@app.get("/v2/", include_in_schema=False)
def v2():
    return _serve_index(_static_v2_dir)


@app.get("/v3", include_in_schema=False)
@app.get("/v3/", include_in_schema=False)
def v3():
    return _serve_index(_static_v3_dir)


@app.get("/v4", include_in_schema=False)
@app.get("/v4/", include_in_schema=False)
def v4():
    return _serve_index(_static_v4_dir)


# ═══════════════════════════════════════════════════════════
# 健康检查
# ═══════════════════════════════════════════════════════════

@app.get("/health")
def health():
    db_url = settings.database_url
    is_sqlite = db_url.startswith("sqlite")
    db_path = db_url.replace("sqlite:///./", "") if is_sqlite else None
    return {
        "status": "ok",
        "version": "0.4.0",
        "environment": settings.environment,
        "ai_configured": bool(settings.anthropic_api_key),
        "database": db_path if is_sqlite else "external",
        "database_exists": Path(db_path).exists() if db_path else True,
        "now": datetime.now(timezone.utc).isoformat(),
    }


# ═══════════════════════════════════════════════════════════
# Chat — 非流式 (兼容旧前端)
# ═══════════════════════════════════════════════════════════

@app.post("/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    request: Request,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    _check_rate_limit(_client_ip(request))

    user_message = payload.message.strip()
    if not user_message and not payload.image_url:
        raise HTTPException(status_code=400, detail="消息不能为空")

    history_records = (
        db.query(Message)
        .filter(Message.session_id == payload.session_id)
        .order_by(Message.created_at.asc(), Message.id.asc())
        .all()
    )

    user_record = Message(
        session_id=payload.session_id,
        user_id=user.id if user else None,
        role="user",
        content=user_message or "(图片)",
        image_url=payload.image_url,
    )
    db.add(user_record)
    db.commit()
    db.refresh(user_record)

    history = build_history(history_records + [user_record])

    try:
        reply = generate_reply(history, payload.persona)
    except AIReplyError as exc:
        logger.warning("AI engine failed: %s", exc.code)
        reply = build_fallback_reply(payload.persona)
    except Exception as exc:
        logger.exception("unexpected chat error")
        reply = build_fallback_reply(payload.persona)

    if not isinstance(reply, str) or not reply.strip():
        reply = build_fallback_reply(payload.persona)

    assistant_record = Message(
        session_id=payload.session_id,
        role="assistant",
        content=reply,
    )
    db.add(assistant_record)
    db.commit()

    return ChatResponse(reply=reply, session_id=payload.session_id)


# ═══════════════════════════════════════════════════════════
# Chat — SSE 流式 (新增, 体验质变)
# ═══════════════════════════════════════════════════════════

@app.post("/chat/stream")
def chat_stream(
    payload: ChatRequest,
    request: Request,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    """流式 chat — 边生成边返回. 前端用 fetch ReadableStream 或 EventSource 消费.

    响应格式: plain text chunks (每次 yield 一段文本片段)
    前端累加所有 chunks 即完整回复.
    """
    _check_rate_limit(_client_ip(request))

    user_message = payload.message.strip()
    if not user_message and not payload.image_url:
        raise HTTPException(status_code=400, detail="消息不能为空")

    # 存用户消息
    history_records = (
        db.query(Message)
        .filter(Message.session_id == payload.session_id)
        .order_by(Message.created_at.asc(), Message.id.asc())
        .all()
    )
    user_record = Message(
        session_id=payload.session_id,
        user_id=user.id if user else None,
        role="user",
        content=user_message or "(图片)",
        image_url=payload.image_url,
    )
    db.add(user_record)
    db.commit()
    db.refresh(user_record)
    history = build_history(history_records + [user_record])

    def _generator():
        collected: list[str] = []
        try:
            for chunk in stream_reply(history, payload.persona):
                if chunk:
                    collected.append(chunk)
                    yield chunk
        except Exception:
            logger.exception("stream failed")
            fb = build_fallback_reply(payload.persona)
            collected.append(fb)
            yield fb
        finally:
            # 流结束后一次性存整条 assistant 回复
            full_reply = "".join(collected).strip() or build_fallback_reply(payload.persona)
            try:
                # 注意: 在 generator 里需要独立 db session, 因为 request-scoped session 已关闭
                from backend.db import SessionLocal
                with SessionLocal() as save_db:
                    save_db.add(Message(
                        session_id=payload.session_id,
                        role="assistant",
                        content=full_reply,
                    ))
                    save_db.commit()
            except Exception:
                logger.exception("failed to persist streamed assistant reply")

    return StreamingResponse(
        _generator(),
        media_type="text/plain; charset=utf-8",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # nginx 不要缓冲 SSE
        },
    )


# ═══════════════════════════════════════════════════════════
# 全局异常 handler — 异常脱敏
# ═══════════════════════════════════════════════════════════

from fastapi.responses import JSONResponse


@app.exception_handler(Exception)
async def _global_handler(request: Request, exc: Exception):
    logger.exception("unhandled exception: %s", type(exc).__name__)
    if settings.is_production:
        # 生产脱敏
        return JSONResponse(
            status_code=500,
            content={"error": "服务暂时不可用, 请稍后重试"},
        )
    # 开发环境返回类型帮助调试, 但不返回完整 stack
    return JSONResponse(
        status_code=500,
        content={"error": "internal", "type": type(exc).__name__},
    )


# ═══════════════════════════════════════════════════════════
# Auth endpoints — 注册 / 登录 / 当前用户
# ═══════════════════════════════════════════════════════════

class EmailExistsError(HTTPException):
    def __init__(self):
        super().__init__(status_code=409, detail={"code": "EMAIL_EXISTS", "message": "该邮箱已注册, 请直接登录"})


@app.post("/auth/register", response_model=AuthResponse)
def auth_register(payload: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    _check_rate_limit(_client_ip(request))
    email = normalize_email(payload.email)
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="邮箱格式不正确")

    if db.query(User).filter(User.email == email).first():
        raise EmailExistsError()

    user = User(
        email=email,
        password_hash=hash_password(payload.password),
        nickname=(payload.nickname or email.split("@")[0])[:100],
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = issue_token(user.id)
    return AuthResponse(token=token, user=UserOut.model_validate(user))


@app.post("/auth/login", response_model=AuthResponse)
def auth_login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    _check_rate_limit(_client_ip(request))
    email = normalize_email(payload.email)
    user = db.query(User).filter(User.email == email).first()
    if user is None or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="邮箱或密码错误")
    user.last_active = datetime.now(timezone.utc)
    db.commit()
    token = issue_token(user.id)
    return AuthResponse(token=token, user=UserOut.model_validate(user))


@app.get("/auth/me", response_model=UserOut)
def auth_me(user: User | None = Depends(get_current_user_optional)):
    if user is None:
        raise HTTPException(status_code=401, detail="未登录")
    return UserOut.model_validate(user)


# ═══════════════════════════════════════════════════════════
# 图片上传 — 简易本地存储 (生产应用 S3/OSS)
# ═══════════════════════════════════════════════════════════

import secrets as _secrets
from fastapi import File, UploadFile

_UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
_ALLOWED_IMG_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
_MAX_IMG_SIZE = 8 * 1024 * 1024  # 8MB

if _UPLOAD_DIR.exists():
    app.mount("/uploads", StaticFiles(directory=str(_UPLOAD_DIR)), name="uploads")


@app.post("/upload/image")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    user: User | None = Depends(get_current_user_optional),
):
    _check_rate_limit(_client_ip(request))
    if file.content_type not in _ALLOWED_IMG_TYPES:
        raise HTTPException(status_code=400, detail=f"不支持的图片格式: {file.content_type}")
    contents = await file.read()
    if len(contents) > _MAX_IMG_SIZE:
        raise HTTPException(status_code=413, detail="图片超过 8MB 限制")

    ext = file.content_type.split("/")[-1]
    name = f"{_secrets.token_hex(12)}.{ext}"
    target = _UPLOAD_DIR / name
    target.write_bytes(contents)
    url = f"/uploads/{name}"
    logger.info("uploaded image %s by user_id=%s size=%d", name, user.id if user else None, len(contents))
    return {"url": url, "size": len(contents)}


# ═══════════════════════════════════════════════════════════
# 手机号 OTP 登录 (mock — 开发模式返回 debug_code)
# ═══════════════════════════════════════════════════════════

import random as _rand


def _gen_otp() -> str:
    return "".join(str(_rand.randint(0, 9)) for _ in range(6))


@app.post("/auth/otp/send", response_model=OtpSendResponse)
def otp_send(payload: OtpSendRequest, request: Request, db: Session = Depends(get_db)):
    _check_rate_limit(_client_ip(request))
    phone = payload.phone.strip()
    if not phone or len(phone) < 4:
        raise HTTPException(status_code=400, detail="手机号格式不正确")

    code = _gen_otp()
    # 废弃旧 code
    db.query(OtpCode).filter(OtpCode.phone == phone, OtpCode.used == False).update({"used": True})
    db.add(OtpCode(phone=phone, code=code))
    db.commit()
    logger.info("otp sent to %s code=%s (dev mode)", phone, code)

    # 开发/演示模式直接返回 code. 生产接短信网关, 不返回
    return OtpSendResponse(
        sent=True,
        debug_code=code if not settings.is_production else None,
    )


@app.post("/auth/otp/verify", response_model=AuthResponse)
def otp_verify(payload: OtpVerifyRequest, request: Request, db: Session = Depends(get_db)):
    _check_rate_limit(_client_ip(request))
    phone = payload.phone.strip()
    code = payload.code.strip()

    otp = (
        db.query(OtpCode)
        .filter(OtpCode.phone == phone, OtpCode.code == code, OtpCode.used == False)
        .order_by(OtpCode.id.desc())
        .first()
    )
    if otp is None:
        # demo 模式: 万能码 123456 也通过, 方便主人演示
        if not settings.is_production and code == "123456":
            pass
        else:
            raise HTTPException(status_code=401, detail="验证码错误或已过期")
    else:
        otp.used = True
        db.commit()

    # 注册或登录
    user = db.query(User).filter(User.phone == phone).first()
    if user is None:
        user = User(
            phone=phone,
            nickname=(payload.nickname or phone[-4:] or "用户")[:100],
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    user.last_active = datetime.now(timezone.utc)
    db.commit()
    token = issue_token(user.id)
    return AuthResponse(token=token, user=UserOut.model_validate(user))


# ═══════════════════════════════════════════════════════════
# Characters — 自定义角色 CRUD + 公开市场
# ═══════════════════════════════════════════════════════════

from fastapi import Query


@app.get("/characters/mine", response_model=list[CharacterOut])
def characters_mine(
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    if user is None:
        return []
    rows = (
        db.query(Character)
        .filter(Character.owner_id == user.id)
        .order_by(Character.updated_at.desc())
        .all()
    )
    return [CharacterOut.model_validate(c) for c in rows]


@app.get("/characters/market", response_model=list[CharacterOut])
def characters_market(
    db: Session = Depends(get_db),
    sort: str = Query(default="plays", pattern="^(plays|recent|likes)$"),
    limit: int = Query(default=50, ge=1, le=100),
):
    """公开角色市场"""
    query = db.query(Character).filter(Character.is_public == True)
    if sort == "recent":
        query = query.order_by(Character.created_at.desc())
    elif sort == "likes":
        query = query.order_by(Character.likes_count.desc())
    else:
        query = query.order_by(Character.plays_count.desc())
    rows = query.limit(limit).all()
    return [CharacterOut.model_validate(c) for c in rows]


@app.get("/characters/{cid}", response_model=CharacterOut)
def character_get(cid: int, db: Session = Depends(get_db)):
    c = db.query(Character).filter(Character.id == cid).first()
    if c is None:
        raise HTTPException(status_code=404, detail="角色不存在")
    return CharacterOut.model_validate(c)


@app.post("/characters", response_model=CharacterOut)
def character_create(
    payload: CharacterCreate,
    request: Request,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    _check_rate_limit(_client_ip(request))
    c = Character(
        owner_id=user.id if user else None,
        name=payload.name.strip(),
        tagline=payload.tagline.strip(),
        style=payload.style.strip(),
        description=payload.description,
        system_prompt=payload.system_prompt,
        opening_line=payload.opening_line,
        avatar_url=payload.avatar_url,
        cover_gradient=payload.cover_gradient,
        tags=payload.tags,
        is_public=payload.is_public,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return CharacterOut.model_validate(c)


@app.patch("/characters/{cid}", response_model=CharacterOut)
def character_update(
    cid: int,
    payload: CharacterUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional),
):
    c = db.query(Character).filter(Character.id == cid).first()
    if c is None:
        raise HTTPException(status_code=404, detail="角色不存在")
    if user is None or c.owner_id != user.id:
        raise HTTPException(status_code=403, detail="无权修改他人角色")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(c, field, value)
    c.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(c)
    return CharacterOut.model_validate(c)


@app.delete("/characters/{cid}")
def character_delete(
    cid: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional),
):
    c = db.query(Character).filter(Character.id == cid).first()
    if c is None:
        raise HTTPException(status_code=404, detail="角色不存在")
    if user is None or c.owner_id != user.id:
        raise HTTPException(status_code=403, detail="无权删除他人角色")
    db.delete(c)
    db.commit()
    return {"ok": True}


@app.post("/characters/{cid}/play")
def character_play(cid: int, db: Session = Depends(get_db)):
    """记录一次使用 (前端进入聊天时调用)"""
    c = db.query(Character).filter(Character.id == cid).first()
    if c is None:
        raise HTTPException(status_code=404, detail="角色不存在")
    c.plays_count = (c.plays_count or 0) + 1
    db.commit()
    return {"plays": c.plays_count}
