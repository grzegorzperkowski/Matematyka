# Chapter 2 implementation notes

Last updated: 16 September 2026

## Task

Implement the interactive game for Chapter 2 in `Chapter2/`, matching Chapter 1's visual language and reusing `shared/game.css` and `shared/game-engine.js`. Keep all chapter-specific markup, artwork and question generators in `Chapter2/`. Update the homepage card and service worker when the chapter is ready.

## Required architecture

- Follow `AI_DEVELOPMENT_GUIDE.md` and `CHAPTER_TEMPLATE.md`.
- Use vanilla HTML, CSS and JavaScript only; no external dependency or network request.
- `Chapter2/index.html` must preserve the IDs expected by `shared/game-engine.js`.
- `Chapter2/game.js` starts the engine with `chapterId: "chapter2"` and stable route IDs.
- Use ten questions per route. Every generated question needs an answer, hint, explanation and helpful visual where suitable.
- Add focused Node tests for dynamic question-generation rules.
- Update Chapter 2's homepage card to a real `Chapter2/index.html` link, remove `coming`, update its description, and point the hero's primary link to Chapter 2 (Chapter 1 is already available via its card). *(Note: The homepage hero was subsequently permanently standardized to Chapter 1 ("Liczby i działania") per `AI_DEVELOPMENT_GUIDE.md` and commit `5f1b3ff`).*
- Update `service-worker.js`: add Chapter 2 HTML and JS to `PUBLISHED_CHAPTERS`, then bump the cache version.

## Existing project decisions

- Completed Chapter 1 is the UI/behaviour reference: `Chapter1/index.html`, `Chapter1/game.js`.
- Reuse shared engine and styles; do not copy scoring, storage, round persistence, rendering or event handling into the chapter.
- The shared engine supports `input` and `choice`, numeric/choice checking, and visual types: `story`, `equation`, `array`, `sequence`, `difference`, `number`, `numberline`.
- Product language is Polish; target learners are around 10 years old.
- Chapter source PNGs are curriculum references only. Do not reuse source images or copy textbook exercises verbatim.

## Source-page curriculum map

All files are `Chapter2/page_00NN.png`.

| Pages | Topic observed | Suitable original game route |
| --- | --- | --- |
| 57 | Overview: historical ways of recording numbers (tally marks, Maya dots/bars, Roman numerals) | `historia` — optional short, original warm-up / Roman basics |
| 58–63 | Decimal positional system, natural numbers, number names, digit places, number of digits, large-number abbreviations, number line, digit puzzles and palindromes | `dziesiatkowy` and `cyfry` |
| 64–65 | Comparing natural numbers and signs `<`, `>` | `porownywanie` |
| 66–69 | Mental arithmetic with large numbers, especially round-number multiplication/division | `duze` |
| 70–73 | Polish currency: złoty/grosz, converting and calculating money amounts | `pieniadze` |
| 74–78 | Length units: mm, cm, dm, m, km; conversions and simple word tasks | `dlugosc` |
| 79–82 | Mass units: g, dag, kg, t; conversions and weight word tasks | `masa` |
| 83–85 | Roman numerals: I, V, X, L, C, D, M and subtractive notation | `rzymskie` |
| 86–89 | Calendar, dates, months, leap years and weekdays | `kalendarz` |
| 90–92 | Clock reading and time-unit / elapsed-time questions | `zegary` |
| 93 | Chapter review across all topics | `mix` |

## Proposed menu and stable route IDs

1. `dziesiatkowy` — **Cyfrowa wieża**: place value, reading/writing numbers, digit place.
2. `porownywanie` — **Pojedynek liczb**: compare and sort natural numbers.
3. `duze` — **Wielkie rachunki**: mental calculations with thousands and zeros.
4. `pieniadze` — **Kasa miasteczka**: zł/grosz conversion, sums, change.
5. `dlugosc` — **Miary w ruchu**: length-unit conversions and route distances.
6. `masa` — **Waga odkrywcy**: g, dag, kg and t conversions.
7. `rzymskie` — **Rzymskie tajemnice**: Roman numerals, including simple subtraction pairs.
8. `kalendarz` — **Kalendarzowa wyprawa**: month lengths, date formats and weekdays.
9. `zegary` — **Zegarowa stacja**: clock times and time-unit conversions.
10. `mix` — mixed ten-question round (engine menu convention, not necessarily a standalone route label card).

## Visual and theme concept

Keep Chapter 1's cream/orange/teal/purple/pink palette, rounded panels and responsive layout. A Chapter 2-specific but consistent hero can be **"Biuro Liczb"** / number-post office: place-value parcels labelled J, D, S, T; a measuring tape; price tags; a compact Roman-numeral sign. These simple CSS shapes are justified as a cohesive way to make several abstract notation systems feel like one playful location, without new bitmap assets.

Avoid emoji-only mode-card icons. Match the homepage icon treatment with outlined, tinted squares and text/math glyphs.

## Work already completed

- Read `AI_DEVELOPMENT_GUIDE.md`, `CHAPTER_TEMPLATE.md`, `shared/game-engine.js`, `shared/game.css`, `Chapter1/index.html`, `Chapter1/game.js`, homepage and service worker.
- Verified `Chapter2/` currently contains 37 reference PNGs, pages 57–93, each 800×1139.
- Visually inspected every supplied source page, 57–93.
- Created `Chapter2/index.html` with the Chapter 1-compatible menu/game/result screen IDs and a CSS-only **Biuro Liczb** hero. The local artwork combines place-value towers, a ruler and Roman characters so the added visual has a direct teaching purpose.
- Created `Chapter2/game.js` with ten original questions for each of the nine core routes plus a mixed round. Roman numerals use a custom checker that accepts lowercase and whitespace variation.
- Added `Chapter2/tests/questions.test.cjs`, which verifies every route still creates valid ten-question rounds and the Roman checker behaves as intended.
- Updated the homepage so the second chapter is active and the primary hero link opens it.
- Updated `service-worker.js` with Chapter 2 assets and cache version `v3`.
- Updated `shared/game-engine.js` so an explicit custom text checker is not rejected by the numeric input guard. This is required for the documented custom checker API to support Roman numerals; numeric questions keep their existing validation.
- Automated checks run successfully: `node --test Chapter2/tests/*.test.cjs`, `node --test Chapter1/tests/*.test.cjs`, `node --check Chapter2/game.js`, `node --check shared/game-engine.js`, `node --check service-worker.js`, and `git diff --check`.

## Remaining manual check

No browser surface was available in the workspace at the time of implementation. When a browser is available, open `Chapter2/index.html?exercise=rzymskie` and one numeric route. Confirm the custom text field accepts `xiv`, hint/restart/saved-round paths work, and check the menu/game screens at 320px and desktop width.

## Verification to run before handoff

```powershell
node --test Chapter2/tests/*.test.cjs
node --test Chapter1/tests/*.test.cjs
```

Then manually test Chapter 2 through `file:` and a local HTTP server: direct query routes, correct/incorrect answers, choice controls, hints, result/restart, saved-round continuation, desktop and 320px width, and keyboard focus/Enter submission.
