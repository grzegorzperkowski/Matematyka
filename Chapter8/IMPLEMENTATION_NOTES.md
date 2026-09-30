# Chapter 8 implementation notes — Prostopadłościany i sześciany

## Curriculum sources analysed

All 18 reference pages were visually inspected before implementation. They are
curriculum references only and are not shipped, linked or cached as product
assets. The following page, `pages-3079/page_0247.png`, starts a different
arithmetic section and is outside this chapter.

- `page_0229.png`: chapter opener. Which wire model does not match the others,
  and which box is not a cuboid (the cylinder).
- `page_0230.png`: plane figures versus solid figures; everyday objects that
  are models of solids; a cuboid (`prostopadłościan`) recognised among boxes.
- `page_0231.png`: faces are rectangles, edges are segments, vertices are
  points. A cube (`sześcian`) is a cuboid with equal edges and six identical
  square faces. A cuboid drawing uses a front rectangle, parallel depth edges
  and dashed hidden edges.
- `page_0232.png`: three pairs of parallel faces; parallel faces are congruent;
  perpendicular faces; parallel edges; perpendicular edges that share a face.
  Three edges leave every vertex.
- `page_0233.png`: dimensions are the three edges from one vertex, written
  `a × b × c`. Equal lengths repeat on the parallel edges. A skeleton needs
  8 vertices and 12 edges.
- `page_0234.png`: sum of all edge lengths is four times each dimension. A
  wire skeleton of a cube divides by 12. Face pairs, and the third pair implied
  by two known faces. Buildings made by joining unit cubes.
- `page_0235.png`–`page_0236.png`: solids built from a few identical cuboids or
  cubes; front, top and side views; counting unit cubes. A ribbon around a box
  plus a separate bow length.
- `page_0237.png`–`page_0238.png`: a net (`siatka`) is the cuboid cut along
  edges and laid flat. The same solid can have different nets. Cube nets also
  vary. Glue tabs (`języczki`) are joins, not extra faces.
- `page_0239.png`–`page_0240.png`: read dimensions from a net; which faces
  become neighbours or opposites after folding; which hexominoes are cube nets.
- `page_0241.png`–`page_0242.png`: total surface area `Pc` is the sum of the
  six faces, computed as twice the sum of the three different face areas.
  All edges must be in the same unit before multiplying. A cube is
  `6 · a · a`.
- `page_0243.png`–`page_0244.png`: cube and cuboid surface area, including a
  known edge sum; painting selected faces; wrapping; tiles; a hole left
  unpapered; comparing cuboids built from the same number of unit cubes.
- `page_0245.png`: review of counts, parallel and perpendicular relations,
  dimensions, nets and surface area.
- `page_0246.png`: an optional rotation puzzle and a matchstick puzzle. The
  matchstick task does not practise this chapter. The rotation task is omitted
  because a fair 2D check of an irregular turned polycube needs the textbook
  figure.

## Curriculum progression and vocabulary

The chapter moves from recognising a cuboid, to naming its faces, edges and
vertices, to dimensions and edge totals, then to nets, and finally to surface
area in square units the child already met in Chapter 7. Polish wording uses
`figura przestrzenna`, `prostopadłościan`, `sześcian`, `ściana`, `krawędź`,
`wierzchołek`, `ściany równoległe`, `ściany prostopadłe`, `wymiary`,
`siatka`, `języczek`, `pole powierzchni` and `Pc`.

Volume is not a named formula in this chapter. Counting unit cubes is included
as building a solid, and the prompts say `kostki`, not `objętość`.

Generated lengths and areas are positive integers. Cuboid edges used in area
questions stay in `2–8` so the three face products stay comfortable. A
conversion question states the required output unit. Nets of a cube are checked
by folding: six edge-joined squares must cover six different faces.

## Stations and stable route IDs

1. `bryly` — recognise a cuboid, a cube, a solid that is not a cuboid, and
   that every cube is a cuboid.
2. `elementy` — 6 faces, 12 edges, 8 vertices, three edges at a vertex, and
   how many sticks or balls a skeleton still needs.
3. `wymiary` — three edges from one vertex; how many edges have a given
   length when some dimensions repeat; longest and shortest edge.
4. `suma-krawedzi` — `4 · (a + b + c)`, a cube skeleton from a wire length,
   the missing third edge, and a ribbon of two stated loops plus a bow.
5. `pary` — one parallel face and four perpendicular faces; parallel and
   perpendicular edges; the third face pair; four identical rectangular faces
   imply two square bases.
6. `siatki` — which joins of squares fold into a cube, which face is opposite,
   how many faces touch a numbered face, and that a glue tab is not a face.
7. `siatka-wymiary` — read length, width and height from a labelled cuboid net
   and use them for a face area, the edge total or the surface area.
8. `kostki` — add column heights, read the front column and the top view, and
   count cubes in a solid `a × b × c` block.
9. `pole-powierzchni` — cube surface `6 · a · a`, cuboid surface
   `2 · (ab + bc + ca)`, same-unit conversion, and which block of 12 cubes has
   the smallest surface.
10. `oklejanie` — walls without floor or ceiling, walls plus ceiling, a full
    wrap, the two largest faces, an unpapered square on one face, and tiles.
11. `mix` — one question from every station, exactly 10 questions.

Omitted as craft or off-topic: measuring a physical box, drawing a net by
hand, building a scale model, glue-tab placement as a cutting task, the
matchstick puzzle, and the irregular polycube rotation. A through-hole with
inner walls is omitted because the picture does not fix whether the tunnel is
open at both ends; the game instead leaves a square unpapered on one face.

## Visual and architecture decisions

- The chapter uses the shared round engine for screens, scoring, persistence,
  answer handling and result rendering. `chapterId` is `chapter8`.
- A cuboid is a `geometry` shape. `length`, `width` and `height` are the three
  edges from the front-bottom-left vertex. Optional string labels replace the
  numbers. `highlight` may be `front`, `top`, `side` or an array of those; the
  face also receives a word (`przód`, `góra`, `bok`). Three back-left edges are
  dashed.
- A `net` visual draws either unit-square `cells` (`col`, `row`, optional
  `label`) or rectangular `faces` (`x`, `y`, `w`, `h` and optional short
  labels). Overlapping faces are rejected and the panel stays hidden. An
  optional `legend` string is visible text, so cuboid measurements stay
  readable at 320 px.
- A `stack-plan` visual is a height map. `heights` is row-major, row 0 is the
  front, and that row is drawn at the bottom. Values are integers `0–6`.
- No textbook artwork and no new bitmap. The hero is CSS: a crate and a cube
  net.
- Station help is supplied through `routeHelp`, so Mała ściąga follows the
  open station.

## Verification

- Curriculum analysis, generators, shared cuboid/net/stack-plan renderers and
  publication are complete. `chapterId` is `chapter8`. Cache name is
  `matematyczne-miasteczko-v27`.
- `node --test Chapter8/tests/*.test.cjs shared/solid-visual.test.cjs` passed.
  Twelve seeds check every route: 10 questions, recomputed answers, choice
  options, visuals, and a mix that includes every station. The cube-net folder
  accepts the 11 canonical nets and rejects the stored non-nets.
- `npm run check` and `git diff --check` passed.
- The full `npm test` run passed the new chapter tests and the other chapter
  generator tests. Ten older offline tests in Chapters 1 and 4–7 still fail
  because they expect `PUBLISHED_CHAPTERS` and `cachedFallback`, which the
  current service worker does not export. That mismatch was already present
  before this chapter.
- Browser checks on 2026-09-22, with headless Chrome over a local static
  server and a `file:` URL:
  - homepage keeps the Chapter 1 hero, eight cards, and a real Chapter 8 link;
  - the chapter menu lists all eleven stations;
  - `?exercise=wymiary`, `siatki`, `kostki`, `pole-powierzchni` and
    `siatka-wymiary` open the right station, show the diagram, update Mała
    ściąga, accept a hint, mark a wrong answer without scoring it, and score
    a later correct answer with its method name;
  - after one correct answer, reloading the station shows the resume dialog;
  - `file:///.../Chapter8/index.html?exercise=elementy` starts that station;
  - desktop and 320 px layouts for the menu, cuboid, net and stack questions
    stay inside the viewport, and the question stays above the help panel;
  - a Chapter 7 rectangle question still draws its area grid.
- Not checked in the browser: a full ten-question keyboard-only round, and a
  previously unused exercise URL after the device is taken offline. The
  service-worker test does cover that direct URL falling back to the cached
  chapter document.

## Curriculum expansion — workbook sources (pages 124–128)

Five new workbook pages (`page_0124.png` to `page_0128.png`, corresponding to workbook pages 122–126) were visually inspected.

### 1. Pages read, grouped by topic
- **Opis prostopadłościanu i relacje w bryle**: `page_0124.png` (s. 122, zad. 1–5) oraz `page_0125.png` (s. 123, zad. 6).
- **Budowanie z kostek i widoki z różnych stron**: `page_0125.png` (s. 123, zad. 7–8).
- **Siatki prostopadłościanów i relacje ścian**: `page_0126.png` (s. 124, zad. 1–2) oraz `page_0127.png` (s. 125, zad. 3–4).
- **Pole powierzchni z siatki**: `page_0128.png` (s. 126, zad. 1–2).

### 2. Skills each group teaches (in own words)
- **Opis i relacje w prostopadłościanie**:
  - Identyfikacja wierzchołków, krawędzi i ścian na rysunku bryły;
  - Grupowanie krawędzi o tej samej długości według trzech wymiarów bryły;
  - Rozpoznawanie ścian i krawędzi wzajemnie równoległych oraz prostopadłych na modelu bryły;
  - Rekonstrukcja pełnego zestawu 6 ścian na podstawie dwóch podanych ścian (np. prostokąt 3×6 i kwadrat 3×3 oznaczają prostopadłościan o podstawie kwadratowej: 2 kwadraty 3×3 i 4 prostokąty 3×6).
- **Kostki i rzuty bryły**:
  - Rozkład danej liczby kostek (np. 8 kostek) na możliwe wymiary prostopadłościanu (8×1×1, 4×2×1, 2×2×2);
  - Rozpoznawanie i odróżnianie trzech widoków budowli z klocków: widok z przodu, widok z góry oraz widok z boku.
- **Siatki prostopadłościanów**:
  - Rozpoznawanie rodzajów ścian na siatce: sześcian (6 jednakowych kwadratów), prostopadłościan o podstawie kwadratowej (2 kwadraty i 4 jednakowe prostokąty), prostopadłościan o 3 różnych wymiarach (3 pary jednakowych prostokątów);
  - Analiza relacji ścian po złożeniu siatki: ściany naprzeciwległe są równoległe, a ściany sąsiadujące ze sobą są prostopadłe.
- **Pole powierzchni z siatki**:
  - Obliczanie pola powierzchni prostopadłościanu z siatki krok po kroku: obliczanie pól poszczególnych ścian (1 do 6) i sumowanie ich do pola całkowitego.

### 3. Which published station already teaches it and what is missing
- `elementy` i `wymiary`: uczą liczby wierzchołków, krawędzi i sum krawędzi, ale brakowało odtwarzania zestawu 6 ścian z 2 podanych ścian oraz rozpoznawania ile ścian ma dany wymiar w prostopadłościanie o podstawie kwadratowej.
- `pary`: uczy par ścian równoległych/prostopadłych w bryle, ale nie łączy tego bezpośrednio z relacjami ścian po złożeniu siatki.
- `kostki`: ma sumowanie wysokości kolumn i widok z góry oraz lewą kolumnę widoku z przodu, ale brakuje widoku z boku (bocznego rzutu) oraz rozkładu N kostek na możliwe prostopadłościany.
- `siatki`: skupia się obecnie wyłącznie na siatkach sześcianu (11 siatek, ściany przeciwległe), brakowało siatek prostopadłościanów o podstawie kwadratowej i prostokątnej (ile par jednakowych ścian) oraz ścian prostopadłych po złożeniu siatki.
- `siatka-wymiary` / `pole-powierzchni`: liczy pole podstawy, boku i Pc z D, S, W, ale brakowało zadania sprawdzającego sumowanie pól wszystkich 6 ponumerowanych ścian.

### 4. Skills worth adding
- Rekonstrukcja zestawu 6 ścian na podstawie 2 znanych ścian (`wymiary`/`pary`).
- Rozkład N kostek na prostopadłościan (np. 8 kostek = jakie wymiary lub jaka wysokość przy podanej podstawie) (`kostki`).
- Widok z boku budowli z kostek (`kostki`).
- Identyfikacja struktury ścian na siatce prostopadłościanu (ile kwadratów, ile prostokątów) (`siatki`).
- Ściany prostopadłe po złożeniu siatki (`siatki`).
- Sumowanie pól ponumerowanych ścian siatki (`siatka-wymiary`).

### 5. Pages and tasks skipped, and why
- `page_0124.png` zad. 2: dokańczanie rysunku prostopadłościanu w rzucie ukośnym na kratkach (rysowanie odręczne na siatce).
- `page_0124.png` zad. 1: wpisywanie długiego łańcucha liter wierzchołków/krawędzi/ścian (otwarte zadanie tekstowe podatne na formatowanie na telefonie; zamienione na konkretne pytania o elementy).
- `page_0126.png` zad. 2 oraz `page_0127.png` zad. 3: rysowanie siatek prostopadłościanów na siatce kwadratowej (zadania czysto rysunkowe).
- `page_0127.png` zad. 4: postacie komiksowe (świnki) – rysunki czysto dekoracyjne, esencja zadania (ściany prostopadłe/równoległe na siatce) zachowana w generatorze.

### 6. Station mapping and expansion decisions
- **User decision**: The user chose longer rounds (12 questions per route and in `mix`), following Chapters 1, 3, and 4.
- All 10 focused routes now return 12 questions:
  - `bryly`: added questions about number of edge lengths in a square prism (2) and number of unit cubes needed to build a 2 cm cube (8).
  - `elementy`: added questions about the number of edges meeting at vertex A (3) and vertices outside a selected base (4).
  - `wymiary`: added questions about counting faces of a given size in a square prism (4) and the combined edge count of two dimensions (4 + 4 = 8).
  - `suma-krawedzi`: added questions about edge sum of a square prism (8·a + 4·h) and leftover wire when building a cube frame.
  - `pary`: added questions about faces not containing a selected edge (6 − 2 = 4) and that opposite folded faces are parallel.
  - `siatki`: added questions about rectangles in a square-prism net (4) and faces perpendicular to a selected face in a folded cube (4).
  - `siatka-wymiary`: added questions about the area of a pair of opposite faces (2·D·W) and the total surface area from three known face areas (2·(f1 + f2 + f3)).
  - `kostki`: added questions about finding cuboid height given total cubes and base dimensions, and the longest edge of a 1-row cube block.
  - `pole-powierzchni`: added questions about the total surface area of a square prism and total surface area calculated from three known face areas.
  - `oklejanie`: added questions about wrapping an open box without a lid (bottom + 4 walls) and the combined area of the two smallest faces.
- `mix`: generates 12 questions — 1 question sampled from each of the 10 stations plus 2 additional questions sampled from two different stations, ensuring full chapter coverage in every mixed round.
- `index.html`: updated hero, route progress ("Wyzwanie 1 z 12"), question card ("01 / 12"), result screen ("0/12") and description text.
- `CHAPTER_TEMPLATE.md` and `PRODUCT_FEATURE_BRIEF.md`: updated to document Chapter 8's 12-question structure.

### 7. Verification
- `node --test Chapter8/tests/offline.test.cjs Chapter8/tests/questions.test.cjs`: 6/6 tests passed across 12 random seeds.
- `node --test shared/solid-visual.test.cjs`: 2/2 tests passed.
- `npm run check`: all files passed syntax check.
- `git diff --check`: passed without whitespace or formatting warnings.
