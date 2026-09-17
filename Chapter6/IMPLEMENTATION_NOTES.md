# Chapter 6 implementation notes — Ułamki dziesiętne

## Curriculum sources analysed

All 26 reference pages were visually inspected before implementation. They are
curriculum references only and are not shipped as product assets.

- `page_0189.png`: chapter opener; decimal prices in a zoo setting and short
  money stories.
- `page_0190.png`–`page_0193.png`: fractions with denominators 10, 100 and
  1000; decimal comma; tenths, hundredths and thousandths; mixed values, place
  value, money and decimal points on number lines.
- `page_0194.png`–`page_0196.png`: converting two-unit length expressions to
  decimal notation (mm–cm, cm–m and m–km) and back.
- `page_0197.png`–`page_0198.png`: converting mass units (g, dag, kg and t) to
  decimal notation and back.
- `page_0199.png`–`page_0201.png`: equal decimal representations, appending or
  removing trailing zeroes, and using this fact in unit conversions.
- `page_0202.png`–`page_0205.png`: comparing and ordering decimals by place
  value, locating them on a number line and comparing measurements written in
  different units.
- `page_0206.png`–`page_0208.png`: addition of decimals, aligning decimal
  commas, completing whole units and solving price/measurement stories.
- `page_0209.png`–`page_0212.png`: subtraction of decimals with regrouping,
  price differences, change, mass and measurement stories, and multi-step
  problems.
- `page_0213.png`: chapter review covering notation, unit conversions,
  comparison, addition and subtraction.
- `page_0214.png`: optional number-placement puzzles; used only as inspiration
  for original reasoning questions.

## Curriculum progression and vocabulary

The chapter moves from the meaning and notation of decimal fractions through
measurement applications, equivalent notation and comparison, then finishes
with addition and subtraction. Polish interface and explanations use:
`przecinek`, `część całkowita`, `części dziesiąte`, `setne`, `tysięczne`,
`wyrażenie dwumianowane`, `dopisywanie zer`, `porównywanie`, `suma`, `różnica`
and `przecinek pod przecinkiem`.

Values remain non-negative and age-appropriate. Decimal construction uses at
most three places. Arithmetic is generated with scaled integers so expected
answers are exact rather than the result of floating-point calculations.

## Stations and stable route IDs

1. `zapis-dziesietny` — tenths, hundredths, thousandths and decimal place
   value.
2. `os-dziesietna` — reading and reasoning about decimals on number lines.
3. `dlugosc` — mm/cm, cm/m and m/km conversions.
4. `masa` — g/dag, g/kg, dag/kg and kg/t conversions.
5. `rowne-zapisy` — equivalent decimal representations and trailing zeroes.
6. `porownywanie` — comparison signs and increasing/decreasing order.
7. `dodawanie` — mental and written decimal addition.
8. `odejmowanie` — mental and written decimal subtraction.
9. `zakupy` — original price, total, difference and change stories.
10. `dziesietne-zagadki` — place-value clues, error analysis and mixed
    reasoning.
11. `mix` — one generated question from every station, exactly 10 questions.

No curriculum topic was omitted. Length and mass were separated because their
conversion scales differ; money was separated from written arithmetic because
it exercises selecting an operation in context. The optional reference-page
puzzles were merged into `dziesietne-zagadki` instead of copying their layouts.

## Visual and architecture decisions

- The chapter uses the shared engine without changes.
- Equation visuals teach notation and place value; column visuals carry
  explicit top, bottom and operator strings for aligned addition/subtraction.
- Decimal number-line questions use the existing integer
  `fraction-numberline` data contract: the denominator is 10 or 100 and marked
  positions are integer numerators. The prompt and explanation translate that
  exact position to decimal-comma notation.
- CSS-only hero art uses price tags, a measurement ruler and a large decimal
  comma. No curriculum artwork or new bitmap asset is used.
- A custom decimal checker accepts a Polish comma or a dot and treats trailing
  zeroes as equal while rejecting fractions and malformed text.

## Implementation and verification status

- Curriculum analysis: complete.
- Chapter markup and generator: complete. Every advertised route returns 10
  questions; `mix` returns exactly one question from each of the 10 stations.
- Focused tests: complete. `questions.test.cjs` exercises contracts across
  hundreds of seeded rounds, the decimal checker, scaled arithmetic, number
  lines, unit conversions, mixed-route coverage and JSON persistence.
- Publication: complete. The homepage contains a real Chapter 6 link and still
  has exactly eight top-level cards. `service-worker.js` registers only the
  chapter document and `game.js`; no reference PNG is cached. Cache version was
  increased once from `v12` to `v13`.
- Required focused checks passed on 2026-09-17:
  - `node --test Chapter6/tests/*.test.cjs` — 11/11 passed;
  - `node --check Chapter6/game.js`;
  - `node --check shared/game-engine.js`;
  - `node --check service-worker.js`;
  - `git diff --check`.
- The full published-chapter suite completed with 47/48 passing. The one
  failure reproduces when run alone in the untouched
  `Chapter1/tests/round-visuals.test.cjs` (the test indexes a missing generated
  question and throws before checking its visual); it is unrelated to Chapter
  6 and was not hidden by changing Chapter 1.
- Browser verification remains outstanding because the available computer-use
  runtime reported no in-app browser or Chrome surface. When a browser is
  available, verify `file:` and local HTTP loading, a direct
  `?exercise=porownywanie` route, answer/hint/feedback/next/result flows,
  saved-round resume/restart, keyboard and live-region behaviour, desktop and
  320 px layouts, and a previously unused direct exercise URL while offline.
