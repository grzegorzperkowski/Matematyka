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

function parse(value) {
  const text = String(value).trim().replace(/\s*\/\s*/g, "/");
  let match = text.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (match) return { numerator: Number(match[1]) * Number(match[3]) + Number(match[2]), denominator: Number(match[3]), form: "mixed" };
  match = text.match(/^(\d+)\/(\d+)$/);
  if (match) return { numerator: Number(match[1]), denominator: Number(match[2]), form: "fraction" };
  if (/^\d+$/.test(text)) return { numerator: Number(text), denominator: 1, form: "integer" };
  return null;
}

function sameValue(left, right) {
  const a = parse(left), b = parse(right);
  return Boolean(a && b && a.numerator * b.denominator === b.numerator * a.denominator);
}

function validateVisual(visual) {
  assert.ok(visual && typeof visual === "object");
  assert.equal(typeof visual.caption, "string");
  assert.ok(visual.caption.length > 0);
  if (visual.type === "fraction-model") {
    assert.ok(["bar", "circle", "grid", "collection"].includes(visual.shape));
    assert.ok(Number.isInteger(visual.numerator) && visual.numerator >= 0);
    assert.ok(Number.isInteger(visual.denominator) && visual.denominator >= 1 && visual.denominator <= 24);
    if (visual.shape === "grid") {
      assert.ok(Number.isInteger(visual.rows) && visual.rows > 0);
      assert.ok(Number.isInteger(visual.columns) && visual.columns > 0);
      assert.equal(visual.rows * visual.columns, visual.denominator);
    }
  } else if (visual.type === "fraction-numberline") {
    assert.ok(Number.isInteger(visual.denominator) && visual.denominator > 0);
    assert.ok(Number.isInteger(visual.minNumerator));
    assert.ok(Number.isInteger(visual.maxNumerator));
    assert.ok(visual.maxNumerator > visual.minNumerator);
    assert.ok(visual.maxNumerator - visual.minNumerator <= 24);
    assert.ok(Array.isArray(visual.markedNumerators));
    visual.markedNumerators.forEach((value) => assert.ok(Number.isInteger(value) && value >= visual.minNumerator && value <= visual.maxNumerator));
  } else if (visual.type === "division") {
    assert.ok(Number.isFinite(visual.dividend));
    assert.ok(Number.isFinite(visual.divisor) && visual.divisor !== 0);
  } else {
    assert.equal(visual.type, "equation");
    assert.equal(typeof visual.expression, "string");
    assert.ok(visual.expression.length > 0);
  }
}

function validateQuestion(question, route) {
  assert.ok(["input", "choice"].includes(question.kind), route);
  assert.equal(question.routeId, route === "mix" ? question.routeId : route);
  for (const field of ["label", "prompt", "hint", "explanation"]) {
    assert.equal(typeof question[field], "string", `${route}.${field}`);
    assert.ok(question[field].length > 0, `${route}.${field}`);
    assert.doesNotMatch(question[field], /undefined|NaN/);
  }
  assert.ok((typeof question.answer === "number" && Number.isFinite(question.answer)) || typeof question.answer === "string");
  if (question.checker) assert.ok(["fraction", "exactFraction", "mixed"].includes(question.checker));
  if (question.kind === "choice") {
    assert.ok(Array.isArray(question.options) && question.options.length >= 2);
    const values = question.options.map((option) => String(option.value));
    assert.equal(new Set(values).size, values.length, `${route}: choice values must be unique`);
    assert.ok(values.includes(String(question.answer)), `${route}: choices must contain the answer`);
  }
  validateVisual(question.visual);
}

test("every advertised route returns ten complete questions", () => {
  const config = loadConfig();
  assert.equal(config.chapterId, "chapter5");
  assert.equal(config.chapterTitle, "Ułamki zwykłe");
  assert.equal(Object.keys(config.routeLabels).length, 11);
  for (const route of Object.keys(config.routeLabels)) {
    const questions = config.buildQuestions(route);
    assert.equal(questions.length, 10, route);
    questions.forEach((question) => validateQuestion(question, route));
  }
});

test("generated contracts remain valid across many random rounds", () => {
  const config = loadConfig(11);
  for (let round = 0; round < 250; round += 1) {
    for (const route of Object.keys(config.routeLabels)) {
      const questions = config.buildQuestions(route);
      assert.equal(questions.length, 10, route);
      questions.forEach((question) => validateQuestion(question, route));
    }
  }
});

test("fraction checkers distinguish value from required notation", () => {
  const { answerCheckers } = loadConfig(21);
  assert.equal(answerCheckers.fraction(" 2 / 4 ", "1/2"), true);
  assert.equal(answerCheckers.fraction("1 1/2", "3/2"), true);
  assert.equal(answerCheckers.fraction("0,5", "1/2"), false);
  assert.equal(answerCheckers.exactFraction("2/4", "1/2"), false);
  assert.equal(answerCheckers.exactFraction("1 / 2", "1/2"), true);
  assert.equal(answerCheckers.mixed("1 1/2", "3/2"), true);
  assert.equal(answerCheckers.mixed("3/2", "1 1/2"), false);
  assert.equal(answerCheckers.mixed("1 3/2", "5/2"), false);
});

test("models and number lines encode the answers with integer fraction data", () => {
  const config = loadConfig(31);
  for (let round = 0; round < 300; round += 1) {
    const parts = config.buildQuestions("czesci-calosci");
    assert.equal(parts[0].answer, `${parts[0].visual.numerator}/${parts[0].visual.denominator}`);
    assert.equal(parts[3].answer, `${parts[3].visual.denominator - parts[3].visual.numerator}/${parts[3].visual.denominator}`);
    assert.equal(parts[4].answer, `${parts[4].visual.numerator}/${parts[4].visual.denominator}`);

    const axis = config.buildQuestions("os-ulamkowa");
    assert.ok(sameValue(axis[0].answer, `${axis[0].visual.markedNumerators[0]}/${axis[0].visual.denominator}`));
    assert.ok(sameValue(axis[1].answer, `${axis[1].visual.markedNumerators[0]}/${axis[1].visual.denominator}`));
    assert.ok(axis.every((question) => question.visual.type !== "fraction-numberline" || Number.isInteger(question.visual.denominator)));
  }
});

test("mixed-answer questions always have a proper mixed-number answer", () => {
  const config = loadConfig(41);
  for (let round = 0; round < 400; round += 1) {
    for (const route of ["liczby-mieszane", "ulamki-niewlasciwe", "ulamek-jako-iloraz", "dodawanie", "odejmowanie", "ulamkowe-zagadki"]) {
      for (const question of config.buildQuestions(route).filter((item) => item.checker === "mixed")) {
        const value = parse(question.answer);
        assert.ok(value, `${route}: ${question.answer}`);
        assert.equal(value.form, "mixed", `${route}: ${question.answer}`);
        assert.ok(value.numerator > value.denominator, `${route}: ${question.answer}`);
      }
    }
  }
});

test("addition and subtraction stay on common denominators with nonnegative results", () => {
  const config = loadConfig(51);
  for (let round = 0; round < 400; round += 1) {
    const addition = config.buildQuestions("dodawanie");
    const addMatch = addition[0].prompt.match(/(\d+)\/(\d+) \+ (\d+)\/(\d+)/);
    assert.equal(addMatch[2], addMatch[4]);
    assert.ok(sameValue(addition[0].answer, `${Number(addMatch[1]) + Number(addMatch[3])}/${addMatch[2]}`));

    const subtraction = config.buildQuestions("odejmowanie");
    const subtractMatch = subtraction[0].prompt.match(/(\d+)\/(\d+) − (\d+)\/(\d+)/);
    assert.equal(subtractMatch[2], subtractMatch[4]);
    assert.ok(Number(subtractMatch[1]) >= Number(subtractMatch[3]));
    assert.ok(sameValue(subtraction[0].answer, `${Number(subtractMatch[1]) - Number(subtractMatch[3])}/${subtractMatch[2]}`));
    subtraction.filter((question) => question.checker && parse(question.answer)).forEach((question) => assert.ok(parse(question.answer).numerator >= 0));
  }
});

test("mixed rounds contain exactly one question from every station", () => {
  const config = loadConfig(61);
  const stationIds = Object.keys(config.routeLabels).filter((route) => route !== "mix").sort();
  for (let round = 0; round < 200; round += 1) {
    const questions = config.buildQuestions("mix");
    assert.deepEqual(Array.from(questions, (question) => question.routeId).sort(), stationIds);
    questions.forEach((question) => validateQuestion(question, "mix"));
  }
});

test("all generated rounds remain JSON serializable for saved progress", () => {
  const config = loadConfig(71);
  for (const route of Object.keys(config.routeLabels)) {
    const restored = JSON.parse(JSON.stringify(config.buildQuestions(route)));
    assert.equal(restored.length, 10);
    restored.forEach((question) => validateQuestion(question, route));
  }
});
