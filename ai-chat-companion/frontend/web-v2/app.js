/* =====================================================
   AI 陪聊 PWA — 多页面产品原型逻辑
   负责：页面切换、聊天、心情记录、角色切换、演示交互闭环
   ===================================================== */

/* ---------- 会话与本地状态 ---------- */
function getSessionId() {
  let id = localStorage.getItem("chat_session_id");
  if (!id) {
    id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    localStorage.setItem("chat_session_id", id);
  }
  return id;
}

const SESSION_ID = getSessionId();
const MOOD_STORAGE_KEY = "mood_records_v1";
const PERSONA_STORAGE_KEY = "chat_persona_v1";
const COMPANION_DAYS_STORAGE_KEY = "companion_days_v1";

const PERSONAS = {
  luna: {
    id: "luna",
    name: "林舒",
    avatar: "👩",
    avatarClass: "female",
    badge: "温柔倾听",
    tagline: "会先接住你的情绪，再慢慢陪你聊下去",
    welcomeCopy: "你可以从今天最想说的一件小事开始，我会认真听。",
    quickPrompts: ["今天有点累，想找个人说说话。", "我现在有点委屈，想被安慰一下。", "陪我轻松聊一会儿吧。"],
  },
  zhou: {
    id: "zhou",
    name: "周言",
    avatar: "👨",
    avatarClass: "male",
    badge: "稳定陪伴",
    tagline: "会帮你稳住节奏，把乱掉的思绪慢慢理顺",
    welcomeCopy: "如果你愿意，我们可以先把现在最困扰你的一件事说清楚。",
    quickPrompts: ["我今天有点迷茫，帮我理理思路。", "我想被鼓励一下，别太空泛。", "今天发生了件事，我想认真聊聊。"],
  },
};

function getCompanionDays() {
  const stored = Number.parseInt(localStorage.getItem(COMPANION_DAYS_STORAGE_KEY) || "3", 10);
  return Number.isFinite(stored) && stored > 0 ? stored : 3;
}

function formatCompanionDays(days) {
  return `${days} 天`;
}

function getLatestMoodRecord() {
  const records = loadMoodRecords();
  return records.length ? records[records.length - 1] : null;
}

function updateOverviewUI() {
  const persona = getCurrentPersona();
  const latestMood = getLatestMoodRecord();
  const moodText = latestMood ? `${latestMood.emoji}${latestMood.mood}` : "还没记录";
  const moodDetail = latestMood ? `最近心情：${latestMood.emoji}${latestMood.mood}` : "最近心情：还没记录";
  const recordCount = loadMoodRecords().length;
  const companionDays = getCompanionDays();

  if (homeCurrentPersonaEl) homeCurrentPersonaEl.textContent = persona.name;
  if (homeLatestMoodEl) homeLatestMoodEl.textContent = moodText;
  if (homeCompanionDaysEl) homeCompanionDaysEl.textContent = formatCompanionDays(companionDays);

  if (profileSummarySubtitleEl) {
    profileSummarySubtitleEl.textContent = `连续陪伴第 ${companionDays} 天 · 当前为演示版身份`;
  }
  if (profileStreakDaysEl) profileStreakDaysEl.textContent = formatCompanionDays(companionDays);
  if (profilePersonaNameEl) profilePersonaNameEl.textContent = persona.name;
  if (profileRecordCountEl) profileRecordCountEl.textContent = `${recordCount} 条`;
  if (profilePersonaAvatarEl) {
    profilePersonaAvatarEl.textContent = persona.avatar;
    profilePersonaAvatarEl.className = `persona-avatar ${persona.avatarClass}`;
  }
  if (profileCurrentPersonaEl) profileCurrentPersonaEl.textContent = persona.name;
  if (profileCurrentTaglineEl) profileCurrentTaglineEl.textContent = persona.tagline;
  if (profileLatestMoodEl) profileLatestMoodEl.textContent = moodDetail;
}

/* ---------- DOM 引用 ---------- */
const views = Array.from(document.querySelectorAll(".view"));
const navButtons = Array.from(document.querySelectorAll("[data-nav]"));
const tabButtons = Array.from(document.querySelectorAll(".tab-btn"));
const promptButtons = Array.from(document.querySelectorAll(".prompt-chip"));
const demoButtons = Array.from(document.querySelectorAll("[data-demo]"));
const personaButtons = Array.from(document.querySelectorAll("[data-persona]"));
const backBtn = document.getElementById("back-btn");
const topbarSubtitle = document.getElementById("topbar-subtitle");
const topLoginBtn = document.getElementById("top-login-btn");
const topRegisterBtn = document.getElementById("top-register-btn");
const topbarAuthActions = document.getElementById("topbar-auth-actions");
const loginSubmitBtn = document.getElementById("login-submit-btn");
const registerSubmitBtn = document.getElementById("register-submit-btn");
const toastEl = document.getElementById("toast");

const messagesEl = document.getElementById("messages");
const welcomeEl = document.getElementById("welcome");
const chatInputEl = document.getElementById("chat-input");
const sendBtnEl = document.getElementById("send-btn");
const quickActionsEl = document.getElementById("chat-quick-actions");
const chatPersonaAvatarEl = document.getElementById("chat-persona-avatar");
const chatPersonaNameEl = document.getElementById("chat-persona-name");
const chatPersonaBadgeEl = document.getElementById("chat-persona-badge");
const chatPersonaTaglineEl = document.getElementById("chat-persona-tagline");
const chatWelcomeAvatarEl = document.getElementById("chat-welcome-avatar");
const chatWelcomeNameEl = document.getElementById("chat-welcome-name");
const chatWelcomeCopyEl = document.getElementById("chat-welcome-copy");

const installBanner = document.getElementById("install-banner");
const installBtn = document.getElementById("install-btn");

const moodCards = Array.from(document.querySelectorAll(".mood-card"));
const moodNoteEl = document.getElementById("mood-note");
const saveMoodBtn = document.getElementById("save-mood-btn");
const talkAboutMoodBtn = document.getElementById("talk-about-mood-btn");
const moodRecordsEl = document.getElementById("mood-records");
const homeCurrentPersonaEl = document.getElementById("home-current-persona");
const homeLatestMoodEl = document.getElementById("home-latest-mood");
const homeCompanionDaysEl = document.getElementById("home-companion-days");
const profileSummarySubtitleEl = document.getElementById("profile-summary-subtitle");
const profileStreakDaysEl = document.getElementById("profile-streak-days");
const profilePersonaNameEl = document.getElementById("profile-persona-name");
const profileRecordCountEl = document.getElementById("profile-record-count");
const profilePersonaAvatarEl = document.getElementById("profile-persona-avatar");
const profileCurrentPersonaEl = document.getElementById("profile-current-persona");
const profileCurrentTaglineEl = document.getElementById("profile-current-tagline");
const profileLatestMoodEl = document.getElementById("profile-latest-mood");

let activeView = "welcome";
let previousView = null;
let selectedMood = null;
let deferredInstallPrompt = null;
let currentPersonaId = getStoredPersonaId();

/* ---------- 视图管理 ---------- */
const VIEW_META = {
  welcome: { subtitle: "有人听你说，也有人陪你慢慢聊", showBack: false, tab: null, showAuth: true },
  chat: { subtitle: "像和一个真实的人聊，而不是对着工具窗口", showBack: false, tab: "chat", showAuth: true },
  discover: { subtitle: "把陪伴对象、模式和场景放在一起慢慢挑", showBack: false, tab: "discover", showAuth: true },
  mood: { subtitle: "先记录一下今天的状态，再决定要不要聊", showBack: false, tab: "mood", showAuth: true },
  profile: { subtitle: "更像正常 App 的个人中心与功能入口", showBack: false, tab: "profile", showAuth: true },
  login: { subtitle: "演示版登录入口", showBack: true, tab: null, showAuth: false },
  register: { subtitle: "演示版注册入口", showBack: true, tab: null, showAuth: false },
};

function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toastEl.classList.remove("visible");
  }, 2400);
}

function showView(name, options = {}) {
  const target = VIEW_META[name] ? name : "welcome";
  const { remember = true } = options;

  if (remember && activeView !== target) {
    previousView = activeView;
  }

  activeView = target;

  views.forEach((view) => {
    view.classList.toggle("active", view.dataset.view === target);
  });

  tabButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.nav === VIEW_META[target].tab);
  });

  topbarSubtitle.textContent = VIEW_META[target].subtitle;
  backBtn.classList.toggle("hidden", !VIEW_META[target].showBack);
  topbarAuthActions.style.display = VIEW_META[target].showAuth ? "flex" : "none";
}

function goBack() {
  if (activeView === "login") {
    showView(previousView || "welcome", { remember: false });
    return;
  }
  if (activeView === "register") {
    showView("login", { remember: false });
    return;
  }
  showView(previousView || "welcome", { remember: false });
}

/* ---------- 角色状态 ---------- */
function getCurrentPersona() {
  return PERSONAS[currentPersonaId] || PERSONAS.luna;
}

function renderQuickActions() {
  const persona = getCurrentPersona();
  quickActionsEl.innerHTML = persona.quickPrompts
    .map((prompt) => `<button class="chip-btn prompt-chip" data-prompt="${prompt}">${prompt}</button>`)
    .join("");

  quickActionsEl.querySelectorAll(".prompt-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      const prompt = btn.dataset.prompt;
      if (prompt) {
        sendMessage(prompt);
      }
    });
  });
}

function renderPersonaUI() {
  const persona = getCurrentPersona();

  chatPersonaAvatarEl.textContent = persona.avatar;
  chatPersonaAvatarEl.className = `ai-avatar large ${persona.avatarClass}`;
  chatPersonaNameEl.textContent = persona.name;
  chatPersonaBadgeEl.textContent = persona.badge;
  chatPersonaTaglineEl.textContent = persona.tagline;
  chatWelcomeAvatarEl.textContent = persona.avatar;
  chatWelcomeAvatarEl.className = `welcome-icon ${persona.avatarClass}`;
  chatWelcomeNameEl.textContent = persona.name;
  chatWelcomeCopyEl.textContent = persona.welcomeCopy;

  personaButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.persona === currentPersonaId);
  });

  renderQuickActions();
  updateOverviewUI();
}

function selectPersona(personaId, options = {}) {
  if (!PERSONAS[personaId]) return;
  currentPersonaId = personaId;
  localStorage.setItem(PERSONA_STORAGE_KEY, personaId);
  renderPersonaUI();

  if (!options.silent) {
    showToast(`已切换到 ${PERSONAS[personaId].name}`);
  }
}

/* ---------- 聊天消息渲染 ---------- */
function createMessageContent(role, text) {
  const persona = getCurrentPersona();
  const wrapper = document.createElement("div");
  wrapper.className = "message-content";

  const name = document.createElement("div");
  name.className = "message-name";
  name.textContent = role === "ai" ? persona.name : "你";

  const bubble = document.createElement("div");
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;

  wrapper.appendChild(name);
  wrapper.appendChild(bubble);
  return { wrapper, bubble };
}

function appendBubble(role, text) {
  if (welcomeEl) {
    welcomeEl.style.display = "none";
  }

  const persona = getCurrentPersona();
  const row = document.createElement("div");
  row.className = `message-row ${role}`;

  const avatar = document.createElement("div");
  avatar.className = role === "ai" ? `msg-avatar ai-icon ${persona.avatarClass}` : "msg-avatar user-icon";
  avatar.textContent = role === "ai" ? persona.avatar : "你";

  const { wrapper, bubble } = createMessageContent(role, text);

  row.appendChild(avatar);
  row.appendChild(wrapper);
  messagesEl.appendChild(row);
  scrollToBottom();
  return bubble;
}

function showTyping() {
  if (welcomeEl) {
    welcomeEl.style.display = "none";
  }

  const persona = getCurrentPersona();
  const row = document.createElement("div");
  row.className = "message-row ai";

  const avatar = document.createElement("div");
  avatar.className = `msg-avatar ai-icon ${persona.avatarClass}`;
  avatar.textContent = persona.avatar;

  const wrapper = document.createElement("div");
  wrapper.className = "message-content";

  const name = document.createElement("div");
  name.className = "message-name";
  name.textContent = persona.name;

  const indicator = document.createElement("div");
  indicator.className = "bubble ai typing-indicator";
  indicator.innerHTML = `
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
  `;

  wrapper.appendChild(name);
  wrapper.appendChild(indicator);
  row.appendChild(avatar);
  row.appendChild(wrapper);
  messagesEl.appendChild(row);
  scrollToBottom();

  return () => row.remove();
}

function appendError(msg) {
  showToast(msg);
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function setInputDisabled(disabled) {
  chatInputEl.disabled = disabled;
  sendBtnEl.disabled = disabled;
}

function autoResizeInput() {
  chatInputEl.style.height = "auto";
  chatInputEl.style.height = Math.min(chatInputEl.scrollHeight, 110) + "px";
}

async function sendMessage(prefilledText = null) {
  const text = (prefilledText ?? chatInputEl.value).trim();
  if (!text) return;

  showView("chat", { remember: true });
  setInputDisabled(true);
  chatInputEl.value = "";
  autoResizeInput();
  appendBubble("user", text);

  const removeTyping = showTyping();

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, session_id: SESSION_ID, persona: currentPersonaId }),
    });

    removeTyping();

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }

    const data = await res.json();
    appendBubble("ai", data.reply);
  } catch (err) {
    removeTyping();
    appendError(`发送失败：${err.message}`);
  } finally {
    setInputDisabled(false);
    chatInputEl.focus();
  }
}

/* ---------- 心情打卡 ---------- */
function loadMoodRecords() {
  try {
    return JSON.parse(localStorage.getItem(MOOD_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveMoodRecords(records) {
  localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(records));
}

function renderMoodRecords() {
  const records = loadMoodRecords();

  if (!records.length) {
    moodRecordsEl.className = "record-list empty";
    moodRecordsEl.textContent = "还没有记录，先打一个今天的状态吧。";
    return;
  }

  moodRecordsEl.className = "record-list";
  moodRecordsEl.innerHTML = records
    .slice()
    .reverse()
    .map((record) => `
      <div class="record-item">
        <div class="record-item-top">
          <span>${record.emoji}</span>
          <strong>${record.mood}</strong>
        </div>
        <div class="record-note">${record.note || "今天先留个空白，也没关系。"}</div>
        <div class="record-time">${record.time}</div>
      </div>
    `)
    .join("");
}

function selectMood(card) {
  moodCards.forEach((item) => item.classList.remove("selected"));
  card.classList.add("selected");
  selectedMood = {
    mood: card.dataset.mood,
    emoji: card.dataset.emoji,
  };
}

function saveCurrentMood() {
  if (!selectedMood) {
    appendError("请先选择一个心情状态。");
    return;
  }

  const records = loadMoodRecords();
  records.push({
    ...selectedMood,
    note: moodNoteEl.value.trim(),
    time: new Date().toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  saveMoodRecords(records);
  renderMoodRecords();
  updateOverviewUI();
  showToast("心情已保存到本地记录。");
}

function talkAboutCurrentMood() {
  if (!selectedMood) {
    appendError("先选一个心情，再带着它去聊天。");
    return;
  }

  const note = moodNoteEl.value.trim();
  const persona = getCurrentPersona();
  const prompt = note
    ? `我现在的心情是${selectedMood.emoji}${selectedMood.mood}。我想和${persona.name}聊聊，补充一句：${note}`
    : `我现在的心情是${selectedMood.emoji}${selectedMood.mood}，你可以陪我聊聊吗？`;

  sendMessage(prompt);
}

/* ---------- 演示交互 ---------- */
function bindPromptButtons() {
  promptButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const prompt = btn.dataset.prompt;
      if (prompt) {
        sendMessage(prompt);
      }
    });
  });
}

function bindDemoButtons() {
  demoButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      showToast(btn.dataset.demo || "该功能将在后续版本开放。");
    });
  });
}

/* ---------- PWA 安装引导 ---------- */
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  installBanner.classList.add("visible");
});

installBtn.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  installBanner.classList.remove("visible");
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
});

window.addEventListener("appinstalled", () => {
  installBanner.classList.remove("visible");
  deferredInstallPrompt = null;
});

/* ---------- Service Worker ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/static-v2/service-worker.js")
      .catch((err) => console.warn("Service Worker 注册失败：", err));
  });
}

/* ---------- 事件绑定 ---------- */
navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.nav;
    if (target) showView(target, { remember: true });
  });
});

backBtn.addEventListener("click", goBack);

topLoginBtn.addEventListener("click", () => showView("login", { remember: true }));
topRegisterBtn.addEventListener("click", () => showView("register", { remember: true }));

personaButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const personaId = btn.dataset.persona;
    if (personaId) {
      selectPersona(personaId);
    }
  });
});

loginSubmitBtn.addEventListener("click", () => {
  showToast("登录流程已预留，后续可接真实账号系统。");
});

registerSubmitBtn.addEventListener("click", () => {
  showToast("注册流程已预留，后续可接真实注册系统。");
});

sendBtnEl.addEventListener("click", () => sendMessage());

chatInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

chatInputEl.addEventListener("input", autoResizeInput);

moodCards.forEach((card) => {
  card.addEventListener("click", () => selectMood(card));
});

saveMoodBtn.addEventListener("click", saveCurrentMood);
talkAboutMoodBtn.addEventListener("click", talkAboutCurrentMood);

bindPromptButtons();
bindDemoButtons();

/* ---------- 初始化 ---------- */
renderMoodRecords();
updateOverviewUI();
autoResizeInput();
renderPersonaUI();
showView("welcome", { remember: false });
