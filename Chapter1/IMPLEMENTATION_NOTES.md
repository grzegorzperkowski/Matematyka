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
