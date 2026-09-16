(() => {
  "use strict";

  const routeLabels = {
    linie: "Laboratorium linii",
    polozenie: "Skrzyżowania",
    dlugosci: "Patrol miarki",
    katy: "Detektyw kątów",
    "mierzenie-katow": "Pracownia stopni",
    wielokaty: "Aleja wielokątów",
    prostokaty: "Plac czworokątów",
    obwody: "Ogrodzenie figur",
    kola: "Rondo odkrywców",
    skala: "Biuro planów",
    mix: "Geometryczny obchód"
  };

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
  const question = (data) => ({ kind: "input", label: "Geometria", visual: null, ...data });
  const equation = (expression, caption) => ({ type: "equation", expression, caption });
  const geometry = (shape, data, caption) => ({ type: "geometry", shape, ...data, caption });
  const choice = (answer, options, data) => question({
    ...data,
    kind: "choice",
    answer,
    options: options.map((value) => ({ value, label: String(value) }))
  });

  function lineQuestions() {
    const segments = rand(3, 8);
    const closed = Math.random() < 0.5;
    return [
      choice("odcinek", ["odcinek", "prosta", "półprosta"], { label: "Figury liniowe", prompt: "Która figura ma dokładnie dwa końce?", hint: "Pomyśl o fragmencie linii zawartym między dwoma punktami.", explanation: "Odcinek ma dwa końce.", visual: geometry("polyline", { segments: 1, closed: false, endpoints: true }, "Dwa zaznaczone końce ograniczają figurę.") }),
      choice("półprosta", ["półprosta", "odcinek", "prosta"], { label: "Figury liniowe", prompt: "Która figura ma początek, ale nie ma końca?", hint: "Jej nazwa mówi, że jest połową prostej.", explanation: "Półprosta zaczyna się w jednym punkcie i biegnie bez końca w jednym kierunku.", visual: geometry("line", { extent: "ray" }, "Kropka oznacza początek, a strzałka — dalszy kierunek.") }),
      choice("prosta", ["prosta", "odcinek", "półprosta"], { label: "Figury liniowe", prompt: "Która figura nie ma ani początku, ani końca?", hint: "Na rysunku widzimy tylko fragment tej nieograniczonej figury.", explanation: "Prosta biegnie bez końca w obu kierunkach.", visual: geometry("line", { extent: "infinite" }, "Strzałki pokazują oba nieograniczone kierunki.") }),
      choice("punkt", ["punkt", "odcinek", "kąt"], { label: "Punkty", prompt: "Jak nazywamy zaznaczone miejsce, które nie ma długości ani szerokości?", hint: "Zwykle oznaczamy je kropką i wielką literą.", explanation: "Takie miejsce w geometrii nazywamy punktem.", visual: geometry("point", { name: "A" }, "Punkt A.") }),
      question({ label: "Łamane", prompt: "Ile odcinków ma łamana pokazana na rysunku?", answer: segments, hint: "Policz każdy prosty fragment między kolejnymi załamaniami.", explanation: `Ta łamana składa się z ${segments} odcinków.`, visual: geometry("polyline", { segments, closed: false }, "Policz odcinki po kolei.") }),
      choice(closed ? "zamknięta" : "otwarta", ["otwarta", "zamknięta"], { label: "Łamane", prompt: "Jaka jest łamana na rysunku?", hint: "Sprawdź, czy jej ostatni koniec łączy się z pierwszym.", explanation: closed ? "Pierwszy i ostatni punkt łączą się, więc łamana jest zamknięta." : "Końce nie łączą się, więc łamana jest otwarta.", visual: geometry("polyline", { segments: rand(3, 7), closed }, closed ? "Końce łamanej są połączone." : "Końce łamanej pozostają rozdzielone.") }),
      question({ label: "Odcinki", prompt: "Ile końców ma każdy odcinek?", answer: 2, hint: "Odcinek jest ograniczony z obu stron.", explanation: "Każdy odcinek ma dwa końce.", visual: geometry("polyline", { segments: 1, closed: false, endpoints: true }, "Końce zaznaczono kropkami.") }),
      question({ label: "Proste", prompt: "Ile różnych prostych można poprowadzić przez dwa różne punkty?", answer: 1, hint: "Dwa różne punkty jednoznacznie wyznaczają prostą.", explanation: "Przez dwa różne punkty przechodzi dokładnie jedna prosta.", visual: geometry("line", { extent: "infinite", points: 2 }, "Oba punkty leżą na tej samej prostej.") }),
      choice("AB", ["AB", "BA"], { label: "Półproste", prompt: "Półprosta zaczyna się w punkcie A i przechodzi przez B. Który zapis wskazuje właściwy kierunek?", hint: "W nazwie półprostej pierwsza litera oznacza jej początek.", explanation: "Półprosta AB zaczyna się w A; półprosta BA zaczynałaby się w B.", visual: geometry("line", { extent: "ray", pointNames: ["A", "B"] }, "Pierwszy punkt jest początkiem półprostej.") }),
      choice("tak", ["tak", "nie"], { label: "Należenie punktów", prompt: "Punkt C leży między końcami A i B. Czy punkt C należy do odcinka AB?", hint: "Odcinek zawiera swoje końce i wszystkie punkty między nimi.", explanation: "Tak. Punkt C leży między A i B, więc należy do odcinka AB.", visual: geometry("line", { extent: "segment", pointNames: ["A", "C", "B"] }, "Punkt C leży na odcinku AB.") })
    ];
  }

  function positionQuestions() {
    const relations = ["równoległe", "prostopadłe", "ani równoległe, ani prostopadłe"];
    const visuals = ["parallel", "perpendicular", "intersecting"];
    const questions = Array.from({ length: 6 }, (_, index) => {
      const selected = (index + rand(0, 2)) % 3;
      return choice(relations[selected], relations, {
        label: "Położenie prostych",
        prompt: "Jak są położone proste a i b na rysunku?",
        hint: selected === 0 ? "Przedłuż je w wyobraźni i sprawdź, czy zachowują stałą odległość." : "Sprawdź, czy przecinają się pod kątem prostym.",
        explanation: selected === 0 ? "Proste a i b są równoległe: nie przecinają się." : selected === 1 ? "Proste a i b są prostopadłe: przecinają się pod kątem 90°." : "Proste przecinają się, ale nie pod kątem 90°, więc nie są ani równoległe, ani prostopadłe.",
        visual: geometry("lines", { relation: visuals[selected], names: ["a", "b"] }, "Porównaj kierunki obu prostych.")
      });
    });
    questions.push(
      choice("równoległe", relations, { label: "Wnioskowanie", prompt: "Prosta a jest prostopadła do b, a prosta c też jest prostopadła do b. Jak położone są a i c?", hint: "Obie tworzą z prostą b taki sam kierunek kąta prostego.", explanation: "Dwie proste prostopadłe do tej samej prostej są równoległe.", visual: geometry("lines", { relation: "double-perpendicular", names: ["a", "b", "c"] }, "a ⊥ b oraz c ⊥ b") }),
      choice("prostopadłe", relations, { label: "Odcinki", prompt: "Odcinki leżą na prostych, które przecinają się pod kątem 90°. Jakie są te odcinki?", hint: "Relację odcinków określamy przez proste, na których leżą.", explanation: "Odcinki leżące na prostych prostopadłych są prostopadłe.", visual: geometry("lines", { relation: "perpendicular", names: ["AB", "CD"], segments: true }, "Odcinki leżą na prostych prostopadłych.") }),
      question({ label: "Kąty przy przecięciu", prompt: "Ile kątów prostych powstaje, gdy przecinają się dwie proste prostopadłe?", answer: 4, hint: "Spójrz na cztery obszary wokół punktu przecięcia.", explanation: "Dwie proste prostopadłe tworzą cztery kąty proste.", visual: geometry("lines", { relation: "perpendicular", rightMarks: true }, "Każdy z czterech kątów ma 90°.") }),
      question({ label: "Proste równoległe", prompt: "Ile punktów wspólnych mają dwie różne proste równoległe?", answer: 0, hint: "Proste równoległe nie spotkają się nawet po przedłużeniu.", explanation: "Dwie różne proste równoległe mają 0 punktów wspólnych.", visual: geometry("lines", { relation: "parallel" }, "Odległość między prostymi pozostaje stała.") })
    );
    return questions;
  }

  function lengthQuestions() {
    const cm = rand(2, 90), dm = rand(2, 50), metres = rand(2, 40), km = rand(2, 20);
    const wholeCm = rand(2, 40), wholeM = rand(2, 25), mixedCm = rand(2, 20), mixedMm = rand(1, 9);
    const sides = Array.from({ length: rand(3, 6) }, () => rand(2, 15));
    const shorter = rand(8, 30), difference = rand(2, 12), multiplier = rand(2, 5), base = rand(3, 18);
    return [
      question({ label: "Jednostki długości", prompt: `Ile milimetrów ma ${cm} cm?`, answer: cm * 10, hint: "1 cm to 10 mm.", explanation: `${cm} · 10 = ${cm * 10} mm.`, visual: equation(`${cm} cm = ? mm`, "Każdy centymetr zawiera 10 milimetrów.") }),
      question({ label: "Jednostki długości", prompt: `Ile centymetrów ma ${dm} dm?`, answer: dm * 10, hint: "1 dm to 10 cm.", explanation: `${dm} · 10 = ${dm * 10} cm.`, visual: equation(`${dm} dm = ? cm`, "Zamień decymetry na centymetry.") }),
      question({ label: "Jednostki długości", prompt: `Ile centymetrów ma ${metres} m?`, answer: metres * 100, hint: "1 m to 100 cm.", explanation: `${metres} · 100 = ${metres * 100} cm.`, visual: equation(`${metres} m = ? cm`, "Każdy metr zawiera 100 centymetrów.") }),
      question({ label: "Jednostki długości", prompt: `Ile metrów ma ${km} km?`, answer: km * 1000, hint: "1 km to 1000 m.", explanation: `${km} · 1000 = ${km * 1000} m.`, visual: equation(`${km} km = ? m`, "Każdy kilometr zawiera 1000 metrów.") }),
      question({ label: "Jednostki długości", prompt: `Ile centymetrów ma ${wholeCm * 10} mm?`, answer: wholeCm, hint: "Podziel liczbę milimetrów przez 10.", explanation: `${wholeCm * 10} : 10 = ${wholeCm} cm.`, visual: equation(`${wholeCm * 10} mm = ? cm`, "10 mm to 1 cm.") }),
      question({ label: "Jednostki długości", prompt: `Ile metrów ma ${wholeM * 100} cm?`, answer: wholeM, hint: "Podziel liczbę centymetrów przez 100.", explanation: `${wholeM * 100} : 100 = ${wholeM} m.`, visual: equation(`${wholeM * 100} cm = ? m`, "100 cm to 1 m.") }),
      question({ label: "Długość łamanej", prompt: "Ile centymetrów ma łamana o długościach odcinków podanych na rysunku?", answer: sides.reduce((sum, value) => sum + value, 0), hint: "Długość łamanej to suma długości wszystkich jej odcinków.", explanation: `${sides.join(" + ")} = ${sides.reduce((sum, value) => sum + value, 0)} cm.`, visual: geometry("polyline", { segments: sides.length, lengths: sides, closed: false }, "Dodaj długości wszystkich odcinków.") }),
      question({ label: "Porównywanie długości", prompt: `Odcinek AB ma ${shorter} cm, a CD jest o ${difference} cm dłuższy. Ile centymetrów ma CD?`, answer: shorter + difference, hint: "Do długości AB dodaj podaną różnicę.", explanation: `${shorter} + ${difference} = ${shorter + difference} cm.`, visual: equation(`${shorter} cm + ${difference} cm`, "Dłuższy odcinek ma większą długość.") }),
      question({ label: "Wielokrotność długości", prompt: `Odcinek ma ${base} cm. Drugi odcinek jest ${multiplier} razy dłuższy. Ile centymetrów ma drugi odcinek?`, answer: base * multiplier, hint: "Pomnóż długość pierwszego odcinka przez podaną liczbę.", explanation: `${base} · ${multiplier} = ${base * multiplier} cm.`, visual: equation(`${base} cm · ${multiplier}`, "„Razy dłuższy” oznacza mnożenie.") }),
      question({ label: "Mieszane jednostki", prompt: `Ile milimetrów to ${mixedCm} cm i ${mixedMm} mm?`, answer: mixedCm * 10 + mixedMm, hint: "Najpierw zamień centymetry na milimetry, potem dodaj pozostałe milimetry.", explanation: `${mixedCm} · 10 + ${mixedMm} = ${mixedCm * 10 + mixedMm} mm.`, visual: equation(`${mixedCm} cm ${mixedMm} mm = ? mm`, "Sprowadź obie części do milimetrów.") })
    ];
  }

  function angleName(degrees) {
    if (degrees < 90) return "ostry";
    if (degrees === 90) return "prosty";
    if (degrees < 180) return "rozwarty";
    if (degrees === 180) return "półpełny";
    if (degrees < 360) return "wklęsły";
    return "pełny";
  }

  function angleQuestions() {
    const values = [rand(1, 8) * 10, 90, rand(10, 17) * 10, 180, rand(19, 35) * 10, 360];
    const names = ["ostry", "prosty", "rozwarty", "półpełny", "wklęsły", "pełny"];
    const questions = values.map((degrees) => choice(angleName(degrees), names, {
      label: "Rodzaje kątów",
      prompt: `Jak nazywa się kąt o mierze ${degrees}°?`,
      hint: "Porównaj jego miarę z 90°, 180° i 360°.",
      explanation: `${degrees}° to kąt ${angleName(degrees)}.`,
      visual: geometry("angle", { degrees }, `Miara kąta: ${degrees}°.`)
    }));
    questions.push(
      choice("wierzchołek", ["wierzchołek", "ramię", "bok"], { label: "Budowa kąta", prompt: "Jak nazywa się wspólny początek ramion kąta?", hint: "To punkt, w którym spotykają się obie półproste.", explanation: "Wspólny początek ramion kąta to wierzchołek.", visual: geometry("angle", { degrees: rand(30, 150), markVertex: true }, "Punkt wspólny obu ramion jest wierzchołkiem.") }),
      choice("półproste", ["półproste", "odcinki", "okręgi"], { label: "Budowa kąta", prompt: "Jakimi figurami są ramiona kąta?", hint: "Każde ramię ma początek w wierzchołku i biegnie w jednym kierunku.", explanation: "Ramiona kąta są półprostymi o wspólnym początku.", visual: geometry("angle", { degrees: rand(30, 150) }, "Obie półproste zaczynają się w jednym punkcie.") }),
      choice(angleName(values[0]), names, { label: "Porównywanie kątów", prompt: `Kąt ma ${values[0]}°. Czy jest ostry, prosty czy rozwarty?`, hint: "Kąt ostry ma mniej niż 90°.", explanation: `${values[0]}° < 90°, więc jest to kąt ostry.`, visual: geometry("angle", { degrees: values[0] }, "Porównaj miarę z kątem prostym.") }),
      question({ label: "Dwa kąty", prompt: "Ile kątów wyznaczają dwie różne półproste o wspólnym początku?", answer: 2, hint: "Spójrz na mniejszy obszar między ramionami i na pozostałą część pełnego obrotu.", explanation: "Dwie półproste o wspólnym początku wyznaczają dwa kąty.", visual: geometry("angle", { degrees: 120, showReflex: true }, "Zaznaczony kąt i kąt wklęsły razem tworzą pełny obrót.") })
    );
    return questions;
  }

  function angleMeasureQuestions() {
    const acute = rand(2, 8) * 10;
    const obtusePart = rand(2, 16) * 10;
    const minutes = pick([1, 5, 10, 15, 30, 45]);
    const parts = pick([2, 3, 4, 6]);
    const adjacent = rand(2, 16) * 10;
    const partialTurn = pick([90, 120, 180, 240, 270]);
    return [
      question({ label: "Do kąta prostego", prompt: `Jeden kąt ma ${acute}°. Ile stopni brakuje mu do kąta prostego?`, answer: 90 - acute, hint: "Kąt prosty ma 90°.", explanation: `90° − ${acute}° = ${90 - acute}°.`, visual: equation(`90° − ${acute}° = ?`, "Uzupełnij kąt do 90°.") }),
      question({ label: "Do kąta półpełnego", prompt: `Jeden z dwóch kątów tworzących linię prostą ma ${obtusePart}°. Ile stopni ma drugi?`, answer: 180 - obtusePart, hint: "Kąt półpełny ma 180°.", explanation: `180° − ${obtusePart}° = ${180 - obtusePart}°.`, visual: geometry("angle", { degrees: 180, split: obtusePart }, "Oba kąty razem mają 180°.") }),
      question({ label: "Obroty", prompt: "O ile stopni obracasz się przy komendzie „w prawo zwrot”?", answer: 90, hint: "To ćwierć pełnego obrotu.", explanation: "Ćwierć z 360° to 90°.", visual: geometry("angle", { degrees: 90 }, "Ćwierć obrotu to kąt prosty.") }),
      question({ label: "Obroty", prompt: "O ile stopni obracasz się przy komendzie „w tył zwrot”?", answer: 180, hint: "Po obrocie patrzysz dokładnie w przeciwnym kierunku.", explanation: "Pół pełnego obrotu to 180°.", visual: geometry("angle", { degrees: 180 }, "Pół obrotu tworzy kąt półpełny.") }),
      question({ label: "Wskazówka zegara", prompt: `O ile stopni obraca się wskazówka minutowa w ciągu ${minutes} minut?`, answer: minutes * 6, hint: "Pełny obrót 360° trwa 60 minut, więc w minutę wskazówka pokonuje 6°.", explanation: `${minutes} · 6° = ${minutes * 6}°.`, visual: equation(`${minutes} min · 6°`, "Wskazówka minutowa obraca się o 6° na minutę.") }),
      question({ label: "Równe części kąta", prompt: `Kąt półpełny podzielono na ${parts} jednakowe części. Ile stopni ma każda część?`, answer: 180 / parts, hint: "Podziel 180° przez liczbę równych części.", explanation: `180° : ${parts} = ${180 / parts}°.`, visual: equation(`180° : ${parts} = ?`, "Wszystkie części są jednakowe.") }),
      question({ label: "Pełny obrót", prompt: "Ile stopni ma pełny obrót?", answer: 360, hint: "Dwa kąty półpełne tworzą pełny obrót.", explanation: "Pełny obrót ma 360°.", visual: geometry("angle", { degrees: 360 }, "Pełny obrót wraca do kierunku początkowego.") }),
      question({ label: "Obroty", prompt: "Ile stopni mają razem trzy ćwierćobroty?", answer: 270, hint: "Jeden ćwierćobrót ma 90°.", explanation: "3 · 90° = 270°.", visual: geometry("angle", { degrees: 270 }, "Trzy ćwiartki pełnego obrotu.") }),
      question({ label: "Kąty przyległe", prompt: `Dwa kąty tworzą linię prostą. Jeden ma ${adjacent}°. Ile stopni ma drugi?`, answer: 180 - adjacent, hint: "Ich miary sumują się do 180°.", explanation: `180° − ${adjacent}° = ${180 - adjacent}°.`, visual: geometry("angle", { degrees: 180, split: adjacent }, "Suma zaznaczonych kątów wynosi 180°.") }),
      question({ label: "Do pełnego obrotu", prompt: `Wykonano obrót o ${partialTurn}°. Ile stopni brakuje do pełnego obrotu?`, answer: 360 - partialTurn, hint: "Pełny obrót ma 360°.", explanation: `360° − ${partialTurn}° = ${360 - partialTurn}°.`, visual: geometry("angle", { degrees: partialTurn }, "Uzupełnij obrót do 360°.") })
    ];
  }

  function polygonQuestions() {
    const names = { 3: "trójkąt", 4: "czworokąt", 5: "pięciokąt", 6: "sześciokąt", 7: "siedmiokąt", 8: "ośmiokąt" };
    const options = Object.values(names);
    const questions = Object.entries(names).map(([rawSides, name], index) => {
      const sides = Number(rawSides);
      if (index % 2 === 0) return choice(name, options, { label: "Nazwy wielokątów", prompt: `Jak nazywa się wielokąt o ${sides} bokach?`, hint: "Nazwa wielokąta mówi, ile ma kątów i boków.", explanation: `Wielokąt o ${sides} bokach to ${name}.`, visual: geometry("polygon", { sides }, `${sides} boków i ${sides} wierzchołków.`) });
      return question({ label: "Nazwy wielokątów", prompt: `Ile boków ma ${name}?`, answer: sides, hint: "Odczytaj liczbę ukrytą w nazwie figury.", explanation: `${name[0].toUpperCase()}${name.slice(1)} ma ${sides} boków.`, visual: geometry("polygon", { sides }, `To jest ${name}.`) });
    });
    const randomSides = rand(3, 8);
    questions.push(
      question({ label: "Wierzchołki", prompt: `Wielokąt ma ${randomSides} boków. Ile ma wierzchołków?`, answer: randomSides, hint: "W każdym wielokącie liczba boków i wierzchołków jest taka sama.", explanation: `Ma ${randomSides} boków, więc ma też ${randomSides} wierzchołków.`, visual: geometry("polygon", { sides: randomSides, markVertices: true }, "Każde spotkanie dwóch boków jest wierzchołkiem.") }),
      choice("tak", ["tak", "nie"], { label: "Definicja wielokąta", prompt: "Czy zamknięta łamana złożona wyłącznie z odcinków jest wielokątem?", hint: "Wielokąt musi być zamknięty i mieć proste boki.", explanation: "Tak. Zamknięta łamana z odcinków wyznacza wielokąt.", visual: geometry("polygon", { sides: rand(3, 7) }, "Boki tworzą zamkniętą figurę.") }),
      choice("nie", ["tak", "nie"], { label: "Definicja wielokąta", prompt: "Czy otwarta łamana jest wielokątem?", hint: "Sprawdź, czy figura ma zamknięte wnętrze.", explanation: "Nie. Otwarta łamana nie jest wielokątem.", visual: geometry("polyline", { segments: rand(3, 6), closed: false }, "Końce łamanej nie są połączone.") }),
      choice("tak", ["tak", "nie"], { label: "Własności wielokątów", prompt: "Czy w każdym wielokącie liczba boków, kątów i wierzchołków jest taka sama?", hint: "Każde dwa kolejne boki spotykają się w jednym wierzchołku i tworzą kąt.", explanation: "Tak. Wielokąt ma po tyle samo boków, kątów i wierzchołków.", visual: geometry("polygon", { sides: rand(3, 8), markVertices: true }, "Połącz każdy bok z jego końcowym wierzchołkiem.") })
    );
    return questions;
  }

  function rectangleQuestions() {
    const width = rand(4, 12), height = rand(2, width - 1), squareSide = rand(3, 10);
    const yesNo = ["tak", "nie"];
    return [
      choice("tak", yesNo, { label: "Prostokąty", prompt: "Czy każdy prostokąt ma cztery kąty proste?", hint: "To najważniejsza cecha prostokąta.", explanation: "Tak. Prostokąt jest czworokątem o czterech kątach prostych.", visual: geometry("rectangle", { width, height }, "Cztery narożniki mają po 90°.") }),
      choice("tak", yesNo, { label: "Kwadraty", prompt: "Czy każdy kwadrat jest prostokątem?", hint: "Sprawdź, czy kwadrat spełnia definicję prostokąta.", explanation: "Tak. Kwadrat ma cztery kąty proste, więc jest szczególnym prostokątem.", visual: geometry("rectangle", { width: squareSide, height: squareSide, square: true }, "Kwadrat ma wszystkie cechy prostokąta.") }),
      choice("nie", yesNo, { label: "Prostokąty", prompt: "Czy każdy prostokąt jest kwadratem?", hint: "Kwadrat wymaga dodatkowo czterech równych boków.", explanation: "Nie. Prostokąt może mieć dwa dłuższe i dwa krótsze boki.", visual: geometry("rectangle", { width, height }, `${width} ≠ ${height}, więc to nie jest kwadrat.`) }),
      choice("tak", yesNo, { label: "Boki prostokąta", prompt: "Czy przeciwległe boki prostokąta są równoległe i mają równe długości?", hint: "Porównaj górę z dołem oraz lewy bok z prawym.", explanation: "Tak. Każda para przeciwległych boków prostokąta jest równa i równoległa.", visual: geometry("rectangle", { width, height, markOpposites: true }, "Takie same znaczniki wskazują równe boki.") }),
      choice("kwadrat", ["kwadrat", "prostokąt niebędący kwadratem", "trójkąt"], { label: "Rozpoznawanie figur", prompt: "Czworokąt ma cztery kąty proste i cztery boki równej długości. Jaka jest jego najdokładniejsza nazwa?", hint: "Prostokąt o wszystkich równych bokach ma specjalną nazwę.", explanation: "Taka figura jest kwadratem.", visual: geometry("rectangle", { width: squareSide, height: squareSide, square: true }, "Wszystkie boki są równe.") }),
      choice("prostokąt niebędący kwadratem", ["kwadrat", "prostokąt niebędący kwadratem", "pięciokąt"], { label: "Rozpoznawanie figur", prompt: `Figura ma cztery kąty proste i boki długości ${width} cm oraz ${height} cm. Jaka jest jej najdokładniejsza nazwa?`, hint: "Boki są różnej długości, więc sprawdź dodatkowy warunek kwadratu.", explanation: `To prostokąt, ale nie kwadrat, bo ${width} cm ≠ ${height} cm.`, visual: geometry("rectangle", { width, height, showDimensions: true }, "Cztery kąty są proste, ale są dwie długości boków.") }),
      question({ label: "Kąty prostokąta", prompt: "Ile kątów prostych ma prostokąt?", answer: 4, hint: "Sprawdź każdy jego narożnik.", explanation: "Prostokąt ma 4 kąty proste.", visual: geometry("rectangle", { width, height, rightMarks: true }, "Każdy narożnik ma 90°.") }),
      question({ label: "Boki kwadratu", prompt: "Ile boków równej długości ma kwadrat?", answer: 4, hint: "W kwadracie żaden bok nie jest dłuższy od pozostałych.", explanation: "Wszystkie 4 boki kwadratu są równe.", visual: geometry("rectangle", { width: squareSide, height: squareSide, square: true, markOpposites: true }, "Cztery boki mają tę samą długość.") }),
      choice("równoległe", ["równoległe", "prostopadłe", "nie mają określonej relacji"], { label: "Boki prostokąta", prompt: "Jak położone są przeciwległe boki prostokąta?", hint: "Przedłuż je w wyobraźni.", explanation: "Przeciwległe boki prostokąta są równoległe.", visual: geometry("rectangle", { width, height, markOpposites: true }, "Przeciwległe boki nie przecinają się.") }),
      choice("prostopadłe", ["równoległe", "prostopadłe", "nie mają określonej relacji"], { label: "Boki prostokąta", prompt: "Jak położone są dwa sąsiednie boki prostokąta?", hint: "Spotykają się w kącie prostym.", explanation: "Sąsiednie boki prostokąta są prostopadłe.", visual: geometry("rectangle", { width, height, rightMarks: true }, "Sąsiednie boki tworzą 90°.") })
    ];
  }

  function perimeterQuestions() {
    const squareSide = rand(2, 25), a = rand(3, 30), b = rand(2, 20);
    const triangleA = rand(4, 16), triangleB = rand(4, 16);
    const triangle = [triangleA, triangleB, rand(Math.abs(triangleA - triangleB) + 1, triangleA + triangleB - 1)];
    const pentagonSide = rand(2, 15), reverseSide = rand(3, 25), reverseA = rand(3, 25), reverseB = rand(2, 20);
    const polygonSides = Array.from({ length: rand(4, 6) }, () => rand(5, 12));
    const fenceA = rand(8, 40), fenceB = rand(5, 30), sealA = rand(60, 150), sealB = rand(40, 100);
    return [
      question({ label: "Obwód kwadratu", prompt: `Kwadrat ma bok ${squareSide} cm. Ile centymetrów ma jego obwód?`, answer: 4 * squareSide, hint: "Kwadrat ma cztery równe boki.", explanation: `4 · ${squareSide} = ${4 * squareSide} cm.`, visual: geometry("perimeter", { sides: [squareSide, squareSide, squareSide, squareSide] }, "Dodaj cztery równe boki.") }),
      question({ label: "Obwód prostokąta", prompt: `Prostokąt ma boki ${a} cm i ${b} cm. Ile centymetrów ma jego obwód?`, answer: 2 * (a + b), hint: "Dodaj dwie długości i pomnóż sumę przez 2.", explanation: `2 · (${a} + ${b}) = ${2 * (a + b)} cm.`, visual: geometry("perimeter", { sides: [a, b, a, b] }, "Przeciwległe boki mają równe długości.") }),
      question({ label: "Obwód trójkąta", prompt: `Trójkąt ma boki ${triangle.join(" cm, ")} cm. Ile centymetrów ma jego obwód?`, answer: triangle.reduce((sum, value) => sum + value, 0), hint: "Dodaj długości wszystkich trzech boków.", explanation: `${triangle.join(" + ")} = ${triangle.reduce((sum, value) => sum + value, 0)} cm.`, visual: geometry("perimeter", { sides: triangle }, "Obwód to suma długości boków.") }),
      question({ label: "Obwód wielokąta", prompt: `Pięciokąt ma pięć równych boków po ${pentagonSide} cm. Ile centymetrów ma jego obwód?`, answer: pentagonSide * 5, hint: "Pomnóż długość boku przez liczbę boków.", explanation: `5 · ${pentagonSide} = ${pentagonSide * 5} cm.`, visual: geometry("perimeter", { sides: Array(5).fill(pentagonSide) }, "Pięć boków ma tę samą długość.") }),
      question({ label: "Bok z obwodu", prompt: `Obwód kwadratu wynosi ${reverseSide * 4} cm. Ile centymetrów ma jeden bok?`, answer: reverseSide, hint: "Podziel obwód przez 4.", explanation: `${reverseSide * 4} : 4 = ${reverseSide} cm.`, visual: geometry("perimeter", { sides: [null, null, null, null], total: reverseSide * 4 }, "Cztery boki kwadratu są równe.") }),
      question({ label: "Brakujący bok", prompt: `Obwód prostokąta wynosi ${2 * (reverseA + reverseB)} cm. Jeden bok ma ${reverseA} cm. Ile centymetrów ma sąsiedni bok?`, answer: reverseB, hint: "Połowa obwodu to suma dwóch sąsiednich boków.", explanation: `${2 * (reverseA + reverseB)} : 2 − ${reverseA} = ${reverseB} cm.`, visual: geometry("perimeter", { sides: [reverseA, null, reverseA, null], total: 2 * (reverseA + reverseB) }, "Najpierw znajdź połowę obwodu.") }),
      question({ label: "Wspólne jednostki", prompt: "Prostokąt ma boki 2 cm i 40 mm. Ile milimetrów ma jego obwód?", answer: 120, hint: "Zamień 2 cm na 20 mm, a potem policz obwód.", explanation: "2 cm = 20 mm, więc 2 · (20 + 40) = 120 mm.", visual: geometry("perimeter", { sides: [20, 40, 20, 40], unit: "mm" }, "Wszystkie długości zapisano w milimetrach.") }),
      question({ label: "Ogrodzenie", prompt: `Prostokątny ogród ma wymiary ${fenceA} m na ${fenceB} m. Ile metrów ogrodzenia potrzeba na cały obwód?`, answer: 2 * (fenceA + fenceB), hint: "Ogrodzenie biegnie wzdłuż czterech boków.", explanation: `2 · (${fenceA} + ${fenceB}) = ${2 * (fenceA + fenceB)} m.`, visual: geometry("perimeter", { sides: [fenceA, fenceB, fenceA, fenceB], unit: "m" }, "Obejdź ogród dookoła.") }),
      question({ label: "Obwód wielokąta", prompt: `Wielokąt ma boki długości ${polygonSides.join(", ")} cm. Ile centymetrów ma jego obwód?`, answer: polygonSides.reduce((sum, value) => sum + value, 0), hint: "Dodaj wszystkie podane długości dokładnie raz.", explanation: `${polygonSides.join(" + ")} = ${polygonSides.reduce((sum, value) => sum + value, 0)} cm.`, visual: geometry("perimeter", { sides: polygonSides }, "Każda liczba opisuje jeden bok.") }),
      question({ label: "Uszczelka okna", prompt: `Prostokątne okno ma ${sealA} cm szerokości i ${sealB} cm wysokości. Ile centymetrów uszczelki potrzeba dookoła?`, answer: 2 * (sealA + sealB), hint: "Uszczelka ma długość równą obwodowi okna.", explanation: `2 · (${sealA} + ${sealB}) = ${2 * (sealA + sealB)} cm.`, visual: geometry("perimeter", { sides: [sealA, sealB, sealA, sealB], unit: "cm" }, "Uszczelka biegnie po czterech bokach.") })
    ];
  }

  function circleQuestions() {
    const radius = rand(2, 20), diameter = rand(2, 20) * 2, anotherRadius = rand(3, 18);
    const position = pick(["inside", "on", "outside"]);
    const positionAnswer = { inside: "wewnątrz koła", on: "na okręgu", outside: "na zewnątrz koła" }[position];
    return [
      question({ label: "Promień i średnica", prompt: `Promień okręgu ma ${radius} cm. Ile centymetrów ma średnica?`, answer: radius * 2, hint: "Średnica składa się z dwóch promieni.", explanation: `2 · ${radius} = ${radius * 2} cm.`, visual: geometry("circle", { feature: "radius", value: radius }, "Promień łączy środek z punktem na okręgu.") }),
      question({ label: "Promień i średnica", prompt: `Średnica okręgu ma ${diameter} cm. Ile centymetrów ma promień?`, answer: diameter / 2, hint: "Promień jest połową średnicy.", explanation: `${diameter} : 2 = ${diameter / 2} cm.`, visual: geometry("circle", { feature: "diameter", value: diameter }, "Średnica przechodzi przez środek.") }),
      choice("okrąg", ["okrąg", "koło", "promień"], { label: "Koło i okrąg", prompt: "Jak nazywa się sama zamknięta linia, której punkty są jednakowo odległe od środka?", hint: "Nie chodzi o wypełnione wnętrze.", explanation: "Ta linia to okrąg.", visual: geometry("circle", { feature: "circumference" }, "Zaznaczona jest tylko linia brzegowa.") }),
      choice("koło", ["koło", "okrąg", "cięciwa"], { label: "Koło i okrąg", prompt: "Jak nazywa się okrąg wraz ze wszystkimi punktami w jego wnętrzu?", hint: "To wypełniona figura.", explanation: "Okrąg razem z wnętrzem tworzy koło.", visual: geometry("circle", { feature: "disk" }, "Zacieniowane wnętrze należy do koła.") }),
      choice("promień", ["promień", "średnica", "cięciwa"], { label: "Części okręgu", prompt: "Jak nazywa się odcinek łączący środek okręgu z punktem na okręgu?", hint: "To połowa średnicy.", explanation: "Taki odcinek to promień.", visual: geometry("circle", { feature: "radius", value: anotherRadius }, "Odcinek zaczyna się w środku.") }),
      choice("średnica", ["promień", "średnica", "cięciwa"], { label: "Części okręgu", prompt: "Jak nazywa się cięciwa przechodząca przez środek okręgu?", hint: "Jest najdłuższą cięciwą i składa się z dwóch promieni.", explanation: "Cięciwa przechodząca przez środek to średnica.", visual: geometry("circle", { feature: "diameter" }, "Odcinek łączy dwa punkty okręgu i przechodzi przez środek.") }),
      choice("nie", ["tak", "nie"], { label: "Środek okręgu", prompt: "Czy środek okręgu należy do okręgu?", hint: "Okrąg jest linią brzegową, nie całym wnętrzem.", explanation: "Nie. Środek leży wewnątrz koła, ale nie na okręgu.", visual: geometry("circle", { feature: "center" }, "Punkt S leży w środku, z dala od linii okręgu.") }),
      question({ label: "Promień i średnica", prompt: `Promień ma ${anotherRadius} mm. O ile milimetrów średnica jest dłuższa od promienia?`, answer: anotherRadius, hint: "Średnica to dwa promienie. Odejmij jeden promień.", explanation: `2 · ${anotherRadius} − ${anotherRadius} = ${anotherRadius} mm.`, visual: geometry("circle", { feature: "diameter", value: anotherRadius * 2 }, "Porównaj jeden promień z dwoma promieniami.") }),
      choice("cięciwa", ["cięciwa", "promień", "środek"], { label: "Części okręgu", prompt: "Jak nazywa się zaznaczony odcinek łączący dwa punkty okręgu, który nie przechodzi przez środek?", hint: "Każda średnica jest takim odcinkiem, ale nie każdy taki odcinek jest średnicą.", explanation: "Odcinek łączący dwa punkty okręgu to cięciwa.", visual: geometry("circle", { feature: "chord" }, "Końce odcinka leżą na okręgu.") }),
      choice(positionAnswer, ["wewnątrz koła", "na okręgu", "na zewnątrz koła"], { label: "Położenie punktu", prompt: "Gdzie leży punkt P zaznaczony na rysunku?", hint: "Porównaj jego odległość od środka z promieniem.", explanation: `Punkt P leży ${positionAnswer}.`, visual: geometry("circle", { feature: "point", pointPosition: position }, "Porównaj położenie punktu P z linią okręgu.") })
    ];
  }

  function scaleQuestions() {
    const shrink = pick([2, 4, 5, 10, 20, 25]), drawing = rand(2, 12), otherDrawing = rand(2, 12);
    const enlarge = pick([2, 3, 4, 5, 10]), realSmall = rand(2, 12), enlargedDrawing = rand(2, 12) * enlarge;
    const mapScale = pick([100, 200, 500, 1000]), mapDistance = rand(2, 12);
    const millimetreScale = pick([20, 50, 100, 200, 500, 1000]);
    const foundScale = pick([5, 10, 20, 25, 50]), foundDrawing = rand(2, 10);
    const detailA = pick([100, 200, 500, 1000]), detailB = pick([2000, 5000, 10000]);
    const realLength = pick([120, 240, 360]), finalScale = pick([10, 20, 30, 40, 60]);
    return [
      question({ label: "Pomniejszenie", prompt: `Na rysunku w skali 1:${shrink} odcinek ma ${drawing} cm. Ile centymetrów ma w rzeczywistości?`, answer: drawing * shrink, hint: `W skali 1:${shrink} każdy centymetr rysunku oznacza ${shrink} cm w rzeczywistości.`, explanation: `${drawing} · ${shrink} = ${drawing * shrink} cm.`, visual: equation(`1:${shrink}   •   ${drawing} cm → ? cm`, "Wymiar rzeczywisty jest większy od rysunkowego.") }),
      question({ label: "Wymiar na rysunku", prompt: `Przedmiot ma ${otherDrawing * shrink} cm. Narysowano go w skali 1:${shrink}. Ile centymetrów ma na rysunku?`, answer: otherDrawing, hint: `Podziel wymiar rzeczywisty przez ${shrink}.`, explanation: `${otherDrawing * shrink} : ${shrink} = ${otherDrawing} cm.`, visual: equation(`${otherDrawing * shrink} cm : ${shrink} = ? cm`, "Pomniejsz każdy wymiar tyle samo razy.") }),
      question({ label: "Powiększenie", prompt: `Owad ma ${realSmall} mm. Pokazano go w skali ${enlarge}:1. Ile milimetrów ma na rysunku?`, answer: realSmall * enlarge, hint: `Skala ${enlarge}:1 oznacza powiększenie ${enlarge} razy.`, explanation: `${realSmall} · ${enlarge} = ${realSmall * enlarge} mm.`, visual: equation(`${enlarge}:1   •   ${realSmall} mm → ? mm`, "Rysunek jest większy od rzeczywistego obiektu.") }),
      question({ label: "Rzeczywisty wymiar", prompt: `Model w skali ${enlarge}:1 ma na rysunku ${enlargedDrawing} mm. Ile milimetrów ma w rzeczywistości?`, answer: enlargedDrawing / enlarge, hint: `Rysunek jest ${enlarge} razy większy, więc podziel jego wymiar przez ${enlarge}.`, explanation: `${enlargedDrawing} : ${enlarge} = ${enlargedDrawing / enlarge} mm.`, visual: equation(`${enlargedDrawing} mm : ${enlarge} = ? mm`, "Cofnij powiększenie.") }),
      question({ label: "Skala planu", prompt: `Ilu metrom w rzeczywistości odpowiada 1 cm na planie w skali 1:${mapScale}?`, answer: mapScale / 100, hint: `${mapScale} cm zamień na metry.`, explanation: `${mapScale} cm = ${mapScale / 100} m.`, visual: equation(`1 cm na planie = ${mapScale} cm w rzeczywistości`, "100 cm to 1 m.") }),
      question({ label: "Odległość na planie", prompt: `Plan ma skalę 1:${mapScale}. Odległość na planie wynosi ${mapDistance} cm. Ile metrów wynosi w rzeczywistości?`, answer: mapDistance * mapScale / 100, hint: `Pomnóż ${mapDistance} przez ${mapScale}, a centymetry zamień na metry.`, explanation: `${mapDistance} · ${mapScale} cm = ${mapDistance * mapScale} cm = ${mapDistance * mapScale / 100} m.`, visual: equation(`${mapDistance} cm · ${mapScale}`, "Najpierw oblicz odległość w centymetrach.") }),
      question({ label: "Milimetr na planie", prompt: `Ilu centymetrom w rzeczywistości odpowiada 1 mm na planie w skali 1:${millimetreScale}?`, answer: millimetreScale / 10, hint: `To ${millimetreScale} mm w rzeczywistości. Zamień milimetry na centymetry.`, explanation: `${millimetreScale} mm = ${millimetreScale / 10} cm.`, visual: equation(`1 mm → ${millimetreScale} mm = ? cm`, "10 mm to 1 cm.") }),
      question({ label: "Wyznaczanie skali", prompt: `Odcinek ma ${foundDrawing} cm na rysunku i ${foundDrawing * foundScale} cm w rzeczywistości. Jaka liczba stoi po dwukropku w skali 1:?`, answer: foundScale, hint: "Podziel długość rzeczywistą przez długość na rysunku.", explanation: `${foundDrawing * foundScale} : ${foundDrawing} = ${foundScale}, więc skala to 1:${foundScale}.`, visual: equation(`${foundDrawing} cm : ${foundDrawing * foundScale} cm`, "Porównaj te same jednostki.") }),
      choice(`1:${Math.min(detailA, detailB)}`, [`1:${detailA}`, `1:${detailB}`], { label: "Szczegółowość mapy", prompt: `Która mapa pokazuje ten sam teren dokładniej: w skali 1:${detailA} czy 1:${detailB}?`, hint: "Dokładniejsza mapa ma mniejszą liczbę po dwukropku — obiekty są na niej większe.", explanation: `Skala 1:${Math.min(detailA, detailB)} jest większa i pokazuje więcej szczegółów.`, visual: equation(`1:${detailA}   czy   1:${detailB}`, "Mniejszy mianownik oznacza większy rysunek.") }),
      question({ label: "Rysunek w skali", prompt: `Przedmiot ma w rzeczywistości ${realLength} cm. Ile centymetrów będzie miał na rysunku w skali 1:${finalScale}?`, answer: realLength / finalScale, hint: `Podziel rzeczywistą długość przez ${finalScale}.`, explanation: `${realLength} : ${finalScale} = ${realLength / finalScale} cm.`, visual: equation(`${realLength} cm : ${finalScale}`, "W skali 1:n każdy wymiar dzielimy przez n.") })
    ];
  }

  const builders = {
    linie: lineQuestions,
    polozenie: positionQuestions,
    dlugosci: lengthQuestions,
    katy: angleQuestions,
    "mierzenie-katow": angleMeasureQuestions,
    wielokaty: polygonQuestions,
    prostokaty: rectangleQuestions,
    obwody: perimeterQuestions,
    kola: circleQuestions,
    skala: scaleQuestions
  };

  function buildQuestions(mode) {
    if (builders[mode]) return builders[mode]();
    return shuffle(Object.values(builders).map((build) => pick(build())));
  }

  MathTownGame.start({
    chapterId: "chapter4",
    chapterTitle: "Figury geometryczne",
    routeLabels,
    buildQuestions
  });
})();
