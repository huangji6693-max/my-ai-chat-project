# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Install dependencies

```bash
pip install -r requirements.txt
```

### Run backend

```bash
uvicorn backend.main:app --reload
```

### Run current frontend prototype

```bash
streamlit run frontend/app.py
```

### Quick verification

- Health check: `http://127.0.0.1:8000/health`
- FastAPI docs: `http://127.0.0.1:8000/docs`

### Current test status

There is no automated test suite yet.

A lightweight syntax check that has already been useful:

```bash
python3 -m compileall backend frontend
```

## Architecture

This project is a Chinese-first AI companion chat app.

Current runtime structure:

- `backend/main.py` — FastAPI entrypoint, CORS setup, `/health`, `/chat`
- `backend/ai.py` — Claude API integration and companion-style system prompt
- `backend/db.py` — SQLAlchemy engine, session factory, DB dependency
- `backend/models.py` — `messages` table schema
- `backend/schemas.py` — request/response models for chat API
- `frontend/app.py` — current Streamlit chat prototype

Data flow:

1. Frontend sends `message` + `session_id` to `POST /chat`
2. Backend loads prior messages for that session from SQLite
3. Backend appends the new user message
4. `backend/ai.py` calls Claude to generate a reply
5. Backend stores the assistant reply and returns it to the frontend

Storage:

- SQLite is the current persistence layer
- Default database path comes from `DATABASE_URL`, falling back to `sqlite:///./chat.db`
- Chat history is stored in the `messages` table keyed by `session_id`

## Collaboration rules for this repository

- 交流与文案默认使用中文。
- 所有代码注释如需添加，使用中文注释。
- 陪聊产品的语气要温暖、积极、克制，先倾听再回应。
- 避免敏感、高风险或不当引导的话题内容；不要给出医疗诊断、法律结论或危险指令。
- API 密钥必须放在 `.env` 中或其他安全环境变量来源中，绝不要把真实密钥写进代码、文档或提交记录。
- 当前项目以“最小可运行 MVP → 持续迭代”推进；不要过早引入不必要的复杂抽象。
- 项目形态可调整：当前是 Web/PWA 方向，但后续也可能切换为命令行版、Gradio 网页或机器人渠道，因此尽量保持后端能力与前端形态解耦。

## Current product direction

The repository currently has a working FastAPI + Streamlit MVP.

The next iteration is migrating the frontend toward a real PWA-style web app while keeping the FastAPI backend and SQLite persistence layer.
