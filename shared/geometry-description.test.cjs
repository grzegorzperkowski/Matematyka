const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(join(__dirname, "game-engine.js"), "utf8");
const context = {};
vm.runInNewContext(source, context);
const { geometryDescription } = context.MathTownGame;

test("a polygon with a numeric side count gets a description without evaluating perimeter data", () => {
  assert.equal(
    geometryDescription({ shape: "polygon", sides: 3 }),
    "Wielokąt o 3 bokach."
  );
});

test("a perimeter description includes every side length and its unit", () => {
  assert.equal(
    geometryDescription({ shape: "perimeter", sides: [3, 4, 5], unit: "cm" }),
    "Wielokąt o bokach 3, 4, 5 cm."
  );
});

test("perimeter descriptions safely fall back when side data is not an array", () => {
  assert.equal(
    geometryDescription({ shape: "perimeter", sides: 3, caption: "Obwód figury." }),
    "Obwód figury."
  );
});
