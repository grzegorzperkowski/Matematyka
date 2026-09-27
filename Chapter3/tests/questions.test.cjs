const test = require("node:test");
const assert = require("node:assert/strict");

let config;
global.MathTownGame = { start(value) { config = value; } };
require("../game.js");

const focused = Object.keys(config.routeLabels).filter((route) => route !== "mix");
const number = (value) => Number(String(value).replace(/[^\d]/g, ""));

test("all Chapter 3 routes have twelve complete questions and the mix covers every station", () => {
  for (let run = 0; run < 30; run += 1) {
    for (const route of [...focused, "mix"]) {
      const questions = config.buildQuestions(route);
      assert.equal(questions.length, 12, route);
      for (const item of questions) {
        assert.equal(item.kind, "input");
        assert.ok(Number.isInteger(item.answer) && item.answer >= 0);
        assert.ok(item.prompt && item.hint && item.explanation && item.label);
        assert.ok(item.visual && ["column", "division", "equation"].includes(item.visual.type));
      }
      if (route === "mix") assert.deepEqual(new Set(questions.map((item) => item.routeId)), new Set(focused));
    }
  }
});

test("direct column calculations have mathematically correct answers", () => {
  const operations = { "+": (a, b) => a + b, "−": (a, b) => a - b, "×": (a, b) => a * b };
  for (let run = 0; run < 80; run += 1) {
    for (const route of ["dodawanie", "odejmowanie", "mnozeniejedna", "mnozenie"]) {
      for (const item of config.buildQuestions(route)) {
        if (item.visual.type !== "column" || !item.prompt.startsWith("Oblicz")) continue;
        const { top, bottom, operator } = item.visual;
        assert.equal(item.answer, operations[operator](number(top), number(bottom)), item.prompt);
      }
    }
  }
});

test("new addition, subtraction and multiplication skills recur in each round", () => {
  for (let run = 0; run < 60; run += 1) {
    const addition = config.buildQuestions("dodawanie");
    assert.equal(addition.filter((item) => item.method === "trzy składniki").length, 2);
    assert.equal(addition.filter((item) => item.method === "brakujący składnik").length, 2);
    for (const item of addition.filter((value) => value.method === "trzy składniki")) {
      const addends = item.visual.expression.split(" + ").map(number);
      assert.equal(item.answer, addends.reduce((sum, value) => sum + value, 0));
    }
    for (const item of addition.filter((value) => value.method === "brakujący składnik")) {
      const [known, total] = [...item.prompt.matchAll(/\d[\d\s\u00a0\u202f]*/g)].map((match) => number(match[0]));
      assert.equal(known + item.answer, total);
    }
    assert.equal(config.buildQuestions("odejmowanie").filter((item) => item.method === "pożyczanie przez zera").length, 3);
    const missingFactors = config.buildQuestions("mnozeniejedna").filter((item) => item.method === "brakujący czynnik");
    assert.equal(missingFactors.length, 2);
    for (const item of missingFactors) {
      const [, factor, product] = item.visual.expression.match(/\? · (\d+) = (.+)/);
      assert.equal(item.answer * Number(factor), number(product));
    }
    const multi = config.buildQuestions("mnozenie");
    assert.ok(multi.filter((item) => item.method === "mnożenie przez liczbę z zerami").length >= 5);
    assert.ok(multi.some((item) => item.method === "iloczyny częściowe"));
  }
});

test("one-digit division includes valid remainders and exact division remains exact", () => {
  for (let run = 0; run < 80; run += 1) {
    for (const route of ["dzieleniejedna", "dzielenie"]) {
      const questions = config.buildQuestions(route);
      assert.equal(questions.filter((item) => item.method === "dzielenie z resztą").length, route === "dzieleniejedna" ? 3 : 0);
      assert.equal(questions.filter((item) => item.method === "wyznaczanie reszty").length, route === "dzieleniejedna" ? 2 : 0);
      for (const item of questions) {
        const [dividend, divisor] = [...item.prompt.matchAll(/\d[\d\s\u00a0\u202f]*/g)].map((match) => number(match[0]));
        assert.ok(divisor > 0);
        if (item.method === "wyznaczanie reszty") {
          const quotient = number(item.prompt.match(/iloraz wynosi ([\d\s\u00a0\u202f]+)/)[1]);
          assert.equal(dividend, divisor * quotient + item.answer);
          assert.ok(item.answer > 0 && item.answer < divisor);
          assert.equal(item.visual.type, "equation");
        } else {
          const remainder = dividend - divisor * item.answer;
          if (item.method === "dzielenie z resztą") assert.ok(remainder > 0);
          else assert.equal(remainder, 0);
          assert.ok(remainder >= 0 && remainder < divisor);
          assert.equal(item.visual.type, "division");
        }
      }
    }
  }
});

test("multi-step word problems have exact answers", () => {
  for (let run = 0; run < 80; run += 1) {
    const questions = config.buildQuestions("tekstowe");
    const route = config.buildQuestions("mix");
    assert.ok(route.some((item) => item.routeId === "tekstowe" && item.method === "brakująca równa część"));
    for (const item of questions) {
      if (item.method === "suma trzech etapów") {
        const values = [...item.prompt.matchAll(/(\d+) m/g)].map((match) => Number(match[1]));
        assert.equal(item.answer, values.reduce((sum, value) => sum + value, 0));
      }
      if (item.method === "koszt i zysk na sztuce") {
        const [, count, cost, profit] = item.prompt.match(/kupił (\d+).*po (\d+) zł.*zyskał razem (\d+) zł/);
        assert.equal(item.answer * Number(count), Number(count) * Number(cost) + Number(profit));
      }
      if (item.method === "brakująca równa część") {
        const [, large, small, weight, total] = item.prompt.match(/jest (\d+).*i (\d+) małych po (\d+) g.*ważą (\d+) g/);
        assert.equal(item.answer * Number(large) + Number(small) * Number(weight), Number(total));
      }
    }
  }
});
