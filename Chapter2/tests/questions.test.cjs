const test = require("node:test");
const assert = require("node:assert/strict");

require("../../shared/game-engine.js");
let config;
global.MathTownGame = { ...global.MathTownGame, start(value) { config = value; } };
require("../game.js");

test("each Chapter 2 station produces a complete ten-question round", () => {
  for (const route of Object.keys(config.routeLabels)) {
    const questions = config.buildQuestions(route);
    assert.equal(questions.length, 10, `${route} should contain 10 questions`);
    for (const question of questions) {
      assert.ok(["input", "choice"].includes(question.kind));
      assert.ok(question.prompt.length > 0);
      assert.ok(question.hint.length > 0);
      assert.ok(question.explanation.length > 0);
      assert.ok(typeof question.answer === "number" || typeof question.answer === "string");
      if (question.kind === "choice") assert.ok(question.options.length >= 2);
    }
  }
});

test("Roman-numeral answers accept lowercase input and reject a different value", () => {
  const checker = config.answerCheckers.roman;
  assert.equal(checker(" xiv ", "XIV"), true);
  assert.equal(checker("XVI", "XIV"), false);
});

test("money ticket prompts agree with Polish number forms", () => {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    for (const question of config.buildQuestions("pieniadze")) {
      assert.doesNotMatch(question.prompt, /kosztuje [2-4] biletów/);
      assert.doesNotMatch(question.prompt, /kosztują [2-4] biletów/);
      assert.doesNotMatch(question.prompt, /kosztuje [2-4] bilety/);
      assert.doesNotMatch(question.prompt, /kosztują [5-9] biletów/);
    }
  }
});

test("clock conversion reference keeps values with their units and separates both facts with whitespace", () => {
  const [question] = config.buildQuestions("zegary");
  assert.equal(question.visual.expression, "1\u00a0h = 60\u00a0min\u2003\u20031\u00a0min = 60\u00a0s");
  assert.equal(config.roundRevisions.zegary, 2);
});
