(() => {
  "use strict";

  const routeLabels = {
    dziesiatkowy: "Cyfrowa wieża",
    porownywanie: "Pojedynek liczb",
    duze: "Wielkie rachunki",
    pieniadze: "Kasa miasteczka",
    dlugosc: "Miary w ruchu",
    masa: "Waga odkrywcy",
    rzymskie: "Rzymskie tajemnice",
    kalendarz: "Kalendarzowa wyprawa",
    zegary: "Zegarowa stacja",
    mix: "Wielki obchód"
  };

  const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const question = (data) => ({ kind: "input", label: "Zadanie", visual: null, ...data });
  const equation = (expression, caption) => ({ type: "equation", expression, caption });
  const choices = (answer, options) => ({ kind: "choice", answer, options: options.map((value) => ({ value, label: String(value) })) });

  function decimalQuestions() {
    const items = [
      ["W liczbie 47 305 jaka jest wartość cyfry 7?", 7000, "Siódemka stoi na miejscu tysięcy.", "7 · 1000 = 7000.", equation("47 305", "Cyfra ma wartość zależną od miejsca.")],
      ["W liczbie 206 418 która cyfra stoi na miejscu setek?", 4, "Spójrz na trzecią cyfrę od prawej strony.", "Na miejscu setek stoi 4.", equation("206 418", "Setki są trzecie od prawej.")],
      ["Zapisz cyframi: trzydzieści dwa tysiące pięć.", 32005, "To 32 tysiące i jeszcze 5 jedności.", "32 000 + 5 = 32 005.", equation("32 000 + 5", "Zera zachowują puste miejsca.")],
      ["Ile cyfr ma liczba 508 090?", 6, "Policz wszystkie cyfry, także zera.", "508 090 ma 6 cyfr.", equation("508 090", "Zero też jest cyfrą.")],
      ["Jaka liczba ma 4 tysiące, 3 setki, 2 dziesiątki i 6 jedności?", 4326, "Ułóż cyfry kolejno: tysiące, setki, dziesiątki, jedności.", "4 000 + 300 + 20 + 6 = 4326.", equation("4T + 3S + 2D + 6J", "Każde miejsce ma własną wartość.")],
      ["W liczbie 900 701 jaka jest suma cyfr?", 17, "Dodaj 9 + 0 + 0 + 7 + 0 + 1.", "9 + 7 + 1 = 17.", equation("9 + 0 + 0 + 7 + 0 + 1", "Dodaj wszystkie cyfry.")],
      ["Zapisz największą liczbę czterocyfrową z cyfr 2, 9, 0 i 5, używając każdej raz.", 9520, "Największą cyfrę postaw najbardziej z lewej.", "Cyfry malejąco dają 9520.", equation("9 | 5 | 2 | 0", "Największe miejsca są po lewej.")],
      ["Ile tysięcy pełnych jest w liczbie 18 740?", 18, "Pełne tysiące to grupy po 1000.", "18 740 = 18 · 1000 + 740.", equation("18 740 = 18 tys. + 740", "Spójrz na grupę tysięcy.")],
      ["Która liczba jest o 1 większa od 99 999?", 100000, "Po 99 999 zaczyna się kolejna liczba sześciocyfrowa.", "99 999 + 1 = 100 000.", equation("99 999 + 1", "Przenosimy jedność przez wszystkie dziewiątki.")],
      ["Zapisz cyframi: dwa miliony trzy tysiące dziewięć.", 2003009, "To 2 000 000 + 3 000 + 9.", "2 000 000 + 3 000 + 9 = 2 003 009.", equation("2 mln + 3 tys. + 9", "Grupuj cyfry po trzy.")]
    ];
    return shuffle(items).map(([prompt, answer, hint, explanation, visual]) => question({ label: "System dziesiątkowy", prompt, answer, hint, explanation, visual }));
  }

  function compareQuestions() {
    const pairs = [[4807, 4870], [92000, 91999], [30506, 30560], [760, 76], [100001, 99999], [54018, 54081], [8123, 8123], [700090, 700009], [45800, 459], [9999, 10000]];
    return shuffle(pairs).map(([left, right]) => {
      const answer = left === right ? "=" : left > right ? ">" : "<";
      return question({ label: "Porównywanie liczb", prompt: `Wstaw właściwy znak: ${left.toLocaleString("pl-PL")} ? ${right.toLocaleString("pl-PL")}.`, hint: "Porównuj cyfry od lewej strony. Liczba z większą pierwszą różną cyfrą jest większa.", explanation: `${left.toLocaleString("pl-PL")} ${answer} ${right.toLocaleString("pl-PL")}.`, visual: equation(`${left.toLocaleString("pl-PL")}  ?  ${right.toLocaleString("pl-PL")}`, "Znak otwiera się w stronę większej liczby."), ...choices(answer, ["<", "=", ">"]) });
    });
  }

  function largeNumberQuestions() {
    const items = [
      ["Oblicz: 32 000 + 7 000.", 39000, "Połącz tysiące: 32 tys. + 7 tys.", "32 000 + 7 000 = 39 000."],
      ["Oblicz: 85 000 − 23 000.", 62000, "Odejmij tysiące: 85 − 23.", "85 000 − 23 000 = 62 000."],
      ["Oblicz: 46 · 1000.", 46000, "Przy mnożeniu przez 1000 dopisz trzy zera.", "46 · 1000 = 46 000."],
      ["Oblicz: 720 000 : 100.", 7200, "Przy dzieleniu przez 100 skreśl dwa zera.", "720 000 : 100 = 7200."],
      ["Oblicz: 300 · 40.", 12000, "3 · 4 = 12, a potem dopisz trzy zera.", "300 · 40 = 12 000."],
      ["Oblicz: 56 000 : 70.", 800, "Skreśl jedno zero w obu liczbach: 5600 : 7.", "56 000 : 70 = 800."],
      ["Jaka liczba jest o 200 większa od 9 850?", 10050, "Dodaj dwie setki.", "9850 + 200 = 10 050."],
      ["Do liczby 10 000 brakuje 1 725. Jaka liczba jest podana?", 8275, "Odejmij brakującą część od 10 000.", "10 000 − 1725 = 8275."],
      ["Oblicz: 125 · 80.", 10000, "125 · 8 = 1000, potem dopisz zero.", "125 · 80 = 10 000."],
      ["Oblicz: 3 600 000 : 900.", 4000, "Skreśl dwa zera: 36 000 : 9.", "3 600 000 : 900 = 4000."]
    ];
    return shuffle(items).map(([prompt, answer, hint, explanation]) => question({ label: "Rachunki na dużych liczbach", prompt, answer, hint, explanation, visual: equation("Tysiące i zera", "Wykorzystaj zależności między liczbami.") }));
  }

  function moneyQuestions() {
    const items = [
      ["Ile groszy to 7 zł 35 gr?", 735, "Jeden złoty to 100 groszy.", "7 · 100 + 35 = 735 gr."],
      ["Ile złotych i groszy to 1260 gr? Wpisz tylko liczbę złotych.", 12, "1200 gr to 12 zł, zostaje 60 gr.", "1260 gr = 12 zł 60 gr."],
      ["Ola ma 8 zł 40 gr i dostaje 2 zł 75 gr. Ile ma groszy razem?", 1115, "Zamień obie kwoty na grosze albo dodaj złote i grosze.", "840 gr + 275 gr = 1115 gr."],
      ["Gra kosztuje 15 zł 80 gr. Ile groszy reszty dostaniesz z 20 zł?", 420, "20 zł to 2000 gr.", "2000 gr − 1580 gr = 420 gr."],
      ["Która kwota jest większa: 9 zł 5 gr czy 8 zł 95 gr? Wybierz 1 dla pierwszej, 2 dla drugiej.", 1, "Porównaj najpierw liczbę złotych.", "9 zł 5 gr jest większe niż 8 zł 95 gr.", [1, 2]],
      ["Ile kosztują 3 bilety po 4 zł 50 gr? Podaj wynik w groszach.", 1350, "Jeden bilet to 450 gr.", "3 · 450 gr = 1350 gr."],
      ["Ile złotych jest w 250 monetach po 20 gr?", 50, "250 · 20 gr = 5000 gr.", "5000 gr = 50 zł."],
      ["Kanapka kosztuje 6 zł 90 gr, a sok 3 zł 20 gr. Ile groszy kosztują razem?", 1010, "690 gr + 320 gr.", "690 + 320 = 1010 gr."],
      ["W portmonetce są 4 monety po 5 zł i 3 monety po 2 zł. Ile jest złotych?", 26, "4 · 5 + 3 · 2.", "20 zł + 6 zł = 26 zł."],
      ["Ile groszy brakuje od 14 zł 60 gr do 15 zł?", 40, "15 zł to 1500 gr.", "1500 gr − 1460 gr = 40 gr."]
    ];
    return shuffle(items).map(([prompt, answer, hint, explanation, options]) => question({ label: "Złote i grosze", prompt, answer, hint, explanation, visual: equation("1 zł = 100 gr", "W razie potrzeby zamień wszystko na grosze."), ...(options ? choices(answer, options) : {}) }));
  }

  function lengthQuestions() {
    const items = [
      ["Ile milimetrów ma 8 cm?", 80, "1 cm to 10 mm.", "8 · 10 = 80 mm."],
      ["Ile centymetrów ma 3 m?", 300, "1 m to 100 cm.", "3 · 100 = 300 cm."],
      ["Ile metrów ma 6 km?", 6000, "1 km to 1000 m.", "6 · 1000 = 6000 m."],
      ["Ile milimetrów ma 2 cm 7 mm?", 27, "2 cm to 20 mm.", "20 mm + 7 mm = 27 mm."],
      ["Ile metrów ma 4 km 250 m?", 4250, "4 km to 4000 m.", "4000 m + 250 m = 4250 m."],
      ["Ile centymetrów ma 5 dm?", 50, "1 dm to 10 cm.", "5 · 10 = 50 cm."],
      ["Ile milimetrów ma 1 m?", 1000, "1 m = 100 cm, a każdy cm ma 10 mm.", "100 · 10 = 1000 mm."],
      ["Trasa ma 2 km 300 m, a druga 1 km 700 m. Ile metrów mają razem?", 4000, "Zamień obie długości na metry.", "2300 m + 1700 m = 4000 m."],
      ["Ile pełnych okrążeń bieżni 400 m trzeba przebiec, aby pokonać 2 km?", 5, "2 km to 2000 m.", "2000 : 400 = 5."],
      ["Która długość jest największa: 950 m, 1 km czy 990 m? Wybierz 1, 2 albo 3.", 2, "Zamień kilometr na metry.", "1 km = 1000 m, więc jest największy.", [1, 2, 3]]
    ];
    return shuffle(items).map(([prompt, answer, hint, explanation, options]) => question({ label: "Jednostki długości", prompt, answer, hint, explanation, visual: equation("mm → cm → dm → m → km", "Każdy krok ma swoją zależność."), ...(options ? choices(answer, options) : {}) }));
  }

  function massQuestions() {
    const items = [
      ["Ile gramów ma 3 kg?", 3000, "1 kg to 1000 g.", "3 · 1000 = 3000 g."],
      ["Ile gramów ma 7 dag?", 70, "1 dag to 10 g.", "7 · 10 = 70 g."],
      ["Ile dekagramów ma 5 kg?", 500, "1 kg to 100 dag.", "5 · 100 = 500 dag."],
      ["Ile kilogramów ma 4 t?", 4000, "1 t to 1000 kg.", "4 · 1000 = 4000 kg."],
      ["Ile kilogramów i gramów to 2450 g? Wpisz tylko pełne kilogramy.", 2, "2000 g to 2 kg, zostaje 450 g.", "2450 g = 2 kg 450 g."],
      ["Paczka waży 2 kg 300 g, a druga 700 g. Ile gramów ważą razem?", 3000, "2 kg 300 g to 2300 g.", "2300 g + 700 g = 3000 g."],
      ["Ile gramów brakuje do 1 kg, jeśli jest 650 g?", 350, "1 kg to 1000 g.", "1000 g − 650 g = 350 g."],
      ["Która masa jest największa: 950 g, 1 kg czy 95 dag? Wybierz 1, 2 albo 3.", 2, "1 kg to 1000 g, a 95 dag to 950 g.", "1000 g jest największe.", [1, 2, 3]],
      ["Ciężarówka może zabrać 3 t. Czy ładunek 2500 kg się zmieści? Wybierz 1 = tak, 2 = nie.", 1, "3 t to 3000 kg.", "2500 kg jest mniejsze niż 3000 kg.", [1, 2]],
      ["Ile dekagramów ma 1 kg 40 dag?", 140, "1 kg to 100 dag.", "100 dag + 40 dag = 140 dag."]
    ];
    return shuffle(items).map(([prompt, answer, hint, explanation, options]) => question({ label: "Jednostki masy", prompt, answer, hint, explanation, visual: equation("g → dag → kg → t", "Wybierz właściwą zależność."), ...(options ? choices(answer, options) : {}) }));
  }

  function romanQuestions() {
    const toRoman = [[4, "IV"], [9, "IX"], [14, "XIV"], [19, "XIX"], [24, "XXIV"], [39, "XXXIX"], [44, "XLIV"], [58, "LVIII"], [90, "XC"], [145, "CXLV"]];
    const fromRoman = [["VII", 7], ["XVI", 16], ["XXIX", 29], ["XL", 40], ["LXXIV", 74], ["XCII", 92], ["CL", 150], ["CD", 400], ["DIX", 509], ["MCM", 1900]];
    const questions = [
      ...toRoman.slice(0, 5).map(([number, answer]) => question({ checker: "roman", label: "System rzymski", prompt: `Zapisz liczbę ${number} cyframi rzymskimi.`, answer, hint: "Przypomnij sobie: I = 1, V = 5, X = 10. Mała cyfra przed większą czasem oznacza odejmowanie.", explanation: `${number} zapisujemy ${answer}.`, visual: equation("I  V  X  L  C  D  M", "IV = 4, IX = 9, XL = 40, XC = 90.") })),
      ...fromRoman.slice(0, 5).map(([roman, answer]) => question({ label: "System rzymski", prompt: `Odczytaj liczbę rzymską ${roman}.`, answer, hint: "Dodawaj wartości znaków; przed większym znakiem odejmujemy.", explanation: `${roman} = ${answer}.`, visual: equation(roman, "Odczytaj znaki od lewej strony.") }))
    ];
    return shuffle(questions);
  }

  function calendarQuestions() {
    const items = [
      ["Ile miesięcy ma rok?", 12, "Pomyśl o kolejnych kartkach kalendarza.", "Rok ma 12 miesięcy."],
      ["Ile dni ma kwiecień?", 30, "Kwiecień jest jednym z miesięcy trzydziestodniowych.", "Kwiecień ma 30 dni."],
      ["Który miesiąc jest ósmy w roku? Wybierz 1 = lipiec, 2 = sierpień, 3 = wrzesień.", 2, "Policz od stycznia.", "Ósmym miesiącem jest sierpień.", [1, 2, 3]],
      ["Ile dni ma rok zwykły?", 365, "Rok zwykły ma jeden dzień więcej niż 52 pełne tygodnie.", "Rok zwykły ma 365 dni."],
      ["Ile dni ma luty w roku przestępnym?", 29, "W roku przestępnym luty dostaje dodatkowy dzień.", "Luty w roku przestępnym ma 29 dni."],
      ["Ile miesięcy tworzy jeden kwartał?", 3, "Rok ma 4 kwartały i 12 miesięcy.", "12 : 4 = 3 miesiące."],
      ["Ile dni ma tydzień?", 7, "Wypisz dni od poniedziałku do niedzieli.", "Tydzień ma 7 dni."],
      ["Jeśli dziś jest poniedziałek, jaki dzień będzie za 10 dni? Wybierz 1 = środa, 2 = czwartek, 3 = piątek.", 2, "Po 7 dniach znów będzie poniedziałek, zostają 3 dni.", "Poniedziałek + 10 dni to czwartek.", [1, 2, 3]],
      ["W którym wieku leży rok 2026?", 21, "Lata 2001–2100 należą do XXI wieku.", "Rok 2026 jest w XXI wieku."],
      ["Ile dni mają razem czerwiec i lipiec?", 61, "Czerwiec ma 30 dni, a lipiec 31.", "30 + 31 = 61 dni."]
    ];
    return shuffle(items).map(([prompt, answer, hint, explanation, options]) => question({ label: "Kalendarz", prompt, answer, hint, explanation, visual: equation("rok → 4 kwartały → 12 miesięcy", "Kalendarz pomaga porządkować czas."), ...(options ? choices(answer, options) : {}) }));
  }

  function clockQuestions() {
    const items = [
      ["Ile minut ma jedna godzina?", 60, "Godzinę dzielimy na 60 równych minut.", "1 godzina = 60 minut."],
      ["Ile minut mają 2 godziny i 15 minut?", 135, "2 godziny to 120 minut.", "120 + 15 = 135 minut."],
      ["Ile sekund ma 3 minuty?", 180, "Jedna minuta ma 60 sekund.", "3 · 60 = 180 sekund."],
      ["Która godzina będzie za 45 minut po 13:30? Zapisz jako liczbę minut po północy.", 855, "13:30 + 45 min to 14:15. Zamień 14 godzin na minuty.", "14:15 to 14 · 60 + 15 = 855 minut po północy."],
      ["Film zaczyna się o 16:20 i trwa 90 minut. O której się kończy?", "17:50", "90 minut to 1 godzina 30 minut.", "16:20 + 1:30 = 17:50.", ["17:40", "17:50", "18:00"]],
      ["Ile minut ma kwadrans?", 15, "Kwadrans to ćwierć godziny.", "60 : 4 = 15 minut."],
      ["Ile godzin mają 3 doby?", 72, "Jedna doba to 24 godziny.", "3 · 24 = 72 godziny."],
      ["Zegar pokazuje 8:40. Ile minut brakuje do 9:00?", 20, "Od 8:40 do 9:00 jest końcówka godziny.", "60 − 40 = 20 minut."],
      ["Pociąg odjeżdża o 11:55, a przyjeżdża o 13:10. Ile minut trwa podróż?", 75, "Do 12:00 jest 5 minut, potem godzina, a potem 10 minut.", "5 + 60 + 10 = 75 minut."],
      ["Która godzina jest później: 18:05 czy 17:55? Wybierz 1 dla pierwszej, 2 dla drugiej.", 1, "Najpierw porównaj godziny.", "18:05 jest później niż 17:55.", [1, 2]]
    ];
    return shuffle(items).map(([prompt, answer, hint, explanation, options]) => question({ label: "Godziny na zegarach", prompt, answer, hint, explanation, visual: equation("1 h = 60 min   •   1 min = 60 s", "Zamieniaj czas krok po kroku."), ...(options ? choices(answer, options) : {}) }));
  }

  function buildQuestions(mode) {
    const pools = { dziesiatkowy: decimalQuestions, porownywanie: compareQuestions, duze: largeNumberQuestions, pieniadze: moneyQuestions, dlugosc: lengthQuestions, masa: massQuestions, rzymskie: romanQuestions, kalendarz: calendarQuestions, zegary: clockQuestions };
    if (pools[mode]) return pools[mode]();
    const mixed = Object.values(pools).map((build) => pick(build()));
    return shuffle([...mixed, pick(decimalQuestions())]).slice(0, 10);
  }

  MathTownGame.start({
    chapterId: "chapter2",
    chapterTitle: "Systemy zapisywania liczb",
    routeLabels,
    buildQuestions,
    answerCheckers: {
      roman(raw, answer) { return String(raw).trim().toUpperCase().replace(/\s+/g, "") === answer; }
    }
  });
})();
