from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db import Base


def _utcnow() -> datetime:
    """Python 3.12+ 兼容: datetime.utcnow() 已 deprecated"""
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str | None] = mapped_column(String(200), unique=True, index=True, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), unique=True, index=True, nullable=True)
    password_hash: Mapped[str | None] = mapped_column(String(200), nullable=True)
    nickname: Mapped[str] = mapped_column(String(100), default="用户")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_vip: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)
    last_active: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[str] = mapped_column(String(100), index=True)
    user_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    role: Mapped[str] = mapped_column(String(20), index=True)
    content: Mapped[str] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)


class Character(Base):
    """用户自定义 AI 角色 — 支持私有和公开分享"""
    __tablename__ = "characters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    # 基础
    name: Mapped[str] = mapped_column(String(60), nullable=False)
    tagline: Mapped[str] = mapped_column(String(120), default="")
    style: Mapped[str] = mapped_column(String(60), default="温柔")  # 温柔 / 高冷 / 幽默 / 甜系
    # 人设
    description: Mapped[str] = mapped_column(Text, default="")
    system_prompt: Mapped[str] = mapped_column(Text, default="")
    opening_line: Mapped[str] = mapped_column(Text, default="")
    # 展示
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    cover_gradient: Mapped[str | None] = mapped_column(String(200), nullable=True)  # CSS linear/radial
    tags: Mapped[str] = mapped_column(String(200), default="")  # 逗号分隔
    # 市场
    is_public: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    plays_count: Mapped[int] = mapped_column(Integer, default=0)
    likes_count: Mapped[int] = mapped_column(Integer, default=0)
    # 时间
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class OtpCode(Base):
    """手机号 OTP — 演示版本, 生产应该用 Redis TTL"""
    __tablename__ = "otp_codes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    phone: Mapped[str] = mapped_column(String(50), index=True)
    code: Mapped[str] = mapped_column(String(10))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    used: Mapped[bool] = mapped_column(Boolean, default=False)
