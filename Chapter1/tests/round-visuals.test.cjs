const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(join(__dirname, "..", "game.js"), "utf8");
const engineSource = readFileSync(join(__dirname, "..", "..", "shared", "game-engine.js"), "utf8");
const engineContext = {};
vm.runInNewContext(engineSource, engineContext);
let config;
vm.runInNewContext(source, { MathTownGame: { ...engineContext.MathTownGame, start(value) { config = value; } } });

test("every route builds the advertised ten-question round", () => {
  for (const mode of Object.keys(config.routeLabels)) assert.equal(config.buildQuestions(mode).length, 10, mode);
});

test("generated park and word-problem prompts agree with Polish number forms", () => {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    for (const question of config.buildQuestions("park")) {
      assert.doesNotMatch(question.prompt, /kosztuje [2-4] biletów/);
      assert.doesNotMatch(question.prompt, /kosztują [2-4] biletów/);
      assert.doesNotMatch(question.prompt, /kosztuje [2-4] bilety/);
      assert.doesNotMatch(question.prompt, /kosztują [5-9] biletów/);
      assert.doesNotMatch(question.prompt, / za [5-8] gałki\?/);
      assert.doesNotMatch(question.prompt, / za [2-4] gałek\?/);
      assert.doesNotMatch(question.explanation, /działa [2-4] godzin\./);
    }
    for (const question of config.buildQuestions("word")) {
      assert.doesNotMatch(question.prompt, /bierze [5-9] tabletki /);
      assert.doesNotMatch(question.prompt, /jest [2-4] róż /);
      assert.doesNotMatch(question.prompt, /są [5-9] róż /);
    }
  }
});

test("group and number-line visuals carry explicit mathematical data", () => {
  const grouped = config.buildQuestions("multdiv").find((question) => question.visual?.type === "array");
  assert.ok(grouped, "the multiplication round includes an explicit group model");
  assert.equal(grouped.answer, grouped.visual.groups * grouped.visual.itemsPerGroup);
  assert.equal(grouped.visual.caption, `${grouped.visual.groups} równych grup po ${grouped.visual.itemsPerGroup} elementów.`);
  for (let attempt = 0; attempt < 20; attempt += 1) {
    for (const question of config.buildQuestions("numberline").filter((item) => item.visual?.type === "numberline")) {
      assert.equal((question.visual.marked - question.visual.min) % question.visual.step, 0);
      assert.ok(question.visual.marked >= question.visual.min && question.visual.marked <= question.visual.max);
      assert.equal(question.visual.marked, question.answer);
    }
  }
});

test("mixed rounds keep ten unique stations and rotate the omitted topic", () => {
  const stationIds = Object.keys(config.routeLabels).filter((route) => route !== "mix");
  const seen = new Set();
  const omitted = new Set();
  for (let round = 0; round < 250; round += 1) {
    const questions = config.buildQuestions("mix");
    assert.equal(questions.length, 10);
    const ids = questions.map((question) => question.routeId);
    assert.equal(new Set(ids).size, 10);
    ids.forEach((id) => {
      assert.ok(stationIds.includes(id), id);
      seen.add(id);
    });
    const missing = stationIds.filter((id) => !ids.includes(id));
    assert.equal(missing.length, 1);
    omitted.add(missing[0]);
    questions.forEach((question) => {
      assert.equal(typeof question.method, "string");
      assert.ok(question.method.length > 0);
    });
  }
  assert.equal(seen.size, stationIds.length);
  assert.equal(omitted.size, stationIds.length);
});
