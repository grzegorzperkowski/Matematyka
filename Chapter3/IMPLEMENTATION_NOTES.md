# Chapter 3 implementation notes

Last updated: 16 September 2026

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

`mix` is the ten-question chapter review route.

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
