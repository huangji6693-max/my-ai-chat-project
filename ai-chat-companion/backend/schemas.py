from datetime import datetime

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    session_id: str = Field(..., min_length=1, max_length=100)
    persona: str | None = Field(default=None, max_length=50)
    image_url: str | None = Field(default=None, max_length=600)


class ChatResponse(BaseModel):
    reply: str
    session_id: str


# ═══════════════════════════════════════════════════════════
# Auth schemas
# ═══════════════════════════════════════════════════════════

class RegisterRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=200)
    password: str = Field(..., min_length=6, max_length=200)
    nickname: str | None = Field(default=None, max_length=100)


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=200)
    password: str = Field(..., min_length=1, max_length=200)


class UserOut(BaseModel):
    id: int
    email: str | None
    nickname: str
    is_vip: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    token: str
    user: UserOut


# ═══════════════════════════════════════════════════════════
# OTP (手机号验证码)
# ═══════════════════════════════════════════════════════════

class OtpSendRequest(BaseModel):
    phone: str = Field(..., min_length=4, max_length=50)


class OtpSendResponse(BaseModel):
    sent: bool
    # dev 模式直接返回 code 便于演示, 生产环境不要返回
    debug_code: str | None = None


class OtpVerifyRequest(BaseModel):
    phone: str = Field(..., min_length=4, max_length=50)
    code: str = Field(..., min_length=4, max_length=10)
    nickname: str | None = Field(default=None, max_length=100)


# ═══════════════════════════════════════════════════════════
# Character (自定义角色 / 市场)
# ═══════════════════════════════════════════════════════════

class CharacterCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=60)
    tagline: str = Field(default="", max_length=120)
    style: str = Field(default="温柔", max_length=60)
    description: str = Field(default="", max_length=2000)
    system_prompt: str = Field(default="", max_length=4000)
    opening_line: str = Field(default="", max_length=500)
    avatar_url: str | None = Field(default=None, max_length=500)
    cover_gradient: str | None = Field(default=None, max_length=200)
    tags: str = Field(default="", max_length=200)
    is_public: bool = Field(default=False)


class CharacterUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=60)
    tagline: str | None = Field(default=None, max_length=120)
    style: str | None = Field(default=None, max_length=60)
    description: str | None = Field(default=None, max_length=2000)
    system_prompt: str | None = Field(default=None, max_length=4000)
    opening_line: str | None = Field(default=None, max_length=500)
    avatar_url: str | None = Field(default=None, max_length=500)
    cover_gradient: str | None = Field(default=None, max_length=200)
    tags: str | None = Field(default=None, max_length=200)
    is_public: bool | None = None


class CharacterOut(BaseModel):
    id: int
    owner_id: int | None
    name: str
    tagline: str
    style: str
    description: str
    opening_line: str
    avatar_url: str | None
    cover_gradient: str | None
    tags: str
    is_public: bool
    plays_count: int
    likes_count: int
    created_at: datetime

    class Config:
        from_attributes = True
