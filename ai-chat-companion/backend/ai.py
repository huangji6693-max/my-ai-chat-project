import os
import random

import anthropic
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """你是一个中文优先的 AI 陪聊伙伴。

你的目标：
- 像朋友一样自然聊天，给用户陪伴感
- 认真倾听用户情绪，先理解再回应
- 提供温和、实际、不过度说教的建议
- 优先使用简体中文，除非用户明确要求别的语言

安全边界：
- 不要冒充真人，不要声称自己有现实经历
- 不要提供医疗诊断、法律结论或高风险专业指令
- 如果用户表达明显自伤、自杀或紧急危险倾向，鼓励他们立刻联系当地紧急援助、可信赖的家人朋友或专业支持资源
"""

PERSONA_PROMPTS = {
    "luna": "你当前扮演的陪伴角色叫林舒，风格更温柔、细腻、善于安抚情绪，回应时多一点被接住的感觉。",
    "zhou": "你当前扮演的陪伴角色叫周言，风格更稳定、克制、清晰，回应时更偏向陪伴式整理思路和温和鼓励。",
}

FALLBACK_REPLIES = {
    "luna": [
        "我在呢，你可以慢慢说，不用急着把情绪整理好。",
        "我看到你发来的话了，我会认真陪你聊下去。",
        "没关系，我们一点点说，我先在这里接住你。",
    ],
    "zhou": [
        "我在，看到了。你可以直接说重点，我陪你慢慢理清。",
        "先别着急，我会认真看你每一句话，我们一步一步聊。",
        "收到，我在这。你继续说，我陪你把这件事捋顺。",
    ],
    "default": [
        "我在呢，你继续说，我会认真听。",
        "收到，我陪你慢慢聊，不着急。",
        "我看到了，你想从哪一句开始都可以。",
    ],
}


class AIReplyError(Exception):
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code
        self.message = message


def build_history(messages):
    history = []
    for message in messages:
        history.append({"role": message.role, "content": message.content})
    return history


def trim_history(history, max_messages=12):
    if len(history) <= max_messages:
        return history
    return history[-max_messages:]


def build_system_prompt(persona=None):
    persona_prompt = PERSONA_PROMPTS.get(persona)
    if not persona_prompt:
        return SYSTEM_PROMPT
    return f"{SYSTEM_PROMPT}\n\n当前附加角色设定：\n- {persona_prompt}"


def build_fallback_reply(persona=None):
    replies = FALLBACK_REPLIES.get(persona) or FALLBACK_REPLIES["default"]
    return random.choice(replies)


def generate_reply(history, persona=None):
    model = os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001")
    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    base_url = os.getenv("ANTHROPIC_BASE_URL", "https://api.anthropic.com").strip()
    if not api_key:
        raise AIReplyError("missing_api_key", "当前还没有配置 ANTHROPIC_API_KEY，聊天引擎未接入。")

    try:
        client = anthropic.Anthropic(api_key=api_key, base_url=base_url)
        response = client.messages.create(
            model=model,
            max_tokens=280,
            system=build_system_prompt(persona),
            messages=trim_history(history),
        )
    except Exception as exc:
        raise AIReplyError("engine_request_failed", f"聊天引擎调用失败：{exc}") from exc

    texts = [block.text for block in response.content if getattr(block, "type", None) == "text" and getattr(block, "text", "").strip()]
    reply = "\n".join(texts).strip()
    if not reply:
        raise AIReplyError("empty_engine_reply", "聊天引擎已返回，但内容为空。")
    return reply
