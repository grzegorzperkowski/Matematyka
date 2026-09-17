const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const engineSource = readFileSync(join(__dirname, "..", "..", "shared", "game-engine.js"), "utf8");

function loadEngine() {
  const context = {};
  vm.runInNewContext(engineSource, context);
  return context.MathTownGame;
}

function memoryStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };
}

function round(mode, revision) {
  const value = {
    mode,
    questions: [{ kind: "input", label: "Pole", prompt: "Ile?", answer: 4, hint: "Policz.", explanation: "Są cztery." }],
    index: 0,
    score: 0,
    streak: 0,
    correct: 0,
    answered: false,
    hintUsed: false,
    currentAnswer: ""
  };
  if (revision !== undefined) value.revision = revision;
  return value;
}

test("only incompatible Chapter 7 route saves are invalidated", () => {
  const { createStore } = loadEngine();
  const storage = memoryStorage();
  const modes = ["wycinanki", "brakujacy-bok", "pole-kwadratu", "mix"];
  const original = createStore(storage, "chapter7", modes);
  assert.equal(original.saveRound(round("wycinanki")), true);
  assert.equal(original.saveRound(round("brakujacy-bok")), true);
  assert.equal(original.saveRound(round("pole-kwadratu")), true);
  assert.equal(original.saveRound(round("mix")), true);

  const upgraded = createStore(storage, "chapter7", modes, { wycinanki: 2, "brakujacy-bok": 2, "pole-kwadratu": 2 });
  assert.equal(upgraded.getRound("wycinanki"), null);
  assert.equal(upgraded.getRound("brakujacy-bok"), null);
  assert.equal(upgraded.getRound("pole-kwadratu"), null);
  assert.ok(upgraded.getRound("mix"));
  assert.equal(upgraded.saveRound(round("wycinanki")), false);
  assert.equal(upgraded.saveRound(round("brakujacy-bok")), false);
  assert.equal(upgraded.saveRound(round("pole-kwadratu")), false);
  assert.equal(upgraded.saveRound(round("wycinanki", 2)), true);
  assert.equal(upgraded.saveRound(round("brakujacy-bok", 2)), true);
  assert.equal(upgraded.saveRound(round("pole-kwadratu", 2)), true);
  assert.equal(upgraded.getRound("wycinanki").revision, 2);
  assert.equal(upgraded.getRound("brakujacy-bok").revision, 2);
  assert.equal(upgraded.getRound("pole-kwadratu").revision, 2);
});
