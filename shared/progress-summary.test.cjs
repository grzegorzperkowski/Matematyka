const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const root = join(__dirname, "..");
const engineSource = readFileSync(join(__dirname, "game-engine.js"), "utf8");
const catalogSource = readFileSync(join(__dirname, "chapter-catalog.js"), "utf8");
const pageSource = readFileSync(join(__dirname, "progress-page.js"), "utf8");
const workerSource = readFileSync(join(root, "service-worker.js"), "utf8");
const homeSource = readFileSync(join(root, "index.html"), "utf8");
const progressSource = readFileSync(join(root, "postepy.html"), "utf8");

function loadTown() {
  const context = { URL, URLSearchParams, Math };
  vm.runInNewContext(engineSource, context);
  vm.runInNewContext(catalogSource, context);
  vm.runInNewContext(pageSource, context);
  return context;
}

function loadChapterConfig(number) {
  const engineContext = { URL, URLSearchParams, Math };
  vm.runInNewContext(engineSource, engineContext);
  let config;
  vm.runInNewContext(readFileSync(join(root, `Chapter${number}`, "game.js"), "utf8"), {
    URL, URLSearchParams, Math,
    MathTownGame: { ...engineContext.MathTownGame, start(value) { config = value; } }
  });
  return config;
}

const { MathTownGame, MathTownCatalog, MathTownProgress } = loadTown();
const { chapterProgressSummary } = MathTownGame;

const sampleCatalog = [{
  id: "chapter1",
  number: 1,
  title: "Liczby i działania",
  href: "Chapter1/index.html",
  tone: "numbers",
  icon: "+−",
  stations: [
    { id: "park", title: "Wesołe miasteczko" },
    { id: "plusminus", title: "Sprytne rachunki" },
    { id: "mix", title: "Wielka przejażdżka" }
  ]
}];

test("an empty or unreadable record still lists every catalog station as ahead", () => {
  for (const state of [null, undefined, { version: 1 }, { version: 2 }, "saved"]) {
    const summary = chapterProgressSummary(state, sampleCatalog);
    assert.equal(summary.totals.progressLabel, "Ukończono 0 z 3 stacji");
    assert.equal(summary.totals.recordLabel, "Rekord: —");
    assert.equal(summary.totals.streakLabel, "Najdłuższa seria: —");
    assert.equal(summary.totals.pendingLabel, "");
    assert.match(summary.totals.emptyMessage, /Nie ma jeszcze zapisanych kroków/);
    assert.equal(summary.totals.completeMessage, "");
    assert.deepEqual(summary.chapters[0].stations.map((station) => station.statusLabel), [
      "Jeszcze przed Tobą", "Jeszcze przed Tobą", "Jeszcze przed Tobą"
    ]);
  }
});

test("finished, unfinished and zero-point records follow the chapter menu", () => {
  const summary = chapterProgressSummary({
    version: 2,
    rounds: {
      "chapter1:park": { correct: 0, index: 2, questions: Array(10).fill(null) },
      "chapter1:plusminus": { correct: 2, index: 3, questions: Array(10).fill(null) }
    },
    bestScores: { "chapter1:park": 80, "chapter1:mix": 0, "chapter1:plusminus": "40", "chapter9:ghost": 100 },
    bestStreaks: { "chapter1:park": 4, "chapter1:plusminus": 2, "chapter1:mix": -3 },
    completedRoutes: { "chapter1:park": true, "chapter1:plusminus": "true" }
  }, sampleCatalog);
  const [park, plusminus, mix] = summary.chapters[0].stations;
  assert.equal(park.status, "completed");
  assert.equal(park.resumeHref, null);
  assert.equal(park.detailLabel, "Rekord: 80 pkt · seria 4");
  assert.equal(plusminus.status, "started");
  assert.equal(plusminus.statusLabel, "Nieukończona");
  assert.equal(plusminus.detailLabel, "Krok 4/10 · seria 2");
  assert.equal(plusminus.href, "Chapter1/index.html?exercise=plusminus");
  assert.equal(plusminus.resumeHref, "Chapter1/index.html?exercise=plusminus&resume=1");
  assert.equal(plusminus.resumeLabel, "Dokończ · krok 4/10");
  assert.equal(mix.status, "completed");
  assert.equal(mix.detailLabel, "Rekord: 0 pkt");
  assert.equal(summary.chapters[0].completedCount, 2);
  assert.equal(summary.chapters[0].inProgressCount, 1);
  assert.equal(summary.chapters[0].bestScore, 80);
  assert.equal(summary.chapters[0].bestStreak, 4);
  assert.equal(summary.chapters[0].recordLabel, "Rekord: 80 pkt");
  assert.equal(summary.chapters[0].pendingLabel, "1 stacja do dokończenia");
  assert.equal(summary.totals.emptyMessage, "");
});

test("a finished station can still offer the saved round", () => {
  const summary = chapterProgressSummary({
    version: 2,
    rounds: { "chapter1:park": { correct: 1, index: 9, questions: Array(10).fill(null) } },
    bestScores: { "chapter1:park": 15 },
    bestStreaks: {},
    completedRoutes: {}
  }, sampleCatalog);
  const park = summary.chapters[0].stations[0];
  assert.equal(park.statusLabel, "Ukończona");
  assert.equal(park.resumeLabel, "Dokończ · krok 10/10");
  assert.equal(summary.chapters[0].pendingLabel, "1 stacja do dokończenia");
});

test("Polish pending labels use the few and many forms", () => {
  const stations = ["a", "b", "c", "d", "e"].map((id) => ({ id, title: id }));
  const catalog = [{ id: "chapter1", title: "Rozdział", href: "Chapter1/index.html", stations }];
  const rounds = {};
  stations.slice(0, 2).forEach((station) => { rounds[`chapter1:${station.id}`] = { correct: 1, index: 0, questions: [1] }; });
  assert.equal(chapterProgressSummary({ version: 2, rounds, bestScores: {}, bestStreaks: {}, completedRoutes: {} }, catalog).totals.pendingLabel, "2 stacje do dokończenia");
  stations.forEach((station) => { rounds[`chapter1:${station.id}`] = { correct: 1, index: 0, questions: [1] }; });
  assert.equal(chapterProgressSummary({ version: 2, rounds, bestScores: {}, bestStreaks: {}, completedRoutes: {} }, catalog).totals.pendingLabel, "5 stacji do dokończenia");
});

test("a round step never runs past the saved questions", () => {
  const summary = chapterProgressSummary({
    version: 2,
    rounds: { "chapter1:park": { correct: 1, index: 40, questions: Array(10).fill(null) } },
    bestScores: {},
    bestStreaks: {},
    completedRoutes: { "chapter1:mix": true }
  }, sampleCatalog);
  assert.equal(summary.chapters[0].stations[0].step.current, 10);
  assert.equal(summary.chapters[0].stations[2].detailLabel, "Rekord: 0 pkt");
  assert.equal(summary.totals.recordLabel, "Rekord: 0 pkt");
});

test("finishing every station celebrates without hiding a replay in progress", () => {
  const summary = chapterProgressSummary({
    version: 2,
    rounds: { "chapter1:park": { correct: 1, index: 1, questions: Array(10).fill(null) } },
    bestScores: { "chapter1:park": 10, "chapter1:plusminus": 20, "chapter1:mix": 30 },
    bestStreaks: { "chapter1:mix": 6 },
    completedRoutes: {}
  }, sampleCatalog);
  assert.match(summary.totals.completeMessage, /Wszystkie stacje są ukończone/);
  assert.equal(summary.totals.bestScore, 30);
  assert.equal(summary.totals.bestStreak, 6);
  assert.equal(summary.totals.pendingLabel, "1 stacja do dokończenia");
  assert.equal(summary.chapters[0].progressLabel, "Ukończono 3 z 3 stacji");
});

test("malformed catalog entries are skipped and a bad catalog does not throw", () => {
  const summary = chapterProgressSummary({ version: 2, rounds: {}, bestScores: {}, bestStreaks: {}, completedRoutes: {} }, [
    null,
    { id: "", title: "Pusto", href: "Chapter1/index.html" },
    { id: "chapter1", title: "Liczby", href: "Chapter1/index.html", stations: [null, { id: "park" }, { id: "mix", title: "Mieszanka" }] }
  ]);
  assert.equal(summary.chapters.length, 1);
  assert.deepEqual(summary.chapters[0].stations.map((station) => station.id), ["mix"]);
  assert.equal(chapterProgressSummary(null, null).chapters.length, 0);
});

test("the published catalog matches each chapter route list and covers 85 stations", () => {
  assert.equal(MathTownCatalog.length, 8);
  const seenChapters = new Set();
  let stationCount = 0;
  MathTownCatalog.forEach((chapter, index) => {
    const config = loadChapterConfig(index + 1);
    assert.equal(seenChapters.has(chapter.id), false);
    seenChapters.add(chapter.id);
    assert.equal(chapter.id, config.chapterId);
    assert.equal(chapter.number, index + 1);
    assert.equal(chapter.title, config.chapterTitle);
    assert.equal(chapter.href, `Chapter${index + 1}/index.html`);
    const stationIds = Array.from(chapter.stations, (station) => station.id);
    assert.equal(new Set(stationIds).size, stationIds.length);
    assert.deepEqual(stationIds, Array.from(Object.keys(config.routeLabels)));
    assert.deepEqual(
      Array.from(chapter.stations, (station) => station.title),
      Array.from(Object.values(config.routeLabels))
    );
    stationCount += stationIds.length;
  });
  const summary = chapterProgressSummary(null, MathTownCatalog);
  assert.equal(summary.totals.stationCount, 85);
  assert.equal(stationCount, 85);
  assert.equal(summary.totals.progressLabel, "Ukończono 0 z 85 stacji");
});

function fakeDocument() {
  function createElement(tag) {
    return {
      tagName: tag.toUpperCase(),
      className: "",
      textContent: "",
      href: "",
      style: {},
      children: [],
      attributes: {},
      setAttribute(name, value) { this.attributes[name] = String(value); },
      append(...nodes) { this.children.push(...nodes); },
      replaceChildren(...nodes) { this.children = [...nodes]; }
    };
  }
  return { createElement };
}

function walk(node, visit) {
  visit(node);
  (node.children || []).forEach((child) => walk(child, visit));
}

test("the progress page renders text, resume links and a storage warning without HTML injection", () => {
  const summary = chapterProgressSummary({
    version: 2,
    rounds: { "chapter1:plusminus": { correct: 1, index: 0, questions: Array(10).fill(null) } },
    bestScores: { "chapter1:park": 80 },
    bestStreaks: { "chapter1:park": 4 },
    completedRoutes: {}
  }, [{
    ...sampleCatalog[0],
    title: "<img src=x onerror=alert(1)>",
    stations: sampleCatalog[0].stations.map((station) => station.id === "park" ? { ...station, title: "<script>alert(1)</script>" } : station)
  }]);
  const document = fakeDocument();
  const root = document.createElement("div");
  root.children.push({ textContent: "Wczytuję Twoje postępy…", children: [] });
  MathTownProgress.renderProgressPage(root, summary, { document, storageAvailable: false });
  const nodes = [];
  walk(root, (node) => nodes.push(node));
  const text = nodes.map((node) => node.textContent || "").join("\n");
  assert.equal(text.includes("Wczytuję Twoje postępy…"), false);
  assert.match(text, /W tej przeglądarce nie da się odczytać zapisanych postępów/);
  assert.equal(text.includes("Nie ma jeszcze zapisanych kroków"), false);
  assert.equal(text.includes("<script>"), true);
  assert.equal(nodes.some((node) => node.tagName === "SCRIPT"), false);
  const links = nodes.filter((node) => node.tagName === "A").map((node) => node.href);
  assert.ok(links.includes("Chapter1/index.html"));
  assert.ok(links.includes("Chapter1/index.html?exercise=plusminus&resume=1"));
  assert.equal(nodes.find((node) => node.className === "progress-track").attributes["aria-hidden"], "true");
  assert.match(text, /Ukończono 1 z 3 stacji/);
  assert.match(text, /1 stacja do dokończenia/);
});

test("the homepage links to the progress page and the offline shell caches it", () => {
  assert.match(homeSource, /href="postepy\.html"/);
  assert.match(progressSource, /id="progressRoot"/);
  assert.match(progressSource, /src="shared\/game-engine\.js"/);
  assert.match(progressSource, /src="shared\/chapter-catalog\.js"/);
  assert.match(progressSource, /src="shared\/progress-page\.js"/);
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
  const { APP_SHELL } = vm.runInNewContext(`${workerSource}\n({ APP_SHELL })`, context);
  const urls = APP_SHELL.map(String);
  assert.ok(urls.some((url) => url.endsWith("/postepy.html")));
  assert.ok(urls.some((url) => url.endsWith("/shared/chapter-catalog.js")));
  assert.ok(urls.some((url) => url.endsWith("/shared/progress-page.js")));
});
