const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const workerSource = readFileSync(join(__dirname, "..", "service-worker.js"), "utf8");
const homeSource = readFileSync(join(__dirname, "..", "index.html"), "utf8");

function loadServiceWorker() {
  const context = {
    URL, Response, AbortController, setTimeout, clearTimeout,
    self: {
      registration: { scope: "https://example.test/repo/" },
      location: { origin: "https://example.test" },
      addEventListener() {}, skipWaiting() {}, clients: { claim() {} }
    },
    caches: { open: async () => ({ match: async () => null }) },
    fetch: async () => { throw new Error("offline"); }
  };
  return vm.runInNewContext(`${workerSource}\n({ CACHE_NAME, CACHE_PREFIX, APP_SHELL })`, context);
}

test("the cache name comes from the service worker prefix and version, not a copied literal", () => {
  const { CACHE_NAME, CACHE_PREFIX } = loadServiceWorker();
  assert.equal(CACHE_PREFIX, "matematyczne-miasteczko-");
  assert.equal(CACHE_NAME.startsWith(CACHE_PREFIX), true);
  assert.match(CACHE_NAME, /^matematyczne-miasteczko-v\d+$/);
  assert.equal(CACHE_NAME, `${CACHE_PREFIX}${CACHE_NAME.slice(CACHE_PREFIX.length)}`);
});

test("the homepage hero starts Chapter 1 and keeps exactly eight chapter cards", () => {
  assert.match(homeSource, /<a class="hero-action" href="Chapter1\/index\.html">/);
  const cards = homeSource.match(/<(?:a|article) class="chapter\b/g) || [];
  assert.equal(cards.length, 8);
  assert.match(homeSource, /id="resumeChips"/);
});
