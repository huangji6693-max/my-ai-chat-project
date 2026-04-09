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
