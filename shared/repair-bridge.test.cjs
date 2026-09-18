const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(join(__dirname, "game-engine.js"), "utf8");

function loadEngine() {
  const context = {};
  vm.runInNewContext(source, context);
  return context.MathTownGame;
}

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    value(key) { return values.get(key); }
  };
}

function round(repairBridge) {
  return {
    mode: "mix",
    questions: [{ kind: "choice", label: "Pole", prompt: "Ile?", answer: 4, options: [3, 4, 5], hint: "Policz.", explanation: "Są cztery." }],
    index: 0,
    score: 0,
    streak: 0,
    correct: 0,
    answered: true,
    hintUsed: false,
    currentAnswer: "3",
    repairBridge
  };
}

test("a fresh repair bridge has one available use and no active question", () => {
  const { createRepairBridge } = loadEngine();
  assert.deepEqual(JSON.parse(JSON.stringify(createRepairBridge(true))), {
    granted: true,
    available: true,
    stage: "none",
    questionIndex: null,
    firstAnswer: "",
    repairCorrect: false,
    animationVariant: null,
    choiceOrder: []
  });
});

test("the round lottery uses one draw with an exact 85 percent boundary", () => {
  const { rollRepairBridge } = loadEngine();
  let calls = 0;
  assert.equal(rollRepairBridge(() => { calls += 1; return 0.849999; }).granted, true);
  assert.equal(calls, 1);
  assert.equal(rollRepairBridge(() => 0.85).granted, false);
});

test("old saves default safely to a round without a repair bridge", () => {
  const { createStore } = loadEngine();
  const storage = memoryStorage();
  const store = createStore(storage, "chapter-test", ["mix"]);
  assert.equal(store.saveRound(round(undefined)), true);
  assert.deepEqual(JSON.parse(JSON.stringify(store.getRound("mix").repairBridge)), {
    granted: false,
    available: false,
    stage: "none",
    questionIndex: null,
    firstAnswer: "",
    repairCorrect: false,
    animationVariant: null,
    choiceOrder: []
  });
});

test("saved offer state keeps the first answer and choice order", () => {
  const { createStore } = loadEngine();
  const storage = memoryStorage();
  const store = createStore(storage, "chapter-test", ["mix"]);
  const bridge = {
    granted: true,
    available: true,
    stage: "offer",
    questionIndex: 0,
    firstAnswer: "3",
    repairCorrect: false,
    animationVariant: null,
    choiceOrder: ["5", "3", "4"]
  };
  assert.equal(store.saveRound(round(bridge)), true);
  assert.deepEqual(Array.from(store.getRound("mix").repairBridge.choiceOrder), ["5", "3", "4"]);
  assert.equal(store.getRound("mix").repairBridge.firstAnswer, "3");
});

test("malformed repair state is sanitized without discarding the math round", () => {
  const { createStore } = loadEngine();
  const storage = memoryStorage();
  const store = createStore(storage, "chapter-test", ["mix"]);
  assert.equal(store.saveRound(round({ granted: true, available: true, stage: "retry", questionIndex: "wrong", choiceOrder: {} })), true);
  const restored = store.getRound("mix");
  assert.ok(restored);
  assert.equal(restored.repairBridge.stage, "none");
  assert.equal(restored.repairBridge.questionIndex, null);
  assert.deepEqual(Array.from(restored.repairBridge.choiceOrder), []);
});

test("completed repair keeps its result but can never become available again", () => {
  const { normalizeRepairBridge } = loadEngine();
  const bridge = normalizeRepairBridge({
    granted: true,
    available: true,
    stage: "completed",
    questionIndex: 7,
    firstAnswer: "12",
    repairCorrect: true,
    animationVariant: "repair-stamp",
    choiceOrder: []
  });
  assert.equal(bridge.available, false);
  assert.equal(bridge.repairCorrect, true);
  assert.equal(bridge.animationVariant, "repair-stamp");
});
