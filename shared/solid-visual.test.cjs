const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(join(__dirname, "game-engine.js"), "utf8");
const context = {};
vm.runInNewContext(source, context);
const { geometryDescription } = context.MathTownGame;

test("a cuboid description names the three edges and a cube names one edge", () => {
  assert.equal(
    geometryDescription({ shape: "cuboid", length: 5, width: 3, height: 4, unit: "cm" }),
    "Prostopadłościan o krawędziach 5, 3, 4 cm."
  );
  assert.equal(
    geometryDescription({ shape: "cuboid", length: 4, width: 4, height: 4 }),
    "Sześcian o krawędzi 4."
  );
});

test("an incomplete cuboid falls back to its caption", () => {
  assert.equal(
    geometryDescription({ shape: "cuboid", length: 4, caption: "Szkic pudełka." }),
    "Szkic pudełka."
  );
});
