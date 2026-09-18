# AI development guide — Matematyczne miasteczko

This is the canonical project-wide guide for AI-assisted development. Read it
before changing the application. For chapter-specific implementation details,
follow `CHAPTER_TEMPLATE.md`.

## Documentation ownership

- `PRODUCT_FEATURE_BRIEF.md` is the canonical product input for feature-gap
  analysis and new-feature ideation. It describes the target users, current
  capabilities, meaningful constraints and unknowns without implementation
  detail. Every task that adds, removes or materially changes a user-facing
  feature must update this brief in the same change. The feature is not
  complete until the brief accurately describes the resulting product.
- This guide owns product rules, architecture, shared behaviour and general
  delivery standards.
- `CHAPTER_TEMPLATE.md` owns the workflow, data contract, tests and release
  checklist for a chapter.
- `NEW_CHAPTER_PROMPT_TEMPLATE.md` is only a short launcher for a new agent
  session. Do not copy detailed rules into it.
- `ChapterN/IMPLEMENTATION_NOTES.md` records curriculum analysis and decisions
  specific to one chapter.

When the architecture or published chapters change, update the appropriate
canonical document instead of adding another plan or duplicate checklist.

## Product and current status

**Matematyczne miasteczko** is a friendly Polish maths game for children around
10 years old. It turns textbook topics into short, encouraging interactive
challenges. Interface text, exercise wording, feedback and accessibility labels
remain in Polish.

Published chapters:

| No. | Title | Route | Status |
| --- | --- | --- | --- |
| 1 | Liczby i działania | `Chapter1/index.html` | published |
| 2 | Systemy zapisywania liczb | `Chapter2/index.html` | published |
| 3 | Działania pisemne | `Chapter3/index.html` | published |
| 4 | Figury geometryczne | `Chapter4/index.html` | published |
| 5 | Ułamki zwykłe | `Chapter5/index.html` | published |
| 6 | Ułamki dziesiętne | `Chapter6/index.html` | published |
| 7 | Pola figur | `Chapter7/index.html` | published |
| 8 | Prostopadłościany i sześciany | `Chapter8/index.html` | planned |

The homepage always has exactly eight top-level chapter cards. Unpublished
chapters remain visible as non-navigable cards with a Polish “wkrótce” label.

## Repository architecture

```text
index.html                         Chapter-selection page
assets/                            Product assets
ChapterN/index.html                Chapter markup and local artwork/styles
ChapterN/game.js                   Routes and question generators
ChapterN/IMPLEMENTATION_NOTES.md   Curriculum analysis and chapter decisions
ChapterN/tests/*.test.cjs          Focused generator/offline tests
ChapterN/page_*.png                Ignored curriculum reference pages
shared/game-engine.js              Rounds, scoring, storage and rendering
shared/game.css                    Shared controls, visuals and responsive rules
service-worker.js                  Offline application shell and chapter registry
CHAPTER_TEMPLATE.md                Chapter contract and release checklist
NEW_CHAPTER_PROMPT_TEMPLATE.md     Short prompt for starting the next chapter
```

Chapter HTML owns semantic screen structure and chapter artwork. Chapter
JavaScript owns stable route labels and question generation. Shared round
behaviour belongs in `shared/game-engine.js`; do not copy or fork it into a
chapter. Shared controls, answer states and reusable diagram styles belong in
`shared/game.css`.

Use native HTML, CSS and JavaScript. The project has no framework, package
manager, bundler or build step. All application paths are relative and must
work both through `file:` and under a hosted repository subpath.

## Stable routes and saved progress

Every exercise is directly shareable as:

```text
ChapterN/index.html?exercise=<exercise-id>
```

Use explicit `index.html` links because directory URLs do not work consistently
when opened from the file system. Once published, do not rename a `chapterId` or
exercise ID: `chapterId:exerciseId` is both a saved-progress key and part of the
public URL.

The engine stores version 2 data under
`matematyczneMiasteczkoState:v2`. Unfinished rounds and best scores are isolated
by chapter and exercise. Keep storage optional and defensive; the game must
still work when `localStorage` is unavailable or throws. Clear only the round
that was completed or explicitly restarted.

## Offline delivery

`service-worker.js` caches the shared application shell and every entry in
`PUBLISHED_CHAPTERS`. Publishing a chapter requires adding its document,
`game.js` and any real product assets to that registry, then increasing
`CACHE_NAME` exactly once for the release.

Do not cache `page_*.png` curriculum references. Query-string exercise routes
must resolve to the cached chapter document while preserving their URL. Cache
cleanup remains limited to this application's prefix, and an unknown uncached
chapter gets an explicit Polish offline response.

## Product and implementation rules

- Deliver complete working changes, not mock-ups or disconnected snippets.
- Preserve existing behaviour and unrelated working-tree changes.
- Keep generated exercises original; curriculum pages define topics and
  terminology but are not application assets.
- Keep rounds at 10 questions, including `mix`, unless the product and UI are
  deliberately changed together.
- Every question needs a correct answer, useful hint and concise explanation.
  Add a mathematical visual only when it accurately supports the concept.
- Never infer diagram data from fragments of display text. Pass explicit
  mathematical values to the renderer.
- Use `textContent` for generated content. Do not interpolate generated or
  untrusted text into `innerHTML`.
- Use `addEventListener`, `const` and `let`; do not add inline handlers or
  `var`.
- Keep question rules, rendering, mutable state and DOM updates separate where
  practical.
- Add shared engine behaviour only when more than one chapter can reasonably
  reuse it. Keep one-off theme artwork and styling local to the chapter.
- Do not introduce a backend, accounts, remote fonts, CDNs, third-party
  libraries or new network services unless explicitly requested.
- The existing GoatCounter integration is intentional. Do not expand, replace
  or remove analytics unless the task asks for it.

## Visual and interaction system

Match the established design rather than introducing a new visual language:

- warm cream background with subtle dots and a soft green tint;
- `Trebuchet MS`, with `Segoe UI` as fallback;
- orange `#f47721`, teal `#3aa7a3`, yellow `#ffd166`, purple `#7b61c9`,
  pink `#ef6b8d`, green `#56a96f` and ink `#28252f`;
- rounded cards, warm shadows, clear borders and restrained decorative
  rotations;
- simple outlined mathematical symbols rather than unrelated emoji styles;
- supportive, specific Polish feedback that explains the next step.

Use semantic HTML and native controls. Maintain visible focus, Enter-to-submit,
clear selected/correct states and polite live-region announcements. Never rely
on colour alone. At 320 px wide, show the question before the help panel and
keep diagrams and controls inside their card. Aim for at least 4.5:1 contrast
for normal text.

DOM/CSS is the default renderer. Use canvas only for a genuine real-time or
drawing activity. For real-time work, use `requestAnimationFrame` with elapsed
time and keep game rules independent from drawing.

## Curriculum sources

Ignored `ChapterN/page_*.png` files are reference material. Inspect all pages
for the target chapter before designing its routes. Extract topic order,
terminology, worked methods and age-appropriate limits, then record the analysis
in `ChapterN/IMPLEMENTATION_NOTES.md`.

Do not copy textbook questions, wording, watermarked illustrations or page
images into the product. Create original questions and visuals that teach the
same skills. The full workflow is in `CHAPTER_TEMPLATE.md`.

## Verification and delivery

Use focused Node tests for generated maths, boundary rules, question contracts,
storage, scoring and offline behaviour. Do not test static wording or CSS just
because a file changed.

After changing shared code, run every published chapter's tests. After changing
one chapter only, run that chapter's tests plus checks for any shared files that
changed. Always run JavaScript syntax checks and `git diff --check`. Perform
browser checks when a browser is available; never report source inspection as
manual verification.

Before handoff, check whether the work added, removed or materially changed
anything a user can experience. If it did, update `PRODUCT_FEATURE_BRIEF.md`:
move the capability into the correct status, revise the relevant journey or
feature inventory, remove obsolete “not currently present” statements and set
the verification date. Do not leave an implemented feature documented only in
a plan, audit or implementation note.

For handoff, lead with the result and briefly list teaching coverage,
architecture, changed files, automated/manual verification and any known
limitation. Keep `ChapterN/IMPLEMENTATION_NOTES.md` current so another agent can
resume without re-analysing unchanged curriculum pages.
