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
      question({ label: "Całe i połówki", prompt: "Jakie pole ma zaznaczona figura z pełnych kratek i połówek?", answer: 5, hint: "Cztery połówki zamień na dwie pełne kratki.", explanation: "3 pełne kratki + 4 połówki = 3 + 2 = 5.", visual: areaModel(2, 4, pairedHalves, "Każda zielona część to połowa kratki.") })
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
      choice("obie długości w tej samej jednostce", ["obie długości w tej samej jednostce", "jedna długość w cm, druga w mm", "bez żadnych jednostek"], { label: "Zanim pomnożysz", prompt: "Co trzeba sprawdzić przed obliczeniem pola prostokąta?", hint: "Nie można bezpośrednio mnożyć boków zapisanych w różnych jednostkach.", explanation: "Długość i szerokość trzeba najpierw zapisać w tej samej jednostce.", visual: equation("15 mm · 3 cm  →  15 mm · 30 mm", "Najpierw ujednolić jednostki.") })
    ];
  }

  function rectangleAreaQuestions() {
    const dimensions = Array.from({ length: 10 }, () => [rand(2, 9), rand(2, 8)]);
    const units = ["cm", "mm", "dm", "m", "cm", "m", "dm", "mm", "cm", "m"];
    return dimensions.map(([width, height], index) => question({
      label: index < 2 ? "Rzędy kratek" : "Pole prostokąta",
      prompt: index < 2
        ? `Prostokąt ma ${rowsOf(height, width, "kwadraty jednostkowe", "kwadratów jednostkowych")}. Jakie ma pole?`
        : `Prostokąt ma boki ${width} ${units[index]} i ${height} ${units[index]}. Ile wynosi jego pole w ${units[index]}²?`,
      answer: width * height,
      hint: "Pomnóż długość przez szerokość.",
      explanation: `${width} · ${height} = ${width * height} ${index < 2 ? "jednostek kwadratowych" : `${units[index]}²`}.`,
      visual: fullGrid(height, width, `${rowsOf(height, width, "równe kwadraty", "równych kwadratów")}.`, { showDimensions: index >= 2, unit: index >= 2 ? units[index] : "" })
    }));
  }

  function squareAreaQuestions() {
    const sides = Array.from({ length: 7 }, () => rand(2, 12));
    const area = pick([16, 25, 36, 49, 64, 81, 100]);
    const root = Math.sqrt(area);
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
      question({ label: "Bok kwadratu", prompt: `Pole kwadratu wynosi ${area} cm². Ile centymetrów ma jego bok?`, answer: root, hint: `Znajdź liczbę, która pomnożona przez siebie daje ${area}.`, explanation: `${root} · ${root} = ${area}, więc bok ma ${root} cm.`, visual: equation(`? · ? = ${area} cm²`, "Oba boki kwadratu są równe.") })
    ];
  }

  function missingSideQuestions() {
    return Array.from({ length: 10 }, (_, index) => {
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
      return question({ label: index < 8 ? "Brakujący bok" : "Sprawdzenie dzielenia", prompt: `Pole prostokąta wynosi ${area} ${unit}². Jeden bok ma ${known} ${unit}. Ile ${unit} ma drugi bok?`, answer: missing, hint: `Podziel pole ${area} przez znany bok ${known}.`, explanation: `${area} : ${known} = ${missing} ${unit}. Sprawdzenie: ${known} · ${missing} = ${area}.`, visual });
    });
  }

  function compositeAreaQuestions() {
    return Array.from({ length: 10 }, (_, index) => {
      const rows = rand(3, 6), columns = rand(4, 8);
      if (index >= 5) {
        const shapeRows = rand(5, 7), shapeColumns = rand(5, 8);
        const targetArea = rand(8, Math.floor(shapeRows * shapeColumns * 0.6));
        const cells = randomConnectedShape(shapeRows, shapeColumns, targetArea);
        const rowCounts = Array.from({ length: shapeRows }, (_, row) => cells.slice(row * shapeColumns, (row + 1) * shapeColumns).reduce((sum, value) => sum + value, 0)).filter(Boolean);
        return question({ label: "Zacieniona figura", prompt: "Bok każdej kratki ma 1 cm. Jakie jest pole zacienionej figury w cm²?", answer: targetArea, hint: "Policz zacienione kwadraty osobno w każdym rzędzie, a potem dodaj wyniki.", explanation: `${rowCounts.join(" + ")} = ${targetArea}, więc pole figury wynosi ${targetArea} cm².`, visual: areaModel(shapeRows, shapeColumns, cells, "Zacienione kratki tworzą jedną połączoną figurę.", { outlineShape: true, alt: `Zacieniona figura na siatce. Liczby zacienionych kratek w kolejnych niepustych wierszach: ${rowCounts.join(", ")}.` }) });
      }
      const cutRows = rand(1, rows - 1), cutColumns = rand(1, columns - 1);
      const cutFromRight = index % 2 === 0;
      const cells = Array.from({ length: rows * columns }, (_, cellIndex) => {
        const row = Math.floor(cellIndex / columns), column = cellIndex % columns;
        const inCutRows = row < cutRows;
        const inCutColumns = cutFromRight ? column >= columns - cutColumns : column < cutColumns;
        return inCutRows && inCutColumns ? 0 : 1;
      });
      const area = modelArea(areaModel(rows, columns, cells));
      return question({ label: "Odejmowanie wycięcia", prompt: "Każda kratka ma pole 1. Jakie pole ma zaznaczona figura złożona?", answer: area, hint: "Oblicz pole całego prostokąta i odejmij prostokątne wycięcie.", explanation: `Pełny prostokąt ma ${rows * columns}, a wycięcie ${cutRows * cutColumns}. ${rows * columns} − ${cutRows * cutColumns} = ${area}.`, visual: areaModel(rows, columns, cells, "Puste prostokątne wycięcie nie należy do figury.") });
    });
  }

  function conversionQuestions() {
    const cm = rand(2, 40), dm = rand(2, 30), metres = rand(2, 12);
    const mmBack = rand(2, 40), cmBack = rand(2, 30), dmBack = rand(2, 20);
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
      choice("nie", ["tak", "nie"], { label: "Tropiciel błędu", prompt: "Ktoś zapisał 3 dm² = 30 cm². Czy ma rację?", hint: "W kwadracie o boku 1 dm mieści się 10 · 10 kwadratów centymetrowych.", explanation: "Nie. 1 dm² = 100 cm², więc 3 dm² = 300 cm².", visual: equation("3 dm² ≠ 30 cm²", "Nie przenoś przelicznika długości wprost na pole.") })
    ];
  }

  function landUnitQuestions() {
    const ares = rand(2, 40), hectares = rand(2, 20), squareSide = pick([20, 30, 40, 50, 60, 80, 100]);
    const [plotWidth, plotHeight] = pick([[20, 40], [25, 40], [40, 50], [50, 80], [100, 30]]);
    const plotArea = plotWidth * plotHeight;
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
      choice("10 000 m²", ["100 m²", "1000 m²", "10 000 m²"], { label: "Znaczenie hektara", prompt: "Jakie pole ma kwadrat o boku 100 m?", hint: "Pomnóż 100 przez 100.", explanation: "100 · 100 = 10 000 m², czyli 1 ha.", visual: equation("100 m · 100 m = ?", "To definicja jednego hektara.") })
    ];
  }

  function cutoutQuestions() {
    const width = rand(3, 8), evenHeight = pick([2, 4, 6, 8]);
    const rectangleArea = width * evenHeight;
    const full = rand(3, 6), halves = pick([2, 4, 6]);
    const cells = [...Array(full).fill(1), ...Array(halves).fill(0.5)];
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
      choice("mają równe pola", ["mają równe pola", "pierwsza ma większe pole", "druga ma większe pole"], { label: "Różne układanki", prompt: "Dwie figury ułożono z tych samych ośmiu kwadratów jednostkowych. Jak porównać ich pola?", hint: "W obu figurach użyto dokładnie tylu samych jednostek pola.", explanation: "Obie figury mają po 8 jednostek kwadratowych, więc ich pola są równe.", visual: equation("8 kwadratów = 8 kwadratów", "Układ może być inny, liczba jednostek jest ta sama.") })
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
      choice("pokój 5 m × 4 m", ["pokój 5 m × 4 m", "pokój 6 m × 3 m"], { label: "Porównanie pomieszczeń", prompt: "Który pokój ma większą powierzchnię?", hint: "Oblicz 5 · 4 oraz 6 · 3.", explanation: "5 · 4 = 20 m², a 6 · 3 = 18 m², więc większy jest pokój 5 m × 4 m.", visual: equation("5 · 4  ?  6 · 3", "Porównaj pola obu prostokątów.") })
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
    return shuffle(Object.entries(builders).map(([routeId, build]) => ({ ...pick(build()), routeId })));
  }

  MathTownGame.start({
    chapterId: "chapter7",
    chapterTitle: "Pola figur",
    routeLabels,
    roundRevisions: { wycinanki: 2, "brakujacy-bok": 2, "pole-kwadratu": 2 },
    buildQuestions
  });
})();
