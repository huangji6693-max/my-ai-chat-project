# AI Chat Companion

一个中文优先的 AI 陪聊 PWA。

用户通过浏览器打开页面即可与 AI 聊天，支持"添加到主屏幕"安装为 App，聊天记录保存到 SQLite。

## 技术栈

- Python / FastAPI — 后端 API 与静态资源托管
- 原生 HTML + CSS + JavaScript — PWA 前端
- Anthropic Python SDK — Claude API 集成
- SQLAlchemy + SQLite — 消息持久化

## 项目结构

```text
backend/
  ai.py          Claude API 调用封装
  db.py          数据库连接与初始化
  main.py        FastAPI 入口与路由
  models.py      消息数据模型
  schemas.py     请求/响应模型
frontend/
  web/
    index.html         PWA 主页面
    styles.css         全局样式
    app.js             前端交互逻辑
    manifest.webmanifest  PWA 清单
    service-worker.js  离线缓存
    icons/             应用图标
  app.py         Streamlit 调试原型（仅内部使用）
requirements.txt
.env.example
```

## 环境要求

- Python 3.10+
- 一个可用的 `ANTHROPIC_API_KEY`

## 安装依赖

```bash
pip install -r requirements.txt
```

## 配置环境变量

```bash
cp .env.example .env
```

然后编辑 `.env`，填入真实密钥（**不要把密钥提交到 Git**）：

```env
ANTHROPIC_API_KEY=your_api_key_here
ANTHROPIC_MODEL=claude-opus-4-6
DATABASE_URL=sqlite:///./chat.db
```

## 启动（只需一条命令）

```bash
uvicorn backend.main:app --reload
```

启动后打开浏览器访问：

```
http://127.0.0.1:8000
```

即可看到 PWA 聊天页面。

- 健康检查：`http://127.0.0.1:8000/health`
- API 文档：`http://127.0.0.1:8000/docs`

## PWA 安装方式

### 电脑端（Chrome）

1. 打开 `http://127.0.0.1:8000`
2. 点击地址栏右侧的安装图标，或浏览器菜单 → "安装应用"

### 手机端

1. Safari / Chrome 打开页面
2. 分享 → 添加到主屏幕
3. 生成桌面图标，以 standalone 模式打开（无浏览器导航栏）

## API 接口

### `GET /health`

返回服务状态。

### `POST /chat`

请求体：

```json
{
  "message": "我今天有点难过",
  "session_id": "demo-session"
}
```

响应体：

```json
{
  "reply": "我在这里，愿意听你说说发生了什么。",
  "session_id": "demo-session"
}
```

## 当前限制

- 普通请求/响应，不是流式回复
- 无用户登录系统
- 离线时界面可打开，但 AI 回复依赖网络
- 建议型内容仅供陪伴，不替代专业医疗或法律支持
