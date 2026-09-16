# New chapter template

This template is mandatory for every future chapter implementation. Read and
follow it together with `AI_DEVELOPMENT_GUIDE.md` before creating or changing a
chapter.

A new chapter uses the shared engine. Do not copy scoring, persistence, round
rendering, or button handling from another chapter.

## Minimum files

```text
ChapterN/
  index.html
  game.js
  tests/*.test.cjs   # only for non-trivial generator rules
```

`index.html` keeps the screen and control IDs used by
`shared/game-engine.js`, loads `../shared/game.css`, then
`../shared/game-engine.js`, and finally the local `game.js`. All links and
scripts must be relative so the chapter works both through `file:` and under a
hosting subpath.

The local `game.js` defines stable route IDs and starts the engine:

```js
MathTownGame.start({
  chapterId: "chapter2",
  chapterTitle: "Number writing systems",
  routeLabels: { roman: "Roman numerals" },
  buildQuestions(exerciseId) {
    return makeRomanQuestions(exerciseId);
  },
  answerCheckers: {
    // Optional. The engine already provides numeric and choice checking.
    roman(raw, answer) { return raw.trim().toUpperCase() === answer; }
  }
});
```

## Question format

Every question has these fields:

```js
{
  kind: "input",              // or "choice"
  checker: "roman",           // optional custom checker
  label: "Roman numerals",
  prompt: "Write 14 using Roman numerals.",
  answer: "XIV",
  hint: "10 is X and 4 is IV.",
  explanation: "14 = 10 + 4, so XIV.",
  visual: null
}
```

For `choice`, add `options`, for example
`[{ value: "XIV", label: "XIV" }, ...]`. Available visuals are `story`,
`equation`, `column`, `array`, `sequence`, `difference`, `number`, and `numberline`.
A diagram must always receive explicit mathematical data. `column` uses `top`,
`bottom` and `operator` to draw a right-aligned written calculation. `array` uses
`groups` and `itemsPerGroup`; `numberline` uses `min`, `max`, `step`, and
`marked`. Set `visual: null` when a visual would not help or cannot be drawn
correctly.

Each route generator returns 10 questions. The chapter and route IDs form part
of the saved-progress key, so do not rename them after publication.

## Publishing and manual testing

1. Add the chapter card to the homepage, remove its unavailable state, and make
   the entire card a semantic link to the chapter.
2. Add the document and every local asset to `PUBLISHED_CHAPTERS` in
   `service-worker.js`, then increase the cache version.
3. Open the chapter through `file:` and through a test HTTP subpath.
4. Complete one round with a keyboard: a correct and an incorrect answer, a
   choice, hint, next question, result, resume, and restart.
5. Check that a screen reader announces the choice, hint, feedback, and screen
   change without rereading the full page.
6. Check 320px and desktop widths: the question appears before the help panel,
   focus is visible, diagrams stay inside their card, and every control has
   readable contrast.
7. After populating the cache, open an unused
   `index.html?exercise=<id>` address offline and confirm the correct route
   appears.
