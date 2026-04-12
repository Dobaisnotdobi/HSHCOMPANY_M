const fs = require("node:fs");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const { URL } = require("node:url");

const execFileAsync = promisify(execFile);

const ROOT_DIR = path.join(__dirname, "..");
const OUTPUT_FILE = path.join(ROOT_DIR, "public", "playlist.json");

const CAFE_ID = "31702916";
const MENU_ID = "25";
const PAGE_COUNT = 20;
const PER_PAGE = 15;
const DETAIL_CONCURRENCY = 2;

const MOBILE_ARTICLE_URL = (articleId) =>
  `https://m.cafe.naver.com/ca-fe/web/cafes/${CAFE_ID}/articles/${articleId}`;
const DESKTOP_ARTICLE_URL = (articleId) =>
  `https://cafe.naver.com/f-e/cafes/${CAFE_ID}/articles/${articleId}`;
const BOARD_API_URL = (page) =>
  `https://apis.naver.com/cafe-web/cafe-boardlist-api/v1/cafes/${CAFE_ID}/menus/${MENU_ID}/articles?page=${page}&perPage=${PER_PAGE}`;

const BROWSER_CANDIDATES = [
  process.env.BROWSER_PATH,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "/usr/bin/microsoft-edge",
  "/usr/bin/microsoft-edge-stable",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

function findBrowserPath() {
  return BROWSER_CANDIDATES.find((candidate) => fs.existsSync(candidate)) || null;
}

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2F;/g, "/");
}

function extractYouTubeUrls(input) {
  const text = String(input || "");
  const matches = text.match(
    /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?[^"'\\s<]+|shorts\/[^"'\\s<]+|embed\/[^"'\\s<]+)|youtu\.be\/[^"'\\s<]+)/gi,
  );
  return matches || [];
}

function parseYouTubeId(rawUrl) {
  const ensureValidVideoId = (value) => (/^[A-Za-z0-9_-]{11}$/.test(value || "") ? value : null);

  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return ensureValidVideoId(parsed.pathname.split("/").filter(Boolean)[0] || null);
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        return ensureValidVideoId(parsed.searchParams.get("v"));
      }

      if (parsed.pathname.startsWith("/embed/") || parsed.pathname.startsWith("/shorts/")) {
        return ensureValidVideoId(parsed.pathname.split("/").filter(Boolean)[1] || null);
      }
    }
  } catch {
    return null;
  }

  return null;
}

function canonicalizeYouTubeEntries(urls) {
  const seen = new Set();
  const result = [];

  for (const rawUrl of urls) {
    const videoId = parseYouTubeId(rawUrl);
    if (!videoId || seen.has(videoId)) {
      continue;
    }

    seen.add(videoId);
    result.push({
      videoId,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      rawUrl,
    });
  }

  return result;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchBoardPages() {
  const pages = Array.from({ length: PAGE_COUNT }, (_, index) => index + 1);
  const pagePayloads = await Promise.all(
    pages.map(async (page) => {
      const payload = await fetchJson(BOARD_API_URL(page));
      return payload?.result?.articleList || [];
    }),
  );

  return pagePayloads
    .flat()
    .filter((item) => item?.type === "ARTICLE" && item.item?.articleId)
    .map((item) => {
      const article = item.item;
      return {
        articleId: String(article.articleId),
        title: normalizeWhitespace(article.subject),
        summary: normalizeWhitespace(article.summary),
        writer: normalizeWhitespace(article.writerInfo?.nickName),
        writeTimestamp: article.writeDateTimestamp || 0,
        desktopUrl: DESKTOP_ARTICLE_URL(article.articleId),
        mobileUrl: MOBILE_ARTICLE_URL(article.articleId),
      };
    });
}

function parseRenderedArticle(html, articleMeta) {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const renderedTitle = normalizeWhitespace(decodeHtmlEntities(titleMatch?.[1] || articleMeta.title));
  const youtubeEntries = canonicalizeYouTubeEntries(extractYouTubeUrls(html));

  return {
    articleId: articleMeta.articleId,
    title: renderedTitle || articleMeta.title,
    links: youtubeEntries,
  };
}

async function renderMobileArticle(articleMeta, browserPath, profileRoot) {
  const profileDir = path.join(profileRoot, articleMeta.articleId);
  await fsp.mkdir(profileDir, { recursive: true });

  const args = [
    "--headless=new",
    "--disable-gpu",
    "--disable-extensions",
    "--no-first-run",
    "--disable-crash-reporter",
    `--user-data-dir=${profileDir}`,
    "--virtual-time-budget=12000",
    "--dump-dom",
    articleMeta.mobileUrl,
  ];

  try {
    const { stdout } = await execFileAsync(browserPath, args, {
      windowsHide: true,
      maxBuffer: 8 * 1024 * 1024,
    });
    return parseRenderedArticle(stdout, articleMeta);
  } catch (error) {
    const details = normalizeWhitespace(error?.stderr || error?.stdout || error?.message || "");
    throw new Error(`게시물 ${articleMeta.articleId} 렌더링 실패: ${details}`);
  }
}

async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  async function consume() {
    while (true) {
      const currentIndex = cursor;
      cursor += 1;

      if (currentIndex >= items.length) {
        return;
      }

      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  const runners = Array.from({ length: Math.min(limit, items.length) }, () => consume());
  await Promise.all(runners);
  return results;
}

function buildPlaylistItem(articleMeta, link, origin) {
  return {
    key: `${articleMeta.articleId}:${link.videoId}`,
    articleId: articleMeta.articleId,
    articleTitle: articleMeta.title,
    writer: articleMeta.writer,
    sourceUrl: articleMeta.desktopUrl,
    mobileSourceUrl: articleMeta.mobileUrl,
    videoId: link.videoId,
    watchUrl: link.watchUrl,
    embedUrl: link.embedUrl,
    originalUrl: link.rawUrl,
    origin,
    writeTimestamp: articleMeta.writeTimestamp,
  };
}

async function buildPlaylist() {
  const browserPath = findBrowserPath();
  if (!browserPath) {
    throw new Error("Chrome 또는 Edge 실행 파일을 찾을 수 없습니다. BROWSER_PATH 환경변수를 지정해 주세요.");
  }

  const profileRoot = await fsp.mkdtemp(path.join(os.tmpdir(), "naver-cafe-player-"));
  const detailCache = new Map();

  try {
    const boardArticles = await fetchBoardPages();
    const summaryItems = [];
    const missingDetailArticles = [];
    let summaryMatchCount = 0;

    for (const article of boardArticles) {
      const summaryLinks = canonicalizeYouTubeEntries(extractYouTubeUrls(article.summary));

      if (summaryLinks.length > 0) {
        summaryMatchCount += summaryLinks.length;
        summaryItems.push(...summaryLinks.map((link) => buildPlaylistItem(article, link, "summary")));
        detailCache.set(article.articleId, {
          articleId: article.articleId,
          title: article.title,
          links: summaryLinks,
        });
        continue;
      }

      missingDetailArticles.push(article);
    }

    const detailArticles = await runWithConcurrency(
      missingDetailArticles,
      DETAIL_CONCURRENCY,
      async (article) => {
        const cached = detailCache.get(article.articleId);
        if (cached) {
          return cached;
        }

        const rendered = await renderMobileArticle(article, browserPath, profileRoot);
        const cachedValue = {
          articleId: article.articleId,
          title: rendered.title,
          links: rendered.links,
        };

        detailCache.set(article.articleId, cachedValue);
        return cachedValue;
      },
    );

    const detailMap = new Map(detailArticles.map((entry) => [entry.articleId, entry]));
    const detailItems = [];
    let detailMatchCount = 0;

    for (const article of missingDetailArticles) {
      const detail = detailMap.get(article.articleId);
      if (!detail || detail.links.length === 0) {
        continue;
      }

      detailMatchCount += detail.links.length;
      detailItems.push(
        ...detail.links.map((link) =>
          buildPlaylistItem(
            {
              ...article,
              title: article.title || detail.title,
            },
            link,
            "detail",
          ),
        ),
      );
    }

    const deduped = [];
    const seen = new Set();

    for (const item of [...summaryItems, ...detailItems].sort((left, right) => right.writeTimestamp - left.writeTimestamp)) {
      if (seen.has(item.key)) {
        continue;
      }

      seen.add(item.key);
      deduped.push(item);
    }

    return {
      generatedAt: new Date().toISOString(),
      pageCount: PAGE_COUNT,
      sourceArticleCount: boardArticles.length,
      summaryMatchCount,
      detailMatchCount,
      items: deduped,
    };
  } finally {
    try {
      await fsp.rm(profileRoot, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 500,
      });
    } catch {
      // Temporary browser profiles can remain locked for a short time on Windows.
    }
  }
}

async function main() {
  const startedAt = Date.now();
  console.log("Collecting playlist from Naver Cafe...");

  const payload = await buildPlaylist();
  await fsp.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fsp.writeFile(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
  console.log(
    `Saved ${payload.items.length} videos from ${payload.sourceArticleCount} posts to ${OUTPUT_FILE} in ${durationSeconds}s.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
