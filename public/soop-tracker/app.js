const STORAGE_KEY = "soop-participation-events-v1";
const STREAM_INPUT_KEY = "soop-participation-active-stream-v1";

const sampleEvents = [
  {
    timestamp: "2026-06-07T20:00:00+09:00",
    stream_url: "https://play.sooplive.com/example_bj",
    title: "저녁 소통: 오늘 뭐 먹지",
    category: "talk",
    viewer_count: 118,
    event_type: "snapshot",
  },
  {
    timestamp: "2026-06-07T20:03:12+09:00",
    stream_url: "https://play.sooplive.com/example_bj",
    title: "저녁 소통: 오늘 뭐 먹지",
    category: "talk",
    viewer_count: 126,
    event_type: "chat",
    user_id: "user-001",
    nickname: "민트",
    message: "안녕하세요",
  },
  {
    timestamp: "2026-06-07T20:04:01+09:00",
    stream_url: "https://play.sooplive.com/example_bj",
    title: "저녁 소통: 오늘 뭐 먹지",
    category: "talk",
    viewer_count: 129,
    event_type: "chat",
    user_id: "user-002",
    nickname: "라임",
    message: "치킨 가죠",
  },
  {
    timestamp: "2026-06-07T21:06:20+09:00",
    stream_url: "https://play.sooplive.com/example_bj",
    title: "공포게임 켠왕",
    category: "game",
    viewer_count: 221,
    event_type: "chat",
    user_id: "user-003",
    nickname: "새벽반",
    message: "불 꺼주세요",
  },
  {
    timestamp: "2026-06-07T21:31:03+09:00",
    stream_url: "https://play.sooplive.com/example_bj",
    title: "공포게임 켠왕",
    category: "game",
    viewer_count: 248,
    event_type: "chat",
    user_id: "user-001",
    nickname: "민트",
    message: "방금 진짜 놀람",
  },
];

const state = {
  events: loadEvents(),
  chartMode: "hour",
};

const elements = {
  streamUrlInput: document.querySelector("#streamUrlInput"),
  fileInput: document.querySelector("#fileInput"),
  sampleButton: document.querySelector("#sampleButton"),
  exportButton: document.querySelector("#exportButton"),
  clearButton: document.querySelector("#clearButton"),
  manualForm: document.querySelector("#manualForm"),
  chartMode: document.querySelector("#chartMode"),
  chart: document.querySelector("#activityChart"),
  chatCount: document.querySelector("#chatCount"),
  userCount: document.querySelector("#userCount"),
  titleCount: document.querySelector("#titleCount"),
  maxViewers: document.querySelector("#maxViewers"),
  userTable: document.querySelector("#userTable"),
  titleTable: document.querySelector("#titleTable"),
  statusText: document.querySelector("#statusText"),
};

elements.fileInput.addEventListener("change", handleFileChange);
elements.streamUrlInput.value = loadStreamInput();
elements.streamUrlInput.addEventListener("input", () => {
  localStorage.setItem(STREAM_INPUT_KEY, elements.streamUrlInput.value.trim());
  render();
});
elements.sampleButton.addEventListener("click", () => {
  mergeEvents(sampleEvents);
  const activeStream = elements.streamUrlInput.value.trim();
  setStatus(
    activeStream
      ? "샘플은 example_bj 데이터라 현재 링크와 다릅니다. 입력칸을 비우면 샘플이 보입니다."
      : "샘플 이벤트를 불러왔습니다.",
  );
});
elements.exportButton.addEventListener("click", exportCsv);
elements.clearButton.addEventListener("click", clearEvents);
elements.chartMode.addEventListener("change", (event) => {
  state.chartMode = event.target.value;
  render();
});
elements.manualForm.addEventListener("submit", handleManualSubmit);
window.addEventListener("resize", () => drawChart(buildSummary()));

render();

function loadEvents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function loadStreamInput() {
  const params = new URLSearchParams(window.location.search);
  return params.get("stream") || localStorage.getItem(STREAM_INPUT_KEY) || "";
}

function persistEvents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events));
}

async function handleFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  const imported = file.name.toLowerCase().endsWith(".csv")
    ? parseCsv(text)
    : parseJsonLike(text);
  mergeEvents(imported);
  setStatus(`${imported.length.toLocaleString("ko-KR")}개 이벤트를 가져왔습니다.`);
  event.target.value = "";
}

function parseJsonLike(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) return JSON.parse(trimmed).map(normalizeEvent);
  return trimmed
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => normalizeEvent(JSON.parse(line)));
}

function parseCsv(text) {
  const rows = text.trim().split(/\r?\n/).map(parseCsvLine);
  const headers = rows.shift()?.map((header) => header.trim()) || [];
  return rows
    .filter((row) => row.length)
    .map((row) => {
      const event = {};
      headers.forEach((header, index) => {
        event[header] = row[index] ?? "";
      });
      return normalizeEvent(event);
    });
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

function normalizeEvent(event) {
  const timestamp = event.timestamp || event.sent_at || event.captured_at || new Date().toISOString();
  const viewerCount = Number(event.viewer_count);
  return {
    timestamp,
    stream_url: event.stream_url || elements.streamUrlInput.value || "",
    title: event.title || "(제목 없음)",
    category: event.category || "",
    viewer_count: Number.isFinite(viewerCount) ? viewerCount : null,
    event_type: event.event_type || (event.message || event.nickname || event.user_id ? "chat" : "snapshot"),
    user_id: event.user_id || event.nickname || "",
    nickname: event.nickname || event.user_id || "",
    message: event.message || "",
  };
}

function mergeEvents(events) {
  state.events = [...state.events, ...events.map(normalizeEvent)].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
  );
  persistEvents();
  render();
}

function clearEvents() {
  state.events = [];
  persistEvents();
  render();
  setStatus("브라우저 저장 데이터를 비웠습니다.");
}

function handleManualSubmit(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const manualEvent = normalizeEvent({
    timestamp: new Date().toISOString(),
    stream_url: elements.streamUrlInput.value,
    title: data.get("title"),
    nickname: data.get("nickname"),
    message: data.get("message"),
    viewer_count: data.get("viewer_count"),
    event_type: data.get("nickname") || data.get("message") ? "chat" : "snapshot",
  });
  mergeEvents([manualEvent]);
  event.currentTarget.reset();
  setStatus("수동 이벤트를 추가했습니다.");
}

function buildSummary() {
  const visibleEvents = getVisibleEvents();
  const chatEvents = visibleEvents.filter((event) => event.event_type !== "snapshot" && event.user_id);
  const titles = new Set(visibleEvents.map((event) => event.title).filter(Boolean));
  const users = new Map();
  const titleUsers = new Map();
  const hourly = new Map();
  const titleCounts = new Map();
  let maxViewers = 0;

  for (const event of visibleEvents) {
    if (Number.isFinite(event.viewer_count)) maxViewers = Math.max(maxViewers, event.viewer_count);
    if (event.event_type !== "snapshot" && event.user_id) {
      const date = new Date(event.timestamp);
      const hour = String(date.getHours()).padStart(2, "0");
      hourly.set(hour, (hourly.get(hour) || 0) + 1);
      titleCounts.set(event.title, (titleCounts.get(event.title) || 0) + 1);

      const user = users.get(event.user_id) || {
        label: event.nickname || event.user_id,
        messages: 0,
        first: event.timestamp,
        last: event.timestamp,
      };
      user.messages += 1;
      if (new Date(event.timestamp) < new Date(user.first)) user.first = event.timestamp;
      if (new Date(event.timestamp) > new Date(user.last)) user.last = event.timestamp;
      users.set(event.user_id, user);

      const titleKey = `${event.title}\u0000${event.user_id}`;
      const pair = titleUsers.get(titleKey) || {
        title: event.title,
        user: event.nickname || event.user_id,
        messages: 0,
      };
      pair.messages += 1;
      titleUsers.set(titleKey, pair);
    }
  }

  return {
    chatEvents,
    titles,
    users: [...users.values()].sort((a, b) => b.messages - a.messages),
    titleUsers: [...titleUsers.values()].sort((a, b) => b.messages - a.messages),
    hourly: [...hourly.entries()].sort(([a], [b]) => a.localeCompare(b)),
    titleCounts: [...titleCounts.entries()].sort((a, b) => b[1] - a[1]),
    maxViewers,
    visibleEvents,
  };
}

function getVisibleEvents() {
  const activeStream = elements.streamUrlInput.value.trim();
  if (!activeStream) return state.events;
  const activeKey = extractChannelKey(activeStream);
  return state.events.filter((event) => streamMatches(event.stream_url, activeStream, activeKey));
}

function streamMatches(eventUrl, activeStream, activeKey) {
  const eventStream = String(eventUrl || "").trim();
  if (!eventStream) return false;
  if (normalizeStreamUrl(eventStream) === normalizeStreamUrl(activeStream)) return true;
  const eventKey = extractChannelKey(eventStream);
  return Boolean(activeKey && eventKey && activeKey === eventKey);
}

function normalizeStreamUrl(value) {
  return String(value || "")
    .trim()
    .replace(/^http:\/\//, "https://")
    .replace(/\/+$/, "")
    .toLowerCase();
}

function extractChannelKey(value) {
  try {
    const parsed = new URL(value);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (!parts.length) return "";
    if (parts[0].toLowerCase() === "station" && parts[1]) return parts[1].toLowerCase();
    return parts[0].toLowerCase();
  } catch {
    return String(value || "").trim().toLowerCase();
  }
}

function render() {
  const summary = buildSummary();
  elements.chatCount.textContent = summary.chatEvents.length.toLocaleString("ko-KR");
  elements.userCount.textContent = summary.users.length.toLocaleString("ko-KR");
  elements.titleCount.textContent = summary.titles.size.toLocaleString("ko-KR");
  elements.maxViewers.textContent = summary.maxViewers.toLocaleString("ko-KR");
  renderTable(elements.userTable, summary.users.slice(0, 20), (user) => [
    user.label,
    user.messages,
    formatDate(user.first),
    formatDate(user.last),
  ]);
  renderTable(elements.titleTable, summary.titleUsers.slice(0, 20), (row) => [
    row.title,
    row.user,
    row.messages,
  ]);
  drawChart(summary);
  updateViewStatus(summary);
}

function updateViewStatus(summary) {
  const activeStream = elements.streamUrlInput.value.trim();
  if (!activeStream) {
    setStatus("JSONL 또는 CSV 파일을 선택하면 브라우저에서만 분석합니다.");
    return;
  }
  if (!summary.visibleEvents.length) {
    setStatus("이 링크에 가져온 이벤트가 없습니다. SOOP URL 입력만으로 실시간 조회되지는 않습니다.");
    return;
  }
  setStatus(`${extractChannelKey(activeStream)} 링크와 일치하는 이벤트만 표시 중입니다.`);
}

function renderTable(target, rows, mapRow) {
  target.replaceChildren();
  if (!rows.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;
    td.textContent = "데이터 없음";
    tr.append(td);
    target.append(tr);
    return;
  }
  for (const row of rows) {
    const tr = document.createElement("tr");
    for (const value of mapRow(row)) {
      const td = document.createElement("td");
      td.textContent = value;
      tr.append(td);
    }
    target.append(tr);
  }
}

function drawChart(summary) {
  const canvas = elements.chart;
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.max(640, Math.floor(rect.width * scale));
  canvas.height = Math.max(300, Math.floor(rect.height * scale));

  const ctx = canvas.getContext("2d");
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  const width = canvas.width / scale;
  const height = canvas.height / scale;
  ctx.clearRect(0, 0, width, height);

  const data = state.chartMode === "title" ? summary.titleCounts : summary.hourly;
  const limited = data.slice(0, 12);
  const max = Math.max(1, ...limited.map((item) => item[1]));
  const chartTop = 28;
  const chartBottom = height - 42;
  const chartLeft = 34;
  const barGap = 10;
  const barWidth = Math.max(18, (width - chartLeft - 20 - barGap * limited.length) / Math.max(1, limited.length));

  ctx.fillStyle = "#fbfdfb";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#d8e1da";
  ctx.lineWidth = 1;
  for (let line = 0; line < 4; line += 1) {
    const y = chartTop + ((chartBottom - chartTop) / 3) * line;
    ctx.beginPath();
    ctx.moveTo(chartLeft, y);
    ctx.lineTo(width - 16, y);
    ctx.stroke();
  }

  if (!limited.length) {
    ctx.fillStyle = "#5d6a61";
    ctx.font = "14px system-ui";
    ctx.fillText("표시할 데이터가 없습니다.", chartLeft, 64);
    return;
  }

  limited.forEach(([label, value], index) => {
    const x = chartLeft + index * (barWidth + barGap);
    const barHeight = ((chartBottom - chartTop) * value) / max;
    const y = chartBottom - barHeight;
    const gradient = ctx.createLinearGradient(0, y, 0, chartBottom);
    gradient.addColorStop(0, "#178457");
    gradient.addColorStop(1, "#006d77");
    ctx.fillStyle = gradient;
    roundRect(ctx, x, y, barWidth, barHeight, 6);
    ctx.fill();
    ctx.fillStyle = "#17201a";
    ctx.font = "700 12px system-ui";
    ctx.fillText(String(value), x, y - 6);
    ctx.fillStyle = "#5d6a61";
    ctx.font = "12px system-ui";
    const shortLabel = String(label).length > 8 ? `${String(label).slice(0, 8)}…` : String(label);
    ctx.fillText(shortLabel, x, chartBottom + 20);
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function exportCsv() {
  const headers = [
    "timestamp",
    "stream_url",
    "title",
    "category",
    "viewer_count",
    "event_type",
    "user_id",
    "nickname",
    "message",
  ];
  const rows = state.events.map((event) =>
    headers.map((header) => csvEscape(event[header] ?? "")).join(","),
  );
  const blob = new Blob([[headers.join(","), ...rows].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "soop-participation-events.csv";
  link.click();
  URL.revokeObjectURL(url);
  setStatus("CSV 파일을 내보냈습니다.");
}

function csvEscape(value) {
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function setStatus(message) {
  elements.statusText.textContent = message;
}
