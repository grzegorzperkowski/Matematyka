const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const workerSource = readFileSync(join(__dirname, "..", "..", "service-worker.js"), "utf8");
const homeSource = readFileSync(join(__dirname, "..", "..", "index.html"), "utf8");

function loadServiceWorker() {
  const cached = new Map([
    ["https://example.test/repo/Chapter6/index.html", new Response("chapter six")]
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

test("Chapter 6 is published with its game asset and no reference PNGs", () => {
  const { PUBLISHED_CHAPTERS, CACHE_NAME, APP_SHELL } = loadServiceWorker();
  const chapter = Array.from(PUBLISHED_CHAPTERS).find((item) => String(item.document).includes("Chapter6/index.html"));
  assert.ok(chapter);
  assert.deepEqual(Array.from(chapter.assets), ["Chapter6/game.js"]);
  assert.equal(CACHE_NAME, "matematyczne-miasteczko-v13");
  assert.ok(Array.from(APP_SHELL).some((url) => String(url).endsWith("/Chapter6/index.html")));
  assert.ok(Array.from(APP_SHELL).some((url) => String(url).endsWith("/Chapter6/game.js")));
  assert.equal(Array.from(APP_SHELL).some((url) => /Chapter6\/page_\d+\.png$/.test(String(url))), false);
});

test("an offline direct Chapter 6 exercise URL resolves to the cached document", async () => {
  const { cachedFallback } = loadServiceWorker();
  const response = await cachedFallback({
    url: "https://example.test/repo/Chapter6/index.html?exercise=porownywanie",
    mode: "navigate"
  });
  assert.equal(await response.text(), "chapter six");
});

test("the homepage publishes Chapter 6 as a real link while preserving eight cards", () => {
  assert.match(homeSource, /<a class="chapter decimals" href="Chapter6\/index\.html">/);
  assert.doesNotMatch(homeSource, /<article class="chapter decimals coming"/);
  const cards = homeSource.match(/<(?:a|article) class="chapter\b/g) || [];
  assert.equal(cards.length, 8);
});
