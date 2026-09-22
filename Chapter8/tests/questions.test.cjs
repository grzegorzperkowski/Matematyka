const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(join(__dirname, "..", "game.js"), "utf8");
const engineSource = readFileSync(join(__dirname, "..", "..", "shared", "game-engine.js"), "utf8");

function loadConfig(seed = 20260922) {
  const math = Object.create(Math);
  math.random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  let config;
  const engineContext = { Math: math };
  vm.runInNewContext(engineSource, engineContext);
  vm.runInNewContext(source, { Math: math, MathTownGame: { ...engineContext.MathTownGame, start(value) { config = value; } } });
  return config;
}

function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function foldCube(cells) {
  if (!Array.isArray(cells) || cells.length !== 6) return null;
  const keyOf = (r, c) => `${r},${c}`;
  const present = new Set(cells.map(([r, c]) => keyOf(r, c)));
  if (present.size !== 6) return null;
  const seen = new Set([keyOf(cells[0][0], cells[0][1])]);
  const queue = [cells[0]];
  while (queue.length) {
    const [r, c] = queue.shift();
    [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(([nr, nc]) => {
      const key = keyOf(nr, nc);
      if (present.has(key) && !seen.has(key)) {
        seen.add(key);
        queue.push([nr, nc]);
      }
    });
  }
  if (seen.size !== 6) return null;
  const state = new Map();
  state.set(keyOf(cells[0][0], cells[0][1]), { normal: [0, 0, 1], up: [0, 1, 0] });
  const walk = [cells[0]];
  while (walk.length) {
    const [r, c] = walk.shift();
    const current = state.get(keyOf(r, c));
    const right = cross(current.up, current.normal);
    const moves = [
      [-1, 0, current.up, [-current.normal[0], -current.normal[1], -current.normal[2]]],
      [1, 0, [-current.up[0], -current.up[1], -current.up[2]], current.normal],
      [0, 1, right, current.up],
      [0, -1, [-right[0], -right[1], -right[2]], current.up]
    ];
    for (const [dr, dc, newNormal, newUp] of moves) {
      const nr = r + dr;
      const nc = c + dc;
      const key = keyOf(nr, nc);
      if (!present.has(key)) continue;
      if (state.has(key)) {
        const existing = state.get(key).normal;
        if (existing.some((value, index) => value !== newNormal[index])) return null;
        continue;
      }
      for (const value of state.values()) {
        if (value.normal.every((part, index) => part === newNormal[index])) return null;
      }
      state.set(key, { normal: [...newNormal], up: [...newUp] });
      walk.push([nr, nc]);
    }
  }
  return state.size === 6 ? state : null;
}

function numberedCells(cells) {
  return [...cells].sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(([row, column], index) => ({ row, column, label: String(index + 1) }));
}

function oppositeLabel(cells, face) {
  const numbered = numberedCells(cells);
  const selected = numbered.find((cell) => cell.label === String(face));
  const state = foldCube(numbered.map((cell) => [cell.row, cell.column]));
  const normal = state.get(`${selected.row},${selected.column}`).normal;
  const target = normal.map((value) => -value);
  let oppositeKey = "";
  for (const [key, value] of state) {
    if (value.normal.every((part, index) => part === target[index])) oppositeKey = key;
  }
  const [row, column] = oppositeKey.split(",").map(Number);
  return numbered.find((cell) => cell.row === row && cell.column === column).label;
}

function neighborCount(cells, face) {
  const numbered = numberedCells(cells);
  const selected = numbered.find((cell) => cell.label === String(face));
  const present = new Set(numbered.map((cell) => `${cell.row},${cell.column}`));
  return [[-1, 0], [1, 0], [0, -1], [0, 1]].filter(([dr, dc]) => present.has(`${selected.row + dr},${selected.column + dc}`)).length;
}

function rectanglesOverlap(rects) {
  return rects.some((first, index) => rects.slice(index + 1).some((second) => {
    const overlapX = Math.min(first.x + first.w, second.x + second.w) - Math.max(first.x, second.x);
    const overlapY = Math.min(first.y + first.h, second.y + second.h) - Math.max(first.y, second.y);
    return overlapX > 1e-6 && overlapY > 1e-6;
  }));
}

const fixedAnswers = {
  "cuboid-name": "prostopadłościan",
  "cube-name": "sześcian",
  spatial: "figurą przestrzenną",
  "face-shape": "prostokąty",
  "cube-face-shape": "jednakowe kwadraty",
  "not-cuboid-trait": "ma podstawy w kształcie koła",
  "cube-is-cuboid": "tak",
  "cuboid-is-always-cube": "nie",
  "congruent-parallel": "tak",
  "perpendicular-vertex": "tak",
  "square-bases": "jednakowymi kwadratami",
  "edge-on-face-parallel": "nie",
  "tab-is-face": "nie",
  "smallest-12": "3 × 2 × 2"
};

const factAnswers = {
  faces: 6,
  edges: 12,
  vertices: 8,
  "from-vertex": 3,
  "faces-at-vertex": 3,
  "edges-on-face": 4,
  "parallel-pairs": 3,
  "parallel-to-face": 1,
  "perpendicular-faces": 4,
  "parallel-edges": 3,
  "perpendicular-edges": 4,
  "cube-faces": 6,
  "net-squares": 6,
  "remaining-pairs": 2
};

function expectedAnswer(question) {
  const model = question.model;
  const [a, b, c] = model.dimensions || [];
  if (model.kind === "fact") return factAnswers[model.rule];
  if (model.kind === "choice-fixed") return fixedAnswers[model.rule];
  if (model.kind === "is-cube") return model.dimensions.every((value) => value === model.dimensions[0]) ? "tak" : "nie";
  if (model.kind === "vertices-left") return 8 - model.have;
  if (model.kind === "edges-left") return 12 - model.have;
  if (model.kind === "edge-count") return model.dimensions.filter((value) => value === model.target).length * 4;
  if (model.kind === "edge-sum") return 4 * model.dimensions.reduce((total, value) => total + value, 0);
  if (model.kind === "vertex-sum") return model.dimensions.reduce((total, value) => total + value, 0);
  if (model.kind === "longest") return Math.max(...model.dimensions);
  if (model.kind === "shortest") return Math.min(...model.dimensions);
  if (model.kind === "cube-edge") return model.total / 12;
  if (model.kind === "missing-edge") return model.total / 4 - model.known[0] - model.known[1];
  if (model.kind === "ribbon") return 2 * (a + b) + 2 * (a + c) + model.bow;
  if (model.kind === "edge-sum-diff") {
    const total = (values) => 4 * values.reduce((sum, value) => sum + value, 0);
    return Math.abs(total(model.first) - total(model.second));
  }
  if (model.kind === "third-face") return `${Math.min(a, c)} cm × ${Math.max(a, c)} cm`;
  if (model.kind === "net-valid") return foldCube(model.cells) ? "tak" : "nie";
  if (model.kind === "net-opposite") return Number(oppositeLabel(model.cells, model.face));
  if (model.kind === "net-neighbors") return neighborCount(model.cells, model.face);
  if (model.kind === "base-area") return a * b;
  if (model.kind === "side-area") return a * c;
  if (model.kind === "surface") return 2 * (a * b + b * c + c * a);
  if (model.kind === "cube-surface") return 6 * model.edge * model.edge;
  if (model.kind === "cube-face") return model.edge * model.edge;
  if (model.kind === "cube-edge-from-surface") {
    const edge = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].find((value) => 6 * value * value === model.surface);
    return edge;
  }
  if (model.kind === "walls") return 2 * (a + b) * c;
  if (model.kind === "walls-ceiling") return 2 * (a + b) * c + a * b;
  if (model.kind === "cube-extra") return 5 * model.edge * model.edge;
  if (model.kind === "largest-faces") return 2 * Math.max(a * b, b * c, c * a);
  if (model.kind === "window") return model.face[0] * model.face[1] - model.hole * model.hole;
  if (model.kind === "tiles") return 2 * (a * b + b * c + c * a) / (model.tile * model.tile);
  if (model.kind === "pool") return a * b + 2 * (a + b) * c;
  if (model.kind === "stack-sum") return model.heights.reduce((total, value) => total + value, 0);
  if (model.kind === "stack-top") return model.heights.filter((value) => value > 0).length;
  if (model.kind === "stack-max") return Math.max(...model.heights);
  if (model.kind === "stack-front") {
    let max = 0;
    for (let row = 0; row < model.heights.length / model.columns; row += 1) max = Math.max(max, model.heights[row * model.columns]);
    return max;
  }
  if (model.kind === "stack-gap") {
    const max = Math.max(...model.heights);
    return model.columns * model.rows * max - model.heights.reduce((total, value) => total + value, 0);
  }
  if (model.kind === "box-count") return a * b * c;
  if (model.kind === "box-top") return a * b;
  return undefined;
}

function validateVisual(visual) {
  assert.equal(typeof visual.caption, "string");
  assert.ok(visual.caption.length > 0);
  if (visual.type === "equation") {
    assert.equal(typeof visual.expression, "string");
    assert.ok(visual.expression.length > 0);
    return;
  }
  if (visual.type === "geometry") {
    assert.equal(visual.shape, "cuboid");
    ["length", "width", "height"].forEach((key) => assert.ok(Number.isFinite(visual[key]) && visual[key] > 0 && visual[key] <= 24));
    assert.equal(typeof visual.alt, "string");
    assert.ok(visual.alt.length > 0);
    return;
  }
  if (visual.type === "net") {
    assert.equal(typeof visual.alt, "string");
    if (visual.faces) {
      assert.ok(visual.faces.length >= 1 && visual.faces.length <= 8);
      assert.equal(rectanglesOverlap(visual.faces), false);
      visual.faces.forEach((face) => {
        assert.ok(face.w > 0 && face.h > 0);
        ["label", "widthLabel", "heightLabel"].forEach((key) => {
          if (face[key] !== undefined) assert.equal(typeof face[key], "string");
        });
      });
    } else {
      assert.ok(visual.cells.length >= 1 && visual.cells.length <= 12);
      const seen = new Set(visual.cells.map((cell) => `${cell.col},${cell.row}`));
      assert.equal(seen.size, visual.cells.length);
    }
    if (visual.legend !== undefined) assert.equal(typeof visual.legend, "string");
    return;
  }
  assert.equal(visual.type, "stack-plan");
  assert.ok(visual.columns >= 1 && visual.columns <= 6);
  assert.ok(visual.rows >= 1 && visual.rows <= 5);
  assert.equal(visual.heights.length, visual.columns * visual.rows);
  visual.heights.forEach((value) => assert.ok(Number.isInteger(value) && value >= 0 && value <= 6));
  assert.equal(typeof visual.alt, "string");
}

function validateQuestion(question, route) {
  assert.equal(question.routeId, route === "mix" ? question.routeId : route);
  assert.ok(["input", "choice"].includes(question.kind));
  ["prompt", "label", "hint", "explanation", "method"].forEach((key) => assert.equal(typeof question[key], "string"));
  assert.ok(question.prompt.length > 0 && question.hint.length > 0 && question.explanation.length > 0);
  const answer = expectedAnswer(question);
  assert.notEqual(answer, undefined, `${route} ${question.model.kind}`);
  assert.equal(question.answer, answer, `${route} ${question.prompt}`);
  if (typeof question.answer === "number") assert.equal(Number.isInteger(question.answer), true, question.prompt);
  if (question.kind === "choice") {
    const values = question.options.map((option) => option.value);
    assert.ok(values.length >= 2);
    assert.equal(new Set(values).size, values.length);
    assert.ok(values.includes(question.answer));
  }
  if (question.visual) validateVisual(question.visual);
}

test("the eleven canonical cube nets fold and the rejected figures do not", () => {
  const { helpers } = loadConfig();
  const latin = helpers.parseNet([".#.", "####", ".#."]);
  assert.ok(foldCube(latin));
  assert.equal(oppositeLabel(latin, 3), "5");
  assert.equal(helpers.foldCube(latin) !== null, foldCube(latin) !== null);
  helpers.cubeNets.forEach((rows) => {
    const cells = helpers.parseNet(rows);
    assert.equal(cells.length, 6);
    assert.ok(foldCube(cells), rows.join("/"));
    assert.ok(helpers.foldCube(cells));
  });
  helpers.invalidNets.forEach((rows) => {
    const cells = helpers.parseNet(rows);
    assert.equal(foldCube(cells), null, rows.join("/"));
    assert.equal(helpers.foldCube(cells), null);
  });
  assert.equal(helpers.surfaceArea(4, 3, 2), 2 * (12 + 6 + 8));
  assert.equal(helpers.edgeCount([5, 5, 2], 5), 8);
  assert.equal(helpers.edgeCount([4, 4, 4], 4), 12);
});

test("every Chapter 8 route returns 10 solved questions and mix covers every station", () => {
  for (let seed = 1; seed <= 12; seed += 1) {
    const config = loadConfig(seed);
    const focused = Object.keys(config.routeLabels).filter((route) => route !== "mix");
    assert.equal(focused.length, 10);
    focused.forEach((route) => {
      const questions = config.buildQuestions(route);
      assert.equal(questions.length, 10, route);
      questions.forEach((question) => validateQuestion(question, route));
    });
    const mix = config.buildQuestions("mix");
    assert.equal(mix.length, 10);
    assert.equal([...mix.map((question) => question.routeId)].sort().join("|"), [...focused].sort().join("|"));
    mix.forEach((question) => validateQuestion(question, "mix"));
  }
});
