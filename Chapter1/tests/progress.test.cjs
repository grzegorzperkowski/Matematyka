const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(join(__dirname, "..", "..", "shared", "game-engine.js"), "utf8");
const context = {};
vm.runInNewContext(source, context);
const { createStore, resultLevel } = context.MathTownGame;

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
