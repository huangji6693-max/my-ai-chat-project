from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    session_id: str = Field(..., min_length=1, max_length=100)
    persona: str | None = Field(default=None, max_length=50)


class ChatResponse(BaseModel):
    reply: str
    session_id: str
