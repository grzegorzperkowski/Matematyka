(() => {
  "use strict";

  const routeLabels = {
    "zapis-dziesietny": "Pracownia przecinka",
    "os-dziesietna": "Aleja liczb dziesiętnych",
    dlugosc: "Stacja długości",
    masa: "Waga miejska",
    "rowne-zapisy": "Galeria równych zapisów",
    porownywanie: "Wieża porównań",
    dodawanie: "Kasa sum",
    odejmowanie: "Kasa różnic",
    zakupy: "Rynek zakupów",
    "dziesietne-zagadki": "Klub tropicieli przecinka",
    mix: "Wielki dziesiętny obchód"
  };

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
  const pow10 = (places) => 10 ** places;

  function decimal(units, places, fixed = false) {
    const scale = pow10(places);
    const whole = Math.floor(units / scale);
    let fraction = String(units % scale).padStart(places, "0");
    if (!fixed) fraction = fraction.replace(/0+$/, "");
    return fraction ? `${whole},${fraction}` : String(whole);
  }

  function decimalNumber(value) {
    const text = String(value).trim();
    if (!/^\d+(?:[,.]\d+)?$/.test(text)) return null;
    const number = Number(text.replace(",", "."));
    return Number.isFinite(number) ? number : null;
  }

  const question = (data) => ({ kind: "input", label: "Ułamki dziesiętne", visual: null, ...data });
  const equation = (expression, caption) => ({ type: "equation", expression, caption });
  const column = (top, bottom, operator, caption) => ({ type: "column", top, bottom, operator, caption });
  const numberline = (denominator, minNumerator, maxNumerator, markedNumerators, caption, extra = {}) => ({
    type: "fraction-numberline",
    denominator,
    minNumerator,
    maxNumerator,
    markedNumerators,
    labelEveryWhole: true,
    caption,
    ...extra
  });
  const choice = (answer, options, data) => question({
    ...data,
    kind: "choice",
    answer,
    options: [...new Set(options)].map((value) => ({ value, label: String(value) }))
  });
  const decimalQuestion = (data) => question({ checker: "decimal", ...data });
  const calculation = (leftUnits, rightUnits, places, operator, data) => decimalQuestion({
    ...data,
    answer: decimal(operator === "+" ? leftUnits + rightUnits : leftUnits - rightUnits, places),
    calculation: { leftUnits, rightUnits, places, operator }
  });

  const answerCheckers = {
    decimal(raw, answer) {
      const entered = decimalNumber(raw);
      const expected = decimalNumber(answer);
      return entered !== null && expected !== null && entered === expected;
    }
  };

  function notationQuestions() {
    const tenths = rand(1, 9);
    const hundredths = rand(11, 98);
    const thousandths = rand(101, 998);
    const whole = rand(1, 12);
    const mixedHundredths = rand(1, 99);
    const placeDigits = [rand(1, 9), rand(0, 9), rand(1, 9)];
    const placeValue = `${rand(10, 49)},${placeDigits.join("")}`;
    const moneyGrosze = rand(1, 99);

    return [
      decimalQuestion({ label: "Dziesiąte", prompt: `Zapisz ${tenths}/10 bez kreski ułamkowej.`, answer: decimal(tenths, 1), hint: "Mianownik 10 oznacza jedno miejsce po przecinku.", explanation: `${tenths}/10 = ${decimal(tenths, 1)}.`, visual: equation(`${tenths}/10 = ?`, "Jedno zero w mianowniku — jedno miejsce po przecinku.") }),
      decimalQuestion({ label: "Setne", prompt: `Zapisz ${hundredths}/100 jako ułamek dziesiętny.`, answer: decimal(hundredths, 2), hint: "Mianownik 100 oznacza dwa miejsca po przecinku.", explanation: `${hundredths}/100 = ${decimal(hundredths, 2, true)}.`, visual: equation(`${hundredths}/100 = ?`, "Dwa zera w mianowniku — dwa miejsca po przecinku.") }),
      decimalQuestion({ label: "Tysięczne", prompt: `Zapisz ${thousandths}/1000 jako ułamek dziesiętny.`, answer: decimal(thousandths, 3), hint: "Mianownik 1000 oznacza trzy miejsca po przecinku.", explanation: `${thousandths}/1000 = ${decimal(thousandths, 3, true)}.`, visual: equation(`${thousandths}/1000 = ?`, "Trzy zera w mianowniku — trzy miejsca po przecinku.") }),
      decimalQuestion({ label: "Liczba mieszana", prompt: `Zapisz dziesiętnie: ${whole} i ${mixedHundredths}/100.`, answer: decimal(whole * 100 + mixedHundredths, 2), hint: "Całości zapisz przed przecinkiem, a setne na dwóch miejscach po nim.", explanation: `${whole} i ${mixedHundredths}/100 = ${decimal(whole * 100 + mixedHundredths, 2, true)}.`, visual: equation(`${whole} + ${mixedHundredths}/100 = ?`, "Przecinek oddziela całości od części ułamkowej.") }),
      question({ label: "Cyfra części dziesiątych", prompt: `Jaka jest cyfra części dziesiątych w liczbie ${placeValue}?`, answer: placeDigits[0], hint: "To pierwsza cyfra po przecinku.", explanation: `W liczbie ${placeValue} pierwszą cyfrą po przecinku jest ${placeDigits[0]}.`, visual: equation(placeValue, "Spójrz na pierwsze miejsce po przecinku.") }),
      question({ label: "Cyfra części setnych", prompt: `Jaka jest cyfra części setnych w liczbie ${placeValue}?`, answer: placeDigits[1], hint: "To druga cyfra po przecinku.", explanation: `W liczbie ${placeValue} cyfrą części setnych jest ${placeDigits[1]}.`, visual: equation(placeValue, "Spójrz na drugie miejsce po przecinku.") }),
      question({ label: "Cyfra części tysięcznych", prompt: `Jaka jest cyfra części tysięcznych w liczbie ${placeValue}?`, answer: placeDigits[2], hint: "To trzecia cyfra po przecinku.", explanation: `W liczbie ${placeValue} cyfrą części tysięcznych jest ${placeDigits[2]}.`, visual: equation(placeValue, "Spójrz na trzecie miejsce po przecinku.") }),
      choice("setnych", ["dziesiątych", "setnych", "tysięcznych"], { label: "Wartość miejsca", prompt: `Jak nazywa się miejsce cyfry ${placeDigits[1]} w liczbie ${placeValue}?`, hint: "Policz miejsca po przecinku od lewej.", explanation: "Drugie miejsce po przecinku to części setne.", visual: equation("dziesiąte | setne | tysięczne", "Każdy krok w prawo oznacza dziesięć razy mniejszą część.") }),
      decimalQuestion({ label: "Złote i grosze", prompt: `${moneyGrosze} gr — jaka to część złotego? Zapisz w złotych.`, answer: decimal(moneyGrosze, 2), hint: "1 zł = 100 gr, więc grosze zajmują dwa miejsca po przecinku.", explanation: `${moneyGrosze} gr = ${decimal(moneyGrosze, 2, true)} zł.`, visual: equation(`${moneyGrosze}/100 zł = ?`, "Grosz jest setną częścią złotego.") }),
      choice(decimal(whole * 1000 + tenths * 100 + placeDigits[2], 3, true), [decimal(whole * 1000 + tenths * 100 + placeDigits[2], 3, true), decimal(whole * 1000 + tenths * 10 + placeDigits[2], 3, true), decimal(whole * 1000 + tenths + placeDigits[2] * 100, 3, true)], { label: "Budowanie liczby", prompt: `Wybierz liczbę z ${whole} całościami, ${tenths} częściami dziesiątymi, 0 setnych i ${placeDigits[2]} tysięcznymi.`, hint: "Po przecinku ustaw kolejno: dziesiąte, setne, tysięczne.", explanation: `Poprawny zapis to ${decimal(whole * 1000 + tenths * 100 + placeDigits[2], 3, true)}.`, visual: equation(`${whole} | ${tenths} | 0 | ${placeDigits[2]}`, "Kolejne pola oznaczają całości, dziesiąte, setne i tysięczne.") })
    ];
  }

  function numberlineQuestions() {
    const tenth = rand(1, 9);
    const whole = rand(1, 5);
    const beyond = whole * 10 + rand(1, 9);
    const hundredth = rand(81, 99);
    const start = rand(1, 5);
    const jump = rand(1, 4);
    const low = rand(21, 35);
    const high = low + rand(2, 5);
    const target = rand(2, 8);

    return [
      decimalQuestion({ label: "Odczyt z osi", prompt: "Jaką liczbę dziesiętną wskazuje punkt A?", answer: decimal(tenth, 1), hint: "Odcinek od 0 do 1 podzielono na 10 równych części.", explanation: `${tenth} kroków po 0,1 daje ${decimal(tenth, 1)}.`, visual: numberline(10, 0, 10, [tenth], "Każdy mały krok ma wartość 0,1.", { unknownLabel: "A" }) }),
      decimalQuestion({ label: "Całości i dziesiąte", prompt: "Jaką liczbę wskazuje punkt B?", answer: decimal(beyond, 1), hint: `Punkt leży za liczbą ${whole}; dolicz dziesiąte części.`, explanation: `Punkt B wskazuje ${decimal(beyond, 1)}.`, visual: numberline(10, whole * 10, (whole + 1) * 10, [beyond], "Jednostkę podzielono na dziesięć części.", { unknownLabel: "B" }) }),
      decimalQuestion({ label: "Setne na osi", prompt: "Jaką liczbę wskazuje punkt C?", answer: decimal(hundredth, 2), hint: "Każdy krok ma wartość 0,01.", explanation: `${hundredth} setnych to ${decimal(hundredth, 2, true)}.`, visual: numberline(100, 80, 100, [hundredth], "Odcinek od 0,80 do 1 podzielono na setne.", { unknownLabel: "C" }) }),
      decimalQuestion({ label: "Ruch w prawo", prompt: `Pionek stoi w ${decimal(start, 1)} i przesuwa się o ${decimal(jump, 1)} w prawo. Gdzie stanie?`, answer: decimal(start + jump, 1), hint: "Ruch w prawo zwiększa liczbę.", explanation: `${decimal(start, 1)} + ${decimal(jump, 1)} = ${decimal(start + jump, 1)}.`, visual: numberline(10, 0, 10, [start, start + jump], "Pierwsza kropka to start, druga — koniec ruchu.", { showMarkedValues: true }) }),
      decimalQuestion({ label: "Odległość punktów", prompt: `Jaka jest odległość między ${decimal(low, 1)} i ${decimal(high, 1)}?`, answer: decimal(high - low, 1), hint: "Od większej liczby odejmij mniejszą.", explanation: `${decimal(high, 1)} − ${decimal(low, 1)} = ${decimal(high - low, 1)}.`, visual: numberline(10, 20, 40, [low, high], "Odległość to liczba małych kroków między punktami.", { showMarkedValues: true }) }),
      choice("w prawo", ["w prawo", "w lewo", "pozostaje w miejscu"], { label: "Kierunek wzrostu", prompt: "W którą stronę przesuwa się punkt, gdy wartość liczby rośnie?", hint: "Spójrz na kolejność liczb na osi.", explanation: "Liczby rosną na osi w prawo.", visual: numberline(10, 0, 10, [2, 8], "Drugi punkt ma większą wartość.", { showMarkedValues: true }) }),
      choice(decimal(target, 1), [decimal(target - 1, 1), decimal(target, 1), decimal(target + 1, 1)], { label: "Sąsiednie dziesiąte", prompt: `Która liczba leży dokładnie między ${decimal(target - 1, 1)} i ${decimal(target + 1, 1)}?`, hint: "Szukaj środkowego kroku.", explanation: `Między nimi leży ${decimal(target, 1)}.`, visual: numberline(10, 0, 10, [target - 1, target, target + 1], "Trzy kolejne punkty są od siebie jednakowo odległe.", { showMarkedValues: true }) }),
      choice(decimal(tenth, 1), [decimal(tenth, 1), decimal(tenth + 1, 1)], { label: "Bliżej zera", prompt: "Która z zaznaczonych liczb leży bliżej zera?", hint: "Bliżej zera leży punkt bardziej po lewej.", explanation: `${decimal(tenth, 1)} < ${decimal(tenth + 1, 1)}, więc ta liczba leży bliżej zera.`, visual: numberline(10, 0, 10, [tenth, tenth + 1], "Porównaj położenie punktów.", { showMarkedValues: true }) }),
      decimalQuestion({ label: "Brakujący krok", prompt: `Kolejne punkty osi to ${decimal(target - 1, 1)}, ?, ${decimal(target + 1, 1)}. Wpisz brakującą liczbę.`, answer: decimal(target, 1), hint: "Kolejne kreski różnią się o 0,1.", explanation: `Brakuje liczby ${decimal(target, 1)}.`, visual: equation(`${decimal(target - 1, 1)}  →  ?  →  ${decimal(target + 1, 1)}`, "Każda strzałka oznacza krok o 0,1.") }),
      choice("0,01", ["0,1", "0,01", "0,001"], { label: "Wielkość kroku", prompt: "Między 0,80 i 0,90 jest 10 równych odcinków. Jaką wartość ma jeden odcinek?", hint: "Różnicę 0,10 podziel przez 10.", explanation: "0,10 : 10 = 0,01.", visual: numberline(100, 80, 90, [], "Dziesięć równych kroków wypełnia jedną dziesiątą.") })
    ];
  }

  function lengthQuestions() {
    const millimetres = rand(11, 98);
    const centimetres = rand(11, 98);
    const metres = rand(11, 998);
    const cmWhole = rand(1, 9), mmPart = rand(1, 9);
    const mWhole = rand(1, 9), cmPart = rand(1, 99);
    const kmWhole = rand(1, 6), mPart = rand(1, 999);

    return [
      decimalQuestion({ label: "Milimetry i centymetry", prompt: `${millimetres} mm — ile to centymetrów?`, answer: decimal(millimetres, 1), hint: "10 mm = 1 cm, więc przesuń przecinek o jedno miejsce w lewo.", explanation: `${millimetres} mm = ${decimal(millimetres, 1)} cm.`, visual: equation(`${millimetres} mm : 10 = ? cm`, "Centymetr składa się z 10 milimetrów.") }),
      decimalQuestion({ label: "Wyrażenie dwumianowane", prompt: `${cmWhole} cm ${mmPart} mm — ile to centymetrów?`, answer: decimal(cmWhole * 10 + mmPart, 1), hint: "Milimetry zapisz jako dziesiąte części centymetra.", explanation: `${cmWhole} cm ${mmPart} mm = ${decimal(cmWhole * 10 + mmPart, 1)} cm.`, visual: equation(`${cmWhole} cm + ${mmPart}/10 cm`, "Mniejsza jednostka zajmuje miejsce po przecinku.") }),
      decimalQuestion({ label: "Centymetry i metry", prompt: `${centimetres} cm — ile to metrów?`, answer: decimal(centimetres, 2), hint: "100 cm = 1 m, więc potrzebujesz dwóch miejsc po przecinku.", explanation: `${centimetres} cm = ${decimal(centimetres, 2, true)} m.`, visual: equation(`${centimetres}/100 m = ?`, "Centymetr jest setną częścią metra.") }),
      decimalQuestion({ label: "Metry i centymetry", prompt: `${mWhole} m ${cmPart} cm — ile to metrów?`, answer: decimal(mWhole * 100 + cmPart, 2), hint: "Centymetry zapisz jako setne części metra.", explanation: `${mWhole} m ${cmPart} cm = ${decimal(mWhole * 100 + cmPart, 2, true)} m.`, visual: equation(`${mWhole} m + ${cmPart}/100 m`, "Całe metry stoją przed przecinkiem.") }),
      decimalQuestion({ label: "Metry i kilometry", prompt: `${metres} m — ile to kilometrów?`, answer: decimal(metres, 3), hint: "1000 m = 1 km, więc użyj trzech miejsc po przecinku.", explanation: `${metres} m = ${decimal(metres, 3, true)} km.`, visual: equation(`${metres}/1000 km = ?`, "Metr jest tysięczną częścią kilometra.") }),
      decimalQuestion({ label: "Kilometry i metry", prompt: `${kmWhole} km ${mPart} m — ile to kilometrów?`, answer: decimal(kmWhole * 1000 + mPart, 3), hint: "Metry zapisz jako tysięczne części kilometra.", explanation: `${kmWhole} km ${mPart} m = ${decimal(kmWhole * 1000 + mPart, 3, true)} km.`, visual: equation(`${kmWhole} km + ${mPart}/1000 km`, "Zachowaj trzy miejsca dla metrów.") }),
      question({ label: "Powrót do mniejszej jednostki", prompt: `${decimal(centimetres, 2, true)} m — ile to centymetrów?`, answer: centimetres, hint: "Pomnóż metry przez 100.", explanation: `${decimal(centimetres, 2, true)} m = ${centimetres} cm.`, visual: equation(`${decimal(centimetres, 2, true)} · 100 = ?`, "Przejście do mniejszej jednostki zwiększa liczbę.") }),
      question({ label: "Rozbijanie zapisu", prompt: `${decimal(kmWhole * 1000 + mPart, 3, true)} km to ${kmWhole} km i ile metrów?`, answer: mPart, hint: "Trzy cyfry po przecinku opisują metry.", explanation: `Część ułamkowa oznacza ${mPart} m.`, visual: equation(`${decimal(kmWhole * 1000 + mPart, 3, true)} km = ${kmWhole} km + ? m`, "Odczytaj tysięczne części kilometra.") }),
      choice(decimal(mWhole * 100 + cmPart, 2), [decimal(mWhole * 100 + cmPart, 2), decimal(mWhole * 10 + cmPart, 1), decimal(mWhole * 1000 + cmPart, 3)], { label: "Wybór jednostki", prompt: `Który zapis jest równy ${mWhole} m ${cmPart} cm?`, hint: "Centymetry są setnymi częściami metra.", explanation: `To ${decimal(mWhole * 100 + cmPart, 2, true)} m.`, visual: equation("1 m = 100 cm", "Dwa miejsca po przecinku odpowiadają centymetrom.") }),
      decimalQuestion({ label: "Suma długości", prompt: `Taśma ma ${mWhole} m i jeszcze ${centimetres} cm. Ile metrów ma razem?`, answer: decimal(mWhole * 100 + centimetres, 2), hint: "Najpierw zamień centymetry na setne części metra.", explanation: `${mWhole} m + ${centimetres} cm = ${decimal(mWhole * 100 + centimetres, 2, true)} m.`, visual: equation(`${mWhole} m + ${centimetres}/100 m`, "Dodaj całość i część metra.") })
    ];
  }

  function massQuestions() {
    const grams = rand(101, 999);
    const dekagrams = rand(11, 99);
    const kilograms = rand(11, 998);
    const kgWhole = rand(1, 8), gramPart = rand(1, 999);
    const kgDagWhole = rand(1, 8), dagPart = rand(1, 99);
    const tonneWhole = rand(1, 5), kgPart = rand(1, 999);

    return [
      decimalQuestion({ label: "Gramy i kilogramy", prompt: `${grams} g — ile to kilogramów?`, answer: decimal(grams, 3), hint: "1000 g = 1 kg, więc gramy zajmują trzy miejsca po przecinku.", explanation: `${grams} g = ${decimal(grams, 3, true)} kg.`, visual: equation(`${grams}/1000 kg = ?`, "Gram jest tysięczną częścią kilograma.") }),
      decimalQuestion({ label: "Dekagramy i kilogramy", prompt: `${dekagrams} dag — ile to kilogramów?`, answer: decimal(dekagrams, 2), hint: "100 dag = 1 kg.", explanation: `${dekagrams} dag = ${decimal(dekagrams, 2, true)} kg.`, visual: equation(`${dekagrams}/100 kg = ?`, "Dekagram jest setną częścią kilograma.") }),
      decimalQuestion({ label: "Kilogramy i gramy", prompt: `${kgWhole} kg ${gramPart} g — ile to kilogramów?`, answer: decimal(kgWhole * 1000 + gramPart, 3), hint: "Gramy zapisz jako tysięczne części kilograma.", explanation: `${kgWhole} kg ${gramPart} g = ${decimal(kgWhole * 1000 + gramPart, 3, true)} kg.`, visual: equation(`${kgWhole} kg + ${gramPart}/1000 kg`, "Całe kilogramy stoją przed przecinkiem.") }),
      decimalQuestion({ label: "Kilogramy i dekagramy", prompt: `${kgDagWhole} kg ${dagPart} dag — ile to kilogramów?`, answer: decimal(kgDagWhole * 100 + dagPart, 2), hint: "Dekagramy są setnymi częściami kilograma.", explanation: `${kgDagWhole} kg ${dagPart} dag = ${decimal(kgDagWhole * 100 + dagPart, 2, true)} kg.`, visual: equation(`${kgDagWhole} kg + ${dagPart}/100 kg`, "Zachowaj dwa miejsca dla dekagramów.") }),
      decimalQuestion({ label: "Kilogramy i tony", prompt: `${kilograms} kg — ile to ton?`, answer: decimal(kilograms, 3), hint: "1000 kg = 1 t.", explanation: `${kilograms} kg = ${decimal(kilograms, 3, true)} t.`, visual: equation(`${kilograms}/1000 t = ?`, "Kilogram jest tysięczną częścią tony.") }),
      decimalQuestion({ label: "Tony i kilogramy", prompt: `${tonneWhole} t ${kgPart} kg — ile to ton?`, answer: decimal(tonneWhole * 1000 + kgPart, 3), hint: "Kilogramy zapisz jako tysięczne części tony.", explanation: `${tonneWhole} t ${kgPart} kg = ${decimal(tonneWhole * 1000 + kgPart, 3, true)} t.`, visual: equation(`${tonneWhole} t + ${kgPart}/1000 t`, "Trzy miejsca po przecinku opisują kilogramy.") }),
      question({ label: "Powrót do gramów", prompt: `${decimal(grams, 3, true)} kg — ile to gramów?`, answer: grams, hint: "Pomnóż kilogramy przez 1000.", explanation: `${decimal(grams, 3, true)} kg = ${grams} g.`, visual: equation(`${decimal(grams, 3, true)} · 1000 = ?`, "Przejście do gramów zwiększa liczbę.") }),
      question({ label: "Rozbijanie masy", prompt: `${decimal(kgWhole * 1000 + gramPart, 3, true)} kg to ${kgWhole} kg i ile gramów?`, answer: gramPart, hint: "Trzy cyfry po przecinku opisują gramy.", explanation: `Część ułamkowa oznacza ${gramPart} g.`, visual: equation(`${decimal(kgWhole * 1000 + gramPart, 3, true)} kg = ${kgWhole} kg + ? g`, "Odczytaj tysięczne części kilograma.") }),
      choice(decimal(kgDagWhole * 100 + dagPart, 2), [decimal(kgDagWhole * 100 + dagPart, 2), decimal(kgDagWhole * 10 + dagPart, 1), decimal(kgDagWhole * 1000 + dagPart, 3)], { label: "Wybór zapisu", prompt: `Który zapis jest równy ${kgDagWhole} kg ${dagPart} dag?`, hint: "1 kg ma 100 dag.", explanation: `To ${decimal(kgDagWhole * 100 + dagPart, 2, true)} kg.`, visual: equation("1 kg = 100 dag", "Dekagramy zajmują dwa miejsca po przecinku.") }),
      decimalQuestion({ label: "Suma mas", prompt: `Paczka waży ${kgWhole} kg i jeszcze ${grams} g. Ile kilogramów waży razem?`, answer: decimal(kgWhole * 1000 + grams, 3), hint: "Najpierw zamień gramy na tysięczne części kilograma.", explanation: `${kgWhole} kg + ${grams} g = ${decimal(kgWhole * 1000 + grams, 3, true)} kg.`, visual: equation(`${kgWhole} kg + ${grams}/1000 kg`, "Dodaj całość i część kilograma.") })
    ];
  }

  function equivalentQuestions() {
    const whole = rand(1, 19);
    const digit = rand(1, 9);
    const hundredths = rand(11, 99);
    const withZero = digit * 100;

    return [
      choice("=", ["<", ">", "="], { label: "Dopisane zero", prompt: `Wstaw znak: ${whole},${digit} ? ${whole},${digit}0`, hint: "Zero dopisane na końcu części ułamkowej nie zmienia wartości.", explanation: `${whole},${digit} = ${whole},${digit}0.`, visual: equation(`${whole},${digit}  ?  ${whole},${digit}0`, "Oba zapisy wskazują ten sam punkt.") }),
      decimalQuestion({ label: "Najkrótszy zapis", prompt: `Zapisz ${decimal(withZero, 3, true)} używając jak najmniej cyfr.`, answer: decimal(withZero, 3), hint: "Usuń końcowe zera po przecinku.", explanation: `${decimal(withZero, 3, true)} = ${decimal(digit, 1)}.`, visual: equation(`${decimal(withZero, 3, true)} = ?`, "Końcowe zera po przecinku można pominąć.") }),
      choice(`${whole},${digit}00`, [`${whole},${digit}00`, `${whole},0${digit}0`, `${whole},00${digit}`], { label: "Trzy miejsca", prompt: `Który zapis jest równy ${whole},${digit} i ma trzy cyfry po przecinku?`, hint: "Dopisuj zera wyłącznie na końcu.", explanation: `${whole},${digit} = ${whole},${digit}00.`, visual: equation(`${whole},${digit} = ${whole},${digit}00`, "Wartość liczby się nie zmienia.") }),
      choice("tak", ["tak", "nie"], { label: "Sprawdzenie równości", prompt: `Czy ${decimal(hundredths * 10, 3, true)} i ${decimal(hundredths, 2, true)} oznaczają tę samą liczbę?`, hint: "Usuń końcowe zero z pierwszego zapisu.", explanation: `Tak, ${decimal(hundredths * 10, 3, true)} = ${decimal(hundredths, 2, true)}.`, visual: equation(`${decimal(hundredths * 10, 3, true)} = ${decimal(hundredths, 2, true)}`, "Końcowe zero nie zmienia liczby.") }),
      question({ label: "Liczba setnych", prompt: `Ile setnych mieści się w liczbie 0,${digit}0?`, answer: digit * 10, hint: `0,${digit}0 ma dwie cyfry po przecinku.`, explanation: `0,${digit}0 to ${digit * 10}/100, czyli ${digit * 10} setnych.`, visual: equation(`0,${digit}0 = ${digit * 10}/100`, "Zapis ze stoma częściami pokazuje liczbę setnych.") }),
      question({ label: "Liczba tysięcznych", prompt: `Ile tysięcznych mieści się w liczbie 0,${digit}00?`, answer: digit * 100, hint: "Trzy miejsca po przecinku odpowiadają tysięcznym.", explanation: `0,${digit}00 = ${digit * 100}/1000.`, visual: equation(`0,${digit}00 = ${digit * 100}/1000`, "Równa wartość może mieć dokładniejszy zapis.") }),
      choice("0,50 m", ["0,50 m", "0,05 m", "5,0 m"], { label: "Zera w pomiarze", prompt: "Który zapis pomaga od razu zobaczyć, że 0,5 m to 50 cm?", hint: "Setne części metra odpowiadają centymetrom.", explanation: "0,5 m = 0,50 m = 50 cm.", visual: equation("0,5 m = 0,50 m = 50 cm", "Dopisane zero ułatwia zamianę jednostki.") }),
      choice("0,700 kg", ["0,700 kg", "0,070 kg", "7,00 kg"], { label: "Zera w masie", prompt: "Który zapis jest równy 0,7 kg i pokazuje gramy na trzech miejscach?", hint: "Dopisz dwa zera na końcu części ułamkowej.", explanation: "0,7 kg = 0,700 kg = 700 g.", visual: equation("0,7 kg = 0,700 kg", "Trzy miejsca po przecinku odpowiadają gramom.") }),
      choice("nie zmienia się", ["nie zmienia się", "rośnie 10 razy", "maleje 10 razy"], { label: "Reguła zer", prompt: "Co dzieje się z wartością ułamka dziesiętnego, gdy dopiszemy zero na końcu części ułamkowej?", hint: "Porównaj 0,4 i 0,40.", explanation: "Wartość nie zmienia się; zmienia się tylko liczba cyfr w zapisie.", visual: equation("0,4 = 0,40 = 0,400", "Końcowe zera nie zmieniają położenia na osi.") }),
      decimalQuestion({ label: "Naturalna jako dziesiętna", prompt: `Zapisz liczbę ${whole} jako ułamek dziesiętny z jedną cyfrą po przecinku.`, answer: `${whole},0`, hint: "Dopisz przecinek i jedno zero.", explanation: `${whole} = ${whole},0.`, visual: equation(`${whole} = ${whole},0`, "Liczbę naturalną także można zapisać dziesiętnie.") })
    ];
  }

  function comparisonQuestions() {
    const whole = rand(1, 20);
    const a = rand(1, 8), b = rand(a + 1, 9);
    const hundredA = rand(11, 89), hundredB = hundredA + rand(1, 9);
    const samePrefix = rand(1, 8);
    const trailing = rand(1, 9);
    const order = [rand(11, 29), rand(31, 49), rand(51, 79)].sort((left, right) => left - right);
    const orderedText = order.map((value) => decimal(value, 2)).join("; ");
    const reverseText = [...order].reverse().map((value) => decimal(value, 2)).join("; ");

    return [
      choice("<", ["<", ">", "="], { label: "Porównaj dziesiąte", prompt: `Wstaw znak: ${whole},${a} ? ${whole},${b}`, hint: "Części całkowite są równe, więc porównaj cyfry części dziesiątych.", explanation: `${a} < ${b}, więc ${whole},${a} < ${whole},${b}.`, visual: equation(`${whole},${a}  ?  ${whole},${b}`, "Najpierw porównaj całości, potem kolejne cyfry.") }),
      choice("<", ["<", ">", "="], { label: "Porównaj setne", prompt: `Wstaw znak: ${decimal(hundredA, 2, true)} ? ${decimal(hundredB, 2, true)}`, hint: "Porównuj cyfry od lewej strony części ułamkowej.", explanation: `${hundredA} setnych jest mniej niż ${hundredB} setnych.`, visual: equation(`${decimal(hundredA, 2, true)}  ?  ${decimal(hundredB, 2, true)}`, "Obie liczby mają tyle samo miejsc po przecinku.") }),
      choice("=", ["<", ">", "="], { label: "Różna długość zapisu", prompt: `Wstaw znak: ${samePrefix},${trailing} ? ${samePrefix},${trailing}0`, hint: "Dopisz zero do krótszego zapisu.", explanation: `Liczby są równe: ${samePrefix},${trailing} = ${samePrefix},${trailing}0.`, visual: equation(`${samePrefix},${trailing}0  ?  ${samePrefix},${trailing}0`, "Wyrównanie liczby miejsc ułatwia porównanie.") }),
      choice(">", ["<", ">", "="], { label: "Całości są najpierw", prompt: `Wstaw znak: ${whole + 1},01 ? ${whole},99`, hint: "Najpierw porównaj części całkowite.", explanation: `${whole + 1} > ${whole}, więc pierwsza liczba jest większa.`, visual: equation(`${whole + 1},01  ?  ${whole},99`, "Większa część całkowita rozstrzyga porównanie.") }),
      choice(orderedText, [orderedText, reverseText], { label: "Kolejność rosnąca", prompt: "Który zapis ustawia liczby od najmniejszej do największej?", hint: "Porównaj setne jak liczby dwucyfrowe.", explanation: `Poprawna kolejność to ${orderedText}.`, visual: equation(orderedText, "Wartości rosną od lewej do prawej.") }),
      choice(reverseText, [orderedText, reverseText], { label: "Kolejność malejąca", prompt: "Który zapis ustawia liczby od największej do najmniejszej?", hint: "Zacznij od liczby o największej liczbie setnych.", explanation: `Poprawna kolejność to ${reverseText}.`, visual: equation(reverseText, "Wartości maleją od lewej do prawej.") }),
      choice("0,09", ["0,09", "0,9"], { label: "Bliżej zera", prompt: "Która liczba jest mniejsza: 0,09 czy 0,9?", hint: "Zapisz 0,9 jako 0,90.", explanation: "0,09 < 0,90, więc mniejsza jest 0,09.", visual: equation("0,09 < 0,90", "Wyrównaj liczbę miejsc po przecinku.") }),
      choice("tak", ["tak", "nie"], { label: "Liczba pomiędzy", prompt: "Czy 0,35 leży między 0,3 i 0,4?", hint: "Zapisz końce jako 0,30 i 0,40.", explanation: "Tak, 0,30 < 0,35 < 0,40.", visual: numberline(100, 30, 40, [30, 35, 40], "Środkowy punkt leży pomiędzy końcami.", { showMarkedValues: true }) }),
      choice("pierwszy pomiar", ["pierwszy pomiar", "drugi pomiar", "są równe"], { label: "Porównaj długości", prompt: "Który pomiar jest większy: 2,3 m czy 228 cm?", hint: "2,3 m zapisz jako 2,30 m albo 230 cm.", explanation: "2,3 m = 230 cm, a 230 cm > 228 cm.", visual: equation("2,30 m  ?  2,28 m", "Najpierw sprowadź pomiary do tej samej jednostki.") }),
      choice("druga masa", ["pierwsza masa", "druga masa", "są równe"], { label: "Porównaj masy", prompt: "Która masa jest większa: 3,5 kg czy 3 kg 57 dag?", hint: "57 dag = 0,57 kg.", explanation: "3 kg 57 dag = 3,57 kg, więc druga masa jest większa.", visual: equation("3,50 kg  ?  3,57 kg", "Wyrównaj jednostki i miejsca po przecinku.") })
    ];
  }

  function additionQuestions() {
    const a = rand(105, 799), b = rand(101, 899);
    const short = rand(11, 89) * 10, long = rand(101, 899);
    const tenthsA = rand(2, 8), tenthsB = 10 - tenthsA;
    const thousandA = rand(1001, 8999), thousandB = rand(101, 999);
    const missing = rand(11, 89), known = rand(11, 89);
    const three = [rand(10, 99), rand(10, 99), rand(10, 99)];
    const lengthA = rand(101, 599), lengthB = rand(101, 399);
    const massA = rand(1001, 4999), massB = rand(101, 999);

    return [
      calculation(a, b, 2, "+", { label: "Dodawanie setnych", prompt: `Oblicz ${decimal(a, 2)} + ${decimal(b, 2)}.`, hint: "Ustaw przecinek pod przecinkiem i dodawaj cyfry tych samych rzędów.", explanation: `${decimal(a, 2)} + ${decimal(b, 2)} = ${decimal(a + b, 2)}.`, visual: column(decimal(a, 2, true), decimal(b, 2, true), "+", "Przecinki i odpowiadające sobie rzędy są wyrównane.") }),
      calculation(short, long, 3, "+", { label: "Różna liczba cyfr", prompt: `Oblicz ${decimal(short, 3)} + ${decimal(long, 3)}.`, hint: "Możesz dopisać zero na końcu krótszego zapisu.", explanation: `${decimal(short, 3, true)} + ${decimal(long, 3, true)} = ${decimal(short + long, 3)}.`, visual: column(decimal(short, 3, true), decimal(long, 3, true), "+", "Dopisane końcowe zero nie zmienia liczby.") }),
      calculation(tenthsA, tenthsB, 1, "+", { label: "Do pełnej całości", prompt: `Oblicz ${decimal(tenthsA, 1)} + ${decimal(tenthsB, 1)}.`, hint: "Dziesięć części dziesiątych tworzy jedną całość.", explanation: `${tenthsA}/10 + ${tenthsB}/10 = 10/10 = 1.`, visual: equation(`${decimal(tenthsA, 1)} + ${decimal(tenthsB, 1)} = 1`, "Połącz części w pełną całość.") }),
      calculation(thousandA, thousandB, 3, "+", { label: "Dodawanie tysięcznych", prompt: `Oblicz ${decimal(thousandA, 3)} + ${decimal(thousandB, 3)}.`, hint: "Dodaj kolejno tysięczne, setne, dziesiąte i jedności.", explanation: `Suma wynosi ${decimal(thousandA + thousandB, 3)}.`, visual: column(decimal(thousandA, 3, true), decimal(thousandB, 3, true), "+", "Każda cyfra stoi w swoim rzędzie.") }),
      decimalQuestion({ label: "Brakujący składnik", prompt: `Jakiej liczby brakuje? ${decimal(known, 2)} + ? = ${decimal(known + missing, 2)}`, answer: decimal(missing, 2), hint: "Od sumy odejmij znany składnik.", explanation: `Brakuje ${decimal(missing, 2)}, bo ${decimal(known, 2)} + ${decimal(missing, 2)} = ${decimal(known + missing, 2)}.`, visual: equation(`${decimal(known, 2)} + ? = ${decimal(known + missing, 2)}`, "Dodawanie można sprawdzić odejmowaniem.") }),
      decimalQuestion({ label: "Trzy składniki", prompt: `Oblicz ${decimal(three[0], 2)} + ${decimal(three[1], 2)} + ${decimal(three[2], 2)}.`, answer: decimal(three[0] + three[1] + three[2], 2), hint: "Dodawaj setne do setnych i dziesiąte do dziesiątych.", explanation: `Suma wynosi ${decimal(three[0] + three[1] + three[2], 2)}.`, visual: equation(three.map((value) => decimal(value, 2)).join(" + "), "Możesz najpierw połączyć wygodną parę.") }),
      calculation(lengthA, lengthB, 2, "+", { label: "Długość razem", prompt: `Dwie wstążki mają ${decimal(lengthA, 2)} m i ${decimal(lengthB, 2)} m. Ile metrów mają razem?`, hint: "Dodaj długości zapisane w tej samej jednostce.", explanation: `Razem mają ${decimal(lengthA + lengthB, 2)} m.`, visual: column(decimal(lengthA, 2, true), decimal(lengthB, 2, true), "+", "Obie długości są podane w metrach.") }),
      calculation(massA, massB, 3, "+", { label: "Masa razem", prompt: `Dwie paczki ważą ${decimal(massA, 3)} kg i ${decimal(massB, 3)} kg. Ile ważą razem?`, hint: "Ustaw przecinki pod sobą i dodaj masy.", explanation: `Razem ważą ${decimal(massA + massB, 3)} kg.`, visual: column(decimal(massA, 3, true), decimal(massB, 3, true), "+", "Kilogramy dodaj do kilogramów.") }),
      choice("przecinek pod przecinkiem", ["przecinek pod przecinkiem", "ostatnia cyfra pod ostatnią cyfrą", "liczby bez wyrównania"], { label: "Ustawienie pisemne", prompt: "Jak ustawiamy ułamki dziesiętne do dodawania pisemnego?", hint: "Cyfry tych samych rzędów muszą znaleźć się w jednej kolumnie.", explanation: "Ustawiamy przecinek pod przecinkiem.", visual: column("12,40", "3,085", "+", "Końcowe zero pomaga zobaczyć wyrównanie rzędów.") }),
      decimalQuestion({ label: "Sprytna suma", prompt: "Oblicz 2,75 + 0,25 + 1,4.", answer: "4,4", hint: "Najpierw połącz 2,75 i 0,25 w pełne 3.", explanation: "2,75 + 0,25 = 3, a 3 + 1,4 = 4,4.", visual: equation("(2,75 + 0,25) + 1,4", "Najpierw znajdź parę domykającą całość.") })
    ];
  }

  function subtractionQuestions() {
    const b = rand(101, 699), a = b + rand(101, 599);
    const short = rand(21, 89) * 10, long = rand(101, Math.min(short - 1, 899));
    const tenths = rand(1, 9);
    const thousandB = rand(101, 2999), thousandA = thousandB + rand(101, 3999);
    const difference = rand(11, 89), small = rand(11, 89);
    const lengthB = rand(101, 399), lengthA = lengthB + rand(101, 399);
    const massB = rand(101, 999), massA = massB + rand(1001, 2999);

    return [
      calculation(a, b, 2, "−", { label: "Odejmowanie setnych", prompt: `Oblicz ${decimal(a, 2)} − ${decimal(b, 2)}.`, hint: "Ustaw przecinek pod przecinkiem i odejmuj cyfry tych samych rzędów.", explanation: `${decimal(a, 2)} − ${decimal(b, 2)} = ${decimal(a - b, 2)}.`, visual: column(decimal(a, 2, true), decimal(b, 2, true), "−", "Przecinki i odpowiadające sobie rzędy są wyrównane.") }),
      calculation(short, long, 3, "−", { label: "Dopisane zero", prompt: `Oblicz ${decimal(short, 3)} − ${decimal(long, 3)}.`, hint: "Dopisz zero na końcu krótszego zapisu przed odejmowaniem.", explanation: `${decimal(short, 3, true)} − ${decimal(long, 3, true)} = ${decimal(short - long, 3)}.`, visual: column(decimal(short, 3, true), decimal(long, 3, true), "−", "Końcowe zero pozwala wyrównać tysięczne.") }),
      calculation(10, tenths, 1, "−", { label: "Od pełnej całości", prompt: `Oblicz 1 − ${decimal(tenths, 1)}.`, hint: "Zapisz 1 jako 1,0 i zamień jedną całość na 10 dziesiątych.", explanation: `1 − ${decimal(tenths, 1)} = ${decimal(10 - tenths, 1)}.`, visual: column("1,0", decimal(tenths, 1, true), "−", "Jedna całość to dziesięć części dziesiątych.") }),
      calculation(thousandA, thousandB, 3, "−", { label: "Odejmowanie tysięcznych", prompt: `Oblicz ${decimal(thousandA, 3)} − ${decimal(thousandB, 3)}.`, hint: "Odejmuj kolejno tysięczne, setne, dziesiąte i jedności.", explanation: `Różnica wynosi ${decimal(thousandA - thousandB, 3)}.`, visual: column(decimal(thousandA, 3, true), decimal(thousandB, 3, true), "−", "Każda cyfra stoi w swoim rzędzie.") }),
      decimalQuestion({ label: "Brakujący odjemnik", prompt: `Jakiej liczby brakuje? ${decimal(small + difference, 2)} − ? = ${decimal(small, 2)}`, answer: decimal(difference, 2), hint: "Od odjemnej odejmij różnicę.", explanation: `Brakuje ${decimal(difference, 2)}.`, visual: equation(`${decimal(small + difference, 2)} − ? = ${decimal(small, 2)}`, "Odejmowanie sprawdź dodawaniem.") }),
      calculation(lengthA, lengthB, 2, "−", { label: "Różnica długości", prompt: `O ile ${decimal(lengthA, 2)} m jest dłuższe od ${decimal(lengthB, 2)} m?`, hint: "Od większej długości odejmij mniejszą.", explanation: `Różnica wynosi ${decimal(lengthA - lengthB, 2)} m.`, visual: column(decimal(lengthA, 2, true), decimal(lengthB, 2, true), "−", "Obie długości są podane w metrach.") }),
      calculation(massA, massB, 3, "−", { label: "Różnica mas", prompt: `Paczka ważyła ${decimal(massA, 3)} kg. Wyjęto z niej ${decimal(massB, 3)} kg. Ile kilogramów zostało?`, hint: "Od początkowej masy odejmij wyjętą część.", explanation: `Zostało ${decimal(massA - massB, 3)} kg.`, visual: column(decimal(massA, 3, true), decimal(massB, 3, true), "−", "Kilogramy odejmij od kilogramów.") }),
      choice("dopisać końcowe zera", ["dopisać końcowe zera", "usunąć przecinki", "zamienić kolejność liczb"], { label: "Różna liczba cyfr", prompt: "Co można zrobić, gdy odjemna i odjemnik mają różną liczbę cyfr po przecinku?", hint: "Końcowe zera nie zmieniają wartości.", explanation: "Można dopisać końcowe zera i wyrównać rzędy.", visual: column("8,200", "5,67", "−", "8,2 zapisano jako 8,200.") }),
      decimalQuestion({ label: "Dwa odejmowania", prompt: "Oblicz 10 − 2,35 − 1,65.", answer: "6", hint: "Najpierw zauważ, że 2,35 + 1,65 = 4.", explanation: "10 − 4 = 6.", visual: equation("10 − (2,35 + 1,65)", "Połącz wygodną parę odejmowanych liczb.") }),
      choice("nie", ["tak", "nie"], { label: "Analiza błędu", prompt: "Ktoś obliczył 5,2 − 1,35 = 4,15. Czy wynik jest poprawny?", hint: "Zapisz 5,2 jako 5,20 i odejmij ponownie.", explanation: "Nie. 5,20 − 1,35 = 3,85.", visual: column("5,20", "1,35", "−", "Sprawdź cyfry setnych i pożyczanie.") })
    ];
  }

  function shoppingQuestions() {
    const priceA = rand(125, 899), priceB = rand(125, 899);
    const total = priceA + priceB;
    const banknote = Math.ceil((total + rand(100, 500)) / 500) * 500;
    const oldPrice = rand(2000, 9999), discount = rand(125, 999);
    const quantity = rand(2, 4), unitPrice = rand(125, 599);
    const three = [rand(100, 999), rand(100, 999), rand(100, 999)];
    const budget = Math.ceil((three[0] + three[1] + 300) / 500) * 500;

    return [
      calculation(priceA, priceB, 2, "+", { label: "Rachunek", prompt: `Sok kosztuje ${decimal(priceA, 2, true)} zł, a kanapka ${decimal(priceB, 2, true)} zł. Ile kosztują razem?`, hint: "Dodaj złote do złotych i grosze do groszy.", explanation: `Razem trzeba zapłacić ${decimal(total, 2, true)} zł.`, visual: equation(`${decimal(priceA, 2, true)} zł + ${decimal(priceB, 2, true)} zł`, "Obie ceny są podane w złotych.") }),
      calculation(banknote, total, 2, "−", { label: "Reszta", prompt: `Zakupy kosztują ${decimal(total, 2, true)} zł. Płacisz ${decimal(banknote, 2, true)} zł. Ile reszty otrzymasz?`, hint: "Od wpłaconej kwoty odejmij koszt zakupów.", explanation: `Reszta to ${decimal(banknote - total, 2, true)} zł.`, visual: column(decimal(banknote, 2, true), decimal(total, 2, true), "−", "Kwotę zapłaconą pomniejsz o rachunek.") }),
      calculation(oldPrice, discount, 2, "−", { label: "Obniżka", prompt: `Cena ${decimal(oldPrice, 2, true)} zł została obniżona o ${decimal(discount, 2, true)} zł. Jaka jest nowa cena?`, hint: "Od starej ceny odejmij kwotę obniżki.", explanation: `Nowa cena wynosi ${decimal(oldPrice - discount, 2, true)} zł.`, visual: column(decimal(oldPrice, 2, true), decimal(discount, 2, true), "−", "Obniżka zmniejsza cenę.") }),
      decimalQuestion({ label: "Kilka sztuk", prompt: `${quantity} jednakowe bilety kosztują po ${decimal(unitPrice, 2, true)} zł. Ile kosztują razem?`, answer: decimal(quantity * unitPrice, 2), hint: `Dodaj cenę ${quantity} razy albo pomnóż ją przez ${quantity}.`, explanation: `${quantity} · ${decimal(unitPrice, 2, true)} zł = ${decimal(quantity * unitPrice, 2, true)} zł.`, visual: equation(`${quantity} · ${decimal(unitPrice, 2, true)} zł`, "Każdy bilet ma taką samą cenę.") }),
      calculation(Math.max(priceA, priceB), Math.min(priceA, priceB), 2, "−", { label: "Porównanie cen", prompt: `Dwa produkty kosztują ${decimal(priceA, 2, true)} zł i ${decimal(priceB, 2, true)} zł. O ile droższy jest droższy produkt?`, hint: "Od większej ceny odejmij mniejszą.", explanation: `Różnica cen wynosi ${decimal(Math.abs(priceA - priceB), 2, true)} zł.`, visual: equation(`${decimal(Math.max(priceA, priceB), 2, true)} zł − ${decimal(Math.min(priceA, priceB), 2, true)} zł`, "Różnica mówi, o ile ceny się różnią.") }),
      decimalQuestion({ label: "Trzy ceny", prompt: `Oblicz rachunek: ${three.map((value) => `${decimal(value, 2, true)} zł`).join(" + ")}.`, answer: decimal(three[0] + three[1] + three[2], 2), hint: "Dodaj wszystkie trzy ceny, ustawiając przecinki w jednej kolumnie.", explanation: `Rachunek wynosi ${decimal(three[0] + three[1] + three[2], 2, true)} zł.`, visual: equation(three.map((value) => decimal(value, 2, true)).join(" + "), "Każda liczba ma złote przed przecinkiem i grosze po nim.") }),
      question({ label: "Grosze", prompt: `Ile groszy to ${decimal(priceA, 2, true)} zł?`, answer: priceA, hint: "1 zł = 100 gr, więc pomnóż przez 100.", explanation: `${decimal(priceA, 2, true)} zł = ${priceA} gr.`, visual: equation(`${decimal(priceA, 2, true)} · 100 = ? gr`, "Dwie cyfry po przecinku opisują grosze.") }),
      decimalQuestion({ label: "Złote", prompt: `${priceB} gr — ile to złotych?`, answer: decimal(priceB, 2), hint: "Podziel liczbę groszy przez 100.", explanation: `${priceB} gr = ${decimal(priceB, 2, true)} zł.`, visual: equation(`${priceB}/100 zł = ?`, "Grosz jest setną częścią złotego.") }),
      choice("wystarczy", ["wystarczy", "nie wystarczy"], { label: "Budżet", prompt: `Masz ${decimal(budget, 2, true)} zł. Dwa produkty kosztują ${decimal(three[0], 2, true)} zł i ${decimal(three[1], 2, true)} zł. Czy pieniędzy wystarczy?`, hint: "Dodaj ceny i porównaj sumę z budżetem.", explanation: `${decimal(three[0] + three[1], 2, true)} zł ≤ ${decimal(budget, 2, true)} zł, więc pieniędzy wystarczy.`, visual: equation(`${decimal(three[0], 2, true)} + ${decimal(three[1], 2, true)}  ?  ${decimal(budget, 2, true)}`, "Najpierw oblicz koszt zakupów.") }),
      decimalQuestion({ label: "Brakująca cena", prompt: `Dwa produkty kosztują razem ${decimal(total, 2, true)} zł. Jeden kosztuje ${decimal(priceA, 2, true)} zł. Ile kosztuje drugi?`, answer: decimal(priceB, 2), hint: "Od całego rachunku odejmij znaną cenę.", explanation: `Drugi produkt kosztuje ${decimal(priceB, 2, true)} zł.`, visual: equation(`${decimal(total, 2, true)} − ${decimal(priceA, 2, true)} = ?`, "Znajdź brakujący składnik rachunku.") })
    ];
  }

  function puzzleQuestions() {
    const whole = rand(1, 9), tenths = rand(1, 9), hundredths = rand(0, 9), thousandths = rand(1, 9);
    const value = `${whole},${tenths}${hundredths}${thousandths}`;
    const a = rand(11, 49), b = rand(11, 49);

    return [
      decimalQuestion({ label: "Kod cyfr", prompt: `Zbuduj liczbę: ${whole} jedności, ${tenths} dziesiątych, ${hundredths} setnych i ${thousandths} tysięcznych.`, answer: value, hint: "Ustaw cyfry kolejno po obu stronach przecinka.", explanation: `Szukana liczba to ${value}.`, visual: equation(`${whole} | ${tenths} | ${hundredths} | ${thousandths}`, "Pola oznaczają jedności, dziesiąte, setne i tysięczne.") }),
      question({ label: "Odkryj cyfrę", prompt: `W liczbie ${value} cyfra setnych została zasłonięta. Jaka to cyfra?`, answer: hundredths, hint: "Setne zajmują drugie miejsce po przecinku.", explanation: `Cyfrą setnych jest ${hundredths}.`, visual: equation(`${whole},${tenths}□${thousandths}`, "Kwadrat zasłania drugą cyfrę po przecinku.") }),
      choice("przesunął przecinek o złe miejsce", ["przesunął przecinek o złe miejsce", "dopisał końcowe zero", "porównał części całkowite"], { label: "Tropiciel błędu", prompt: "Ktoś zapisał 47 cm = 0,047 m. Jaki błąd popełnił?", hint: "1 m ma 100 cm, nie 1000 cm.", explanation: "Przecinek przesunięto o złe miejsce. Poprawnie: 47 cm = 0,47 m.", visual: equation("47 cm ≠ 0,047 m", "Sprawdź zależność 1 m = 100 cm.") }),
      choice("nie", ["tak", "nie"], { label: "Tropiciel sumy", prompt: "Ktoś obliczył 2,7 + 0,35 = 2,105. Czy wynik jest poprawny?", hint: "Zapisz 2,7 jako 2,70 i dodaj setne.", explanation: "Nie. 2,70 + 0,35 = 3,05.", visual: column("2,70", "0,35", "+", "Wyrównaj przecinki przed dodawaniem.") }),
      decimalQuestion({ label: "Do pełnej liczby", prompt: `Jakiej liczby brakuje? ${decimal(a, 2)} + ? = 1`, answer: decimal(100 - a, 2), hint: "Jedna całość to 100 setnych.", explanation: `${a}/100 + ${100 - a}/100 = 100/100.`, visual: equation(`${decimal(a, 2)} + ? = 1,00`, "Uzupełnij do stu setnych.") }),
      decimalQuestion({ label: "Działania odwrotne", prompt: `Oblicz ${decimal(a + b, 2)} − ${decimal(a, 2)} + ${decimal(a, 2)}.`, answer: decimal(a + b, 2), hint: "Odjęcie i dodanie tej samej liczby wzajemnie się znoszą.", explanation: `Wynik pozostaje równy ${decimal(a + b, 2)}.`, visual: equation(`− ${decimal(a, 2)} + ${decimal(a, 2)} = 0`, "Szukaj pary działań przeciwnych.") }),
      choice("0,305", ["0,305", "0,035", "3,05"], { label: "Warunki cyfr", prompt: "Która liczba ma 3 części dziesiąte, 0 setnych i 5 tysięcznych?", hint: "Zapisz po przecinku kolejno cyfry 3, 0, 5.", explanation: "Szukana liczba to 0,305.", visual: equation("0 | 3 | 0 | 5", "Pola oznaczają jedności, dziesiąte, setne i tysięczne.") }),
      choice("8,27", ["8,207", "8,27", "8,027"], { label: "Największa liczba", prompt: "Która liczba jest największa?", hint: "Zapisz wszystkie z trzema miejscami: 8,207; 8,270; 8,027.", explanation: "Największa jest 8,27, czyli 8,270.", visual: equation("8,207   8,270   8,027", "Wyrównaj liczbę miejsc przed porównaniem.") }),
      choice("setne", ["dziesiąte", "setne", "tysięczne"], { label: "Który rząd rozstrzyga?", prompt: "Liczby 4,36 i 4,39 mają równe całości i dziesiąte. Który rząd rozstrzyga porównanie?", hint: "Znajdź pierwsze miejsce, na którym cyfry są różne.", explanation: "Różnią się cyframi setnych: 6 i 9.", visual: equation("4,36 < 4,39", "Pierwsza różna cyfra rozstrzyga.") }),
      decimalQuestion({ label: "Dwie jednostki", prompt: "Zapisz 2 m 5 mm w metrach.", answer: "2,005", hint: "Milimetr jest tysięczną częścią metra.", explanation: "2 m 5 mm = 2,005 m.", visual: equation("2 m + 5/1000 m", "Zera przechowują miejsca dziesiątych i setnych.") })
    ];
  }

  const builders = {
    "zapis-dziesietny": notationQuestions,
    "os-dziesietna": numberlineQuestions,
    dlugosc: lengthQuestions,
    masa: massQuestions,
    "rowne-zapisy": equivalentQuestions,
    porownywanie: comparisonQuestions,
    dodawanie: additionQuestions,
    odejmowanie: subtractionQuestions,
    zakupy: shoppingQuestions,
    "dziesietne-zagadki": puzzleQuestions
  };

  function buildQuestions(mode) {
    if (builders[mode]) return builders[mode]().map((item) => ({ ...item, routeId: mode }));
    return shuffle(Object.entries(builders).map(([routeId, build]) => ({ ...pick(build()), routeId })));
  }

  MathTownGame.start({
    chapterId: "chapter6",
    chapterTitle: "Ułamki dziesiętne",
    routeLabels,
    buildQuestions,
    answerCheckers
  });
})();
