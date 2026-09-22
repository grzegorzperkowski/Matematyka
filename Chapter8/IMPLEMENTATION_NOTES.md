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
