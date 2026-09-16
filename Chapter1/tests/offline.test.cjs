const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(join(__dirname, "..", "..", "service-worker.js"), "utf8");

function loadFallback() {
  const chapterResponse = new Response("chapter");
  const homeResponse = new Response("home");
  const cached = new Map([
    ["https://example.test/repo/Chapter1/index.html", chapterResponse],
    ["https://example.test/repo/index.html", homeResponse]
  ]);
  const context = {
    URL, Response, AbortController, setTimeout, clearTimeout,
    self: { registration: { scope: "https://example.test/repo/" }, location: { origin: "https://example.test" }, addEventListener() {}, skipWaiting() {}, clients: { claim() {} } },
    caches: { open: async () => ({ match: async (request) => cached.get(typeof request === "string" ? request : request.url) || null }) },
    fetch: async () => { throw new Error("offline"); }
  };
  return vm.runInNewContext(`${source}\ncachedFallback`, context);
}

test("offline query navigation resolves to its cached chapter document", async () => {
  const fallback = loadFallback();
  const response = await fallback({ url: "https://example.test/repo/Chapter1/index.html?exercise=moreless", mode: "navigate" });
  assert.equal(await response.text(), "chapter");
});

test("an unpublished chapter gets an explicit offline response", async () => {
  const fallback = loadFallback();
  const response = await fallback({ url: "https://example.test/repo/Chapter2/index.html", mode: "navigate" });
  assert.equal(response.status, 503);
  assert.match(await response.text(), /nie jest dostępny offline/);
});
