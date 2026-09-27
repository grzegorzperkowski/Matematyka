# Chapter 3 implementation notes

Last updated: 27 September 2026

## Expansion analysis — 27 September 2026

The currently available curriculum references are `page_0042.png`–`page_0048.png`
(printed pages 40–46). The older scope below describes pages 95–117, which are
not in this folder; it records the original implementation, not this expansion.
All seven current images were visually inspected. They supply skills and
classroom vocabulary only; new game questions will be original.

| Source pages | Skill and progression | Published station and gap |
| --- | --- | --- |
| `page_0042.png` (40) | Column addition from three to four digits, unequal operand lengths, three addends, carrying, and missing digits. | `dodawanie` already practises two addends and carrying; it lacks three addends and reverse missing-number work. |
| `page_0043.png` (41) | Column subtraction from three to seven digits, borrowing through zeroes, and finding an increase from old and new totals. | `odejmowanie` practises subtraction up to four digits; it lacks chains of zeroes and the inverse-context variation. `tekstowe` can take the context. |
| `page_0044.png` (42) | One-digit column multiplication with carrying and missing factors or digits; combine several types of parts before multiplying. | `mnozeniejedna` already practises the direct product; `tekstowe` can teach the two-step situation. Missing digits are a possible deeper variant. |
| `page_0045.png` (43) | Multiplication by 10/100 and by factors ending in zeroes: multiply the nonzero parts, then account for place value. Also compare products without calculating all of them. | `mnozenie` covered multi-digit factors but previously used 11–49 and no trailing zeroes. It can gain these cases without adding a station. |
| `page_0046.png` (44) | Two- and three-digit multipliers, shifted partial products, factors ending in zeroes, and a comparison word problem. | `mnozenie` covers two-digit factors only; it lacks three-digit and trailing-zero variants. `tekstowe` can host the comparison. |
| `page_0047.png` (45) | One-digit long division with a remainder, checking `dividend = divisor × quotient + remainder`, then larger dividends. | `dzieleniejedna` currently generates only exact division; remainder and its bound are a genuinely new skill, best taught within the existing one-digit division station. |
| `page_0048.png` (46) | Multi-step stories: sum three distances; unit cost plus shared profit; derive an unknown equal weight after removing known small weights. | `tekstowe` already mixes operations, but lacks these inverse and multi-stage structures. |

The game will merge the new skills into the published stations and keep all
seven focused route IDs plus `mix` stable. The source's fill-in grids and
colour/underline tasks are unsuitable as direct screen questions; reverse
arithmetic and comparison can capture the mathematical skill with one
unambiguous answer. The watermarked drawings are not game assets. No new station
is warranted by these pages. The user chose **12 questions in every Chapter 3
route, including `mix`**, on 27 September 2026, citing the existing 12-question
approach elsewhere in the product. That length allows familiar practice plus
the new variants. Existing saved 10-question rounds should remain resumable;
new rounds use 12. Best scores and route IDs remain unchanged.

### Expansion implemented

- `dodawanie`: eight two-addend column sums, two three-addend sums and two
  missing-addend questions per new round. Direct values use three or four
  digits; the inverse questions derive a positive integer from the sum.
- `odejmowanie`: direct column differences, including three questions with
  borrowing through trailing zeroes, plus two change-from-old-total questions.
  The zero-chain numbers range from 1,000 to 20,000.
- `mnozeniejedna`: ten direct products with a factor of 2–9, plus two
  missing-factor questions checked through inverse division.
- `mnozenie`: two-digit factors, three-digit factors and five or more factors
  ending in one or two zeroes. The latter explain the place-value shift.
- `dzieleniejedna`: seven exact divisions, three quotient questions with a
  nonzero remainder and two remainder questions with the quotient given.
  Every remainder is positive and smaller than the one-digit divisor.
- `dzielenie`: twelve exact divisions by a two-digit divisor. The available
  pages do not add a distinct method to this published station.
- `tekstowe`: two each of equal groups, multiply-then-subtract, equal sharing,
  three-stage distance, cost-plus-profit and unknown-weight stories. All
  answers are exact and use original settings and numbers.
- `mix`: one question from every focused station and five extra questions,
  deliberately sampling the new three-addend, borrowing-through-zeroes,
  three-digit multiplier, division-with-remainder and unknown-weight variants.
  It contains twelve questions and all seven route IDs.

The existing `column`, `division` and `equation` visuals are sufficient. A
missing value is shown as `?` only when it matches the requested answer. No
shared renderer or storage format changed. Saved ten-question rounds and best
scores remain under their published keys; no round revision is needed. The
chapter menu and initial progress placeholders now show twelve questions.
`PRODUCT_FEATURE_BRIEF.md` and `CHAPTER_TEMPLATE.md` describe the new round
length; the offline cache version advanced once, from v36 to v37.

### Expansion verification and remaining checks

- `node --test Chapter3/tests/*.test.cjs`: 5/5 passing. Repeated generation
  checks cover route length, mix coverage, column arithmetic, new-skill
  frequency, remainder bounds and multi-step stories.
- `npm test`: 129/129 passing across all published chapters and shared code.
- `npm run check` and `git diff --check`: passing.
- Computer Use reported no available browsers, and opening its `iab` browser
  returned `Browser is not available: iab`. No browser interaction was claimed.
  Still to verify in a browser: direct `file:` and hosted-subpath routes;
  correct/wrong answer, hint, explanation, result and restart; saved ten-step
  round resume; keyboard/focus/live announcements; desktop and 320 px layout;
  direct offline route after cache population.

## Original publication record (historical)

## Scope

Implement **Działania pisemne** as a shared-engine chapter. The curriculum
references are pages 95–117 in this folder and are used only to identify the
skills; no textbook content or images are used in the game.

## Curriculum route map

| Pages | Skill | Stable game route |
| --- | --- | --- |
| 96–99 | written addition | `dodawanie` — Wieża sum |
| 100–104 | written subtraction | `odejmowanie` — Trop różnicy |
| 105–107 | multiplication by one digit | `mnozeniejedna` — Mnożnik solo |
| 108–110 | multiplication by multi-digit numbers | `mnozenie` — Warsztat mnożenia |
| 111–112 | division by one digit | `dzieleniejedna` — Dzielenie krok po kroku |
| 113–114 | division by multi-digit numbers | `dzielenie` — Stacja ilorazów |
| 115–117 | word problems and review | `tekstowe` — Misje rachunkowe |

`mix` was the ten-question chapter review route before the expansion above.

## Progress

- [x] Read the project guide, mandatory chapter template and Chapter 2 reference.
- [x] Inspect every Chapter 3 curriculum page and create the source-topic map.
- [x] Create semantic chapter screen and CSS-only calculation-workshop art.
- [x] Create question generators and focused tests.
- [x] Publish homepage card and service-worker cache entry.
- [x] Run Chapter 3 generator tests and JavaScript syntax checks.
- [ ] Run browser/manual checks (no browser surface was available in this workspace).

## Verification completed

- `node --test Chapter3/tests/*.test.cjs` — passing.
- `node --check Chapter3/game.js` and `node --check service-worker.js` — passing.
- `git diff --check` — passing.
- Chapter 2 tests pass. The unrelated existing Chapter 1 visual test fails
  consistently because it indexes a missing generated question; Chapter 3 does
  not modify Chapter 1 or the shared engine.

## Remaining manual check

Open `Chapter3/index.html?exercise=dodawanie` and
`Chapter3/index.html?exercise=dzielenie` through both `file:` and a local HTTP
server. Check a correct answer, incorrect answer, hint, result, restart,
saved-round resume, keyboard operation, 320px width and desktop width.

## Design decision

The one new visual is a CSS column-calculation board: it aligns numbers at the
right edge and optionally shows a carry/borrow cue. It is more useful than a
generic equation for the chapter's core skill, while remaining keyboard and
screen-reader friendly because the prompt, hint and explanation always state
the maths in text.
