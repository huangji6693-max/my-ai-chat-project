"""自定义角色 / 市场 / OTP 测试"""
import os
import time

os.environ["DATABASE_URL"] = "sqlite:///./test_characters.db"
os.environ["ENVIRONMENT"] = "test"
os.environ.pop("ANTHROPIC_API_KEY", None)

from fastapi.testclient import TestClient

from backend import config as _config
_config.get_settings.cache_clear()
_config.settings = _config.get_settings()

from backend.main import app

client = TestClient(app)


def _register_user():
    email = f"test_{int(time.time() * 1000)}@demo.com"
    res = client.post("/auth/register", json={"email": email, "password": "pass12345"})
    return res.json()["token"]


def _auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


def test_character_create_and_get():
    token = _register_user()
    res = client.post(
        "/characters",
        headers=_auth_headers(token),
        json={
            "name": "测试角色",
            "tagline": "温柔陪伴",
            "style": "温柔",
            "description": "一位温柔的 AI 朋友",
            "opening_line": "嗨, 今天过得怎么样?",
            "tags": "温柔,治愈",
            "is_public": True,
        },
    )
    assert res.status_code == 200, res.text
    c = res.json()
    assert c["name"] == "测试角色"
    assert c["is_public"] is True
    cid = c["id"]

    res = client.get(f"/characters/{cid}")
    assert res.status_code == 200
    assert res.json()["name"] == "测试角色"


def test_character_market_lists_public_only():
    token1 = _register_user()
    client.post(
        "/characters",
        headers=_auth_headers(token1),
        json={"name": "公开的", "is_public": True},
    )
    client.post(
        "/characters",
        headers=_auth_headers(token1),
        json={"name": "私密的", "is_public": False},
    )

    res = client.get("/characters/market")
    assert res.status_code == 200
    names = [c["name"] for c in res.json()]
    assert "公开的" in names
    assert "私密的" not in names


def test_character_mine_requires_auth():
    res = client.get("/characters/mine")
    assert res.status_code == 200
    assert res.json() == []

    token = _register_user()
    client.post("/characters", headers=_auth_headers(token), json={"name": "我的"})
    res = client.get("/characters/mine", headers=_auth_headers(token))
    assert res.status_code == 200
    assert len(res.json()) >= 1


def test_character_update_forbids_others():
    tokenA = _register_user()
    res = client.post("/characters", headers=_auth_headers(tokenA), json={"name": "A 的角色"})
    cid = res.json()["id"]

    tokenB = _register_user()
    res = client.patch(
        f"/characters/{cid}",
        headers=_auth_headers(tokenB),
        json={"name": "B 想改"},
    )
    assert res.status_code == 403


def test_character_play_increments_count():
    token = _register_user()
    cid = client.post("/characters", headers=_auth_headers(token), json={"name": "播放测试"}).json()["id"]

    for _ in range(3):
        client.post(f"/characters/{cid}/play")

    res = client.get(f"/characters/{cid}")
    assert res.json()["plays_count"] >= 3


def test_otp_send_dev_mode_returns_debug_code():
    res = client.post("/auth/otp/send", json={"phone": "13812345678"})
    assert res.status_code == 200
    body = res.json()
    assert body["sent"] is True
    assert body["debug_code"] is not None
    assert len(body["debug_code"]) == 6


def test_otp_verify_with_debug_code_registers_user():
    phone = f"138{int(time.time()) % 100000000:08d}"
    send_res = client.post("/auth/otp/send", json={"phone": phone})
    code = send_res.json()["debug_code"]

    res = client.post("/auth/otp/verify", json={
        "phone": phone,
        "code": code,
        "nickname": "手机用户",
    })
    assert res.status_code == 200
    body = res.json()
    assert "token" in body
    assert body["user"]["nickname"] == "手机用户"


def test_otp_verify_universal_code_demo_mode():
    """demo 模式万能码 123456 应该也能通过, 方便主人演示"""
    phone = f"138{int(time.time()) % 100000000:08d}"
    res = client.post("/auth/otp/verify", json={
        "phone": phone,
        "code": "123456",
    })
    assert res.status_code == 200
    assert "token" in res.json()


def test_otp_verify_wrong_code_401():
    phone = f"138{int(time.time()) % 100000000:08d}"
    client.post("/auth/otp/send", json={"phone": phone})
    res = client.post("/auth/otp/verify", json={
        "phone": phone,
        "code": "000000",
    })
    assert res.status_code == 401
