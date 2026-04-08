import os
import uuid

import requests
import streamlit as st
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")

st.set_page_config(page_title="AI 陪聊", layout="centered")
st.title("AI 陪聊")
st.caption("中文优先的陪伴式聊天 MVP")

if "session_id" not in st.session_state:
    st.session_state.session_id = str(uuid.uuid4())

if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

prompt = st.chat_input("想聊点什么？")

if prompt:
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        with st.spinner("AI 正在回复..."):
            try:
                response = requests.post(
                    f"{BACKEND_URL}/chat",
                    json={
                        "message": prompt,
                        "session_id": st.session_state.session_id,
                    },
                    timeout=60,
                )
                response.raise_for_status()
                reply = response.json()["reply"]
            except requests.RequestException as exc:
                reply = f"请求失败：{exc}"

            st.markdown(reply)
            st.session_state.messages.append({"role": "assistant", "content": reply})
