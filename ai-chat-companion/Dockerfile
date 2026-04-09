# 撩咖 — FastAPI + 静态前端
# 一键构建: docker build -t liaoka .
# 一键运行: docker run -p 8000:8000 -e ANTHROPIC_API_KEY=xxx liaoka

FROM python:3.12-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# 系统依赖 (psycopg2 编译用, sqlite 不需要)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 先 copy requirements 利用 layer cache
COPY requirements.txt .
RUN pip install -r requirements.txt

# 拷贝应用
COPY backend ./backend
COPY frontend ./frontend

# 默认 SQLite, 启动 uvicorn
ENV DATABASE_URL=sqlite:///./chat.db \
    ENVIRONMENT=production \
    ANTHROPIC_MODEL=claude-haiku-4-5-20251001

EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health').read()" || exit 1

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
