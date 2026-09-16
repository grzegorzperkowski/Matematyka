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
`mix`, returns exactly 10 original questions.

## 3. Question contract

Every question has:

```js
{
  kind: "input",              // or "choice"
  checker: "fraction",        // optional custom checker
  label: "Części całości",
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
`sequence`, `difference`, `number`, `numberline` and `geometry`.

Always pass explicit mathematical data:

- `column`: `top`, `bottom`, `operator`;
- `division`: `dividend`, `divisor`;
- `array`: `groups`, `itemsPerGroup`;
- `numberline`: `min`, `max`, `step`, `marked`;
- `geometry`: a required `shape` and its specific values.

Geometry shapes currently include:

- `point`: name and position where relevant;
- `line`: extent and point names;
- `polyline`: segments or lengths, and whether it is closed;
- `lines`: `relation`;
- `angle`: `degrees`;
- `polygon`: `sides`;
- `rectangle`: numeric `width` and `height`;
- `perimeter`: a `sides` array;
- `circle`: `feature`.

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
4. Add the chapter document, `game.js` and all product assets to
   `PUBLISHED_CHAPTERS` in `service-worker.js`.
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
node --test ChapterN/tests/*.test.cjs
node --check ChapterN/game.js
node --check shared/game-engine.js
node --check service-worker.js
git diff --check
```

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
