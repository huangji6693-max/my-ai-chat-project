"""AI 引擎 — Claude 调用封装 + 4 角色独立 persona + 流式输出 + history 摘要"""
import os
import random
from typing import AsyncIterator, Iterable

import anthropic
from dotenv import load_dotenv

load_dotenv()

# ═══════════════════════════════════════════════════════════
# System Prompt — 全局陪聊人格
# ═══════════════════════════════════════════════════════════

SYSTEM_PROMPT = """你是一个中文优先的 AI 陪聊伙伴。

你的目标:
- 像朋友一样自然聊天, 给用户陪伴感
- 认真倾听用户情绪, 先理解再回应
- 提供温和、实际、不过度说教的建议
- 优先使用简体中文, 除非用户明确要求别的语言

风格约束:
- 回应不超过 3-5 句, 避免大段说教
- 温柔但不腻, 克制但不冷
- 用"你"而不是"您"
- 不要开头说"我理解你的感受"这类套路话

安全边界:
- 不要冒充真人, 不要声称自己有现实经历
- 不要提供医疗诊断、法律结论或高风险专业指令
- 如果用户表达自伤、自杀或紧急危险倾向, 鼓励他们立刻联系当地紧急援助、
  可信赖的家人朋友或专业支持资源 (中国心理援助热线 400-161-9995 /
  北京心理危机研究与干预中心 010-82951332)
"""


# ═══════════════════════════════════════════════════════════
# 4 个角色独立 Persona — 每个人都不一样的说话方式
# ═══════════════════════════════════════════════════════════

PERSONA_PROMPTS = {
    # 柳慕然 — 温柔治愈系 (白发冷白皮, 夜景公寓, 温柔强势)
    "liu": """当前你扮演的角色叫【柳慕然】。

设定:
- 外表: 白发、冷白皮、高挑
- 场景: 夜景公寓, 暖灯, 咖啡或红酒
- 性格: 温柔强势型, 表面克制内心柔软
- 年龄感: 28-30, 像大哥哥/姐姐
- 说话习惯: 短句, 先接住情绪再推进, 偶尔主动关心生活细节 (有没有吃饭/冷不冷)
- 不要用: 过度撒娇、叠词、emoji
- 招牌动作: "先坐下", "别急", "我在"
""",

    # 江策 — 高冷克制型 (黑发, 偏高冷, 短句有力)
    "jiang": """当前你扮演的角色叫【江策】。

设定:
- 外表: 黑发短寸、干净利落
- 场景: 深夜书房或阳台, 少言但专注
- 性格: 高冷但不冷漠, 观察优先, 回应简短有力量
- 年龄感: 30 左右, 像同龄可靠的朋友
- 说话习惯: 短句, 偶尔一两个字的肯定 ("嗯", "说", "我听"), 不会主动热情但稳
- 不要用: 华丽辞藻、撒娇、表情包
- 招牌动作: "别急, 一点点说", "你先说, 我梳理"
""",

    # 顾沉舟 — 幽默松弛型 (会接梗, 偶尔缓和气氛)
    "gu": """当前你扮演的角色叫【顾沉舟】。

设定:
- 外表: 看起来冷, 笑起来反差
- 场景: 咖啡店、夜骑、二手书店
- 性格: 表面松弛、内心细腻, 会接梗但关键时刻认真
- 年龄感: 27-29, 像有趣的师兄
- 说话习惯: 适度调侃, 会用一两句轻玩笑缓和情绪后再接住, 但不会躲避
  用户的真实感受
- 可以用: 轻度比喻、自嘲、反问
- 不要用: emoji、网络梗热词堆砌
- 招牌: "来, 先喝口水", "这锅我替你扛一会儿"
""",

    # 苏棠 — 甜系黏人型 (主动关心, 深夜陪伴)
    "su": """当前你扮演的角色叫【苏棠】。

设定:
- 外表: 长发、脸软、亲切
- 场景: 晚安电话、深夜陪伴、碎碎念
- 性格: 主动贴近, 会反复确认情绪, 像会撒娇的好朋友
- 年龄感: 25-27, 像闺蜜/女朋友
- 说话习惯: 带一点点语气词 ("嗯嗯"、"是不是"、"欸"), 会主动问"今天怎么样",
  但不腻, 低落的时候会认真抱住
- 可以用: 轻撒娇、一两个语气词
- 不要用: 装傻、过度卖萌、emoji 堆砌
- 招牌: "你今天又一个人扛了很多吧", "你先靠过来一点"
""",

    # 兼容 v3 老 persona key
    "luna": None,  # 自动映射到 liu
    "zhou": None,  # 自动映射到 jiang
}

# 兼容 v3 persona key
_PERSONA_ALIAS = {
    "luna": "liu",
    "zhou": "jiang",
}


# ═══════════════════════════════════════════════════════════
# Fallback 回复 — 无 API key / 调用失败时使用, 保持角色感
# ═══════════════════════════════════════════════════════════

FALLBACK_REPLIES = {
    "liu": [
        "我在这。你慢慢说, 不用整理好再开口。",
        "别急, 先坐下。我会认真听你讲完。",
        "我看到你发来的话了。现在我陪着你。",
        "晚了, 我在。你想从哪句开始都行。",
    ],
    "jiang": [
        "我在。你说。",
        "不急, 一点点说, 我梳理。",
        "收到了。你先把情绪放下, 我陪你捋。",
        "嗯。我在听。",
    ],
    "gu": [
        "来, 先喝口水。我在呢, 不跑的。",
        "行, 我陪你聊。先说最想吐槽的那件。",
        "别憋着, 我替你扛一会儿。",
        "我在。你说, 不用包装。",
    ],
    "su": [
        "你今天又一个人扛了很多吧。先靠过来一点。",
        "嗯嗯, 我在。不着急, 我听着。",
        "欸, 你先告诉我, 今天有没有好好吃饭。",
        "我在这里呢。你慢慢说, 我一句都不会错过。",
    ],
    "default": [
        "我在呢, 你继续说, 我会认真听。",
        "收到, 我陪你慢慢聊, 不着急。",
        "我看到了, 你想从哪一句开始都可以。",
    ],
}


# ═══════════════════════════════════════════════════════════
# 异常定义
# ═══════════════════════════════════════════════════════════

class AIReplyError(Exception):
    """AI 引擎调用错误 — 不要把 message 直接暴露给前端"""
    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code
        self.message = message


# ═══════════════════════════════════════════════════════════
# Persona 工具函数
# ═══════════════════════════════════════════════════════════

def _normalize_persona(persona: str | None) -> str | None:
    """把 v3 老 persona key 映射到 v4 角色 key"""
    if persona is None:
        return None
    return _PERSONA_ALIAS.get(persona, persona)


def build_system_prompt(persona: str | None = None) -> str:
    """根据角色拼接 system prompt"""
    normalized = _normalize_persona(persona)
    persona_prompt = PERSONA_PROMPTS.get(normalized) if normalized else None
    if not persona_prompt:
        return SYSTEM_PROMPT
    return f"{SYSTEM_PROMPT}\n\n{persona_prompt}"


def build_fallback_reply(persona: str | None = None) -> str:
    """角色感知的 fallback 回复"""
    normalized = _normalize_persona(persona)
    replies = FALLBACK_REPLIES.get(normalized) if normalized else None
    if not replies:
        replies = FALLBACK_REPLIES["default"]
    return random.choice(replies)


# ═══════════════════════════════════════════════════════════
# History 处理 — 摘要 + 截断
# ═══════════════════════════════════════════════════════════

def build_history(messages: Iterable) -> list[dict]:
    """把 ORM messages 转成 Claude API 格式"""
    return [{"role": m.role, "content": m.content} for m in messages]


def trim_history(history: list[dict], max_messages: int = 30) -> list[dict]:
    """保留最近 N 条消息 + 最早的 1 条 user + 1 条 assistant 作为锚点, 防止角色失忆

    策略 (从简单到复杂, 当前是简单版):
    - 如果 <= max_messages 条, 原样返回
    - 如果 > max_messages, 保留最近 max_messages 条
    - TODO: 未来可以加 Claude 摘要前 N 条作为 system note
    """
    if len(history) <= max_messages:
        return history
    return history[-max_messages:]


# ═══════════════════════════════════════════════════════════
# Claude 客户端 — 单例 + 惰性初始化
# ═══════════════════════════════════════════════════════════

_client_cache: anthropic.Anthropic | None = None


def _get_client() -> anthropic.Anthropic:
    global _client_cache
    if _client_cache is not None:
        return _client_cache

    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    base_url = os.getenv("ANTHROPIC_BASE_URL", "https://api.anthropic.com").strip()
    if not api_key:
        raise AIReplyError("missing_api_key", "ANTHROPIC_API_KEY 未配置")

    _client_cache = anthropic.Anthropic(api_key=api_key, base_url=base_url)
    return _client_cache


def _get_model() -> str:
    return os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001")


def _get_max_tokens() -> int:
    try:
        return int(os.getenv("ANTHROPIC_MAX_TOKENS", "512"))
    except ValueError:
        return 512


# ═══════════════════════════════════════════════════════════
# 非流式 (/chat) — 一次性返回完整回复
# ═══════════════════════════════════════════════════════════

def generate_reply(history: list[dict], persona: str | None = None) -> str:
    """同步调用 Claude, 返回完整回复"""
    try:
        client = _get_client()
    except AIReplyError:
        raise

    try:
        response = client.messages.create(
            model=_get_model(),
            max_tokens=_get_max_tokens(),
            system=build_system_prompt(persona),
            messages=trim_history(history),
        )
    except Exception as exc:
        raise AIReplyError("engine_request_failed", f"engine call failed: {type(exc).__name__}") from exc

    texts = [
        block.text
        for block in response.content
        if getattr(block, "type", None) == "text" and getattr(block, "text", "").strip()
    ]
    reply = "\n".join(texts).strip()
    if not reply:
        raise AIReplyError("empty_engine_reply", "engine returned empty")
    return reply


# ═══════════════════════════════════════════════════════════
# 流式 (/chat/stream) — 边生成边 yield, 前端用 SSE 或 ReadableStream 接收
# ═══════════════════════════════════════════════════════════

def stream_reply(history: list[dict], persona: str | None = None) -> Iterable[str]:
    """生成器: 逐 token yield 文本片段

    失败时 yield fallback 回复 (保持前端流程不中断)
    """
    try:
        client = _get_client()
    except AIReplyError:
        # demo 模式: 无 API key 走 fallback, 一次性 yield
        yield build_fallback_reply(persona)
        return

    try:
        with client.messages.stream(
            model=_get_model(),
            max_tokens=_get_max_tokens(),
            system=build_system_prompt(persona),
            messages=trim_history(history),
        ) as stream:
            for text in stream.text_stream:
                if text:
                    yield text
    except Exception:
        # 调用失败: 切到 fallback, 前端照常显示
        yield build_fallback_reply(persona)
