(() => {
  "use strict";

  const routeLabels = {
    "czesci-calosci": "Pracownia równych części",
    "liczby-mieszane": "Magazyn całych i części",
    "os-ulamkowa": "Ulica ułamkowej osi",
    porownywanie: "Wieża porównań",
    "rozszerzanie-skracanie": "Warsztat równoważności",
    "ulamki-niewlasciwe": "Przepakownia całości",
    "ulamek-jako-iloraz": "Punkt sprawiedliwego podziału",
    dodawanie: "Kasa ułamkowych sum",
    odejmowanie: "Kasa ułamkowych różnic",
    "ulamkowe-zagadki": "Klub tropicieli ułamków",
    mix: "Wielki ułamkowy obchód"
  };

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const reduce = (numerator, denominator) => {
    const divisor = gcd(numerator, denominator);
    return [numerator / divisor, denominator / divisor];
  };
  const fraction = (numerator, denominator) => reduce(numerator, denominator).join("/");
  const rawFraction = (numerator, denominator) => `${numerator}/${denominator}`;
  const mixed = (numerator, denominator) => {
    const whole = Math.floor(numerator / denominator), remainder = numerator % denominator;
    if (!remainder) return String(whole);
    const [part, reducedDenominator] = reduce(remainder, denominator);
    return `${whole} ${part}/${reducedDenominator}`;
  };
  const compare = (a, b, c, d) => a * d === c * b ? "=" : a * d > c * b ? ">" : "<";
  const question = (data) => ({ kind: "input", label: "Ułamki zwykłe", visual: null, ...data });
  const equation = (expression, caption) => ({ type: "equation", expression, caption });
  const model = (shape, numerator, denominator, caption, extra = {}) => ({ type: "fraction-model", shape, numerator, denominator, caption, ...extra });
  const numberline = (denominator, minNumerator, maxNumerator, markedNumerators, caption, extra = {}) => ({ type: "fraction-numberline", denominator, minNumerator, maxNumerator, markedNumerators, caption, labelEveryWhole: true, ...extra });
  const choice = (answer, options, data) => question({
    ...data,
    kind: "choice",
    answer,
    options: [...new Set(options)].map((value) => ({ value, label: String(value) }))
  });

  function parseFraction(value) {
    const text = String(value).trim().replaceAll("⁄", "/").replace(/\s*\/\s*/g, "/");
    let match = text.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (match) {
      const whole = Number(match[1]), numerator = Number(match[2]), denominator = Number(match[3]);
      if (denominator > 0 && numerator > 0 && numerator < denominator) return { numerator: whole * denominator + numerator, denominator, form: "mixed", whole, partNumerator: numerator };
      return null;
    }
    match = text.match(/^(\d+)\/(\d+)$/);
    if (match && Number(match[2]) > 0) return { numerator: Number(match[1]), denominator: Number(match[2]), form: "fraction" };
    if (/^\d+$/.test(text)) return { numerator: Number(text), denominator: 1, form: "integer" };
    return null;
  }

  function sameValue(raw, answer) {
    const entered = parseFraction(raw), expected = parseFraction(answer);
    return Boolean(entered && expected && entered.numerator * expected.denominator === expected.numerator * entered.denominator);
  }

  const answerCheckers = {
    fraction(raw, answer) { return sameValue(raw, answer); },
    exactFraction(raw, answer) {
      const entered = parseFraction(raw), expected = parseFraction(answer);
      return Boolean(entered && expected && entered.form === "fraction" && entered.numerator === expected.numerator && entered.denominator === expected.denominator);
    },
    mixed(raw, answer) {
      const entered = parseFraction(raw);
      return Boolean(entered && entered.form === "mixed" && sameValue(raw, answer));
    }
  };

  function partWholeQuestions() {
    const denominator = rand(3, 8), numerator = rand(1, denominator - 1);
    const otherDenominator = rand(4, 10), otherNumerator = rand(1, otherDenominator - 1);
    const gridDenominator = pick([4, 6, 8, 9, 10, 12]);
    const gridNumerator = rand(1, gridDenominator - 1);
    const rows = gridDenominator % 3 === 0 ? 3 : 2;
    const columns = gridDenominator / rows;
    const collectionSize = rand(6, 12), selected = rand(1, collectionSize - 1);
    return [
      question({ checker: "exactFraction", label: "Część całości", prompt: "Jaki ułamek figury został zaznaczony? Zapisz go w postaci licznik/mianownik.", answer: rawFraction(numerator, denominator), hint: "Policz wszystkie równe części, a potem części zaznaczone.", explanation: `Zaznaczono ${numerator} z ${denominator} równych części, czyli ${rawFraction(numerator, denominator)}.`, visual: model("circle", numerator, denominator, "Każdy wycinek ma taką samą wielkość.") }),
      choice("liczbę zaznaczonych części", ["liczbę zaznaczonych części", "liczbę wszystkich równych części", "wielkość całej figury"], { label: "Licznik", prompt: "Co mówi licznik ułamka?", hint: "Licznik znajduje się nad kreską ułamkową.", explanation: "Licznik podaje, ile równych części wybrano lub zaznaczono.", visual: model("bar", 3, 7, "W ułamku 3/7 licznik 3 opisuje zaznaczone części.") }),
      choice("liczbę wszystkich równych części", ["liczbę wszystkich równych części", "liczbę zaznaczonych części", "liczbę całych figur"], { label: "Mianownik", prompt: "Co mówi mianownik ułamka?", hint: "Mianownik znajduje się pod kreską ułamkową.", explanation: "Mianownik podaje, na ile równych części podzielono całość.", visual: model("bar", 4, 9, "W ułamku 4/9 mianownik 9 opisuje podział całości.") }),
      question({ checker: "exactFraction", label: "Dopełnienie do całości", prompt: `Z ${denominator} równych części zaznaczono ${numerator}. Jaka część nie jest zaznaczona?`, answer: rawFraction(denominator - numerator, denominator), hint: `Od ${denominator} wszystkich części odejmij ${numerator} zaznaczonych.`, explanation: `${denominator} − ${numerator} = ${denominator - numerator}, więc niezaznaczona część to ${rawFraction(denominator - numerator, denominator)}.`, visual: model("bar", numerator, denominator, "Znajdź jasne części modelu.") }),
      question({ checker: "exactFraction", label: "Ułamek zbioru", prompt: "Jaka część wszystkich krążków jest zaznaczona?", answer: rawFraction(selected, collectionSize), hint: "Mianownik to liczba wszystkich krążków, a licznik — zaznaczonych.", explanation: `Zaznaczono ${selected} z ${collectionSize} krążków, czyli ${rawFraction(selected, collectionSize)}.`, visual: model("collection", selected, collectionSize, "Krążki tworzą jeden zbiór.") }),
      question({ label: "Liczba części", prompt: `Prostokąt podzielono na ${otherDenominator} równych części. Jego zaznaczona część to ${rawFraction(otherNumerator, otherDenominator)}. Ile części zaznaczono?`, answer: otherNumerator, hint: "Odczytaj licznik ułamka.", explanation: `Licznik ${otherNumerator} mówi, że zaznaczono ${otherNumerator} części.`, visual: model("bar", otherNumerator, otherDenominator, "Wszystkie części są równe.") }),
      choice("nie", ["tak", "nie"], { label: "Równe części", prompt: "Figurę podzielono na cztery kawałki różnej wielkości. Czy każdy kawałek można nazwać jedną czwartą figury?", hint: "Ułamek opisuje podział na części jednakowej wielkości.", explanation: "Nie. Ćwiartki muszą być czterema równymi częściami.", visual: equation("4 części ≠ 4 równe części", "Najpierw sprawdź, czy podział jest równy.") }),
      question({ checker: "exactFraction", label: "Siatka ułamkowa", prompt: "Jaki ułamek siatki jest zaznaczony?", answer: rawFraction(gridNumerator, gridDenominator), hint: "Policz wszystkie pola siatki i pola zaznaczone.", explanation: `Zaznaczono ${gridNumerator} z ${gridDenominator} równych pól, czyli ${rawFraction(gridNumerator, gridDenominator)}.`, visual: model("grid", gridNumerator, gridDenominator, "Każde pole ma ten sam rozmiar.", { rows, columns }) }),
      question({ checker: "exactFraction", label: "Budowanie ułamka", prompt: `Zapisz ułamek, którego licznik to 2, a mianownik to ${otherDenominator}.`, answer: rawFraction(2, otherDenominator), hint: "Licznik wpisz nad kreską, a mianownik pod nią.", explanation: `Szukany ułamek to ${rawFraction(2, otherDenominator)}.`, visual: equation(`licznik: 2   mianownik: ${otherDenominator}`, "Zbuduj zapis ułamka.") }),
      question({ checker: "exactFraction", label: "Część trasy", prompt: `Trasa ma ${otherDenominator} równych odcinków. Patrol przeszedł ${otherNumerator}. Jaką część trasy przeszedł?`, answer: rawFraction(otherNumerator, otherDenominator), hint: "Przebyte odcinki są licznikiem, a wszystkie odcinki mianownikiem.", explanation: `Patrol przeszedł ${otherNumerator} z ${otherDenominator} odcinków, czyli ${rawFraction(otherNumerator, otherDenominator)} trasy.`, visual: model("bar", otherNumerator, otherDenominator, "Każdy odcinek trasy ma tę samą długość.") })
    ];
  }

  function mixedNumberQuestions() {
    const denominator = pick([2, 3, 4, 5, 6, 8]), whole = rand(1, 5), remainder = rand(1, denominator - 1);
    const numerator = whole * denominator + remainder;
    const centimetres = rand(1, 4) * 100 + pick([25, 50, 75]);
    const minutes = rand(1, 3) * 60 + pick([15, 30, 45]);
    const hours = rand(1, 3) * 24 + pick([6, 12, 18]);
    const quarters = pick([5, 6, 7, 9, 10, 11, 13, 14, 15, 17, 18, 19]);
    return [
      question({ checker: "mixed", label: "Odczyt liczby mieszanej", prompt: "Ile całości i części pokazuje model? Zapisz liczbę mieszaną.", answer: mixed(numerator, denominator), hint: "Policz pełne figury, a potem części ostatniej figury.", explanation: `${numerator} części po ${rawFraction(1, denominator)} daje ${mixed(numerator, denominator)}.`, visual: model("circle", numerator, denominator, "Pełne koło oznacza jedną całość.") }),
      question({ checker: "mixed", label: "Całość i część", prompt: `Zapisz jako jedną liczbę mieszaną: ${whole} całości i ${rawFraction(remainder, denominator)} całości.`, answer: mixed(numerator, denominator), hint: "Część całkowitą postaw przed ułamkiem.", explanation: `${whole} i ${rawFraction(remainder, denominator)} zapisujemy jako ${mixed(numerator, denominator)}.`, visual: equation(`${whole} + ${rawFraction(remainder, denominator)} = ?`, "Połącz część całkowitą i ułamkową.") }),
      question({ checker: "mixed", label: "Metry i centymetry", prompt: `${centimetres} cm — ile to metrów? Zapisz liczbę mieszaną.`, answer: mixed(centimetres, 100), hint: "100 cm to 1 m. Oddziel pełne setki centymetrów.", explanation: `${centimetres} cm = ${mixed(centimetres, 100)} m.`, visual: equation(`${centimetres}/100 m`, "Każde 100 cm tworzy pełny metr.") }),
      question({ checker: "mixed", label: "Godziny i minuty", prompt: `${minutes} minut — ile to godzin? Zapisz liczbę mieszaną.`, answer: mixed(minutes, 60), hint: "60 minut to 1 godzina.", explanation: `${minutes} min = ${mixed(minutes, 60)} godziny.`, visual: equation(`${minutes}/60 h`, "Oddziel pełne grupy po 60 minut.") }),
      question({ checker: "mixed", label: "Doby i godziny", prompt: `${hours} godzin — ile to dób? Zapisz liczbę mieszaną.`, answer: mixed(hours, 24), hint: "Jedna doba ma 24 godziny.", explanation: `${hours} h = ${mixed(hours, 24)} doby.`, visual: equation(`${hours}/24 doby`, "Oddziel pełne grupy po 24 godziny.") }),
      question({ checker: "mixed", label: "Pojemność", prompt: "Dwa pełne pojemniki i trzy czwarte kolejnego — ile to pojemników?", answer: "2 3/4", hint: "Zapisz najpierw dwie całości, potem część trzeciego pojemnika.", explanation: "Dwie całości i 3/4 to 2 3/4.", visual: model("bar", 11, 4, "Każdy pojemnik jest podzielony na cztery równe części.") }),
      question({ label: "Część całkowita", prompt: `Jaka jest część całkowita liczby ${mixed(numerator, denominator)}?`, answer: whole, hint: "Część całkowita stoi przed ułamkiem.", explanation: `W liczbie ${mixed(numerator, denominator)} część całkowita to ${whole}.`, visual: equation(mixed(numerator, denominator), "Odczytaj liczbę stojącą przed ułamkiem.") }),
      question({ checker: "mixed", label: "Ćwiartki", prompt: `${quarters} ćwiartek — ile to całości i ćwiartek? Zapisz liczbę mieszaną.`, answer: mixed(quarters, 4), hint: "Każde cztery ćwiartki tworzą jedną całość.", explanation: `${quarters} : 4 daje zapis ${mixed(quarters, 4)}.`, visual: model("circle", quarters, 4, "Połącz każde cztery ćwiartki w całość.") }),
      choice("część całkowita i część ułamkowa", ["część całkowita i część ułamkowa", "dwa mianowniki", "tylko licznik"], { label: "Budowa liczby mieszanej", prompt: "Z jakich dwóch części składa się liczba mieszana?", hint: "Spójrz na zapis 3 2/5.", explanation: "Liczba mieszana ma część całkowitą oraz część ułamkową.", visual: equation("3   2/5", "3 to część całkowita, a 2/5 — ułamkowa.") }),
      question({ checker: "mixed", label: "Długość taśmy", prompt: `Taśma ma ${whole} pełnych metrów i jeszcze ${rawFraction(remainder, denominator)} metra. Zapisz jej długość jako liczbę mieszaną.`, answer: mixed(numerator, denominator), hint: "Połącz pełne metry z pozostałą częścią metra.", explanation: `Długość taśmy to ${mixed(numerator, denominator)} m.`, visual: model("bar", numerator, denominator, "Każdy pasek oznacza jeden metr.") })
    ];
  }

  function numberlineQuestions() {
    const d1 = pick([3, 4, 5, 6, 8]), n1 = rand(1, d1 - 1);
    const d2 = pick([2, 3, 4, 5]), whole = rand(1, 3), rem = rand(1, d2 - 1), n2 = whole * d2 + rem;
    const stepD = pick([3, 4, 5]), start = rand(1, stepD - 1), jump = rand(1, stepD);
    return [
      question({ checker: "fraction", label: "Odczyt z osi", prompt: "Jaki ułamek wskazuje punkt A?", answer: rawFraction(n1, d1), hint: `Jednostkę podzielono na ${d1} równych odcinków. Policz kroki od zera.`, explanation: `Punkt A leży ${n1} kroków po ${rawFraction(1, d1)} od zera, czyli w ${rawFraction(n1, d1)}.`, visual: numberline(d1, 0, d1, [n1], "Odcinek od 0 do 1 podzielono na równe części.", { unknownLabel: "A" }) }),
      question({ checker: "mixed", label: "Liczba mieszana na osi", prompt: "Jaką liczbę mieszaną wskazuje punkt B?", answer: mixed(n2, d2), hint: "Najpierw odczytaj pełne jednostki, potem kroki za ostatnią całością.", explanation: `${n2} kroków po ${rawFraction(1, d2)} to ${mixed(n2, d2)}.`, visual: numberline(d2, 0, (whole + 1) * d2, [n2], "Każda jednostka ma taki sam podział.", { unknownLabel: "B" }) }),
      question({ checker: "fraction", label: "Ułamek niewłaściwy na osi", prompt: "Zapisz położenie punktu C jako ułamek niewłaściwy.", answer: rawFraction(n2, d2), hint: "Policz wszystkie małe kroki od zera; mianownik pozostaje taki jak podział jednostki.", explanation: `Od zera są ${n2} kroki po ${rawFraction(1, d2)}, więc punkt C to ${rawFraction(n2, d2)}.`, visual: numberline(d2, 0, (whole + 1) * d2, [n2], "Policz małe odcinki od zera.", { unknownLabel: "C" }) }),
      question({ label: "Podział jednostki", prompt: `Między 0 i 1 jest ${d1} równych odcinków. Jaki mianownik mają ułamki zaznaczane na tej osi?`, answer: d1, hint: "Mianownik mówi, na ile równych części podzielono jednostkę.", explanation: `Jednostkę podzielono na ${d1} części, więc mianownik to ${d1}.`, visual: numberline(d1, 0, d1, [], "Policz odstępy, nie kreski.") }),
      choice(rawFraction(d1 - 1, d1), [rawFraction(1, d1), rawFraction(d1 - 1, d1), rawFraction(d1 + 1, d1)], { label: "Położenie na osi", prompt: "Która z liczb leży najbliżej 1, ale jest od niej mniejsza?", hint: `Na osi podzielonej na ${d1} części ostatni punkt przed 1 ma licznik o 1 mniejszy od mianownika.`, explanation: `${rawFraction(d1 - 1, d1)} leży o jeden krok przed 1.`, visual: numberline(d1, 0, d1, [d1 - 1], "Zaznaczono ostatni krok przed 1.", { showMarkedValues: true }) }),
      question({ checker: "fraction", label: "Spacer po osi", prompt: `Startujesz w ${rawFraction(start, stepD)} i przesuwasz się w prawo o ${rawFraction(jump, stepD)}. Gdzie staniesz?`, answer: rawFraction(start + jump, stepD), hint: "Przy jednakowych mianownikach dodaj liczniki kroków.", explanation: `${rawFraction(start, stepD)} + ${rawFraction(jump, stepD)} = ${rawFraction(start + jump, stepD)}.`, visual: numberline(stepD, 0, stepD * 2, [start, start + jump], "Dwie kropki pokazują start i koniec ruchu.", { showMarkedValues: true }) }),
      question({ checker: "fraction", label: "Połowa jednostki", prompt: "Jaki ułamek wskazuje środkowy punkt między 0 i 1?", answer: "1/2", hint: "Środek dzieli jednostkę na dwie równe części.", explanation: "Środkowy punkt odcinka od 0 do 1 ma wartość 1/2.", visual: numberline(2, 0, 2, [1], "Punkt dzieli jednostkę dokładnie na pół.", { unknownLabel: "S" }) }),
      choice(mixed(n2, d2), [mixed(n2, d2), mixed(n2 + 1, d2), mixed(n2 - 1, d2)], { label: "Dwa zapisy", prompt: `Która liczba mieszana opisuje punkt ${rawFraction(n2, d2)} na osi?`, hint: `Podziel ${n2} przez ${d2} i odczytaj iloraz oraz resztę.`, explanation: `${rawFraction(n2, d2)} = ${mixed(n2, d2)}.`, visual: numberline(d2, 0, (whole + 1) * d2, [n2], "Ułamek niewłaściwy i liczba mieszana wskazują ten sam punkt.", { showMarkedValues: true }) }),
      question({ checker: "fraction", label: "Odległość na osi", prompt: `Jaka jest odległość między punktami ${rawFraction(1, d1)} i ${rawFraction(d1 - 1, d1)}?`, answer: rawFraction(d1 - 2, d1), hint: "Odejmij mniejszy licznik od większego; mianownik się nie zmienia.", explanation: `${rawFraction(d1 - 1, d1)} − ${rawFraction(1, d1)} = ${fraction(d1 - 2, d1)}.`, visual: numberline(d1, 0, d1, [1, d1 - 1], "Zaznaczono oba końce mierzonej odległości.", { showMarkedValues: true }) }),
      choice("w prawo", ["w prawo", "w lewo", "w tym samym miejscu"], { label: "Kierunek wzrostu", prompt: "W którą stronę przesuwa się punkt, gdy wartość ułamka rośnie?", hint: "Na osi liczby rosną od lewej do prawej.", explanation: "Większe liczby leżą bardziej na prawo.", visual: numberline(4, 0, 8, [1, 6], "Porównaj położenie dwóch zaznaczonych wartości.", { showMarkedValues: true }) })
    ];
  }

  function comparisonQuestions() {
    const denominator = rand(6, 12), small = rand(1, denominator - 3), large = rand(small + 1, denominator - 1);
    const numerator = rand(2, 5), smallDenominator = numerator + rand(1, 3), largeDenominator = smallDenominator + rand(1, 4);
    const whole = rand(1, 5), partA = rand(1, 3), partB = partA + rand(1, 2), mixedDenominator = Math.max(partB + 1, 6);
    const halfDenominator = pick([6, 8, 10, 12]), belowHalf = halfDenominator / 2 - 1;
    return [
      choice("<", ["<", ">", "="], { label: "Wspólny mianownik", prompt: `Wstaw znak: ${rawFraction(small, denominator)} ? ${rawFraction(large, denominator)}`, hint: "Przy jednakowych mianownikach porównaj liczniki.", explanation: `${small} < ${large}, więc ${rawFraction(small, denominator)} < ${rawFraction(large, denominator)}.`, visual: equation(`${rawFraction(small, denominator)}  ?  ${rawFraction(large, denominator)}`, "Obie całości podzielono tak samo.") }),
      choice(">", ["<", ">", "="], { label: "Wspólny licznik", prompt: `Wstaw znak: ${rawFraction(numerator, smallDenominator)} ? ${rawFraction(numerator, largeDenominator)}`, hint: "Przy jednakowych licznikach większe części powstają przy mniejszym mianowniku.", explanation: `${smallDenominator} < ${largeDenominator}, więc ${rawFraction(numerator, smallDenominator)} > ${rawFraction(numerator, largeDenominator)}.`, visual: equation(`${rawFraction(numerator, smallDenominator)}  ?  ${rawFraction(numerator, largeDenominator)}`, "Ta sama liczba większych części daje większą wartość.") }),
      choice("<", ["<", ">", "="], { label: "Liczby mieszane", prompt: `Wstaw znak: ${whole} ${rawFraction(partA, mixedDenominator)} ? ${whole} ${rawFraction(partB, mixedDenominator)}`, hint: "Części całkowite są równe, więc porównaj części ułamkowe.", explanation: `${partA} < ${partB}, więc pierwsza liczba mieszana jest mniejsza.`, visual: equation(`${whole} ${rawFraction(partA, mixedDenominator)}  ?  ${whole} ${rawFraction(partB, mixedDenominator)}`, "Najpierw porównaj całości.") }),
      choice("<", ["<", ">", "="], { label: "Porównanie z połową", prompt: `Wstaw znak: ${rawFraction(belowHalf, halfDenominator)} ? 1/2`, hint: "Połowa mianownika byłaby licznikiem ułamka równego 1/2.", explanation: `Połowa ${halfDenominator} to ${halfDenominator / 2}, a ${belowHalf} jest mniejsze, więc ułamek jest mniejszy od 1/2.`, visual: model("bar", belowHalf, halfDenominator, "Porównaj zaznaczenie z połową paska.") }),
      choice(">", ["<", ">", "="], { label: "Porównanie z jednością", prompt: `Wstaw znak: ${rawFraction(denominator + 2, denominator)} ? 1`, hint: "Porównaj licznik z mianownikiem.", explanation: "Licznik jest większy od mianownika, więc ułamek jest większy od 1.", visual: model("bar", denominator + 2, denominator, "Pełny pasek to jedna całość.") }),
      choice(`${rawFraction(small, denominator)}, ${rawFraction(large, denominator)}`, [`${rawFraction(small, denominator)}, ${rawFraction(large, denominator)}`, `${rawFraction(large, denominator)}, ${rawFraction(small, denominator)}`], { label: "Porządkowanie", prompt: "Który zapis ustawia ułamki od mniejszego do większego?", hint: "Mianowniki są jednakowe, więc rosnący licznik oznacza rosnący ułamek.", explanation: `${small} < ${large}, więc poprawna jest kolejność ${rawFraction(small, denominator)}, ${rawFraction(large, denominator)}.`, visual: equation(`${rawFraction(small, denominator)}   ${rawFraction(large, denominator)}`, "Ustaw liczby jak punkty na osi.") }),
      choice(rawFraction(denominator - 1, denominator), [rawFraction(denominator - 1, denominator), rawFraction(denominator - 3, denominator)], { label: "Blisko jedności", prompt: "Który ułamek leży bliżej liczby 1?", hint: "Sprawdź, ilu części brakuje każdemu ułamkowi do całej jednostki.", explanation: `${rawFraction(denominator - 1, denominator)} brakuje tylko ${rawFraction(1, denominator)} do 1.`, visual: equation(`${rawFraction(denominator - 1, denominator)}   czy   ${rawFraction(denominator - 3, denominator)}`, "Mniejsza luka do 1 oznacza bliższą liczbę.") }),
      choice("=", ["<", ">", "="], { label: "Równe ułamki", prompt: "Wstaw znak: 2/3 ? 8/12", hint: "Rozszerz 2/3 przez 4.", explanation: "2/3 = 8/12, bo licznik i mianownik pomnożono przez 4.", visual: equation("2/3  ?  8/12", "Różne zapisy mogą oznaczać tę samą liczbę.") }),
      choice("Maja", ["Maja", "Olek", "oboje tyle samo"], { label: "Zadanie tekstowe", prompt: `Maja przeszła ${rawFraction(large, denominator)} trasy, a Olek ${rawFraction(small, denominator)}. Kto przeszedł większą część?`, hint: "Porównaj liczniki, bo mianowniki są równe.", explanation: `${large} > ${small}, więc większą część trasy przeszła Maja.`, visual: equation(`Maja: ${rawFraction(large, denominator)}   Olek: ${rawFraction(small, denominator)}`, "Obie trasy podzielono na tyle samo części.") }),
      choice(">", ["<", ">", "="], { label: "Wspólny mianownik", prompt: "Wstaw znak: 3/4 ? 5/8", hint: "Rozszerz 3/4 do mianownika 8.", explanation: "3/4 = 6/8, a 6/8 > 5/8, więc 3/4 > 5/8.", visual: equation("3/4 = 6/8  ?  5/8", "Sprowadź ułamki do wspólnego mianownika.") })
    ];
  }

  function equivalenceQuestions() {
    const numerator = rand(1, 5), denominator = numerator + rand(2, 6), factor = rand(2, 6);
    const otherFactor = rand(2, 5), [simpleN, simpleD] = pick([[1, 2], [2, 3], [3, 4], [2, 5], [3, 5], [4, 7], [5, 8]]);
    return [
      question({ label: "Rozszerzanie", prompt: `${rawFraction(numerator, denominator)} = ?/${denominator * factor}. Jaki licznik wpiszesz?`, answer: numerator * factor, hint: `Mianownik pomnożono przez ${factor}; licznik pomnóż przez tę samą liczbę.`, explanation: `${numerator} · ${factor} = ${numerator * factor}, więc ${rawFraction(numerator, denominator)} = ${rawFraction(numerator * factor, denominator * factor)}.`, visual: equation(`${rawFraction(numerator, denominator)} · ${factor}/${factor} = ?`, "Pomnóż licznik i mianownik przez tę samą liczbę.") }),
      question({ label: "Rozszerzanie", prompt: `${rawFraction(numerator, denominator)} = ${numerator * factor}/?. Jaki mianownik wpiszesz?`, answer: denominator * factor, hint: `Licznik pomnożono przez ${factor}; mianownik też pomnóż przez ${factor}.`, explanation: `${denominator} · ${factor} = ${denominator * factor}.`, visual: equation(`${rawFraction(numerator, denominator)} = ${numerator * factor}/?`, "Obie części ułamka zmieniają się tym samym działaniem.") }),
      question({ checker: "exactFraction", label: "Wskazany mianownik", prompt: `Rozszerz ${rawFraction(numerator, denominator)} tak, aby mianownik wynosił ${denominator * factor}.`, answer: rawFraction(numerator * factor, denominator * factor), hint: `Sprawdź, ile razy zwiększył się mianownik, i tak samo pomnóż licznik.`, explanation: `${rawFraction(numerator, denominator)} = ${rawFraction(numerator * factor, denominator * factor)}.`, visual: equation(`${rawFraction(numerator, denominator)} = ?/${denominator * factor}`, "Zachowaj tę samą wartość.") }),
      choice(rawFraction(numerator * factor, denominator * factor), [rawFraction(numerator * factor, denominator * factor), rawFraction(numerator + factor, denominator + factor), rawFraction(numerator, denominator * factor)], { label: "Ułamki równe", prompt: `Który ułamek jest równy ${rawFraction(numerator, denominator)}?`, hint: `Pomnóż licznik i mianownik przez ${factor}.`, explanation: `${rawFraction(numerator * factor, denominator * factor)} powstał przez rozszerzenie przez ${factor}.`, visual: model("bar", numerator, denominator, "Wartość nie zmienia się po poprawnym rozszerzeniu.") }),
      question({ checker: "exactFraction", label: "Skracanie", prompt: `Skróć do najprostszej postaci: ${rawFraction(simpleN * otherFactor, simpleD * otherFactor)}.`, answer: rawFraction(simpleN, simpleD), hint: `Podziel licznik i mianownik przez ${otherFactor}.`, explanation: `${rawFraction(simpleN * otherFactor, simpleD * otherFactor)} : ${otherFactor}/${otherFactor} = ${rawFraction(simpleN, simpleD)}.`, visual: equation(`${rawFraction(simpleN * otherFactor, simpleD * otherFactor)} = ?`, "Znajdź wspólny dzielnik licznika i mianownika.") }),
      question({ checker: "exactFraction", label: "Skracanie", prompt: "Skróć do najprostszej postaci: 18/24.", answer: "3/4", hint: "Licznik i mianownik dzielą się przez 6.", explanation: "18 : 6 = 3 i 24 : 6 = 4, więc 18/24 = 3/4.", visual: equation("18/24 : 6/6 = 3/4", "Dziel obie części ułamka przez tę samą liczbę.") }),
      choice("5/8", ["5/8", "6/9", "8/12"], { label: "Ułamek nieskracalny", prompt: "Który ułamek jest już nieskracalny?", hint: "Poszukaj ułamka, którego licznik i mianownik nie mają wspólnego dzielnika większego od 1.", explanation: "Liczby 5 i 8 nie mają wspólnego dzielnika większego od 1.", visual: equation("5/8   6/9   8/12", "Sprawdź wspólne dzielniki każdej pary.") }),
      choice("<", ["<", ">", "="], { label: "Porównanie przez rozszerzanie", prompt: "Wstaw znak: 2/5 ? 3/7", hint: "Sprowadź oba ułamki do mianownika 35.", explanation: "2/5 = 14/35, a 3/7 = 15/35, więc 2/5 < 3/7.", visual: equation("14/35  ?  15/35", "Po rozszerzeniu porównaj liczniki.") }),
      choice("nie", ["tak", "nie"], { label: "Analiza błędu", prompt: "Ktoś zapisał 3/5 = 6/5, mnożąc tylko licznik przez 2. Czy zachował wartość ułamka?", hint: "Przy rozszerzaniu to samo działanie wykonujemy na liczniku i mianowniku.", explanation: "Nie. Trzeba pomnożyć także mianownik: 3/5 = 6/10.", visual: equation("3/5 ≠ 6/5", "Jednostronna zmiana zmienia wartość ułamka.") }),
      question({ label: "Brakująca liczba", prompt: `${rawFraction(numerator, denominator)} = ${rawFraction(numerator * factor, denominator * factor)}. Przez jaką liczbę rozszerzono ułamek?`, answer: factor, hint: "Podziel nowy licznik przez stary licznik.", explanation: `${numerator * factor} : ${numerator} = ${factor}.`, visual: equation(`${numerator} · ? = ${numerator * factor}`, "Ten sam mnożnik działa na mianownik.") })
    ];
  }

  function improperQuestions() {
    const denominator = pick([2, 3, 4, 5, 6, 8]), whole = rand(1, 6), remainder = rand(1, denominator - 1);
    const numerator = whole * denominator + remainder;
    const natural = rand(2, 8), targetDenominator = rand(2, 9);
    return [
      choice("niewłaściwy", ["właściwy", "niewłaściwy"], { label: "Rodzaje ułamków", prompt: `Czy ułamek ${rawFraction(numerator, denominator)} jest właściwy czy niewłaściwy?`, hint: "Porównaj licznik z mianownikiem.", explanation: `${numerator} > ${denominator}, więc ułamek jest niewłaściwy.`, visual: model("bar", numerator, denominator, "Zaznaczenie przekracza jedną całość.") }),
      choice(">", ["<", ">", "="], { label: "Porównanie z 1", prompt: `Wstaw znak: ${rawFraction(numerator, denominator)} ? 1`, hint: "Ułamek z licznikiem większym od mianownika jest większy od 1.", explanation: `${numerator} > ${denominator}, więc ${rawFraction(numerator, denominator)} > 1.`, visual: model("circle", numerator, denominator, "Pełne koło oznacza 1.") }),
      question({ checker: "mixed", label: "Wyłączanie całości", prompt: "Zapisz model jako liczbę mieszaną.", answer: mixed(numerator, denominator), hint: `Połącz każde ${denominator} części w jedną całość.`, explanation: `${rawFraction(numerator, denominator)} = ${mixed(numerator, denominator)}.`, visual: model("circle", numerator, denominator, "Grupuj równe części w pełne koła.") }),
      question({ checker: "mixed", label: "Ułamek na liczbę mieszaną", prompt: `Zamień ${rawFraction(numerator, denominator)} na liczbę mieszaną.`, answer: mixed(numerator, denominator), hint: `Podziel ${numerator} przez ${denominator}; iloraz to całości, a reszta to nowy licznik.`, explanation: `${numerator} : ${denominator} = ${whole} r ${remainder}, więc ${rawFraction(numerator, denominator)} = ${mixed(numerator, denominator)}.`, visual: equation(`${numerator} : ${denominator}`, "Iloraz daje całości, reszta daje część ułamkową.") }),
      question({ checker: "exactFraction", label: "Liczba mieszana na ułamek", prompt: `Zamień ${whole} ${rawFraction(remainder, denominator)} na ułamek niewłaściwy o mianowniku ${denominator}.`, answer: rawFraction(numerator, denominator), hint: `Pomnóż ${whole} przez ${denominator} i dodaj ${remainder}.`, explanation: `${whole} · ${denominator} + ${remainder} = ${numerator}, więc wynik to ${rawFraction(numerator, denominator)}.`, visual: model("bar", numerator, denominator, "Policz wszystkie części, także te w pełnych całościach.") }),
      question({ checker: "exactFraction", label: "Liczba naturalna jako ułamek", prompt: `Zapisz liczbę ${natural} jako ułamek o mianowniku ${targetDenominator}.`, answer: rawFraction(natural * targetDenominator, targetDenominator), hint: `Każda całość składa się z ${targetDenominator} takich części.`, explanation: `${natural} = ${rawFraction(natural * targetDenominator, targetDenominator)}.`, visual: equation(`${natural} = ?/${targetDenominator}`, "Pomnóż liczbę całości przez mianownik.") }),
      question({ checker: "exactFraction", label: "Jedność jako ułamek", prompt: `Zapisz 1 jako ułamek o mianowniku ${targetDenominator}.`, answer: rawFraction(targetDenominator, targetDenominator), hint: "Ułamek równy 1 ma licznik równy mianownikowi.", explanation: `1 = ${rawFraction(targetDenominator, targetDenominator)}.`, visual: model("bar", targetDenominator, targetDenominator, "Zaznaczona jest cała figura.") }),
      choice("=", ["<", ">", "="], { label: "Dwa zapisy", prompt: `Wstaw znak: ${rawFraction(numerator, denominator)} ? ${mixed(numerator, denominator)}`, hint: "Oba zapisy mogą oznaczać tę samą liczbę.", explanation: `${rawFraction(numerator, denominator)} i ${mixed(numerator, denominator)} to ta sama wartość.`, visual: equation(`${rawFraction(numerator, denominator)}  ?  ${mixed(numerator, denominator)}`, "Zamień jeden zapis na drugi.") }),
      question({ label: "Liczenie części", prompt: `Ile ćwiartek mieści się w ${natural} całościach?`, answer: natural * 4, hint: "Każda całość ma 4 ćwiartki.", explanation: `${natural} · 4 = ${natural * 4} ćwiartek.`, visual: model("circle", natural * 4, 4, "Każde koło zawiera cztery ćwiartki.") }),
      choice("właściwy", ["właściwy", "niewłaściwy"], { label: "Rodzaje ułamków", prompt: `Czy ułamek ${rawFraction(denominator - 1, denominator)} jest właściwy czy niewłaściwy?`, hint: "Ułamek właściwy ma licznik mniejszy od mianownika.", explanation: `${denominator - 1} < ${denominator}, więc jest to ułamek właściwy.`, visual: model("bar", denominator - 1, denominator, "Zaznaczenie jest mniejsze od jednej całości.") })
    ];
  }

  function quotientQuestions() {
    const people = rand(3, 8), items = rand(1, people - 1);
    const divisor = rand(2, 8), whole = rand(1, 6), remainder = rand(1, divisor - 1), dividend = whole * divisor + remainder;
    const exactWhole = rand(2, 7), exactDivisor = rand(2, 8), exactDividend = exactWhole * exactDivisor;
    return [
      question({ checker: "fraction", label: "Sprawiedliwy podział", prompt: `${items} jednakowe tabliczki podzielono równo między ${people} osób. Jaką część tabliczki dostanie każda osoba?`, answer: rawFraction(items, people), hint: "Liczba dzielonych całości jest licznikiem, a liczba osób mianownikiem.", explanation: `${items} : ${people} = ${fraction(items, people)}.`, visual: equation(`${items} : ${people} = ?`, "Każda osoba dostaje taką samą porcję.") }),
      choice(`${items} : ${people}`, [`${items} : ${people}`, `${people} : ${items}`, `${items + people} : ${people}`], { label: "Ułamek i iloraz", prompt: `Który iloraz jest równy ułamkowi ${rawFraction(items, people)}?`, hint: "Kreska ułamkowa zastępuje znak dzielenia.", explanation: `${rawFraction(items, people)} = ${items} : ${people}.`, visual: equation(`${rawFraction(items, people)} = ?`, "Licznik jest dzielną, a mianownik dzielnikiem.") }),
      question({ checker: "exactFraction", label: "Iloraz jako ułamek", prompt: `Zapisz iloraz ${dividend} : ${divisor} w postaci ułamka.`, answer: rawFraction(dividend, divisor), hint: "Dzielną wpisz w liczniku, a dzielnik w mianowniku.", explanation: `${dividend} : ${divisor} = ${rawFraction(dividend, divisor)}.`, visual: { type: "division", dividend, divisor, caption: "Zastąp znak dzielenia kreską ułamkową." } }),
      question({ checker: "exactFraction", label: "Skracanie ilorazu", prompt: "Zapisz 6 : 8 jako ułamek nieskracalny.", answer: "3/4", hint: "Najpierw zapisz 6/8, potem podziel licznik i mianownik przez 2.", explanation: "6 : 8 = 6/8 = 3/4.", visual: equation("6 : 8 = 6/8 = ?", "Skróć wynik dzielenia.") }),
      question({ checker: "mixed", label: "Dzielenie z resztą", prompt: `Zamień ${rawFraction(dividend, divisor)} na liczbę mieszaną.`, answer: mixed(dividend, divisor), hint: `Wykonaj dzielenie ${dividend} : ${divisor} z resztą.`, explanation: `${dividend} : ${divisor} = ${whole} r ${remainder}, więc wynik to ${mixed(dividend, divisor)}.`, visual: { type: "division", dividend, divisor, caption: "Iloraz to całości, a reszta tworzy licznik." } }),
      question({ label: "Dokładne dzielenie", prompt: `Oblicz ułamek ${rawFraction(exactDividend, exactDivisor)}. Podaj liczbę naturalną.`, answer: exactWhole, hint: `Podziel ${exactDividend} przez ${exactDivisor}.`, explanation: `${exactDividend} : ${exactDivisor} = ${exactWhole}.`, visual: { type: "division", dividend: exactDividend, divisor: exactDivisor, caption: "Reszta z dzielenia wynosi zero." } }),
      question({ checker: "fraction", label: "Porcja jednej osoby", prompt: `Pięć jednakowych metrów wstążki rozdzielono równo między ${people} osób. Ile metra dostanie każda?`, answer: rawFraction(5, people), hint: "Podziel 5 metrów przez liczbę osób.", explanation: `5 : ${people} = ${fraction(5, people)} m.`, visual: equation(`5 m : ${people}`, "Każda porcja ma tę samą długość.") }),
      question({ label: "Odwrócone zadanie", prompt: "Każda z 4 osób dostała po 3/4 bułki. Ile całych bułek rozdzielono?", answer: 3, hint: "Cztery porcje po 3/4 to 12/4.", explanation: "4 · 3/4 = 12/4 = 3 bułki.", visual: model("circle", 12, 4, "Połącz ćwiartki w całe bułki.") }),
      choice("reszta staje się licznikiem części ułamkowej", ["reszta staje się licznikiem części ułamkowej", "reszta staje się mianownikiem", "resztę pomijamy"], { label: "Znaczenie reszty", prompt: "Co robimy z resztą przy zamianie ułamka niewłaściwego na liczbę mieszaną?", hint: "Dzielnik pozostaje rozmiarem jednej części.", explanation: "Reszta jest licznikiem części ułamkowej, a dzielnik jej mianownikiem.", visual: equation(`${dividend} : ${divisor} = ${whole} r ${remainder}`, "Reszta opisuje niepełną całość.") }),
      question({ checker: "mixed", label: "Podział paczek", prompt: `${dividend} litrów soku rozlano równo do ${divisor} dzbanków. Ile litra trafiło do każdego dzbanka?`, answer: mixed(dividend, divisor), hint: `Oblicz ${dividend} : ${divisor} i zapisz wynik jako liczbę mieszaną.`, explanation: `Do każdego dzbanka trafiło ${mixed(dividend, divisor)} l.`, visual: equation(`${dividend} l : ${divisor}`, "Rozdziel całą ilość na równe porcje.") })
    ];
  }

  function additionQuestions() {
    const d = pick([5, 7, 8, 9, 10, 12]), a = rand(1, Math.floor(d / 2)), b = rand(1, d - a - 1);
    const carryA = rand(Math.ceil(d / 2), d - 1), carryB = rand(d - carryA + 1, d - 1);
    const wholeA = rand(1, 6), wholeB = rand(1, 5);
    return [
      question({ checker: "fraction", label: "Wspólny mianownik", prompt: `Oblicz ${rawFraction(a, d)} + ${rawFraction(b, d)}.`, answer: fraction(a + b, d), hint: "Dodaj liczniki, a mianownik pozostaw bez zmiany.", explanation: `${rawFraction(a, d)} + ${rawFraction(b, d)} = ${rawFraction(a + b, d)}${fraction(a + b, d) === rawFraction(a + b, d) ? "" : ` = ${fraction(a + b, d)}`}.`, visual: equation(`${rawFraction(a, d)} + ${rawFraction(b, d)} = ?`, "Części mają ten sam rozmiar.") }),
      question({ label: "Domknięcie całości", prompt: `Oblicz ${rawFraction(a, d)} + ${rawFraction(d - a, d)}. Podaj liczbę naturalną.`, answer: 1, hint: "Liczniki razem dają mianownik.", explanation: `${a} + ${d - a} = ${d}, więc ${rawFraction(d, d)} = 1.`, visual: model("bar", d, d, "Oba składniki razem wypełniają całość.") }),
      question({ checker: "mixed", label: "Suma większa od 1", prompt: `Oblicz ${rawFraction(carryA, d)} + ${rawFraction(carryB, d)}. Wynik zapisz jako liczbę mieszaną.`, answer: mixed(carryA + carryB, d), hint: "Dodaj liczniki, potem wyłącz całość z ułamka niewłaściwego.", explanation: `${rawFraction(carryA + carryB, d)} = ${mixed(carryA + carryB, d)}.`, visual: model("bar", carryA + carryB, d, "Po dodaniu połącz pełny pasek.") }),
      question({ checker: "mixed", label: "Liczba mieszana i ułamek", prompt: `Oblicz ${wholeA} ${rawFraction(a, d)} + ${rawFraction(b, d)}.`, answer: mixed(wholeA * d + a + b, d), hint: "Część całkowitą zachowaj, a liczniki części ułamkowych dodaj.", explanation: `${wholeA} ${rawFraction(a, d)} + ${rawFraction(b, d)} = ${mixed(wholeA * d + a + b, d)}.`, visual: equation(`${wholeA} ${rawFraction(a, d)} + ${rawFraction(b, d)}`, "Dodaj części ułamkowe o wspólnym mianowniku.") }),
      question({ checker: "mixed", label: "Dwie liczby mieszane", prompt: `Oblicz ${wholeA} ${rawFraction(carryA, d)} + ${wholeB} ${rawFraction(carryB, d)}.`, answer: mixed((wholeA + wholeB) * d + carryA + carryB, d), hint: "Dodaj osobno całości i części ułamkowe, a potem wyłącz nową całość.", explanation: `Całości: ${wholeA} + ${wholeB}. Części: ${rawFraction(carryA + carryB, d)}. Razem ${mixed((wholeA + wholeB) * d + carryA + carryB, d)}.`, visual: equation(`${wholeA} ${rawFraction(carryA, d)} + ${wholeB} ${rawFraction(carryB, d)}`, "Najpierw grupuj podobne części.") }),
      question({ checker: "mixed", label: "Sprytne grupowanie", prompt: `Oblicz ${wholeA} ${rawFraction(a, d)} + ${rawFraction(d - a, d)} + ${rawFraction(b, d)}.`, answer: mixed((wholeA + 1) * d + b, d), hint: `${rawFraction(a, d)} i ${rawFraction(d - a, d)} tworzą razem 1.`, explanation: `Dwa pierwsze ułamki tworzą pełną całość, więc wynik to ${mixed((wholeA + 1) * d + b, d)}.`, visual: equation(`${rawFraction(a, d)} + ${rawFraction(d - a, d)} = 1`, "Najpierw znajdź parę domykającą całość.") }),
      question({ checker: "fraction", label: "Brakujący składnik", prompt: `Jakiego ułamka brakuje? ${rawFraction(a, d)} + ? = ${rawFraction(a + b, d)}`, answer: rawFraction(b, d), hint: "Odejmij liczniki prawej strony i znanego składnika.", explanation: `${a + b} − ${a} = ${b}, więc brakuje ${rawFraction(b, d)}.`, visual: equation(`${rawFraction(a, d)} + ? = ${rawFraction(a + b, d)}`, "Mianownik pozostaje wspólny.") }),
      question({ checker: "fraction", label: "Zadanie tekstowe", prompt: `Na początku ścieżki ułożono ${rawFraction(a, d)} km płyt, a potem jeszcze ${rawFraction(b, d)} km. Ile kilometrów ułożono razem?`, answer: fraction(a + b, d), hint: "Dodaj liczniki, bo części kilometra mają wspólny mianownik.", explanation: `Razem ułożono ${fraction(a + b, d)} km.`, visual: model("bar", a + b, d, "Oba odcinki tworzą jedną trasę.") }),
      choice("nie", ["tak", "nie"], { label: "Analiza błędu", prompt: `Ktoś obliczył ${rawFraction(a, d)} + ${rawFraction(b, d)} = ${rawFraction(a + b, d + d)}. Czy dodał poprawnie?`, hint: "Przy wspólnym mianowniku nie zmieniamy rozmiaru części.", explanation: `Nie. Poprawny mianownik pozostaje równy ${d}.`, visual: equation(`${rawFraction(a, d)} + ${rawFraction(b, d)} ≠ ${rawFraction(a + b, d + d)}`, "Nie dodawaj mianowników.") }),
      question({ checker: "fraction", label: "Model sumy", prompt: "Jaki ułamek przedstawia całe zaznaczenie?", answer: fraction(a + b, d), hint: "Zlicz wszystkie zaznaczone części o tym samym rozmiarze.", explanation: `${a} + ${b} = ${a + b}, więc zaznaczono ${fraction(a + b, d)}.`, visual: model("grid", a + b, d, "Zaznaczenie powstało z dwóch grup pól.", { rows: 1, columns: d }) })
    ];
  }

  function subtractionQuestions() {
    const d = pick([5, 7, 8, 9, 10, 12]), a = rand(3, d - 1), b = rand(1, a - 1);
    const wholeA = rand(3, 8), wholeB = rand(1, wholeA - 2);
    const smallPart = rand(1, Math.floor(d / 2)), largePart = rand(smallPart + 1, d - 1);
    return [
      question({ checker: "fraction", label: "Wspólny mianownik", prompt: `Oblicz ${rawFraction(a, d)} − ${rawFraction(b, d)}.`, answer: fraction(a - b, d), hint: "Odejmij liczniki, a mianownik pozostaw bez zmiany.", explanation: `${rawFraction(a, d)} − ${rawFraction(b, d)} = ${fraction(a - b, d)}.`, visual: model("bar", a - b, d, "Po zabraniu pozostają zaznaczone części.") }),
      question({ checker: "fraction", label: "Całość minus ułamek", prompt: `Oblicz 1 − ${rawFraction(b, d)}.`, answer: rawFraction(d - b, d), hint: `Zapisz 1 jako ${rawFraction(d, d)}.`, explanation: `${rawFraction(d, d)} − ${rawFraction(b, d)} = ${rawFraction(d - b, d)}.`, visual: model("bar", d - b, d, "Jedna całość ma wszystkie części zaznaczone przed odejmowaniem.") }),
      question({ checker: "mixed", label: "Bez zamiany całości", prompt: `Oblicz ${wholeA} ${rawFraction(a, d)} − ${wholeB} ${rawFraction(b, d)}.`, answer: mixed((wholeA - wholeB) * d + a - b, d), hint: "Odejmij osobno całości i liczniki; część ułamkowa odjemnej jest wystarczająco duża.", explanation: `${wholeA} − ${wholeB} = ${wholeA - wholeB}, a ${a} − ${b} = ${a - b}. Wynik to ${mixed((wholeA - wholeB) * d + a - b, d)}.`, visual: equation(`${wholeA} ${rawFraction(a, d)} − ${wholeB} ${rawFraction(b, d)}`, "Tutaj nie trzeba zamieniać jednej całości.") }),
      question({ checker: "mixed", label: "Zamiana jednej całości", prompt: `Oblicz ${wholeA} ${rawFraction(smallPart, d)} − ${wholeB} ${rawFraction(largePart, d)}.`, answer: mixed((wholeA - wholeB) * d + smallPart - largePart, d), hint: `Zamień jedną całość z ${wholeA} na ${rawFraction(d, d)} i dodaj ją do ${rawFraction(smallPart, d)}.`, explanation: `${wholeA} ${rawFraction(smallPart, d)} = ${wholeA - 1} ${rawFraction(d + smallPart, d)}. Po odjęciu wynik to ${mixed((wholeA - wholeB) * d + smallPart - largePart, d)}.`, visual: equation(`${wholeA} ${rawFraction(smallPart, d)} = ${wholeA - 1} ${rawFraction(d + smallPart, d)}`, "Jedna całość dostarcza części do odejmowania.") }),
      question({ checker: "mixed", label: "Liczba naturalna minus mieszana", prompt: `Oblicz ${wholeA} − ${wholeB} ${rawFraction(b, d)}.`, answer: mixed((wholeA - wholeB) * d - b, d), hint: `Zapisz ${wholeA} jako ${wholeA - 1} ${rawFraction(d, d)}.`, explanation: `${wholeA} = ${wholeA - 1} ${rawFraction(d, d)}, więc wynik to ${mixed((wholeA - wholeB) * d - b, d)}.`, visual: equation(`${wholeA - 1} ${rawFraction(d, d)} − ${wholeB} ${rawFraction(b, d)}`, "Zamień jedną całość na części.") }),
      question({ checker: "fraction", label: "Brakująca liczba", prompt: `Uzupełnij: ? + ${rawFraction(b, d)} = ${rawFraction(a, d)}`, answer: fraction(a - b, d), hint: "Od sumy odejmij znany składnik.", explanation: `${rawFraction(a, d)} − ${rawFraction(b, d)} = ${fraction(a - b, d)}.`, visual: equation(`? + ${rawFraction(b, d)} = ${rawFraction(a, d)}`, "Użyj odejmowania jako działania odwrotnego.") }),
      question({ checker: "mixed", label: "Pozostała droga", prompt: `Trasa ma ${wholeA} km. Wędrowcy przeszli ${wholeB} ${rawFraction(b, d)} km. Ile kilometrów zostało?`, answer: mixed((wholeA - wholeB) * d - b, d), hint: "Od długości całej trasy odejmij przebytą drogę; zamień jedną całość na części.", explanation: `Pozostało ${mixed((wholeA - wholeB) * d - b, d)} km.`, visual: equation(`${wholeA} − ${wholeB} ${rawFraction(b, d)}`, "Szukamy części trasy, która pozostała.") }),
      question({ checker: "fraction", label: "Do pełnego naczynia", prompt: `W zbiorniku jest ${rawFraction(a, d)} jego pojemności. Jakiej części brakuje do pełna?`, answer: rawFraction(d - a, d), hint: `Pełny zbiornik to ${rawFraction(d, d)}.`, explanation: `${rawFraction(d, d)} − ${rawFraction(a, d)} = ${rawFraction(d - a, d)}.`, visual: model("bar", a, d, "Jasna część pokazuje brak do pełna.") }),
      choice("nie", ["tak", "nie"], { label: "Analiza błędu", prompt: `Ktoś zapisał ${wholeA} ${rawFraction(smallPart, d)} − ${wholeB} ${rawFraction(largePart, d)} = ${wholeA - wholeB} ${rawFraction(largePart - smallPart, d)}. Czy to poprawne?`, hint: "Nie można odjąć większego licznika od mniejszego bez zamiany jednej całości.", explanation: "Nie. Trzeba zmniejszyć część całkowitą odjemnej o 1 i dodać cały mianownik do jej licznika.", visual: equation(`${rawFraction(smallPart, d)} < ${rawFraction(largePart, d)}`, "Najpierw przygotuj część ułamkową do odejmowania.") }),
      question({ checker: "fraction", label: "Model różnicy", prompt: `Z ${rawFraction(a, d)} paska usunięto ${rawFraction(b, d)}. Jaka część została?`, answer: fraction(a - b, d), hint: "Policz części, które pozostały po usunięciu.", explanation: `Zostało ${a} − ${b} = ${a - b} części, czyli ${fraction(a - b, d)}.`, visual: model("grid", a - b, d, "Model pokazuje część pozostałą.", { rows: 1, columns: d }) })
    ];
  }

  function puzzleQuestions() {
    const d = pick([5, 7, 8, 9, 10]), a = rand(1, Math.floor((d - 1) / 2)), b = rand(a + 1, d - 1);
    const factor = rand(2, 5), whole = rand(1, 4), remainder = rand(1, d - 1);
    return [
      choice("dodano mianowniki", ["dodano mianowniki", "pomylono znak działania", "wynik powinien być ujemny"], { label: "Pogotowie rachunkowe", prompt: `W rozwiązaniu zapisano ${rawFraction(a, d)} + ${rawFraction(b, d)} = ${rawFraction(a + b, d + d)}. Jaki popełniono błąd?`, hint: "Części obu ułamków mają już ten sam rozmiar.", explanation: "Przy jednakowych mianownikach dodajemy tylko liczniki.", visual: equation(`${rawFraction(a, d)} + ${rawFraction(b, d)} ≠ ${rawFraction(a + b, d + d)}`, "Napraw niepoprawny krok.") }),
      choice("pomnożono tylko licznik", ["pomnożono tylko licznik", "pomnożono obie części", "skrócono ułamek"], { label: "Maszyna równoważności", prompt: `Ktoś twierdzi, że ${rawFraction(a, d)} = ${rawFraction(a * factor, d)}. Co zrobił źle?`, hint: "Rozszerzanie wymaga tego samego mnożnika w liczniku i mianowniku.", explanation: `Pomnożono tylko licznik; poprawny zapis to ${rawFraction(a * factor, d * factor)}.`, visual: equation(`${rawFraction(a, d)} → ${rawFraction(a * factor, d)}`, "Znajdź brakującą zmianę.") }),
      choice(`${rawFraction(a, d)}, ${rawFraction(a * factor, d * factor)}, ${a} : ${d}`, [`${rawFraction(a, d)}, ${rawFraction(a * factor, d * factor)}, ${a} : ${d}`, `${rawFraction(a, d)}, ${rawFraction(a + factor, d + factor)}, ${rawFraction(b, d)}`], { label: "Trzy karty", prompt: "Który zestaw kart przedstawia tę samą wartość?", hint: "Sprawdź, czy drugi ułamek powstał przez rozszerzenie pierwszego.", explanation: `${rawFraction(a, d)} = ${rawFraction(a * factor, d * factor)} = ${a} : ${d}.`, visual: equation(`${rawFraction(a, d)}   ${rawFraction(a * factor, d * factor)}   ${a} : ${d}`, "Dopasuj równoważne zapisy.") }),
      question({ label: "Kod ułamkowy", prompt: `${rawFraction(a, d)} = ${rawFraction(a * factor, d * factor)}. Jaka cyfra jest wspólnym mnożnikiem kodu?`, answer: factor, hint: "Podziel nowy licznik przez stary.", explanation: `${a * factor} : ${a} = ${factor}.`, visual: equation(`${a} · □ = ${a * factor}`, "Ten sam kod działa na mianownik.") }),
      question({ checker: "fraction", label: "Dwustopniowy spacer", prompt: `Pionek stoi w ${rawFraction(a, d)}, idzie o ${rawFraction(b, d)} w prawo, a potem o ${rawFraction(a, d)} w lewo. Gdzie stanie?`, answer: rawFraction(b, d), hint: `Ruch o ${rawFraction(a, d)} w prawo i taki sam ruch w lewo wzajemnie się znoszą.`, explanation: `Zostaje położenie ${rawFraction(b, d)}.`, visual: numberline(d, 0, d * 2, [a, b], "Znajdź końcowy punkt po dwóch ruchach.", { showMarkedValues: true }) }),
      choice("więcej pozostało", ["więcej pozostało", "więcej zużyto", "zużyto i zostało tyle samo"], { label: "Zużyto i pozostało", prompt: `Z rolki zużyto ${rawFraction(a, d)} długości. Co jest większe: część zużyta czy pozostała?`, hint: `Pozostało ${rawFraction(d - a, d)}. Porównaj liczniki.`, explanation: `${d - a} > ${a}, więc więcej rolki pozostało.`, visual: model("bar", a, d, "Zaznaczenie pokazuje część zużytą.") }),
      choice(`${rawFraction(a, d)}, ${rawFraction(b, d)}, ${rawFraction(d + a, d)}`, [`${rawFraction(a, d)}, ${rawFraction(b, d)}, ${rawFraction(d + a, d)}`, `${rawFraction(d + a, d)}, ${rawFraction(b, d)}, ${rawFraction(a, d)}`], { label: "Kod porządku", prompt: "Który zapis ustawia trzy liczby od najmniejszej do największej?", hint: "Wszystkie mają ten sam mianownik, więc porównaj liczniki.", explanation: `${a} < ${b} < ${d + a}, więc pierwszy zapis jest rosnący.`, visual: numberline(d, 0, d * 2, [a, b, d + a], "Kropki leżą coraz dalej na prawo.", { showMarkedValues: true }) }),
      question({ checker: "fraction", label: "Dwa działania", prompt: `Oblicz ${rawFraction(b, d)} + ${rawFraction(a, d)} − ${rawFraction(a, d)}.`, answer: rawFraction(b, d), hint: "Dodanie i odjęcie tego samego ułamka nie zmienia wyniku.", explanation: `${rawFraction(a, d)} − ${rawFraction(a, d)} = 0, więc zostaje ${rawFraction(b, d)}.`, visual: equation(`${rawFraction(b, d)} + ${rawFraction(a, d)} − ${rawFraction(a, d)}`, "Szukaj działań, które się znoszą.") }),
      choice(rawFraction(a * factor, d * factor), [rawFraction(a * factor, d * factor), rawFraction(a + factor, d + factor), rawFraction(a, d * factor)], { label: "Wystarczająca wskazówka", prompt: `Szukany ułamek jest równy ${rawFraction(a, d)} i ma mianownik ${d * factor}. Który to ułamek?`, hint: `Mianownik zwiększył się ${factor} razy.`, explanation: `Licznik również zwiększamy ${factor} razy, więc wynik to ${rawFraction(a * factor, d * factor)}.`, visual: equation(`${rawFraction(a, d)} = ?/${d * factor}`, "Dwie wskazówki wyznaczają jeden zapis.") }),
      question({ checker: "mixed", label: "Odszyfruj liczbę", prompt: `Liczba mieszana ma część całkowitą ${whole}. Jej zapis niewłaściwy to ${rawFraction(whole * d + remainder, d)}. Jaka to liczba mieszana?`, answer: mixed(whole * d + remainder, d), hint: "Podziel licznik przez mianownik i odczytaj resztę.", explanation: `${rawFraction(whole * d + remainder, d)} = ${mixed(whole * d + remainder, d)}.`, visual: model("bar", whole * d + remainder, d, "Pełne paski ukrywają część całkowitą.") })
    ];
  }

  const builders = {
    "czesci-calosci": partWholeQuestions,
    "liczby-mieszane": mixedNumberQuestions,
    "os-ulamkowa": numberlineQuestions,
    porownywanie: comparisonQuestions,
    "rozszerzanie-skracanie": equivalenceQuestions,
    "ulamki-niewlasciwe": improperQuestions,
    "ulamek-jako-iloraz": quotientQuestions,
    dodawanie: additionQuestions,
    odejmowanie: subtractionQuestions,
    "ulamkowe-zagadki": puzzleQuestions
  };

  function buildQuestions(mode) {
    if (builders[mode]) return builders[mode]().map((item) => ({ ...item, routeId: mode }));
    return shuffle(Object.entries(builders).map(([routeId, build]) => ({ ...pick(build()), routeId })));
  }

  MathTownGame.start({
    chapterId: "chapter5",
    chapterTitle: "Ułamki zwykłe",
    routeLabels,
    buildQuestions,
    answerCheckers
  });
})();
