import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from backend.ai import AIReplyError, build_fallback_reply, build_history, generate_reply
from backend.db import Base, engine, get_db
from backend.models import Message
from backend.schemas import ChatRequest, ChatResponse

load_dotenv()

app = FastAPI(title="AI Chat Companion API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# 挂载 PWA 静态资源目录（HTML、CSS、JS、manifest、Service Worker、图标）
_frontend_root = Path(__file__).parent.parent / "frontend"
_static_dir = _frontend_root / "web"
_static_v1_dir = _frontend_root / "web-v1"
_static_v2_dir = _frontend_root / "web-v2"
_static_v3_dir = _frontend_root / "web-v3"
_static_v4_dir = _frontend_root / "web-v4"

if _static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(_static_dir)), name="static")
if _static_v1_dir.exists():
    app.mount("/static-v1", StaticFiles(directory=str(_static_v1_dir)), name="static-v1")
if _static_v2_dir.exists():
    app.mount("/static-v2", StaticFiles(directory=str(_static_v2_dir)), name="static-v2")
if _static_v3_dir.exists():
    app.mount("/static-v3", StaticFiles(directory=str(_static_v3_dir)), name="static-v3")
if _static_v4_dir.exists():
    app.mount("/static-v4", StaticFiles(directory=str(_static_v4_dir)), name="static-v4")


def serve_frontend_index(directory: Path):
    index_path = directory / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path), media_type="text/html")
    return {"message": "AI Chat Companion API is running. Frontend not found."}


@app.get("/", include_in_schema=False)
def serve_index():
    """返回当前默认 PWA 页面"""
    return serve_frontend_index(_static_dir)


@app.get("/v1", include_in_schema=False)
@app.get("/v1/", include_in_schema=False)
def serve_v1_index():
    """返回封存的第一版 PWA 页面"""
    return serve_frontend_index(_static_v1_dir)


@app.get("/v2", include_in_schema=False)
@app.get("/v2/", include_in_schema=False)
def serve_v2_index():
    """返回截图驱动的第二版 PWA 页面"""
    return serve_frontend_index(_static_v2_dir)


@app.get("/v3", include_in_schema=False)
@app.get("/v3/", include_in_schema=False)
def serve_v3_index():
    """返回猫箱风格重构的第三版 PWA 页面"""
    return serve_frontend_index(_static_v3_dir)


@app.get("/v4", include_in_schema=False)
@app.get("/v4/", include_in_schema=False)
def serve_v4_index():
    """返回 Hinge 风格沉浸式 + mesh 流动的第四版 PWA 页面"""
    return serve_frontend_index(_static_v4_dir)


@app.get("/health")
def health_check():
    db_path = os.getenv("DATABASE_URL", "sqlite:///./chat.db").replace("sqlite:///./", "")
    return {
        "status": "ok",
        "database": db_path if db_path else "chat.db",
        "database_exists": Path(db_path or "chat.db").exists(),
    }


@app.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    user_message = payload.message.strip()
    if not user_message:
        raise HTTPException(status_code=400, detail="消息不能为空")

    history_records = (
        db.query(Message)
        .filter(Message.session_id == payload.session_id)
        .order_by(Message.created_at.asc(), Message.id.asc())
        .all()
    )

    user_record = Message(
        session_id=payload.session_id,
        role="user",
        content=user_message,
    )
    db.add(user_record)
    db.commit()
    db.refresh(user_record)

    history = build_history(history_records + [user_record])

    try:
        reply = generate_reply(history, payload.persona)
    except AIReplyError:
        # 演示模式 — 任何 AI 引擎错误都用 persona-aware fallback, 用户体验流畅
        reply = build_fallback_reply(payload.persona)
    except Exception:
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
