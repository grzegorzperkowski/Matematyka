const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

// Exercise the actual generator without adding browser globals or production exports.
const source = readFileSync(join(__dirname, "..", "game.js"), "utf8");
const helpers = source.slice(source.indexOf("  function rand("), source.indexOf("  function parkQuestions("));
const generator = source.slice(source.indexOf("  function by10Questions("), source.indexOf("  function timesMoreQuestions("));

function loadGenerator(random) {
  const math = Object.create(Math);
  math.random = random;
  return vm.runInNewContext(`${helpers}\n${generator}\nby10Questions`, { Math: math });
}

function evaluate(expression) {
  assert.match(expression, /^\d+(?:\s*[·:]\s*\d+)*$/);
  return expression.split(/\s*·\s*/).reduce((product, term) => {
    const [first, ...divisors] = term.split(/\s*:\s*/).map(Number);
    return product * divisors.reduce((result, divisor) => result / divisor, first);
  }, 1);
}

function checkQuestion(q) {
  assert.equal(q.kind, "input");
  assert.equal(q.visual.type, "equation");
  assert.equal(q.visual.expression, "× 10 → + 1 zero\u2003\u2003× 100 → + 2 zera");
  assert.doesNotMatch(q.visual.expression, /[•·]/);
  if (q.prompt.includes("zastąpić znak")) {
    assert.match(q.prompt, /\u00A0·\u00A0\?$/);
    assert.doesNotMatch(q.prompt, / · |· \?/);
  }
  assert.ok(Number.isSafeInteger(q.answer) && q.answer > 0 && q.answer <= 60000);
  for (const text of [q.prompt, q.hint, q.explanation]) {
    assert.ok(text && !/undefined|NaN/.test(text));
    // Check every displayed numeric equality, including intermediate steps in hints.
    const filled = text.replace("znak ?:", "znak:").replaceAll("?", String(q.answer));
    const chains = filled.match(/\d+(?:\s*[·:]\s*\d+)*(?:\s*=\s*\d+(?:\s*[·:]\s*\d+)*)+/g) || [];
    for (const chain of chains) {
      const values = chain.split(/\s*=\s*/).map(evaluate);
      assert.ok(values.every((value) => value === values[0]), `${text}: ${chain}`);
    }
  }

  if (q.prompt.startsWith("W loterii")) {
    const [tickets, prize] = q.prompt.match(/\d+/g).map(Number);
    assert.ok(tickets >= 20 && tickets <= 90 && tickets % 10 === 0);
    assert.ok(prize >= 20 && prize <= 90 && prize % 10 === 0);
    assert.equal(q.answer, tickets * prize);
  } else if (q.prompt.includes(" : ")) {
    const [dividend, divisor] = q.prompt.match(/\d+/g).map(Number);
    assert.equal(dividend % divisor, 0);
    assert.equal(q.answer, dividend / divisor);
  } else if (q.prompt.startsWith("Oblicz sprytnie")) {
    const [a, b, c] = q.prompt.match(/\d+/g).map(Number);
    assert.ok(b * c === 10 || a * c === 100 || (c === 25 && a % 4 === 0));
    assert.equal(q.answer, a * b * c);
  }
}

test("random rounds keep answers, hints and context consistent", () => {
  let seed = 20260915;
  const make = loadGenerator(() => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  });
  const prompts = new Set();
  const lotteryPrompts = new Set();
  for (let round = 0; round < 2000; round += 1) {
    const questions = make();
    assert.equal(questions.length, 10);
    for (const q of questions) {
      checkQuestion(q);
      prompts.add(q.prompt);
      if (q.prompt.startsWith("W loterii")) lotteryPrompts.add(q.prompt);
    }
  }
  assert.ok(prompts.size > 1000, "Operands should vary, not just question order");
  assert.equal(lotteryPrompts.size, 64, "Exercise every permitted lottery combination");
});

test("minimum and maximum random values produce valid exercises", () => {
  for (const value of [0, 1 - Number.EPSILON]) {
    // Rotate the pool to cover all 15 templates at each numeric boundary.
    const math = Object.create(Math);
    math.random = () => value;
    const make = vm.runInNewContext(`${helpers}\n${generator}\n
      let offset = 0;
      shuffle = (list) => {
        const start = offset++ % list.length;
        return [...list.slice(start), ...list.slice(0, start)];
      };
      by10Questions`, { Math: math });
    for (let round = 0; round < 15; round += 1) make().forEach(checkQuestion);
  }
});
