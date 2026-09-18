const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(join(__dirname, "..", "..", "service-worker.js"), "utf8");

function loadServiceWorker() {
  const cached = new Map([
    ["https://example.test/repo/Chapter4/index.html", new Response("chapter four")]
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
  return vm.runInNewContext(`${source}\n({ PUBLISHED_CHAPTERS, CACHE_NAME, APP_SHELL, cachedFallback })`, context);
}

test("Chapter 4 is published with its local game asset and no reference PNGs", () => {
  const { PUBLISHED_CHAPTERS, CACHE_NAME, APP_SHELL } = loadServiceWorker();
  const chapter = Array.from(PUBLISHED_CHAPTERS).find((item) => String(item.document).includes("Chapter4/index.html"));
  assert.ok(chapter);
  assert.deepEqual(Array.from(chapter.assets), ["Chapter4/game.js"]);
  assert.match(CACHE_NAME, /^matematyczne-miasteczko-v\d+$/);
  assert.ok(Array.from(APP_SHELL).some((url) => String(url).endsWith("/Chapter4/index.html")));
  assert.ok(Array.from(APP_SHELL).some((url) => String(url).endsWith("/Chapter4/game.js")));
  assert.equal(Array.from(APP_SHELL).some((url) => /Chapter4\/page_\d+\.png$/.test(String(url))), false);
});

test("an offline direct Chapter 4 exercise URL resolves to the cached document", async () => {
  const { cachedFallback } = loadServiceWorker();
  const response = await cachedFallback({
    url: "https://example.test/repo/Chapter4/index.html?exercise=katy",
    mode: "navigate"
  });
  assert.equal(await response.text(), "chapter four");
});
