const CACHE_PREFIX = "matematyczne-miasteczko-";
const CACHE_NAME = `${CACHE_PREFIX}v33`;
const NETWORK_TIMEOUT_MS = 1800;
const ROOT = new URL("./", self.registration.scope);
const INDEX_URL = new URL("index.html", ROOT).href;
const CHAPTERS = [1, 2, 3, 4, 5, 6, 7, 8].map(number => ({
  prefix: new URL(`Chapter${number}/`, ROOT).pathname,
  document: new URL(`Chapter${number}/index.html`, ROOT).href
}));
const APP_SHELL = [
  "./", "index.html", "postepy.html", "shared/game-engine.js", "shared/game.css", "shared/chapter-catalog.js", "shared/progress-page.js", "assets/math-town-mascot.png",
  "pwa-register.js", "manifest.webmanifest", "assets/icons/icon-192.png", "assets/icons/icon-512.png",
  "assets/icons/icon-maskable-192.png", "assets/icons/icon-maskable-512.png", "assets/icons/apple-touch-icon.png",
  ...CHAPTERS.flatMap((_, index) => [`Chapter${index + 1}/`, `Chapter${index + 1}/index.html`, `Chapter${index + 1}/game.js`])
].map(path => new URL(path, ROOT).href);

self.addEventListener("install", event => event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))));
self.addEventListener("activate", event => event.waitUntil(Promise.all([
  caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)))),
  self.clients.claim()
])));
self.addEventListener("message", event => { if (event.data?.type === "SKIP_WAITING") event.waitUntil(self.skipWaiting()); });

async function navigationFallback(request) {
  const cache = await caches.open(CACHE_NAME);
  const direct = await cache.match(request, { ignoreSearch: true });
  if (direct) return direct;
  const path = new URL(request.url).pathname;
  const chapter = CHAPTERS.find(item => path.startsWith(item.prefix));
  return (chapter && await cache.match(chapter.document)) || cache.match(INDEX_URL);
}

async function networkFirst(request) {
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), NETWORK_TIMEOUT_MS);
  try {
    const response = await fetch(request, { cache: "no-store", signal: controller.signal });
    if (response.ok) { const cache = await caches.open(CACHE_NAME); await cache.put(request, response.clone()); return response; }
    if (response.status < 500) return response;
  } catch { /* Use the atomically installed chapter shell. */ } finally { clearTimeout(timeout); }
  return navigationFallback(request);
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(CACHE_NAME); const cached = await cache.match(request, { ignoreSearch: true });
  const refresh = fetch(request).then(response => response.ok ? cache.put(request, response.clone()).then(() => response) : response);
  if (cached) { event.waitUntil(refresh.catch(() => {})); return cached; } return refresh;
}

self.addEventListener("fetch", event => {
  const { request } = event; const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  event.respondWith(request.mode === "navigate" ? networkFirst(request) : staleWhileRevalidate(request, event));
});

if (typeof module !== "undefined") module.exports = { CACHE_NAME, CACHE_PREFIX };
