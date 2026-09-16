const test = require("node:test");
const assert = require("node:assert/strict");

let config;
global.MathTownGame = { start(value) { config = value; } };
require("../game.js");

test("each Chapter 3 station creates ten complete questions", () => {
  for (const route of Object.keys(config.routeLabels)) {
    const questions = config.buildQuestions(route);
    assert.equal(questions.length, 10, `${route} should contain ten questions`);
    for (const item of questions) {
      assert.equal(item.kind, "input");
      assert.ok(Number.isInteger(item.answer) && item.answer >= 0);
      assert.ok(item.prompt.length && item.hint.length && item.explanation.length);
      if (["Dodawanie pisemne", "Odejmowanie pisemne", "Mnożenie pisemne", "Mnożenie przez liczbę jednocyfrową"].includes(item.label)) {
        assert.equal(item.visual.type, "column");
        assert.match(item.visual.top, /^\d/);
        assert.match(item.visual.bottom, /^\d/);
        assert.ok(["+", "−", "×"].includes(item.visual.operator));
      }
      if (["Dzielenie pisemne", "Dzielenie przez liczbę jednocyfrową"].includes(item.label)) {
        assert.equal(item.visual.type, "division");
        assert.match(item.visual.divisor, /^\d/);
        assert.match(item.visual.dividend, /^\d/);
      }
    }
  }
});

test("division exercises are exact and explanations state the inverse multiplication", () => {
  for (const route of ["dzieleniejedna", "dzielenie"]) {
    for (const item of config.buildQuestions(route)) {
      const values = [...item.prompt.matchAll(/\d[\d\s,]*/g)].map((match) => Number(match[0].replace(/[\s,]/g, "")));
      assert.equal(values.length >= 2, true);
      assert.equal(values[0] % values[1], 0);
      assert.match(item.explanation, /bo/);
    }
  }
});
