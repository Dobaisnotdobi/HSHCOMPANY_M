const STORAGE_KEYS = {
  liked: "naver-cafe-random-player-liked",
  disliked: "naver-cafe-random-player-disliked",
};

const ADMIN_PASSWORD = "4856";
const PLAYLIST_URL = new URL("./playlist.json", window.location.href);
const SITE_COPY_URL = new URL("./site-copy.json", window.location.href);
const YOUTUBE_IFRAME_API_SRC = "https://www.youtube.com/iframe_api";
const REFRESH_WORKFLOW_PATH = "refresh-playlist.yml";
const REFRESH_TOAST_TEXT = "[목록 갱신중>.O]";
const REFRESH_STATUS_IDLE_POLL_MS = 5 * 60 * 1000;
const REFRESH_STATUS_ACTIVE_POLL_MS = 20 * 1000;

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

const dom = {
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
};

let player = null;
let playerApiPromise = null;
let refreshStatusTimer = 0;

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

const likedSet = loadSet(STORAGE_KEYS.liked);
const dislikedSet = loadSet(STORAGE_KEYS.disliked);

function setStatus(message) {
  dom.statusText.textContent = message;
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
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    return;
  }

  syncRefreshWorkflowStatus();
  scheduleRefreshWorkflowStatusPoll();
});

async function boot() {
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
