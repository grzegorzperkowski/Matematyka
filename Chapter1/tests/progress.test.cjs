const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

test("unfinished round statistics are saved, restored and cleared locally", () => {
  const source = readFileSync(join(__dirname, "..", "game.js"), "utf8");
  const helpers = source.slice(source.indexOf("  function readProgress("), source.indexOf("  function rand("));
  const values = new Map();
  const localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
  const state = {
    mode: "moreless",
    questions: [{ prompt: "Test", answer: 12 }],
    index: 0,
    score: 16,
    streak: 2,
    correct: 2,
    answered: true,
    hintUsed: false,
    currentAnswer: "12"
  };
  const context = {
    PROGRESS_STORAGE_KEY: "matematyczneMiasteczkoProgress",
    routeLabels: { moreless: "O ile więcej?" },
    state,
    localStorage
  };
  const { saveProgress, readProgress, clearProgress } = vm.runInNewContext(
    `${helpers}\n({ saveProgress, readProgress, clearProgress })`,
    context
  );

  saveProgress();
  assert.deepEqual(JSON.parse(JSON.stringify(readProgress())), {
    mode: "moreless",
    questions: [{ prompt: "Test", answer: 12 }],
    index: 0,
    score: 16,
    streak: 2,
    correct: 2,
    answered: true,
    hintUsed: false,
    currentAnswer: "12"
  });

  values.set("matematyczneMiasteczkoProgress", JSON.stringify({ mode: "moreless", questions: [], index: 0 }));
  assert.equal(readProgress(), null);
  saveProgress();
  clearProgress();
  assert.equal(readProgress(), null);
});
