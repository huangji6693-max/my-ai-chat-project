"""撩咖 backend 基础测试 — pytest + httpx + FastAPI TestClient"""
import os

# 强制覆盖 DATABASE_URL — 测试只用临时 SQLite, 防止 host 环境注入 postgres URL
os.environ["DATABASE_URL"] = "sqlite:///./test_chat.db"
os.environ["ENVIRONMENT"] = "test"
# 清空可能存在的 API key, 强制走 fallback 路径测试
os.environ.pop("ANTHROPIC_API_KEY", None)

# 必须在 import 之前清掉 backend.config 的缓存 (lru_cache)
from fastapi.testclient import TestClient

from backend import config as _config
_config.get_settings.cache_clear()
_config.settings = _config.get_settings()

from backend.main import app

client = TestClient(app)


def test_health_returns_ok():
    res = client.get("/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert "version" in body
    assert "ai_configured" in body


def test_chat_rejects_empty_message():
    res = client.post("/chat", json={"message": "", "session_id": "t1"})
    # FastAPI 会因为 min_length=1 在 schema 层报 422
    assert res.status_code in (400, 422)


def test_chat_returns_fallback_without_api_key():
    """无 ANTHROPIC_API_KEY 时, demo 模式应该返回 fallback 回复, 不是 500"""
    res = client.post("/chat", json={
        "message": "今天有点累",
        "session_id": "test-fallback",
        "persona": "liu",
    })
    assert res.status_code == 200
    body = res.json()
    assert body["session_id"] == "test-fallback"
    assert isinstance(body["reply"], str)
    assert len(body["reply"]) > 0


def test_chat_persona_aliases():
    """v3 persona key (luna/zhou) 应该能正常工作 (映射到 v4 角色)"""
    for persona in ["luna", "zhou", "liu", "jiang", "gu", "su"]:
        res = client.post("/chat", json={
            "message": "嗨",
            "session_id": f"alias-{persona}",
            "persona": persona,
        })
        assert res.status_code == 200, f"persona {persona} failed"
        assert res.json()["reply"]


def test_v4_route_serves_html():
    res = client.get("/v4")
    assert res.status_code == 200
    assert "text/html" in res.headers.get("content-type", "")
