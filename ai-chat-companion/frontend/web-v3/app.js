const SESSION_KEY = "chat_session_id_v3";
const LOGIN_STATE_KEY = "v3_demo_login";
const AGREEMENT_KEY = "v3_demo_agreement";
const CHARACTER_KEY = "v3_character_state";
const FAVORITES_KEY = "v3_favorites";
const SAVED_CHARACTER_DRAFT_KEY = "v3_saved_character_draft";
const SELECTED_PLAN_KEY = "v3_selected_plan";

const CHARACTERS = {
  liu: {
    id: "liu",
    name: "柳慕然",
    style: "温柔 · 治愈",
    tagline: "陪伴中",
    description: "白发、冷白皮、夜景公寓氛围，设定偏温柔强势，会认真接住情绪，也会主动推进对话。",
    preview: "晚上风有点大，你回来的时候记得慢一点。我在这，先听你说今天发生了什么。",
    persona: "luna",
    plays: "558.9万",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=LiuMuran&hair=long17&eyes=variant12&skinColor=f2d3b1",
    cover: "linear-gradient(180deg, rgba(72, 82, 128, 0.22), rgba(8, 10, 16, 0.72)), radial-gradient(circle at top, rgba(255,255,255,0.22), transparent 36%)",
  },
  jiang: {
    id: "jiang",
    name: "江策",
    style: "高冷 · 克制",
    tagline: "慢热守护",
    description: "黑发、克制、偏高冷，会先观察你的情绪，再用简短但有力量的方式回应。",
    preview: "你可以先不用把情绪整理好，直接发给我。我会帮你一点点理顺。",
    persona: "zhou",
    plays: "155.7万",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=JiangCe&hair=short11&eyes=variant08&skinColor=d5b99e",
    cover: "linear-gradient(180deg, rgba(80, 58, 66, 0.24), rgba(10, 10, 14, 0.76)), radial-gradient(circle at top, rgba(255,255,255,0.16), transparent 38%)",
  },
  gu: {
    id: "gu",
    name: "顾沉舟",
    style: "幽默 · 松弛",
    tagline: "会接梗",
    description: "外表冷一点，聊天却很会接梗，适合你想轻松聊、又不想被说教的时候。",
    preview: "你先说，我负责把今天那些乱七八糟的心情拆开，顺便逗你笑一下。",
    persona: "zhou",
    plays: "596.5万",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=GuChenzhou&hair=short04&eyes=variant02&skinColor=e0c4a8",
    cover: "linear-gradient(180deg, rgba(44, 86, 104, 0.24), rgba(8, 12, 16, 0.76)), radial-gradient(circle at top, rgba(255,255,255,0.18), transparent 38%)",
  },
  su: {
    id: "su",
    name: "苏棠",
    style: "黏人 · 甜感",
    tagline: "会主动贴近你",
    description: "更偏亲密陪伴和主动关心，适合下班后、深夜、失落时想有人一直在身边。",
    preview: "今天是不是又一个人扛了很多？你先靠过来一点，我不催你慢慢说。",
    persona: "luna",
    plays: "13.6万",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=SuTang&hair=long05&eyes=variant04&skinColor=f2d3b1&features=blush",
    cover: "linear-gradient(180deg, rgba(116, 72, 100, 0.26), rgba(10, 8, 16, 0.78)), radial-gradient(circle at top, rgba(255,255,255,0.20), transparent 38%)",
  },
};

const DISCOVER_LIST = [
  { id: "liu", desc: "夜景公寓氛围，美强感，陪伴里带一点压迫感。", tags: ["推荐", "治愈", "都市"] },
  { id: "jiang", desc: "双男主 / 你的竹马，18 岁，校服感很强。", tags: ["推荐", "高冷", "校园"] },
  { id: "gu", desc: "会接梗、会缓和气氛，也会在你低落时认真陪你。", tags: ["推荐", "幽默", "都市"] },
  { id: "su", desc: "更黏一点，适合晚安、碎碎念、通勤和深夜聊天。", tags: ["推荐", "治愈", "都市"] },
];

const views = Array.from(document.querySelectorAll(".screen"));
const tabButtons = Array.from(document.querySelectorAll(".tab-btn"));
const toastEl = document.getElementById("toast");
const agreementCheckbox = document.getElementById("agreement-checkbox");
const emailLoginBtn = document.getElementById("email-login-btn");
const phoneEntryBtn = document.getElementById("phone-entry-btn");
const appleLoginBtn = document.getElementById("apple-login-btn");
const phoneLoginSubmit = document.getElementById("phone-login-submit");
const phoneNumberInput = document.getElementById("phone-number");
const phoneCodeInput = document.getElementById("phone-code");
const loginFormTitleEl = document.getElementById("login-form-title");
const loginFormHeadingEl = document.getElementById("login-form-heading");
const loginFormCopyEl = document.getElementById("login-form-copy");
const loginIdentifierLabelEl = document.getElementById("login-identifier-label");
const loginSecretLabelEl = document.getElementById("login-secret-label");
const loginMethodTipEl = document.getElementById("login-method-tip");
const sendCodeBtn = document.getElementById("send-code-btn");
const loginMethodTabs = Array.from(document.querySelectorAll(".login-method-tab"));
const voiceToggleBtn = document.getElementById("voice-toggle-btn");
const voiceChatBtn = document.getElementById("voice-chat-btn");
const keyboardToggleBtn = document.getElementById("keyboard-toggle-btn");
const quickSendBtn = document.getElementById("quick-send-btn");
const saveCharacterBtn = document.getElementById("save-character-btn");
const discoverGrid = document.getElementById("discover-grid");
const discoverSearchInput = document.getElementById("discover-search");
const chatInputEl = document.getElementById("chat-input");
const sendBtnEl = document.getElementById("send-btn");
const messagesEl = document.getElementById("messages");
const welcomeNameEl = document.getElementById("chat-welcome-name");
const welcomeCopyEl = document.getElementById("chat-welcome-copy");
const characterIdeaEl = document.getElementById("character-idea");
const homeCharacterNameEl = document.getElementById("home-character-name");
const homeCharacterStyleEl = document.getElementById("home-character-style");
const homeCharacterDescriptionEl = document.getElementById("home-character-description");
const homePreviewMessageEl = document.getElementById("home-preview-message");
const homeCharacterSubnameEl = document.getElementById("home-character-subname");
const homeCharacterTagEl = document.getElementById("home-character-tag");
const homeHeroStageEl = document.getElementById("home-hero-stage");
const homeAvatarImgEl = document.getElementById("home-avatar-img");
const chatBgEl = document.getElementById("chat-bg");
const chatAvatarSmallEl = document.getElementById("chat-avatar-small");
const chatTitleNameEl = document.getElementById("chat-title-name");
const tagButtons = Array.from(document.querySelectorAll(".tag-pill"));
const templateButtons = Array.from(document.querySelectorAll(".template-chip"));
const discoverFilters = Array.from(document.querySelectorAll(".filter-chip"));
const subtabBtns = Array.from(document.querySelectorAll(".subtab-btn"));
const segmentBtns = Array.from(document.querySelectorAll(".segment-btn"));
const planCards = Array.from(document.querySelectorAll(".plan-card"));
const logoutBtn = document.getElementById("logout-btn");
const homeFavBtn = document.getElementById("home-fav-btn");

let activeView = "auth";
let currentCharacterId = loadCharacterId();
let isSending = false;
let currentFilter = "推荐";
let currentLoginMethod = "email";

const LOGIN_METHOD_CONFIG = {
  email: {
    sourceName: "邮箱",
    title: "邮箱登录",
    heading: "欢迎回来 👋",
    copy: "请输入邮箱和密码，演示版本任意填写即可进入体验。",
    identifierLabel: "邮箱地址",
    identifierPlaceholder: "your@email.com",
    identifierType: "email",
    identifierInputMode: "email",
    secretLabel: "密码",
    secretPlaceholder: "请输入密码",
    secretType: "password",
    submitText: "邮箱登录",
    tipText: "当前为邮箱登录演示模式，输入任意邮箱与密码即可继续。",
    showCodeButton: false,
    codeButtonText: "",
    emptyIdentifierText: "请填写邮箱地址。",
    emptySecretText: "请填写密码。",
    successText: "邮箱登录成功，欢迎回来。",
  },
  phone: {
    sourceName: "手机号",
    title: "手机号登录",
    heading: "欢迎回来 👋",
    copy: "请输入手机号和验证码，演示版本任意填写即可进入体验。",
    identifierLabel: "手机号",
    identifierPlaceholder: "请输入手机号",
    identifierType: "tel",
    identifierInputMode: "numeric",
    secretLabel: "验证码",
    secretPlaceholder: "请输入验证码",
    secretType: "text",
    submitText: "手机号登录",
    tipText: "当前为手机号登录演示模式，可先点“获取验证码”，再输入任意验证码继续。",
    showCodeButton: true,
    codeButtonText: "获取验证码",
    emptyIdentifierText: "请填写手机号。",
    emptySecretText: "请填写验证码。",
    successText: "手机号登录成功，欢迎回来。",
  },
  apple: {
    sourceName: "Apple",
    title: "Apple 账号登录",
    heading: "使用 Apple 继续",
    copy: "请输入 Apple 账号和验证信息，演示版本任意填写即可进入体验。",
    identifierLabel: "Apple 账号",
    identifierPlaceholder: "请输入 Apple 账号",
    identifierType: "text",
    identifierInputMode: "text",
    secretLabel: "验证信息",
    secretPlaceholder: "请输入密码 / 验证码",
    secretType: "password",
    submitText: "Apple 登录",
    tipText: "当前为 Apple 登录演示模式，输入任意 Apple 账号信息即可继续。",
    showCodeButton: false,
    codeButtonText: "",
    emptyIdentifierText: "请填写 Apple 账号。",
    emptySecretText: "请填写验证信息。",
    successText: "Apple 登录成功，欢迎回来。",
  },
};
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = generateUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function resetSessionId() {
  const newId = generateUUID();
  localStorage.setItem(SESSION_KEY, newId);
  return newId;
}

function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toastEl.classList.remove("visible");
  }, 2200);
}

function isLoggedIn() {
  return localStorage.getItem(LOGIN_STATE_KEY) === "1";
}

function setLoggedIn(value) {
  localStorage.setItem(LOGIN_STATE_KEY, value ? "1" : "0");
}

function hasAgreement() {
  return agreementCheckbox?.checked || localStorage.getItem(AGREEMENT_KEY) === "1";
}

function rememberAgreement() {
  if (agreementCheckbox?.checked) {
    localStorage.setItem(AGREEMENT_KEY, "1");
  }
}

function requireAgreement() {
  if (hasAgreement()) return true;
  showToast("请先勾选服务协议与隐私政策。");
  if (agreementCheckbox) {
    agreementCheckbox.style.outline = "2px solid #ff7d7d";
    window.setTimeout(() => {
      agreementCheckbox.style.outline = "";
    }, 1500);
  }
  return false;
}

function loadCharacterId() {
  const stored = localStorage.getItem(CHARACTER_KEY);
  return CHARACTERS[stored] ? stored : "liu";
}

function getCurrentCharacter() {
  return CHARACTERS[currentCharacterId] || CHARACTERS.liu;
}

function loadFavorites() {
  try {
    const raw = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function isFavorite(characterId) {
  return loadFavorites().includes(characterId);
}

function toggleFavorite(characterId) {
  const favorites = loadFavorites();
  const next = favorites.includes(characterId)
    ? favorites.filter((item) => item !== characterId)
    : [...favorites, characterId];
  saveFavorites(next);
  updateFavoriteButton();
  return next.includes(characterId);
}

function updateFavoriteButton() {
  if (!homeFavBtn) return;
  homeFavBtn.textContent = isFavorite(currentCharacterId) ? "♥" : "♡";
}

function saveCharacterId(characterId, options = {}) {
  if (!CHARACTERS[characterId]) return;
  currentCharacterId = characterId;
  localStorage.setItem(CHARACTER_KEY, characterId);
  if (!options.keepSession) {
    resetSessionId();
    resetChatPanel();
  }
  renderCurrentCharacter();
}

function resetViewStateForLogout() {
  resetSessionId();
  resetChatPanel();
  if (chatInputEl) {
    chatInputEl.value = "";
    autoResizeInput();
  }
}

function applyBottomBarVisibility(viewName) {
  const tabbar = document.getElementById("bottom-tabbar");
  if (!tabbar) return;
  const hiddenViews = new Set(["auth", "phone-login", "membership", "chat-sheet"]);
  tabbar.style.display = hiddenViews.has(viewName) ? "none" : "grid";
}

function showView(name) {
  activeView = name;
  views.forEach((view) => {
    view.classList.toggle("active", view.dataset.view === name);
  });
  tabButtons.forEach((btn) => {
    const isCenter = btn.classList.contains("center-tab");
    if (isCenter) {
      btn.classList.toggle("active", name === "create");
      return;
    }
    btn.classList.toggle("active", btn.dataset.nav === name);
  });
  applyBottomBarVisibility(name);
}

function guardedEnter(viewName) {
  if (!isLoggedIn() && viewName !== "auth" && viewName !== "phone-login") {
    showToast("请先登录后再进入。");
    showView("auth");
    return;
  }
  showView(viewName);
}

function renderCurrentCharacter() {
  const character = getCurrentCharacter();

  if (homeCharacterNameEl) homeCharacterNameEl.textContent = character.name;
  if (homeCharacterStyleEl) homeCharacterStyleEl.textContent = character.style;
  if (homeCharacterDescriptionEl) homeCharacterDescriptionEl.textContent = character.description;
  if (homePreviewMessageEl) homePreviewMessageEl.textContent = character.preview;
  if (homeCharacterSubnameEl) homeCharacterSubnameEl.textContent = character.name;
  if (homeCharacterTagEl) homeCharacterTagEl.textContent = character.tagline;
  if (homeAvatarImgEl) homeAvatarImgEl.src = character.avatar;
  if (homeAvatarImgEl) homeAvatarImgEl.alt = character.name;
  if (homeHeroStageEl) homeHeroStageEl.style.background = character.cover;

  if (welcomeNameEl) welcomeNameEl.textContent = character.name;
  if (welcomeCopyEl) welcomeCopyEl.textContent = character.preview;
  if (chatAvatarSmallEl) {
    chatAvatarSmallEl.src = character.avatar;
    chatAvatarSmallEl.alt = character.name;
  }
  if (chatTitleNameEl) chatTitleNameEl.textContent = character.name;
  if (chatBgEl) chatBgEl.style.background = character.cover;

  updateFavoriteButton();
}

function resetChatPanel() {
  if (!messagesEl) return;
  const character = getCurrentCharacter();
  messagesEl.innerHTML = `
    <div class="welcome-bubble" id="welcome">
      <div class="welcome-name" id="chat-welcome-name">${character.name}</div>
      <p id="chat-welcome-copy">${character.preview}</p>
    </div>
  `;
}

function appendMessage(role, text) {
  const welcome = document.getElementById("welcome");
  if (welcome) welcome.style.display = "none";

  const row = document.createElement("div");
  row.className = `message-row ${role}`;

  if (role === "ai") {
    const avatar = document.createElement("img");
    avatar.className = "message-avatar";
    avatar.src = getCurrentCharacter().avatar;
    avatar.alt = getCurrentCharacter().name;
    row.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = `message-bubble ${role}`;
  bubble.textContent = text;
  row.appendChild(bubble);
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showTypingIndicator() {
  const welcome = document.getElementById("welcome");
  if (welcome) welcome.style.display = "none";

  const row = document.createElement("div");
  row.className = "message-row ai typing-row";
  row.id = "typing-indicator";
  row.innerHTML = `
    <img class="message-avatar" src="${getCurrentCharacter().avatar}" alt="${getCurrentCharacter().name}" />
    <div class="message-bubble ai typing-bubble"><span></span><span></span><span></span></div>
  `;
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function removeTypingIndicator() {
  document.getElementById("typing-indicator")?.remove();
}

function autoResizeInput() {
  if (!chatInputEl) return;
  chatInputEl.style.height = "auto";
  chatInputEl.style.height = `${Math.min(chatInputEl.scrollHeight, 120)}px`;
}

async function sendMessage(prefilledText = null) {
  if (isSending) return;
  const text = (prefilledText ?? chatInputEl?.value ?? "").trim();
  if (!text) return;

  isSending = true;
  if (sendBtnEl) {
    sendBtnEl.disabled = true;
    sendBtnEl.textContent = "…";
  }

  appendMessage("user", text);
  if (chatInputEl) {
    chatInputEl.value = "";
    autoResizeInput();
  }
  showTypingIndicator();

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        session_id: getSessionId(),
        persona: getCurrentCharacter().persona,
      }),
    });

    removeTypingIndicator();

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const replyText = typeof data.reply === "string" ? data.reply.trim() : "";
    if (!replyText) {
      throw new Error("聊天接口返回了空内容");
    }
    appendMessage("ai", replyText);
  } catch (err) {
    removeTypingIndicator();
    appendMessage("ai", `现在网络有点不稳定，我还在这。你可以稍后再试一次。（${err.message}）`);
  } finally {
    isSending = false;
    if (sendBtnEl) {
      sendBtnEl.disabled = false;
      sendBtnEl.textContent = "发送";
    }
  }
}

function openChatForCharacter(characterId, options = {}) {
  saveCharacterId(characterId, options);
  guardedEnter("chat-sheet");
  window.setTimeout(() => chatInputEl?.focus(), 80);
}

function openLoginForm(method) {
  const config = LOGIN_METHOD_CONFIG[method] || LOGIN_METHOD_CONFIG.email;
  currentLoginMethod = method in LOGIN_METHOD_CONFIG ? method : "email";

  loginMethodTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.loginMethod === currentLoginMethod);
  });

  if (loginFormTitleEl) loginFormTitleEl.textContent = config.title;
  if (loginFormHeadingEl) loginFormHeadingEl.textContent = config.heading;
  if (loginFormCopyEl) loginFormCopyEl.textContent = config.copy;
  if (loginIdentifierLabelEl) loginIdentifierLabelEl.textContent = config.identifierLabel;
  if (loginSecretLabelEl) loginSecretLabelEl.textContent = config.secretLabel;
  if (loginMethodTipEl) loginMethodTipEl.textContent = config.tipText;

  if (sendCodeBtn) {
    sendCodeBtn.textContent = config.codeButtonText || "获取验证码";
    sendCodeBtn.classList.toggle("hidden", !config.showCodeButton);
  }

  if (phoneNumberInput) {
    phoneNumberInput.value = "";
    phoneNumberInput.placeholder = config.identifierPlaceholder;
    phoneNumberInput.type = config.identifierType;
    phoneNumberInput.inputMode = config.identifierInputMode;
  }

  if (phoneCodeInput) {
    phoneCodeInput.value = "";
    phoneCodeInput.placeholder = config.secretPlaceholder;
    phoneCodeInput.type = config.secretType;
  }

  if (phoneLoginSubmit) {
    phoneLoginSubmit.textContent = config.submitText;
  }

  showView("phone-login");
  window.setTimeout(() => phoneNumberInput?.focus(), 80);
}

function handleDemoLogin(source) {
  if (!requireAgreement()) return;
  rememberAgreement();
  setLoggedIn(true);
  showToast(`${source}登录成功，欢迎回来。`);
  guardedEnter("home");
}

function saveDraftCharacter() {
  const selectedTags = tagButtons
    .filter((btn) => btn.classList.contains("active"))
    .map((btn) => btn.dataset.tag);
  const idea = characterIdeaEl?.value.trim() || "";
  if (!idea && !selectedTags.length) {
    showToast("先写一点角色设定，或者选几个标签。");
    return;
  }
  localStorage.setItem(
    SAVED_CHARACTER_DRAFT_KEY,
    JSON.stringify({ idea, selectedTags })
  );
  showToast(`角色设定已保存：${selectedTags.join(" / ") || "自定义设定"}`);
}

function loadDraftCharacter() {
  try {
    const draft = JSON.parse(localStorage.getItem(SAVED_CHARACTER_DRAFT_KEY) || "null");
    if (!draft) return;
    if (characterIdeaEl && draft.idea) characterIdeaEl.value = draft.idea;
    if (Array.isArray(draft.selectedTags)) {
      tagButtons.forEach((btn) => {
        btn.classList.toggle("active", draft.selectedTags.includes(btn.dataset.tag));
      });
    }
  } catch {
    // ignore
  }
}

function renderDiscoverGrid() {
  if (!discoverGrid) return;

  const keyword = discoverSearchInput?.value.trim() || "";
  const filtered = DISCOVER_LIST.filter((item) => {
    const character = CHARACTERS[item.id];
    const byFilter = currentFilter === "推荐" || item.tags.includes(currentFilter);
    const byKeyword = !keyword || `${character.name}${character.style}${item.desc}`.includes(keyword);
    return byFilter && byKeyword;
  });

  if (!filtered.length) {
    discoverGrid.innerHTML = `<div class="empty-state">没有找到符合条件的角色，换个关键词试试。</div>`;
    return;
  }

  discoverGrid.innerHTML = filtered.map((item) => {
    const character = CHARACTERS[item.id];
    return `
      <button class="discover-card" data-character="${item.id}" style="background:${character.cover};">
        <img class="discover-card-avatar" src="${character.avatar}" alt="${character.name}" />
        <div class="discover-card-content">
          <div class="discover-card-top">
            <strong>${character.name}</strong>
            <span>${character.plays}</span>
          </div>
          <p>${item.desc}</p>
          <small>${character.style}</small>
          <span class="discover-card-cta">开始聊天 →</span>
        </div>
      </button>
    `;
  }).join("");

  discoverGrid.querySelectorAll(".discover-card").forEach((card) => {
    card.addEventListener("click", () => {
      openChatForCharacter(card.dataset.character);
      showToast(`已切换到 ${getCurrentCharacter().name}`);
    });
  });
}

function bindNavButtons() {
  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.nav;
      if (!target) return;
      if (target === "auth") {
        showView("auth");
        return;
      }
      guardedEnter(target);
    });
  });
}

function bindDemoButtons() {
  document.querySelectorAll("[data-demo]").forEach((btn) => {
    btn.addEventListener("click", () => {
      showToast(btn.dataset.demo || "该入口已预留。");
    });
  });
}

function initLoginActions() {
  loginMethodTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const method = tab.dataset.loginMethod;
      if (!method) return;
      openLoginForm(method);
    });
  });

  sendCodeBtn?.addEventListener("click", () => {
    const phone = phoneNumberInput?.value.trim();
    if (currentLoginMethod !== "phone") return;
    if (!phone) {
      showToast("请先填写手机号，再获取验证码。");
      phoneNumberInput?.focus();
      return;
    }
    showToast(`验证码已发送到 ${phone}（演示模式）`);
    phoneCodeInput?.focus();
  });

  emailLoginBtn?.addEventListener("click", () => {
    if (!requireAgreement()) return;
    rememberAgreement();
    openLoginForm("email");
  });

  appleLoginBtn?.addEventListener("click", () => {
    if (!requireAgreement()) return;
    rememberAgreement();
    openLoginForm("apple");
  });

  phoneEntryBtn?.addEventListener("click", () => {
    if (!requireAgreement()) return;
    rememberAgreement();
    openLoginForm("phone");
  });

  phoneLoginSubmit?.addEventListener("click", () => {
    const config = LOGIN_METHOD_CONFIG[currentLoginMethod] || LOGIN_METHOD_CONFIG.email;
    const identifier = phoneNumberInput?.value.trim();
    const secret = phoneCodeInput?.value.trim();
    if (!identifier) {
      showToast(config.emptyIdentifierText);
      phoneNumberInput?.focus();
      return;
    }
    if (!secret) {
      showToast(config.emptySecretText);
      phoneCodeInput?.focus();
      return;
    }
    setLoggedIn(true);
    showToast(config.successText);
    guardedEnter("home");
  });
}

function initHomeActions() {
  voiceToggleBtn?.addEventListener("click", () => showToast("语音能力已预留，稍后接入。"));
  voiceChatBtn?.addEventListener("click", () => {
    guardedEnter("chat-sheet");
    window.setTimeout(() => chatInputEl?.focus(), 80);
  });
  keyboardToggleBtn?.addEventListener("click", () => {
    guardedEnter("chat-sheet");
    window.setTimeout(() => chatInputEl?.focus(), 80);
  });
  quickSendBtn?.addEventListener("click", () => {
    guardedEnter("chat-sheet");
    window.setTimeout(() => chatInputEl?.focus(), 80);
  });
  homeFavBtn?.addEventListener("click", () => {
    const favorited = toggleFavorite(currentCharacterId);
    showToast(favorited ? "已收藏到互动记录。" : "已取消收藏。");
  });
}

function initCreateActions() {
  saveCharacterBtn?.addEventListener("click", saveDraftCharacter);

  tagButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
    });
  });

  templateButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (characterIdeaEl) {
        characterIdeaEl.value = `我想创建一个“${btn.dataset.template}”类型的角色，整体气质偏${btn.dataset.template}，会陪我聊天，也能在我情绪低落时安慰我。`;
      }
      showToast(`已带入模板：${btn.dataset.template}`);
    });
  });

  subtabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      subtabBtns.forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      showToast(`${btn.textContent.trim()}模块已切换。`);
    });
  });
}

function initDiscoverActions() {
  discoverFilters.forEach((btn) => {
    btn.addEventListener("click", () => {
      discoverFilters.forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.textContent.trim();
      renderDiscoverGrid();
    });
  });

  discoverSearchInput?.addEventListener("input", () => {
    renderDiscoverGrid();
  });
}

function initMembershipActions() {
  const savedPlan = localStorage.getItem(SELECTED_PLAN_KEY);
  if (savedPlan) {
    planCards.forEach((card) => {
      card.classList.toggle("active", card.dataset.plan === savedPlan);
    });
  }

  planCards.forEach((card) => {
    card.addEventListener("click", () => {
      planCards.forEach((item) => item.classList.remove("active"));
      card.classList.add("active");
      localStorage.setItem(SELECTED_PLAN_KEY, card.dataset.plan || "");
      showToast(`已选择${card.dataset.plan}`);
    });
  });
}

function initInboxActions() {
  segmentBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      segmentBtns.forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      showToast(`当前查看：${btn.textContent.trim()}`);
    });
  });

  document.querySelectorAll(".list-item").forEach((item) => {
    item.addEventListener("click", () => {
      const characterId = item.dataset.character;
      if (characterId && CHARACTERS[characterId]) {
        openChatForCharacter(characterId, { keepSession: true });
      } else {
        showToast(item.querySelector("p")?.textContent || "系统消息");
      }
    });
  });
}

function initProfileActions() {
  logoutBtn?.addEventListener("click", () => {
    setLoggedIn(false);
    resetViewStateForLogout();
    showToast("已退出登录。");
    showView("auth");
  });
}

function initChatActions() {
  sendBtnEl?.addEventListener("click", () => sendMessage());
  chatInputEl?.addEventListener("input", autoResizeInput);
  chatInputEl?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });
}

function restoreAgreement() {
  if (agreementCheckbox && localStorage.getItem(AGREEMENT_KEY) === "1") {
    agreementCheckbox.checked = true;
  }
}

bindNavButtons();
bindDemoButtons();
restoreAgreement();
initLoginActions();
initHomeActions();
initCreateActions();
initDiscoverActions();
initMembershipActions();
initInboxActions();
initProfileActions();
initChatActions();
loadDraftCharacter();
renderCurrentCharacter();
renderDiscoverGrid();
autoResizeInput();
showView("auth");
