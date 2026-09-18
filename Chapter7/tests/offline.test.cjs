const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const workerSource = readFileSync(join(__dirname, "..", "..", "service-worker.js"), "utf8");
const homeSource = readFileSync(join(__dirname, "..", "..", "index.html"), "utf8");

function loadServiceWorker() {
  const cached = new Map([
    ["https://example.test/repo/Chapter7/index.html", new Response("chapter seven")]
  ]);
  const context = {
    URL, Response, AbortController, setTimeout, clearTimeout,
    self: {
      registration: { scope: "https://example.test/repo/" },
      location: { origin: "https://example.test" },
      addEventListener() {}, skipWaiting() {}, clients: { claim() {} }
    },
    caches: { open: async () => ({ match: async (request) => cached.get(typeof request === "string" ? request : request.url) || null }) },
    fetch: async () => { throw new Error("offline"); }
  };
  return vm.runInNewContext(`${workerSource}\n({ PUBLISHED_CHAPTERS, CACHE_NAME, APP_SHELL, cachedFallback })`, context);
}

test("Chapter 7 is published with its game asset and no reference PNGs", () => {
  const { PUBLISHED_CHAPTERS, CACHE_NAME, APP_SHELL } = loadServiceWorker();
  const chapter = Array.from(PUBLISHED_CHAPTERS).find((item) => String(item.document).includes("Chapter7/index.html"));
  assert.ok(chapter);
  assert.deepEqual(Array.from(chapter.assets), ["Chapter7/game.js"]);
  assert.equal(CACHE_NAME, "matematyczne-miasteczko-v17");
  assert.ok(Array.from(APP_SHELL).some((url) => String(url).endsWith("/Chapter7/index.html")));
  assert.ok(Array.from(APP_SHELL).some((url) => String(url).endsWith("/Chapter7/game.js")));
  assert.equal(Array.from(APP_SHELL).some((url) => /Chapter7\/page_\d+\.png$/.test(String(url))), false);
});

test("an offline direct Chapter 7 exercise URL resolves to the cached document", async () => {
  const { cachedFallback } = loadServiceWorker();
  const response = await cachedFallback({
    url: "https://example.test/repo/Chapter7/index.html?exercise=figury-zlozone",
    mode: "navigate"
  });
  assert.equal(await response.text(), "chapter seven");
});

test("the homepage publishes Chapter 7 while preserving exactly eight cards", () => {
  assert.match(homeSource, /<a class="chapter areas" href="Chapter7\/index\.html">/);
  assert.doesNotMatch(homeSource, /<article class="chapter areas coming"/);
  assert.match(homeSource, /<a class="hero-action" href="Chapter7\/index\.html">/);
  const cards = homeSource.match(/<(?:a|article) class="chapter\b/g) || [];
  assert.equal(cards.length, 8);
});
