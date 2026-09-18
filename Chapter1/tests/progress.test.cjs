const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(join(__dirname, "..", "..", "shared", "game-engine.js"), "utf8");
const context = {};
vm.runInNewContext(source, context);
const { createStore, resultLevel, roundHasProgress, routeCardProgress, roundLaunchDecision, fifthStepEncouragement } = context.MathTownGame;

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
});

test("an untouched first question is not offered as an unfinished round", () => {
  const store = createStore(memoryStorage(), "chapter1", ["moreless"]);
  const untouched = { ...round("moreless"), hintUsed: false };
  assert.equal(roundHasProgress(untouched), false);
  assert.equal(store.saveRound(untouched), true);
  assert.equal(store.listRounds().length, 0);

  untouched.currentAnswer = "1";
  assert.equal(roundHasProgress(untouched), true);
  assert.equal(store.saveRound(untouched), true);
  assert.equal(store.listRounds().length, 1);
});

test("encouragement is randomized and offered only after step five of a ten-step round", () => {
  assert.equal(fifthStepEncouragement(4, 10, () => 0), null);
  assert.equal(fifthStepEncouragement(5, 8, () => 0), null);
  assert.equal(fifthStepEncouragement(6, 10, () => 0), null);

  const first = fifthStepEncouragement(5, 10, () => 0);
  const last = fifthStepEncouragement(5, 10, () => 0.999);
  assert.equal(first.direction, "top");
  assert.equal(last.direction, "left");
  assert.ok(first.message.length > 0);
  assert.notEqual(first.message, last.message);
});
