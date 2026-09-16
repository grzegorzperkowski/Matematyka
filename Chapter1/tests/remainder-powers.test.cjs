const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(join(__dirname, "..", "game.js"), "utf8");
const helpers = source.slice(source.indexOf("  function rand("), source.indexOf("  function parkQuestions("));
const generators = source.slice(source.indexOf("  function remainderQuestions("), source.indexOf("  function wordProblemQuestions("));
let seed = 42;
const math = Object.create(Math);
math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
const { remainderQuestions, powersQuestions } = vm.runInNewContext(
  `${helpers}\n${generators}\n({ remainderQuestions, powersQuestions })`, { Math: math }
);

test("remainders, independent stories, cyclic colors and smallest solutions are valid", () => {
  const divisibilityAnswers = new Set();
  let lastColorSeen = false, puzzles = 0;
  for (let round = 0; round < 100; round += 1) {
    const questions = remainderQuestions();
    assert.equal(questions.length, 10);
    for (const q of questions) {
      const [a, b, c, d] = q.prompt.match(/\d+/g).map(Number);
      let expected;
      if (q.prompt.startsWith("Podaj")) {
        expected = Array.from({ length: 90 }, (_, i) => i + 10).find(n => n % a === b && n % c === d);
        puzzles += 1;
      } else if (q.prompt.startsWith("Kolory")) {
        const values = q.prompt.match(/\d+/g).map(Number);
        const position = values.pop(), cycle = values.length;
        expected = (position - 1) % cycle + 1;
        if (position % cycle === 0) lastColorSeen = true;
      } else if (q.prompt.startsWith("Czy")) {
        expected = Number(a % b === 0);
        divisibilityAnswers.add(expected);
      } else {
        expected = q.prompt.includes("każde dziecko") ? Math.floor(a / b) : a % b;
      }
      assert.equal(q.answer, expected, q.prompt);
      for (const match of q.explanation.matchAll(/(\d+) : (\d+) = (\d+) r (\d+)/g)) {
        const [, total, divisor, quotient, remainder] = match.map(Number);
        assert.equal(total, divisor * quotient + remainder);
        assert.ok(remainder >= 0 && remainder < divisor);
      }
    }
  }
  assert.equal(divisibilityAnswers.size, 2);
  assert.ok(lastColorSeen && puzzles > 0);
});

test("powers and story answers match their generated inputs", () => {
  const prompts = new Set();
  for (let round = 0; round < 100; round += 1) {
    const questions = powersQuestions();
    assert.equal(questions.length, 10);
    for (const q of questions) {
      prompts.add(q.prompt);
      const power = q.explanation.match(/(\d+)([²³⁴⁵])/);
      const numbers = q.prompt.match(/\d+/g).map(Number);
      const expected = power ? Number(power[1]) ** ({ "²": 2, "³": 3, "⁴": 4, "⁵": 5 }[power[2]]) : numbers[0] * numbers[1];
      assert.equal(q.answer, expected, q.prompt);
      assert.ok(q.answer > 0 && q.answer <= 10000);
      assert.ok(q.hint && !/undefined|NaN/.test(q.explanation));
    }
  }
  assert.ok(prompts.size > 30);
});
