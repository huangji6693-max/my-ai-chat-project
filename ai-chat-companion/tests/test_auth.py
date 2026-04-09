"""Auth + 用户系统测试"""
import os

os.environ["DATABASE_URL"] = "sqlite:///./test_auth.db"
os.environ["ENVIRONMENT"] = "test"
os.environ.pop("ANTHROPIC_API_KEY", None)

import time

from fastapi.testclient import TestClient

from backend import config as _config
_config.get_settings.cache_clear()
_config.settings = _config.get_settings()

from backend.main import app

client = TestClient(app)


def _unique_email():
    return f"test_{int(time.time() * 1000)}@demo.com"


def test_register_returns_token_and_user():
    res = client.post("/auth/register", json={
        "email": _unique_email(),
        "password": "test12345",
        "nickname": "测试用户",
    })
    assert res.status_code == 200, res.text
    body = res.json()
    assert "token" in body and len(body["token"]) > 20
    assert body["user"]["nickname"] == "测试用户"
    assert body["user"]["is_vip"] is False


def test_register_normalizes_email():
    """春水圈血泪教训: 大小写 + 空格归一化"""
    email = _unique_email()
    client.post("/auth/register", json={"email": email.upper(), "password": "test12345"})

    # 同邮箱小写 → 应该 409
    res = client.post("/auth/register", json={"email": email.lower(), "password": "test12345"})
    assert res.status_code == 409


def test_login_with_uppercase_email():
    email = _unique_email()
    client.post("/auth/register", json={"email": email, "password": "test12345"})

    res = client.post("/auth/login", json={"email": email.upper(), "password": "test12345"})
    assert res.status_code == 200
    assert res.json()["user"]["email"] == email.lower()


def test_login_wrong_password():
    email = _unique_email()
    client.post("/auth/register", json={"email": email, "password": "test12345"})

    res = client.post("/auth/login", json={"email": email, "password": "wrongpass"})
    assert res.status_code == 401


def test_me_with_token():
    email = _unique_email()
    token = client.post("/auth/register", json={"email": email, "password": "test12345"}).json()["token"]

    res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["email"] == email.lower()


def test_me_without_token_401():
    res = client.get("/auth/me")
    assert res.status_code == 401


def test_me_with_invalid_token_401():
    res = client.get("/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
    assert res.status_code == 401
