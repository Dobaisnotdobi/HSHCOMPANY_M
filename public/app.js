const STORAGE_KEYS = {
  liked: "naver-cafe-random-player-liked",
  disliked: "naver-cafe-random-player-disliked",
  theme: "naver-cafe-random-player-theme",
  backgroundImage: "naver-cafe-random-player-background-image",
  backgroundOpacity: "naver-cafe-random-player-background-opacity",
};

const ADMIN_PASSWORD = "4856";
const PLAYLIST_URL = new URL("./playlist.json", window.location.href);
const SITE_COPY_URL = new URL("./site-copy.json", window.location.href);
const YOUTUBE_IFRAME_API_SRC = "https://www.youtube.com/iframe_api";
const REFRESH_WORKFLOW_PATH = "refresh-playlist.yml";
const REFRESH_TOAST_TEXT = "[목록 갱신중>.O]";
const REFRESH_STATUS_IDLE_POLL_MS = 5 * 60 * 1000;
const REFRESH_STATUS_ACTIVE_POLL_MS = 20 * 1000;
const VISITOR_ID_KEY = "hshcompany-visitor-id";
const VISITOR_HEARTBEAT_MS = 30 * 1000;
const VISITOR_ACTIVE_WINDOW_MS = 90 * 1000;
const FIREBASE_SDK_VERSION = "10.12.5";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAcNezYijmT0eFxQYZXqnmkReUsQsVWitU",
  authDomain: "hshcompany.firebaseapp.com",
  projectId: "hshcompany",
  storageBucket: "hshcompany.firebasestorage.app",
  messagingSenderId: "251711506542",
  appId: "1:251711506542:web:0ef0c0285a7b3f01a43e7f",
  measurementId: "G-QW43HR4E9H",
};

const DEFAULT_HERO_COPY = {
  title: "한냉오풍 랜덤 플레이리스트",
  subtitle:
    "한세현 팬카페(한세현의 냉장고는 오늘도 풍족하다) 들어보세요 게시판의 추천곡(유튜브링크)을 랜덤재생하는 플레이어입니다 / 좋아요: 리스트 갱신되어도 플레이리스트에 남음. 싫어요: 다시 재생되지 않음.",
  note: "좋아요/싫어요 체크 여부는 본인에게만 표기됩니다.",
};

const DEFAULT_REPO_INFO = {
  owner: "Dobaisnotdobi",
  repo: "HSHCOMPANY_M",
  branch: "master",
};

const COLOR_THEMES = {
  ember: {
    "--color-scheme": "light",
    "--panel": "rgba(255, 252, 245, 0.94)",
    "--panel-strong": "#fffdf7",
    "--line": "rgba(64, 45, 18, 0.14)",
    "--text": "#2d2114",
    "--muted": "#7d6a54",
    "--note": "#5f4d39",
    "--accent": "#ca4f21",
    "--accent-strong": "#a63b14",
    "--chip": "#ece1cf",
    "--control-bg": "rgba(255, 255, 255, 0.64)",
    "--field-bg": "rgba(255, 255, 255, 0.92)",
    "--source-bg": "rgba(202, 79, 33, 0.06)",
    "--source-border": "rgba(202, 79, 33, 0.35)",
    "--toast-bg": "rgba(255, 253, 247, 0.94)",
    "--empty-bg": "rgba(255, 255, 255, 0.52)",
    "--shadow": "0 20px 60px rgba(72, 47, 14, 0.12)",
    "--glow-one": "rgba(202, 79, 33, 0.18)",
    "--glow-two": "rgba(65, 138, 102, 0.17)",
    "--surface-start": "#fbf8ef",
    "--surface-end": "#f1ecdf",
    "--player-start": "rgba(44, 31, 18, 0.92)",
    "--player-end": "rgba(83, 49, 19, 0.96)",
    "--player-base": "#2f2013",
  },
  forest: {
    "--color-scheme": "light",
    "--panel": "rgba(248, 252, 246, 0.94)",
    "--panel-strong": "#fbfff7",
    "--line": "rgba(29, 71, 49, 0.16)",
    "--text": "#18291e",
    "--muted": "#64715f",
    "--note": "#4f604b",
    "--accent": "#2f7d56",
    "--accent-strong": "#1f593d",
    "--chip": "#dfecd8",
    "--control-bg": "rgba(255, 255, 255, 0.64)",
    "--field-bg": "rgba(255, 255, 255, 0.92)",
    "--source-bg": "rgba(47, 125, 86, 0.08)",
    "--source-border": "rgba(47, 125, 86, 0.32)",
    "--toast-bg": "rgba(251, 255, 247, 0.94)",
    "--empty-bg": "rgba(255, 255, 255, 0.52)",
    "--shadow": "0 20px 60px rgba(28, 76, 43, 0.12)",
    "--glow-one": "rgba(47, 125, 86, 0.16)",
    "--glow-two": "rgba(209, 143, 52, 0.18)",
    "--surface-start": "#f7fbf1",
    "--surface-end": "#e9f1df",
    "--player-start": "rgba(18, 42, 30, 0.92)",
    "--player-end": "rgba(38, 78, 47, 0.96)",
    "--player-base": "#122a1e",
  },
  marine: {
    "--color-scheme": "light",
    "--panel": "rgba(246, 251, 253, 0.94)",
    "--panel-strong": "#fbfeff",
    "--line": "rgba(30, 90, 116, 0.16)",
    "--text": "#172935",
    "--muted": "#60717b",
    "--note": "#4d6673",
    "--accent": "#24769a",
    "--accent-strong": "#185774",
    "--chip": "#dcecf2",
    "--control-bg": "rgba(255, 255, 255, 0.64)",
    "--field-bg": "rgba(255, 255, 255, 0.92)",
    "--source-bg": "rgba(36, 118, 154, 0.08)",
    "--source-border": "rgba(36, 118, 154, 0.32)",
    "--toast-bg": "rgba(251, 254, 255, 0.94)",
    "--empty-bg": "rgba(255, 255, 255, 0.52)",
    "--shadow": "0 20px 60px rgba(26, 82, 112, 0.13)",
    "--glow-one": "rgba(36, 118, 154, 0.16)",
    "--glow-two": "rgba(212, 91, 91, 0.16)",
    "--surface-start": "#f3fbfd",
    "--surface-end": "#e3eef3",
    "--player-start": "rgba(16, 38, 52, 0.92)",
    "--player-end": "rgba(25, 76, 99, 0.96)",
    "--player-base": "#102634",
  },
  mono: {
    "--color-scheme": "light",
    "--panel": "rgba(250, 250, 248, 0.94)",
    "--panel-strong": "#ffffff",
    "--line": "rgba(45, 55, 72, 0.14)",
    "--text": "#202633",
    "--muted": "#6b7280",
    "--note": "#525b69",
    "--accent": "#4a5568",
    "--accent-strong": "#2d3748",
    "--chip": "#e7e9ed",
    "--control-bg": "rgba(255, 255, 255, 0.64)",
    "--field-bg": "rgba(255, 255, 255, 0.92)",
    "--source-bg": "rgba(74, 85, 104, 0.08)",
    "--source-border": "rgba(74, 85, 104, 0.3)",
    "--toast-bg": "rgba(255, 255, 255, 0.94)",
    "--empty-bg": "rgba(255, 255, 255, 0.52)",
    "--shadow": "0 20px 60px rgba(31, 41, 55, 0.12)",
    "--glow-one": "rgba(74, 85, 104, 0.13)",
    "--glow-two": "rgba(183, 121, 31, 0.15)",
    "--surface-start": "#fafafa",
    "--surface-end": "#eceff3",
    "--player-start": "rgba(26, 32, 44, 0.92)",
    "--player-end": "rgba(74, 85, 104, 0.96)",
    "--player-base": "#1a202c",
  },
  midnight: {
    "--color-scheme": "dark",
    "--panel": "rgba(13, 18, 33, 0.94)",
    "--panel-strong": "#10172a",
    "--line": "rgba(167, 199, 255, 0.2)",
    "--text": "#edf4ff",
    "--muted": "#a7b7d6",
    "--note": "#c6d5ee",
    "--accent": "#6ea8ff",
    "--accent-strong": "#b9d7ff",
    "--chip": "#1f2b48",
    "--control-bg": "rgba(196, 218, 255, 0.1)",
    "--field-bg": "rgba(221, 235, 255, 0.12)",
    "--source-bg": "rgba(110, 168, 255, 0.11)",
    "--source-border": "rgba(110, 168, 255, 0.36)",
    "--toast-bg": "rgba(16, 23, 42, 0.94)",
    "--empty-bg": "rgba(196, 218, 255, 0.08)",
    "--shadow": "0 20px 60px rgba(2, 6, 18, 0.42)",
    "--glow-one": "rgba(110, 168, 255, 0.2)",
    "--glow-two": "rgba(130, 92, 255, 0.16)",
    "--surface-start": "#070b15",
    "--surface-end": "#111b32",
    "--player-start": "rgba(5, 8, 16, 0.96)",
    "--player-end": "rgba(13, 21, 39, 0.98)",
    "--player-base": "#050812",
  },
  neon: {
    "--color-scheme": "dark",
    "--panel": "rgba(10, 24, 24, 0.94)",
    "--panel-strong": "#0d1f1f",
    "--line": "rgba(91, 255, 220, 0.2)",
    "--text": "#ecfffb",
    "--muted": "#9ed4ca",
    "--note": "#c1fff2",
    "--accent": "#2de2c5",
    "--accent-strong": "#a5fff1",
    "--chip": "#123d3b",
    "--control-bg": "rgba(146, 255, 231, 0.09)",
    "--field-bg": "rgba(188, 255, 241, 0.11)",
    "--source-bg": "rgba(45, 226, 197, 0.11)",
    "--source-border": "rgba(45, 226, 197, 0.36)",
    "--toast-bg": "rgba(13, 31, 31, 0.94)",
    "--empty-bg": "rgba(146, 255, 231, 0.08)",
    "--shadow": "0 20px 60px rgba(0, 12, 12, 0.42)",
    "--glow-one": "rgba(45, 226, 197, 0.2)",
    "--glow-two": "rgba(255, 71, 160, 0.13)",
    "--surface-start": "#061111",
    "--surface-end": "#0b2726",
    "--player-start": "rgba(3, 11, 11, 0.96)",
    "--player-end": "rgba(10, 38, 37, 0.98)",
    "--player-base": "#030b0b",
  },
  abyss: {
    "--color-scheme": "dark",
    "--panel": "rgba(8, 23, 35, 0.94)",
    "--panel-strong": "#0a1d2c",
    "--line": "rgba(124, 223, 255, 0.2)",
    "--text": "#eafaff",
    "--muted": "#9fc7d7",
    "--note": "#c6edf8",
    "--accent": "#38bdf8",
    "--accent-strong": "#b7eeff",
    "--chip": "#143a50",
    "--control-bg": "rgba(173, 232, 255, 0.09)",
    "--field-bg": "rgba(210, 243, 255, 0.11)",
    "--source-bg": "rgba(56, 189, 248, 0.11)",
    "--source-border": "rgba(56, 189, 248, 0.36)",
    "--toast-bg": "rgba(10, 29, 44, 0.94)",
    "--empty-bg": "rgba(173, 232, 255, 0.08)",
    "--shadow": "0 20px 60px rgba(0, 10, 18, 0.42)",
    "--glow-one": "rgba(56, 189, 248, 0.2)",
    "--glow-two": "rgba(34, 197, 94, 0.12)",
    "--surface-start": "#04101a",
    "--surface-end": "#082437",
    "--player-start": "rgba(3, 9, 14, 0.96)",
    "--player-end": "rgba(9, 32, 49, 0.98)",
    "--player-base": "#03090e",
  },
  amethyst: {
    "--color-scheme": "dark",
    "--panel": "rgba(29, 18, 44, 0.94)",
    "--panel-strong": "#211431",
    "--line": "rgba(226, 190, 255, 0.2)",
    "--text": "#fbf2ff",
    "--muted": "#ceb6df",
    "--note": "#ecd7f8",
    "--accent": "#c084fc",
    "--accent-strong": "#edd4ff",
    "--chip": "#3e2758",
    "--control-bg": "rgba(240, 215, 255, 0.09)",
    "--field-bg": "rgba(248, 230, 255, 0.11)",
    "--source-bg": "rgba(192, 132, 252, 0.11)",
    "--source-border": "rgba(192, 132, 252, 0.36)",
    "--toast-bg": "rgba(33, 20, 49, 0.94)",
    "--empty-bg": "rgba(240, 215, 255, 0.08)",
    "--shadow": "0 20px 60px rgba(10, 4, 18, 0.42)",
    "--glow-one": "rgba(192, 132, 252, 0.2)",
    "--glow-two": "rgba(248, 113, 113, 0.12)",
    "--surface-start": "#130a1f",
    "--surface-end": "#29183d",
    "--player-start": "rgba(9, 4, 15, 0.96)",
    "--player-end": "rgba(34, 19, 51, 0.98)",
    "--player-base": "#09040f",
  },
};

const dom = {
  settingsButton: document.getElementById("settingsButton"),
  randomButton: document.getElementById("randomButton"),
  likeButton: document.getElementById("likeButton"),
  dislikeButton: document.getElementById("dislikeButton"),
  currentTitle: document.getElementById("currentTitle"),
  currentVideo: document.getElementById("currentVideo"),
  sourceLink: document.getElementById("sourceLink"),
  statusText: document.getElementById("statusText"),
  playlistCount: document.getElementById("playlistCount"),
  eligibleCount: document.getElementById("eligibleCount"),
  likedCount: document.getElementById("likedCount"),
  dislikedCount: document.getElementById("dislikedCount"),
  playlistList: document.getElementById("playlistList"),
  playerMount: document.getElementById("playerMount"),
  playerPlaceholder: document.getElementById("playerPlaceholder"),
  filterAll: document.getElementById("filterAll"),
  filterLiked: document.getElementById("filterLiked"),
  filterDisliked: document.getElementById("filterDisliked"),
  filterAvailable: document.getElementById("filterAvailable"),
  heroTitle: document.getElementById("heroTitle"),
  heroSubtitle: document.getElementById("heroSubtitle"),
  heroNote: document.getElementById("heroNote"),
  adminEditor: document.getElementById("adminEditor"),
  adminBackdrop: document.getElementById("adminBackdrop"),
  adminCloseButton: document.getElementById("adminCloseButton"),
  adminSaveButton: document.getElementById("adminSaveButton"),
  adminResetButton: document.getElementById("adminResetButton"),
  editorHeroTitle: document.getElementById("editorHeroTitle"),
  editorHeroSubtitle: document.getElementById("editorHeroSubtitle"),
  editorHeroNote: document.getElementById("editorHeroNote"),
  activeVisitorCount: document.getElementById("activeVisitorCount"),
  totalVisitorCount: document.getElementById("totalVisitorCount"),
  visitorStatsStatus: document.getElementById("visitorStatsStatus"),
  visitorStatsSyncedAt: document.getElementById("visitorStatsSyncedAt"),
  settingsEditor: document.getElementById("settingsEditor"),
  settingsBackdrop: document.getElementById("settingsBackdrop"),
  settingsCloseButton: document.getElementById("settingsCloseButton"),
  themeOptions: document.getElementById("themeOptions"),
  backgroundImageInput: document.getElementById("backgroundImageInput"),
  clearBackgroundButton: document.getElementById("clearBackgroundButton"),
  backgroundPreview: document.getElementById("backgroundPreview"),
  backgroundOpacityInput: document.getElementById("backgroundOpacityInput"),
  backgroundOpacityValue: document.getElementById("backgroundOpacityValue"),
  refreshToast: document.getElementById("refreshToast"),
};

const state = {
  items: [],
  currentKey: null,
  filter: "all",
  playerReady: false,
  playerMode: "idle",
  pendingVideoId: null,
  heroCopy: { ...DEFAULT_HERO_COPY },
  refreshPreviewVisible: false,
  workflowRefreshing: false,
  visitorStats: {
    activeVisitors: null,
    totalVisitors: null,
    status: "연결 전",
    syncedAt: null,
  },
  settings: {
    theme: "ember",
    backgroundImage: "",
    backgroundOpacity: 0.25,
  },
};

let player = null;
let playerApiPromise = null;
let refreshStatusTimer = 0;
let visitorStatsTimer = 0;
let visitorStatsRuntime = null;

function loadSet(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveSet(key, values) {
  localStorage.setItem(key, JSON.stringify([...values]));
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return min;
  }

  return Math.min(max, Math.max(min, number));
}

function loadUserSettings() {
  const theme = localStorage.getItem(STORAGE_KEYS.theme) || "ember";
  const backgroundImage = localStorage.getItem(STORAGE_KEYS.backgroundImage) || "";
  const backgroundOpacity = clampNumber(localStorage.getItem(STORAGE_KEYS.backgroundOpacity) || 0.25, 0, 0.75);

  state.settings = {
    theme: COLOR_THEMES[theme] ? theme : "ember",
    backgroundImage,
    backgroundOpacity,
  };
}

function saveUserSettings() {
  localStorage.setItem(STORAGE_KEYS.theme, state.settings.theme);
  localStorage.setItem(STORAGE_KEYS.backgroundOpacity, String(state.settings.backgroundOpacity));

  if (state.settings.backgroundImage) {
    localStorage.setItem(STORAGE_KEYS.backgroundImage, state.settings.backgroundImage);
  } else {
    localStorage.removeItem(STORAGE_KEYS.backgroundImage);
  }
}

function cssUrl(value) {
  if (!value) {
    return "none";
  }

  return `url("${String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"')}")`;
}

function applyUserSettings() {
  const theme = COLOR_THEMES[state.settings.theme] || COLOR_THEMES.ember;
  for (const [key, value] of Object.entries(theme)) {
    document.documentElement.style.setProperty(key, value);
  }

  document.documentElement.style.setProperty("--user-bg-image", cssUrl(state.settings.backgroundImage));
  document.documentElement.style.setProperty("--user-bg-opacity", String(state.settings.backgroundOpacity));
  renderSettingsControls();
}

function renderSettingsControls() {
  if (!dom.themeOptions) {
    return;
  }

  dom.themeOptions.querySelectorAll("[data-theme]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.theme === state.settings.theme);
  });

  dom.backgroundOpacityInput.value = String(state.settings.backgroundOpacity);
  dom.backgroundOpacityValue.textContent = `${Math.round(state.settings.backgroundOpacity * 100)}%`;
  dom.backgroundPreview.classList.toggle("has-image", Boolean(state.settings.backgroundImage));
}

function persistAndApplySettings() {
  try {
    saveUserSettings();
    applyUserSettings();
  } catch {
    setStatus("설정을 저장하지 못했습니다. 이미지 용량을 줄여 다시 시도해 주세요.");
  }
}

function openSettingsEditor() {
  renderSettingsControls();
  dom.settingsEditor.hidden = false;
}

function closeSettingsEditor() {
  dom.settingsEditor.hidden = true;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () => reject(reader.error || new Error("이미지를 읽지 못했습니다.")));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("이미지를 불러오지 못했습니다.")));
    image.src = src;
  });
}

async function prepareBackgroundImage(file) {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 첨부할 수 있습니다.");
  }

  const original = await readFileAsDataUrl(file);
  if (original.length < 1_800_000) {
    return original;
  }

  const image = await loadImage(original);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("이미지를 처리하지 못했습니다.");
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

const likedSet = loadSet(STORAGE_KEYS.liked);
const dislikedSet = loadSet(STORAGE_KEYS.disliked);

function setStatus(message) {
  dom.statusText.textContent = message;
}

function formatVisitorSyncedAt(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(value);
}

function renderVisitorStats() {
  if (!dom.activeVisitorCount || !dom.totalVisitorCount || !dom.visitorStatsStatus || !dom.visitorStatsSyncedAt) {
    return;
  }

  const { activeVisitors, totalVisitors, status, syncedAt } = state.visitorStats;
  dom.activeVisitorCount.textContent = Number.isFinite(activeVisitors) ? String(activeVisitors) : "-";
  dom.totalVisitorCount.textContent = Number.isFinite(totalVisitors) ? String(totalVisitors) : "-";
  dom.visitorStatsStatus.textContent = status;
  dom.visitorStatsSyncedAt.textContent = formatVisitorSyncedAt(syncedAt);
}

function setVisitorStatsStatus(status) {
  state.visitorStats.status = status;
  state.visitorStats.syncedAt = new Date();
  renderVisitorStats();
}

function describeVisitorStatsError(error) {
  const code = error?.code || "";
  const message = error?.message || "";

  if (code === "permission-denied") {
    return "통계 권한 확인 필요";
  }

  if (code === "failed-precondition" || code === "not-found") {
    return "Firestore 설정 필요";
  }

  if (code === "unavailable") {
    return "통계 연결 지연";
  }

  if (message.includes("dynamically imported module")) {
    return "Firebase SDK 연결 실패";
  }

  return "Firebase 설정 필요";
}

function createVisitorId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getVisitorId() {
  const existing = localStorage.getItem(VISITOR_ID_KEY);
  if (existing) {
    return existing;
  }

  const nextVisitorId = createVisitorId();
  localStorage.setItem(VISITOR_ID_KEY, nextVisitorId);
  return nextVisitorId;
}

async function loadFirebaseModules() {
  const baseUrl = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}`;
  const [appModule, analyticsModule, firestoreModule] = await Promise.all([
    import(`${baseUrl}/firebase-app.js`),
    import(`${baseUrl}/firebase-analytics.js`),
    import(`${baseUrl}/firebase-firestore.js`),
  ]);

  return {
    initializeApp: appModule.initializeApp,
    getAnalytics: analyticsModule.getAnalytics,
    isAnalyticsSupported: analyticsModule.isSupported,
    getFirestore: firestoreModule.getFirestore,
    collection: firestoreModule.collection,
    doc: firestoreModule.doc,
    getDoc: firestoreModule.getDoc,
    setDoc: firestoreModule.setDoc,
    serverTimestamp: firestoreModule.serverTimestamp,
    increment: firestoreModule.increment,
    query: firestoreModule.query,
    where: firestoreModule.where,
    onSnapshot: firestoreModule.onSnapshot,
  };
}

async function initFirebaseAnalytics(app, firebase) {
  try {
    if (await firebase.isAnalyticsSupported()) {
      firebase.getAnalytics(app);
    }
  } catch {
    // Analytics is optional; visitor counters use Firestore below.
  }
}

function subscribeTotalVisitorCount(firebase, db) {
  const statsRef = firebase.doc(db, "siteStats", "global");
  return firebase.onSnapshot(
    statsRef,
    (snapshot) => {
      const value = snapshot.data()?.totalVisitors;
      state.visitorStats.totalVisitors = Number.isFinite(value) ? value : 0;
      state.visitorStats.status = "연결됨";
      state.visitorStats.syncedAt = new Date();
      renderVisitorStats();
    },
    (error) => {
      setVisitorStatsStatus(describeVisitorStatsError(error));
    },
  );
}

function subscribeActiveVisitorCount(firebase, db) {
  if (visitorStatsRuntime?.activeUnsubscribe) {
    visitorStatsRuntime.activeUnsubscribe();
  }

  const activeSince = Date.now() - VISITOR_ACTIVE_WINDOW_MS;
  const visitorsQuery = firebase.query(
    firebase.collection(db, "visitorPresence"),
    firebase.where("lastSeenMs", ">=", activeSince),
  );

  visitorStatsRuntime.activeUnsubscribe = firebase.onSnapshot(
    visitorsQuery,
    (snapshot) => {
      state.visitorStats.activeVisitors = snapshot.size;
      state.visitorStats.status = "연결됨";
      state.visitorStats.syncedAt = new Date();
      renderVisitorStats();
    },
    (error) => {
      setVisitorStatsStatus(describeVisitorStatsError(error));
    },
  );
}

async function writeVisitorHeartbeat(firebase, db, visitorRef) {
  const now = Date.now();
  await firebase.setDoc(
    visitorRef,
    {
      lastSeen: firebase.serverTimestamp(),
      lastSeenMs: now,
      path: window.location.pathname,
    },
    { merge: true },
  );
}

async function initVisitorStats() {
  renderVisitorStats();

  try {
    const firebase = await loadFirebaseModules();
    const app = firebase.initializeApp(FIREBASE_CONFIG);
    initFirebaseAnalytics(app, firebase);

    const db = firebase.getFirestore(app);
    const visitorId = getVisitorId();
    const visitorRef = firebase.doc(db, "visitorPresence", visitorId);
    const statsRef = firebase.doc(db, "siteStats", "global");
    const visitorSnapshot = await firebase.getDoc(visitorRef);

    await firebase.setDoc(
      visitorRef,
      {
        createdAt: visitorSnapshot.exists()
          ? visitorSnapshot.data()?.createdAt || firebase.serverTimestamp()
          : firebase.serverTimestamp(),
        firstPath: visitorSnapshot.exists()
          ? visitorSnapshot.data()?.firstPath || window.location.pathname
          : window.location.pathname,
        lastSeen: firebase.serverTimestamp(),
        lastSeenMs: Date.now(),
        path: window.location.pathname,
      },
      { merge: true },
    );

    if (!visitorSnapshot.exists()) {
      await firebase.setDoc(
        statsRef,
        {
          totalVisitors: firebase.increment(1),
          updatedAt: firebase.serverTimestamp(),
        },
        { merge: true },
      );
    }

    visitorStatsRuntime = {
      firebase,
      db,
      visitorRef,
      activeUnsubscribe: null,
      totalUnsubscribe: subscribeTotalVisitorCount(firebase, db),
    };

    subscribeActiveVisitorCount(firebase, db);
    setVisitorStatsStatus("연결됨");

    visitorStatsTimer = window.setInterval(async () => {
      try {
        await writeVisitorHeartbeat(firebase, db, visitorRef);
        subscribeActiveVisitorCount(firebase, db);
      } catch {
        setVisitorStatsStatus("통계 갱신 지연");
      }
    }, VISITOR_HEARTBEAT_MS);
  } catch (error) {
    setVisitorStatsStatus(describeVisitorStatsError(error));
  }
}

function updateRefreshToast() {
  const shouldShow = state.refreshPreviewVisible || state.workflowRefreshing;
  dom.refreshToast.textContent = REFRESH_TOAST_TEXT;
  dom.refreshToast.hidden = !shouldShow;
  dom.refreshToast.classList.toggle("is-visible", shouldShow);
}

function setRefreshPreviewVisible(visible) {
  state.refreshPreviewVisible = visible;
  updateRefreshToast();
}

function clearRefreshPreview() {
  setRefreshPreviewVisible(false);
}

function showPlayerPlaceholder(message) {
  dom.playerPlaceholder.style.display = "grid";
  dom.playerPlaceholder.textContent = message;
}

function hidePlayerPlaceholder() {
  dom.playerPlaceholder.style.display = "none";
}

function getPlayerElement() {
  return document.getElementById("player");
}

function resetPlayerMount() {
  dom.playerMount.innerHTML = '<div id="player"></div>';
}

function createEmbedUrl(videoId, autoplay = false) {
  const url = new URL(`https://www.youtube.com/embed/${videoId}`);
  url.searchParams.set("rel", "0");
  url.searchParams.set("modestbranding", "1");
  if (autoplay) {
    url.searchParams.set("autoplay", "1");
  }
  return url.toString();
}

function mountFallbackPlayer(item) {
  if (!item) {
    return;
  }

  state.playerMode = "fallback";
  state.playerReady = true;
  state.pendingVideoId = null;
  player = null;

  const iframe = document.createElement("iframe");
  iframe.id = "player";
  iframe.src = createEmbedUrl(item.videoId, true);
  iframe.title = item.articleTitle || "YouTube video player";
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("allowfullscreen", "");
  iframe.setAttribute(
    "allow",
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
  );
  iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");

  dom.playerMount.replaceChildren(iframe);
  hidePlayerPlaceholder();
}

function updateFallbackPlayer(item) {
  const frame = getPlayerElement();
  if (!item || !frame || frame.tagName !== "IFRAME") {
    return false;
  }

  frame.src = createEmbedUrl(item.videoId, true);
  frame.title = item.articleTitle || "YouTube video player";
  state.pendingVideoId = null;
  hidePlayerPlaceholder();
  return true;
}

function describePlayerError(code) {
  if (code === 2) {
    return "유튜브 영상 주소가 올바르지 않습니다.";
  }

  if (code === 5) {
    return "브라우저가 이 유튜브 영상 재생을 완료하지 못했습니다.";
  }

  if (code === 100) {
    return "유튜브에서 이 영상을 찾을 수 없습니다.";
  }

  if (code === 101 || code === 150) {
    return "유튜브 정책상 이 영상은 임베드 재생이 제한됩니다.";
  }

  return `유튜브 플레이어 오류가 발생했습니다. (${code})`;
}

function ensureYouTubePlayer() {
  if (state.playerMode === "fallback") {
    return Promise.reject(new Error("fallback-active"));
  }

  if (player && state.playerReady && state.playerMode === "api") {
    return Promise.resolve(player);
  }

  if (playerApiPromise) {
    return playerApiPromise;
  }

  resetPlayerMount();
  state.playerReady = false;
  state.playerMode = "loading";

  playerApiPromise = new Promise((resolve, reject) => {
    let settled = false;
    let timeoutId = 0;

    const finishResolve = () => {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timeoutId);
      resolve(player);
    };

    const finishReject = (error) => {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timeoutId);
      reject(error);
    };

    const buildPlayer = () => {
      if (!window.YT || typeof window.YT.Player !== "function") {
        finishReject(new Error("유튜브 플레이어를 초기화하지 못했습니다."));
        return;
      }

      player = new window.YT.Player("player", {
        videoId: "",
        playerVars: {
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            state.playerReady = true;
            state.playerMode = "api";
            hidePlayerPlaceholder();
            if (state.pendingVideoId) {
              player.loadVideoById(state.pendingVideoId);
              state.pendingVideoId = null;
            }
            finishResolve();
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              playRandom();
            }
          },
          onError: (event) => {
            setStatus(describePlayerError(event.data));
          },
        },
      });
    };

    if (window.YT && typeof window.YT.Player === "function") {
      buildPlayer();
      timeoutId = window.setTimeout(() => {
        finishReject(new Error("유튜브 플레이어 준비 시간이 초과되었습니다."));
      }, 8000);
      return;
    }

    const previousCallback = window.onYouTubeIframeAPIReady;
    const script = document.createElement("script");
    script.src = YOUTUBE_IFRAME_API_SRC;
    script.async = true;
    script.onerror = () => {
      finishReject(new Error("유튜브 플레이어 스크립트를 불러오지 못했습니다."));
    };

    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousCallback === "function") {
        previousCallback();
      }
      buildPlayer();
    };

    timeoutId = window.setTimeout(() => {
      finishReject(new Error("유튜브 플레이어 연결이 지연되고 있습니다."));
    }, 8000);

    document.head.appendChild(script);
  }).catch((error) => {
    playerApiPromise = null;
    state.playerReady = false;
    if (state.playerMode !== "fallback") {
      state.playerMode = "idle";
    }
    throw error;
  });

  return playerApiPromise;
}

function formatGeneratedAt(value) {
  if (!value) {
    return "시간 정보 없음";
  }

  try {
    return new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function updateCounts() {
  const eligible = state.items.filter((item) => !dislikedSet.has(item.key));
  dom.playlistCount.textContent = String(state.items.length);
  dom.eligibleCount.textContent = String(eligible.length);
  dom.likedCount.textContent = String(state.items.filter((item) => likedSet.has(item.key)).length);
  dom.dislikedCount.textContent = String(state.items.filter((item) => dislikedSet.has(item.key)).length);
}

function currentItem() {
  return state.items.find((item) => item.key === state.currentKey) || null;
}

function filterItems(items) {
  if (state.filter === "liked") {
    return items.filter((item) => likedSet.has(item.key));
  }

  if (state.filter === "disliked") {
    return items.filter((item) => dislikedSet.has(item.key));
  }

  if (state.filter === "available") {
    return items.filter((item) => !dislikedSet.has(item.key));
  }

  return items;
}

function syncPreferenceButtons() {
  const item = currentItem();
  const liked = item ? likedSet.has(item.key) : false;
  const disliked = item ? dislikedSet.has(item.key) : false;

  dom.likeButton.classList.toggle("is-active", liked);
  dom.dislikeButton.classList.toggle("is-negative", disliked);
}

function updateCurrentMeta() {
  const item = currentItem();

  if (!item) {
    dom.currentTitle.textContent = "대기 중";
    dom.currentVideo.textContent = "재생할 영상을 준비하고 있습니다.";
    dom.sourceLink.textContent = "아직 선택된 게시물이 없습니다.";
    dom.sourceLink.href = "#";
    syncPreferenceButtons();
    return;
  }

  dom.currentTitle.textContent = item.articleTitle || "제목 없음";
  dom.currentVideo.textContent = `${item.videoId} · ${item.writer || "작성자 정보 없음"}`;
  dom.sourceLink.textContent = item.sourceUrl;
  dom.sourceLink.href = item.sourceUrl;
  syncPreferenceButtons();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderPlaylist() {
  const items = filterItems(state.items);

  if (items.length === 0) {
    dom.playlistList.innerHTML = '<li class="empty-state">조건에 맞는 영상이 없습니다.</li>';
    return;
  }

  dom.playlistList.innerHTML = items
    .map((item) => {
      const pills = [];
      if (likedSet.has(item.key)) {
        pills.push('<span class="pill like">좋아요</span>');
      }
      if (dislikedSet.has(item.key)) {
        pills.push('<span class="pill dislike">싫어요</span>');
      }
      pills.push(
        `<span class="pill ${item.origin === "detail" ? "source-detail" : "source-summary"}">${
          item.origin === "detail" ? "본문 보강" : "요약 추출"
        }</span>`,
      );

      return `
        <li class="playlist-item ${state.currentKey === item.key ? "is-current" : ""} ${
          dislikedSet.has(item.key) ? "is-disliked" : ""
        }">
          <div class="playlist-item-header">
            <div>
              <h3 class="playlist-item-title">${escapeHtml(item.articleTitle)}</h3>
              <p class="playlist-item-subtitle">${escapeHtml(item.writer || "작성자 정보 없음")}</p>
              <p class="playlist-item-meta">${escapeHtml(item.watchUrl)}</p>
            </div>
          </div>
          <div class="playlist-pill-row">${pills.join("")}</div>
          <div class="playlist-item-actions">
            <button class="mini-button" type="button" data-action="play" data-key="${item.key}">재생</button>
            <button
              class="mini-button ${likedSet.has(item.key) ? "is-selected-like" : ""}"
              type="button"
              data-action="toggle-like"
              data-key="${item.key}"
            >
              ${likedSet.has(item.key) ? "좋아요 취소" : "좋아요"}
            </button>
            <button
              class="mini-button ${dislikedSet.has(item.key) ? "is-selected-dislike" : ""}"
              type="button"
              data-action="toggle-dislike"
              data-key="${item.key}"
            >
              ${dislikedSet.has(item.key) ? "싫어요 취소" : "싫어요"}
            </button>
            <a class="mini-button link" href="${item.sourceUrl}" target="_blank" rel="noreferrer noopener">원글 열기</a>
          </div>
        </li>
      `;
    })
    .join("");
}

function chooseRandomItem() {
  const eligible = state.items.filter((item) => !dislikedSet.has(item.key));
  if (eligible.length === 0) {
    return null;
  }

  const pool = eligible.length > 1 ? eligible.filter((item) => item.key !== state.currentKey) : eligible;
  const source = pool.length > 0 ? pool : eligible;
  return source[Math.floor(Math.random() * source.length)];
}

function playItem(item) {
  if (!item) {
    setStatus("재생 가능한 영상이 없습니다. 싫어요를 해제하거나 최신 목록을 다시 불러와 주세요.");
    return;
  }

  state.currentKey = item.key;
  updateCurrentMeta();
  renderPlaylist();
  state.pendingVideoId = item.videoId;

  if (state.playerMode === "fallback" && updateFallbackPlayer(item)) {
    return;
  }

  if (player && state.playerReady && state.playerMode === "api") {
    hidePlayerPlaceholder();
    player.loadVideoById(item.videoId);
    state.pendingVideoId = null;
  } else {
    showPlayerPlaceholder("유튜브 플레이어를 준비하는 중입니다.");
    ensureYouTubePlayer().catch(() => {
      if (state.currentKey !== item.key) {
        return;
      }

      mountFallbackPlayer(item);
      setStatus("유튜브 API 연결이 지연되거나 차단되어 웹 임베드 모드로 재생합니다. 자동 다음 곡은 일부 브라우저에서 제한될 수 있습니다.");
    });
  }
}

function playRandom() {
  playItem(chooseRandomItem());
}

function toggleLikeForItem(item) {
  if (!item) {
    return;
  }

  if (likedSet.has(item.key)) {
    likedSet.delete(item.key);
  } else {
    likedSet.add(item.key);
    dislikedSet.delete(item.key);
  }

  saveSet(STORAGE_KEYS.liked, likedSet);
  saveSet(STORAGE_KEYS.disliked, dislikedSet);
  updateCounts();
  updateCurrentMeta();
  renderPlaylist();
}

function toggleDislikeForItem(item) {
  if (!item) {
    return;
  }

  const willDislike = !dislikedSet.has(item.key);
  if (willDislike) {
    dislikedSet.add(item.key);
    likedSet.delete(item.key);
  } else {
    dislikedSet.delete(item.key);
  }

  saveSet(STORAGE_KEYS.liked, likedSet);
  saveSet(STORAGE_KEYS.disliked, dislikedSet);
  updateCounts();
  updateCurrentMeta();
  renderPlaylist();

  if (willDislike) {
    playRandom();
  }
}

function toggleLike() {
  toggleLikeForItem(currentItem());
}

function toggleDislike() {
  toggleDislikeForItem(currentItem());
}

function normalizeSiteCopy(value) {
  return {
    title: String(value?.title || DEFAULT_HERO_COPY.title),
    subtitle: String(value?.subtitle || DEFAULT_HERO_COPY.subtitle),
    note: String(value?.note || DEFAULT_HERO_COPY.note),
  };
}

function renderHeroCopy() {
  dom.heroTitle.textContent = state.heroCopy.title;
  dom.heroSubtitle.textContent = state.heroCopy.subtitle;
  dom.heroNote.textContent = state.heroCopy.note;
  document.title = state.heroCopy.title;
}

function openAdminEditor() {
  dom.editorHeroTitle.value = state.heroCopy.title;
  dom.editorHeroSubtitle.value = state.heroCopy.subtitle;
  dom.editorHeroNote.value = state.heroCopy.note;
  renderVisitorStats();
  dom.adminEditor.hidden = false;
}

function closeAdminEditor() {
  dom.adminEditor.hidden = true;
  clearRefreshPreview();
}

function fillDefaultAdminEditor() {
  dom.editorHeroTitle.value = DEFAULT_HERO_COPY.title;
  dom.editorHeroSubtitle.value = DEFAULT_HERO_COPY.subtitle;
  dom.editorHeroNote.value = DEFAULT_HERO_COPY.note;
  setStatus("기본 문구를 채웠습니다. 저장을 누르면 전체 반영됩니다.");
}

function getRepoInfo() {
  const host = window.location.hostname.toLowerCase();
  const pathParts = window.location.pathname.split("/").filter(Boolean);

  if (host.endsWith(".github.io")) {
    const owner = host.replace(/\.github\.io$/, "");
    const repo = pathParts[0] || `${owner}.github.io`;
    return {
      owner,
      repo,
      branch: DEFAULT_REPO_INFO.branch,
    };
  }

  return { ...DEFAULT_REPO_INFO };
}

function isEditorTextTarget(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.tagName === "TEXTAREA" ||
    target.tagName === "INPUT" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
}

function encodeBase64Unicode(value) {
  return window.btoa(unescape(encodeURIComponent(value)));
}

async function fetchSiteCopy() {
  try {
    const response = await fetch(SITE_COPY_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("site-copy.json not found");
    }

    const payload = await response.json();
    state.heroCopy = normalizeSiteCopy(payload);
  } catch {
    state.heroCopy = { ...DEFAULT_HERO_COPY };
  }

  renderHeroCopy();
}

async function fetchRefreshWorkflowStatus() {
  const repoInfo = getRepoInfo();
  const url = new URL(
    `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/actions/workflows/${encodeURIComponent(
      REFRESH_WORKFLOW_PATH,
    )}/runs`,
  );
  url.searchParams.set("per_page", "1");
  url.searchParams.set("branch", repoInfo.branch);
  url.searchParams.set("t", String(Date.now()));

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("갱신 상태를 확인하지 못했습니다.");
  }

  const payload = await response.json();
  const latestRun = payload?.workflow_runs?.[0];
  return Boolean(latestRun && latestRun.status && latestRun.status !== "completed");
}

async function saveSiteCopyGlobally(nextHeroCopy, token) {
  const repoInfo = getRepoInfo();
  const apiUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/public/site-copy.json`;
  const commonHeaders = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const metadataResponse = await fetch(`${apiUrl}?ref=${encodeURIComponent(repoInfo.branch)}`, {
    headers: commonHeaders,
  });

  if (!metadataResponse.ok) {
    throw new Error("site-copy.json 메타데이터를 읽지 못했습니다.");
  }

  const metadata = await metadataResponse.json();
  const content = `${JSON.stringify(nextHeroCopy, null, 2)}\n`;
  const saveResponse = await fetch(apiUrl, {
    method: "PUT",
    headers: commonHeaders,
    body: JSON.stringify({
      message: "Update site copy",
      content: encodeBase64Unicode(content),
      sha: metadata.sha,
      branch: repoInfo.branch,
    }),
  });

  if (!saveResponse.ok) {
    const errorPayload = await saveResponse.json().catch(() => null);
    const message = errorPayload?.message || "site-copy.json 저장에 실패했습니다.";
    throw new Error(message);
  }
}

async function saveAdminEditor() {
  const nextHeroCopy = normalizeSiteCopy({
    title: dom.editorHeroTitle.value.trim(),
    subtitle: dom.editorHeroSubtitle.value.trim(),
    note: dom.editorHeroNote.value.trim(),
  });

  const token = window.prompt(
    "GitHub Personal Access Token을 입력하세요. 이 토큰은 저장하지 않고, site-copy.json 전역 반영에만 사용됩니다.",
  );

  if (!token) {
    setStatus("전역 반영을 취소했습니다.");
    return;
  }

  try {
    dom.adminSaveButton.disabled = true;
    setStatus("상단 안내 문구를 전체 반영하는 중입니다.");
    await saveSiteCopyGlobally(nextHeroCopy, token.trim());
    state.heroCopy = nextHeroCopy;
    renderHeroCopy();
    closeAdminEditor();
    setStatus("전역 저장 완료. GitHub Pages가 다시 배포되면 모두에게 반영됩니다.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error));
  } finally {
    dom.adminSaveButton.disabled = false;
  }
}

async function fetchPlaylist({ bustCache = false } = {}) {
  const url = new URL(PLAYLIST_URL);
  if (bustCache) {
    url.searchParams.set("t", String(Date.now()));
  }

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("플레이리스트 파일을 불러오지 못했습니다.");
  }

  return response.json();
}

async function reloadPlaylistAfterRefresh() {
  try {
    setStatus("목록 갱신이 완료되어 최신 공개 목록을 다시 불러오는 중입니다.");
    const payload = await fetchPlaylist({ bustCache: true });
    applyPlaylistPayload(payload);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error));
  }
}

async function syncRefreshWorkflowStatus() {
  const wasRefreshing = state.workflowRefreshing;

  try {
    state.workflowRefreshing = await fetchRefreshWorkflowStatus();
  } catch {
    updateRefreshToast();
    return;
  }

  updateRefreshToast();

  if (wasRefreshing && !state.workflowRefreshing) {
    await reloadPlaylistAfterRefresh();
  }
}

function scheduleRefreshWorkflowStatusPoll(delay = null) {
  window.clearTimeout(refreshStatusTimer);
  const nextDelay = delay ?? (state.workflowRefreshing ? REFRESH_STATUS_ACTIVE_POLL_MS : REFRESH_STATUS_IDLE_POLL_MS);
  refreshStatusTimer = window.setTimeout(async () => {
    await syncRefreshWorkflowStatus();
    scheduleRefreshWorkflowStatusPoll();
  }, nextDelay);
}

function summarizePayload(payload) {
  const generatedAtText = formatGeneratedAt(payload.generatedAt);
  return `최신 공개 목록을 불러왔습니다. 영상 ${payload.items.length}개, 게시물 ${payload.sourceArticleCount}개, 생성 시각 ${generatedAtText}.`;
}

function applyPlaylistPayload(payload) {
  state.items = Array.isArray(payload.items) ? payload.items : [];
  updateCounts();
  renderPlaylist();

  const currentStillExists = state.items.some((item) => item.key === state.currentKey);
  if (!currentStillExists) {
    state.currentKey = null;
  }

  if (!state.currentKey && state.items.length > 0) {
    const likedItem = state.items.find((item) => likedSet.has(item.key) && !dislikedSet.has(item.key));
    playItem(likedItem || chooseRandomItem());
  } else {
    updateCurrentMeta();
  }

  if (state.items.length === 0) {
    setStatus("게시판에서 추출된 유튜브 영상이 아직 없습니다.");
    return;
  }

  setStatus(summarizePayload(payload));
}

function setFilter(nextFilter) {
  state.filter = nextFilter;
  dom.filterAll.classList.toggle("is-active", nextFilter === "all");
  dom.filterLiked.classList.toggle("is-active", nextFilter === "liked");
  dom.filterDisliked.classList.toggle("is-active", nextFilter === "disliked");
  dom.filterAvailable.classList.toggle("is-active", nextFilter === "available");
  renderPlaylist();
}

window.addEventListener("keydown", (event) => {
  if (
    !dom.adminEditor.hidden &&
    event.code === "Space" &&
    !event.repeat &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !isEditorTextTarget(event.target)
  ) {
    event.preventDefault();
    setRefreshPreviewVisible(!state.refreshPreviewVisible);
    return;
  }

  if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "p") {
    return;
  }

  event.preventDefault();
  const password = window.prompt("관리자 비밀번호를 입력하세요.");
  if (password !== ADMIN_PASSWORD) {
    setStatus("관리자 비밀번호가 일치하지 않습니다.");
    return;
  }

  openAdminEditor();
});

dom.randomButton.addEventListener("click", () => {
  playRandom();
});

dom.likeButton.addEventListener("click", toggleLike);
dom.dislikeButton.addEventListener("click", toggleDislike);

dom.filterAll.addEventListener("click", () => setFilter("all"));
dom.filterLiked.addEventListener("click", () => setFilter("liked"));
dom.filterDisliked.addEventListener("click", () => setFilter("disliked"));
dom.filterAvailable.addEventListener("click", () => setFilter("available"));

dom.playlistList.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) {
    return;
  }

  const item = state.items.find((candidate) => candidate.key === target.dataset.key);
  if (!item) {
    return;
  }

  if (target.dataset.action === "play") {
    playItem(item);
    return;
  }

  if (target.dataset.action === "toggle-like") {
    toggleLikeForItem(item);
    return;
  }

  if (target.dataset.action === "toggle-dislike") {
    toggleDislikeForItem(item);
  }
});

dom.adminCloseButton.addEventListener("click", closeAdminEditor);
dom.adminBackdrop.addEventListener("click", closeAdminEditor);
dom.adminSaveButton.addEventListener("click", saveAdminEditor);
dom.adminResetButton.addEventListener("click", fillDefaultAdminEditor);
dom.settingsButton.addEventListener("click", openSettingsEditor);
dom.settingsCloseButton.addEventListener("click", closeSettingsEditor);
dom.settingsBackdrop.addEventListener("click", closeSettingsEditor);
dom.themeOptions.addEventListener("click", (event) => {
  const target = event.target.closest("[data-theme]");
  if (!target || !COLOR_THEMES[target.dataset.theme]) {
    return;
  }

  state.settings.theme = target.dataset.theme;
  persistAndApplySettings();
});
dom.backgroundImageInput.addEventListener("change", async () => {
  const file = dom.backgroundImageInput.files?.[0];
  if (!file) {
    return;
  }

  try {
    setStatus("배경 이미지를 적용하는 중입니다.");
    state.settings.backgroundImage = await prepareBackgroundImage(file);
    persistAndApplySettings();
    setStatus("배경 이미지를 적용했습니다.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error));
  } finally {
    dom.backgroundImageInput.value = "";
  }
});
dom.clearBackgroundButton.addEventListener("click", () => {
  state.settings.backgroundImage = "";
  persistAndApplySettings();
});
dom.backgroundOpacityInput.addEventListener("input", () => {
  state.settings.backgroundOpacity = clampNumber(dom.backgroundOpacityInput.value, 0, 0.75);
  persistAndApplySettings();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    return;
  }

  syncRefreshWorkflowStatus();
  scheduleRefreshWorkflowStatusPoll();
});

async function boot() {
  loadUserSettings();
  applyUserSettings();
  initVisitorStats();
  await fetchSiteCopy();
  showPlayerPlaceholder("유튜브 플레이어를 준비하는 중입니다.");
  updateRefreshToast();

  try {
    setStatus("공개 플레이리스트를 불러오는 중입니다.");
    const payload = await fetchPlaylist();
    applyPlaylistPayload(payload);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error));
  }

  ensureYouTubePlayer().catch(() => {
    const item = currentItem();
    if (!item) {
      return;
    }

    mountFallbackPlayer(item);
    setStatus("유튜브 API 연결이 지연되거나 차단되어 웹 임베드 모드로 재생합니다. 자동 다음 곡은 일부 브라우저에서 제한될 수 있습니다.");
  });

  await syncRefreshWorkflowStatus();
  scheduleRefreshWorkflowStatusPoll();
}

boot();
