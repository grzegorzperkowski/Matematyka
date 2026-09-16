const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

test("more/less exercises vary and remain correct at range boundaries", () => {
  const source = readFileSync(join(__dirname, "..", "game.js"), "utf8");
  const generator = source.slice(source.indexOf("  function moreLessQuestions("), source.indexOf("  function multDivQuestions("));
  const rounds = [0, 0.5, 1 - Number.EPSILON].map((random) => {
    const make = vm.runInNewContext(`${generator}\nmoreLessQuestions`, {
      rand: (min, max) => min + Math.floor(random * (max - min + 1)),
      shuffle: (list) => list,
      question: (data) => data
    });
    const questions = make();
    assert.equal(questions.length, 10);
    questions.forEach((q, index) => {
      const [a, b, c] = q.prompt.match(/\d+/g).map(Number);
      const expected = [b + a, b - a, a - b, b - a, c - a, a + b, a - b, a - b, a + b, a - b][index];
      assert.equal(q.answer, expected);
      assert.ok(Number.isInteger(q.answer) && q.answer > 0);
      assert.equal(q.visual.answer, q.answer);
      const [, left, operation, right, result] = q.explanation.match(/^(\d+) ([+−]) (\d+) = (\d+)/);
      assert.equal(Number(result), operation === "+" ? Number(left) + Number(right) : Number(left) - Number(right));
      assert.equal(Number(result), q.answer);
      assert.ok(q.hint.length > 0);
    });
    assert.ok(questions[6].answer >= 5 && questions[6].answer <= 14);
    assert.ok(questions[8].answer <= 30);
    return questions;
  });
  rounds[0].forEach((q, index) => assert.notEqual(q.prompt, rounds[2][index].prompt));
});
