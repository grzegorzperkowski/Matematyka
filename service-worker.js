/*
 * Network-first keeps a GitHub Pages deployment fresh, while the cached app
 * shell makes the homepage, Chapter 1 and its shareable exercise URLs usable
 * after the site has been opened online once.
 */
const CACHE_NAME = "matematyczne-miasteczko-v1";
const NETWORK_TIMEOUT_MS = 3000;
const APP_SHELL_URL = new URL("./", self.registration.scope).href;
const INDEX_URL = new URL("index.html", self.registration.scope).href;
const CHAPTER_URL = new URL("Chapter1/", self.registration.scope).href;
const CHAPTER_INDEX_URL = new URL("Chapter1/index.html", self.registration.scope).href;
const APP_SHELL = [
  APP_SHELL_URL,
  INDEX_URL,
  new URL("assets/math-town-mascot.png", self.registration.scope).href,
  CHAPTER_URL,
  CHAPTER_INDEX_URL,
  new URL("Chapter1/game.js", self.registration.scope).href,
];

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(APP_SHELL.map(async (url) => {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not cache ${url}: ${response.status}`);
    await cache.put(url, response);
  }));
}

async function cacheResponse(request, response) {
  if (!response.ok) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

async function fetchWithTimeout(request) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NETWORK_TIMEOUT_MS);
  try {
    return await fetch(request, { cache: "no-store", signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function cachedFallback(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) return cachedResponse;

  if (request.mode === "navigate") {
    const requestUrl = new URL(request.url);
    const chapterUrl = new URL(CHAPTER_URL);
    if (requestUrl.pathname === chapterUrl.pathname) {
      const chapterPage = (await cache.match(CHAPTER_URL)) || (await cache.match(CHAPTER_INDEX_URL));
      if (chapterPage) return chapterPage;
    }
    const homePage = (await cache.match(APP_SHELL_URL)) || (await cache.match(INDEX_URL));
    if (homePage) return homePage;
  }

  return new Response("The app is unavailable offline until it has been opened once online.", {
    status: 503,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    await cacheAppShell();
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      const response = await fetchWithTimeout(request);
      if (response.ok) {
        await cacheResponse(request, response).catch(() => {});
        return response;
      }
      if (response.status < 500) return response;
    } catch {
      // A cached app shell is returned below when the network is unavailable.
    }
    return cachedFallback(request);
  })());
});
