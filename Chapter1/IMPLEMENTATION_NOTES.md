# Chapter 1 implementation notes — Liczby i działania

Backfill of the live chapter (2026-09-18). Curriculum reference pages
`page_0011.png`–`page_0056.png` and `page_0094.png` were the original source
for topics and wording. They are not product assets.

## Stations and stable route IDs

1. `park` — Wesołe miasteczko: addition, subtraction, multiplication and remainder in short stories.
2. `plusminus` — Sprytne rachunki: convenient pairs, complements to 100, mental subtraction.
3. `moreless` — O ile więcej?: difference language, with a number-sequence item and a puzzle.
4. `multdiv` — Mnożenie i dzielenie: equal groups, including multiplication by zero.
5. `by10` — Przez 10, 100, ...: appending or removing zeros and grouping factors to 10 or 100.
6. `timesmore` — Razy więcej, razy mniej: scale language tied to × and ÷.
7. `remainder` — Dzielenie z resztą: quotient, remainder smaller than the divisor.
8. `powers` — Kwadraty i sześciany: equal factors, not “times 2 / times 3”.
9. `word` — Zadania tekstowe: choose the operation from the story.
10. `order` — Kolejność działań: brackets, powers, then ×÷, then +−.
11. `numberline` — Oś liczbowa i łamigłówki: equal steps and missing-number puzzles.
12. `mix` — Wielka przejażdżka: ten questions from eleven focused stations; the omitted station rotates and is named on the route heading (`dziś bez: …`).

## Architecture

- Shared engine owns scoring, persistence, feedback, resume, hint marks and the side-panel swap.
- Chapter generators attach `routeId` and a short `method` label.
- `routeHelp` supplies a station-specific Mała ściąga so remainder/powers tips do not appear on a ticket-price question.
- Polish few/many helpers live on `MathTownGame`.
- Unreachable tails in `patternQuestions` and `extraChallengeQuestions` were removed.

## Remaining work

Chapter 1 HTML still carries a large local CSS copy. Do not add new local duplicates; migrate controls to `shared/game.css` on a later touch.

## Expansion from `page_0005.png`–`page_0023.png` — implemented (2026-09-23)

The user chose 12 questions on the nine stations these pages deepen. `park`, `numberline` and `mix` stay at 10. No new station and no route-id change. Saved rounds are not invalidated: an unfinished 10-question round finishes as it was saved, and only a new start uses the longer mix. `CACHE_NAME` is `matematyczne-miasteczko-v32`.

Questions are original. Worksheet pictures, colouring tasks, open “list several pairs” tasks and “finish the question stem” tasks were not copied.

Each lengthened round keeps the older types and always includes the new ones:

- `plusminus`: two round-then-adjust calculations, two missing-number equations (two of the three positions), one `+` arrow and one `−` arrow, plus six of the older smart calculations.
- `moreless`: eight one-step comparisons, one sequence, one extra puzzle, one two-step mass chain, one sentence whose unknown is the starting amount.
- `multdiv`: zero, three grouped products, two quotients, one three-factor product, two splits of an 11–19 factor, two splits of a dividend, and one missing factor or dividend.
- `by10`: ten of the older zero/grouping tasks, plus one missing factor of 10 or 100 and one product by 20 or 30.
- `timesmore`: nine table-sized classics, one blank in the sentence, one two-step “razy więcej” chain, and połowa / podwojona / potrojona. Products stay inside the multiplication table.
- `remainder`: nine of the older tasks, plus an explicit quotient, a reconstructed dividend, and the remainder when dividing by 10.
- `powers`: ten of the older tasks (0 and 1 can appear), plus “is a² the same as a · 2?” and a count of equal factors.
- `word`: ten one-step stories and two two-step stories drawn from wrappers, ages, a sum, humps, fence-post spacing, cinema rows and medals.
- `order`: eight generated priority questions, plus the same numbers once with brackets and once without, for both division and subtraction. The unused fixed list in `orderQuestions` was removed.

`numberline` was not lengthened. Its generator still has an unreachable `fixed` list after the first `return`. Sequences stay on `moreless`.

The halfway toast still appears when question 6 of a 10-question round is entered. On a 12-question round it appears when question 7 is entered, and that message says sześć rather than pięć. Other chapters are unchanged.

### Verification

`npm test` and `npm run check` passed after the generator, toast, menu-copy and cache changes. `npm test` is the full `node --test **/*.test.cjs` run.

No browser was available in this session, so these checks are still open: play a 12-question station through correct, wrong, hint and result; confirm “Półmetek!” on question 7; resume an old 10-question save; check the chapter menu at desktop and 320 px.

### What the pages teach, and where it already lives

The folder now has workbook pages 3–21 (`page_0005.png`–`page_0023.png`). They do not introduce a twelfth topic. They deepen nine of the eleven stations. `park` and `numberline` have no new section. Colour-by-number pictures, open “write several pairs” tasks, and “finish the question stem” tasks do not fit a single numeric or single-choice answer.

| Pages | Workbook heading | Station | Already generated | Missing and worth adding |
| --- | --- | --- | --- | --- |
| 0005–0007 | Rachunki pamięciowe: dodawanie i odejmowanie | `plusminus` | Complements to 100, hop to a hundred, tens minus a small number | A nearby round sum used as a stepping stone (36 + 43 beside 30 + 40). Missing addend, subtrahend or minuend (`26 + ? = 70`, `14 − ? = 9`, `? − 14 = 34`). One arrow step: start, `+n` or `−n`, find the empty node. |
| 0005–0006, 0008 | Sequences; gnomes growing by a fixed amount | `numberline` (sequence already sneaks into `moreless` via `patternQuestions`) | Equal steps and a midpoint | One increasing and one decreasing constant-difference sequence, step larger than 1. Keep it on `numberline`, not as a new station. |
| 0008–0009 | O ile więcej, o ile mniej | `moreless` | One-step “o ile / o … większa / o … mniejsza” and a short story | One chain of two comparisons (price or mass). One sentence where the unknown is the starting number or the difference, not the result. Skip the coin-flip max/min tree and the open bag-of-numbers task. |
| 0010–0014 | Rachunki pamięciowe: mnożenie i dzielenie | `multdiv` | Facts to 9, multiply by 0, three factors, division checked by multiplication | Split a product: `7 · 13 = 7 · 10 + 7 · 3`. Split a dividend into two multiples: `86 : 2 = 80 : 2 + 6 : 2`. Missing factor or missing dividend (`8 · ? = 48`, `? : 7 = 5`). Cap the two-digit factor at 11–19 so the split stays near the table. Skip colouring, “list every factor pair”, and insert-a-digit puzzles. |
| 0011 | Factors of 10 and 100, tables ·10 ·20 ·30 | `by10` | Append or cancel zeros; group factors to 10 or 100 | One missing factor (`? · 10 = 190`) and one product by 20 or 30 explained as ×2 or ×3, then ×10. |
| 0015–0016, phrase list on 0020 | Ile razy więcej, ile razy mniej | `timesmore` | Three phrasings, both factors in the multiplication table (2–9 and 2–10) after the 203 : 7 complaint | Move the unknown: “4 razy więcej niż ? to 44”. One two-step chain that stays inside the table. Vocabulary połowa / podwojona / potrojona, still a whole number. Skip a four-jump halving story and the open “list several pairs” task. |
| 0017–0018 | Dzielenie z resztą | `remainder` | Remainder, quotient in a story, remainder 0 as yes/no, bead cycle, two-condition puzzle | One item that asks for the quotient. One reconstruction: `? : 7 = 9` reszta `5`, or a missing divisor. Remainder when dividing by 10 (last digit). Keep the remainder smaller than the divisor. Skip colouring. |
| 0019 | Kwadraty i sześciany | `powers` | Squares, cubes, one higher power, combinations, paper folds | Choice: is `6²` the same as `6 · 2`? Count how many equal factors a power uses. Include 0 and 1 occasionally. Skip huge values such as `60³` and `10 000`. |
| 0020–0022 | Zadania tekstowe, cz. 1–2 | `word` | Mostly one step; roses plus a ribbon is the only two-step item | Two-step stories: a total split into “already used” and “still there”; age or price with both “o ile” and “razy”; a sum of two different groups; fence-post spacing (9 trees, 2 m apart → 8 gaps). Ask for one number. Skip “write the missing question”. |
| 0023 | Kolejność wykonywania działań | `order` | Brackets, powers, then · :, then + −, including left-to-right | A contrast pair: the same numbers with and without brackets (`100 : (10 : 5)` versus `100 : 10 : 5`). Subtraction that changes when the sum is bracketed (`14 − (3 + 6)` versus `14 − 3 + 6`). `orderQuestions` already builds a `fixed` list and then ignores it; a change here can use or delete that dead list. |

### Why this should not become new stations

`CHAPTER_TEMPLATE.md` keeps `mix` at 10 questions and, above ten focused stations, rotates which station is omitted. These pages reuse the published route IDs. Adding a station would make the omission more common and would not match a new curriculum heading.

### Round length — decided

The user chose option 2 on 2026-09-23: 12 questions on the nine deepened stations, 10 on `park`, `numberline` and `mix`. That choice is now implemented. The curriculum table above is the source analysis, not a remaining to-do list.
