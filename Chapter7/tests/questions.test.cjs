const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(join(__dirname, "..", "game.js"), "utf8");
const engineSource = readFileSync(join(__dirname, "..", "..", "shared", "game-engine.js"), "utf8");

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

function areaOf(visual) {
  return Array.from(visual.cells).reduce((sum, value) => sum + value, 0);
}

function filledIndices(visual) {
  return visual.cells.map((value, index) => value === 1 ? index : -1).filter((index) => index >= 0);
}

function isConnected(visual) {
  const filled = new Set(filledIndices(visual));
  const start = filled.values().next().value;
  const seen = new Set(start === undefined ? [] : [start]);
  const queue = start === undefined ? [] : [start];
  while (queue.length) {
    const index = queue.shift();
    const row = Math.floor(index / visual.columns), column = index % visual.columns;
    [[row - 1, column], [row + 1, column], [row, column - 1], [row, column + 1]].forEach(([nextRow, nextColumn]) => {
      const next = nextRow * visual.columns + nextColumn;
      if (nextRow >= 0 && nextRow < visual.rows && nextColumn >= 0 && nextColumn < visual.columns && filled.has(next) && !seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    });
  }
  return seen.size === filled.size;
}

function isSolidRectangle(visual) {
  const filled = filledIndices(visual);
  const rows = filled.map((index) => Math.floor(index / visual.columns));
  const columns = filled.map((index) => index % visual.columns);
  return filled.length === (Math.max(...rows) - Math.min(...rows) + 1) * (Math.max(...columns) - Math.min(...columns) + 1);
}

function validateVisual(visual, route) {
  assert.ok(visual && typeof visual === "object", route);
  assert.equal(typeof visual.caption, "string", route);
  assert.ok(visual.caption.length > 0, route);
  if (visual.type === "equation") {
    assert.equal(typeof visual.expression, "string", route);
    assert.ok(visual.expression.length > 0, route);
    return;
  }
  if (visual.type === "geometry") {
    assert.equal(visual.shape, "rectangle", route);
    assert.ok(Number.isFinite(visual.width) && visual.width > 0, route);
    assert.ok(Number.isFinite(visual.height) && visual.height > 0, route);
    assert.equal(typeof visual.alt, "string", route);
    assert.ok(visual.alt.length > 0, route);
    return;
  }
  assert.equal(visual.type, "area-model", route);
  assert.ok(Number.isInteger(visual.rows) && visual.rows >= 1 && visual.rows <= 12, route);
  assert.ok(Number.isInteger(visual.columns) && visual.columns >= 1 && visual.columns <= 12, route);
  assert.equal(visual.cells.length, visual.rows * visual.columns, route);
  visual.cells.forEach((value) => assert.ok([0, 0.5, 1].includes(value), `${route}: invalid cell ${value}`));
}

function validateQuestion(question, route, stationIds) {
  assert.ok(["input", "choice"].includes(question.kind), route);
  assert.ok(stationIds.includes(question.routeId), route);
  if (route !== "mix") assert.equal(question.routeId, route);
  for (const field of ["label", "prompt", "hint", "explanation"]) {
    assert.equal(typeof question[field], "string", `${route}.${field}`);
    assert.ok(question[field].length > 0, `${route}.${field}`);
    assert.doesNotMatch(question[field], /undefined|NaN/);
  }
  assert.ok((typeof question.answer === "number" && Number.isFinite(question.answer)) || typeof question.answer === "string", route);
  if (question.kind === "choice") {
    assert.ok(Array.isArray(question.options) && question.options.length >= 2, route);
    const values = question.options.map((option) => String(option.value));
    assert.equal(new Set(values).size, values.length, `${route}: choices must be unique`);
    assert.ok(values.includes(String(question.answer)), `${route}: choices must contain the answer`);
  }
  validateVisual(question.visual, route);
}

test("every advertised route returns ten complete questions", () => {
  const config = loadConfig();
  assert.equal(config.chapterId, "chapter7");
  assert.equal(config.chapterTitle, "Pola figur");
  assert.equal(config.roundRevisions.wycinanki, 2);
  assert.equal(config.roundRevisions["brakujacy-bok"], 2);
  assert.equal(config.roundRevisions["pole-kwadratu"], 2);
  assert.equal(Object.keys(config.routeLabels).length, 11);
  const stationIds = Object.keys(config.routeLabels).filter((route) => route !== "mix");
  for (const route of Object.keys(config.routeLabels)) {
    const questions = config.buildQuestions(route);
    assert.equal(questions.length, 10, route);
    questions.forEach((question) => validateQuestion(question, route, stationIds));
  }
});

test("generated contracts remain valid across many seeded rounds", () => {
  const config = loadConfig(11);
  const stationIds = Object.keys(config.routeLabels).filter((route) => route !== "mix");
  for (let round = 0; round < 200; round += 1) {
    for (const route of Object.keys(config.routeLabels)) {
      config.buildQuestions(route).forEach((question) => validateQuestion(question, route, stationIds));
    }
  }
});

test("unit-square and composite answers equal their explicit cell data", () => {
  const config = loadConfig(21);
  for (let round = 0; round < 300; round += 1) {
    const unit = config.buildQuestions("kwadraty-jednostkowe");
    for (const index of [0, 1, 2, 4, 5, 6, 9]) {
      assert.equal(Number(unit[index].answer), areaOf(unit[index].visual), `unit question ${index}`);
    }
    const composite = config.buildQuestions("figury-zlozone");
    composite.forEach((question) => assert.equal(question.answer, areaOf(question.visual)));
  }
});

test("shaded-grid games generate varied connected non-rectangular shapes", () => {
  const config = loadConfig(26);
  const signatures = new Set();
  for (let round = 0; round < 100; round += 1) {
    const questions = config.buildQuestions("figury-zlozone");
    assert.ok(questions.slice(0, 5).every((question) => question.label === "Odejmowanie wycięcia"));
    for (const question of questions.slice(5)) {
      assert.equal(question.label, "Zacieniona figura");
      assert.equal(question.visual.outlineShape, true);
      assert.equal(question.answer, areaOf(question.visual));
      assert.match(question.visual.alt, /w kolejnych niepustych wierszach/);
      assert.doesNotMatch(question.visual.alt, /figura zajmuje/);
      assert.ok(question.visual.cells.every((value) => value === 0 || value === 1));
      assert.equal(isConnected(question.visual), true);
      assert.equal(isSolidRectangle(question.visual), false);
      signatures.add(`${question.visual.rows}x${question.visual.columns}:${question.visual.cells.join("")}`);
    }
  }
  assert.ok(signatures.size > 100, `expected varied shapes, got ${signatures.size}`);
});

test("rectangle and square areas multiply the generated side lengths", () => {
  const config = loadConfig(31);
  for (let round = 0; round < 300; round += 1) {
    const rectangles = config.buildQuestions("pole-prostokata");
    rectangles.forEach((question) => {
      assert.equal(question.answer, question.visual.rows * question.visual.columns);
    });
    const squares = config.buildQuestions("pole-kwadratu").slice(0, 7);
    squares.forEach((question) => {
      const side = Number(question.prompt.match(/bok (\d+)/)[1]);
      assert.equal(question.answer, side ** 2);
      if (side <= 8) {
        assert.equal(question.visual.type, "area-model");
        assert.equal(question.visual.rows, side);
        assert.equal(question.visual.columns, side);
      } else {
        assert.equal(question.visual.type, "geometry");
        assert.equal(question.visual.shape, "rectangle");
        assert.equal(question.visual.square, true);
        assert.equal(question.visual.width, side);
        assert.equal(question.visual.height, side);
        assert.equal(question.visual.widthLabel, question.visual.heightLabel);
        assert.match(question.visual.alt, new RegExp(`długości ${side} (?:cm|m)`));
      }
    });
  }
});

test("inverse rectangle questions divide area by the known side exactly", () => {
  const config = loadConfig(41);
  for (let round = 0; round < 500; round += 1) {
    for (const question of config.buildQuestions("brakujacy-bok")) {
      const match = question.prompt.match(/wynosi (\d+) \w+².+ma (\d+) \w+/);
      assert.ok(match, question.prompt);
      assert.equal(question.answer, Number(match[1]) / Number(match[2]));
      assert.ok(Number.isInteger(question.answer) && question.answer > 0);
      assert.equal(question.visual.type, "geometry");
      assert.equal(question.visual.shape, "rectangle");
      assert.equal(question.visual.width, Number(match[2]));
      assert.equal(question.visual.height, question.answer);
      assert.match(question.visual.widthLabel, new RegExp(`^${match[2]} \\w+$`));
      assert.match(question.visual.heightLabel, /^\? \w+$/);
      assert.equal(question.visual.areaLabel.startsWith(`P = ${match[1]} `), true);
      assert.equal(question.visual.proportional, true);
      assert.doesNotMatch(question.visual.alt, new RegExp(`pionowy bok ma ${question.answer} `));
    }
  }
});

test("square-unit conversions use squared scale factors", () => {
  const config = loadConfig(51);
  for (let round = 0; round < 400; round += 1) {
    const questions = config.buildQuestions("zamiana-jednostek");
    let value = Number(questions[0].prompt.match(/(\d+) cm²/)[1]);
    assert.equal(questions[0].answer, value * 100);
    value = Number(questions[1].prompt.match(/(\d+) dm²/)[1]);
    assert.equal(questions[1].answer, value * 100);
    value = Number(questions[2].prompt.match(/(\d+) m²/)[1]);
    assert.equal(questions[2].answer, value * 100);
    value = Number(questions[3].prompt.match(/(\d+) m²/)[1]);
    assert.equal(questions[3].answer, value * 10000);
    value = Number(questions[4].prompt.match(/(\d+) mm²/)[1]);
    assert.equal(questions[4].answer, value / 100);
    value = Number(questions[5].prompt.match(/(\d+) cm²/)[1]);
    assert.equal(questions[5].answer, value / 100);
    value = Number(questions[6].prompt.match(/(\d+) dm²/)[1]);
    assert.equal(questions[6].answer, value / 100);
  }
});

test("ares and hectares follow exact land-unit relationships", () => {
  const config = loadConfig(61);
  for (let round = 0; round < 400; round += 1) {
    const questions = config.buildQuestions("ary-hektary");
    let value = Number(questions[0].prompt.match(/(\d+) a/)[1]);
    assert.equal(questions[0].answer, value * 100);
    value = Number(questions[1].prompt.match(/(\d+) ha/)[1]);
    assert.equal(questions[1].answer, value * 100);
    value = Number(questions[2].prompt.match(/(\d+) ha/)[1]);
    assert.equal(questions[2].answer, value * 10000);
    value = Number(questions[3].prompt.match(/(\d+) m²/)[1]);
    assert.equal(questions[3].answer, value / 100);
    value = Number(questions[4].prompt.match(/(\d+) a/)[1]);
    assert.equal(questions[4].answer, value / 100);
    assert.ok(questions.slice(0, 7).every((question) => Number.isInteger(question.answer) && question.answer > 0));
  }
});

test("cutting and rearranging preserve or halve area as stated", () => {
  const config = loadConfig(71);
  for (let round = 0; round < 300; round += 1) {
    const questions = config.buildQuestions("wycinanki");
    const rectangleArea = Number(questions[0].prompt.match(/polu (\d+) cm²/)[1]);
    assert.equal(questions[0].answer, rectangleArea / 2);
    assert.equal(areaOf(questions[0].visual), rectangleArea / 2);
    assert.equal(questions[0].visual.diagonalHalf, true);
    assert.match(questions[0].visual.caption, /Jedna przekątna dzieli cały prostokąt/);
    assert.equal(questions[1].answer, "takie samo");
    assert.equal(questions[2].answer, areaOf(questions[2].visual));
    assert.equal(questions[5].answer, areaOf(questions[5].visual));
    assert.equal(questions[8].answer, 24);
  }
});

test("practical tiling and map-area calculations use both dimensions", () => {
  const config = loadConfig(81);
  for (let round = 0; round < 300; round += 1) {
    const questions = config.buildQuestions("pola-w-praktyce");
    assert.equal(questions[3].answer, questions[3].visual.rows * questions[3].visual.columns);
    const mapSquares = questions[4].visual.cells.length;
    assert.equal(questions[4].answer, mapSquares * 25);
    assert.ok(Number.isInteger(questions[7].answer) && questions[7].answer > 0);
  }
});

test("mixed rounds contain exactly one question from every station", () => {
  const config = loadConfig(91);
  const stationIds = Object.keys(config.routeLabels).filter((route) => route !== "mix").sort();
  for (let round = 0; round < 300; round += 1) {
    const actual = Array.from(config.buildQuestions("mix"), (question) => question.routeId).sort();
    assert.deepEqual(actual, stationIds);
  }
});

test("all rounds are JSON serializable and the shared engine registers the area renderer", () => {
  const config = loadConfig(101);
  const stationIds = Object.keys(config.routeLabels).filter((route) => route !== "mix");
  for (const route of Object.keys(config.routeLabels)) {
    const restored = JSON.parse(JSON.stringify(config.buildQuestions(route)));
    assert.equal(restored.length, 10);
    restored.forEach((question) => validateQuestion(question, route, stationIds));
  }
  assert.match(engineSource, /function renderAreaModel\(visual, panel\)/);
  assert.match(engineSource, /visual\.type === "area-model"/);
  assert.match(engineSource, /cells\.length !== rows \* columns/);
});
