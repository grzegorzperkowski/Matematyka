# Chapter 2 implementation notes

Last updated: 24 September 2026

## Expansion status

The user chose richer rounds that stay at 10 questions. No new station and no route-id change. Each published station still returns 10 questions, and each round now mixes the old question families with the skills mapped below. `mix` still asks one question from every station plus one extra decimal question. Saved rounds and best scores stay valid: an unfinished round keeps the questions it stored. `roundRevisions.zegary` stays at 2 because the old minute-after-midnight questions are still generated; the new clock phrases use the `clock` checker. `CACHE_NAME` is `matematyczne-miasteczko-v33`.

## Expansion — pages read on 24 September 2026

Every `Chapter2/page_*.png` was inspected. Nothing was copied: no worksheet wording, numbers, pictures or watermarks. Questions below are skills, not items to reproduce.

The folder mixes two books that teach the same chapter:

- `page_0026.png`–`page_0040.png` — exercise booklet, printed pages 24–38.
- `page_0057.png`–`page_0093.png` — textbook “Systemy zapisywania liczb”, printed pages 55–91. This range is what the published stations were built from.

`page_0041.png`–`page_0056.png` are not in `Chapter2/`. `pages-2754/page_0041.png` continues the booklet’s clock exercises (printed 39). `pages-2754/page_0056.png` is measuring segments with a ruler, a different chapter. Those files were not used as curriculum.

Published routes stay: `dziesiatkowy`, `porownywanie`, `duze`, `pieniadze`, `dlugosc`, `masa`, `rzymskie`, `kalendarz`, `zegary`, `mix`. Each returns 10 questions. `mix` takes one question from each of the nine stations and one extra decimal question.

### Decimal system — files 26–28 and 57–63

Skill: read and build numbers by place, from ones through billions; turn an expanded sum into one number; use the short forms tys., mln and mld; say how many digits a number has; name the smallest or largest number with a given count of digits.

`dziesiatkowy` already asks which digit sits in a place, what that digit is worth, the largest 4-digit arrangement of four given digits, the sum of the digits, and how many whole thousands a number contains. Place names stop at hundreds of thousands. It never uses millions, billions, the short forms, an expanded sum, or a digit count.

Worth adding: place value through millions (billions only when the number stays a safe integer, at most a few billion); evaluate an expanded sum; `40 tys.`, `12 mln`, `3 mld` as a number; “100 setek to ile tysięcy”; how many digits; the smallest or largest n-digit number; a number fixed by one named digit and zeros elsewhere.

### Comparing — files 29–30, 64–65 and review file 93

Skill: decide which number is larger, including when the digit counts differ; count how many natural numbers sit strictly between two others; compare two sums, differences, products or quotients that share a part, without working the operations out.

`porownywanie` only inserts `<`, `=` or `>` between two plain numbers.

Worth adding: the greatest or least of three or four numbers; a short count of integers between two close bounds; comparison of expressions that share an addend, a minuend, a factor or a dividend.

### Mental arithmetic on large numbers — files 31–32 and 66–69

Skill: add and subtract round amounts, find what is missing to reach a round target, multiply and divide by cancelling trailing zeros, and take a small whole multiple or an exact share of a round number (2 times, 5 times, half when it divides).

`duze` already adds and subtracts whole thousands, multiplies and divides by 10, 100 or 1000, and asks for a number a given step larger. It does not ask for a missing addend, for 2× or 5×, or for products of two numbers that both end in zeros.

Worth adding: those three, with products kept readable (around a million at most). Division stays exact. Remainder questions stay in Chapter 1.

### Money — files 33 and 70–73, plus the money lines on file 93

Skill: convert złoty and grosz both ways, add prices, give change from a note, compare two amounts written in different units, and scale a price by a small whole count or by a half or a one-and-a-half when the result is a whole number of grosze.

`pieniadze` converts to grosze, adds two amounts in grosze, gives change in grosze, and multiplies a whole-grosz price. It never asks how many whole złoty are in a pile of grosze, and it never compares mixed writings such as 20 zł and 1500 gr.

Worth adding: whole złoty from a multiple of 100 grosze; grosze left over after taking the złoty; change from a note stated in złoty; which of two mixed amounts is larger; a small count of items priced in złoty and grosze. A half-kilogram price belongs here only when the arithmetic stays in whole grosze.

### Length — files 34–35 and 74–78

Skill: move between mm, cm, dm, m and km in both directions; rewrite a mixed measure as one unit; add or subtract two lengths after they share a unit; say how many times longer one length is when the ratio is a whole number.

`dlugosc` only multiplies a whole number of a larger unit into a smaller one (cm→mm, dm→cm, m→cm, km→m).

Worth adding: the reverse when it divides evenly; mixed measures such as centimetres and millimetres into millimetres, or kilometres and metres into metres; a sum or difference in one unit; an integer “ile razy dłuższy”.

### Mass — files 36–37 and 79–82

Skill: the same conversions for g, dag, kg and t, plus a comparison of two masses, and netto + tara = brutto.

`masa` only multiplies into a smaller unit (dag→g, kg→g, kg→dag, t→kg).

Worth adding: reverse conversions, mixed measures, an integer “ile razy cięższy”, and netto/tara/brutto with values that stay in one unit. One price-per-mass question fits when 100 g or 1 dag is a simple share of a kilogram price.

### Roman numerals — files 38 and 83–85

Skill: read and write I, V, X, L, C, D, M, including the subtractive pairs, and notice a string that breaks the rules.

`rzymskie` already reads and writes values from 1 to 1999, with a checker that ignores case and spaces. That covers the textbook range. The booklet stays mostly inside 1–39, which is the same skill at the easy end.

Worth adding: a few easier values in every round, and a choice that asks which of three strings is not a Roman numeral (four identical symbols in a row, or a subtraction the rules do not allow). No overlines. No new station.

### Calendar — files 39 and 86–89

Skill: month lengths, including February in a common year and in a leap year; how many months have 30 or 31 days; how many days a quarter has; the month inside a numeric date or a date with a Roman month; a weekday a known number of days away; a century; a short span such as weeks-and-days into days.

`kalendarz` asks how many days a month has, with February fixed at 28, a weekday some days ahead, and which century a year belongs to. The century bounds are already right (2000 is the 20th century, 2001 starts the 21st). “Ile dni ma luty?” is the gap: the book treats 28 and 29 as different questions.

Worth adding: February named as a common year or a leap year; whether a year divisible by 4 is a leap year, with 2000 included and century years that are not divisible by 400 excluded; four months of 30 days and seven of 31; quarter lengths that do not depend on February (II, III, IV) plus I quarter in a named common or leap year; the month number from a date; weeks and days as a number of days; years and months as a number of months. Weekday questions keep an anchor day in the prompt.

### Clocks — files 40 and 90–92, and the clock lines on file 93

Skill: relate hour, minute, second, quarter-hour and day; read a Polish time phrase into a 24-hour time; move a clock forward or back by minutes, a quarter, or half an hour; find how long a journey takes.

`zegary` converts hours and minutes into minutes, minutes into seconds, and adds or subtracts a duration. The result of a clock sum is “minutes after midnight”, not a time of day. It never uses kwadrans, doba, pół godziny, or phrases such as “wpół do” and “za kwadrans”.

Worth adding: 1 kwadrans = 15 min, 1 doba = 24 h, half an hour = 30 min; a phrase turned into a 24-hour time; a time a quarter or half an hour later or earlier; elapsed minutes between two times of day, including across midnight only when the prompt says “następnego dnia”. Keep the existing minute arithmetic as well.

A saved `zegary` round stores its questions. Adding new question shapes does not make an old saved round wrong. Replacing the “minutes after midnight” wording would. `roundRevisions.zegary` stays at 2 unless that wording is replaced.

### Review — file 93

Same nine skills in one sitting. That is what `mix` is for. No separate review station.

## Skipped, and why

- Colouring, drawing clock hands, drawing segments, and measuring a picture with a ruler.
- Writing a number or a date out in words. Too many acceptable spellings.
- “Podaj przykład”, “zapisz dowolną datę”, and “podaj kilka możliwości” of making an amount. More than one right answer.
- Starred digits and boxes with many fills.
- Maya dots, Egyptian glyphs, old Hindu digit names, an overline meaning “times a thousand”, the 1995 currency exchange story, the matchstick equality, and the broken-clock riddle. They are stories or puzzles, not a skill this chapter needs to drill.
- Counting palindromes, the digit in the middle of the number formed by writing 1…100, and “how many 10-digit numbers”. Too open for a short round.
- A measure “in two other units” as a single answer. Ask for one named unit instead.
- The booklet page that is only in `pages-2754/page_0041.png`, and the ruler page `pages-2754/page_0056.png`.

## Where the new skills go

Every new skill continues a station the chapter already plays. None needs its own route. `mix` can keep calling all nine stations. Published ids stay. Best scores stay.

Inside a station the new types have to share the round with the types already there. That is the product choice still open:

- Richer rounds of 10. Each station keeps its length. Old families stay in the generator, so a round no longer repeats one family as often. A sitting is the same length and practises more kinds of question. This is the shape that matches the chapter contract.
- Longer rounds of 12 on the nine topic stations, with `mix` left at 10, as in Chapter 1. Old and new families both fit more comfortably. A sitting gets longer, and the halfway line moves.
- A new station. Not recommended. The menu and `mix` would change for a topic that already has a home.

Nothing already promised is a candidate to drop.

## Decisions applied

- Ten questions on every route, including `mix`. Old families keep a fixed slot in each round; the other slots are the new skills.
- February is never asked as a bare “Ile dni ma luty?”. The question names a common year (28) or a leap year (29). A separate question asks whether a year is a leap year, including 1900, 2000 and 2100.
- Clock phrases become a 24-hour time such as `14:30`. The checker also accepts a dot or four digits (`1430`). “Wpół do”, “za kwadrans” and the period word (`rano`, `po południu`, `wieczorem`, `w nocy`) are generated from the resulting time, so `druga po południu` is 14:00.
- Length and mass convert in both directions, accept a mixed measure, add two mixed measures, and ask how many times longer or heavier when the two amounts use the same number.
- Money can ask for whole złoty, leftover grosze, change from a note, the larger of two writings, and the price of half a kilogram when that price is a whole number of grosze.
- One Roman question per round asks which of three strings breaks the rules. Reading and writing still cover 1–39 and 40–1999.
- No shared visual renderer was added. Diagrams stay on the existing equation visual.

## Verification

- `node --test Chapter2/tests/questions.test.cjs` checks every generated answer against its prompt, the Roman and clock checkers, and that a mixed round still names every station.
- Browser check is recorded at the end of the session that shipped this expansion.

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
