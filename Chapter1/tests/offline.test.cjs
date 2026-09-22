const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const workerSource = readFileSync(join(__dirname, "..", "..", "service-worker.js"), "utf8");

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

test("offline query navigation to Chapter1/index.html?exercise=moreless resolves to cached document", async () => {
  const { listeners, stored } = loadServiceWorker();
  stored.set("https://example.test/repo/Chapter1/index.html", new Response("chapter"));
  let pending;
  listeners.fetch({
    request: { method: "GET", url: "https://example.test/repo/Chapter1/index.html?exercise=moreless", mode: "navigate" },
    respondWith(value) { pending = value; },
    waitUntil() {}
  });
  assert.equal(await (await pending).text(), "chapter");
});

test("an unknown offline navigation falls back to the cached homepage", async () => {
  const { listeners, stored } = loadServiceWorker();
  stored.set("https://example.test/repo/index.html", new Response("home"));
  let pending;
  listeners.fetch({
    request: { method: "GET", url: "https://example.test/repo/unknown.html", mode: "navigate" },
    respondWith(value) { pending = value; },
    waitUntil() {}
  });
  assert.match(await (await pending).text(), /home/);
});
