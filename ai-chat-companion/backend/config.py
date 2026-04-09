"""集中配置 — 所有 env 变量在这里定义, 其他模块 from .config import settings"""
from __future__ import annotations

import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


class Settings:
    """应用配置 — 使用简单的类而非 pydantic-settings, 减少依赖"""

    # AI 引擎
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "").strip()
    anthropic_model: str = os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001")
    anthropic_base_url: str = os.getenv("ANTHROPIC_BASE_URL", "https://api.anthropic.com")
    max_tokens: int = int(os.getenv("ANTHROPIC_MAX_TOKENS", "512"))
    history_limit: int = int(os.getenv("HISTORY_LIMIT", "30"))

    # 数据库
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./chat.db")

    # CORS 白名单 (逗号分隔的 origin 列表, 默认只允许本地开发)
    cors_origins: list[str] = [
        o.strip()
        for o in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:8000,http://127.0.0.1:8000,http://localhost:5173"
        ).split(",")
        if o.strip()
    ]

    # Rate limit (每分钟每 IP 最多几次 chat)
    rate_limit_chat: str = os.getenv("RATE_LIMIT_CHAT", "20/minute")

    # 运行环境 — production 下异常不透传
    environment: str = os.getenv("ENVIRONMENT", "development")

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
