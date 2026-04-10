const SESSION_KEY = "chat_session_id_v4";
const LOGIN_STATE_KEY = "v4_demo_login";
const TOKEN_KEY = "v4_auth_token";
const USER_KEY = "v4_auth_user";
const AGREEMENT_KEY = "v4_demo_agreement";
const CHARACTER_KEY = "v4_character_state";
const FAVORITES_KEY = "v4_favorites";
const SAVED_CHARACTER_DRAFT_KEY = "v4_saved_character_draft";
const SELECTED_PLAN_KEY = "v4_selected_plan";

/**
 * 生成极简艺术风角色封面 SVG (Linear/Spotify 风格, 无低端卡通头像)
 * 渐变背景 + 超大汉字 + 极细装饰线 + 品牌水印
 */
function makePortrait(ch1, ch2, c1, c2, accent) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 900' preserveAspectRatio='xMidYMid slice'>
<defs>
<linearGradient id='g' x1='0.2' y1='0' x2='0.8' y2='1'>
<stop offset='0' stop-color='${c1}'/>
<stop offset='0.55' stop-color='${c2}'/>
<stop offset='1' stop-color='#05060a'/>
</linearGradient>
<radialGradient id='r' cx='0.5' cy='0.28' r='0.65'>
<stop offset='0' stop-color='${accent}' stop-opacity='0.55'/>
<stop offset='0.5' stop-color='${accent}' stop-opacity='0.14'/>
<stop offset='1' stop-color='${accent}' stop-opacity='0'/>
</radialGradient>
<linearGradient id='v' x1='0.5' y1='0.4' x2='0.5' y2='1'>
<stop offset='0' stop-color='#05060a' stop-opacity='0'/>
<stop offset='1' stop-color='#05060a' stop-opacity='0.92'/>
</linearGradient>
</defs>
<rect width='600' height='900' fill='url(#g)'/>
<rect width='600' height='900' fill='url(#r)'/>
<g opacity='0.06' stroke='#ffffff' stroke-width='1' fill='none'>
<circle cx='300' cy='380' r='180'/>
<circle cx='300' cy='380' r='260'/>
<circle cx='300' cy='380' r='340'/>
</g>
<text x='220' y='470' font-family='PingFang SC, -apple-system, Noto Sans CJK SC, sans-serif' font-size='360' font-weight='900' fill='#ffffff' opacity='0.93' text-anchor='middle' letter-spacing='-18'>${ch1}</text>
<text x='380' y='580' font-family='PingFang SC, -apple-system, Noto Sans CJK SC, sans-serif' font-size='160' font-weight='300' fill='#ffffff' opacity='0.3' text-anchor='middle' letter-spacing='-8'>${ch2}</text>
<rect width='600' height='900' fill='url(#v)'/>
<line x1='60' y1='810' x2='100' y2='810' stroke='${accent}' stroke-width='2'/>
<text x='110' y='816' font-family='SF Pro, Inter, sans-serif' font-size='18' font-weight='600' fill='#ffffff' opacity='0.5' letter-spacing='5'>LIAOKA</text>
</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/**
 * 小头像 SVG (聊天气泡 + 列表用) — 圆形字符
 */
function makeMiniPortrait(ch, c1, c2) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
<defs><linearGradient id='mg' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/></linearGradient></defs>
<rect width='120' height='120' rx='60' fill='url(#mg)'/>
<text x='60' y='82' font-family='PingFang SC, sans-serif' font-size='62' font-weight='700' fill='#ffffff' text-anchor='middle' opacity='0.95'>${ch}</text>
</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const CHARACTERS = {
  liu: {
    id: "liu",
    name: "柳慕然",
    style: "温柔 · 治愈",
    tagline: "陪伴中",
    description: "白发、冷白皮、夜景公寓氛围, 设定偏温柔强势, 会认真接住情绪, 也会主动推进对话.",
    preview: "晚上风有点大, 你回来的时候记得慢一点. 我在这, 先听你说今天发生了什么.",
    persona: "luna",
    plays: "558.9万",
    age: "25",
    mbti: "INFJ",
    tags: ["治愈系", "夜景", "姐姐感", "高冷"],
    quotes: ["我在这, 先听你说.", "别急, 一句一句慢慢来.", "今晚就让我陪你到睡着."],
    avatar: "/static-v4/characters/liu.jpg",
    cover: "/static-v4/characters/liu.jpg",
    accentColor: "#e63e5c",
    gradientColors: ["#3a1828", "#1a0812"],
  },
  jiang: {
    id: "jiang",
    name: "江策",
    style: "高冷 · 克制",
    tagline: "慢热守护",
    description: "黑发、克制、偏高冷, 会先观察你的情绪, 再用简短但有力量的方式回应.",
    preview: "你可以先不用把情绪整理好, 直接发给我. 我会帮你一点点理顺.",
    persona: "zhou",
    plays: "155.7万",
    age: "27",
    mbti: "ISTJ",
    tags: ["高冷", "克制", "守护系", "成熟"],
    quotes: ["想说就说, 不想说也没关系.", "我不会走.", "先把自己照顾好."],
    avatar: "/static-v4/characters/jiang.jpeg",
    cover: "/static-v4/characters/jiang.jpeg",
    accentColor: "#7ea3d6",
    gradientColors: ["#1a2a3e", "#060e1c"],
  },
  gu: {
    id: "gu",
    name: "顾沉舟",
    style: "幽默 · 松弛",
    tagline: "会接梗",
    description: "外表冷一点, 聊天却很会接梗, 适合你想轻松聊、又不想被说教的时候.",
    preview: "你先说, 我负责把今天那些乱七八糟的心情拆开, 顺便逗你笑一下.",
    persona: "zhou",
    plays: "596.5万",
    age: "24",
    mbti: "ENTP",
    tags: ["幽默", "松弛", "学长感", "接梗"],
    quotes: ["你这暴躁程度, 是缺糖了吧.", "来来来, 先笑一个.", "聊啥, 我都陪."],
    avatar: "/static-v4/characters/gu.jpg",
    cover: "/static-v4/characters/gu.jpg",
    accentColor: "#5fd6c0",
    gradientColors: ["#0e2e2a", "#04120f"],
  },
  su: {
    id: "su",
    name: "苏棠",
    style: "黏人 · 甜感",
    tagline: "会主动贴近你",
    description: "更偏亲密陪伴和主动关心, 适合下班后、深夜、失落时想有人一直在身边.",
    preview: "今天是不是又一个人扛了很多? 你先靠过来一点, 我不催你慢慢说.",
    persona: "luna",
    plays: "13.6万",
    age: "23",
    mbti: "ENFJ",
    tags: ["黏人", "甜系", "撒娇", "治愈"],
    quotes: ["一整天没见你, 好想你.", "今天要吃什么呀, 我陪你.", "你靠过来一点.", "给你留了最后一块糖."],
    avatar: "/static-v4/characters/su.jpg",
    cover: "/static-v4/characters/su.jpg",
    accentColor: "#ff7da6",
    gradientColors: ["#3a0e22", "#1a050e"],
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

function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

function setAuthToken(token, user) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch (e) {
    return null;
  }
}

function authHeaders() {
  const t = getAuthToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/**
 * 真注册/登录: 先尝试 login, 失败(401/400/409)则单次 fallback 到另一个方法
 * 单次 fallback (有 _retried 保护), 避免死循环
 * 最终失败返回 ok:false + 消息 (不降级到 demo, 让用户看到真实错误)
 */
async function callAuth(method, identifier, secret, _retried = false) {
  const endpoint = method === "register" ? "/auth/register" : "/auth/login";
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: identifier, password: secret }),
    });
    if (res.ok) {
      const data = await res.json();
      setAuthToken(data.token, data.user);
      return { ok: true };
    }
    // 邮箱已注册: 切到 login (单次)
    if (res.status === 409 && method === "register" && !_retried) {
      return await callAuth("login", identifier, secret, true);
    }
    // 登录失败, 可能是新用户: 切到 register (单次)
    if ((res.status === 401 || res.status === 400) && method === "login" && !_retried) {
      return await callAuth("register", identifier, secret, true);
    }
    // 已 retried 或 其他错误: 返回真实错误
    const err = await res.json().catch(() => ({}));
    let msg = err.detail || "登录失败, 请检查邮箱/密码";
    if (res.status === 401) msg = "邮箱或密码错误";
    if (res.status === 409) msg = "该邮箱已注册, 密码不正确";
    if (res.status === 429) msg = "请求过于频繁, 请稍后再试";
    return { ok: false, message: msg };
  } catch (e) {
    return { ok: false, message: "网络连接失败, 请稍后再试" };
  }
}

function isLoggedIn() {
  return localStorage.getItem(LOGIN_STATE_KEY) === "1" || !!getAuthToken();
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
  homeFavBtn.classList.toggle("favorited", isFavorite(currentCharacterId));
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
  const hiddenViews = new Set(["auth", "phone-login", "chat-sheet", "character-detail"]);
  // 清掉 inline display, 让 CSS (display: grid) 接管
  if (hiddenViews.has(viewName)) {
    tabbar.style.display = "none";
  } else {
    tabbar.style.display = "";
  }
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

function renderCharacterSwitcher() {
  const switcher = document.getElementById("character-switcher");
  if (!switcher) return;
  switcher.innerHTML = Object.values(CHARACTERS).map((c) => `
    <button class="character-chip ${c.id === currentCharacterId ? "active" : ""}" data-character="${c.id}">
      <img src="${c.avatar}" alt="${c.name}" />
      <span>${c.name}</span>
    </button>
  `).join("");
  switcher.querySelectorAll(".character-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cid = btn.dataset.character;
      if (!cid || cid === currentCharacterId) return;
      saveCharacterId(cid);
      renderCurrentCharacter();
      showToast(`已切换到 ${CHARACTERS[cid].name}`);
    });
  });
}

function renderCurrentCharacter() {
  const character = getCurrentCharacter();

  if (homeCharacterNameEl) homeCharacterNameEl.textContent = character.name;
  if (homeCharacterStyleEl) homeCharacterStyleEl.textContent = character.style;
  if (homeCharacterDescriptionEl) homeCharacterDescriptionEl.textContent = character.description;
  if (homePreviewMessageEl) homePreviewMessageEl.textContent = character.preview;
  if (homeCharacterSubnameEl) homeCharacterSubnameEl.textContent = character.name;
  if (homeCharacterTagEl) homeCharacterTagEl.textContent = character.tagline;
  // hero avatar img uses the full-bleed cover (massive portrait SVG)
  if (homeAvatarImgEl) {
    homeAvatarImgEl.src = character.cover;
    homeAvatarImgEl.alt = character.name;
  }
  if (homeHeroStageEl) homeHeroStageEl.style.background = "";

  if (welcomeNameEl) welcomeNameEl.textContent = character.name;
  if (welcomeCopyEl) welcomeCopyEl.textContent = character.preview;
  if (chatAvatarSmallEl) {
    chatAvatarSmallEl.src = character.avatar;
    chatAvatarSmallEl.alt = character.name;
  }
  if (chatTitleNameEl) chatTitleNameEl.textContent = character.name;
  // chat page background uses cover SVG
  if (chatBgEl) chatBgEl.style.backgroundImage = `url("${character.cover}")`;

  updateFavoriteButton();
  renderCharacterSwitcher();
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
  return bubble;  // 返回 bubble 给流式调用方可以后续 append text
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

// 待发送的图片 url (从 /upload/image 拿到)
let pendingImageUrl = null;

async function uploadImageFile(file) {
  if (!file) return null;
  if (file.size > 8 * 1024 * 1024) {
    showToast("图片不能超过 8MB");
    return null;
  }
  const form = new FormData();
  form.append("file", file);
  try {
    const res = await fetch("/upload/image", {
      method: "POST",
      headers: { ...authHeaders() },
      body: form,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.url;
  } catch (e) {
    showToast(`图片上传失败: ${e.message}`);
    return null;
  }
}

async function sendMessage(prefilledText = null) {
  if (isSending) return;
  const text = (prefilledText ?? chatInputEl?.value ?? "").trim();
  // 允许只发图片 (text 可以为空)
  if (!text && !pendingImageUrl) return;

  isSending = true;
  if (sendBtnEl) {
    sendBtnEl.disabled = true;
    sendBtnEl.classList.add("sending");
  }

  // 显示用户消息 (含图片预览)
  const userBubble = appendMessage("user", text || "");
  if (pendingImageUrl && userBubble) {
    const img = document.createElement("img");
    img.src = pendingImageUrl;
    img.className = "message-image";
    img.style.cssText = "max-width: 220px; border-radius: 14px; margin-top: 8px; display: block;";
    userBubble.appendChild(img);
  }
  const sentImageUrl = pendingImageUrl;
  pendingImageUrl = null;
  const previewEl = document.getElementById("image-preview");
  if (previewEl) previewEl.remove();

  if (chatInputEl) {
    chatInputEl.value = "";
    autoResizeInput();
  }
  showTypingIndicator();

  try {
    // v4: 优先用 /chat/stream 流式, 边生成边显示 (打字机效果)
    const res = await fetch("/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({
        message: text || "(图片)",
        session_id: getSessionId(),
        persona: getCurrentCharacter().persona,
        image_url: sentImageUrl,
      }),
    });

    if (!res.ok || !res.body) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.error || `HTTP ${res.status}`);
    }

    removeTypingIndicator();
    // 创建一个空的 assistant 气泡, 边收边填
    const bubble = appendMessage("ai", "");
    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let accumulated = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        accumulated += chunk;
        if (bubble) bubble.textContent = accumulated;
        // 滚到底
        if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
      }
    }
    // flush 尾部
    const tail = decoder.decode();
    if (tail) {
      accumulated += tail;
      if (bubble) bubble.textContent = accumulated;
    }
    if (!accumulated.trim() && bubble) {
      bubble.textContent = "我在呢, 你继续说。";
    }
  } catch (err) {
    removeTypingIndicator();
    appendMessage("ai", `现在网络有点不稳定，我还在这。你可以稍后再试一次。（${err.message}）`);
  } finally {
    isSending = false;
    if (sendBtnEl) {
      sendBtnEl.disabled = false;
      sendBtnEl.classList.remove("sending");
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
      <button class="discover-card" data-character="${item.id}">
        <img class="discover-card-avatar" src="${character.cover}" alt="${character.name}" />
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
      const cid = card.dataset.character;
      openCharacterDetail(cid);
    });
  });
}

// ═══════════════════════════════════════════════════════════
// 角色详情页
// ═══════════════════════════════════════════════════════════
function openCharacterDetail(characterId) {
  const c = CHARACTERS[characterId];
  if (!c) return;
  saveCharacterId(characterId);
  renderCharacterDetail(c);
  showView("character-detail");
}

function renderCharacterDetail(c) {
  const el = (id) => document.getElementById(id);
  const cover = el("detail-cover");
  if (cover) {
    cover.src = c.cover;
    cover.alt = c.name;
  }
  const hero = el("detail-hero");
  if (hero) {
    hero.style.setProperty("--accent", c.accentColor || "#e63e5c");
  }
  el("detail-name").textContent = c.name;
  el("detail-style").textContent = c.style;
  el("detail-plays").textContent = c.plays;
  el("detail-age").textContent = c.age || "—";
  el("detail-mbti").textContent = c.mbti || "—";
  el("detail-description").textContent = c.description;

  const tagRow = el("detail-tags");
  if (tagRow) {
    tagRow.innerHTML = (c.tags || []).map((t) => `<span class="detail-tag">${t}</span>`).join("");
  }
  const quoteList = el("detail-quotes");
  if (quoteList) {
    quoteList.innerHTML = (c.quotes || []).map((q) => `<div class="detail-quote">"${q}"</div>`).join("");
  }
  // fav button state
  const favBtn = el("detail-fav-btn");
  if (favBtn) {
    favBtn.classList.toggle("favorited", isFavorite(c.id));
  }
}

function initCharacterDetailActions() {
  document.getElementById("detail-start-chat")?.addEventListener("click", () => {
    guardedEnter("chat-sheet");
    window.setTimeout(() => chatInputEl?.focus(), 80);
  });
  document.getElementById("detail-fav-btn")?.addEventListener("click", () => {
    const favorited = toggleFavorite(currentCharacterId);
    showToast(favorited ? "已加入收藏" : "已取消收藏");
    const el = document.getElementById("detail-fav-btn");
    if (el) el.classList.toggle("favorited", favorited);
  });
}

// ═══════════════════════════════════════════════════════════
// 设置页
// ═══════════════════════════════════════════════════════════
function initSettingsActions() {
  // 读取之前保存的设置
  const SETTINGS_KEY = "v4_settings";
  const loadSettings = () => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}"); } catch { return {}; }
  };
  const saveSettings = (s) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  const settings = loadSettings();

  // 初始化 toggle 状态
  document.querySelectorAll(".toggle-switch[data-toggle]").forEach((el) => {
    const key = el.dataset.toggle;
    if (settings[key] !== undefined) {
      el.classList.toggle("active", !!settings[key]);
    }
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const s = loadSettings();
      const next = !el.classList.contains("active");
      el.classList.toggle("active", next);
      s[key] = next;
      saveSettings(s);
      showToast(next ? `已开启 ${el.closest(".settings-row")?.querySelector(".settings-row-label")?.textContent || ""}` : `已关闭 ${el.closest(".settings-row")?.querySelector(".settings-row-label")?.textContent || ""}`);
    });
  });

  // 主题色切换
  document.querySelectorAll(".theme-swatch").forEach((sw) => {
    sw.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".theme-swatch").forEach((s) => s.classList.remove("active"));
      sw.classList.add("active");
      const theme = sw.dataset.theme;
      document.body.dataset.theme = theme;
      const s = loadSettings();
      s.theme = theme;
      saveSettings(s);
      const themeNames = { rose: "暗夜玫瑰", sky: "深海蓝", mint: "薄雾青", amber: "琥珀金" };
      showToast(`已切换到 ${themeNames[theme]}`);
    });
  });

  // 加载时应用保存的主题
  if (settings.theme) {
    document.body.dataset.theme = settings.theme;
    document.querySelectorAll(".theme-swatch").forEach((s) => {
      s.classList.toggle("active", s.dataset.theme === settings.theme);
    });
  }
}

// ═══════════════════════════════════════════════════════════
// 故事库
// ═══════════════════════════════════════════════════════════
const STORIES = [
  { cid: "liu", title: "深夜的电台", sub: "一个失眠的夜晚, 她把自己的声音变成了安眠药.", duration: "12 分钟" },
  { cid: "jiang", title: "校门口的雨", sub: "高中最后一场雨, 他默默走在你身后把伞偏过来.", duration: "8 分钟" },
  { cid: "gu", title: "便利店的盒饭", sub: "加班到凌晨的你碰见了和你一样狼狈的他.", duration: "15 分钟" },
  { cid: "su", title: "回家的末班车", sub: "她抢到了最后一个座位, 却把位置留给了你.", duration: "10 分钟" },
  { cid: "liu", title: "陪你跨年", sub: "城市的烟花里, 她说 \"今年最想陪的人是你\".", duration: "20 分钟" },
  { cid: "gu", title: "猫与咖啡", sub: "他养的猫意外地和你很合得来.", duration: "6 分钟" },
];

function renderStoriesPage() {
  const page = document.getElementById("stories-page");
  if (!page) return;
  page.innerHTML = STORIES.map((s) => {
    const c = CHARACTERS[s.cid];
    return `
      <button class="story-card" data-character="${s.cid}">
        <img class="story-cover" src="${c.cover}" alt="${c.name}" />
        <div class="story-content">
          <div class="story-character">${c.name} · ${c.style}</div>
          <div class="story-title">${s.title}</div>
          <div class="story-sub">${s.sub}</div>
          <div class="story-duration">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${s.duration}
          </div>
        </div>
      </button>
    `;
  }).join("");
  page.querySelectorAll(".story-card").forEach((card) => {
    card.addEventListener("click", () => {
      const cid = card.dataset.character;
      openChatForCharacter(cid);
      showToast(`开始和 ${CHARACTERS[cid].name} 的故事`);
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

  phoneLoginSubmit?.addEventListener("click", async () => {
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
    // 邮箱方式真接通后端, 手机号/Apple 还是 demo
    if (currentLoginMethod === "email" && identifier.includes("@")) {
      phoneLoginSubmit.disabled = true;
      phoneLoginSubmit.textContent = "登录中…";
      const result = await callAuth("login", identifier, secret);
      phoneLoginSubmit.disabled = false;
      phoneLoginSubmit.textContent = config.submitText || "继续登录";
      if (!result.ok) {
        showToast(result.message || "登录失败, 请重试");
        return;
      }
      setLoggedIn(true);
      const user = getCurrentUser();
      showToast(result.demo
        ? config.successText
        : `欢迎回来, ${user?.nickname || "朋友"}`);
      guardedEnter("home");
      return;
    }
    // 其他方式: 沿用 demo 模式
    setLoggedIn(true);
    showToast(config.successText);
    guardedEnter("home");
  });
}

function initHomeActions() {
  voiceToggleBtn?.addEventListener("click", () => showToast("语音能力已预留, 稍后接入"));
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
    showToast(favorited ? "已加入收藏" : "已取消收藏");
  });

  // 滑动切换角色 (左右 swipe)
  if (homeHeroStageEl) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchActive = false;
    homeHeroStageEl.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchActive = true;
    }, { passive: true });
    homeHeroStageEl.addEventListener("touchend", (e) => {
      if (!touchActive) return;
      touchActive = false;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        const ids = Object.keys(CHARACTERS);
        const idx = ids.indexOf(currentCharacterId);
        const next = dx < 0
          ? ids[(idx + 1) % ids.length]
          : ids[(idx - 1 + ids.length) % ids.length];
        saveCharacterId(next);
        renderCurrentCharacter();
        showToast(`${dx < 0 ? "→" : "←"} ${CHARACTERS[next].name}`);
      }
    }, { passive: true });
  }
}

function initCreateActions() {
  saveCharacterBtn?.addEventListener("click", saveDraftCharacter);

  tagButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const wasActive = btn.classList.contains("active");
      btn.classList.toggle("active");
      const selected = tagButtons.filter((t) => t.classList.contains("active")).length;
      showToast(wasActive ? `已取消 "${btn.dataset.tag}"` : `已选择 "${btn.dataset.tag}" (${selected}/3)`);
    });
  });

  templateButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      templateButtons.forEach((t) => t.classList.remove("active"));
      btn.classList.add("active");
      if (characterIdeaEl) {
        characterIdeaEl.value = `我想创建一个"${btn.dataset.template}"类型的角色, 气质偏${btn.dataset.template}, 会陪我聊天, 也能在我情绪低落时用它独特的方式安慰我.`;
      }
      showToast(`已带入模板: ${btn.dataset.template}`);
    });
  });

  // AI 助手真的生成一段描述
  const aiAssistBtn = document.querySelector(".ai-assist-btn");
  if (aiAssistBtn) {
    aiAssistBtn.removeAttribute("data-demo");
    const ideas = [
      "一个白天在图书馆兼职的古典文学研究生, 冷面但内心很会照顾人, 会在深夜给你念几句诗.",
      "气质安静的咖啡师, 话不多但听得很认真, 能从你点的咖啡看出你今天心情怎么样.",
      "音乐人, 白天写曲, 深夜会写信给不认识的人, 文字偏私密, 适合深度聊天.",
      "独立书店老板, 会给你推荐书单, 也会陪你讨论人生里那些想不通的事.",
      "穿白衬衫的建筑师, 沉稳克制, 擅长把复杂的问题拆成三步让你一步步走.",
    ];
    let ideaIdx = 0;
    aiAssistBtn.addEventListener("click", () => {
      if (!characterIdeaEl) return;
      characterIdeaEl.value = ideas[ideaIdx % ideas.length];
      ideaIdx++;
      characterIdeaEl.focus();
      showToast("AI 已为你生成灵感");
    });
  }

  subtabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      subtabBtns.forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      const key = btn.dataset.subtab || "role";
      document.querySelectorAll(".subtab-panel").forEach((p) => {
        const match = p.dataset.panel === key;
        p.classList.toggle("active", match);
        if (match) p.removeAttribute("hidden");
        else p.setAttribute("hidden", "");
      });
      showToast(`已切换到 "${btn.textContent.trim()}" 模块`);
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
      const count = document.querySelectorAll("#discover-grid .discover-card").length;
      showToast(`筛选: ${currentFilter} · ${count} 位角色`);
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

const INBOX_DATA = {
  chat: [
    { cid: "liu", title: "柳慕然", sub: "昨晚 23:10 · 继续聊“今天很累”那条对话" },
    { cid: "jiang", title: "江策", sub: "今天 09:26 · 他问你最近睡眠怎么样" },
    { cid: "gu", title: "顾沉舟", sub: "昨天 14:02 · “要不要给你讲个冷笑话”" },
  ],
  likes: [
    { cid: "su", title: "苏棠", sub: "你收藏了这位角色 · 3 天前" },
    { cid: "liu", title: "柳慕然", sub: "你收藏了这位角色 · 1 周前" },
  ],
  notice: [
    { cid: "sys", title: "欢迎来到撩咖", sub: "主人专享 · 所有角色免费对话, 尽情探索." },
    { cid: "sys", title: "角色 “柳慕然” 更新", sub: "新增深夜模式 · 回复更温柔" },
    { cid: "sys", title: "系统提醒", sub: "可以把自己的角色发布到市场, 让更多人陪伴你." },
  ],
};
let currentSegment = "chat";

function renderInbox() {
  const list = document.getElementById("inbox-list");
  if (!list) return;
  const items = INBOX_DATA[currentSegment] || [];
  if (!items.length) {
    list.innerHTML = `<div class="empty-state">这里空荡荡的, 去发现页找一位角色聊聊吧.</div>`;
    return;
  }
  list.innerHTML = items.map((it) => {
    const char = CHARACTERS[it.cid];
    const avatar = char
      ? `<img class="list-avatar" src="${char.avatar}" alt="${char.name}" />`
      : `<div class="list-avatar sys-avatar"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>`;
    return `
      <button class="list-item" data-character="${it.cid}">
        ${avatar}
        <div class="list-info">
          <strong>${it.title}</strong>
          <p>${it.sub}</p>
        </div>
        <span class="list-arrow">›</span>
      </button>
    `;
  }).join("");

  list.querySelectorAll(".list-item").forEach((item) => {
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

function initInboxActions() {
  segmentBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      segmentBtns.forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      currentSegment = btn.dataset.segment || "chat";
      renderInbox();
      const count = INBOX_DATA[currentSegment]?.length || 0;
      showToast(`${btn.textContent.trim()} · 共 ${count} 条`);
    });
  });
  renderInbox();
}

function initProfileActions() {
  logoutBtn?.addEventListener("click", () => {
    setLoggedIn(false);
    resetViewStateForLogout();
    showToast("已退出登录。");
    showView("auth");
  });
}

function showImagePreview(file, url) {
  // 移除已有的预览
  const existing = document.getElementById("image-preview");
  if (existing) existing.remove();

  const preview = document.createElement("div");
  preview.id = "image-preview";
  preview.innerHTML = `
    <img src="${url}" alt="预览" />
    <div class="preview-info">
      <strong>${file.name}</strong>
      <span>${(file.size / 1024).toFixed(0)} KB · 准备发送</span>
    </div>
    <button class="preview-cancel" type="button">×</button>
  `;
  document.body.appendChild(preview);
  preview.querySelector(".preview-cancel").addEventListener("click", () => {
    pendingImageUrl = null;
    preview.remove();
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

  // 图片上传按钮
  const imageBtn = document.getElementById("image-btn");
  const imageInput = document.getElementById("image-input");
  imageBtn?.addEventListener("click", () => imageInput?.click());
  imageInput?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    showToast("正在上传图片…");
    const url = await uploadImageFile(file);
    if (url) {
      pendingImageUrl = url;
      showImagePreview(file, url);
      showToast("图片已就绪, 点发送");
    }
    // 清空 input 让同一张图也能再上传
    imageInput.value = "";
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
initCharacterDetailActions();
initSettingsActions();
loadDraftCharacter();
renderCurrentCharacter();
renderDiscoverGrid();
renderStoriesPage();
autoResizeInput();
showView("auth");
