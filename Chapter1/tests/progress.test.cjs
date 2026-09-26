const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(join(__dirname, "..", "..", "shared", "game-engine.js"), "utf8");
const context = { URLSearchParams, URL };
vm.runInNewContext(source, context);
const { createStore, resultLevel, roundHasProgress, routeCardProgress, roundLaunchDecision, resumeRequestedFromSearch, fifthStepEncouragement } = context.MathTownGame;

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { values, getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
}

function round(mode, answer = "") {
  return {
    mode,
    questions: [{ kind: "input", label: "Test", prompt: "Ile?", answer: 12, hint: "Policz.", explanation: "12." }],
    index: 0, score: 0, streak: 0, correct: 0, answered: false, hintUsed: true, currentAnswer: answer
  };
}

test("rounds and best scores are isolated by chapter and exercise", () => {
  const store = createStore(memoryStorage(), "chapter1", ["moreless", "mix"]);
  store.saveRound(round("moreless", "1"));
  store.saveRound(round("mix", "2"));
  store.saveBest("moreless", 20);
  store.saveBest("mix", 80);
  assert.equal(store.getRound("moreless").currentAnswer, "1");
  assert.equal(store.getRound("mix").currentAnswer, "2");
  assert.equal(store.getBest("moreless"), 20);
  assert.equal(store.getBest("mix"), 80);
  store.clearRound("moreless");
  assert.equal(store.getRound("moreless"), null);
  assert.equal(store.getRound("mix").currentAnswer, "2");
});

test("open chapter pages merge writes into the latest saved record", () => {
  const storage = memoryStorage();
  const first = createStore(storage, "chapter1", ["mix"]);
  const second = createStore(storage, "chapter2", ["mix"]);
  assert.equal(first.saveRound(round("mix", "first")), true);
  assert.equal(second.saveRound(round("mix", "second")), true);
  first.saveBest("mix", 42);
  second.saveBestStreak("mix", 3);
  first.clearRound("mix");

  const saved = JSON.parse(storage.values.get("matematyczneMiasteczkoState:v2"));
  assert.equal(saved.rounds["chapter1:mix"], undefined);
  assert.equal(saved.rounds["chapter2:mix"].currentAnswer, "second");
  assert.equal(saved.bestScores["chapter1:mix"], 42);
  assert.equal(saved.bestStreaks["chapter2:mix"], 3);
  assert.equal(second.getBest("mix"), 0);
  assert.equal(first.getBestStreak("mix"), 0);
});

test("unreadable or newer records are preserved instead of overwritten", () => {
  for (const original of ["{broken", JSON.stringify({ version: 3, rounds: {}, bestScores: {} })]) {
    const storage = memoryStorage({ "matematyczneMiasteczkoState:v2": original });
    const store = createStore(storage, "chapter1", ["mix"]);
    assert.equal(store.saveRound(round("mix")), false);
    store.saveBest("mix", 10);
    store.clearRound("mix");
    assert.equal(storage.values.get("matematyczneMiasteczkoState:v2"), original);
  }
});

test("older version 2 records without optional maps retain progress", () => {
  const storage = memoryStorage({
    "matematyczneMiasteczkoState:v2": JSON.stringify({ version: 2, rounds: { "chapter1:mix": round("mix", "saved") }, bestScores: { "chapter1:mix": 15 } })
  });
  const store = createStore(storage, "chapter1", ["mix"]);
  assert.equal(store.getRound("mix").currentAnswer, "saved");
  store.saveBestStreak("mix", 2);
  assert.equal(store.getBest("mix"), 15);
  assert.equal(store.getRound("mix").currentAnswer, "saved");
});

test("opening an old version 2 save migrates it once and preserves every result", () => {
  const oldRound = round("mix", "unfinished");
  oldRound.correct = 1;
  oldRound.answered = true;
  const oldSave = {
    version: 2,
    rounds: { "chapter1:mix": oldRound },
    bestScores: { "chapter1:mix": 75, "chapter2:mix": 40 },
    bestStreaks: { "chapter1:mix": 6 },
    completedRoutes: { "chapter1:mix": true },
    legacyBestScores: { chapter1: 90 }
  };
  const storage = memoryStorage({ "matematyczneMiasteczkoState:v2": JSON.stringify(oldSave) });
  let writes = 0;
  const originalSet = storage.setItem;
  storage.setItem = (key, value) => { writes += 1; originalSet(key, value); };

  const store = createStore(storage, "chapter1", ["mix"]);
  const migrated = JSON.parse(storage.values.get("matematyczneMiasteczkoState:v2"));
  assert.equal(writes, 1);
  assert.equal(migrated.version, 2);
  assert.deepEqual(migrated.rounds, oldSave.rounds);
  assert.deepEqual(migrated.bestScores, oldSave.bestScores);
  assert.deepEqual(migrated.bestStreaks, oldSave.bestStreaks);
  assert.deepEqual(migrated.completedRoutes, oldSave.completedRoutes);
  assert.deepEqual(migrated.legacyBestScores, oldSave.legacyBestScores);
  assert.equal(typeof migrated.roundTokens["chapter1:mix"], "string");
  assert.equal(store.getBest("mix"), 75);
  assert.equal(store.getBestStreak("mix"), 6);
  assert.equal(store.getRound("mix").currentAnswer, "unfinished");

  createStore(storage, "chapter1", ["mix"]);
  assert.equal(writes, 1);
  assert.equal(store.getRoundToken("mix"), migrated.roundTokens["chapter1:mix"]);
});

test("two windows can hand the same round back and forth without stale overwrites", () => {
  const storage = memoryStorage();
  const first = createStore(storage, "chapter1", ["mix"]);
  const second = createStore(storage, "chapter1", ["mix"]);
  const initial = first.getRoundToken("mix");
  assert.equal(second.getRoundToken("mix"), initial);
  assert.equal(first.saveRound(round("mix", "window 1"), initial), true);
  const firstToken = first.getRoundToken("mix");
  assert.equal(second.saveRound(round("mix", "stale window 2"), initial), false);
  assert.equal(second.getRound("mix").currentAnswer, "window 1");

  assert.equal(second.saveRound(round("mix", "window 2"), firstToken), true);
  const secondToken = second.getRoundToken("mix");
  assert.notEqual(secondToken, firstToken);
  assert.equal(first.saveRound(round("mix", "stale window 1"), firstToken), false);
  assert.equal(first.getRound("mix").currentAnswer, "window 2");

  assert.equal(first.saveRound(round("mix", "window 1 again"), secondToken), true);
  const saved = JSON.parse(storage.values.get("matematyczneMiasteczkoState:v2"));
  assert.equal(saved.rounds["chapter1:mix"].currentAnswer, "window 1 again");
  assert.equal(typeof saved.rounds["chapter1:mix"].updatedAt, "number");
});

test("a cleared round cannot be resurrected by a stale window", () => {
  const storage = memoryStorage();
  const first = createStore(storage, "chapter1", ["mix"]);
  const second = createStore(storage, "chapter1", ["mix"]);
  first.saveRound(round("mix", "old"), first.getRoundToken("mix"));
  const oldToken = second.getRoundToken("mix");
  assert.equal(first.clearRound("mix", oldToken), true);
  assert.equal(second.saveRound(round("mix", "resurrected"), oldToken), false);
  assert.equal(second.clearRound("mix", oldToken), false);
  assert.equal(second.getRound("mix"), null);
  assert.notEqual(second.getRoundToken("mix"), oldToken);
});

test("a stale restart cannot delete progress saved in another window", () => {
  const storage = memoryStorage();
  const first = createStore(storage, "chapter1", ["mix"]);
  const second = createStore(storage, "chapter1", ["mix"]);
  first.saveRound(round("mix", "first step"), first.getRoundToken("mix"));
  const staleToken = first.getRoundToken("mix");
  second.saveRound(round("mix", "continued"), second.getRoundToken("mix"));
  assert.equal(first.clearRound("mix", staleToken), false);
  assert.equal(first.getRound("mix").currentAnswer, "continued");
});

test("best streaks are optional, isolated and only increase", () => {
  const oldV2Data = {
    version: 2,
    rounds: {},
    bestScores: { "chapter1:mix": 42 },
    legacyBestScores: {}
  };
  const storage = memoryStorage({ "matematyczneMiasteczkoState:v2": JSON.stringify(oldV2Data) });
  const store = createStore(storage, "chapter1", ["moreless", "mix"]);

  assert.equal(store.getBestStreak("mix"), 0);
  assert.equal(store.saveBestStreak("mix", 4), 4);
  assert.equal(store.saveBestStreak("mix", 2), 4);
  assert.equal(store.getBestStreak("moreless"), 0);
  assert.equal(store.getBest("mix"), 42);
});

test("station cards hide completion until a route is started or finished", () => {
  assert.equal(routeCardProgress(false, false, 0), null);
  const pending = routeCardProgress(false, true, 0);
  assert.equal(pending.label, "Nieukończona");
  assert.equal(pending.completed, false);
  assert.equal(pending.record, null);
  assert.equal(pending.ariaLabel, "Trasa jeszcze nieukończona");
  const done = routeCardProgress(true, false, 42);
  assert.equal(done.label, "Ukończona");
  assert.equal(done.completed, true);
  assert.equal(done.record, "Rekord: 42 pkt");
  assert.equal(done.ariaLabel, "Trasa ukończona");
});

test("completed routes include old records and zero-point finished rounds", () => {
  const oldV2Data = {
    version: 2,
    rounds: {},
    bestScores: { "chapter1:mix": 42 },
    legacyBestScores: {}
  };
  const storage = memoryStorage({ "matematyczneMiasteczkoState:v2": JSON.stringify(oldV2Data) });
  const store = createStore(storage, "chapter1", ["moreless", "mix"]);

  assert.equal(store.hasCompleted("mix"), true);
  assert.equal(store.hasCompleted("moreless"), false);
  assert.equal(store.saveBest("moreless", 0), 0);
  assert.equal(store.hasCompleted("moreless"), true);

  const saved = JSON.parse(storage.values.get("matematyczneMiasteczkoState:v2"));
  assert.equal(saved.completedRoutes["chapter1:moreless"], true);
});

test("legacy Chapter 1 data migrates before old keys are removed", () => {
  const storage = memoryStorage({ matematyczneMiasteczkoProgress: JSON.stringify(round("moreless", "7")), matematyczneMiasteczkoBest: "42" });
  const store = createStore(storage, "chapter1", ["moreless"]);
  assert.equal(store.getRound("moreless").currentAnswer, "7");
  assert.equal(store.getLegacyBest(), 42);
  assert.ok(storage.values.has("matematyczneMiasteczkoState:v2"));
  assert.equal(storage.values.has("matematyczneMiasteczkoProgress"), false);
});

test("malformed saves are ignored and storage failure does not stop play", () => {
  const malformed = memoryStorage({ "matematyczneMiasteczkoState:v2": JSON.stringify({ version: 2, rounds: { "chapter1:mix": { mode: "mix", questions: [], index: 99 } }, bestScores: {}, legacyBestScores: {} }) });
  assert.equal(createStore(malformed, "chapter1", ["mix"]).getRound("mix"), null);
  const failing = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
  const store = createStore(failing, "chapter1", ["mix"]);
  assert.doesNotThrow(() => store.saveRound(round("mix")));
  assert.equal(store.isAvailable(), false);
});

test("result thresholds use the proportion correct", () => {
  assert.equal(resultLevel(9, 10).stars, 3);
  assert.equal(resultLevel(6, 10).stars, 2);
  assert.equal(resultLevel(3, 5).stars, 2);
  assert.equal(resultLevel(2, 10).tone, "practice");
});

test("only a saved round for the requested game requires a start choice", () => {
  const savedRounds = [round("moreless"), round("mix")];
  assert.equal(roundLaunchDecision(null, savedRounds), "idle");
  assert.equal(roundLaunchDecision("park", savedRounds), "start");
  assert.equal(roundLaunchDecision("moreless", savedRounds), "choose");
  assert.equal(roundLaunchDecision("moreless", savedRounds, { resume: true }), "resume");
  assert.equal(roundLaunchDecision("park", savedRounds, { resume: true }), "start");
  assert.equal(resumeRequestedFromSearch("?exercise=moreless&resume=1"), true);
  assert.equal(resumeRequestedFromSearch("?exercise=moreless"), false);
});

test("an interrupted round is unfinished only after a correct answer", () => {
  const store = createStore(memoryStorage(), "chapter1", ["moreless"]);
  const started = { ...round("moreless"), hintUsed: false, currentAnswer: "1", answered: true };
  assert.equal(roundHasProgress(started), false);
  assert.equal(store.saveRound(started), true);
  assert.equal(store.listRounds().length, 0);

  started.correct = 1;
  started.score = 10;
  assert.equal(roundHasProgress(started), true);
  assert.equal(store.saveRound(started), true);
  assert.equal(store.listRounds().length, 1);
});

test("hint steps are saved with the round and default to false on old data", () => {
  const store = createStore(memoryStorage(), "chapter1", ["mix"]);
  const withHints = { ...round("mix", "1"), hintUsed: true, hintSteps: [true] };
  assert.equal(store.saveRound(withHints), true);
  assert.deepEqual(Array.from(store.getRound("mix").hintSteps), [true]);

  const old = round("mix", "2");
  delete old.hintSteps;
  assert.equal(store.saveRound(old), true);
  assert.deepEqual(Array.from(store.getRound("mix").hintSteps), [false]);
});

test("encouragement is randomized and offered at the halfway step", () => {
  assert.equal(fifthStepEncouragement(4, 10, () => 0), null);
  assert.equal(fifthStepEncouragement(5, 8, () => 0), null);
  assert.equal(fifthStepEncouragement(5, 12, () => 0), null);
  assert.equal(fifthStepEncouragement(6, 10, () => 0), null);
  assert.equal(fifthStepEncouragement(7, 12, () => 0), null);

  const first = fifthStepEncouragement(5, 10, () => 0);
  const last = fifthStepEncouragement(5, 10, () => 0.999);
  assert.equal(first.direction, "top");
  assert.equal(last.direction, "left");
  assert.ok(first.message.length > 0);
  assert.notEqual(first.message, last.message);
  assert.match(first.message, /pięć/);

  for (let step = 0; step < 6; step += 1) {
    const item = fifthStepEncouragement(6, 12, () => step / 6);
    assert.ok(["top", "right", "bottom", "left"].includes(item.direction));
    assert.doesNotMatch(item.message, /pięć/);
  }
  assert.match(fifthStepEncouragement(6, 12, () => 0).message, /sześć/);
  assert.notEqual(fifthStepEncouragement(6, 12, () => 0).message, fifthStepEncouragement(6, 12, () => 0.999).message);
});
