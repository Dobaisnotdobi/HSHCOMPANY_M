const STORAGE_KEYS = {
  liked: "naver-cafe-random-player-liked",
  disliked: "naver-cafe-random-player-disliked",
  heroCopy: "naver-cafe-random-player-hero-copy",
};

const ADMIN_PASSWORD = "4856";
const PLAYLIST_URL = new URL("./playlist.json", window.location.href);

const DEFAULT_HERO_COPY = {
  title: "공개게시판 유튜브 랜덤 재생",
  subtitle:
    "네이버 카페 공개게시판 20페이지 안의 유튜브 링크를 수집해 랜덤으로 재생합니다. 좋아요와 싫어요는 이 브라우저에만 저장됩니다.",
  note:
    "이 페이지는 링크만 열면 바로 동작하는 공개 웹앱입니다. 목록 갱신은 가장 최근에 게시된 공개 플레이리스트 파일을 다시 불러옵니다.",
};

const dom = {
  refreshButton: document.getElementById("refreshButton"),
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
};

const state = {
  items: [],
  currentKey: null,
  filter: "all",
  playerReady: false,
  pendingVideoId: null,
};

let player = null;

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

function loadHeroCopy() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.heroCopy);
    if (!raw) {
      return { ...DEFAULT_HERO_COPY };
    }

    const parsed = JSON.parse(raw);
    return {
      title: String(parsed.title || DEFAULT_HERO_COPY.title),
      subtitle: String(parsed.subtitle || DEFAULT_HERO_COPY.subtitle),
      note: String(parsed.note || DEFAULT_HERO_COPY.note),
    };
  } catch {
    return { ...DEFAULT_HERO_COPY };
  }
}

function saveHeroCopy(value) {
  localStorage.setItem(STORAGE_KEYS.heroCopy, JSON.stringify(value));
}

const likedSet = loadSet(STORAGE_KEYS.liked);
const dislikedSet = loadSet(STORAGE_KEYS.disliked);

function setStatus(message) {
  dom.statusText.textContent = message;
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

  if (player && state.playerReady) {
    dom.playerPlaceholder.style.display = "none";
    player.loadVideoById(item.videoId);
  } else {
    state.pendingVideoId = item.videoId;
    dom.playerPlaceholder.style.display = "grid";
    dom.playerPlaceholder.textContent = "유튜브 플레이어를 준비하는 중입니다.";
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

function renderHeroCopy() {
  const heroCopy = loadHeroCopy();
  dom.heroTitle.textContent = heroCopy.title;
  dom.heroSubtitle.textContent = heroCopy.subtitle;
  dom.heroNote.textContent = heroCopy.note;
}

function openAdminEditor() {
  const heroCopy = loadHeroCopy();
  dom.editorHeroTitle.value = heroCopy.title;
  dom.editorHeroSubtitle.value = heroCopy.subtitle;
  dom.editorHeroNote.value = heroCopy.note;
  dom.adminEditor.hidden = false;
}

function closeAdminEditor() {
  dom.adminEditor.hidden = true;
}

function saveAdminEditor() {
  const nextHeroCopy = {
    title: dom.editorHeroTitle.value.trim() || DEFAULT_HERO_COPY.title,
    subtitle: dom.editorHeroSubtitle.value.trim() || DEFAULT_HERO_COPY.subtitle,
    note: dom.editorHeroNote.value.trim() || DEFAULT_HERO_COPY.note,
  };

  saveHeroCopy(nextHeroCopy);
  renderHeroCopy();
  closeAdminEditor();
  setStatus("상단 안내 문구를 이 브라우저에 저장했습니다.");
}

function resetAdminEditor() {
  saveHeroCopy(DEFAULT_HERO_COPY);
  renderHeroCopy();
  dom.editorHeroTitle.value = DEFAULT_HERO_COPY.title;
  dom.editorHeroSubtitle.value = DEFAULT_HERO_COPY.subtitle;
  dom.editorHeroNote.value = DEFAULT_HERO_COPY.note;
  setStatus("상단 안내 문구를 기본값으로 되돌렸습니다.");
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

window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
  player = new window.YT.Player("player", {
    videoId: "",
    playerVars: {
      rel: 0,
      modestbranding: 1,
    },
    events: {
      onReady: () => {
        state.playerReady = true;
        if (state.pendingVideoId) {
          dom.playerPlaceholder.style.display = "none";
          player.loadVideoById(state.pendingVideoId);
          state.pendingVideoId = null;
        }
      },
      onStateChange: (event) => {
        if (event.data === window.YT.PlayerState.ENDED) {
          playRandom();
        }
      },
    },
  });
};

window.addEventListener("keydown", (event) => {
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

dom.refreshButton.addEventListener("click", async () => {
  try {
    dom.refreshButton.disabled = true;
    setStatus("가장 최근에 게시된 공개 목록 파일을 다시 불러오는 중입니다.");
    const payload = await fetchPlaylist({ bustCache: true });
    applyPlaylistPayload(payload);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error));
  } finally {
    dom.refreshButton.disabled = false;
  }
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
dom.adminResetButton.addEventListener("click", resetAdminEditor);

async function boot() {
  renderHeroCopy();

  try {
    setStatus("공개 플레이리스트를 불러오는 중입니다.");
    const payload = await fetchPlaylist();
    applyPlaylistPayload(payload);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error));
  }
}

boot();
