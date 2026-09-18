const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(join(__dirname, "game-engine.js"), "utf8");
const context = { URL, URLSearchParams };
vm.runInNewContext(source, context);
const {
  polishCount, polishVerb, questionMethod, rememberedMethods, lastAnsweredQuestion,
  resumeSummary, omittedMixStations, normalizeHintSteps, hintHelpSummary, unfinishedHomeChips,
  roundHasProgress, directoryRedirectHref, chapterPlayHref
} = context.MathTownGame;

test("Polish count and verb helpers follow the few/many rule", () => {
  assert.equal(polishCount(1, "bilet", "bilety", "biletów"), "1 bilet");
  assert.equal(polishCount(2, "bilet", "bilety", "biletów"), "2 bilety");
  assert.equal(polishCount(5, "bilet", "bilety", "biletów"), "5 biletów");
  assert.equal(polishCount(12, "bilet", "bilety", "biletów"), "12 biletów");
  assert.equal(polishCount(22, "bilet", "bilety", "biletów"), "22 bilety");
  assert.equal(polishVerb(1, "kosztuje", "kosztują"), "kosztuje");
  assert.equal(polishVerb(2, "kosztuje", "kosztują"), "kosztują");
  assert.equal(polishVerb(5, "kosztuje", "kosztują"), "kosztuje");
});

test("method labels prefer an explicit method and skip a generic Zadanie label", () => {
  assert.equal(questionMethod({ method: "szukanie różnicy", label: "O ile więcej?" }), "szukanie różnicy");
  assert.equal(questionMethod({ label: "O ile więcej?" }), "O ile więcej?");
  assert.equal(questionMethod({ label: "Zadanie" }), "");
  assert.deepEqual(Array.from(rememberedMethods([
    { method: "szukanie różnicy" },
    { method: "szukanie różnicy" },
    { method: "równe grupy" },
    { method: "nawiasy, potem potęgi" }
  ])), ["szukanie różnicy", "równe grupy"]);
});

test("resume copy names the station, step and last method, never the answer", () => {
  const round = {
    index: 3,
    answered: false,
    questions: [
      { method: "szukanie różnicy", label: "A", prompt: "x", answer: 9, hint: "h", explanation: "e" },
      { method: "równe grupy", label: "B", prompt: "y", answer: 12, hint: "h", explanation: "e" },
      { method: "iloraz i reszta", label: "C", prompt: "z", answer: 4, hint: "h", explanation: "e" },
      { method: "dopisz lub skreśl zera", label: "D", prompt: "w", answer: 70, hint: "h", explanation: "e" }
    ]
  };
  const last = lastAnsweredQuestion(round);
  assert.equal(questionMethod(last), "iloraz i reszta");
  const message = resumeSummary({
    stationName: "Sprytne rachunki",
    current: 4,
    total: 10,
    method: questionMethod(last)
  });
  assert.equal(message, "Sprytne rachunki, krok 4/10. Ostatni sposób: iloraz i reszta.");
  assert.doesNotMatch(message, /\b12\b|\b70\b/);
});

test("hint steps stay a boolean list and the result names them as help", () => {
  assert.deepEqual(Array.from(normalizeHintSteps([true, "yes", false], 4)), [true, false, false, false]);
  assert.equal(hintHelpSummary(1), "Podpowiedź pomogła w 1 kroku — to nauka, nie porażka.");
  assert.equal(hintHelpSummary(3), "Podpowiedź pomogła w 3 krokach — to nauka, nie porażka.");
  assert.equal(hintHelpSummary(0), "");
});

test("mix omission lists focused stations missing from the round", () => {
  const labels = { park: "Park", powers: "Potęgi", mix: "Przejażdżka" };
  assert.deepEqual(Array.from(omittedMixStations(labels, [{ routeId: "park" }])), ["powers"]);
  assert.deepEqual(Array.from(omittedMixStations(labels, [{ label: "Park" }])), []);
});

test("homepage chips point at unfinished chapter rounds without inventing answers", () => {
  const sample = { kind: "input", label: "Test", prompt: "Ile?", answer: 12, hint: "Policz.", explanation: "12." };
  const round = {
    mode: "plusminus",
    questions: Array.from({ length: 10 }, () => sample),
    index: 3,
    score: 20,
    streak: 0,
    correct: 2,
    answered: false,
    hintUsed: false,
    currentAnswer: "5"
  };
  assert.equal(roundHasProgress(round), true);
  const chips = unfinishedHomeChips({
    version: 2,
    rounds: { "chapter1:plusminus": round }
  }, [{ id: "chapter1", title: "Liczby i działania", href: "Chapter1/index.html" }]);
  assert.deepEqual(JSON.parse(JSON.stringify(chips)), [{
    href: "Chapter1/index.html?exercise=plusminus&resume=1",
    label: "Dokończ: Liczby i działania",
    detail: "krok 4/10"
  }]);

  const abandoned = { ...round, correct: 0, score: 0, index: 2, currentAnswer: "5" };
  assert.equal(roundHasProgress(abandoned), false);
  assert.deepEqual(JSON.parse(JSON.stringify(unfinishedHomeChips({
    version: 2,
    rounds: { "chapter1:plusminus": abandoned }
  }, [{ id: "chapter1", title: "Liczby i działania", href: "Chapter1/index.html" }]))), []);
});

test("chapter play URLs keep a directory slash so query routes do not become /Chapter1?exercise=", () => {
  assert.equal(
    directoryRedirectHref("http://localhost:3000/Chapter1"),
    "http://localhost:3000/Chapter1/"
  );
  assert.equal(directoryRedirectHref("http://localhost:3000/Chapter1/"), null);
  assert.equal(directoryRedirectHref("http://localhost:3000/Chapter1/index.html"), null);
  assert.equal(directoryRedirectHref("file:///C:/Sources/Matemetyka/Chapter1/index.html"), null);
  assert.equal(
    chapterPlayHref("http://localhost:3000/Chapter1", "park"),
    "http://localhost:3000/Chapter1/?exercise=park"
  );
  assert.equal(
    chapterPlayHref("http://localhost:3000/Chapter1/", "park"),
    "http://localhost:3000/Chapter1/?exercise=park"
  );
  assert.equal(
    chapterPlayHref("http://localhost:3000/Chapter1/index.html", "park"),
    "http://localhost:3000/Chapter1/index.html?exercise=park"
  );
  assert.equal(
    chapterPlayHref("https://example.github.io/Matemetyka/Chapter1", "park"),
    "https://example.github.io/Matemetyka/Chapter1/?exercise=park"
  );
  assert.equal(
    chapterPlayHref("file:///C:/Sources/Matemetyka/Chapter1/index.html", "park"),
    "file:///C:/Sources/Matemetyka/Chapter1/index.html?exercise=park"
  );
});
