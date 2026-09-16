# AI development guide — Matematyczne miasteczko

This file is the working contract for future AI-assisted development of this
application. Read it before changing the game.

## AI role and delivery standard

Act as a senior frontend educational-game developer and an
accessibility-focused reviewer. First inspect the existing relevant chapter and
the homepage before modifying anything. Preserve working behaviour unless the
requested feature explicitly changes it.

Deliver complete, working changes rather than mock-ups or partial snippets.
Before handing off, verify that referenced local files exist and that no new
network requests, CDN links, tracking, analytics or external dependencies were
introduced. Briefly report the affected files, the verification performed and
any known limitation.

## Product in one sentence

**Matematyczne miasteczko** is a friendly Polish maths game for children around
10 years old. It turns textbook topics into short, encouraging interactive
challenges.

The interface language, exercise wording, feedback and accessibility labels
must remain in Polish.

## Repository map

```text
index.html                    Main chapter-selection page
assets/math-town-mascot.png   Homepage illustration
Chapter1/index.html           Finished first chapter; CSS, markup and UI state
Chapter1/game.js              Chapter 1 configuration and question generators
Chapter1/tests/*.test.cjs     Node tests for exercise-generator correctness
shared/game-engine.js         Shared rounds, scoring, storage, rendering and controls
shared/game.css               Shared controls, answer states and responsive rules
CHAPTER_TEMPLATE.md           Minimum scaffold and release checklist
pages-3079/                   Reference pages / table of contents only
README.md                     Documentation for downloading reference pages
```

Chapter HTML owns its semantic screen structure and artwork. Chapter JavaScript
owns route labels and question generation. Shared round behavior lives in
`shared/game-engine.js`; do not copy it into a chapter. Common control and
answer-state styles live in `shared/game.css`, while chapter artwork stays local.

### File-structure decision for new chapters

Use the shared engine with this chapter structure:

```text
ChapterN/
  index.html          Semantic screen structure
  game.js             Route labels, question rules and engine configuration
  tests/*.test.cjs    Only tests for non-trivial generated rules
shared/               Shared engine and common control styles
```

Read `CHAPTER_TEMPLATE.md` for the question contract and checklist. Use HTML
for semantic structure, CSS for appearance and JavaScript for game logic. Do
not add a framework, bundler or package manager merely for a single chapter.

## Chapter map and routes

The homepage has one card per top-level chapter from the source table of
contents. Do not turn individual textbook subsections into homepage cards.

| No. | Chapter label | Planned route | Homepage icon idea |
| --- | --- | --- | --- |
| 1 | Liczby i działania | `Chapter1/index.html` | `+ −` |
| 2 | Systemy zapisywania liczb | `Chapter2/index.html` | number rows |
| 3 | Działania pisemne | `Chapter3/index.html` | vertical calculation |
| 4 | Figury geometryczne | `Chapter4/index.html` | triangle / angle |
| 5 | Ułamki zwykłe | `Chapter5/index.html` | fraction pie |
| 6 | Ułamki dziesiętne | `Chapter6/index.html` | `0,5` |
| 7 | Pola figur | `Chapter7/index.html` | grid |
| 8 | Prostopadłościany i sześciany | `Chapter8/index.html` | cube |

Only Chapter 1 currently exists. The other cards intentionally use a
`coming` class and display a “wkrótce” badge. When a chapter is implemented:

1. Create its `ChapterN/index.html`.
2. Remove `coming` from its corresponding homepage card.
3. Replace the short teaser with a child-friendly description of the actual
   exercises.
4. Confirm the card route works from the repository root.

### Navigation and shareable exercise routes

Use regular relative links so the site works both locally and when published
under a GitHub Pages repository path. The implemented chapter is available at
`Chapter1/index.html`. Each Chapter 1 exercise is a direct, shareable route in
the form `Chapter1/index.html?exercise=<exercise-id>` (for example,
`Chapter1/index.html?exercise=moreless`). Opening one of these URLs starts that exact
exercise. Keep these exercise IDs stable once shared; add new ones to
`routeLabels` in `Chapter1/game.js` and use the same ID in the exercise card
link. Query routes are intentional: GitHub Pages can serve the single static
chapter document directly without a server-side fallback for nested paths.
Use explicit `index.html` links rather than directory URLs so navigation also
works when the application is opened directly with the `file:` protocol.

## Offline availability

`service-worker.js` caches shared files and every entry in `PUBLISHED_CHAPTERS`.
Add a chapter document and all required local assets to that registry when it
is published. Increase `CACHE_NAME` for a release that changes compatible HTML,
scripts or styles. Activation removes only old caches with this application's
prefix. Query exercise URLs resolve to the cached chapter document without
changing the address. Unknown chapters show an explicit Polish offline page.

## Visual system

Match the established Chapter 1 look rather than introducing a new design
language.

- Background: warm cream paper with sparse, subtle dots and a soft green tint.
- Type: `Trebuchet MS`, with `Segoe UI` as fallback; chunky, high-contrast
  headings and easy-to-scan body copy.
- Primary colours: orange `#f47721`, teal `#3aa7a3`, yellow `#ffd166`, purple
  `#7b61c9`, pink `#ef6b8d`, green `#56a96f`, charcoal ink `#28252f`.
- Shapes: generously rounded cards (18–28 px), small warm shadows, clear
  borders, playful slight rotations only on decorative elements.
- Icons: use the shared homepage treatment — a bold charcoal outline, rounded
  colour-tinted square and one simple maths symbol/shape. Avoid a mix of
  unrelated emoji styles.
- Voice: supportive and specific. Prefer “Brawo, dobrze policzone!” and a
  useful next hint over language that frames a wrong answer as failure.

If a new bitmap illustration is genuinely needed, it should be a bright,
rounded children’s-game asset with no embedded text. Save project-bound assets
under `assets/`, use descriptive filenames and do not overwrite an existing
asset without an explicit request.

## Exercise and interaction rules

- A round should be short: Chapter 1 uses 10 questions.
- Every generated exercise needs a correct answer, a helpful hint, a concise
  explanation and an appropriate visual when it aids understanding.
- Never rely on colour alone to communicate correctness. Keep the textual
  feedback and selected/correct-answer states.
- Preserve keyboard operation: visible focus indicators, Enter to submit, and
  buttons rather than clickable `div`s.
- Keep layouts usable from 320 px wide upward. Test desktop and narrow mobile
  breakpoints whenever changing CSS.
- Use `textContent` for dynamic text unless deliberately rendering trusted,
  static markup. Do not interpolate untrusted text into `innerHTML`.
- Keep progress/best-score data local to the browser. Do not add accounts,
  analytics, network calls or third-party scripts unless specifically asked.
- The engine stores version 2 data under `matematyczneMiasteczkoState:v2`.
  Rounds and best scores use stable `chapterId:exerciseId` keys. Each round
  includes its generated questions, current answer, hint state, position and
  score statistics. Clear only the completed or explicitly restarted round.
  The engine migrates the old Chapter 1 slot and preserves an unidentified old
  best score as a separate Chapter 1 legacy record. Keep storage optional.

### Implementation conventions

- The entire application must run offline from local files in a modern browser.
- Use native HTML, CSS and vanilla JavaScript only. Never add remote fonts,
  images, APIs, CDNs or third-party libraries.
- Use `addEventListener` for interaction; never introduce inline handlers such
  as `onclick`.
- Use `const` and `let`, never `var`. Keep functions focused and name them for
  what they do.
- Keep mutable game state grouped in one clearly named state object or module.
  Keep question rules, rendering and DOM/UI updates separate where practical.
- Use comments only for non-obvious maths/game logic; code and names should
  explain ordinary behaviour.
- Prefer semantic elements (`header`, `main`, `section`, `aside`, `button`,
  `footer`) and native controls. Add ARIA only when native semantics do not
  express the needed information.
- Maintain visible keyboard focus. Aim for at least 4.5:1 contrast for normal
  text, and do not communicate a result solely through colour.
- For a keyboard-controlled activity, prevent the browser’s default scrolling
  only for keys the game actually handles. Never prevent normal typing in an
  input field.
- If storing progress or a best score, use `localStorage` defensively: the game
  must still function if storage is unavailable or throws an error.

### Animation and rendering

Most current activities are question-and-answer screens, so DOM/CSS rendering
is the default. Use a canvas only when a future activity needs a genuine
real-time board or drawing surface; do not mix canvas and DOM rendering for the
same game state without a clear reason.

For real-time activities, use `requestAnimationFrame` with elapsed time rather
than a fixed-rate interval. Keep the timing/game-rule calculation independent
from drawing and UI updates.

## Working with source pages

The files in `pages-3079/` are reference material for curriculum structure and
topic wording. They are **not** application assets. Do not copy watermark-laden
pages, book illustrations, or textbook exercises directly into the game. Create
original questions and visuals that teach the same skill.

## Verification before handoff

Run the existing generator tests after changes to Chapter 1 question logic:

```powershell
node --test Chapter1/tests/*.test.cjs
```

For a new chapter, add equivalent focused tests for generated values, answers,
range boundaries and any special rules. Also manually check:

1. Homepage → chapter route works.
2. A full round can be completed with both correct and incorrect answers.
3. Hint, progress, results and restart behave correctly.
4. Page remains legible and touch-friendly at a narrow viewport.
5. The main page still has exactly eight top-level chapter cards.

Use the keyboard and screen-reader checklist in `CHAPTER_TEMPLATE.md` for every
new chapter. At 320 px, verify the question appears before the help sidebar and
that diagrams and controls do not cause horizontal scrolling.

### Test policy: minimal and purposeful

Do not add unit tests merely because a file changed. Add a small Node test only
when code creates values dynamically or contains a rule that is easy to get
wrong, for example: randomly generated answers, score calculations, exercise
range boundaries, fractions that need simplification, timer transitions or
progress persistence. Test the rule, not CSS details or static wording.

Keep tests deterministic where possible. A minimal test should check the
answer, hint/context consistency and important minimum/maximum values. The
existing Chapter 1 tests are the model; their command is:

```powershell
node --test Chapter1/tests/*.test.cjs
```

Documentation-only and presentation-only changes do not need new automated
tests, but still need a quick reference/link check.

## Suggested handoff format

For a normal implementation response, give the outcome first, then include:

1. A short architecture summary — rendering choice; locations of state, rules,
   rendering, input and UI updates.
2. A concise file list of created or changed files.
3. Verification performed: automated command(s), plus the manual flows checked.
4. Any accessibility choice that materially affected the design and any known
   limitation or sensible future improvement.

Do not paste entire unchanged files unless the user explicitly requests
copy-ready source code.

## Change discipline

- Keep changes scoped to the requested feature. Do not rewrite the finished
  Chapter 1 while adding another chapter.
- Reuse the colour variables and interaction patterns above instead of adding
  frameworks or external UI dependencies.
- Prefer plain HTML, CSS and JavaScript; the project currently has no build
  step or package manager.
- Update this guide whenever chapter routes, shared design rules, test commands
  or the project architecture materially change.
