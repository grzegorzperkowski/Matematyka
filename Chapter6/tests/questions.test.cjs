const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(join(__dirname, "..", "game.js"), "utf8");

function loadConfig(seed = 20260917) {
  const math = Object.create(Math);
  math.random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  let config;
  vm.runInNewContext(source, { Math: math, MathTownGame: { start(value) { config = value; } } });
  return config;
}

function numeric(value) {
  const text = String(value).trim();
  if (!/^\d+(?:[,.]\d+)?$/.test(text)) return null;
  return Number(text.replace(",", "."));
}

function validateVisual(visual, route) {
  assert.ok(visual && typeof visual === "object", route);
  assert.equal(typeof visual.caption, "string", route);
  assert.ok(visual.caption.length > 0, route);
  if (visual.type === "equation") {
    assert.equal(typeof visual.expression, "string");
    assert.ok(visual.expression.length > 0);
  } else if (visual.type === "column") {
    assert.equal(typeof visual.top, "string");
    assert.equal(typeof visual.bottom, "string");
    assert.ok(["+", "−"].includes(visual.operator));
  } else {
    assert.equal(visual.type, "fraction-numberline");
    assert.ok(Number.isInteger(visual.denominator) && visual.denominator > 0);
    assert.ok(Number.isInteger(visual.minNumerator));
    assert.ok(Number.isInteger(visual.maxNumerator));
    assert.ok(visual.maxNumerator > visual.minNumerator);
    assert.ok(visual.maxNumerator - visual.minNumerator <= 20);
    assert.ok(Array.isArray(visual.markedNumerators));
    visual.markedNumerators.forEach((value) => {
      assert.ok(Number.isInteger(value));
      assert.ok(value >= visual.minNumerator && value <= visual.maxNumerator);
    });
  }
}

function validateQuestion(question, route, validRoutes) {
  assert.ok(["input", "choice"].includes(question.kind), route);
  assert.ok(validRoutes.includes(question.routeId), route);
  if (route !== "mix") assert.equal(question.routeId, route);
  for (const field of ["label", "prompt", "hint", "explanation"]) {
    assert.equal(typeof question[field], "string", `${route}.${field}`);
    assert.ok(question[field].length > 0, `${route}.${field}`);
    assert.doesNotMatch(question[field], /undefined|NaN/);
  }
  assert.ok((typeof question.answer === "number" && Number.isFinite(question.answer)) || typeof question.answer === "string");
  if (question.checker) assert.equal(question.checker, "decimal");
  if (question.kind === "choice") {
    assert.ok(Array.isArray(question.options) && question.options.length >= 2);
    const values = question.options.map((option) => String(option.value));
    assert.equal(new Set(values).size, values.length, `${route}: choice values must be unique`);
    assert.ok(values.includes(String(question.answer)), `${route}: choices must contain the answer`);
  }
  validateVisual(question.visual, route);
}

test("every advertised route returns ten complete questions", () => {
  const config = loadConfig();
  assert.equal(config.chapterId, "chapter6");
  assert.equal(config.chapterTitle, "Ułamki dziesiętne");
  assert.equal(Object.keys(config.routeLabels).length, 11);
  const validRoutes = Object.keys(config.routeLabels).filter((route) => route !== "mix");
  for (const route of Object.keys(config.routeLabels)) {
    const questions = config.buildQuestions(route);
    assert.equal(questions.length, 10, route);
    questions.forEach((question) => validateQuestion(question, route, validRoutes));
  }
});

test("generated contracts remain valid across many random rounds", () => {
  const config = loadConfig(11);
  const validRoutes = Object.keys(config.routeLabels).filter((route) => route !== "mix");
  for (let round = 0; round < 300; round += 1) {
    for (const route of Object.keys(config.routeLabels)) {
      const questions = config.buildQuestions(route);
      assert.equal(questions.length, 10, route);
      questions.forEach((question) => validateQuestion(question, route, validRoutes));
    }
  }
});

test("decimal checker accepts Polish and international separators but rejects malformed notation", () => {
  const { answerCheckers } = loadConfig(21);
  assert.equal(answerCheckers.decimal(" 2,50 ", "2,5"), true);
  assert.equal(answerCheckers.decimal("2.500", "2,5"), true);
  assert.equal(answerCheckers.decimal("0,050", "0,05"), true);
  assert.equal(answerCheckers.decimal("1/2", "0,5"), false);
  assert.equal(answerCheckers.decimal("2,5 zł", "2,5"), false);
  assert.equal(answerCheckers.decimal("2,05", "2,5"), false);
});

test("scaled calculations have exact nonnegative answers", () => {
  const config = loadConfig(31);
  for (let round = 0; round < 500; round += 1) {
    for (const route of ["dodawanie", "odejmowanie", "zakupy"]) {
      for (const question of config.buildQuestions(route).filter((item) => item.calculation)) {
        const { leftUnits, rightUnits, places, operator } = question.calculation;
        assert.ok(Number.isInteger(leftUnits) && Number.isInteger(rightUnits));
        const expectedUnits = operator === "+" ? leftUnits + rightUnits : leftUnits - rightUnits;
        assert.ok(expectedUnits >= 0, `${route}: subtraction must stay nonnegative`);
        assert.equal(numeric(question.answer), expectedUnits / 10 ** places, `${route}: ${question.prompt}`);
      }
    }
  }
});

test("decimal number lines encode marked answers as integer numerator steps", () => {
  const config = loadConfig(41);
  for (let round = 0; round < 400; round += 1) {
    const questions = config.buildQuestions("os-dziesietna");
    for (const index of [0, 1, 2]) {
      const question = questions[index];
      assert.equal(question.visual.markedNumerators.length, 1);
      assert.equal(numeric(question.answer), question.visual.markedNumerators[0] / question.visual.denominator);
    }
  }
});

test("length and mass conversions use the correct powers of ten", () => {
  const config = loadConfig(51);
  for (let round = 0; round < 500; round += 1) {
    const length = config.buildQuestions("dlugosc");
    const millimetres = Number(length[0].prompt.match(/^(\d+) mm/)[1]);
    const centimetres = Number(length[2].prompt.match(/^(\d+) cm/)[1]);
    const metres = Number(length[4].prompt.match(/^(\d+) m/)[1]);
    assert.equal(numeric(length[0].answer), millimetres / 10);
    assert.equal(numeric(length[2].answer), centimetres / 100);
    assert.equal(numeric(length[4].answer), metres / 1000);

    const mass = config.buildQuestions("masa");
    const grams = Number(mass[0].prompt.match(/^(\d+) g/)[1]);
    const dekagrams = Number(mass[1].prompt.match(/^(\d+) dag/)[1]);
    const kilograms = Number(mass[4].prompt.match(/^(\d+) kg/)[1]);
    assert.equal(numeric(mass[0].answer), grams / 1000);
    assert.equal(numeric(mass[1].answer), dekagrams / 100);
    assert.equal(numeric(mass[4].answer), kilograms / 1000);
  }
});

test("mixed rounds contain exactly one question from every station", () => {
  const config = loadConfig(61);
  const stationIds = Object.keys(config.routeLabels).filter((route) => route !== "mix").sort();
  for (let round = 0; round < 300; round += 1) {
    const routeIds = Array.from(config.buildQuestions("mix"), (question) => question.routeId).sort();
    assert.deepEqual(routeIds, stationIds);
  }
});

test("all generated rounds remain JSON serializable for saved progress", () => {
  const config = loadConfig(71);
  const validRoutes = Object.keys(config.routeLabels).filter((route) => route !== "mix");
  for (const route of Object.keys(config.routeLabels)) {
    const restored = JSON.parse(JSON.stringify(config.buildQuestions(route)));
    assert.equal(restored.length, 10);
    restored.forEach((question) => validateQuestion(question, route, validRoutes));
  }
});
