const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(join(__dirname, "..", "game.js"), "utf8");

function loadConfig(seed = 20260916) {
  const math = Object.create(Math);
  math.random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  let config;
  vm.runInNewContext(source, { Math: math, MathTownGame: { start(value) { config = value; } } });
  return config;
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function validateGeometry(visual) {
  assert.equal(visual.type, "geometry");
  assert.equal(typeof visual.caption, "string");
  assert.ok(visual.caption.length > 0);
  switch (visual.shape) {
    case "point":
      assert.match(visual.name, /^[A-Z]$/);
      break;
    case "line":
      assert.ok(["segment", "ray", "infinite"].includes(visual.extent));
      break;
    case "polyline":
      assert.ok(Number.isInteger(visual.segments) && visual.segments >= 1);
      assert.equal(typeof visual.closed, "boolean");
      if (visual.lengths) {
        assert.equal(visual.lengths.length, visual.segments);
        assert.ok(visual.lengths.every((value) => Number.isFinite(value) && value > 0));
      }
      break;
    case "lines":
      assert.ok(["parallel", "perpendicular", "intersecting", "double-perpendicular"].includes(visual.relation));
      break;
    case "angle":
      assert.ok(Number.isFinite(visual.degrees) && visual.degrees >= 0 && visual.degrees <= 360);
      if (visual.split !== undefined) assert.ok(visual.split > 0 && visual.split < 180);
      break;
    case "polygon":
      assert.ok(Number.isInteger(visual.sides) && visual.sides >= 3 && visual.sides <= 12);
      break;
    case "rectangle":
      assert.ok(Number.isFinite(visual.width) && visual.width > 0);
      assert.ok(Number.isFinite(visual.height) && visual.height > 0);
      break;
    case "perimeter":
      assert.ok(Array.isArray(visual.sides) && visual.sides.length >= 3);
      assert.ok(visual.sides.every((value) => value === null || (Number.isFinite(value) && value > 0)));
      break;
    case "circle":
      assert.ok(["radius", "diameter", "circumference", "disk", "center", "chord", "point"].includes(visual.feature));
      if (visual.feature === "point") assert.ok(["inside", "on", "outside"].includes(visual.pointPosition));
      break;
    default:
      assert.fail(`Unknown geometry shape: ${visual.shape}`);
  }
}

function validateQuestion(question, route) {
  assert.ok(["input", "choice"].includes(question.kind), route);
  for (const field of ["label", "prompt", "hint", "explanation"]) {
    assert.equal(typeof question[field], "string", `${route}.${field}`);
    assert.ok(question[field].length > 0, `${route}.${field}`);
    assert.doesNotMatch(question[field], /undefined|NaN/);
  }
  assert.ok((typeof question.answer === "number" && Number.isFinite(question.answer)) || typeof question.answer === "string");
  if (question.kind === "choice") {
    assert.ok(Array.isArray(question.options) && question.options.length >= 2);
    const values = question.options.map((option) => String(option.value));
    assert.equal(new Set(values).size, values.length, `${route}: choice values must be unique`);
    assert.ok(values.includes(String(question.answer)), `${route}: choices must include the answer`);
  }
  assert.ok(question.visual, `${route}: every diagrammed exercise should include its explicit visual data`);
  if (question.visual.type === "geometry") validateGeometry(question.visual);
  else {
    assert.equal(question.visual.type, "equation");
    assert.equal(typeof question.visual.expression, "string");
    assert.equal(typeof question.visual.caption, "string");
  }
}

test("every advertised route returns ten complete, valid questions", () => {
  const config = loadConfig();
  assert.equal(config.chapterId, "chapter4");
  assert.equal(config.chapterTitle, "Figury geometryczne");
  assert.equal(Object.keys(config.routeLabels).length, 11);
  for (const route of Object.keys(config.routeLabels)) {
    const questions = config.buildQuestions(route);
    assert.equal(questions.length, 10, route);
    questions.forEach((question) => validateQuestion(question, route));
  }
});

test("length conversions and broken-line sums match the generated data", () => {
  const config = loadConfig(11);
  for (let round = 0; round < 300; round += 1) {
    const q = config.buildQuestions("dlugosci");
    assert.equal(q[0].answer, Number(q[0].prompt.match(/(\d+) cm/)[1]) * 10);
    assert.equal(q[1].answer, Number(q[1].prompt.match(/(\d+) dm/)[1]) * 10);
    assert.equal(q[2].answer, Number(q[2].prompt.match(/(\d+) m/)[1]) * 100);
    assert.equal(q[3].answer, Number(q[3].prompt.match(/(\d+) km/)[1]) * 1000);
    assert.equal(q[4].answer, Number(q[4].prompt.match(/(\d+) mm/)[1]) / 10);
    assert.equal(q[5].answer, Number(q[5].prompt.match(/(\d+) cm/)[1]) / 100);
    assert.equal(q[6].answer, q[6].visual.lengths.reduce((sum, value) => sum + value, 0));
    const comparison = q[7].prompt.match(/ma (\d+) cm.+o (\d+) cm/);
    assert.equal(q[7].answer, Number(comparison[1]) + Number(comparison[2]));
    const multiple = q[8].prompt.match(/ma (\d+) cm.+jest (\d+) razy/);
    assert.equal(q[8].answer, Number(multiple[1]) * Number(multiple[2]));
    const mixed = q[9].prompt.match(/(\d+) cm i (\d+) mm/);
    assert.equal(q[9].answer, Number(mixed[1]) * 10 + Number(mixed[2]));
  }
});

test("angle classes obey exact degree boundaries", () => {
  const config = loadConfig(21);
  const expected = (degrees) => degrees < 90 ? "ostry" : degrees === 90 ? "prosty" : degrees < 180 ? "rozwarty" : degrees === 180 ? "półpełny" : degrees < 360 ? "wklęsły" : "pełny";
  for (let round = 0; round < 200; round += 1) {
    const questions = config.buildQuestions("katy");
    for (const question of questions.filter((item) => item.visual?.shape === "angle" && item.prompt.includes("nazywa się kąt"))) {
      assert.equal(question.answer, expected(question.visual.degrees));
    }
    assert.ok(questions.slice(0, 6).every((question) => question.visual.degrees >= 0 && question.visual.degrees <= 360));
  }
});

test("perimeters equal side sums and reverse rules stay exact", () => {
  const config = loadConfig(31);
  for (let round = 0; round < 300; round += 1) {
    const q = config.buildQuestions("obwody");
    for (const index of [0, 1, 2, 3, 6, 7, 8, 9]) {
      assert.equal(q[index].answer, q[index].visual.sides.reduce((sum, value) => sum + value, 0), `question ${index}`);
    }
    const triangle = q[2].visual.sides;
    assert.ok(Math.max(...triangle) < triangle.reduce((sum, value) => sum + value, 0) - Math.max(...triangle));
    const polygon = q[8].visual.sides;
    assert.ok(Math.max(...polygon) < polygon.reduce((sum, value) => sum + value, 0) - Math.max(...polygon));
    assert.equal(q[4].answer, q[4].visual.total / 4);
    assert.equal(q[5].answer, q[5].visual.total / 2 - q[5].visual.sides[0]);
    assert.ok(q.every((item) => Number.isInteger(item.answer) && item.answer > 0));
  }
});

test("circle diameter rules and scale factors produce integer answers", () => {
  const config = loadConfig(41);
  for (let round = 0; round < 300; round += 1) {
    const circle = config.buildQuestions("kola");
    assert.equal(circle[0].answer, circle[0].visual.value * 2);
    assert.equal(circle[1].answer, circle[1].visual.value / 2);
    assert.equal(circle[7].answer, circle[7].visual.value / 2);

    const scale = config.buildQuestions("skala");
    let match = scale[0].prompt.match(/1:(\d+).+ma (\d+) cm/);
    assert.equal(scale[0].answer, Number(match[1]) * Number(match[2]));
    match = scale[1].prompt.match(/ma (\d+) cm.+1:(\d+)/);
    assert.equal(scale[1].answer, Number(match[1]) / Number(match[2]));
    match = scale[2].prompt.match(/ma (\d+) mm.+skali (\d+):1/);
    assert.equal(scale[2].answer, Number(match[1]) * Number(match[2]));
    match = scale[3].prompt.match(/skali (\d+):1.+rysunku (\d+) mm/);
    assert.equal(scale[3].answer, Number(match[2]) / Number(match[1]));
    match = scale[4].prompt.match(/1:(\d+)/);
    assert.equal(scale[4].answer, Number(match[1]) / 100);
    match = scale[5].prompt.match(/1:(\d+).+wynosi (\d+) cm/);
    assert.equal(scale[5].answer, Number(match[1]) * Number(match[2]) / 100);
    match = scale[6].prompt.match(/1:(\d+)/);
    assert.equal(scale[6].answer, Number(match[1]) / 10);
    match = scale[7].prompt.match(/ma (\d+) cm.+i (\d+) cm/);
    assert.equal(scale[7].answer, Number(match[2]) / Number(match[1]));
    const denominators = [...scale[8].prompt.matchAll(/1:(\d+)/g)].map((item) => Number(item[1]));
    assert.equal(scale[8].answer, `1:${Math.min(...denominators)}`);
    match = scale[9].prompt.match(/ma.+?(\d+) cm.+1:(\d+)/);
    assert.equal(scale[9].answer, Number(match[1]) / Number(match[2]));
    assert.ok(scale.filter((item) => item.kind === "input").every((item) => Number.isInteger(item.answer) && item.answer > 0));
  }
});

test("mixed rounds sample each station exactly once", () => {
  const config = loadConfig(51);
  const labels = new Set([
    "Figury liniowe", "Położenie prostych", "Jednostki długości", "Rodzaje kątów",
    "Do kąta prostego", "Nazwy wielokątów", "Prostokąty", "Obwód kwadratu",
    "Promień i średnica", "Pomniejszenie"
  ]);
  for (let round = 0; round < 100; round += 1) {
    const questions = config.buildQuestions("mix");
    assert.equal(questions.length, 10);
    assert.equal(new Set(questions.map((question) => question.label)).size >= 7, true);
    assert.equal(questions.filter((question) => labels.has(question.label)).length >= 1, true);
    questions.forEach((question) => validateQuestion(question, "mix"));
  }
});

test("geometry visual objects are serializable for saved-round persistence", () => {
  const config = loadConfig(61);
  for (const route of Object.keys(config.routeLabels)) {
    const saved = plain(config.buildQuestions(route));
    assert.equal(saved.length, 10);
    saved.filter((question) => question.visual?.type === "geometry").forEach((question) => validateGeometry(question.visual));
  }
});
