"""撩咖鉴权 — JWT + bcrypt 密码哈希 + 可选认证 (兼容游客 demo)"""
from __future__ import annotations

import hashlib
import hmac
import json
import secrets
import time
from base64 import urlsafe_b64decode, urlsafe_b64encode

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from backend.config import settings
from backend.db import get_db
from backend.models import User

# JWT secret — 生产从 env 读, 开发用进程级随机
_JWT_SECRET = (settings.anthropic_api_key or "")[:32].ljust(32, "x") if settings.anthropic_api_key else secrets.token_hex(32)
_JWT_TTL_SECONDS = 60 * 60 * 24 * 30  # 30 天


# ═══════════════════════════════════════════════════════════
# 密码哈希 — 用 PBKDF2-HMAC-SHA256 (无外部依赖, 不需要 bcrypt)
# ═══════════════════════════════════════════════════════════

def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 200_000)
    return f"pbkdf2$200000${salt.hex()}${key.hex()}"


def verify_password(password: str, hashed: str) -> bool:
    try:
        algo, iters, salt_hex, key_hex = hashed.split("$")
        if algo != "pbkdf2":
            return False
        key = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), int(iters))
        return hmac.compare_digest(key.hex(), key_hex)
    except (ValueError, AttributeError):
        return False


# ═══════════════════════════════════════════════════════════
# 简易 JWT — header.payload.signature, 不依赖 PyJWT
# ═══════════════════════════════════════════════════════════

def _b64url(b: bytes) -> str:
    return urlsafe_b64encode(b).rstrip(b"=").decode()


def _b64url_decode(s: str) -> bytes:
    pad = "=" * (-len(s) % 4)
    return urlsafe_b64decode(s + pad)


def issue_token(user_id: int) -> str:
    header = _b64url(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    payload = _b64url(json.dumps({
        "sub": str(user_id),
        "iat": int(time.time()),
        "exp": int(time.time()) + _JWT_TTL_SECONDS,
    }, separators=(",", ":")).encode())
    sig_input = f"{header}.{payload}".encode()
    sig = hmac.new(_JWT_SECRET.encode(), sig_input, hashlib.sha256).digest()
    return f"{header}.{payload}.{_b64url(sig)}"


def verify_token(token: str) -> int | None:
    """返回 user_id 或 None"""
    try:
        header_b64, payload_b64, sig_b64 = token.split(".")
        sig_input = f"{header_b64}.{payload_b64}".encode()
        expected_sig = hmac.new(_JWT_SECRET.encode(), sig_input, hashlib.sha256).digest()
        actual_sig = _b64url_decode(sig_b64)
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        payload = json.loads(_b64url_decode(payload_b64))
        if payload.get("exp", 0) < time.time():
            return None
        return int(payload["sub"])
    except (ValueError, KeyError, json.JSONDecodeError):
        return None


# ═══════════════════════════════════════════════════════════
# FastAPI 依赖 — 可选认证 (没 token 也能用 demo)
# ═══════════════════════════════════════════════════════════

def get_current_user_optional(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User | None:
    """可选认证 — 没 token 返回 None (允许游客 demo)"""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization[7:].strip()
    user_id = verify_token(token)
    if user_id is None:
        return None
    return db.query(User).filter(User.id == user_id, User.is_active == True).first()


def get_current_user_required(
    user: User | None = Depends(get_current_user_optional),
) -> User:
    """强制认证 — 没 token 返回 401"""
    if user is None:
        raise HTTPException(status_code=401, detail="未登录或登录已过期")
    return user


# ═══════════════════════════════════════════════════════════
# 邮箱归一化 (春水圈血泪教训)
# ═══════════════════════════════════════════════════════════

def normalize_email(raw: str | None) -> str:
    return (raw or "").strip().lower()
