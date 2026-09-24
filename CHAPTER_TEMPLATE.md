# New chapter implementation contract

Use this contract for every new chapter and for material changes to an existing
one. Read it together with `AI_DEVELOPMENT_GUIDE.md`; the guide owns shared
project rules, while this file owns the chapter workflow and release checklist.

## 1. Inspect before designing

Before editing application code:

1. Inspect `git status` and preserve unrelated user changes.
2. Read this file, `AI_DEVELOPMENT_GUIDE.md`, `shared/game-engine.js`,
   `shared/game.css`, `index.html` and `service-worker.js`.
3. Inspect at least one recently published chapter with similar interactions.
   Chapter 4 is the current structural example; select another chapter when its
   question type is a closer match.
4. Visually inspect every `ChapterN/page_*.png`. These ignored files are the
   authoritative curriculum starting point, not product assets.
5. Create `ChapterN/IMPLEMENTATION_NOTES.md` before implementation and keep it
   current after material milestones.

The notes must record:

- every analysed page or page range;
- concepts, vocabulary, worked methods and difficulty progression;
- an original station proposal and stable route ID for each topic;
- topics merged or omitted, with reasons;
- question types, value limits and useful visual ideas;
- architectural decisions, completed checks and remaining work.

Do not copy textbook wording, exercises, page images or watermarked artwork.

## 2. Minimum chapter structure

```text
ChapterN/
  index.html
  game.js
  IMPLEMENTATION_NOTES.md
  tests/*.test.cjs   # for generated maths and other non-trivial rules
```

`index.html` preserves the screen and control IDs expected by the shared engine
and loads files in this order:

1. `../shared/game.css`
2. `../shared/game-engine.js`
3. `game.js`

All links and scripts are relative. Use the shared engine; do not copy scoring,
persistence, screen management, answer submission, controls or result rendering
from another chapter.

The local `game.js` defines stable route IDs and starts the engine:

```js
MathTownGame.start({
  chapterId: "chapter5",
  chapterTitle: "Ułamki zwykłe",
  routeLabels: { czesci: "Części całości", mix: "Wielki obchód" },
  buildQuestions(exerciseId) {
    return makeQuestions(exerciseId);
  },
  answerCheckers: {
    // Add only when the built-in numeric or choice checker is insufficient.
  }
});
```

Do not rename published chapter or route IDs. Each advertised route, including
`mix`, returns exactly 10 original questions. Mix must include every focused
station. If a chapter has more than ten focused stations, keep ten questions,
rotate which station is omitted, and name the omitted station in the UI.

Chapter 1 is the published exception. `plusminus`, `moreless`, `multdiv`,
`by10`, `timesmore`, `remainder`, `powers`, `word` and `order` return 12
questions. `park`, `numberline` and `mix` stay at 10. The halfway encouragement
fires in the middle of the round: after question 5 when there are 10, and after
question 6 when there are 12.

When a published generator change makes already serialized questions visually
or mathematically incompatible, keep the route ID stable and set a larger
positive integer in `roundRevisions`, for example
`roundRevisions: { wycinanki: 2 }`. Only that route's older unfinished round is
then ignored and replaced on its next start; other routes and best scores stay
intact. Do not bump a revision for wording-only or backward-compatible changes.

## 3. Question contract

Every question has:

```js
{
  kind: "input",              // or "choice"
  checker: "fraction",        // optional custom checker
  label: "Części całości",
  method: "porównaj liczniki", // optional; the engine falls back to label
  prompt: "Jaka część figury jest zaznaczona?",
  answer: "3/4",
  hint: "Policz wszystkie równe części i zaznaczone części.",
  explanation: "Zaznaczono 3 z 4 równych części, czyli 3/4.",
  visual: null
}
```

For `choice`, add `options`, for example:

```js
[
  { value: "3/4", label: "3/4" },
  { value: "1/4", label: "1/4" }
]
```

Generate age-appropriate, unambiguous values. Avoid accidental negative or
non-integer answers unless the curriculum teaches them. Distractors should be
plausible but distinguishable. Use a custom checker only when the built-in
numeric and choice checking cannot represent a valid answer.

Each hint is actionable, and each explanation shows the reasoning. A visual is
optional: use `null` when it would be decorative, misleading or mathematically
incomplete.

## 4. Visual data contract

Available visual types are `story`, `equation`, `column`, `division`, `array`,
`sequence`, `difference`, `number`, `numberline`, `geometry`, `area-model`,
`fraction-model`, `fraction-numberline`, `net` and `stack-plan`.

Always pass explicit mathematical data:

- `column`: `top`, `bottom`, `operator`;
- `division`: `dividend`, `divisor`;
- `array`: `groups`, `itemsPerGroup`;
- `numberline`: `min`, `max`, `step`, `marked`;
- `geometry`: a required `shape` and its specific values.
- `area-model`: integer `rows` and `columns` from 1 to 12, plus a row-major
  `cells` array of exactly `rows * columns` values. Every value is `0` (empty),
  `0.5` (one triangular half) or `1` (one full square unit). Optional
  `showDimensions` adds side counts, with `unit` used only as their length unit;
  `outlineShape` traces the boundary of connected full cells. When every cell
  is `0.5`, `diagonalHalf` renders one diagonal across the complete grid and
  shades one of the two equal large triangles instead of shading every cell
  separately. `alt` and `caption` describe the mathematical purpose.
- `fraction-model`: `shape` (`bar`, `circle`, `grid` or `collection`), integer
  `numerator` and positive integer `denominator`; optional `groups`, and for a
  grid explicit `rows` and `columns` whose product matches the denominator.
  Optional `compare: { numerator, denominator }` draws a second labelled model
  beside the first for comparison; both denominators stay in `1–24`;
- `fraction-numberline`: positive integer `denominator`, integer
  `minNumerator`, `maxNumerator` and a `markedNumerators` array. Positions are
  numerator steps over the shared denominator, never floating-point values.
- `net`: either `cells` or `faces`, plus optional `legend`, `alt` and
  `caption`. `cells` is an array of 1–12 unit squares `{ col, row, label? }`
  with integer coordinates from 0 to 11 and no repeated position. `faces` is
  an array of 1–8 rectangles `{ x, y, w, h, label?, widthLabel?, heightLabel? }`;
  coordinates are finite, sizes are positive and at most 30, and rectangles may
  touch but must not overlap in area. Every label is a string of at most 24
  characters. `legend`, when present, is visible text and is not inferred from
  the prompt.
- `stack-plan`: integer `columns` from 1 to 6, integer `rows` from 1 to 5, and
  a row-major `heights` array of exactly `columns * rows` integers from 0 to 6.
  Row 0 is the front of the solid and is drawn at the bottom of the plan.
  `showHeights: false` shades occupied columns without writing the numbers.
  Optional `alt` and `caption` describe the plan.

Geometry shapes currently include:

- `point`: name and position where relevant;
- `line`: extent and point names;
- `polyline`: segments or lengths, and whether it is closed;
- `lines`: `relation`;
- `angle`: `degrees`;
- `polygon`: `sides`; optional `variant: "rhombus"` and `markEqualSides: true`
  draw a four-sided equal-length counterexample without implying right angles;
- `rectangle`: numeric `width` and `height`;
- `perimeter`: a `sides` array;
- `circle`: `feature`;
- `cuboid`: positive finite `length`, `width` and `height`, each at most 24.
  They are the three edges that meet at the front-bottom-left vertex: length
  across the front, width into the depth, height upward. Optional `unit` is
  only a label suffix. Optional `lengthLabel`, `widthLabel` and `heightLabel`
  are explicit strings drawn instead of the numbers. `showDimensions: true`
  draws any missing numeric label. Optional `highlight` is `"front"`, `"top"`,
  `"side"`, or an array of those; a highlighted face is also named in words
  (`przód`, `góra`, `bok`). The three edges at the hidden back-left corner are
  dashed. Supply `alt` when a label hides an unknown value.

Rectangle visuals may use `widthLabel` and `heightLabel` to show pedagogical
labels such as `9 m` and `? m` without deriving them from prompt text,
`areaLabel` to place a known area inside the figure, and `proportional: true`
to reflect the supplied side ratio within readable size limits. Supply `alt`
whenever a visible label intentionally hides an unknown value.

Do not infer visual values from prompt text. If a genuinely reusable teaching
visual is missing, add a backward-compatible renderer to
`shared/game-engine.js`, shared styles to `shared/game.css`, document its exact
data contract here and add focused tests. Do not add a renderer merely for
decoration.

## 5. Accessibility and responsive design

- Use native buttons, inputs and links rather than clickable `div`s.
- Keep visible focus and Enter-to-submit behaviour.
- Expose choice selection programmatically and distinguish the learner's wrong
  answer from the correct answer with text as well as styling.
- Keep feedback, hints, toasts and screen changes understandable through polite
  live regions. Do not remove the toast live region.
- Use `textContent` for generated content.
- At 320 px, place the question before the help panel and prevent horizontal
  overflow from diagrams or controls.
- Prefer a CSS-only chapter hero. Add a bitmap only when it has clear product
  value, store it under `assets/`, and never use curriculum page artwork.

## 6. Publish the chapter

When the chapter is playable:

1. Replace its unavailable homepage card with a semantic link to
   `ChapterN/index.html`, remove `coming`, and describe its actual exercises.
2. Preserve exactly eight top-level homepage cards.
3. Update the homepage hero only when the chapter should become the featured
   destination.
4. Extend `CHAPTERS` in `service-worker.js` and add any additional product
   assets to `APP_SHELL`. The chapter document and `game.js` are derived from
   the chapter number automatically.
5. Do not cache `page_*.png` curriculum references.
6. Increase `CACHE_NAME` once after all release changes are complete.

## 7. Automated verification

Add focused tests for each non-trivial generator rule. At minimum verify:

- every advertised route returns 10 valid questions;
- generated answers match their inputs;
- important boundaries and exactness rules;
- special visuals contain every value required by their renderer.

Run, substituting the actual chapter number:

```powershell
npm test
npm run check
git diff --check
```

`npm test` runs `node --test **/*.test.cjs`. The directory form of
`node --test ChapterN/tests` is unreliable here; after shared-engine edits run
the full glob. Do not hardcode `CACHE_NAME` in tests — assert it matches the
value exported by `service-worker.js`. Do not assert the homepage hero from a
chapter test; homepage checks live in `shared/home-offline.test.cjs`. Mix
coverage belongs in the chapter's own tests.

If shared code changed, also run all published chapter tests. Do not alter an
unrelated chapter merely to hide a pre-existing failure; report the evidence.

## 8. Manual release checklist

When a browser is available, verify:

1. The chapter works through `file:` and a local HTTP subpath.
2. A direct `index.html?exercise=<route-id>` opens the correct station.
3. Correct answer, wrong answer, hint, explanation, next question, results,
   saved-round resume and restart all work.
4. A full round is keyboard-operable and focus moves predictably.
5. Choice, hint, feedback and screen changes are announced intelligibly.
6. Desktop and 320 px layouts have readable contrast and no overflow.
7. After the cache is populated, a previously unused direct exercise URL works
   offline.

Do not claim manual verification when no browser was available. Record exact
remaining checks in `IMPLEMENTATION_NOTES.md`.

## 9. Handoff

Update `IMPLEMENTATION_NOTES.md` with final decisions and verification. Report
the implemented routes and teaching coverage, architecture, files changed,
automated/manual checks, limitations and the notes location.
