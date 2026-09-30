(() => {
  "use strict";

  const routeLabels = {
    "kwadraty-jednostkowe": "Mozaika jednostek",
    "jednostki-pola": "Magazyn jednostek",
    "pole-prostokata": "Plan prostokątów",
    "pole-kwadratu": "Plac kwadratów",
    "brakujacy-bok": "Biuro brakujących boków",
    "figury-zlozone": "Pracownia figur złożonych",
    "zamiana-jednostek": "Winda jednostek pola",
    "ary-hektary": "Mierniczy terenów",
    wycinanki: "Warsztat wycinanek",
    "pola-w-praktyce": "Ekipa planistów",
    mix: "Wielki obchód pól"
  };

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
  const polishCount = MathTownGame.polishCount;
  const rowsOf = (rows, columns, unitFew, unitMany) =>
    `${polishCount(rows, "rząd", "rzędy", "rzędów")} po ${polishCount(columns, unitFew, unitFew, unitMany)}`;
  const question = (data) => ({ kind: "input", label: "Pola figur", visual: null, ...data });
  const equation = (expression, caption) => ({ type: "equation", expression, caption });
  const geometry = (shape, data, caption) => ({ type: "geometry", shape, ...data, caption });
  const choice = (answer, options, data) => question({
    ...data,
    kind: "choice",
    answer,
    options: options.map((value) => ({ value, label: String(value) }))
  });

  function areaModel(rows, columns, cells, caption, data = {}) {
    return { type: "area-model", rows, columns, cells, caption, ...data };
  }

  function fullGrid(rows, columns, caption, data = {}) {
    return areaModel(rows, columns, Array(rows * columns).fill(1), caption, data);
  }

  function cellsWith(rows, columns, fullIndices, halfIndices = []) {
    const cells = Array(rows * columns).fill(0);
    fullIndices.forEach((index) => { cells[index] = 1; });
    halfIndices.forEach((index) => { cells[index] = 0.5; });
    return cells;
  }

  function modelArea(visual) {
    return visual.cells.reduce((sum, value) => sum + value, 0);
  }

  function isSolidRectangle(cells, rows, columns) {
    const occupied = cells.map((value, index) => value ? index : -1).filter((index) => index >= 0);
    const occupiedRows = occupied.map((index) => Math.floor(index / columns));
    const occupiedColumns = occupied.map((index) => index % columns);
    const height = Math.max(...occupiedRows) - Math.min(...occupiedRows) + 1;
    const width = Math.max(...occupiedColumns) - Math.min(...occupiedColumns) + 1;
    return occupied.length === width * height;
  }

  function randomConnectedShape(rows, columns, targetArea) {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const occupied = new Set([rand(1, rows - 2) * columns + rand(1, columns - 2)]);
      while (occupied.size < targetArea) {
        const frontier = [];
        occupied.forEach((index) => {
          const row = Math.floor(index / columns), column = index % columns;
          [[row - 1, column], [row + 1, column], [row, column - 1], [row, column + 1]].forEach(([nextRow, nextColumn]) => {
            const nextIndex = nextRow * columns + nextColumn;
            if (nextRow >= 0 && nextRow < rows && nextColumn >= 0 && nextColumn < columns && !occupied.has(nextIndex) && !frontier.includes(nextIndex)) frontier.push(nextIndex);
          });
        });
        occupied.add(pick(frontier));
      }
      const cells = Array.from({ length: rows * columns }, (_, index) => occupied.has(index) ? 1 : 0);
      if (!isSolidRectangle(cells, rows, columns)) return cells;
    }
    const centerRow = Math.floor(rows / 2), centerColumn = Math.floor(columns / 2);
    const nearestFirst = Array.from({ length: rows * columns }, (_, index) => index).sort((first, second) => {
      const firstDistance = Math.abs(Math.floor(first / columns) - centerRow) + Math.abs(first % columns - centerColumn);
      const secondDistance = Math.abs(Math.floor(second / columns) - centerRow) + Math.abs(second % columns - centerColumn);
      return firstDistance - secondDistance || first - second;
    });
    return cellsWith(rows, columns, nearestFirst.slice(0, targetArea));
  }

  function unitSquareQuestions() {
    const rows = rand(2, 5), columns = rand(3, 7);
    const lRows = rand(3, 5), lColumns = rand(4, 6), cutRows = rand(1, lRows - 1), cutColumns = rand(1, lColumns - 1);
    const lCells = Array.from({ length: lRows * lColumns }, (_, index) => {
      const row = Math.floor(index / lColumns), column = index % lColumns;
      return row < cutRows && column >= lColumns - cutColumns ? 0 : 1;
    });
    const fullCount = pick([4, 6, 8]), halfCount = pick([2, 4, 6]);
    const halfCells = [...Array(fullCount).fill(1), ...Array(halfCount).fill(0.5), 0, 0];
    const stair = cellsWith(4, 5, [0, 5, 6, 10, 11, 12, 15, 16, 17, 18]);
    const cross = cellsWith(3, 5, [2, 5, 6, 7, 8, 9, 12]);
    const six = cellsWith(3, 4, [0, 1, 4, 5, 6, 9]);
    const pairedHalves = cellsWith(2, 4, [0, 1, 4], [2, 3, 5, 6]);
    const dominoCols = pick([4, 6]), dominoRows = rand(2, 4);
    const dominoTotal = dominoCols * dominoRows;
    const triangleCols = rand(2, 4), triangleRows = rand(2, 3);
    const triangleTotal = triangleCols * triangleRows;
    return [
      question({ label: "Kwadraty jednostkowe", prompt: "Każda kratka ma pole 1. Jakie pole ma zaznaczony prostokąt?", answer: rows * columns, hint: `Policz ${rowsOf(rows, columns, "kratki", "kratek")}.`, explanation: `${rows} · ${columns} = ${rows * columns} jednostek kwadratowych.`, visual: fullGrid(rows, columns, "Równe kratki dokładnie pokrywają prostokąt.") }),
      question({ label: "Figura na siatce", prompt: "Każda pełna kratka ma pole 1. Jakie pole ma zaznaczona figura z wyciętym narożnikiem?", answer: modelArea(areaModel(lRows, lColumns, lCells)), hint: "Policz pełny prostokąt i odejmij puste kratki w narożniku.", explanation: `Pełny prostokąt ma ${lRows * lColumns} kratek, a wycięto ${cutRows * cutColumns}. Pole wynosi ${lRows * lColumns - cutRows * cutColumns}.`, visual: areaModel(lRows, lColumns, lCells, "Puste kratki nie należą do figury.") }),
      question({ label: "Połówki kratek", prompt: "Dwie połówki tworzą jedną całą kratkę. Jakie pole ma zaznaczona figura?", answer: fullCount + halfCount / 2, hint: `Połącz ${halfCount} połówek w pary.`, explanation: `${fullCount} pełnych kratek i ${halfCount} połówek, czyli ${halfCount / 2} całe kratki, daje razem ${fullCount + halfCount / 2}.`, visual: areaModel(2, (halfCells.length) / 2, halfCells, "Zielone trójkąty są połówkami jednakowych kratek.") }),
      choice("1", ["1", "2", "1/2"], { label: "Połówki kratek", prompt: "Jakie pole mają razem dwie połówki tej samej kratki?", hint: "Dwie równe części składają się na całość.", explanation: "Dwie połówki mają razem pole jednej kratki, czyli 1.", visual: areaModel(1, 2, [0.5, 0.5], "Dwie połówki można złożyć w jedną pełną kratkę.") }),
      question({ label: "Schodkowa mozaika", prompt: "Jakie pole ma zaznaczona schodkowa figura, jeśli kratka ma pole 1?", answer: modelArea(areaModel(4, 5, stair)), hint: "Licz zaznaczone kratki wierszami: od góry do dołu.", explanation: `Zaznaczono ${modelArea(areaModel(4, 5, stair))} pełnych kratek, więc pole wynosi ${modelArea(areaModel(4, 5, stair))}.`, visual: areaModel(4, 5, stair, "Każda żółta kratka wnosi 1 do pola.") }),
      question({ label: "Krzyż z kratek", prompt: "Ile jednostek kwadratowych zajmuje zaznaczony krzyż?", answer: 7, hint: "Policz 5 kratek w środkowym rzędzie i po jednej nad nim oraz pod nim.", explanation: "5 + 1 + 1 = 7 jednostek kwadratowych.", visual: areaModel(3, 5, cross, "Policz każdą zaznaczoną kratkę dokładnie raz.") }),
      choice("6", ["5", "6", "7"], { label: "Różne kształty, równe pole", prompt: "Figura może mieć inny kształt niż prostokąt. Jakie pole ma ta figura?", hint: "Kształt brzegu nie zmienia pola pojedynczych kratek.", explanation: "Figura składa się z 6 pełnych kratek, więc ma pole 6.", visual: areaModel(3, 4, six, "Sześć kratek ułożono w nieregularny kształt.") }),
      question({ label: "Dodawanie pola", prompt: `Figura ma pole ${rows * columns}. Dołożono jedną pełną kratkę. Jakie jest nowe pole?`, answer: rows * columns + 1, hint: "Do dotychczasowego pola dodaj 1.", explanation: `${rows * columns} + 1 = ${rows * columns + 1}.`, visual: fullGrid(rows, columns, "To figura przed dołożeniem jednej kratki.") }),
      question({ label: "Odejmowanie pola", prompt: `Prostokąt ma ${rows * columns} kratek. Usunięto ${columns} kratek tworzących jeden cały rząd. Jakie pole zostało?`, answer: rows * columns - columns, hint: `Odejmij pole jednego rzędu, czyli ${columns}.`, explanation: `${rows * columns} − ${columns} = ${rows * columns - columns}.`, visual: fullGrid(rows, columns, "Jeden rząd zawiera tyle kratek, ile wynosi szerokość prostokąta.") }),
      question({ label: "Całe i połówki", prompt: "Jakie pole ma zaznaczona figura z pełnych kratek i połówek?", answer: 5, hint: "Cztery połówki zamień na dwie pełne kratki.", explanation: "3 pełne kratki + 4 połówki = 3 + 2 = 5.", visual: areaModel(2, 4, pairedHalves, "Każda zielona część to połowa kratki.") }),
      question({ label: "Jednostka domino", prompt: `Prostokąt składa się z ${dominoTotal} kratek. Jeśli za jednostkę pola przyjmiemy płytkę z 2 kratek (domino), jakie jest pole tego prostokąta?`, answer: dominoTotal / 2, hint: `Podziel liczbę kratek (${dominoTotal}) przez 2, bo każda płytka zajmuje 2 kratki.`, explanation: `${dominoTotal} : 2 = ${dominoTotal / 2} płytek domina.`, visual: fullGrid(dominoRows, dominoCols, "Każda para kratek tworzy jedną płytkę.") }),
      question({ label: "Jednostka trójkątna", prompt: `Prostokąt ma ${triangleTotal} kratek. Jeśli za jednostkę pola przyjmiemy trójkąt będący połową jednej kratki, jakie jest pole prostokąta?`, answer: triangleTotal * 2, hint: "W każdej pojedynczej kratce mieszczą się 2 takie trójkąty.", explanation: `${triangleTotal} · 2 = ${triangleTotal * 2} trójkątnych jednostek.`, visual: fullGrid(triangleRows, triangleCols, "Każda kratka składa się z dwóch trójkątnych połówek.") })
    ];
  }

  function areaUnitQuestions() {
    return [
      choice("cm²", ["cm", "cm²", "cm³"], { label: "Zapis jednostki", prompt: "Który zapis oznacza centymetr kwadratowy?", hint: "Jednostka pola ma małą dwójkę nad symbolem długości.", explanation: "Centymetr kwadratowy zapisujemy cm².", visual: equation("1 cm · 1 cm = 1 cm²", "Pole kwadratu o boku 1 cm to 1 cm².") }),
      choice("mm²", ["mm", "mm²", "m²"], { label: "Małe powierzchnie", prompt: "W jakiej jednostce najwygodniej podać pole łebka od szpilki?", hint: "To bardzo mała powierzchnia.", explanation: "Dla bardzo małych powierzchni wygodne są milimetry kwadratowe.", visual: equation("1 mm · 1 mm = 1 mm²", "To najmniejsza z podanych jednostek pola.") }),
      choice("cm²", ["mm²", "cm²", "km²"], { label: "Powierzchnia zeszytu", prompt: "W jakiej jednostce najwygodniej podać pole okładki zeszytu?", hint: "Boki zeszytu zwykle mierzymy w centymetrach.", explanation: "Pole okładki zeszytu wygodnie wyrazić w cm².", visual: equation("cm · cm = cm²", "Jednostka pola wynika z jednostek obu boków.") }),
      choice("m²", ["cm²", "m²", "km²"], { label: "Powierzchnia pokoju", prompt: "W jakiej jednostce najwygodniej podać pole podłogi pokoju?", hint: "Boki pokoju zwykle mierzymy w metrach.", explanation: "Pole podłogi pokoju podaje się zwykle w m².", visual: equation("m · m = m²", "Metry kwadratowe pasują do powierzchni pomieszczeń.") }),
      choice("km²", ["m²", "km²", "cm²"], { label: "Powierzchnia kraju", prompt: "W jakiej jednostce najwygodniej podać powierzchnię kraju?", hint: "Potrzebna jest bardzo duża jednostka pola.", explanation: "Powierzchnie państw wygodnie podaje się w km².", visual: equation("1 km · 1 km = 1 km²", "Kilometr kwadratowy opisuje duże tereny.") }),
      choice("pole kwadratu o boku 1 dm", ["długość 1 dm", "pole kwadratu o boku 1 dm", "obwód kwadratu o boku 1 dm"], { label: "Znaczenie jednostki", prompt: "Co oznacza 1 dm²?", hint: "Jednostka kwadratowa opisuje powierzchnię, nie długość ani obwód.", explanation: "1 dm² to pole kwadratu o boku 1 dm.", visual: fullGrid(1, 1, "Jeden kwadrat jednostkowy.", { showDimensions: true, unit: "dm" }) }),
      choice("pole", ["pole", "długość", "masa"], { label: "Co mierzymy?", prompt: "Wielkość zapisana jako 24 cm² to długość, pole czy masa?", hint: "Zwróć uwagę na znak ².", explanation: "Kwadratowa jednostka cm² służy do mierzenia pola.", visual: equation("24 cm²", "Dwójka w jednostce wskazuje pomiar powierzchni.") }),
      choice("m²", ["m", "m²", "m³"], { label: "Dobór zapisu", prompt: "Ogrodnik zmierzył powierzchnię trawnika. Której jednostki powinien użyć?", hint: "Powierzchnia to pole, więc jednostka musi być kwadratowa.", explanation: "Pole trawnika można podać w metrach kwadratowych, czyli m².", visual: equation("długość · szerokość", "Iloczyn dwóch długości daje jednostkę kwadratową.") }),
      choice("nie", ["tak", "nie"], { label: "Jednostka a liczba", prompt: "Czy 8 cm² i 8 m² oznaczają takie samo pole?", hint: "Porównaj rozmiary kwadratu o boku 1 cm i o boku 1 m.", explanation: "Nie. Metr kwadratowy jest znacznie większy od centymetra kwadratowego.", visual: equation("8 cm² ≠ 8 m²", "Ta sama liczba nie wystarcza — ważna jest jednostka.") }),
      choice("obie długości w tej samej jednostce", ["obie długości w tej samej jednostce", "jedna długość w cm, druga w mm", "bez żadnych jednostek"], { label: "Zanim pomnożysz", prompt: "Co trzeba sprawdzić przed obliczeniem pola prostokąta?", hint: "Nie można bezpośrednio mnożyć boków zapisanych w różnych jednostkach.", explanation: "Długość i szerokość trzeba najpierw zapisać w tej samej jednostce.", visual: equation("15 mm · 3 cm  →  15 mm · 30 mm", "Najpierw ujednolić jednostki.") }),
      choice("100", ["10", "100", "1000"], { label: "Kwadraty w decymetrze", prompt: "Ile kwadratów o boku 1 cm mieści się w kwadracie o boku 1 dm?", hint: "Kwadrat ma 10 rzędów po 10 kwadratów centymetrowych.", explanation: "10 · 10 = 100, więc w 1 dm² mieści się 100 cm².", visual: fullGrid(10, 10, "Kwadrat 1 dm na 1 dm podzielony na kwadraty 1 cm.", { showDimensions: true, unit: "dm" }) }),
      choice("ar", ["ar", "hektar", "metr"], { label: "Jednostka działki", prompt: "W jakiej jednostce terenu najwygodniej podać pole działki równe 800 m² jako liczbę 8?", hint: "1 ar to dokładnie 100 m².", explanation: "800 m² = 8 a, więc jednostką jest ar.", visual: equation("800 m² = 8 a", "1 ar to pole kwadratu o boku 10 m.") })
    ];
  }

  function rectangleAreaQuestions() {
    const dimensions = Array.from({ length: 9 }, () => [rand(2, 9), rand(2, 8)]);
    const units = ["cm", "mm", "dm", "m", "cm", "m", "dm", "mm", "cm"];
    const baseQuestions = dimensions.map(([width, height], index) => question({
      label: index < 2 ? "Rzędy kratek" : "Pole prostokąta",
      prompt: index < 2
        ? `Prostokąt ma ${rowsOf(height, width, "kwadraty jednostkowe", "kwadratów jednostkowych")}. Jakie ma pole?`
        : `Prostokąt ma boki ${width} ${units[index]} i ${height} ${units[index]}. Ile wynosi jego pole w ${units[index]}²?`,
      answer: width * height,
      hint: "Pomnóż długość przez szerokość.",
      explanation: `${width} · ${height} = ${width * height} ${index < 2 ? "jednostek kwadratowych" : `${units[index]}²`}.`,
      visual: fullGrid(height, width, `${rowsOf(height, width, "równe kwadraty", "równych kwadratów")}.`, { showDimensions: index >= 2, unit: index >= 2 ? units[index] : "" })
    }));

    const dmSide = rand(1, 3), cmSide = rand(2, 8) * 5;
    const mixedDmQuestion = question({
      label: "Różne jednostki boków",
      prompt: `Prostokąt ma boki ${dmSide} dm i ${cmSide} cm. Ile wynosi jego pole w cm²?`,
      answer: (dmSide * 10) * cmSide,
      hint: `Najpierw zamień ${dmSide} dm na centymetry: ${dmSide} dm = ${dmSide * 10} cm, a potem pomnóż boki.`,
      explanation: `${dmSide} dm = ${dmSide * 10} cm. Pole: ${dmSide * 10} · ${cmSide} = ${(dmSide * 10) * cmSide} cm².`,
      visual: geometry("rectangle", {
        width: dmSide * 10,
        height: cmSide,
        showDimensions: true,
        widthLabel: `${dmSide} dm`,
        heightLabel: `${cmSide} cm`,
        alt: `Prostokąt o bokach ${dmSide} dm i ${cmSide} cm.`
      }, "Przed obliczeniem pola zamień decymetry na centymetry.")
    });

    const cmSide2 = rand(2, 6), mmSide = rand(2, 8) * 10;
    const mixedMmQuestion = question({
      label: "Różne jednostki boków",
      prompt: `Prostokąt ma boki ${cmSide2} cm i ${mmSide} mm. Ile wynosi jego pole w cm²?`,
      answer: cmSide2 * (mmSide / 10),
      hint: `Zamień ${mmSide} mm na centymetry (${mmSide / 10} cm), a potem pomnóż długości obu boków.`,
      explanation: `${mmSide} mm = ${mmSide / 10} cm. Pole: ${cmSide2} · ${mmSide / 10} = ${cmSide2 * (mmSide / 10)} cm².`,
      visual: geometry("rectangle", {
        width: cmSide2,
        height: mmSide / 10,
        showDimensions: true,
        widthLabel: `${cmSide2} cm`,
        heightLabel: `${mmSide} mm`,
        alt: `Prostokąt o bokach ${cmSide2} cm i ${mmSide} mm.`
      }, "10 mm = 1 cm, więc ujednolić jednostki.")
    });

    const perimW = rand(4, 9), perimH = rand(2, 5);
    const perimeterQuestion = question({
      label: "Pole a obwód prostokąta",
      prompt: `Prostokąt ma boki ${perimW} cm i ${perimH} cm (obwód wynosi ${2 * (perimW + perimH)} cm). Ile wynosi jego pole w cm²?`,
      answer: perimW * perimH,
      hint: "Pole to długość razy szerokość.",
      explanation: `${perimW} · ${perimH} = ${perimW * perimH} cm² (nie myl z obwodem ${2 * (perimW + perimH)} cm).`,
      visual: geometry("rectangle", {
        width: perimW,
        height: perimH,
        showDimensions: true,
        widthLabel: `${perimW} cm`,
        heightLabel: `${perimH} cm`,
        alt: `Prostokąt o bokach ${perimW} cm i ${perimH} cm.`
      }, "Pole to iloczyn boków, a obwód to suma wszystkich boków.")
    });

    return [...baseQuestions, mixedDmQuestion, mixedMmQuestion, perimeterQuestion];
  }

  function squareAreaQuestions() {
    const sides = Array.from({ length: 6 }, () => rand(2, 12));
    const area = pick([16, 25, 36, 49, 64, 81, 100]);
    const root = Math.sqrt(area);
    const perimSide = rand(3, 10);
    const perimFromAreaSide = pick([4, 5, 6, 7, 8, 9, 10]);
    return [
      ...sides.map((side, index) => {
        const unit = index % 2 ? "m" : "cm";
        const visual = side <= 8
          ? fullGrid(side, side, `${rowsOf(side, side, "kwadraty", "kwadratów")}.`, { showDimensions: true, unit })
          : geometry("rectangle", {
            square: true,
            width: side,
            height: side,
            showDimensions: true,
            widthLabel: `${side} ${unit}`,
            heightLabel: `${side} ${unit}`,
            alt: `Kwadrat o dwóch oznaczonych bokach długości ${side} ${unit}.`
          }, "Równe boki kwadratu: bok · bok.");
        return question({ label: "Pole kwadratu", prompt: `Kwadrat ma bok ${side} ${unit}. Ile wynosi jego pole w ${unit}²?`, answer: side * side, hint: "Pomnóż długość boku przez tę samą długość.", explanation: `${side} · ${side} = ${side * side} ${unit}².`, visual });
      }),
      choice("64 cm²", ["32 cm²", "64 cm²", "64 cm"], { label: "Pole czy obwód?", prompt: "Kwadrat ma bok 8 cm. Który wynik jest jego polem?", hint: "Pole to bok razy bok, a jednostka jest kwadratowa.", explanation: "8 · 8 = 64, więc pole wynosi 64 cm².", visual: equation("P = 8 cm · 8 cm", "Nie dodawaj czterech boków — to byłby obwód.") }),
      choice("mają różne pola", ["mają równe pola", "mają różne pola"], { label: "Porównanie kwadratów", prompt: "Pierwszy kwadrat ma bok 4 cm, a drugi 5 cm. Czy mają równe pola?", hint: "Oblicz 4 · 4 oraz 5 · 5.", explanation: "Ich pola to 16 cm² i 25 cm², więc są różne.", visual: equation("4 · 4  ?  5 · 5", "Porównaj iloczyny, nie same boki.") }),
      question({ label: "Bok kwadratu", prompt: `Pole kwadratu wynosi ${area} cm². Ile centymetrów ma jego bok?`, answer: root, hint: `Znajdź liczbę, która pomnożona przez siebie daje ${area}.`, explanation: `${root} · ${root} = ${area}, więc bok ma ${root} cm.`, visual: equation(`? · ? = ${area} cm²`, "Oba boki kwadratu są równe.") }),
      question({
        label: "Pole z obwodu kwadratu",
        prompt: `Kwadrat ma obwód ${4 * perimSide} cm. Ile wynosi jego pole w cm²?`,
        answer: perimSide * perimSide,
        hint: `Podziel obwód przez 4, aby poznać bok (${4 * perimSide} : 4 = ${perimSide} cm), a potem pomnóż bok przez siebie.`,
        explanation: `Bok: ${4 * perimSide} : 4 = ${perimSide} cm. Pole: ${perimSide} · ${perimSide} = ${perimSide * perimSide} cm².`,
        visual: geometry("rectangle", {
          square: true,
          width: perimSide,
          height: perimSide,
          showDimensions: true,
          widthLabel: "? cm",
          heightLabel: "? cm",
          alt: `Kwadrat o obwodzie ${4 * perimSide} cm i nieznanym boku.`
        }, "Kwadrat ma 4 równe boki: bok = obwód : 4.")
      }),
      question({
        label: "Obwód z pola kwadratu",
        prompt: `Pole kwadratu wynosi ${perimFromAreaSide * perimFromAreaSide} cm². Ile wynosi jego obwód w cm?`,
        answer: 4 * perimFromAreaSide,
        hint: `Znajdź bok kwadratu (? · ? = ${perimFromAreaSide * perimFromAreaSide}), a potem pomnóż go przez 4.`,
        explanation: `Bok: ${perimFromAreaSide} cm, bo ${perimFromAreaSide} · ${perimFromAreaSide} = ${perimFromAreaSide * perimFromAreaSide}. Obwód: 4 · ${perimFromAreaSide} = ${4 * perimFromAreaSide} cm.`,
        visual: geometry("rectangle", {
          square: true,
          width: perimFromAreaSide,
          height: perimFromAreaSide,
          showDimensions: true,
          areaLabel: `P = ${perimFromAreaSide * perimFromAreaSide} cm²`,
          widthLabel: "? cm",
          heightLabel: "? cm",
          alt: `Kwadrat o polu ${perimFromAreaSide * perimFromAreaSide} cm².`
        }, "Najpierw odzyskaj bok z pola, a potem oblicz sumę czterech boków.")
      }),
      question({
        label: "Pole kwadratu w metrach",
        prompt: `Kwadratowa rabata ma bok ${perimSide} m. Ile wynosi jej pole w m²?`,
        answer: perimSide * perimSide,
        hint: "Pomnóż bok przez bok w metrach.",
        explanation: `${perimSide} · ${perimSide} = ${perimSide * perimSide} m².`,
        visual: equation(`${perimSide} m · ${perimSide} m`, "Kwadratowa rabata.")
      })
    ];
  }

  function missingSideQuestions() {
    const regularQuestions = Array.from({ length: 8 }, (_, index) => {
      const known = rand(2, 12), missing = rand(2, 12), area = known * missing;
      const unit = index % 3 === 0 ? "m" : index % 3 === 1 ? "cm" : "dm";
      const visual = geometry("rectangle", {
        width: known,
        height: missing,
        proportional: true,
        showDimensions: true,
        widthLabel: `${known} ${unit}`,
        heightLabel: `? ${unit}`,
        areaLabel: `P = ${area} ${unit}²`,
        alt: `Prostokąt o polu ${area} ${unit}². Poziomy bok ma ${known} ${unit}, a pionowy bok ma nieznaną długość.`
      }, "Pole prostokąta podziel przez długość znanego boku.");
      return question({ label: index < 6 ? "Brakujący bok" : "Sprawdzenie dzielenia", prompt: `Pole prostokąta wynosi ${area} ${unit}². Jeden bok ma ${known} ${unit}. Ile ${unit} ma drugi bok?`, answer: missing, hint: `Podziel pole ${area} przez znany bok ${known}.`, explanation: `${area} : ${known} = ${missing} ${unit}. Sprawdzenie: ${known} · ${missing} = ${area}.`, visual });
    });

    const knownW1 = rand(3, 8), missingH1 = rand(2, 6), area1 = knownW1 * missingH1;
    const perimFromArea = question({
      label: "Obwód z pola i boku",
      prompt: `Pole prostokąta wynosi ${area1} cm², a jeden bok ma ${knownW1} cm. Ile wynosi obwód tego prostokąta w cm?`,
      answer: 2 * (knownW1 + missingH1),
      hint: `Najpierw znajdź drugi bok (${area1} : ${knownW1} = ${missingH1} cm), a potem dodaj wszystkie cztery boki.`,
      explanation: `Drugi bok: ${area1} : ${knownW1} = ${missingH1} cm. Obwód: 2 · ${knownW1} + 2 · ${missingH1} = ${2 * (knownW1 + missingH1)} cm.`,
      visual: geometry("rectangle", {
        width: knownW1,
        height: missingH1,
        proportional: true,
        showDimensions: true,
        widthLabel: `${knownW1} cm`,
        heightLabel: `? cm`,
        areaLabel: `P = ${area1} cm²`,
        alt: `Prostokąt o polu ${area1} cm² i boku ${knownW1} cm.`
      }, "Oblicz drugi bok z pola, a potem wyznacz obwód.")
    });

    const knownW2 = rand(3, 9), missingH2 = rand(2, 7), area2 = knownW2 * missingH2;
    const perimFromArea2 = question({
      label: "Obwód z pola i boku",
      prompt: `Pole prostokąta wynosi ${area2} m², a jeden bok ma ${knownW2} m. Ile wynosi obwód tego prostokąta w m?`,
      answer: 2 * (knownW2 + missingH2),
      hint: `Podziel pole przez znany bok (${area2} : ${knownW2} = ${missingH2} m), a potem oblicz obwód.`,
      explanation: `Drugi bok: ${area2} : ${knownW2} = ${missingH2} m. Obwód: 2 · (${knownW2} + ${missingH2}) = ${2 * (knownW2 + missingH2)} m.`,
      visual: geometry("rectangle", {
        width: knownW2,
        height: missingH2,
        proportional: true,
        showDimensions: true,
        widthLabel: `${knownW2} m`,
        heightLabel: `? m`,
        areaLabel: `P = ${area2} m²`,
        alt: `Prostokąt o polu ${area2} m² i boku ${knownW2} m.`
      }, "Brakujący bok otrzymasz z dzielenia pola przez znany bok.")
    });

    const knownW3 = rand(3, 8), missingH3 = rand(2, 6);
    const halfPerim = knownW3 + missingH3;
    const areaFromPerim = question({
      label: "Pole z obwodu i boku",
      prompt: `Prostokąt ma obwód ${2 * halfPerim} cm i jeden bok ${knownW3} cm. Ile wynosi jego pole w cm²?`,
      answer: knownW3 * missingH3,
      hint: `Połowa obwodu to ${halfPerim} cm. Odejmij znany bok (${halfPerim} − ${knownW3} = ${missingH3} cm), a potem pomnóż boki.`,
      explanation: `Drugi bok: ${halfPerim} − ${knownW3} = ${missingH3} cm. Pole: ${knownW3} · ${missingH3} = ${knownW3 * missingH3} cm².`,
      visual: geometry("rectangle", {
        width: knownW3,
        height: missingH3,
        proportional: true,
        showDimensions: true,
        widthLabel: `${knownW3} cm`,
        heightLabel: `? cm`,
        alt: `Prostokąt o obwodzie ${2 * halfPerim} cm i jednym boku ${knownW3} cm.`
      }, "Połowa obwodu to suma długości i szerokości.")
    });

    const knownW4 = rand(2, 7), missingH4 = rand(3, 8);
    const halfPerim4 = knownW4 + missingH4;
    const areaFromPerim2 = question({
      label: "Pole z obwodu i boku",
      prompt: `Prostokąt ma obwód ${2 * halfPerim4} m i jeden bok ${knownW4} m. Ile wynosi jego pole w m²?`,
      answer: knownW4 * missingH4,
      hint: `Połowa obwodu to ${halfPerim4} m. Drugi bok ma ${halfPerim4} − ${knownW4} = ${missingH4} m. Oblicz pole.`,
      explanation: `Drugi bok: ${halfPerim4} − ${knownW4} = ${missingH4} m. Pole: ${knownW4} · ${missingH4} = ${knownW4 * missingH4} m².`,
      visual: geometry("rectangle", {
        width: knownW4,
        height: missingH4,
        proportional: true,
        showDimensions: true,
        widthLabel: `${knownW4} m`,
        heightLabel: `? m`,
        alt: `Prostokąt o obwodzie ${2 * halfPerim4} m i jednym boku ${knownW4} m.`
      }, "Odejmij znany bok od połowy obwodu, aby poznać drugi bok.")
    });

    return [...regularQuestions, perimFromArea, perimFromArea2, areaFromPerim, areaFromPerim2];
  }

  function compositeAreaQuestions() {
    const polyominoes = Array.from({ length: 4 }, () => {
      const shapeRows = rand(5, 7), shapeColumns = rand(5, 8);
      const targetArea = rand(8, Math.floor(shapeRows * shapeColumns * 0.6));
      const cells = randomConnectedShape(shapeRows, shapeColumns, targetArea);
      const rowCounts = Array.from({ length: shapeRows }, (_, row) => cells.slice(row * shapeColumns, (row + 1) * shapeColumns).reduce((sum, value) => sum + value, 0)).filter(Boolean);
      return question({
        label: "Zacieniona figura",
        prompt: "Bok każdej kratki ma 1 cm. Jakie jest pole zacienionej figury w cm²?",
        answer: targetArea,
        hint: "Policz zacienione kwadraty osobno w każdym rzędzie, a potem dodaj wyniki.",
        explanation: `${rowCounts.join(" + ")} = ${targetArea}, więc pole figury wynosi ${targetArea} cm².`,
        visual: areaModel(shapeRows, shapeColumns, cells, "Zacienione kratki tworzą jedną połączoną figurę.", { outlineShape: true, alt: `Zacieniona figura na siatce. Liczby zacienionych kratek w kolejnych niepustych wierszach: ${rowCounts.join(", ")}.` })
      });
    });

    const cutouts = Array.from({ length: 4 }, (_, index) => {
      const rows = rand(3, 6), columns = rand(4, 8);
      const cutRows = rand(1, rows - 1), cutColumns = rand(1, columns - 1);
      const cutFromRight = index % 2 === 0;
      const cells = Array.from({ length: rows * columns }, (_, cellIndex) => {
        const row = Math.floor(cellIndex / columns), column = cellIndex % columns;
        const inCutRows = row < cutRows;
        const inCutColumns = cutFromRight ? column >= columns - cutColumns : column < cutColumns;
        return inCutRows && inCutColumns ? 0 : 1;
      });
      const area = modelArea(areaModel(rows, columns, cells));
      return question({
        label: "Odejmowanie wycięcia",
        prompt: "Każda kratka ma pole 1. Jakie pole ma zaznaczona figura złożona?",
        answer: area,
        hint: "Oblicz pole całego prostokąta i odejmij prostokątne wycięcie.",
        explanation: `Pełny prostokąt ma ${rows * columns}, a wycięcie ${cutRows * cutColumns}. ${rows * columns} − ${cutRows * cutColumns} = ${area}.`,
        visual: areaModel(rows, columns, cells, "Puste prostokątne wycięcie nie należy do figury.")
      });
    });

    const twoRectangles = Array.from({ length: 4 }, () => {
      const w1 = rand(3, 5), h1 = rand(2, 3);
      const w2 = rand(2, w1 - 1), h2 = rand(2, 3);
      const totalRows = h1 + h2, totalCols = w1;
      const cells = Array.from({ length: totalRows * totalCols }, (_, index) => {
        const row = Math.floor(index / totalCols), col = index % totalCols;
        if (row < h2 && col < w2) return 1;
        if (row >= h2 && col < w1) return 1;
        return 0;
      });
      const area1 = w2 * h2, area2 = w1 * h1, totalArea = area1 + area2;
      return question({
        label: "Dwa połączone prostokąty",
        prompt: "Figura na siatce składa się z dwóch połączonych prostokątów. Każda kratka ma pole 1. Jakie pole ma cała figura?",
        answer: totalArea,
        hint: `Podziel figurę na dwa prostokąty: jeden ma wymiary ${w2} na ${h2} (pole ${area1}), a drugi ${w1} na ${h1} (pole ${area2}).`,
        explanation: `${w2} · ${h2} + ${w1} · ${h1} = ${area1} + ${area2} = ${totalArea} jednostek kwadratowych.`,
        visual: areaModel(totalRows, totalCols, cells, "Figurę można podzielić na dwa prostokąty.")
      });
    });

    return [...polyominoes, ...cutouts, ...twoRectangles];
  }

  function conversionQuestions() {
    const cm = rand(2, 40), dm = rand(2, 30), metres = rand(2, 12);
    const mmBack = rand(2, 40), cmBack = rand(2, 30), dmBack = rand(2, 20);
    const sideCm = pick([2, 3, 5]), extraCm = pick([7, 13, 16, 25]);
    return [
      question({ label: "cm² na mm²", prompt: `Zamień ${cm} cm² na mm².`, answer: cm * 100, hint: "1 cm² = 100 mm², bo 1 cm = 10 mm w dwóch kierunkach.", explanation: `${cm} · 100 = ${cm * 100} mm².`, visual: equation("1 cm² = 10 mm · 10 mm = 100 mm²", "Współczynnik długości trzeba zastosować w dwóch kierunkach.") }),
      question({ label: "dm² na cm²", prompt: `Zamień ${dm} dm² na cm².`, answer: dm * 100, hint: "1 dm² = 100 cm².", explanation: `${dm} · 100 = ${dm * 100} cm².`, visual: equation("1 dm² = 10 cm · 10 cm = 100 cm²", "Pole rośnie sto razy.") }),
      question({ label: "m² na dm²", prompt: `Zamień ${metres} m² na dm².`, answer: metres * 100, hint: "1 m² = 100 dm².", explanation: `${metres} · 100 = ${metres * 100} dm².`, visual: equation("1 m² = 10 dm · 10 dm = 100 dm²", "Dziesięć razy wzdłuż i dziesięć razy wszerz.") }),
      question({ label: "m² na cm²", prompt: `Zamień ${metres} m² na cm².`, answer: metres * 10000, hint: "1 m = 100 cm, więc 1 m² = 100 · 100 cm².", explanation: `${metres} · 10 000 = ${metres * 10000} cm².`, visual: equation("1 m² = 10 000 cm²", "W jednym metrze kwadratowym mieści się 100 rzędów po 100 cm².") }),
      question({ label: "mm² na cm²", prompt: `Zamień ${mmBack * 100} mm² na cm².`, answer: mmBack, hint: "Podziel przez 100.", explanation: `${mmBack * 100} : 100 = ${mmBack} cm².`, visual: equation(`${mmBack * 100} mm² : 100`, "Wracając do większej jednostki, dzielimy.") }),
      question({ label: "cm² na dm²", prompt: `Zamień ${cmBack * 100} cm² na dm².`, answer: cmBack, hint: "1 dm² = 100 cm², więc podziel przez 100.", explanation: `${cmBack * 100} : 100 = ${cmBack} dm².`, visual: equation(`${cmBack * 100} cm² : 100`, "Sto centymetrów kwadratowych tworzy jeden decymetr kwadratowy.") }),
      question({ label: "dm² na m²", prompt: `Zamień ${dmBack * 100} dm² na m².`, answer: dmBack, hint: "1 m² = 100 dm².", explanation: `${dmBack * 100} : 100 = ${dmBack} m².`, visual: equation(`${dmBack * 100} dm² : 100`, "Przejście do większej jednostki wymaga dzielenia.") }),
      choice("100", ["10", "100", "1000"], { label: "Kwadrat skali", prompt: "1 cm to 10 mm. Ile razy więcej milimetrów kwadratowych mieści się w 1 cm²?", hint: "Policz 10 rzędów po 10 małych kwadratów.", explanation: "10 · 10 = 100, więc 1 cm² = 100 mm².", visual: fullGrid(10, 10, "Sto małych kwadratów mieści się w jednym większym.") }),
      choice("5 m² = 50 000 cm²", ["5 m² = 500 cm²", "5 m² = 5000 cm²", "5 m² = 50 000 cm²"], { label: "Wybierz równość", prompt: "Która równość jest poprawna?", hint: "1 m² = 10 000 cm².", explanation: "5 · 10 000 = 50 000 cm².", visual: equation("m² → cm²: · 10 000", "Dwa kroki po sto dają dziesięć tysięcy.") }),
      choice("nie", ["tak", "nie"], { label: "Tropiciel błędu", prompt: "Ktoś zapisał 3 dm² = 30 cm². Czy ma rację?", hint: "W kwadracie o boku 1 dm mieści się 10 · 10 kwadratów centymetrowych.", explanation: "Nie. 1 dm² = 100 cm², więc 3 dm² = 300 cm².", visual: equation("3 dm² ≠ 30 cm²", "Nie przenoś przelicznika długości wprost na pole.") }),
      question({
        label: "Małe kwadraty w kwadracie",
        prompt: `W kwadracie o boku ${sideCm} cm mieści się ile kwadratów o boku 1 mm?`,
        answer: sideCm * sideCm * 100,
        hint: `Bok ma ${sideCm} cm = ${sideCm * 10} mm. Pomnóż ${sideCm * 10} · ${sideCm * 10}.`,
        explanation: `${sideCm} cm = ${sideCm * 10} mm. Pole: ${sideCm * 10} · ${sideCm * 10} = ${sideCm * sideCm * 100} mm², więc mieści się ${sideCm * sideCm * 100} kwadracików.`,
        visual: equation(`${sideCm} cm = ${sideCm * 10} mm → ${sideCm * 10} · ${sideCm * 10} mm²`, "Długość boku zamieniona na mm.")
      }),
      question({
        label: "Wielokrotność cm²",
        prompt: `Zamień ${extraCm} cm² na mm².`,
        answer: extraCm * 100,
        hint: "1 cm² to 100 mm².",
        explanation: `${extraCm} · 100 = ${extraCm * 100} mm².`,
        visual: equation(`${extraCm} · 100 mm²`, "1 cm² = 100 mm².")
      })
    ];
  }

  function landUnitQuestions() {
    const ares = rand(2, 40), hectares = rand(2, 20), squareSide = pick([20, 30, 40, 50, 60, 80, 100]);
    const [plotWidth, plotHeight] = pick([[20, 40], [25, 40], [40, 50], [50, 80], [100, 30]]);
    const plotArea = plotWidth * plotHeight;
    const pitchW = pick([40, 50, 60]), pitchH = pick([20, 25, 30]);
    const pitchArea = pitchW * pitchH;
    const orchardSide = pick([200, 300, 400]);
    const orchardAreaM2 = orchardSide * orchardSide;
    return [
      question({ label: "Ary na metry kwadratowe", prompt: `Zamień ${ares} a na m².`, answer: ares * 100, hint: "1 ar to 100 m².", explanation: `${ares} · 100 = ${ares * 100} m².`, visual: equation("1 a = 100 m²", "Ar to pole kwadratu o boku 10 m.") }),
      question({ label: "Hektary na ary", prompt: `Zamień ${hectares} ha na ary.`, answer: hectares * 100, hint: "1 hektar to 100 arów.", explanation: `${hectares} · 100 = ${hectares * 100} a.`, visual: equation("1 ha = 100 a", "Hektar to pole kwadratu o boku 100 m.") }),
      question({ label: "Hektary na metry kwadratowe", prompt: `Zamień ${hectares} ha na m².`, answer: hectares * 10000, hint: "1 ha = 10 000 m².", explanation: `${hectares} · 10 000 = ${hectares * 10000} m².`, visual: equation("1 ha = 10 000 m²", "100 m · 100 m = 10 000 m².") }),
      question({ label: "Metry kwadratowe na ary", prompt: `Zamień ${ares * 100} m² na ary.`, answer: ares, hint: "Podziel liczbę metrów kwadratowych przez 100.", explanation: `${ares * 100} : 100 = ${ares} a.`, visual: equation(`${ares * 100} m² : 100`, "Sto metrów kwadratowych tworzy jeden ar.") }),
      question({ label: "Ary na hektary", prompt: `Zamień ${hectares * 100} a na hektary.`, answer: hectares, hint: "Podziel liczbę arów przez 100.", explanation: `${hectares * 100} : 100 = ${hectares} ha.`, visual: equation(`${hectares * 100} a : 100`, "Sto arów tworzy hektar.") }),
      question({ label: "Pole kwadratowej działki", prompt: `Kwadratowa działka ma bok ${squareSide} m. Ile metrów kwadratowych ma jej pole?`, answer: squareSide * squareSide, hint: "Pomnóż bok przez bok.", explanation: `${squareSide} · ${squareSide} = ${squareSide * squareSide} m².`, visual: equation(`${squareSide} m · ${squareSide} m`, "Najpierw oblicz pole w m².") }),
      question({ label: "Działka w arach", prompt: `Prostokątna działka ma wymiary ${plotWidth} m na ${plotHeight} m. Ile arów ma jej pole?`, answer: plotArea / 100, hint: `Oblicz ${plotWidth} · ${plotHeight} m², a potem podziel przez 100.`, explanation: `${plotWidth} · ${plotHeight} = ${plotArea} m² = ${plotArea / 100} a.`, visual: equation(`${plotWidth} m · ${plotHeight} m → m² → a`, "1 a = 100 m².") }),
      choice("ar", ["centymetr kwadratowy", "ar", "kilometr kwadratowy"], { label: "Dobór jednostki terenu", prompt: "W której jednostce wygodnie podać pole niewielkiej działki budowlanej?", hint: "To jednostka równa 100 m².", explanation: "Pole działek często podaje się w arach.", visual: equation("10 m · 10 m = 1 a", "Ar pasuje do działek i ogrodów.") }),
      choice("hektar", ["milimetr kwadratowy", "hektar", "centymetr kwadratowy"], { label: "Dobór jednostki terenu", prompt: "W której jednostce wygodnie podać pole dużego gospodarstwa?", hint: "Wybierz jednostkę używaną do dużych terenów rolnych.", explanation: "Duże grunty rolne wygodnie opisuje się w hektarach.", visual: equation("100 m · 100 m = 1 ha", "Hektar odpowiada 10 000 m².") }),
      choice("10 000 m²", ["100 m²", "1000 m²", "10 000 m²"], { label: "Znaczenie hektara", prompt: "Jakie pole ma kwadrat o boku 100 m?", hint: "Pomnóż 100 przez 100.", explanation: "100 · 100 = 10 000 m², czyli 1 ha.", visual: equation("100 m · 100 m = ?", "To definicja jednego hektara.") }),
      question({
        label: "Boisko w arach",
        prompt: `Boisko ma wymiary ${pitchW} m na ${pitchH} m. Ile arów wynosi jego pole?`,
        answer: pitchArea / 100,
        hint: `Oblicz pole w m² (${pitchW} · ${pitchH} = ${pitchArea} m²), a potem podziel przez 100, bo 1 a = 100 m².`,
        explanation: `${pitchW} · ${pitchH} = ${pitchArea} m². ${pitchArea} : 100 = ${pitchArea / 100} a.`,
        visual: geometry("rectangle", {
          width: pitchW,
          height: pitchH,
          showDimensions: true,
          widthLabel: `${pitchW} m`,
          heightLabel: `${pitchH} m`,
          alt: `Boisko o wymiarach ${pitchW} m na ${pitchH} m.`
        }, "Pole prostokąta: długość · szerokość w metrach, potem zamiana na ary.")
      }),
      question({
        label: "Sad w hektarach",
        prompt: `Kwadratowy sad ma bok długości ${orchardSide} m. Ile hektarów wynosi jego pole?`,
        answer: orchardAreaM2 / 10000,
        hint: `Oblicz pole w m² (${orchardSide} · ${orchardSide} = ${orchardAreaM2} m²), a potem podziel przez 10 000 (bo 1 ha = 10 000 m²).`,
        explanation: `${orchardSide} · ${orchardSide} = ${orchardAreaM2} m² = ${orchardAreaM2 / 10000} ha.`,
        visual: geometry("rectangle", {
          square: true,
          width: orchardSide,
          height: orchardSide,
          showDimensions: true,
          widthLabel: `${orchardSide} m`,
          heightLabel: `${orchardSide} m`,
          alt: `Kwadratowy sad o boku ${orchardSide} m.`
        }, "1 ha = 10 000 m².")
      })
    ];
  }

  function cutoutQuestions() {
    const width = rand(3, 8), evenHeight = pick([2, 4, 6, 8]);
    const rectangleArea = width * evenHeight;
    const full = rand(3, 6), halves = pick([2, 4, 6]);
    const cells = [...Array(full).fill(1), ...Array(halves).fill(0.5)];
    const arrowCells = cellsWith(4, 5, [2, 7, 12, 17], [1, 3]);
    const boatCells = cellsWith(4, 5, [7, 11, 12, 13, 17], [2, 6, 16, 18]);
    return [
      question({ label: "Przekątna prostokąta", prompt: `Prostokąt o polu ${rectangleArea} cm² przecięto wzdłuż przekątnej na dwa jednakowe trójkąty. Jakie pole ma jeden trójkąt?`, answer: rectangleArea / 2, hint: "Przekątna dzieli prostokąt na dwie równe części.", explanation: `${rectangleArea} : 2 = ${rectangleArea / 2} cm².`, visual: areaModel(evenHeight, width, Array(rectangleArea).fill(0.5), "Jedna przekątna dzieli cały prostokąt na dwa jednakowe trójkąty.", { diagonalHalf: true, alt: `Prostokąt z siatką ${evenHeight} na ${width}, przecięty jedną przekątną od narożnika do narożnika.` }) }),
      choice("takie samo", ["takie samo", "dwa razy większe", "dwa razy mniejsze"], { label: "Przestawianie części", prompt: "Figurę rozcięto na części i ułożono z nich nowy kształt bez nakładania i luk. Jak zmieniło się pole?", hint: "Żadnej części nie dodano ani nie zabrano.", explanation: "Pole pozostało takie samo, bo wykorzystano dokładnie te same części.", visual: equation("te same części → to samo pole", "Zmiana kształtu nie musi zmieniać pola.") }),
      question({ label: "Całe kratki z połówek", prompt: "Jakie pole ma figura złożona z pokazanych pełnych kratek i połówek?", answer: full + halves / 2, hint: `Połącz ${halves} połówek w ${halves / 2} całe kratki.`, explanation: `${full} + ${halves} : 2 = ${full + halves / 2}.`, visual: areaModel(1, cells.length, cells, "Połówki licz parami.") }),
      choice("połowę pola prostokąta", ["połowę pola prostokąta", "całe pole prostokąta", "dwa razy większe pole"], { label: "Trójkąt z połowy", prompt: "Trójkąt powstał przez przecięcie prostokąta wzdłuż przekątnej. Jakie ma pole?", hint: "Powstały dwa przystające trójkąty.", explanation: "Każdy z dwóch trójkątów ma połowę pola prostokąta.", visual: areaModel(3, 5, Array(15).fill(0.5), "Zielona część każdej kratki stanowi połowę prostokąta.") }),
      choice("8", ["4", "8", "16"], { label: "Dwie równe części", prompt: "Kwadrat o polu 16 cm² przecięto na dwie równe części. Jakie pole ma każda część?", hint: "Podziel 16 przez 2.", explanation: "16 : 2 = 8 cm².", visual: fullGrid(4, 4, "Przecięcie nie zmienia łącznego pola kwadratu.") }),
      question({ label: "Składanie połówek", prompt: "Sześć trójkątów, z których każdy jest połową kwadratu jednostkowego, ułożono bez luk. Jakie jest ich łączne pole?", answer: 3, hint: "Połącz trójkąty parami.", explanation: "6 połówek tworzy 3 całe kwadraty jednostkowe.", visual: areaModel(2, 3, Array(6).fill(0.5), "Sześć jednakowych połówek.") }),
      choice("nie", ["tak", "nie"], { label: "Pole a obwód", prompt: "Czy po przestawieniu tych samych części pole zawsze zmienia się razem z obwodem?", hint: "Pole zależy od wykorzystanych części, a obwód od nowego brzegu figury.", explanation: "Nie. Pole pozostaje takie samo, ale obwód może się zmienić.", visual: equation("to samo pole  •  możliwy inny obwód", "Pole i obwód opisują różne cechy figury.") }),
      choice("między 8 cm² a 16 cm²", ["mniej niż 4 cm²", "między 8 cm² a 16 cm²", "więcej niż 20 cm²"], { label: "Szacowanie pola", prompt: "Koło mieści się w kwadracie 4 cm na 4 cm i przykrywa więcej niż połowę tego kwadratu. W jakim przedziale leży jego pole?", hint: "Pole kwadratu to 16 cm², a jego połowa to 8 cm².", explanation: "Pole koła jest większe od 8 cm² i mniejsze od 16 cm².", visual: equation("8 cm² < pole koła < 16 cm²", "Dolna i górna granica wystarczą do oszacowania.") }),
      question({ label: "Rakieta z prostokąta", prompt: "Prostokąt o polu 24 cm² rozcięto i z wszystkich części ułożono rakietę. Jakie pole ma rakieta?", answer: 24, hint: "Wykorzystano wszystkie części, bez nakładania i bez luk.", explanation: "Wycinanie i ponowne ułożenie wszystkich części zachowuje pole 24 cm².", visual: equation("prostokąt 24 cm² → rakieta ? cm²", "Kształt się zmienia, pole nie.") }),
      choice("mają równe pola", ["mają równe pola", "pierwsza ma większe pole", "druga ma większe pole"], { label: "Różne układanki", prompt: "Dwie figury ułożono z tych samych ośmiu kwadratów jednostkowych. Jak porównać ich pola?", hint: "W obu figurach użyto dokładnie tylu samych jednostek pola.", explanation: "Obie figury mają po 8 jednostek kwadratowych, więc ich pola są równe.", visual: equation("8 kwadratów = 8 kwadratów", "Układ może być inny, liczba jednostek jest ta sama.") }),
      question({
        label: "Strzałka z połówek",
        prompt: "Na siatce narysowano strzałkę z całych kratek i trójkątnych połówek. Każda kratka ma pole 1. Jakie pole ma ta strzałka?",
        answer: 5,
        hint: "Policz 4 pełne kratki i 2 trójkątne połówki (dwie połówki tworzą 1 całą kratkę).",
        explanation: "4 pełne kratki + 2 połówki = 4 + 1 = 5 jednostek kwadratowych.",
        visual: areaModel(4, 5, arrowCells, "Strzałka: 4 pełne kratki i 2 trójkątne połówki.")
      }),
      question({
        label: "Żaglówka z połówek",
        prompt: "Na siatce narysowano żaglówkę z całych kratek i trójkątnych połówek. Każda kratka ma pole 1. Jakie pole ma ta figura?",
        answer: 7,
        hint: "Policz 5 pełnych kratek oraz 4 trójkątne połówki (4 połówki tworzą 2 całe kratki).",
        explanation: "5 pełnych kratek + 4 połówki = 5 + 2 = 7 jednostek kwadratowych.",
        visual: areaModel(4, 5, boatCells, "Żaglówka: 5 pełnych kratek i 4 trójkątne połówki.")
      })
    ];
  }

  function practicalQuestions() {
    const roomA = rand(3, 7), roomB = rand(3, 6), price = rand(4, 15) * 10;
    const gardenA = rand(5, 12), gardenB = rand(4, 10);
    const tileSide = pick([10, 20, 25, 40, 50]);
    const floorA = tileSide * rand(4, 9), floorB = tileSide * rand(3, 8);
    const mapSquares = rand(2, 8);
    const wallArea = gardenA * roomB;
    const paintCans = Math.ceil(wallArea / 6);
    const wallW = rand(3, 5), wallH = rand(2, 4), tilePrice = pick([30, 40, 50]);
    const wallArea2 = wallW * wallH;
    const parts = pick([2, 4, 5]), plotA = parts * rand(3, 8);
    return [
      question({ label: "Podłoga pokoju", prompt: `Pokój ma wymiary ${roomA} m na ${roomB} m. Ile metrów kwadratowych ma podłoga?`, answer: roomA * roomB, hint: "Pomnóż długość pokoju przez szerokość.", explanation: `${roomA} · ${roomB} = ${roomA * roomB} m².`, visual: equation(`${roomA} m · ${roomB} m`, "Prostokątna podłoga.") }),
      question({ label: "Koszt wykończenia", prompt: `Ułożenie 1 m² podłogi kosztuje ${price} zł. Ile kosztuje ułożenie ${roomA * roomB} m²?`, answer: price * roomA * roomB, hint: "Pomnóż liczbę metrów kwadratowych przez cenę jednego metra kwadratowego.", explanation: `${roomA * roomB} · ${price} = ${price * roomA * roomB} zł.`, visual: equation(`${roomA * roomB} m² · ${price} zł/m²`, "Cena dotyczy każdego metra kwadratowego.") }),
      question({ label: "Ogród", prompt: `Prostokątny ogród ma ${gardenA} m długości i ${gardenB} m szerokości. Ile m² zajmuje?`, answer: gardenA * gardenB, hint: "Pole prostokąta to długość razy szerokość.", explanation: `${gardenA} · ${gardenB} = ${gardenA * gardenB} m².`, visual: equation(`${gardenA} m · ${gardenB} m`, "Pole mówi, ile powierzchni zajmuje ogród.") }),
      question({ label: "Płytki", prompt: `Podłoga ma wymiary ${floorA} cm na ${floorB} cm. Płytka jest kwadratem o boku ${tileSide} cm. Ile płytek potrzeba bez docinania?`, answer: floorA / tileSide * (floorB / tileSide), hint: "Sprawdź, ile płytek mieści się wzdłuż każdego boku, a potem pomnóż.", explanation: `${floorA} : ${tileSide} = ${floorA / tileSide} oraz ${floorB} : ${tileSide} = ${floorB / tileSide}; razem ${floorA / tileSide} · ${floorB / tileSide} = ${floorA / tileSide * (floorB / tileSide)} płytek.`, visual: fullGrid(floorB / tileSide, floorA / tileSide, "Każda kratka przedstawia jedną kwadratową płytkę.") }),
      question({ label: "Mapa i pole", prompt: `Na mapie 1 cm odpowiada 5 km w terenie. Jezioro zajmuje ${mapSquares} pełnych kwadratów po 1 cm². Ile km² odpowiada temu polu?`, answer: mapSquares * 25, hint: "Kwadrat 1 cm na 1 cm odpowiada kwadratowi 5 km na 5 km.", explanation: `1 cm² odpowiada 5 · 5 = 25 km², więc ${mapSquares} · 25 = ${mapSquares * 25} km².`, visual: areaModel(1, mapSquares, Array(mapSquares).fill(1), "Każdy kwadrat mapy odpowiada 25 km² w terenie.") }),
      question({ label: "Dywan", prompt: `Dywan ma ${roomA} m długości i ${roomB} m szerokości. Ile m² tkaniny zajmuje?`, answer: roomA * roomB, hint: "Traktuj dywan jak prostokąt.", explanation: `${roomA} · ${roomB} = ${roomA * roomB} m².`, visual: fullGrid(roomB, roomA, "Rzędy jednakowych metrów kwadratowych.", { showDimensions: true, unit: "m" }) }),
      question({ label: "Dwa pomieszczenia", prompt: `Pierwszy pokój ma ${roomA} m na ${roomB} m, a drugi ${roomA + 1} m na ${roomB} m. O ile m² drugi jest większy?`, answer: roomB, hint: `Drugi pokój ma dodatkowy pas szerokości 1 m i długości ${roomB} m.`, explanation: `Różnica pól to (${roomA + 1} − ${roomA}) · ${roomB} = ${roomB} m².`, visual: equation(`${roomA + 1} · ${roomB} − ${roomA} · ${roomB}`, "Porównaj pola, nie obwody.") }),
      question({ label: "Farba", prompt: `Prostokątna ściana ma ${gardenA} m szerokości i ${roomB} m wysokości. Jedna puszka farby wystarcza na 6 m². Ile całych puszek trzeba kupić?`, answer: paintCans, hint: "Oblicz pole ściany i podziel przez wydajność puszki; puszek nie można kupić w części.", explanation: `Pole ściany to ${wallArea} m². ${paintCans - 1} puszek pokrywa najwyżej ${(paintCans - 1) * 6} m², więc trzeba kupić ${paintCans}.`, visual: equation(`${gardenA} m · ${roomB} m : 6 m²`, "Wynik zaokrąglij w górę do całej puszki.") }),
      question({ label: "Stół", prompt: `Blat ma ${gardenA} dm długości i ${roomB} dm szerokości. Ile dm² ma jego powierzchnia?`, answer: gardenA * roomB, hint: "Oba wymiary są już w tej samej jednostce.", explanation: `${gardenA} · ${roomB} = ${gardenA * roomB} dm².`, visual: equation(`${gardenA} dm · ${roomB} dm`, "Prostokątny blat.") }),
      choice("pokój 5 m × 4 m", ["pokój 5 m × 4 m", "pokój 6 m × 3 m"], { label: "Porównanie pomieszczeń", prompt: "Który pokój ma większą powierzchnię?", hint: "Oblicz 5 · 4 oraz 6 · 3.", explanation: "5 · 4 = 20 m², a 6 · 3 = 18 m², więc większy jest pokój 5 m × 4 m.", visual: equation("5 · 4  ?  6 · 3", "Porównaj pola obu prostokątów.") }),
      question({
        label: "Kafelki na ścianie",
        prompt: `Ściana w łazience ma ${wallW} m szerokości i ${wallH} m wysokości. Kafelki kosztują ${tilePrice} zł za 1 m². Ile kosztują kafelki na tę całą ścianę?`,
        answer: wallArea2 * tilePrice,
        hint: `Najpierw oblicz pole ściany (${wallW} · ${wallH} = ${wallArea2} m²), a potem pomnóż przez cenę za metr.`,
        explanation: `Pole: ${wallW} · ${wallH} = ${wallArea2} m². Koszt: ${wallArea2} · ${tilePrice} = ${wallArea2 * tilePrice} zł.`,
        visual: equation(`${wallW} m · ${wallH} m · ${tilePrice} zł/m²`, "Pole ściany pomnożone przez cenę za 1 m².")
      }),
      question({
        label: "Podział działki",
        prompt: `Działka o powierzchni ${plotA} a (arów) została podzielona po równo na ${parts} jednakowe części. Ile arów ma każda część?`,
        answer: plotA / parts,
        hint: `Podziel łączną powierzchnię przez liczbę części: ${plotA} : ${parts}.`,
        explanation: `${plotA} : ${parts} = ${plotA / parts} a.`,
        visual: equation(`${plotA} a : ${parts}`, "Równy podział powierzchni działki.")
      })
    ];
  }

  const builders = {
    "kwadraty-jednostkowe": unitSquareQuestions,
    "jednostki-pola": areaUnitQuestions,
    "pole-prostokata": rectangleAreaQuestions,
    "pole-kwadratu": squareAreaQuestions,
    "brakujacy-bok": missingSideQuestions,
    "figury-zlozone": compositeAreaQuestions,
    "zamiana-jednostek": conversionQuestions,
    "ary-hektary": landUnitQuestions,
    wycinanki: cutoutQuestions,
    "pola-w-praktyce": practicalQuestions
  };

  function buildQuestions(mode) {
    if (builders[mode]) return builders[mode]().map((item) => ({ ...item, routeId: mode }));
    const rounds = Object.entries(builders).map(([routeId, build]) => build().map((item) => ({ ...item, routeId })));
    const selected = rounds.map((round) => pick(round));
    const extraIndices = shuffle(rounds.map((_, index) => index)).slice(0, 2);
    const extras = extraIndices.map((index) => pick(rounds[index].filter((item) => item !== selected[index])));
    return shuffle([...selected, ...extras]);
  }

  MathTownGame.start({
    chapterId: "chapter7",
    chapterTitle: "Pola figur",
    routeLabels,
    roundRevisions: { wycinanki: 2, "brakujacy-bok": 2, "pole-kwadratu": 2 },
    buildQuestions
  });
})();
