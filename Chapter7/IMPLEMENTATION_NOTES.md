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

## Curriculum expansion — zeszyt ćwiczeń (page_0118.png – page_0123.png)

### 1. Przeanalizowane strony zeszytu ćwiczeń (grupy tematyczne)

Wszystkie 6 nowych stron zeszytu ćwiczeń (`page_0118.png` – `page_0123.png`, w druku s. 116–121) zostało szczegółowo obejrzanych i przeanalizowanych:

1. **Grupa 1 — `page_0118.png` (s. 116): Wprowadzenie do pojęcia pola i jednostki miary**
   - *Zadania*: Porównanie powierzchni dwóch desek (A i B) przez pokrycie kwadratami; liczenie pól figur na siatce (prostokąt, schodki, pies, litera H) z wyznaczaniem figury o najmniejszym i największym polu; mierzenie pola tego samego prostokąta (3×6) różnymi jednostkami: kwadratem jednostkowym (18), kostką domina o polu 2 (9), trójkątem o polu 1/2 (36) oraz narożnikiem L o polu 3 (6).
   - *Nauczana umiejętność*: Zrozumienie, że pole to miara powierzchni zależna od wybranej jednostki — im większa jednostka, tym mniejsza liczba jednostek pokrywających figurę; porównywanie figur pod kątem wielkości powierzchni.
   - *Opublikowana stacja*: `kwadraty-jednostkowe` ("Mozaika jednostek").
   - *Czego stacji brakuje*: Dotychczas stacja mierzyła pole wyłącznie pojedynczą kratką o polu 1 oraz standardowymi połówkami. Brakuje zadań ze zmianą jednostki (np. "Jednostką jest płytka z 2 kratek — ile wynosi pole?") oraz bezpośredniego porównania dwóch figur na siatce (wskazanie figury o większym polu).

2. **Grupa 2 — `page_0119.png` (s. 117): Kwadraty centymetrowe i pole prostokąta**
   - *Zadania*: Liczenie kwadratów 1 cm w prostokątach (2×4, 3×3, 3×4 — z hasłem "zakaz rysowania kratek", zachęcającym do mnożenia); odczytywanie pól prostokątów narysowanych na siatce centymetrowej.
   - *Nauczana umiejętność*: Przejście od liczenia kratek do mnożenia liczby rzędów przez liczbę kolumn ($a \cdot b$); powiązanie siatki 1 cm z jednostką 1 cm².
   - *Opublikowana stacja*: `pole-prostokata` ("Plan prostokątów").
   - *Czego stacji brakuje*: Obecna stacja realizuje już ten schemat bardzo dobrze, ale zyskuje na bogatszym zróżnicowaniu losowanych wymiarów i wariantów wizualnych siatki z etykietami.

3. **Grupa 3 — `page_0120.png` (s. 118): Związek między polem a obwodem, różne jednostki boków, zadania wieloetapowe**
   - *Zadania*: Pola prostokątów w różnych jednostkach (cm, mm); tabelka łącząca długość, szerokość, pole i obwód prostokąta (w tym boki w różnych jednostkach: 13 cm i 1 dm; obliczanie drugiego boku i obwodu z danego pola i jednego boku; odzyskiwanie wymiaru i pola ze znanego obwodu); krzyżówka liczbowa sprawdzająca pole kwadratu, pole prostokąta, obwód ze znanych boków, bok kwadratu ze znanego obwodu ($Obw = 44 \implies a = 11 \implies P = 121$).
   - *Nauczana umiejętność*: Zrozumienie różnicy i ścisłego związku między polem a obwodem; ujednolicanie jednostek długości przed mnożeniem (np. dm i cm); zadania dwuetapowe: obliczanie pola kwadratu ze znanego obwodu lub obliczanie obwodu prostokąta, gdy znamy pole i jeden bok.
   - *Opublikowane stacje*: `pole-prostokata`, `pole-kwadratu`, `brakujacy-bok`.
   - *Czego stacjom brakuje*: Żadna stacja w rozdziale nie ćwiczyła dotąd pełnego cyklu dwuetapowego: znany obwód $\to$ bok $\to$ pole kwadratu (lub odwrotnie), ani wymiarów o mieszanych jednostkach (np. $1\text{ dm}$ i $15\text{ cm}$) przed obliczeniem pola. To kluczowa luka dydaktyczna z zeszytu ćwiczeń.

4. **Grupa 4 — `page_0121.png` (s. 119): Zależności między jednostkami pola i model siatki decymetrowej**
   - *Zadania*: Model siatkowy kwadratu $1\text{ dm} \times 1\text{ dm}$ podzielonego na $10 \times 10 = 100$ kwadratów $1\text{ cm} \times 1\text{ cm}$; ile kwadratów $1\text{ mm}$ mieści się w kwadracie $2\text{ cm} \times 2\text{ cm}$; uzupełnianie zależności $1\text{ cm} = 10\text{ mm} \implies 1\text{ cm}^2 = 100\text{ mm}^2$, $1\text{ m} = 100\text{ cm} \implies 1\text{ m}^2 = 10\,000\text{ cm}^2$.
   - *Nauczana umiejętność*: Wizualne i geometryczne uzasadnienie kwadratowego mnożnika skali; obliczanie pól kwadratów po konwersji boku na mniejszą jednostkę (np. bok $2\text{ cm} = 20\text{ mm} \implies P = 400\text{ mm}^2$).
   - *Opublikowana stacja*: `zamiana-jednostek` ("Winda jednostek pola").
   - *Czego stacji brakuje*: Dotychczas stacja zadawała głównie suche przeliczenia; brakowało pytań o liczbę kratek $1\text{ mm}^2$ w kwadracie o boku kilku centymetrów oraz pogłębionego wyjaśnienia opartego na modelu $10 \times 10$.

5. **Grupa 5 — `page_0122.png` (s. 120): Konwersje jednostek, ary, hektary i zadania realistyczne**
   - *Zadania*: Tabelka z wymiarami i polami (np. $20\text{ mm} \times 40\text{ mm} = 800\text{ mm}^2 \to 2\text{ cm} \times 4\text{ cm} = 8\text{ cm}^2$); konwersje wielokrotności ($7\text{ cm}^2 = 700\text{ mm}^2$, $2\text{ m}^2 = 20\,000\text{ cm}^2$); definicje ara ($10\text{ m} \times 10\text{ m} = 100\text{ m}^2$) i hektara ($100\text{ m} \times 100\text{ m} = 10\,000\text{ m}^2$); zadania z treścią: boisko $50\text{ m} \times 20\text{ m}$ (ile $\text{m}^2$? ile arów?), ogród $8000\text{ m}^2$ (ile arów?), sad o boku $300\text{ m}$ (ile $\text{m}^2$? ile hektarów?), działka $2\text{ ha}$ (ile $\text{m}^2$? ile arów?).
   - *Nauczana umiejętność*: Dwuetapowe zadania terenowe: obliczenie pola w metrach kwadratowych, a następnie przeliczenie na ary lub hektary; konwersje między arami a hektarami.
   - *Opublikowane stacje*: `ary-hektary` ("Mierniczy terenów") oraz `pola-w-praktyce` ("Ekipa planistów").
   - *Czego stacjom brakuje*: W `ary-hektary` brakowało zadań ze zliczaniem ara/hektara z wymiarów działki w metrach (np. działka $50\text{ m} \times 40\text{ m} = 2000\text{ m}^2 = 20\text{ a}$ lub kwadrat $300\text{ m} \to 9\text{ ha}$).

6. **Grupa 6 — `page_0123.png` (s. 121): Wycinanki i układanki — figury z kratek i połówek kratek**
   - *Zadania*: Pola figur na siatce zbudowanych z całych kratek oraz trójkątnych połówek (trapezy, równoległoboki, strzałki, klucze, kielichy, sylwetki zwierząt jak kaczka, samolot).
   - *Nauczana umiejętność*: Rozkładanie złożonych wielokątów na siatce na kwadraty jednostkowe i trójkątne połówki; łączenie par połówek w całości.
   - *Opublikowana stacja*: `wycinanki` ("Warsztat wycinanek") oraz `figury-zlozone` ("Pracownia figur złożonych").
   - *Czego stacjom brakuje*: Dotychczas `wycinanki` zawierały głównie pytania koncepcyjne i pojedynczą przekątną prostokąta, a `figury-zlozone` losowały wyłącznie całe komórki (poliomina bez trójkątnych ścięć). Brakowało atrakcyjnych, rozpoznawalnych sylwetek złożonych z pełnych kratek i trójkątów.

### 2. Zadania pominięte i powody
- **Ręczne rysowanie kratek lub mierzenie linijką na papierze** (`page_0120.png`, zad. 3) — gra w przeglądarce podaje wymiary na schemacie geometrycznym; uczeń rozwiązuje zadania na ekranie bez fizycznej linijki.
- **Krzyżówka jako interaktywna siatka słowno-liczbowa** (`page_0120.png`, zad. 5) — zachowano wszystkie zależności matematyczne (zadania dwuetapowe pole-obwód), ale w formie pytań wejściowych/wyboru zgodnych z silnikiem gry, zamiast mechanizmu krzyżówki.

### 3. Zbieżność i integracja ze stacjami
- Wszystkie tematy z zeszytu ćwiczeń naturalnie kontynuują i pogłębiają 10 istniejących stacji rozdziału.
- Żadna nowa stacja nie jest bezwzględnie wymagana, ponieważ istniejące stacje idealnie pokrywają te obszary, wzbogacone o zadania wieloetapowe, alternatywne jednostki i figury z połówkami.

### 4. Decyzja projektowa — rundy 12-pytaniowe
Zgodnie z wyborem użytkownika, Rozdział 7 został rozszerzony do rund 12-pytaniowych (analogicznie do Rozdziałów 3, 4 i 8):
- Wszystkie 10 stacji tematycznych zwraca po 12 pytań w rundzie.
- Wielki obchód (`mix`) zwraca 12 pytań: po jednym pytaniu z każdej z 10 stacji oraz dwa dodatkowe pytania z losowo wybranych różnych stacji.
- Zachowano pełną zgodność wsteczną dla zapisanych rund i najlepszych wyników; istniejące rozpoczęte rundy 10-pytaniowe pozostają wznawialne.
- Komunikat motywacyjny w połowie rundy pojawia się automatycznie po 6. pytaniu.

### 5. Zrealizowane rozszerzenia generatorów w stacjach
1. `kwadraty-jednostkowe` (12 pytań):
   - Dodano mierzenie powierzchni alternatywnymi jednostkami: płytką domina (z 2 kratek) oraz trójkątną połówką kratki (`page_0118.png`, zad. 3).
2. `jednostki-pola` (12 pytań):
   - Dodano pytanie o liczbę kwadratów $1\text{ cm}^2$ w $1\text{ dm}^2$ (100) z modelem siatki $10 \times 10$ (`page_0121.png`) oraz dobór ara do działki $800\text{ m}^2$.
3. `pole-prostokata` (12 pytań):
   - Dodano prostokąty o bokach w różnych jednostkach: $\text{dm}$ i $\text{cm}$ oraz $\text{cm}$ i $\text{mm}$ wymagające ujednolicenia jednostek przed obliczeniem pola (`page_0120.png`), a także zadanie odróżniające pole od obwodu.
4. `pole-kwadratu` (12 pytań):
   - Dodano dwuetapowe zadania: obliczanie pola ze znanego obwodu ($Obw \to a \to P$) oraz obwodu ze znanego pola ($P \to a \to Obw$) (`page_0120.png` krzyżówka zad. 5).
5. `brakujacy-bok` (12 pytań):
   - Poza odzyskiwaniem drugiego boku z pola, dodano zadania dwuetapowe: obliczanie obwodu przy danym polu i jednym boku, oraz obliczanie pola przy danym obwodzie i jednym boku (`page_0120.png` tabelka zad. 4).
6. `figury-zlozone` (12 pytań):
   - 4 losowe zacienione poliomina, 4 figury z odejmowaniem narożnego wycięcia oraz 4 figury złożone z dwóch przylegających prostokątów ($P = P_1 + P_2$).
7. `zamiana-jednostek` (12 pytań):
   - Dodano zadanie geometryczne: ile kwadracików $1\text{ mm}$ mieści się w kwadracie $2\text{ cm} \times 2\text{ cm}$ ($400\text{ mm}^2$) oraz konwersje wielokrotności $\text{cm}^2 \to \text{mm}^2$.
8. `ary-hektary` (12 pytań):
   - Dodano realistyczne zadania z treścią: boisko szkolne o wymiarach w metrach przeliczane na ary oraz kwadratowy sad o boku $200\text{–}400\text{ m}$ przeliczany na hektary (`page_0122.png` zad. 7).
9. `wycinanki` (12 pytań):
   - Dodano atrakcyjne sylwetki na siatce złożone z całych kratek i trójkątnych połówek: strzałkę ($4 + 2 \cdot 0{,}5 = 5$) oraz żaglówkę ($5 + 4 \cdot 0{,}5 = 7$) (`page_0123.png`).
10. `pola-w-praktyce` (12 pytań):
    - Dodano zadania o koszcie kafelkowania ściany oraz podziale działki na równe ogródki.

### 6. Weryfikacja
- `Chapter7/tests/questions.test.cjs`: 13/13 testów przeszło (w tym losowe rundy z ziarnem, weryfikacja kontraktów, kompletność 12 pytań w każdej stacji i w mixie).
- Wszystkie testy Rozdziału 7: 17/17 testów przeszło pomyślnie.
- `npm run check`: składnia poprawna we wszystkich plikach repozytorium.
- Cały zestaw testów repozytorium: 131/131 testów przeszło.
- `git diff --check`: brak błędów formatowania i białych znaków.
- Aktualizacja `CHAPTER_TEMPLATE.md` oraz `PRODUCT_FEATURE_BRIEF.md`: udokumentowano Rozdział 7 jako opublikowany wyjątek z rundami 12-pytaniowymi.
