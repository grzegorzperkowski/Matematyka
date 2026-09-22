(() => {
  "use strict";

  const routeLabels = {
    bryly: "Rozpoznawalnia brył",
    elementy: "Warsztat szkieletów",
    wymiary: "Trzy krawędzie",
    "suma-krawedzi": "Druciana rama",
    pary: "Ściany i kierunki",
    siatki: "Składarnia siatek",
    "siatka-wymiary": "Miarka siatki",
    kostki: "Składanka z kostek",
    "pole-powierzchni": "Biuro powierzchni",
    oklejanie: "Ekipa oklejania",
    mix: "Wielki obchód brył"
  };

  const methods = {
    bryly: "sprawdź ściany i krawędzie",
    elementy: "6 ścian, 12 krawędzi, 8 wierzchołków",
    wymiary: "trzy krawędzie z wierzchołka",
    "suma-krawedzi": "każdy wymiar liczę 4 razy",
    pary: "pary ścian równoległych",
    siatki: "sześć kwadratów bez nakładania",
    "siatka-wymiary": "odczytaj D, S i W",
    kostki: "zsumuj wysokości kolumn",
    "pole-powierzchni": "dodaj pola trzech par ścian",
    oklejanie: "wybierz, które ściany liczysz"
  };

  const routeHelp = {
    bryly: {
      intro: "Prostopadłościan ma prostokątne ściany. Sześcian jest jego szczególnym przypadkiem.",
      items: ["6 prostokątnych ścian", "wszystkie krawędzie sześcianu są równe", "każdy sześcian jest prostopadłościanem"]
    },
    elementy: {
      intro: "Najpierw nazwij element, potem go policz.",
      items: ["6 ścian, 12 krawędzi, 8 wierzchołków", "z wierzchołka wychodzą 3 krawędzie", "jedna ściana ma 4 krawędzie"]
    },
    wymiary: {
      intro: "Wymiary to trzy krawędzie wychodzące z jednego wierzchołka.",
      items: ["każdy wymiar powtarza się na 4 krawędziach", "dwa równe wymiary dają 8 krawędzi", "w sześcianie równych jest 12"]
    },
    "suma-krawedzi": {
      intro: "Przy szkielecie każdy wymiar wchodzi do sumy cztery razy.",
      items: ["suma = 4 · (długość + szerokość + wysokość)", "szkielet sześcianu: długość drutu : 12", "trzeci wymiar: suma : 4 minus dwa znane"]
    },
    pary: {
      intro: "Ściany równoległe nie spotykają się i mają te same wymiary.",
      items: ["do jednej ściany równoległa jest 1", "prostopadłe do niej są 4", "trzecia para ścian łączy dwa pozostałe wymiary"]
    },
    siatki: {
      intro: "Siatka sześcianu to 6 kwadratów, które składają się bez nakładania.",
      items: ["dokładnie 6 kwadratów", "ściany naprzeciw siebie nie mają wspólnego boku", "języczek nie jest ścianą"]
    },
    "siatka-wymiary": {
      intro: "Z siatki odczytaj trzy różne krawędzie: D, S i W.",
      items: ["podstawa = D · S", "ściana boczna pasa = D · W", "Pc = 2 · (D·S + S·W + W·D)"]
    },
    kostki: {
      intro: "Liczba w kratce mówi, ile kostek stoi w tej kolumnie.",
      items: ["suma liczb to wszystkie kostki", "z góry widać kolumny wyższe od zera", "dolny rząd planu to przód"]
    },
    "pole-powierzchni": {
      intro: "Pole powierzchni to suma pól wszystkich ścian.",
      items: ["sześcian: 6 · a · a", "prostopadłościan: 2 · (ab + bc + ca)", "przed mnożeniem ujednolić jednostki"]
    },
    oklejanie: {
      intro: "Najpierw ustal, których ścian dotyczy pytanie.",
      items: ["4 ściany: 2 · (długość + szerokość) · wysokość", "całe pudełko to pełne Pc", "nieoklejony fragment odejmij od ściany"]
    },
    mix: {
      intro: "Najpierw rozpoznaj, czy liczysz elementy, siatkę czy powierzchnię.",
      items: ["wymiary to 3 krawędzie z wierzchołka", "siatka sześcianu ma 6 kwadratów", "Pc liczy każdą parę ścian dwa razy"]
    }
  };

  const cubeNets = [
    [".#.", ".#.", "###", ".#."],
    [".#.", ".##", "##.", ".#."],
    [".#.", ".#.", "##.", ".##"],
    [".##", ".#.", "##.", ".#."],
    ["..##", "###.", "..#."],
    ["..#", ".##", "##.", ".#."],
    ["...#", "####", "...#"],
    [".##", ".#.", ".#.", "##."],
    ["#..", "##.", ".#.", ".##"],
    ["#.", "#.", "##", ".#", ".#"],
    ["..#", ".##", "##.", "#.."]
  ];

  const invalidNets = [
    ["######"],
    ["###", "###"],
    ["##", "##", "##"],
    ["####", "#...", "#..."],
    [".#.", "###", "#.#"],
    ["####", "#..#"],
    ["#####", "#...."],
    ["####", "#..."],
    ["#######"]
  ];

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
  const polishCount = MathTownGame.polishCount;
  const question = (data) => ({ kind: "input", visual: null, ...data });
  const choice = (answer, options, data) => question({
    ...data,
    kind: "choice",
    answer: String(answer),
    options: options.map((value) => ({ value: String(value), label: String(value) }))
  });
  const equation = (expression, caption) => ({ type: "equation", expression, caption });
  const sumOf = (values) => values.reduce((total, value) => total + value, 0);
  const edgeSum = (dimensions) => 4 * sumOf(dimensions);
  const edgeCount = (dimensions, target) => dimensions.filter((value) => value === target).length * 4;
  const surfaceArea = (a, b, c) => 2 * (a * b + b * c + c * a);
  const pairLabel = (x, y) => `${Math.min(x, y)} cm × ${Math.max(x, y)} cm`;
  const dimText = (dimensions, unit = "cm") => dimensions.map((value) => `${value} ${unit}`).join(" × ");

  function distinctTriple(min, max) {
    const first = rand(min, max);
    let second = rand(min, max);
    while (second === first) second = rand(min, max);
    let third = rand(min, max);
    while (third === first || third === second) third = rand(min, max);
    return [first, second, third];
  }

  function squarePrism() {
    const side = rand(2, 8);
    let other = rand(2, 9);
    while (other === side) other = rand(2, 9);
    return [side, side, other];
  }

  function cuboidVisual(length, width, height, caption, extra = {}) {
    const unit = extra.unit || "cm";
    return {
      type: "geometry",
      shape: "cuboid",
      length,
      width,
      height,
      unit,
      showDimensions: false,
      lengthLabel: extra.lengthLabel ?? `${length} ${unit}`,
      widthLabel: extra.widthLabel ?? `${width} ${unit}`,
      heightLabel: extra.heightLabel ?? `${height} ${unit}`,
      highlight: extra.highlight || null,
      alt: extra.alt || `Prostopadłościan o krawędziach ${length} ${unit}, ${width} ${unit} i ${height} ${unit}.`,
      caption
    };
  }

  function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }

  function foldCube(cells) {
    if (!Array.isArray(cells) || cells.length !== 6) return null;
    const keyOf = (r, c) => `${r},${c}`;
    const present = new Set(cells.map(([r, c]) => keyOf(r, c)));
    if (present.size !== 6) return null;
    const seen = new Set([keyOf(cells[0][0], cells[0][1])]);
    const queue = [cells[0]];
    while (queue.length) {
      const [r, c] = queue.shift();
      [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(([nr, nc]) => {
        const key = keyOf(nr, nc);
        if (present.has(key) && !seen.has(key)) {
          seen.add(key);
          queue.push([nr, nc]);
        }
      });
    }
    if (seen.size !== 6) return null;
    const state = new Map();
    state.set(keyOf(cells[0][0], cells[0][1]), { normal: [0, 0, 1], up: [0, 1, 0] });
    const walk = [cells[0]];
    while (walk.length) {
      const [r, c] = walk.shift();
      const current = state.get(keyOf(r, c));
      const right = cross(current.up, current.normal);
      const moves = [
        [-1, 0, current.up, [-current.normal[0], -current.normal[1], -current.normal[2]]],
        [1, 0, [-current.up[0], -current.up[1], -current.up[2]], current.normal],
        [0, 1, right, current.up],
        [0, -1, [-right[0], -right[1], -right[2]], current.up]
      ];
      for (const [dr, dc, newNormal, newUp] of moves) {
        const nr = r + dr;
        const nc = c + dc;
        const key = keyOf(nr, nc);
        if (!present.has(key)) continue;
        if (state.has(key)) {
          const existing = state.get(key).normal;
          if (existing.some((value, index) => value !== newNormal[index])) return null;
          continue;
        }
        for (const value of state.values()) {
          if (value.normal.every((part, index) => part === newNormal[index])) return null;
        }
        state.set(key, { normal: [...newNormal], up: [...newUp] });
        walk.push([nr, nc]);
      }
    }
    return state.size === 6 ? state : null;
  }

  function parseNet(rows) {
    const cells = [];
    rows.forEach((row, r) => {
      [...row].forEach((symbol, c) => {
        if (symbol === "#") cells.push([r, c]);
      });
    });
    return cells;
  }

  function normalisedCells(cells) {
    const minRow = Math.min(...cells.map((cell) => cell[0]));
    const minColumn = Math.min(...cells.map((cell) => cell[1]));
    return cells.map(([row, column]) => [row - minRow, column - minColumn]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  }

  function transformCells(cells, turns, reflect) {
    let next = cells.map(([row, column]) => [row, column]);
    if (reflect) next = next.map(([row, column]) => [row, -column]);
    for (let turn = 0; turn < turns; turn += 1) next = next.map(([row, column]) => [column, -row]);
    return normalisedCells(next);
  }

  function randomNet(catalog) {
    return transformCells(parseNet(pick(catalog)), rand(0, 3), rand(0, 1) === 1);
  }

  function numberedCells(cells) {
    return normalisedCells(cells).map(([row, column], index) => ({ row, column, label: String(index + 1) }));
  }

  function oppositeLabel(cells, face) {
    const numbered = numberedCells(cells);
    const selected = numbered.find((cell) => cell.label === String(face));
    const state = foldCube(numbered.map((cell) => [cell.row, cell.column]));
    const normal = state.get(`${selected.row},${selected.column}`).normal;
    const target = normal.map((value) => -value);
    let oppositeKey = "";
    for (const [key, value] of state) {
      if (value.normal.every((part, index) => part === target[index])) oppositeKey = key;
    }
    const [row, column] = oppositeKey.split(",").map(Number);
    return numbered.find((cell) => cell.row === row && cell.column === column).label;
  }

  function neighborCount(cells, face) {
    const numbered = numberedCells(cells);
    const selected = numbered.find((cell) => cell.label === String(face));
    const present = new Set(numbered.map((cell) => `${cell.row},${cell.column}`));
    return [[-1, 0], [1, 0], [0, -1], [0, 1]].filter(([dr, dc]) => present.has(`${selected.row + dr},${selected.column + dc}`)).length;
  }

  function cubeNetVisual(cells, caption) {
    const numbered = numberedCells(cells);
    const places = numbered.map((cell) => `ściana ${cell.label}: rząd ${cell.row + 1} od góry, kolumna ${cell.column + 1}`);
    return {
      type: "net",
      cells: numbered.map((cell) => ({ col: cell.column, row: cell.row, label: cell.label })),
      alt: `Siatka kwadratów numerowanych od góry do dołu i od lewej do prawej. ${places.join("; ")}.`,
      caption
    };
  }

  function beltFaces(length, depth, height) {
    return [
      { x: 0, y: 0, w: length, h: depth, heightLabel: "S" },
      { x: 0, y: depth, w: length, h: height, widthLabel: "D", heightLabel: "W" },
      { x: length, y: depth, w: depth, h: height },
      { x: length + depth, y: depth, w: length, h: height },
      { x: 2 * length + depth, y: depth, w: depth, h: height },
      { x: length + depth, y: depth + height, w: length, h: depth }
    ];
  }

  function dimensionNet(length, depth, height) {
    return {
      type: "net",
      faces: beltFaces(length, depth, height),
      legend: `D = ${length} cm (długość), S = ${depth} cm (szerokość), W = ${height} cm (wysokość).`,
      alt: `Siatka prostopadłościanu. Długość D = ${length} cm, szerokość S = ${depth} cm, wysokość W = ${height} cm.`,
      caption: "D jest na dolnej krawędzi pierwszej ściany pasa, W na jej pionowej krawędzi, a S na górnej ścianie."
    };
  }

  function columnMax(heights, columns, column) {
    let max = 0;
    for (let row = 0; row < heights.length / columns; row += 1) max = Math.max(max, heights[row * columns + column]);
    return max;
  }

  function connectedHeights(columns, rows) {
    const count = columns * rows;
    const heights = Array(count).fill(0);
    const target = rand(2, count);
    const occupied = new Set([rand(0, rows - 1) * columns]);
    while (occupied.size < target) {
      const frontier = [];
      occupied.forEach((index) => {
        const row = Math.floor(index / columns);
        const column = index % columns;
        [[row - 1, column], [row + 1, column], [row, column - 1], [row, column + 1]].forEach(([nextRow, nextColumn]) => {
          const next = nextRow * columns + nextColumn;
          if (nextRow >= 0 && nextRow < rows && nextColumn >= 0 && nextColumn < columns && !occupied.has(next) && !frontier.includes(next)) frontier.push(next);
        });
      });
      occupied.add(pick(frontier));
    }
    occupied.forEach((index) => { heights[index] = rand(1, 3); });
    return heights;
  }

  function heightsWithGap(columns, rows) {
    const heights = connectedHeights(columns, rows);
    const max = Math.max(...heights);
    const sum = sumOf(heights);
    if (columns * rows * max - sum > 0) return heights;
    const index = heights.findIndex((value) => value === max);
    heights[index] -= 1;
    return heights;
  }

  function stackVisual(columns, rows, heights, caption, showHeights = true) {
    const lines = Array.from({ length: rows }, (_, row) => heights.slice(row * columns, (row + 1) * columns).join(", "));
    return {
      type: "stack-plan",
      columns,
      rows,
      heights,
      showHeights,
      alt: `Plan kolumn. Dolny rząd to przód. Wysokości od przodu do tyłu: ${lines.join(" | ")}.`,
      caption
    };
  }

  function fact(rule, prompt, hint, explanation, visual, label) {
    const answers = {
      faces: 6, edges: 12, vertices: 8, "from-vertex": 3, "faces-at-vertex": 3, "edges-on-face": 4,
      "parallel-pairs": 3, "parallel-to-face": 1, "perpendicular-faces": 4, "parallel-edges": 3,
      "perpendicular-edges": 4, "cube-faces": 6, "net-squares": 6, "remaining-pairs": 2
    };
    return question({ label, prompt, answer: answers[rule], hint, explanation, visual, model: { kind: "fact", rule } });
  }

  function solidQuestions() {
    const cubeEdge = rand(2, 9);
    const [length, width, height] = distinctTriple(2, 8);
    const fixed = (rule, answer, prompt, hint, explanation, visual, label) => choice(answer, rule === "not-cuboid-trait"
      ? ["ma podstawy w kształcie koła", "ma 6 ścian", "ma 8 wierzchołków"]
      : rule === "spatial"
        ? ["figurą przestrzenną", "figurą płaską", "odcinkiem"]
        : rule === "face-shape"
          ? ["prostokąty", "trójkąty", "koła"]
          : rule === "cube-face-shape"
            ? ["jednakowe kwadraty", "różne prostokąty", "trójkąty"]
            : rule === "cuboid-name"
              ? ["prostopadłościan", "walec", "ostrosłup"]
              : rule === "cube-name"
                ? ["sześcian", "walec", "ostrosłup"]
                : ["tak", "nie"], {
      label, prompt, hint, explanation, visual, model: { kind: "choice-fixed", rule }
    });
    return [
      fixed("cuboid-name", "prostopadłościan", "Która bryła ma sześć prostokątnych ścian?", "Pudełko o prostokątnych ścianach to prostopadłościan.", "Prostopadłościan ma sześć ścian i każda z nich jest prostokątem.", cuboidVisual(5, 3, 2, "Sześć prostokątnych ścian."), "Nazwa bryły"),
      fixed("cube-name", "sześcian", "Jak nazywa się prostopadłościan, którego wszystkie krawędzie są równe?", "Wtedy wszystkie ściany są jednakowymi kwadratami.", "Taki prostopadłościan nazywamy sześcianem.", cuboidVisual(4, 4, 4, "Wszystkie krawędzie są równe."), "Sześcian"),
      fixed("face-shape", "prostokąty", "Jakie figury są ścianami prostopadłościanu?", "Każda ściana ma cztery kąty proste.", "Ścianami prostopadłościanu są prostokąty.", cuboidVisual(4, 3, 2, "Każda ściana jest prostokątem."), "Ściany"),
      fixed("cube-face-shape", "jednakowe kwadraty", "Jakie figury są ścianami sześcianu?", "W sześcianie równe są nie tylko krawędzie, ale i ściany.", "Ścianami sześcianu są jednakowe kwadraty.", cuboidVisual(3, 3, 3, "Sześć jednakowych kwadratów."), "Ściany sześcianu"),
      fixed("spatial", "figurą przestrzenną", "Czym jest prostopadłościan: figurą płaską, odcinkiem czy figurą przestrzenną?", "Prostokąt leży na płaszczyźnie, a pudełko zajmuje przestrzeń.", "Prostopadłościan jest figurą przestrzenną.", equation("pudełko → bryła", "Figura przestrzenna nie mieści się na jednej kartce."), "Bryła"),
      fixed("not-cuboid-trait", "ma podstawy w kształcie koła", "Która cecha nie pasuje do prostopadłościanu?", "Ściany prostopadłościanu są prostokątami, a nie kołami.", "Podstawy w kształcie koła ma walec, a nie prostopadłościan.", equation("koło ≠ prostokąt", "Prostopadłościan nie ma okrągłych podstaw."), "Co nie pasuje"),
      fixed("cube-is-cuboid", "tak", "Czy każdy sześcian jest prostopadłościanem?", "Sześcian spełnia wszystkie warunki prostopadłościanu.", "Tak. Sześcian jest prostopadłościanem o równych krawędziach.", cuboidVisual(cubeEdge, cubeEdge, cubeEdge, "Sześcian należy do prostopadłościanów."), "Sześcian i prostopadłościan"),
      fixed("cuboid-is-always-cube", "nie", "Czy każdy prostopadłościan jest sześcianem?", "Sprawdź, czy wszystkie krawędzie muszą być równe.", "Nie. Prostopadłościan jest sześcianem tylko wtedy, gdy wszystkie jego krawędzie są równe.", cuboidVisual(length, width, height, "Te trzy krawędzie nie są równe."), "Nie każdy"),
      choice("tak", ["tak", "nie"], {
        label: "Równe wymiary",
        prompt: `Prostopadłościan ma wymiary ${cubeEdge} cm × ${cubeEdge} cm × ${cubeEdge} cm. Czy jest sześcianem?`,
        hint: "Porównaj trzy wymiary.",
        explanation: "Tak. Wszystkie trzy wymiary są równe, więc to sześcian.",
        visual: cuboidVisual(cubeEdge, cubeEdge, cubeEdge, "Trzy równe wymiary."),
        model: { kind: "is-cube", dimensions: [cubeEdge, cubeEdge, cubeEdge] }
      }),
      choice("nie", ["tak", "nie"], {
        label: "Różne wymiary",
        prompt: `Prostopadłościan ma wymiary ${dimText([length, width, height])}. Czy jest sześcianem?`,
        hint: "Sześcian ma wszystkie krawędzie równe.",
        explanation: "Nie, nie jest sześcianem, bo wymiary nie są wszystkie równe.",
        visual: cuboidVisual(length, width, height, "Wymiary z jednego wierzchołka."),
        model: { kind: "is-cube", dimensions: [length, width, height] }
      })
    ];
  }

  function elementQuestions() {
    const balls = rand(1, 7);
    const sticks = rand(1, 11);
    const box = cuboidVisual(4, 3, 2, "Model prostopadłościanu: ściany, krawędzie i wierzchołki.");
    return [
      fact("faces", "Ile ścian ma prostopadłościan?", "Policz pary: przód i tył, lewa i prawa, dół i góra.", "Prostopadłościan ma 6 ścian.", box, "Ściany"),
      fact("edges", "Ile krawędzi ma prostopadłościan?", "Przy każdym z trzech wymiarów są cztery krawędzie.", "4 + 4 + 4 = 12 krawędzi.", box, "Krawędzie"),
      fact("vertices", "Ile wierzchołków ma prostopadłościan?", "Na dole są cztery rogi i na górze cztery.", "Prostopadłościan ma 8 wierzchołków.", box, "Wierzchołki"),
      fact("from-vertex", "Ile krawędzi wychodzi z jednego wierzchołka prostopadłościanu?", "W rogu pudełka spotykają się długość, szerokość i wysokość.", "Z jednego wierzchołka wychodzą 3 krawędzie.", box, "Róg bryły"),
      fact("faces-at-vertex", "Ile ścian spotyka się w jednym wierzchołku prostopadłościanu?", "W rogu widać trzy ściany: na przykład przód, bok i górę.", "W jednym wierzchołku spotykają się 3 ściany.", box, "Ściany w rogu"),
      fact("edges-on-face", "Ile krawędzi ma jedna ściana prostopadłościanu?", "Ściana jest prostokątem.", "Jedna ściana ma 4 krawędzie.", box, "Krawędzie ściany"),
      fact("parallel-pairs", "Ile par ścian równoległych ma prostopadłościan?", "Przód z tyłem, lewa z prawą oraz dół z górą.", "Są 3 pary ścian równoległych.", box, "Pary ścian"),
      question({
        label: "Kulki szkieletu",
        prompt: `Szkielet prostopadłościanu ma już ${polishCount(balls, "kulkę", "kulki", "kulek")} plasteliny w wierzchołkach. Ile kulek jeszcze brakuje?`,
        answer: 8 - balls,
        hint: "Cały szkielet potrzebuje 8 wierzchołków.",
        explanation: `8 − ${balls} = ${8 - balls}.`,
        visual: box,
        model: { kind: "vertices-left", have: balls }
      }),
      question({
        label: "Patyczki szkieletu",
        prompt: `Do szkieletu prostopadłościanu przygotowano już ${polishCount(sticks, "patyczek", "patyczki", "patyczków")}. Ile patyczków jeszcze brakuje?`,
        answer: 12 - sticks,
        hint: "Krawędzi, czyli patyczków, jest 12.",
        explanation: `12 − ${sticks} = ${12 - sticks}.`,
        visual: box,
        model: { kind: "edges-left", have: sticks }
      }),
      fact("cube-faces", "Ile kwadratowych ścian ma sześcian?", "W sześcianie kwadratowa jest każda ściana.", "Sześcian ma 6 kwadratowych ścian.", cuboidVisual(3, 3, 3, "Wszystkie ściany sześcianu są kwadratami."), "Ściany sześcianu")
    ];
  }

  function edgeLengthQuestion(dimensions, target) {
    const answer = edgeCount(dimensions, target);
    const hint = answer === 12
      ? "W sześcianie każda krawędź ma tę samą długość."
      : answer === 8
        ? "Ten wymiar występuje dwa razy przy jednym wierzchołku, a każdy daje 4 krawędzie."
        : "Z jednego wierzchołka wychodzi jedna taka krawędź, a równoległych do niej jest razem cztery.";
    return question({
      label: "Krawędzie jednej długości",
      prompt: `Prostopadłościan ma wymiary ${dimText(dimensions)}. Ile krawędzi ma długość ${target} cm?`,
      answer,
      hint,
      explanation: `Długość ${target} cm występuje przy wierzchołku ${polishCount(dimensions.filter((value) => value === target).length, "raz", "razy", "razy")}, więc krawędzi jest ${answer}.`,
      visual: cuboidVisual(dimensions[0], dimensions[1], dimensions[2], "Trzy krawędzie z przedniego dolnego wierzchołka."),
      model: { kind: "edge-count", dimensions, target }
    });
  }

  function dimensionQuestions() {
    const prism = squarePrism();
    const summed = distinctTriple(2, 8);
    const ranged = distinctTriple(2, 9);
    const cube = rand(2, 9);
    return [
      ...[0, 1, 2, 3].map((index) => {
        const dimensions = distinctTriple(2, 9);
        return edgeLengthQuestion(dimensions, dimensions[index % 3]);
      }),
      edgeLengthQuestion(prism, prism[0]),
      edgeLengthQuestion(prism, prism[2]),
      edgeLengthQuestion([cube, cube, cube], cube),
      question({
        label: "Suma z wierzchołka",
        prompt: `Z jednego wierzchołka prostopadłościanu wychodzą krawędzie ${dimText(summed)}. Jaka jest ich łączna długość w cm?`,
        answer: sumOf(summed),
        hint: "Dodaj tylko te trzy krawędzie, nie wszystkie krawędzie bryły.",
        explanation: `${summed.join(" + ")} = ${sumOf(summed)} cm.`,
        visual: cuboidVisual(summed[0], summed[1], summed[2], "Dodaj trzy krawędzie wychodzące z jednego rogu."),
        model: { kind: "vertex-sum", dimensions: summed }
      }),
      question({
        label: "Najdłuższa krawędź",
        prompt: `Prostopadłościan ma wymiary ${dimText(ranged)}. Ile cm ma jego najdłuższa krawędź?`,
        answer: Math.max(...ranged),
        hint: "Porównaj trzy wymiary i wybierz największy.",
        explanation: `Najdłuższa z liczb ${ranged.join(", ")} to ${Math.max(...ranged)} cm.`,
        visual: cuboidVisual(ranged[0], ranged[1], ranged[2], "Najdłuższa krawędź jest jednym z trzech wymiarów."),
        model: { kind: "longest", dimensions: ranged }
      }),
      question({
        label: "Najkrótsza krawędź",
        prompt: `Prostopadłościan ma wymiary ${dimText(ranged)}. Ile cm ma jego najkrótsza krawędź?`,
        answer: Math.min(...ranged),
        hint: "Porównaj trzy wymiary i wybierz najmniejszy.",
        explanation: `Najkrótsza z liczb ${ranged.join(", ")} to ${Math.min(...ranged)} cm.`,
        visual: cuboidVisual(ranged[0], ranged[1], ranged[2], "Najkrótsza krawędź jest jednym z trzech wymiarów."),
        model: { kind: "shortest", dimensions: ranged }
      })
    ];
  }

  function edgeTotalQuestions() {
    const totals = [0, 1, 2, 3].map(() => distinctTriple(2, 8));
    const missing = [distinctTriple(2, 8), distinctTriple(2, 8)];
    const ribbonDimensions = distinctTriple(2, 8);
    const bow = pick([10, 15, 20, 25]);
    let first = distinctTriple(2, 6);
    let second = distinctTriple(3, 8);
    if (edgeSum(first) === edgeSum(second)) second = [second[0] + 1, second[1], second[2]];
    return [
      ...totals.map((dimensions) => question({
        label: "Suma krawędzi",
        prompt: `Prostopadłościan ma wymiary ${dimText(dimensions)}. Jaka jest suma długości wszystkich krawędzi w cm?`,
        answer: edgeSum(dimensions),
        hint: "Każdy z trzech wymiarów występuje na czterech krawędziach.",
        explanation: `4 · (${dimensions.join(" + ")}) = ${edgeSum(dimensions)} cm.`,
        visual: cuboidVisual(dimensions[0], dimensions[1], dimensions[2], "Cztery krawędzie na każdy wymiar."),
        model: { kind: "edge-sum", dimensions }
      })),
      ...[0, 1].map(() => {
        const edge = rand(2, 10);
        const total = edge * 12;
        return question({
          label: "Drut na sześcian",
          prompt: `Z drutu o długości ${total} cm wykonano szkielet sześcianu. Ile cm ma jedna krawędź?`,
          answer: edge,
          hint: "Sześcian ma 12 równych krawędzi. Podziel długość drutu przez 12.",
          explanation: `${total} : 12 = ${edge} cm.`,
          visual: cuboidVisual(edge, edge, edge, "W szkielecie sześcianu wszystkie krawędzie są równe."),
          model: { kind: "cube-edge", total }
        });
      }),
      ...missing.map((dimensions) => {
        const [length, width, height] = dimensions;
        const total = edgeSum(dimensions);
        return question({
          label: "Brakująca krawędź",
          prompt: `Dwie krawędzie wychodzące z jednego wierzchołka mają ${length} cm i ${width} cm. Suma długości wszystkich krawędzi wynosi ${total} cm. Ile cm ma trzecia krawędź z tego wierzchołka?`,
          answer: height,
          hint: "Podziel sumę wszystkich krawędzi przez 4, a potem odejmij dwa znane wymiary.",
          explanation: `${total} : 4 = ${length + width + height}, a ${length + width + height} − ${length} − ${width} = ${height} cm.`,
          visual: cuboidVisual(length, width, height, "Trzecia krawędź z wierzchołka jest oznaczona znakiem zapytania.", {
            heightLabel: "? cm",
            alt: `Prostopadłościan. Dwie podpisane krawędzie z przedniego dolnego wierzchołka mają ${length} cm i ${width} cm. Trzecia krawędź nie ma podanej długości.`
          }),
          model: { kind: "missing-edge", total, known: [length, width] }
        });
      }),
      question({
        label: "Wstążka",
        prompt: `Wstążka otacza pudełko ${dimText(ribbonDimensions)} dwiema pętlami: 2 · (${ribbonDimensions[0]} + ${ribbonDimensions[1]}) cm oraz 2 · (${ribbonDimensions[0]} + ${ribbonDimensions[2]}) cm. Kokarda ma ${bow} cm. Ile cm wstążki zużyto razem?`,
        answer: 2 * (ribbonDimensions[0] + ribbonDimensions[1]) + 2 * (ribbonDimensions[0] + ribbonDimensions[2]) + bow,
        hint: "Dodaj długości obu pętli i kokardy.",
        explanation: `2 · ${ribbonDimensions[0] + ribbonDimensions[1]} + 2 · ${ribbonDimensions[0] + ribbonDimensions[2]} + ${bow} = ${2 * (ribbonDimensions[0] + ribbonDimensions[1]) + 2 * (ribbonDimensions[0] + ribbonDimensions[2]) + bow} cm.`,
        visual: cuboidVisual(ribbonDimensions[0], ribbonDimensions[1], ribbonDimensions[2], "Jedna pętla otacza długość i szerokość, druga długość i wysokość."),
        model: { kind: "ribbon", dimensions: ribbonDimensions, bow }
      }),
      question({
        label: "Porównanie szkieletów",
        prompt: `Jeden szkielet ma wymiary ${dimText(first)}, a drugi ${dimText(second)}. O ile cm dłuższy jest szkielet o większej sumie krawędzi?`,
        answer: Math.abs(edgeSum(first) - edgeSum(second)),
        hint: "Oblicz 4 · (a + b + c) dla każdej bryły i odejmij mniejszą sumę od większej.",
        explanation: `Sumy wynoszą ${edgeSum(first)} cm i ${edgeSum(second)} cm, więc różnica to ${Math.abs(edgeSum(first) - edgeSum(second))} cm.`,
        visual: equation(`${edgeSum(first)} cm  i  ${edgeSum(second)} cm`, "Porównaj całe szkielety, nie pojedyncze krawędzie."),
        model: { kind: "edge-sum-diff", first, second }
      })
    ];
  }

  function pairQuestions() {
    const [length, width, height] = distinctTriple(2, 8);
    const third = pairLabel(length, height);
    const box = cuboidVisual(4, 3, 2, "Żółta ściana z napisem „przód”.", { highlight: "front" });
    return [
      fact("parallel-to-face", "Ile ścian prostopadłościanu jest równoległych do ściany przedniej?", "Równoległa ściana nie spotyka się z przednią.", "Do ściany przedniej równoległa jest 1 ściana: tylna.", box, "Ściana równoległa"),
      fact("perpendicular-faces", "Ile ścian jest prostopadłych do ściany przedniej?", "Przód spotyka się z bokami, dołem i górą.", "Do ściany przedniej prostopadłe są 4 ściany.", box, "Ściany prostopadłe"),
      choice("tak", ["tak", "nie"], {
        label: "Przystające ściany",
        prompt: "Czy dwie równoległe ściany prostopadłościanu mają takie same wymiary?",
        hint: "Równoległe ściany tworzą parę jednakowych prostokątów.",
        explanation: "Tak. Ściany równoległe są przystającymi prostokątami.",
        visual: box,
        model: { kind: "choice-fixed", rule: "congruent-parallel" }
      }),
      fact("parallel-edges", "Ile innych krawędzi prostopadłościanu jest równoległych do wybranej krawędzi?", "W jednej grupie równoległych krawędzi są cztery, licząc wybraną.", "Oprócz wybranej krawędzi są jeszcze 3 równoległe do niej.", box, "Krawędzie równoległe"),
      fact("perpendicular-edges", "Ile krawędzi prostopadłych do danej leży z nią na wspólnej ścianie?", "Na każdym końcu krawędzi wychodzą dwie prostopadłe krawędzie.", "Są 4 takie krawędzie.", box, "Krawędzie prostopadłe"),
      choice("tak", ["tak", "nie"], {
        label: "Krawędzie z rogu",
        prompt: "Czy trzy krawędzie wychodzące z jednego wierzchołka prostopadłościanu są parami prostopadłe?",
        hint: "Długość, szerokość i wysokość spotykają się pod kątami prostymi.",
        explanation: "Tak. Każde dwie z tych trzech krawędzi są prostopadłe.",
        visual: cuboidVisual(5, 3, 4, "Trzy krawędzie z jednego wierzchołka są parami prostopadłe."),
        model: { kind: "choice-fixed", rule: "perpendicular-vertex" }
      }),
      choice("jednakowymi kwadratami", ["jednakowymi kwadratami", "różnymi trójkątami", "kołami"], {
        label: "Dwie pozostałe ściany",
        prompt: "Cztery ściany prostopadłościanu są jednakowymi prostokątami, które nie są kwadratami. Jakie są dwie pozostałe ściany?",
        hint: "Dwa wymiary bryły są wtedy równe, a trzeci jest inny.",
        explanation: "Dwie pozostałe ściany są jednakowymi kwadratami.",
        visual: cuboidVisual(4, 4, 6, "Cztery boczne ściany są jednakowe, a dwie podstawy są kwadratami."),
        model: { kind: "choice-fixed", rule: "square-bases" }
      }),
      choice(third, [pairLabel(length, width), pairLabel(width, height), third], {
        label: "Trzecia para ścian",
        prompt: `Jedna para ścian ma wymiary ${pairLabel(length, width)}, a druga ${pairLabel(width, height)}. Jakie wymiary ma trzecia para?`,
        hint: "Zostaw wspólny wymiar pary, a dwa skrajne wymiary pomnóż jako boki trzeciej ściany.",
        explanation: `Wymiary bryły to ${length} cm, ${width} cm i ${height} cm, więc trzecia para ma ${third}.`,
        visual: equation(`${pairLabel(length, width)}  i  ${pairLabel(width, height)}`, "Trzecia para łączy długość z wysokością."),
        model: { kind: "third-face", dimensions: [length, width, height] }
      }),
      fact("remaining-pairs", "Dół i góra są już jedną parą ścian równoległych. Ile innych par ścian równoległych ma prostopadłościan?", "Oprócz dołu i góry zostają przód z tyłem oraz lewa z prawą.", "Zostają jeszcze 2 pary.", box, "Pozostałe pary"),
      choice("nie", ["tak", "nie"], {
        label: "Krawędź na ścianie",
        prompt: "Czy krawędź prostopadłościanu jest równoległa do ściany, na której leży?",
        hint: "Krawędź leżąca na ścianie należy do tej ściany.",
        explanation: "Nie. Krawędź leżąca na ścianie nie jest do tej ściany równoległa.",
        visual: box,
        model: { kind: "choice-fixed", rule: "edge-on-face-parallel" }
      })
    ];
  }

  function netAnswerQuestion(cells) {
    const folds = foldCube(cells) !== null;
    const answer = folds ? "tak" : "nie";
    const countHint = cells.length === 6
      ? "Sprawdź, czy po złożeniu dwie części nie trafiają na tę samą ścianę."
      : "Policz kwadraty. Siatka sześcianu ma ich dokładnie 6.";
    return choice(answer, ["tak", "nie"], {
      label: "Czy to siatka?",
      prompt: "Czy z tych kwadratów połączonych bokami można skleić sześcian?",
      hint: countHint,
      explanation: folds
        ? "Tak. Sześć kwadratów składa się w sześcian i ściany się nie nakładają."
        : "Nie. Z tej figury nie da się skleić sześcianu.",
      visual: cubeNetVisual(cells, "Kwadraty są ponumerowane od góry i od lewej. Sprawdź, czy da się je złożyć."),
      model: { kind: "net-valid", cells: normalisedCells(cells) }
    });
  }

  function netQuestions() {
    const sixInvalid = invalidNets.filter((rows) => parseNet(rows).length === 6);
    const otherInvalid = invalidNets.filter((rows) => parseNet(rows).length !== 6);
    const oppositeCells = randomNet(cubeNets);
    const oppositeFace = rand(1, 6);
    const moreOpposite = randomNet(cubeNets);
    const moreFace = rand(1, 6);
    const neighborCells = randomNet(cubeNets);
    const neighborFace = rand(1, 6);
    return [
      netAnswerQuestion(randomNet(cubeNets)),
      netAnswerQuestion(randomNet(cubeNets)),
      netAnswerQuestion(randomNet(sixInvalid)),
      netAnswerQuestion(randomNet(sixInvalid)),
      netAnswerQuestion(randomNet(otherInvalid)),
      question({
        label: "Ściany naprzeciw siebie",
        prompt: `Siatkę sześcianu ponumerowano. Jaki numer ma ściana naprzeciw ściany ${oppositeFace}?`,
        answer: Number(oppositeLabel(oppositeCells, oppositeFace)),
        hint: "Ściany naprzeciw siebie nie mają wspólnego boku i po złożeniu nie stykają się krawędzią.",
        explanation: `Naprzeciw ściany ${oppositeFace} leży ściana ${oppositeLabel(oppositeCells, oppositeFace)}.`,
        visual: cubeNetVisual(oppositeCells, "Numery pokazują ściany przed złożeniem."),
        model: { kind: "net-opposite", cells: normalisedCells(oppositeCells), face: oppositeFace }
      }),
      question({
        label: "Druga para naprzeciw",
        prompt: `Który numer ma ściana naprzeciw ściany ${moreFace}?`,
        answer: Number(oppositeLabel(moreOpposite, moreFace)),
        hint: "Znajdź ścianę, która po złożeniu nie dotyka wybranej ani bokiem, ani przez wspólną krawędź.",
        explanation: `Naprzeciw ściany ${moreFace} jest ściana ${oppositeLabel(moreOpposite, moreFace)}.`,
        visual: cubeNetVisual(moreOpposite, "Każda ściana ma dokładnie jedną ścianę naprzeciwko."),
        model: { kind: "net-opposite", cells: normalisedCells(moreOpposite), face: moreFace }
      }),
      question({
        label: "Sąsiednie ściany",
        prompt: `Ile ścian na siatce styka się bokiem ze ścianą ${neighborFace}?`,
        answer: neighborCount(neighborCells, neighborFace),
        hint: "Licz tylko kwadraty, które mają z wybraną ścianą wspólny bok, nie sam róg.",
        explanation: `Ze ścianą ${neighborFace} stykają się bokiem ${neighborCount(neighborCells, neighborFace)} ściany.`,
        visual: cubeNetVisual(neighborCells, "Wspólny bok na siatce oznacza, że ściany są sąsiadami."),
        model: { kind: "net-neighbors", cells: normalisedCells(neighborCells), face: neighborFace }
      }),
      choice("nie", ["tak", "nie"], {
        label: "Języczek",
        prompt: "Czy języczek do sklejenia liczy się jako dodatkowa ściana prostopadłościanu?",
        hint: "Języczek tylko łączy dwie sąsiednie ściany.",
        explanation: "Nie. Języczek nie jest ścianą. Prostopadłościan ma 6 ścian.",
        visual: equation("6 ścian + języczki", "Języczek to pasek doklejony do brzegu ściany."),
        model: { kind: "choice-fixed", rule: "tab-is-face" }
      }),
      fact("net-squares", "Ile kwadratów ma siatka sześcianu?", "Każdy kwadrat siatki staje się jedną ścianą.", "Siatka sześcianu ma 6 kwadratów.", cubeNetVisual(randomNet(cubeNets), "Po jednym kwadracie na każdą ścianę."), "Liczba ścian siatki")
    ];
  }

  function measureQuestion(length, depth, height, data) {
    return question({
      ...data,
      visual: dimensionNet(length, depth, height),
      model: { ...data.model, dimensions: [length, depth, height] }
    });
  }

  function netMeasureQuestions() {
    const triple = () => distinctTriple(2, 6);
    const bases = [triple(), triple()];
    const sides = [triple(), triple()];
    const totals = [triple(), triple()];
    const longest = triple();
    const shortest = triple();
    const whole = triple();
    return [
      ...bases.map(([length, depth, height]) => measureQuestion(length, depth, height, {
        label: "Pole podstawy",
        prompt: "Na siatce podpisano długość D, szerokość S i wysokość W. Jakie jest pole podstawy w cm²?",
        answer: length * depth,
        hint: "Podstawa ma krawędzie D i S.",
        explanation: `${length} · ${depth} = ${length * depth} cm².`,
        model: { kind: "base-area" }
      })),
      ...sides.map(([length, depth, height]) => measureQuestion(length, depth, height, {
        label: "Ściana boczna",
        prompt: "Jakie jest pole ściany pasa, której boki to długość D i wysokość W? Podaj wynik w cm².",
        answer: length * height,
        hint: "Pomnóż długość przez wysokość.",
        explanation: `${length} · ${height} = ${length * height} cm².`,
        model: { kind: "side-area" }
      })),
      ...totals.map(([length, depth, height]) => measureQuestion(length, depth, height, {
        label: "Krawędzie z siatki",
        prompt: "Jaką długość w cm ma szkielet bryły o tych wymiarach D, S i W?",
        answer: edgeSum([length, depth, height]),
        hint: "Każdy z trzech wymiarów występuje na czterech krawędziach.",
        explanation: `4 · (${length} + ${depth} + ${height}) = ${edgeSum([length, depth, height])} cm.`,
        model: { kind: "edge-sum" }
      })),
      measureQuestion(longest[0], longest[1], longest[2], {
        label: "Najdłuższy odcinek",
        prompt: "Która z podpisanych krawędzi D, S i W jest najdłuższa? Podaj jej długość w cm.",
        answer: Math.max(...longest),
        hint: "Porównaj trzy liczby z legendy.",
        explanation: `Najdłuższa jest krawędź ${Math.max(...longest)} cm.`,
        model: { kind: "longest" }
      }),
      measureQuestion(shortest[0], shortest[1], shortest[2], {
        label: "Najkrótszy odcinek",
        prompt: "Która z podpisanych krawędzi D, S i W jest najkrótsza? Podaj jej długość w cm.",
        answer: Math.min(...shortest),
        hint: "Porównaj trzy liczby z legendy.",
        explanation: `Najkrótsza jest krawędź ${Math.min(...shortest)} cm.`,
        model: { kind: "shortest" }
      }),
      measureQuestion(whole[0], whole[1], whole[2], {
        label: "Powierzchnia z siatki",
        prompt: "Jakie jest pole powierzchni całej bryły w cm²?",
        answer: surfaceArea(whole[0], whole[1], whole[2]),
        hint: "Oblicz pola trzech różnych ścian, dodaj je i pomnóż przez 2.",
        explanation: `2 · (${whole[0] * whole[1]} + ${whole[1] * whole[2]} + ${whole[2] * whole[0]}) = ${surfaceArea(whole[0], whole[1], whole[2])} cm².`,
        model: { kind: "surface" }
      }),
      fact("net-squares", "Ile ścian widać na tej siatce prostopadłościanu?", "Siatka pokazuje każdą ścianę dokładnie raz.", "Na siatce widać 6 ścian.", dimensionNet(4, 3, 2), "Ściany siatki")
    ];
  }

  function cubeBlockQuestion(dimensions, data) {
    const [length, width, height] = dimensions;
    return question({
      ...data,
      visual: cuboidVisual(length, width, height, "Bryła ułożona z jednakowych kostek o krawędzi 1 cm.", { unit: "kostki" }),
      model: { ...data.model, dimensions }
    });
  }

  function cubeQuestions() {
    const plan = (usedFor) => {
      const columns = pick([2, 3]);
      const rows = 2;
      const heights = usedFor === "gap" ? heightsWithGap(columns, rows) : connectedHeights(columns, rows);
      return { columns, rows, heights };
    };
    const sums = [plan(), plan(), plan()];
    const top = plan();
    const peak = plan();
    const front = plan();
    const gap = plan("gap");
    const blocks = [[rand(2, 4), rand(2, 4), rand(2, 3)], [rand(2, 4), rand(2, 3), rand(2, 4)]];
    const roof = [rand(2, 5), rand(2, 4), rand(2, 3)];
    return [
      ...sums.map(({ columns, rows, heights }) => question({
        label: "Ile kostek?",
        prompt: "Ile kostek użyto do tej budowli? Liczba w kratce oznacza wysokość kolumny.",
        answer: sumOf(heights),
        hint: "Dodaj liczby ze wszystkich kratek. Pusta kratka ma wysokość 0.",
        explanation: `${heights.filter((value) => value > 0).join(" + ")} = ${sumOf(heights)}.`,
        visual: stackVisual(columns, rows, heights, "Dodaj wysokości wszystkich kolumn."),
        model: { kind: "stack-sum", heights, columns, rows }
      })),
      question({
        label: "Widok z góry",
        prompt: "Ile kolumn tej budowli widać z góry?",
        answer: top.heights.filter((value) => value > 0).length,
        hint: "Z góry widać każdą kolumnę, w której stoi choć jedna kostka.",
        explanation: `Zacieniowanych kolumn jest ${top.heights.filter((value) => value > 0).length}.`,
        visual: stackVisual(top.columns, top.rows, top.heights, "Zacieniowana kratka to kolumna widoczna z góry.", false),
        model: { kind: "stack-top", heights: top.heights, columns: top.columns, rows: top.rows }
      }),
      question({
        label: "Najwyższa kolumna",
        prompt: "Ile kostek ma najwyższa kolumna?",
        answer: Math.max(...peak.heights),
        hint: "Wybierz największą liczbę na planie.",
        explanation: `Największa wysokość to ${Math.max(...peak.heights)}.`,
        visual: stackVisual(peak.columns, peak.rows, peak.heights, "Wysokość kolumny to liczba kostek w stosie."),
        model: { kind: "stack-max", heights: peak.heights, columns: peak.columns, rows: peak.rows }
      }),
      question({
        label: "Widok z przodu",
        prompt: "Patrzysz od przodu, czyli od dolnego rzędu. Jak wysoka jest lewa kolumna widoku z przodu?",
        answer: columnMax(front.heights, front.columns, 0),
        hint: "W lewej kolumnie planu wybierz największą wysokość, także z dalszych rzędów.",
        explanation: `Lewa kolumna ma wysokości, których maksimum wynosi ${columnMax(front.heights, front.columns, 0)}.`,
        visual: stackVisual(front.columns, front.rows, front.heights, "Lewa kolumna planu zaczyna się od pierwszej kratki z lewej."),
        model: { kind: "stack-front", heights: front.heights, columns: front.columns, rows: front.rows }
      }),
      question({
        label: "Brakujące kostki",
        prompt: "Ile kostek brakuje, aby wypełnić prostopadłościan o podstawie tej siatki i wysokości najwyższej kolumny?",
        answer: gap.columns * gap.rows * Math.max(...gap.heights) - sumOf(gap.heights),
        hint: "Pomnóż liczbę kolumn, liczbę rzędów i najwyższą wysokość, a potem odejmij kostki, które już stoją.",
        explanation: `${gap.columns} · ${gap.rows} · ${Math.max(...gap.heights)} − ${sumOf(gap.heights)} = ${gap.columns * gap.rows * Math.max(...gap.heights) - sumOf(gap.heights)}.`,
        visual: stackVisual(gap.columns, gap.rows, gap.heights, "Puste miejsca i niższe kolumny uzupełnij do najwyższej wysokości."),
        model: { kind: "stack-gap", heights: gap.heights, columns: gap.columns, rows: gap.rows }
      }),
      ...blocks.map((dimensions) => cubeBlockQuestion(dimensions, {
        label: "Pełna bryła z kostek",
        prompt: `Z kostek o krawędzi 1 cm ułożono pełny prostopadłościan ${dimText(dimensions, "kostki")}. Ile kostek użyto?`,
        answer: dimensions[0] * dimensions[1] * dimensions[2],
        hint: "Pomnóż trzy wymiary liczone w kostkach.",
        explanation: `${dimensions.join(" · ")} = ${dimensions[0] * dimensions[1] * dimensions[2]} kostek.`,
        model: { kind: "box-count" }
      })),
      cubeBlockQuestion(roof, {
        label: "Kostki z góry",
        prompt: `Pełny prostopadłościan ma wymiary ${dimText(roof, "kostki")}. Ile kostek widać z góry?`,
        answer: roof[0] * roof[1],
        hint: "Z góry widać prostokąt o bokach równych długości i szerokości, bez wysokości.",
        explanation: `${roof[0]} · ${roof[1]} = ${roof[0] * roof[1]} kostek.`,
        model: { kind: "box-top" }
      })
    ];
  }

  function surfaceQuestions() {
    const cubeEdges = [rand(2, 10), rand(2, 10), rand(2, 10)];
    const faceEdge = rand(2, 12);
    const hiddenEdge = rand(2, 10);
    const boxes = [distinctTriple(2, 6), distinctTriple(2, 6), distinctTriple(2, 6)];
    const [centimetresA, centimetresB] = [rand(2, 6), rand(2, 6)];
    return [
      ...cubeEdges.map((edge) => question({
        label: "Powierzchnia sześcianu",
        prompt: `Sześcian ma krawędź ${edge} cm. Jakie jest jego pole powierzchni w cm²?`,
        answer: 6 * edge * edge,
        hint: "Oblicz pole jednej kwadratowej ściany, a potem pomnóż przez 6.",
        explanation: `6 · ${edge} · ${edge} = ${6 * edge * edge} cm².`,
        visual: cuboidVisual(edge, edge, edge, "Sześć jednakowych ścian."),
        model: { kind: "cube-surface", edge }
      })),
      question({
        label: "Jedna ściana",
        prompt: `Jakie jest pole jednej ściany sześcianu o krawędzi ${faceEdge} cm? Podaj wynik w cm².`,
        answer: faceEdge * faceEdge,
        hint: "Ściana sześcianu jest kwadratem.",
        explanation: `${faceEdge} · ${faceEdge} = ${faceEdge * faceEdge} cm².`,
        visual: cuboidVisual(faceEdge, faceEdge, faceEdge, "Jedna ściana to kwadrat o boku równym krawędzi."),
        model: { kind: "cube-face", edge: faceEdge }
      }),
      question({
        label: "Krawędź z pola",
        prompt: `Pole powierzchni sześcianu wynosi ${6 * hiddenEdge * hiddenEdge} cm². Ile cm ma jego krawędź?`,
        answer: hiddenEdge,
        hint: "Podziel pole przez 6. Potem znajdź liczbę, która pomnożona przez siebie daje ten wynik.",
        explanation: `${6 * hiddenEdge * hiddenEdge} : 6 = ${hiddenEdge * hiddenEdge}, a ${hiddenEdge} · ${hiddenEdge} = ${hiddenEdge * hiddenEdge}, więc krawędź ma ${hiddenEdge} cm.`,
        visual: equation(`6 · a · a = ${6 * hiddenEdge * hiddenEdge} cm²`, "Najpierw pole jednej ściany, potem długość jej boku."),
        model: { kind: "cube-edge-from-surface", surface: 6 * hiddenEdge * hiddenEdge }
      }),
      ...boxes.map((dimensions) => question({
        label: "Powierzchnia prostopadłościanu",
        prompt: `Prostopadłościan ma wymiary ${dimText(dimensions)}. Jakie jest jego pole powierzchni w cm²?`,
        answer: surfaceArea(...dimensions),
        hint: "Oblicz pola trzech różnych ścian, dodaj je i pomnóż przez 2.",
        explanation: `2 · (${dimensions[0] * dimensions[1]} + ${dimensions[1] * dimensions[2]} + ${dimensions[2] * dimensions[0]}) = ${surfaceArea(...dimensions)} cm².`,
        visual: cuboidVisual(dimensions[0], dimensions[1], dimensions[2], "Trzy różne ściany spotykają się w jednym wierzchołku."),
        model: { kind: "surface", dimensions }
      })),
      question({
        label: "Ta sama jednostka",
        prompt: `Prostopadłościan ma wymiary ${centimetresA} cm × ${centimetresB} cm × 1 dm. Jakie jest jego pole powierzchni w cm²?`,
        answer: surfaceArea(centimetresA, centimetresB, 10),
        hint: "Najpierw zamień 1 dm na 10 cm.",
        explanation: `1 dm = 10 cm. 2 · (${centimetresA * centimetresB} + ${centimetresB * 10} + ${10 * centimetresA}) = ${surfaceArea(centimetresA, centimetresB, 10)} cm².`,
        visual: cuboidVisual(centimetresA, centimetresB, 10, "Przed liczeniem pola wszystkie krawędzie są w centymetrach.", {
          heightLabel: "1 dm",
          alt: `Prostopadłościan o krawędziach ${centimetresA} cm, ${centimetresB} cm i 1 dm.`
        }),
        model: { kind: "surface", dimensions: [centimetresA, centimetresB, 10] }
      }),
      choice("3 × 2 × 2", ["12 × 1 × 1", "6 × 2 × 1", "3 × 2 × 2"], {
        label: "Najmniejsza powierzchnia",
        prompt: "Z 12 jednakowych kostek o krawędzi 1 cm ułożono pełny prostopadłościan. Które wymiary dają najmniejsze pole powierzchni?",
        hint: "Dla każdego układu oblicz 2 · (ab + bc + ca) i porównaj wyniki.",
        explanation: "Pola wynoszą 50 cm², 40 cm² i 32 cm². Najmniejsze pole ma prostopadłościan 3 × 2 × 2.",
        visual: equation("12×1×1 ,  6×2×1 ,  3×2×2", "Ta sama liczba kostek, inne pola powierzchni."),
        model: { kind: "choice-fixed", rule: "smallest-12" }
      })
    ];
  }

  function wrappingQuestions() {
    const room = [rand(3, 6), rand(3, 6), rand(2, 4)];
    const hall = [rand(4, 8), rand(3, 6), rand(2, 4)];
    const gift = distinctTriple(2, 6);
    const cubeEdge = rand(2, 9);
    const large = distinctTriple(2, 8);
    const face = [rand(4, 9), rand(4, 9)].sort((a, b) => a - b);
    const hole = rand(1, face[0] - 1);
    const tile = 10;
    const tiled = [tile * rand(2, 5), tile * rand(2, 4), tile * rand(2, 3)];
    const pool = [rand(2, 6), rand(2, 5), rand(1, 3)];
    const cage = [rand(3, 7), rand(2, 5), rand(2, 4)];
    const present = rand(2, 8);
    const products = [large[0] * large[1], large[1] * large[2], large[2] * large[0]];
    return [
      question({
        label: "Same ściany",
        prompt: `Pokój ma ${room[0]} m długości, ${room[1]} m szerokości i ${room[2]} m wysokości. Ile m² mają same ściany, bez podłogi i bez sufitu?`,
        answer: 2 * (room[0] + room[1]) * room[2],
        hint: "Obwód podłogi pomnóż przez wysokość pokoju.",
        explanation: `2 · (${room[0]} + ${room[1]}) · ${room[2]} = ${2 * (room[0] + room[1]) * room[2]} m².`,
        visual: cuboidVisual(room[0], room[1], room[2], "Malowane są cztery ściany boczne.", { unit: "m", highlight: "front" }),
        model: { kind: "walls", dimensions: room }
      }),
      question({
        label: "Ściany i sufit",
        prompt: `Sala ma ${hall[0]} m × ${hall[1]} m × ${hall[2]} m. Ile m² farby potrzeba na ściany i sufit, bez podłogi?`,
        answer: 2 * (hall[0] + hall[1]) * hall[2] + hall[0] * hall[1],
        hint: "Do czterech ścian dodaj pole sufitu, czyli długość razy szerokość.",
        explanation: `2 · (${hall[0]} + ${hall[1]}) · ${hall[2]} + ${hall[0]} · ${hall[1]} = ${2 * (hall[0] + hall[1]) * hall[2] + hall[0] * hall[1]} m².`,
        visual: cuboidVisual(hall[0], hall[1], hall[2], "Sufit jest górną ścianą.", { unit: "m", highlight: ["front", "top"] }),
        model: { kind: "walls-ceiling", dimensions: hall }
      }),
      question({
        label: "Całe pudełko",
        prompt: `Ola okleja całe pudełko o wymiarach ${dimText(gift)}. Ile cm² papieru potrzebuje?`,
        answer: surfaceArea(...gift),
        hint: "To pełne pole powierzchni prostopadłościanu.",
        explanation: `2 · (${gift[0] * gift[1]} + ${gift[1] * gift[2]} + ${gift[2] * gift[0]}) = ${surfaceArea(...gift)} cm².`,
        visual: cuboidVisual(gift[0], gift[1], gift[2], "Papier pokrywa wszystkie sześć ścian."),
        model: { kind: "surface", dimensions: gift }
      }),
      question({
        label: "Jedna ściana i całość",
        prompt: `Na jedną ścianę sześcianu o krawędzi ${cubeEdge} cm potrzeba ${cubeEdge * cubeEdge} cm² papieru. O ile cm² więcej potrzeba na całe pudełko?`,
        answer: 5 * cubeEdge * cubeEdge,
        hint: "Cały sześcian ma 6 takich ścian, a jedna jest już policzona.",
        explanation: `6 · ${cubeEdge * cubeEdge} − ${cubeEdge * cubeEdge} = ${5 * cubeEdge * cubeEdge} cm².`,
        visual: cuboidVisual(cubeEdge, cubeEdge, cubeEdge, "Zostaje pięć ścian takich jak pierwsza."),
        model: { kind: "cube-extra", edge: cubeEdge }
      }),
      question({
        label: "Dwie największe ściany",
        prompt: `Dwie największe ściany prostopadłościanu ${dimText(large)} oklejono żółtym papierem. Ile cm² papieru zużyto?`,
        answer: 2 * Math.max(...products),
        hint: "Oblicz trzy różne pola ścian i wybierz największe. Takie ściany są dwie.",
        explanation: `Pola ścian to ${products.join(", ")} cm². Dwie największe mają razem ${2 * Math.max(...products)} cm².`,
        visual: cuboidVisual(large[0], large[1], large[2], "Największa ściana występuje w parze."),
        model: { kind: "largest-faces", dimensions: large }
      }),
      question({
        label: "Nieoklejony kwadrat",
        prompt: `Oklejamy tylko ścianę ${face[0]} cm × ${face[1]} cm i zostawiamy na niej nieoklejony kwadrat o boku ${hole} cm. Ile cm² papieru potrzeba na tę ścianę?`,
        answer: face[0] * face[1] - hole * hole,
        hint: "Od pola prostokątnej ściany odejmij pole kwadratu.",
        explanation: `${face[0]} · ${face[1]} − ${hole} · ${hole} = ${face[0] * face[1] - hole * hole} cm².`,
        visual: equation(`${face[0]} · ${face[1]} − ${hole} · ${hole}`, "Kwadrat leży w całości na tej jednej ścianie."),
        model: { kind: "window", face, hole }
      }),
      question({
        label: "Kwadratowe naklejki",
        prompt: `Pudełko ${dimText(tiled)} oklejamy w całości kwadratami o boku ${tile} cm, bez docinania. Ile kwadratów potrzeba?`,
        answer: surfaceArea(...tiled) / (tile * tile),
        hint: "Najpierw oblicz pole powierzchni w cm², potem podziel przez pole jednej naklejki.",
        explanation: `Pc = ${surfaceArea(...tiled)} cm², a naklejka ma ${tile * tile} cm², więc ${surfaceArea(...tiled)} : ${tile * tile} = ${surfaceArea(...tiled) / (tile * tile)}.`,
        visual: cuboidVisual(tiled[0] / tile, tiled[1] / tile, tiled[2] / tile, "Każdy bok pudełka mieści całe naklejki.", { unit: "naklejki" }),
        model: { kind: "tiles", dimensions: tiled, tile }
      }),
      question({
        label: "Basen",
        prompt: `Mały basen ma dno ${pool[0]} m × ${pool[1]} m i głębokość ${pool[2]} m. Ile m² płytek potrzeba na dno i cztery ściany?`,
        answer: pool[0] * pool[1] + 2 * (pool[0] + pool[1]) * pool[2],
        hint: "Dodaj pole dna do pola czterech ścian.",
        explanation: `${pool[0]} · ${pool[1]} + 2 · (${pool[0]} + ${pool[1]}) · ${pool[2]} = ${pool[0] * pool[1] + 2 * (pool[0] + pool[1]) * pool[2]} m².`,
        visual: cuboidVisual(pool[0], pool[1], pool[2], "Płytki pokrywają dno i ściany, bez górnej powierzchni.", { unit: "m" }),
        model: { kind: "pool", dimensions: pool }
      }),
      question({
        label: "Siatka klatki",
        prompt: `Klatka ma ${cage[0]} cm długości, ${cage[1]} cm szerokości i ${cage[2]} cm wysokości. Ile cm² siatki potrzeba na cztery ściany boczne, bez podłogi i bez pokrywy?`,
        answer: 2 * (cage[0] + cage[1]) * cage[2],
        hint: "To ten sam rachunek co przy malowaniu czterech ścian pokoju.",
        explanation: `2 · (${cage[0]} + ${cage[1]}) · ${cage[2]} = ${2 * (cage[0] + cage[1]) * cage[2]} cm².`,
        visual: cuboidVisual(cage[0], cage[1], cage[2], "Siatka jest tylko na ścianach bocznych."),
        model: { kind: "walls", dimensions: cage }
      }),
      question({
        label: "Prezent w kształcie sześcianu",
        prompt: `Pudełko prezentu jest sześcianem o krawędzi ${present} cm. Ile cm² papieru potrzeba na całe pudełko?`,
        answer: 6 * present * present,
        hint: "Pomnóż pole jednej ściany przez 6.",
        explanation: `6 · ${present} · ${present} = ${6 * present * present} cm².`,
        visual: cuboidVisual(present, present, present, "Papier pokrywa sześć jednakowych ścian."),
        model: { kind: "cube-surface", edge: present }
      })
    ];
  }

  const builders = {
    bryly: solidQuestions,
    elementy: elementQuestions,
    wymiary: dimensionQuestions,
    "suma-krawedzi": edgeTotalQuestions,
    pary: pairQuestions,
    siatki: netQuestions,
    "siatka-wymiary": netMeasureQuestions,
    kostki: cubeQuestions,
    "pole-powierzchni": surfaceQuestions,
    oklejanie: wrappingQuestions
  };

  function buildQuestions(mode) {
    const stamp = (routeId, item) => ({ ...item, routeId, method: methods[routeId] });
    if (builders[mode]) return shuffle(builders[mode]()).map((item) => stamp(mode, item));
    return shuffle(Object.entries(builders).map(([routeId, build]) => stamp(routeId, pick(build()))));
  }

  MathTownGame.start({
    chapterId: "chapter8",
    chapterTitle: "Prostopadłościany i sześciany",
    routeLabels,
    routeHelp,
    buildQuestions,
    helpers: { foldCube, parseNet, cubeNets, invalidNets, surfaceArea, edgeSum, edgeCount, pairLabel, columnMax }
  });
})();
