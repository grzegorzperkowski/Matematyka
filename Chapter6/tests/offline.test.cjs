const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const workerSource = readFileSync(join(__dirname, "..", "..", "service-worker.js"), "utf8");
const homeSource = readFileSync(join(__dirname, "..", "..", "index.html"), "utf8");

function loadServiceWorker() {
  const listeners = {};
  const stored = new Map();
  const context = {
    URL, Response, Request, AbortController, setTimeout, clearTimeout,
    module: { exports: {} },
    self: {
      registration: { scope: "https://example.test/repo/" },
      location: { origin: "https://example.test" },
      addEventListener(type, fn) { listeners[type] = fn; },
      skipWaiting() {},
      clients: { claim() {} }
    },
    caches: {
      open: async () => ({
        addAll: async () => {},
        match: async (request, options) => {
          const url = typeof request === "string" ? request : request.url;
          if (stored.has(url)) return stored.get(url);
          if (options && options.ignoreSearch) return stored.get(url.split("?")[0]) || null;
          return null;
        },
        put: async () => {}
      }),
      keys: async () => [],
      delete: async () => true
    },
    fetch: async () => { throw new Error("offline"); }
  };
  const exported = vm.runInNewContext(`${workerSource}\n({ CACHE_NAME, CACHE_PREFIX, APP_SHELL, listeners, stored })`, { ...context, listeners, stored });
  exported.listeners = listeners;
  exported.stored = stored;
  return exported;
}

test("Chapter 6 is published with its game and without reference pages", () => {
  const { CACHE_NAME, CACHE_PREFIX, APP_SHELL } = loadServiceWorker();
  assert.equal(CACHE_NAME, `${CACHE_PREFIX}${CACHE_NAME.slice(CACHE_PREFIX.length)}`);
  assert.match(CACHE_NAME, /^matematyczne-miasteczko-v\d+$/);
  const urls = APP_SHELL.map(String);
  assert.ok(urls.some((url) => url.endsWith("/Chapter6/index.html")));
  assert.ok(urls.some((url) => url.endsWith("/Chapter6/game.js")));
  assert.equal(urls.some((url) => /Chapter6\/page_\d+\.png$/.test(url)), false);
});

test("an offline direct Chapter 6 exercise URL resolves to the cached document", async () => {
  const { listeners, stored } = loadServiceWorker();
  stored.set("https://example.test/repo/Chapter6/index.html", new Response("chapter six"));
  let pending;
  listeners.fetch({
    request: { method: "GET", url: "https://example.test/repo/Chapter6/index.html?exercise=porownywanie", mode: "navigate" },
    respondWith(value) { pending = value; },
    waitUntil() {}
  });
  assert.equal(await (await pending).text(), "chapter six");
});

test("the homepage publishes Chapter 6 as a real link while preserving eight cards", () => {
  assert.match(homeSource, /<a class="chapter decimals" href="Chapter6\/index\.html">/);
  assert.doesNotMatch(homeSource, /<article class="chapter decimals coming"/);
  const cards = homeSource.match(/<(?:a|article) class="chapter\b/g) || [];
  assert.equal(cards.length, 8);
});
