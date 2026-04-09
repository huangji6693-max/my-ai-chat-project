# 撩咖 · AI 陪聊 (Liaoka)

> 一款中文优先的 AI 陪聊 PWA。
> 4 位独立人格的 AI 角色, 流式回复, 沉浸式 Hinge 风格 UI。

## ✨ 核心特性

- **4 位独立 AI 角色** — 柳慕然 (温柔治愈) / 江策 (高冷克制) / 顾沉舟 (幽默松弛) / 苏棠 (甜系黏人)
  · 每位角色独立 system prompt + 独立 fallback, 风格完全不同
- **流式回复** (`/chat/stream`) — 边生成边显示, 打字机效果
- **多版本前端** — `/v1` `/v2` `/v3` `/v4` 可切换, v4 是 Hinge 风格 mesh 流动 + 玻璃毛玻璃
- **用户系统** — JWT 认证, 注册 / 登录 / 个人资料
- **图片上传** — 支持 JPG/PNG/WebP/GIF, 8MB 限制
- **演示模式** — 无需 API key 也能体验, 自动 fallback
- **PWA** — manifest + service worker, 可"添加到主屏幕"
- **生产级安全** — CORS 白名单 / Rate limit / 异常脱敏 / 邮箱归一化 / pbkdf2 密码

## 🛠️ 技术栈

| 层 | 技术 |
|---|---|
| 后端 | Python 3.11+ / FastAPI / SQLAlchemy / Alembic |
| AI | Anthropic Claude (Haiku 4.5 默认, env 可配) |
| 数据库 | SQLite (默认) / PostgreSQL (生产) |
| 前端 | 原生 HTML/CSS/JS PWA (无构建依赖) |
| 部署 | Docker / Railway / 任何 PaaS |

## 🚀 快速开始

### 方式 1: 直接 Python 运行 (开发)

```bash
# 1. 安装依赖
pip install -r requirements.txt

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env, 至少填 ANTHROPIC_API_KEY (没填也能用 demo 模式)

# 3. 初始化数据库 (可选, 不跑也会自动 create_all)
alembic upgrade head

# 4. 启动
uvicorn backend.main:app --reload

# 5. 浏览器打开
# http://127.0.0.1:8000        默认 (= /v4)
# http://127.0.0.1:8000/v4     最新 Hinge 风格
# http://127.0.0.1:8000/v3     前一版 (猫箱风格)
# http://127.0.0.1:8000/health 健康检查
# http://127.0.0.1:8000/docs   API 文档
```

### 方式 2: Docker (生产)

```bash
docker build -t liaoka .
docker run -p 8000:8000 \
  -e ANTHROPIC_API_KEY=sk-ant-xxx \
  -e CORS_ORIGINS=https://your-domain.com \
  -e ENVIRONMENT=production \
  liaoka
```

## 📱 PWA 安装

### 桌面 (Chrome / Edge)
1. 打开 `http://127.0.0.1:8000/v4`
2. 地址栏右侧 → 安装图标 → "安装应用"

### 手机
1. Safari/Chrome 打开 → 分享 → "添加到主屏幕"
2. standalone 模式启动 (无浏览器导航栏)

## 🔌 API

### `GET /health`
```json
{
  "status": "ok",
  "version": "0.4.0",
  "environment": "development",
  "ai_configured": true,
  "database": "chat.db",
  "now": "2026-04-09T12:34:56+00:00"
}
```

### `POST /chat` — 一次性返回完整回复

```json
// Request
{
  "message": "我今天有点难过",
  "session_id": "session-uuid",
  "persona": "liu",
  "image_url": null
}

// Response
{
  "reply": "别急, 先坐下。我会认真听你讲完。",
  "session_id": "session-uuid"
}
```

### `POST /chat/stream` — 流式返回 (推荐, 体验质变)

```js
const res = await fetch("/chat/stream", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message, session_id, persona }),
});
const reader = res.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  bubble.textContent += decoder.decode(value);
}
```

### `POST /auth/register`

```json
// Request
{ "email": "demo@a.com", "password": "test12345", "nickname": "Demo" }

// Response
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": { "id": 1, "email": "demo@a.com", "nickname": "Demo", "is_vip": false }
}
```

### `POST /auth/login`
同上格式, 返回 token + user。**邮箱大小写自动归一化** (春水圈血泪教训)。

### `GET /auth/me`
带 `Authorization: Bearer <token>` header。

### `POST /upload/image`
multipart/form-data, field 名 `file`。返回 `{"url": "/uploads/xxx.jpg"}`。

## 🎭 Persona Keys

发送 `/chat` 时可传 `persona` 字段 (向后兼容 v3):

| Key | 角色 | 风格 |
|---|---|---|
| `liu` (= 兼容 `luna`) | 柳慕然 | 温柔强势, 短句先接住情绪 |
| `jiang` (= 兼容 `zhou`) | 江策 | 高冷克制, 一两个字的肯定 |
| `gu` | 顾沉舟 | 幽默松弛, 会接梗但关键时认真 |
| `su` | 苏棠 | 甜系黏人, 主动关心 |

## 🔐 环境变量

完整列表见 [.env.example](.env.example)

| 变量 | 默认 | 说明 |
|---|---|---|
| `ANTHROPIC_API_KEY` | (空) | Claude API key, 空时走 fallback demo 模式 |
| `ANTHROPIC_MODEL` | `claude-haiku-4-5-20251001` | 默认便宜快, 可改 sonnet/opus |
| `ANTHROPIC_MAX_TOKENS` | `512` | 单次最大 token |
| `HISTORY_LIMIT` | `30` | 发给 Claude 的历史条数上限 |
| `DATABASE_URL` | `sqlite:///./chat.db` | 生产建议 PostgreSQL |
| `CORS_ORIGINS` | `localhost:8000,127.0.0.1:8000,localhost:5173` | 逗号分隔 |
| `RATE_LIMIT_CHAT` | `20/minute` | 每 IP /chat 限速 |
| `ENVIRONMENT` | `development` | `production` 时异常脱敏 |

## ✅ 测试

```bash
pytest tests/ -v
```

当前测试套件:
- `test_health.py` — health / 空消息 / fallback / persona 别名 / 静态路由 (5)
- `test_auth.py` — 注册 / 登录 / 邮箱归一化 / wrong password / me / 无 token / 无效 token (7)

## 🧱 项目结构

```
ai-chat-companion/
├── backend/
│   ├── main.py        FastAPI 入口 + 路由 + CORS + rate limit
│   ├── ai.py          Claude 调用 + 4 角色 persona + 流式 + history
│   ├── auth.py        JWT (无依赖实现) + pbkdf2 密码 + 邮箱归一化
│   ├── config.py      Settings 集中配置
│   ├── db.py          SQLAlchemy engine + session
│   ├── models.py      User + Message ORM
│   └── schemas.py     Pydantic request/response
├── frontend/
│   ├── web/           当前默认
│   ├── web-v1/        归档第一版
│   ├── web-v2/        归档第二版
│   ├── web-v3/        猫箱风格
│   └── web-v4/        Hinge 沉浸式 + mesh 流动 (推荐)
├── alembic/           数据库迁移
├── tests/             pytest
├── uploads/           图片上传 (运行时自动创建)
├── .env.example       环境变量模板
├── .gitignore
├── Dockerfile         python:3.12-slim + healthcheck
├── requirements.txt
└── README.md          (本文件)
```

## 🛡️ 安全 / 边界

- 邮箱密码用 PBKDF2-HMAC-SHA256 (200k 迭代) 哈希存储, 无明文
- JWT 30 天有效期, HMAC-SHA256 签名
- CORS 白名单, 不允许 `*`
- Rate limit 每 IP 每分钟 20 次 chat
- 异常脱敏, 生产环境不透传 stack trace
- 不提供医疗诊断 / 法律结论 / 危险指令
- 用户表达自伤倾向时主动引导至专业资源

## 📝 路线图

- [x] v4 Hinge 风格 UI
- [x] 4 角色独立 persona
- [x] 流式回复
- [x] 用户系统 + JWT
- [x] 图片上传
- [x] Alembic 迁移
- [x] GitHub Actions CI
- [x] Docker
- [ ] 手机号 OTP 登录 (前端 UI 已有)
- [ ] Apple Sign In
- [ ] 语音消息 (STT + TTS)
- [ ] 角色市场 (用户自定义角色)
- [ ] 会员配额系统
- [ ] WebSocket 多设备同步

## License

MIT
