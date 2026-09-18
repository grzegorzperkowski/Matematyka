const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(join(__dirname, "..", "game.js"), "utf8");
let config;
vm.runInNewContext(source, { MathTownGame: { start(value) { config = value; } } });

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
