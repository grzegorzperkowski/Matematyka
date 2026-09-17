/*
 * Network-first keeps a GitHub Pages deployment fresh, while the cached app
 * shell makes the homepage, published chapters and their shareable exercise URLs usable
 * after the site has been opened online once.
 */
const CACHE_PREFIX = "matematyczne-miasteczko-";
const CACHE_NAME = `${CACHE_PREFIX}v12`;
const NETWORK_TIMEOUT_MS = 3000;
const APP_SHELL_URL = new URL("./", self.registration.scope).href;
const INDEX_URL = new URL("index.html", self.registration.scope).href;
const PUBLISHED_CHAPTERS = [
  {
    directory: new URL("Chapter1/", self.registration.scope).href,
    document: new URL("Chapter1/index.html", self.registration.scope).href,
    assets: ["Chapter1/game.js"]
  },
  {
    directory: new URL("Chapter2/", self.registration.scope).href,
    document: new URL("Chapter2/index.html", self.registration.scope).href,
    assets: ["Chapter2/game.js"]
  },
  {
    directory: new URL("Chapter3/", self.registration.scope).href,
    document: new URL("Chapter3/index.html", self.registration.scope).href,
    assets: ["Chapter3/game.js"]
  },
  {
    directory: new URL("Chapter4/", self.registration.scope).href,
    document: new URL("Chapter4/index.html", self.registration.scope).href,
    assets: ["Chapter4/game.js"]
  },
  {
    directory: new URL("Chapter5/", self.registration.scope).href,
    document: new URL("Chapter5/index.html", self.registration.scope).href,
    assets: ["Chapter5/game.js"]
  }
];
const APP_SHELL = [
  APP_SHELL_URL,
  INDEX_URL,
  new URL("assets/math-town-mascot.png", self.registration.scope).href,
  new URL("shared/game-engine.js", self.registration.scope).href,
  new URL("shared/game.css", self.registration.scope).href,
  ...PUBLISHED_CHAPTERS.flatMap((chapter) => [
    chapter.directory,
    chapter.document,
    ...chapter.assets.map((asset) => new URL(asset, self.registration.scope).href)
  ])
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
    const chapter = PUBLISHED_CHAPTERS.find((item) => {
      const directoryPath = new URL(item.directory).pathname;
      const documentPath = new URL(item.document).pathname;
      return requestUrl.pathname === directoryPath || requestUrl.pathname === documentPath;
    });
    if (chapter) {
      const chapterPage = (await cache.match(chapter.document)) || (await cache.match(chapter.directory));
      if (chapterPage) return chapterPage;
    }
    if (requestUrl.pathname === new URL(APP_SHELL_URL).pathname || requestUrl.pathname === new URL(INDEX_URL).pathname) {
      const homePage = (await cache.match(INDEX_URL)) || (await cache.match(APP_SHELL_URL));
      if (homePage) return homePage;
    }
    return new Response(`<!doctype html><html lang="pl"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Rozdział niedostępny offline</title><body><main><h1>Ten rozdział nie jest dostępny offline</h1><p>Połącz się z internetem i otwórz opublikowany rozdział przynajmniej raz.</p><p><a href="${INDEX_URL}">Wróć do mapy miasteczka</a></p></main></body></html>`, {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }

  return new Response("Aplikacja będzie dostępna offline po pierwszym otwarciu online.", {
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
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
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
