# Chapter 7 implementation notes — Pola figur

## Curriculum sources analysed

All 14 reference pages were visually inspected before implementation. They are
curriculum references only and are not shipped, linked or cached as product
assets.

- `page_0215.png`: chapter opener; informal comparison of garden plots by the
  surface they occupy.
- `page_0216.png`–`page_0217.png`: the meaning of area; comparing figures by
  covering them with congruent shapes; counting square units and combining two
  half-squares into one square unit; an introductory tiling application.
- `page_0218.png`–`page_0221.png`: square units (`mm²`, `cm²`, `dm²`, `m²`,
  `km²`); rectangle area as rows times squares per row; square area; ensuring
  side lengths use the same unit; inverse side problems; comparison with
  perimeter; practical price, room, plot and composite-figure problems.
- `page_0222.png`–`page_0223.png`: conversions between neighbouring square
  units; the scale factor is squared (`10 · 10` or `100 · 100`); ares and
  hectares, including `1 a = 100 m²`, `1 ha = 100 a = 10 000 m²`.
- `page_0224.png`–`page_0226.png`: conservation of area under cutting and
  rearrangement; a diagonal halves a rectangle; finding areas of figures made
  from whole and half grid squares; estimating irregular surfaces by lower and
  upper bounds; a simple map-area application.
- `page_0227.png`: chapter review combining rectangle and square area,
  perimeter comparisons, square-unit conversions, ares/hectares and composite
  rectilinear figures.
- `page_0228.png`: optional subtraction game unrelated to areas; omitted from
  this chapter because it does not practise the chapter learning goals.

## Curriculum progression and vocabulary

The chapter moves from a concrete unit-square model to formulas, applications,
unit conversion and finally decomposition/rearrangement. Polish wording uses
`pole figury`, `jednostka pola`, `kwadrat jednostkowy`, `centymetr
kwadratowy`, `metr kwadratowy`, `długość`, `szerokość`, `pole prostokąta`,
`pole kwadratu`, `ar`, `hektar`, `wycinanie`, `układanie` and `figura
złożona`.

All generated lengths, areas and prices are non-negative integers. Rectangle
dimensions stay small enough for mental multiplication. Conversion questions
make the squared factor explicit and never treat area units like length units.
Input prompts name the requested output unit so numeric answers remain
unambiguous.

## Stations and stable route IDs

1. `kwadraty-jednostkowe` — count whole and half unit squares and compare
   equal-area grid figures.
2. `jednostki-pola` — choose suitable square units and interpret the superscript
   two.
3. `pole-prostokata` — calculate rectangle area from equal-unit side lengths.
4. `pole-kwadratu` — calculate square area and distinguish it from perimeter.
5. `brakujacy-bok` — recover a rectangle side from its area and the other side.
6. `figury-zlozone` — count newly generated connected shaded shapes, add
   rectangles or subtract a rectangular cut-out.
7. `zamiana-jednostek` — convert exact integer values among `mm²`, `cm²`,
   `dm²` and `m²` using squared scale factors.
8. `ary-hektary` — convert and reason with `a`, `ha` and `m²`.
9. `wycinanki` — reason about halves and conservation of area after cutting or
   rearranging.
10. `pola-w-praktyce` — original tiling, room, garden, cost and map-area
    stories.
11. `mix` — one generated question from every station, exactly 10 questions.

The chapter-review material is distributed across the ten stations instead of
being copied as a separate test. Approximation of circles and hand outlines is
represented only by the general idea of lower and upper square-count bounds;
the game does not pretend that CSS pixels are a physical measurement. The
optional subtraction game on `page_0228.png` is omitted as off-topic.

## Visual and architecture decisions

- The chapter uses the shared round engine for screens, scoring, persistence,
  answer handling and result rendering.
- A reusable `area-model` visual is added to the shared engine. Its exact data
  contract is `rows`, `columns`, a row-major `cells` array containing only
  `0`, `0.5` or `1`, and optional `unit`, `showDimensions`, `alt` and
  `caption`. The grid represents equal square units; half-cells are rendered
  as triangular halves. The renderer validates dimensions and every cell,
  creates SVG with DOM methods, and hides invalid restored visuals safely.
- Rectangle questions pass their side counts explicitly to the visual; area is
  never parsed from prompt text. Composite shapes pass every whole or half cell
  explicitly.
- Every `brakujacy-bok` question draws a proportional rectangle with the known
  side labelled, the unknown side marked `?`, and the given area inside. The
  accessible description exposes the same known data without revealing the
  missing length.
- The `figury-zlozone` generator creates five connected, non-rectangular
  polyominoes per round by growing each shape through shared sides on a fresh
  grid. Their row counts, answers and accessible descriptions come directly
  from the explicit cell array. The other five questions retain rectangular
  cut-outs, so learners practise both counting and decomposition.
- Equation visuals support unit-conversion and real-world reasoning where a
  detailed diagram would add no information.
- CSS-only hero art depicts a tiled planning board. No textbook imagery or new
  bitmap asset is used.
- `chapterId` is `chapter7`; published route IDs above are permanent.

## Implementation and verification status

- Curriculum analysis: complete.
- Chapter markup and generator: complete. Every advertised route returns 10
  questions; `mix` returns exactly one question from each of the 10 stations.
- The shared `area-model` renderer, its styles and its canonical contract are
  complete. Invalid restored data is hidden safely, full and triangular
  half-cells remain visually distinct, and all labels are created through DOM
  APIs rather than generated HTML.
- Publication: complete. The homepage contains a real Chapter 7 link, its hero
  points to the new chapter and exactly eight top-level cards remain.
  `service-worker.js` registers only the chapter document and `game.js`; none of
  the 14 reference PNGs is cached. The cache version was increased exactly once
  from `v13` to `v14`.
- Focused checks passed on 2026-09-17:
  - `node --test Chapter7/tests/*.test.cjs` — 16/16 passed;
  - `node --check Chapter7/game.js`;
  - `node --check shared/game-engine.js`;
  - `node --check service-worker.js`;
  - `git diff --check`;
  - static chapter audit — 35 unique IDs, required asset order correct, no
    inline event handlers or generated `innerHTML`.
- Because shared code changed, the complete published-chapter suite was run:
  63/64 tests passed. The sole failure reproduces the already documented,
  untouched `Chapter1/tests/round-visuals.test.cjs` problem: it searches a
  random round for a specific question, receives `undefined`, then reads its
  `visual` property. Chapters 2–7 all passed.
- Browser verification remains outstanding. The computer-use inventory was
  empty, and attempts to create both an in-app browser and an Edge tab returned
  `Browser is not available`. A local HTTP server could be started, but there
  was no browser surface with which to inspect it. When one is available,
  verify `file:` and local HTTP loading, a direct
  `?exercise=figury-zlozone` route, correct/wrong answer, hint, feedback,
  next/result, saved-round resume/restart, keyboard and live-region behaviour,
  desktop and 320 px layouts, and a previously unused direct route offline.

## Follow-up — random shaded grid figures

- Added an original randomized version of the shaded-grid area activity to the
  `figury-zlozone` route. Five of each route's ten questions now grow a new
  connected polyomino through shared cell sides; the other five retain
  rectangular decomposition and subtraction.
- The shared area renderer can optionally trace the outside boundary of full
  cells, making the generated figure readable as one shape while retaining the
  unit grid needed for counting.
- The focused generator test produced 500 shapes and verifies exact area,
  connectedness, non-rectangularity, cell validity and substantial variation.
  The updated focused suite passes 16/16, and the full suite remains clean
  except for the same unrelated Chapter 1 test described above.

## Follow-up — whole-rectangle diagonal

- Corrected the first `wycinanki` diagram: it now draws one corner-to-corner
  diagonal across the complete rectangle and shades one large triangular half.
  It no longer paints the same triangular half inside every unit square.
- Added the validated `diagonalHalf` option to the shared `area-model`
  contract. The grid is redrawn above the large shaded triangle, while the
  diagonal remains visually prominent and the accessible label describes one
  complete cut without exposing the answer.
- The `wycinanki` route now has saved-round revision 2. An unfinished revision
  1 round contains the old serialized diagram, so the engine ignores that
  incompatible round and starts a fresh one; other routes and best scores are
  preserved. The shared mechanism is documented in `CHAPTER_TEMPLATE.md` and
  covered by a focused persistence test.
- Chapter 7 remains 16/16 passing; the full published suite remains 63/64 with
  only the unchanged Chapter 1 random-test failure documented above.

## Follow-up — missing-side rectangle visual

- Replaced equations and answer-revealing full grids in `brakujacy-bok` with a
  proportional rectangle. The known horizontal side is labelled with its
  length, the vertical side is marked `?`, and the supplied area is displayed
  inside the figure.
- Extended the shared rectangle visual contract with explicit
  `widthLabel`, `heightLabel`, `areaLabel` and optional proportional sizing.
  The accessible label repeats only the known data.
- Raised only `brakujacy-bok` to saved-round revision 2, so existing serialized
  questions from that route are replaced on reload without affecting other
  saved stations or best scores. Chapter 7 remains 16/16 passing and the full
  suite remains 63/64 with the same unrelated Chapter 1 failure.
