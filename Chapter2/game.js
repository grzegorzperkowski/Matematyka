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
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const polishCount = MathTownGame.polishCount;
  const polishVerb = MathTownGame.polishVerb;
  const format = (number) => number.toLocaleString("pl-PL");
  const question = (data) => ({ kind: "input", label: "Zadanie", visual: null, ...data });
  const equation = (expression, caption) => ({ type: "equation", expression, caption });
  const choice = (answer, options) => ({
    kind: "choice",
    answer,
    options: options.map((option) => (typeof option === "object" ? option : { value: option, label: String(option) }))
  });
  const clockVisual = equation("1\u00a0h = 60\u00a0min\u2003\u20031\u00a0min = 60\u00a0s", "Zamieniaj czas krok po kroku.");

  const placeNames = {
    1: "jedności",
    10: "dziesiątek",
    100: "setek",
    1000: "tysięcy",
    10000: "dziesiątek tysięcy",
    100000: "setek tysięcy",
    1000000: "milionów",
    10000000: "dziesiątek milionów"
  };
  const digitWords = {
    2: "dwucyfrowa",
    3: "trzycyfrowa",
    4: "czterocyfrowa",
    5: "pięciocyfrowa",
    6: "sześciocyfrowa",
    7: "siedmiocyfrowa"
  };
  const leadingPlaces = {
    2: "dziesiątek",
    3: "setek",
    4: "tysięcy",
    5: "dziesiątek tysięcy",
    6: "setek tysięcy",
    7: "milionów"
  };
  const lengthSize = { mm: 1, cm: 10, dm: 100, m: 1000, km: 1000000 };
  const massSize = { g: 1, dag: 10, kg: 1000, t: 1000000 };
  const months = [
    ["styczeń", 31], ["luty", 28], ["marzec", 31], ["kwiecień", 30], ["maj", 31], ["czerwiec", 30],
    ["lipiec", 31], ["sierpień", 31], ["wrzesień", 30], ["październik", 31], ["listopad", 30], ["grudzień", 31]
  ];
  const weekdays = ["poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota", "niedziela"];
  const hourNom = [null, "pierwsza", "druga", "trzecia", "czwarta", "piąta", "szósta", "siódma", "ósma", "dziewiąta", "dziesiąta", "jedenasta", "dwunasta"];
  const hourGen = [null, "pierwszej", "drugiej", "trzeciej", "czwartej", "piątej", "szóstej", "siódmej", "ósmej", "dziewiątej", "dziesiątej", "jedenastej", "dwunastej"];
  const romanPairs = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];

  function distinctNumbers(count, min, max) {
    const found = new Set();
    while (found.size < count) found.add(rand(min, max));
    return [...found];
  }

  function moneyText(amount) {
    return `${amount.zl} zł ${String(amount.gr).padStart(2, "0")} gr`;
  }

  function toRoman(number) {
    return romanPairs.reduce((result, [value, symbol]) => {
      while (number >= value) {
        result += symbol;
        number -= value;
      }
      return result;
    }, "");
  }

  function isLeapYear(year) {
    if (year % 400 === 0) return true;
    if (year % 100 === 0) return false;
    return year % 4 === 0;
  }

  function clockText(hour, minute) {
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  function faceHour(hour24) {
    return hour24 % 12 === 0 ? 12 : hour24 % 12;
  }

  // The period belongs to the finished time, so „druga po południu” is 14:00 and not 02:00.
  function dayPeriod(hour24, minute) {
    if (hour24 === 12 && minute === 0) return "w południe";
    if (hour24 < 5) return "w nocy";
    if (hour24 < 12) return "rano";
    if (hour24 < 18) return "po południu";
    return "wieczorem";
  }

  function spokenTime(hour24, minute) {
    const period = dayPeriod(hour24, minute);
    const face = faceHour(hour24);
    if (minute === 0) return `${hourNom[face]} ${period}`;
    if (minute === 15) return `kwadrans po ${hourGen[face]} ${period}`;
    if (minute === 20) return `dwadzieścia po ${hourGen[face]} ${period}`;
    const next = faceHour((hour24 + 1) % 24);
    if (minute === 30) return `wpół do ${hourGen[next]} ${period}`;
    if (minute === 45) return `za kwadrans ${hourNom[next]} ${period}`;
    return `za dziesięć ${hourNom[next]} ${period}`;
  }

  function spokenHint(minute) {
    if (minute === 30) return "„Wpół do” danej godziny to 30 minut przed nią. Okres dnia wybiera czas 24-godzinny.";
    if (minute === 45) return "„Za kwadrans” oznacza 15 minut przed podaną godziną.";
    if (minute === 50) return "„Za dziesięć” oznacza 10 minut przed podaną godziną.";
    if (minute === 15) return "Kwadrans po godzinie to 15 minut.";
    if (minute === 20) return "Dwadzieścia po godzinie to 20 minut.";
    return "To pełna godzina. Słowo przy niej mówi, czy jest noc, rano, popołudnie czy wieczór.";
  }

  function measure(amount, unit, sizeOf) {
    return amount * sizeOf[unit];
  }

  function mixedMeasure(big, bigUnit, small, smallUnit, sizeOf) {
    return measure(big, bigUnit, sizeOf) + measure(small, smallUnit, sizeOf);
  }

  function decimalQuestions() {
    return Array.from({ length: 10 }, (_, index) => {
      if (index === 0 || index === 1) {
        const digits = rand(4, 8);
        const values = [rand(1, 9), ...Array.from({ length: digits - 1 }, () => rand(0, 9))];
        const number = Number(values.join(""));
        const fromRight = rand(0, digits - 1);
        const position = 10 ** fromRight;
        const digit = values[digits - 1 - fromRight];
        const place = placeNames[position];
        if (index === 0) {
          return question({
            label: "System dziesiątkowy",
            method: "pomnóż cyfrę przez miejsce",
            prompt: `W liczbie ${format(number)} jaka jest wartość cyfry ${digit} na miejscu ${place}?`,
            answer: digit * position,
            hint: `Cyfra na miejscu ${place} jest mnożona przez ${format(position)}.`,
            explanation: `${digit} · ${format(position)} = ${format(digit * position)}.`,
            visual: equation(format(number), "Cyfra ma wartość zależną od miejsca.")
          });
        }
        return question({
          label: "System dziesiątkowy",
          method: "licz miejsca od prawej",
          prompt: `W liczbie ${format(number)} która cyfra stoi na miejscu ${place}?`,
          answer: digit,
          hint: "Licz miejsca od prawej strony.",
          explanation: `Na miejscu ${place} stoi ${digit}.`,
          visual: equation(format(number), "Spójrz od prawej strony liczby.")
        });
      }
      if (index === 2) {
        const digits = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
        const answer = Number([...digits].sort((left, right) => right - left).join(""));
        return question({
          label: "System dziesiątkowy",
          method: "największa cyfra najbardziej z lewej",
          prompt: `Zapisz największą liczbę czterocyfrową z cyfr ${digits.join(", ")}, używając każdej tylko raz.`,
          answer,
          hint: "Największą cyfrę postaw najbardziej z lewej.",
          explanation: `Cyfry malejąco dają ${format(answer)}.`,
          visual: equation(digits.join(" | "), "Największe miejsca są po lewej.")
        });
      }
      if (index === 3) {
        const digits = rand(3, 7);
        const values = [rand(1, 9), ...Array.from({ length: digits - 1 }, () => rand(0, 9))];
        const number = Number(values.join(""));
        const answer = values.reduce((sum, digit) => sum + digit, 0);
        return question({
          label: "System dziesiątkowy",
          method: "dodaj same cyfry",
          prompt: `Jaka jest suma cyfr liczby ${format(number)}?`,
          answer,
          hint: "Dodaj wszystkie cyfry, także zera.",
          explanation: `${values.join(" + ")} = ${answer}.`,
          visual: equation(values.join(" + "), "Dodaj wszystkie cyfry.")
        });
      }
      if (index === 4) {
        const thousands = rand(10, 999);
        const rest = rand(1, 999);
        const number = thousands * 1000 + rest;
        return question({
          label: "System dziesiątkowy",
          method: "oddziel grupę tysięcy",
          prompt: `Ile pełnych tysięcy jest w liczbie ${format(number)}?`,
          answer: thousands,
          hint: "Pełne tysiące to grupy po 1000.",
          explanation: `${format(number)} = ${thousands} · 1000 + ${rest}.`,
          visual: equation(format(number), "Spójrz na grupę tysięcy.")
        });
      }
      if (index === 5) {
        const terms = [
          [rand(1, 9), 1000000],
          [rand(0, 9), 1000],
          [rand(0, 9), 100],
          [rand(1, 9), 10],
          [rand(0, 9), 1]
        ].filter(([digit]) => digit > 0).sort((left, right) => right[1] - left[1]);
        const answer = terms.reduce((sum, [digit, place]) => sum + digit * place, 0);
        const expression = terms.map(([digit, place]) => `${digit} · ${format(place)}`).join(" + ");
        return question({
          label: "System dziesiątkowy",
          method: "zsumuj wartości miejsc",
          prompt: `Oblicz: ${expression}.`,
          answer,
          hint: "Pomnóż każdą cyfrę przez jej miejsce, a potem dodaj wyniki.",
          explanation: `${expression} = ${format(answer)}.`,
          visual: equation(expression, "Każde miejsce ma swoją wartość.")
        });
      }
      if (index === 6) {
        const kind = rand(1, 4);
        let prompt;
        let answer;
        let explanation;
        if (kind === 1) {
          const count = rand(2, 999);
          answer = count * 1000;
          prompt = `Zapisz cyframi: ${count} tys.`;
          explanation = `${count} tys. = ${format(answer)}.`;
        } else if (kind === 2) {
          const count = rand(2, 999);
          answer = count * 1000000;
          prompt = `Zapisz cyframi: ${count} mln.`;
          explanation = `${count} mln = ${format(answer)}.`;
        } else if (kind === 3) {
          const count = rand(2, 9);
          answer = count * 1000000000;
          prompt = `Zapisz cyframi: ${count} mld.`;
          explanation = `${count} mld = ${format(answer)}.`;
        } else {
          const millions = rand(2, 99);
          const thousands = rand(1, 999);
          answer = millions * 1000000 + thousands * 1000;
          prompt = `Zapisz cyframi: ${millions} mln ${thousands} tys.`;
          explanation = `${millions} mln i ${thousands} tys. dają razem ${format(answer)}.`;
        }
        return question({
          label: "System dziesiątkowy",
          method: "rozwiń skrót",
          prompt,
          answer,
          hint: "tys. to tysiące, mln to miliony, a mld to miliardy.",
          explanation,
          visual: equation("tys. · 1000    mln · 1 000 000", "Skrót mówi, jaką grupę dopisać.")
        });
      }
      if (index === 7) {
        const kind = rand(1, 4);
        let prompt;
        let answer;
        let explanation;
        if (kind === 1) {
          const groups = rand(1, 9) * 10;
          answer = groups / 10;
          prompt = `Ile tysięcy to ${groups} setek?`;
          explanation = `${groups} · 100 = ${format(groups * 100)}, czyli ${polishCount(answer, "tysiąc", "tysiące", "tysięcy")}.`;
        } else if (kind === 2) {
          const thousands = rand(1, 9);
          answer = thousands * 10;
          prompt = `Ile setek to ${polishCount(thousands, "tysiąc", "tysiące", "tysięcy")}?`;
          explanation = `${format(thousands * 1000)} = ${answer} setek.`;
        } else if (kind === 3) {
          const millions = rand(1, 9);
          answer = millions * 1000;
          prompt = `Ile tysięcy to ${polishCount(millions, "milion", "miliony", "milionów")}?`;
          explanation = `${polishCount(millions, "milion", "miliony", "milionów")} = ${format(answer)} tysięcy.`;
        } else {
          const groups = rand(1, 9) * 10;
          answer = groups / 10;
          prompt = `Ile milionów to ${groups} setek tysięcy?`;
          explanation = `${groups} · 100 000 = ${format(groups * 100000)}, czyli ${polishCount(answer, "milion", "miliony", "milionów")}.`;
        }
        return question({
          label: "System dziesiątkowy",
          method: "zamień nazwę miejsca",
          prompt,
          answer,
          hint: "Porównaj, ile jedności ma jedna grupa i druga.",
          explanation,
          visual: equation("10 setek = 1 tysiąc", "Tysiąc to dziesięć setek.")
        });
      }
      if (index === 8) {
        const digits = rand(2, 9);
        const number = rand(10 ** (digits - 1), 10 ** digits - 1);
        return question({
          label: "System dziesiątkowy",
          method: "policz cyfry",
          prompt: `Ile cyfr ma liczba ${format(number)}?`,
          answer: digits,
          hint: "Policz cyfry, pomijając odstępy między grupami.",
          explanation: `${format(number)} ma ${digits} cyfr.`,
          visual: equation(format(number), "Odstępy tylko grupują cyfry.")
        });
      }
      const digits = rand(2, 7);
      const variant = rand(1, 3);
      if (variant === 1) {
        return question({
          label: "System dziesiątkowy",
          method: "jedynka i same zera",
          prompt: `Jaka jest najmniejsza liczba ${digitWords[digits]}?`,
          answer: 10 ** (digits - 1),
          hint: "Najmniejsza liczba o tylu cyfrach zaczyna się od 1.",
          explanation: `Najmniejsza liczba ${digitWords[digits]} to ${format(10 ** (digits - 1))}.`,
          visual: equation("1, a potem zera", "Tyle cyfr, ile trzeba.")
        });
      }
      if (variant === 2) {
        return question({
          label: "System dziesiątkowy",
          method: "same dziewiątki",
          prompt: `Jaka jest największa liczba ${digitWords[digits]}?`,
          answer: 10 ** digits - 1,
          hint: "Największą liczbę o tylu cyfrach zapisujesz samymi dziewiątkami.",
          explanation: `Największa liczba ${digitWords[digits]} to ${format(10 ** digits - 1)}.`,
          visual: equation("9 na każdym miejscu", "Więcej cyfr dałoby już większą liczbę.")
        });
      }
      const digit = rand(1, 9);
      const answer = digit * 10 ** (digits - 1);
      return question({
        label: "System dziesiątkowy",
        method: "jedna cyfra, reszta zer",
        prompt: `Liczba ${digitWords[digits]} ma cyfrę ${leadingPlaces[digits]} równą ${digit}, a pozostałe cyfry równe 0. Jaka to liczba?`,
        answer,
        hint: "Podana cyfra stoi najbardziej z lewej, a za nią są same zera.",
        explanation: `To liczba ${format(answer)}.`,
        visual: equation(`${digit} i zera`, "Pierwsza cyfra zajmuje najwyższe miejsce.")
      });
    });
  }

  function compareQuestions() {
    const equalSlot = rand(0, 4);
    return Array.from({ length: 10 }, (_, index) => {
      if (index <= 4) {
        const digits = rand(3, 6);
        const base = rand(10 ** (digits - 1), 10 ** digits - 1);
        const left = index === equalSlot ? base : base;
        const right = index === equalSlot ? base : Math.max(1, base - rand(1, Math.min(999, base - 1)));
        const ordered = index % 2 === 0 ? [left, right] : [right, left];
        const [first, second] = index === equalSlot ? [base, base] : ordered;
        const answer = first === second ? "=" : first > second ? ">" : "<";
        return question({
          label: "Porównywanie liczb",
          method: "porównuj od lewej",
          prompt: `Wstaw właściwy znak: ${format(first)} ? ${format(second)}.`,
          hint: "Gdy liczb jest tyle samo, porównuj cyfry od lewej. Więcej cyfr oznacza większą liczbę.",
          explanation: `${format(first)} ${answer} ${format(second)}.`,
          visual: equation(`${format(first)}  ?  ${format(second)}`, "Znak otwiera się w stronę większej liczby."),
          ...choice(answer, ["<", "=", ">"])
        });
      }
      if (index === 5 || index === 6) {
        const digits = rand(3, 6);
        const numbers = distinctNumbers(4, 10 ** (digits - 1), 10 ** digits - 1);
        const answer = index === 5 ? Math.max(...numbers) : Math.min(...numbers);
        const word = index === 5 ? "największa" : "najmniejsza";
        return question({
          label: "Porównywanie liczb",
          method: "porównuj od lewej",
          prompt: `Która z tych liczb jest ${word}?`,
          hint: "Porównuj cyfry od lewej strony.",
          explanation: `${word[0].toUpperCase()}${word.slice(1)} jest ${format(answer)}.`,
          visual: equation(numbers.map(format).join("   "), "Szukaj skrajnej liczby."),
          ...choice(answer, numbers.map((number) => ({ value: number, label: format(number) })))
        });
      }
      if (index === 7) {
        const low = rand(20, 9000);
        const high = low + rand(3, 25);
        const answer = high - low - 1;
        return question({
          label: "Porównywanie liczb",
          method: "odejmij końce i jeszcze 1",
          prompt: `Ile jest liczb naturalnych większych od ${format(low)} i mniejszych od ${format(high)}?`,
          answer,
          hint: "Od większej odejmij mniejszą, a potem odejmij jeszcze 1.",
          explanation: `Między ${format(low)} a ${format(high)} jest ${high} − ${low} − 1 = ${answer} liczb.`,
          visual: equation(`${format(low)} < ? < ${format(high)}`, "Końce przedziału nie wchodzą do wyniku.")
        });
      }
      const family = index === 8 ? pick(["sum", "difference"]) : pick(["product", "quotient"]);
      let leftText;
      let rightText;
      let left;
      let right;
      let hint;
      let explanation;
      if (family === "sum") {
        const shared = rand(30, 400);
        const first = rand(5, 80);
        let second = rand(5, 80);
        while (second === first) second = rand(5, 80);
        left = shared + first;
        right = shared + second;
        leftText = `${shared} + ${first}`;
        rightText = `${shared} + ${second}`;
        hint = "Oba działania mają ten sam pierwszy składnik. Porównaj tylko drugie.";
        explanation = `${first} ${first < second ? "<" : ">"} ${second}, więc ${leftText} ${left < right ? "<" : ">"} ${rightText}.`;
      } else if (family === "difference") {
        const shared = rand(300, 900);
        const first = rand(10, 80);
        let second = rand(10, 80);
        while (second === first) second = rand(10, 80);
        left = shared - first;
        right = shared - second;
        leftText = `${shared} − ${first}`;
        rightText = `${shared} − ${second}`;
        hint = "Od tej samej liczby odejmujesz raz mniej, raz więcej. Mniejsze odjęcie zostawia więcej.";
        explanation = `Odjęte ${first} ${first < second ? "<" : ">"} ${second}, więc ${leftText} ${left < right ? "<" : ">"} ${rightText}.`;
      } else if (family === "product") {
        const shared = rand(3, 12);
        const first = rand(2, 9);
        let second = rand(2, 9);
        while (second === first) second = rand(2, 9);
        left = shared * first;
        right = shared * second;
        leftText = `${shared} · ${first}`;
        rightText = `${shared} · ${second}`;
        hint = "Wspólny czynnik jest dodatni. Porównaj tylko drugie czynniki.";
        explanation = `${first} ${first < second ? "<" : ">"} ${second}, więc ${leftText} ${left < right ? "<" : ">"} ${rightText}.`;
      } else {
        const first = pick([2, 4, 5, 8, 10]);
        let second = pick([2, 4, 5, 8, 10]);
        while (second === first) second = pick([2, 4, 5, 8, 10]);
        const dividend = rand(3, 20) * first * second;
        left = dividend / first;
        right = dividend / second;
        leftText = `${dividend} : ${first}`;
        rightText = `${dividend} : ${second}`;
        hint = "Dzielna jest taka sama. Większy dzielnik daje mniejszy iloraz.";
        explanation = `Dzielnik ${first} ${first < second ? "<" : ">"} ${second}, więc ${leftText} ${left < right ? "<" : ">"} ${rightText}.`;
      }
      const answer = left < right ? "<" : ">";
      return question({
        label: "Porównywanie liczb",
        method: "porównaj tylko różnicę",
        prompt: `Nie wykonując działań, wstaw znak: ${leftText} ? ${rightText}.`,
        hint,
        explanation,
        visual: equation(`${leftText}  ?  ${rightText}`, "Nie musisz liczyć całych wyników."),
        ...choice(answer, ["<", ">"])
      });
    });
  }

  function largeNumberQuestions() {
    return Array.from({ length: 10 }, (_, index) => {
      if (index === 0) {
        const left = rand(12, 90) * 1000;
        const right = rand(5, 40) * 1000;
        const answer = left + right;
        return question({
          label: "Rachunki na dużych liczbach",
          method: "dodaj tysiące",
          prompt: `Oblicz: ${format(left)} + ${format(right)}.`,
          answer,
          hint: "Połącz tysiące.",
          explanation: `${format(left)} + ${format(right)} = ${format(answer)}.`,
          visual: equation(`${format(left)} + ${format(right)}`, "Zera na końcu zostają.")
        });
      }
      if (index === 1) {
        const right = rand(10, 60) * 1000;
        const left = right + rand(10, 60) * 1000;
        const answer = left - right;
        return question({
          label: "Rachunki na dużych liczbach",
          method: "odejmij tysiące",
          prompt: `Oblicz: ${format(left)} − ${format(right)}.`,
          answer,
          hint: "Odejmij tysiące.",
          explanation: `${format(left)} − ${format(right)} = ${format(answer)}.`,
          visual: equation(`${format(left)} − ${format(right)}`, "Odejmij grupy tysięcy.")
        });
      }
      if (index === 2) {
        const value = rand(11, 99);
        const scale = pick([100, 1000]);
        const answer = value * scale;
        return question({
          label: "Rachunki na dużych liczbach",
          method: "dopisz zera",
          prompt: `Oblicz: ${value} · ${scale}.`,
          answer,
          hint: `Dopisz ${Math.log10(scale)} zera.`,
          explanation: `${value} · ${scale} = ${format(answer)}.`,
          visual: equation(`${value} · ${scale}`, "Mnożenie przez 10, 100 lub 1000 dopisuje zera.")
        });
      }
      if (index === 3) {
        const scale = pick([10, 100, 1000]);
        const answer = rand(12, 999);
        return question({
          label: "Rachunki na dużych liczbach",
          method: "skreśl zera",
          prompt: `Oblicz: ${format(answer * scale)} : ${scale}.`,
          answer,
          hint: `Skreśl ${Math.log10(scale)} zera.`,
          explanation: `${format(answer * scale)} : ${scale} = ${answer}.`,
          visual: equation(`${format(answer * scale)} : ${scale}`, "Dzielenie przez 10, 100 lub 1000 skreśla zera.")
        });
      }
      if (index === 4 || index === 9) {
        const step = rand(1, 9) * (index === 4 ? 100 : 1000);
        const base = rand(20, 80) * step + (index === 9 ? step : 0);
        const answer = index === 4 ? base + step : base - step;
        const word = index === 4 ? "większa" : "mniejsza";
        const start = index === 4 ? base : base;
        return question({
          label: "Rachunki na dużych liczbach",
          method: index === 4 ? "dodaj różnicę" : "odejmij różnicę",
          prompt: `Jaka liczba jest o ${format(step)} ${word} od ${format(start)}?`,
          answer,
          hint: index === 4 ? "Dodaj wskazaną liczbę." : "Odejmij wskazaną liczbę.",
          explanation: `${format(start)} ${index === 4 ? "+" : "−"} ${format(step)} = ${format(answer)}.`,
          visual: equation(`${format(start)} ${index === 4 ? "+" : "−"} ${format(step)}`, "Zmienia się tylko podana różnica.")
        });
      }
      if (index === 5) {
        const target = pick([1000, 10000, 100000]);
        const have = rand(1, 9) * (target / 10);
        const answer = target - have;
        return question({
          label: "Rachunki na dużych liczbach",
          method: "uzupełnij do okrągłej",
          prompt: `Ile trzeba dodać do ${format(have)}, aby otrzymać ${format(target)}?`,
          answer,
          hint: "Odejmij podaną liczbę od celu.",
          explanation: `${format(target)} − ${format(have)} = ${format(answer)}.`,
          visual: equation(`${format(have)} + ? = ${format(target)}`, "Szukasz brakującego składnika.")
        });
      }
      if (index === 6) {
        const factor = pick([2, 3, 4, 5]);
        const scale = pick([10, 100, 1000]);
        const base = rand(2, scale === 1000 ? 20 : 40) * scale;
        const larger = Math.random() < 0.5;
        const answer = larger ? base * factor : base;
        const shown = larger ? base : base * factor;
        return question({
          label: "Rachunki na dużych liczbach",
          method: larger ? "pomnóż przez czynnik" : "podziel przez czynnik",
          prompt: `Jaka liczba jest ${factor} razy ${larger ? "większa" : "mniejsza"} od ${format(shown)}?`,
          answer,
          hint: larger ? `Pomnóż przez ${factor}.` : `Podziel przez ${factor}.`,
          explanation: larger
            ? `${format(shown)} · ${factor} = ${format(answer)}.`
            : `${format(shown)} : ${factor} = ${format(answer)}.`,
          visual: equation(larger ? `${format(shown)} · ${factor}` : `${format(shown)} : ${factor}`, "Czynnik mówi, ile razy.")
        });
      }
      if (index === 7) {
        const left = rand(2, 9) * pick([10, 100]);
        const right = rand(2, 9) * pick([10, 100]);
        const answer = left * right;
        return question({
          label: "Rachunki na dużych liczbach",
          method: "pomnóż bez zer i dopisz je",
          prompt: `Oblicz: ${format(left)} · ${format(right)}.`,
          answer,
          hint: "Pomnóż liczby bez końcowych zer, a potem dopisz wszystkie zera.",
          explanation: `${format(left)} · ${format(right)} = ${format(answer)}.`,
          visual: equation(`${format(left)} · ${format(right)}`, "Końcowe zera dopisujesz na końcu.")
        });
      }
      const divisor = rand(2, 9) * pick([10, 100]);
      const quotient = rand(2, 9) * pick([10, 100]);
      const dividend = divisor * quotient;
      return question({
        label: "Rachunki na dużych liczbach",
        method: "skreśl wspólne zera",
        prompt: `Oblicz: ${format(dividend)} : ${format(divisor)}.`,
        answer: quotient,
        hint: "Skreśl tyle samo zer w dzielnej i dzielniku, a potem podziel.",
        explanation: `${format(dividend)} : ${format(divisor)} = ${format(quotient)}.`,
        visual: equation(`${format(dividend)} : ${format(divisor)}`, "Wynik jest liczbą całkowitą.")
      });
    });
  }

  function moneyQuestions() {
    const amount = () => ({ zl: rand(1, 30), gr: rand(0, 99) });
    const gross = (value) => value.zl * 100 + value.gr;
    return Array.from({ length: 10 }, (_, index) => {
      if (index === 0) {
        const value = amount();
        const answer = gross(value);
        return question({
          label: "Złote i grosze",
          method: "zamień złote na grosze",
          prompt: `Ile groszy to ${moneyText(value)}?`,
          answer,
          hint: "Jeden złoty to 100 groszy.",
          explanation: `${value.zl} · 100 + ${value.gr} = ${answer} gr.`,
          visual: equation("1 zł = 100 gr", "Dodaj grosze po zamianie złotych.")
        });
      }
      if (index === 1) {
        const first = amount();
        const second = amount();
        const answer = gross(first) + gross(second);
        return question({
          label: "Złote i grosze",
          method: "dodaj w groszach",
          prompt: `Ile groszy kosztują razem ${moneyText(first)} i ${moneyText(second)}?`,
          answer,
          hint: "Zamień obie kwoty na grosze i dodaj.",
          explanation: `${gross(first)} gr + ${gross(second)} gr = ${answer} gr.`,
          visual: equation("1 zł = 100 gr", "Najpierw wspólna jednostka.")
        });
      }
      if (index === 2) {
        const price = amount();
        const paid = gross(price) + rand(1, 12) * 100;
        const answer = paid - gross(price);
        return question({
          label: "Złote i grosze",
          method: "odejmij cenę od wpłaty",
          prompt: `Produkt kosztuje ${moneyText(price)}. Ile groszy reszty dostaniesz z ${format(paid)} gr?`,
          answer,
          hint: "Odejmij cenę od wpłaconej kwoty.",
          explanation: `${paid} gr − ${gross(price)} gr = ${answer} gr.`,
          visual: equation("reszta = wpłata − cena", "Obie kwoty są już w groszach.")
        });
      }
      if (index === 3) {
        const count = rand(2, 9);
        const price = rand(1, 15) * 100;
        const answer = count * price;
        return question({
          label: "Złote i grosze",
          method: "pomnóż cenę przez liczbę",
          prompt: `Ile groszy ${polishVerb(count, "kosztuje", "kosztują")} ${polishCount(count, "bilet", "bilety", "biletów")} po ${format(price)} gr?`,
          answer,
          hint: "Pomnóż cenę jednego biletu przez ich liczbę.",
          explanation: `${count} · ${price} gr = ${answer} gr.`,
          visual: equation(`${count} · ${price} gr`, "Każdy bilet kosztuje tyle samo.")
        });
      }
      if (index === 4 || index === 5) {
        const zl = rand(1, 40);
        const gr = index === 5 ? rand(1, 99) : rand(0, 99);
        const total = zl * 100 + gr;
        if (index === 4) {
          return question({
            label: "Złote i grosze",
            method: "oddziel pełne złote",
            prompt: `Ile pełnych złotych jest w kwocie ${total} gr?`,
            answer: zl,
            hint: "100 groszy to jeden złoty. Reszta groszy nie tworzy kolejnego złotego.",
            explanation: `${total} gr = ${zl} zł ${gr} gr, więc pełnych złotych jest ${zl}.`,
            visual: equation(`${total} gr`, "Dzielisz przez 100 i zostawiasz całość.")
          });
        }
        return question({
          label: "Złote i grosze",
          method: "zostaw resztę z dzielenia przez 100",
          prompt: `Ile groszy zostanie, gdy z ${total} gr odliczysz pełne złote?`,
          answer: gr,
          hint: "Po odjęciu pełnych setek zostają grosze poniżej 100.",
          explanation: `${total} gr = ${zl} zł i ${gr} gr.`,
          visual: equation(`${zl} zł ${gr} gr`, "Szukasz tylko groszy.")
        });
      }
      if (index === 6) {
        const note = pick([20, 50, 100]);
        const zl = rand(1, note - 1);
        const gr = rand(0, 99);
        const price = zl * 100 + gr;
        const answer = note * 100 - price;
        const priceText = gr === 0 ? `${zl} zł` : `${zl} zł ${gr} gr`;
        return question({
          label: "Złote i grosze",
          method: "odejmij cenę od banknotu",
          prompt: `Zakup kosztuje ${priceText}. Płacisz banknotem ${note} zł. Ile groszy reszty otrzymasz?`,
          answer,
          hint: "Zamień banknot na grosze i odejmij cenę.",
          explanation: `${note * 100} gr − ${price} gr = ${answer} gr.`,
          visual: equation(`${note} zł − ${priceText}`, "Reszta wychodzi w groszach.")
        });
      }
      if (index === 7) {
        const first = amount();
        let secondGross = rand(100, 4000);
        while (secondGross === gross(first)) secondGross = rand(100, 4000);
        const firstText = moneyText(first);
        const secondText = `${secondGross} gr`;
        const answer = gross(first) > secondGross ? "pierwsza" : "druga";
        return question({
          label: "Złote i grosze",
          method: "zamień obie kwoty na grosze",
          prompt: `Która kwota jest większa: ${firstText} czy ${secondText}?`,
          hint: "Zamień złote na grosze i porównaj liczby.",
          explanation: `${firstText} to ${gross(first)} gr, a druga kwota to ${secondGross} gr.`,
          visual: equation(`${gross(first)} gr   ?   ${secondGross} gr`, "Większa liczba groszy to większa kwota."),
          ...choice(answer, [
            { value: "pierwsza", label: firstText },
            { value: "druga", label: secondText }
          ])
        });
      }
      if (index === 8) {
        const count = rand(2, 9);
        const zl = rand(1, 12);
        const gr = rand(0, 99);
        const answer = count * (zl * 100 + gr);
        return question({
          label: "Złote i grosze",
          method: "pomnóż cenę w groszach",
          prompt: `Ile groszy ${polishVerb(count, "kosztuje", "kosztują")} ${polishCount(count, "zeszyt", "zeszyty", "zeszytów")} po ${zl} zł ${String(gr).padStart(2, "0")} gr?`,
          answer,
          hint: "Zamień cenę jednego zeszytu na grosze i pomnóż przez liczbę zeszytów.",
          explanation: `Jeden zeszyt to ${zl * 100 + gr} gr, więc ${count} · ${zl * 100 + gr} = ${answer} gr.`,
          visual: equation(`${count} · ${zl * 100 + gr} gr`, "Wspólna jednostka to grosz.")
        });
      }
      const zl = rand(1, 15) * 2;
      const answer = (zl / 2) * 100;
      return question({
        label: "Złote i grosze",
        method: "weź połowę ceny",
        prompt: `Kilogram jabłek kosztuje ${zl} zł. Ile groszy kosztuje pół kilograma?`,
        answer,
        hint: "Pół kilograma kosztuje połowę ceny kilograma. Potem zamień złote na grosze.",
        explanation: `${zl} zł : 2 = ${zl / 2} zł = ${answer} gr.`,
        visual: equation(`${zl} zł : 2`, "Połowa kilograma to połowa ceny.")
      });
    });
  }

  function lengthQuestions() {
    const smaller = [
      ["cm", "mm", 2, 99], ["dm", "cm", 2, 40], ["m", "dm", 2, 40], ["m", "cm", 2, 20], ["km", "m", 2, 20]
    ];
    const larger = [
      ["mm", "cm"], ["cm", "dm"], ["cm", "m"], ["dm", "m"], ["m", "km"]
    ];
    const mixed = [
      ["cm", "mm", 9], ["dm", "cm", 9], ["m", "cm", 99], ["km", "m", 999]
    ];
    return Array.from({ length: 10 }, (_, index) => {
      if (index <= 2) {
        const [from, to, min, max] = smaller[index % smaller.length];
        const value = rand(min, max);
        const answer = value * (lengthSize[from] / lengthSize[to]);
        return question({
          label: "Jednostki długości",
          method: "pomnóż przy zamianie na mniejszą",
          prompt: `Ile ${to} ma ${value} ${from}?`,
          answer,
          hint: `1 ${from} to ${lengthSize[from] / lengthSize[to]} ${to}.`,
          explanation: `${value} · ${lengthSize[from] / lengthSize[to]} = ${answer} ${to}.`,
          visual: equation("mm → cm → dm → m → km", "W stronę mniejszej jednostki mnożysz.")
        });
      }
      if (index === 3 || index === 4) {
        const [from, to] = larger[rand(0, larger.length - 1)];
        const answer = rand(2, to === "km" ? 20 : 40);
        const shown = answer * (lengthSize[to] / lengthSize[from]);
        return question({
          label: "Jednostki długości",
          method: "podziel przy zamianie na większą",
          prompt: `Ile ${to} ma ${shown} ${from}?`,
          answer,
          hint: `1 ${to} to ${lengthSize[to] / lengthSize[from]} ${from}.`,
          explanation: `${shown} : ${lengthSize[to] / lengthSize[from]} = ${answer} ${to}.`,
          visual: equation("km → m → dm → cm → mm", "W stronę większej jednostki dzielisz.")
        });
      }
      if (index === 5 || index === 6) {
        const [big, small, smallMax] = mixed[rand(0, mixed.length - 1)];
        const bigCount = rand(2, big === "km" ? 12 : 20);
        const smallCount = rand(1, smallMax);
        const answer = mixedMeasure(bigCount, big, smallCount, small, lengthSize) / lengthSize[small];
        return question({
          label: "Jednostki długości",
          method: "zamień część większą i dodaj",
          prompt: `Ile ${small} ma ${bigCount} ${big} ${smallCount} ${small}?`,
          answer,
          hint: `Najpierw zamień ${big} na ${small}, a potem dodaj ${small}.`,
          explanation: `${bigCount} ${big} = ${bigCount * lengthSize[big] / lengthSize[small]} ${small}, razem ${answer} ${small}.`,
          visual: equation(`${bigCount} ${big} + ${smallCount} ${small}`, "Wynik jest w mniejszej jednostce.")
        });
      }
      if (index === 7) {
        const [big, small, smallMax] = mixed[rand(0, mixed.length - 1)];
        const leftBig = rand(1, 8);
        const rightBig = rand(1, 8);
        const leftSmall = rand(1, smallMax);
        const rightSmall = rand(1, smallMax);
        const answer = (mixedMeasure(leftBig, big, leftSmall, small, lengthSize) + mixedMeasure(rightBig, big, rightSmall, small, lengthSize)) / lengthSize[small];
        return question({
          label: "Jednostki długości",
          method: "dodaj we wspólnej jednostce",
          prompt: `Dodaj ${leftBig} ${big} ${leftSmall} ${small} i ${rightBig} ${big} ${rightSmall} ${small}. Podaj wynik w ${small}.`,
          answer,
          hint: `Zamień obie długości na ${small} i dodaj.`,
          explanation: `Suma wynosi ${answer} ${small}.`,
          visual: equation(`${leftBig} ${big} ${leftSmall} ${small} + ${rightBig} ${big} ${rightSmall} ${small}`, `Wynik podajesz w ${small}.`)
        });
      }
      const pairs = [["m", "cm"], ["km", "m"], ["m", "dm"], ["dm", "cm"], ["cm", "mm"]];
      const [big, small] = pairs[index === 8 ? rand(0, pairs.length - 1) : rand(0, pairs.length - 1)];
      const amount = rand(2, 12);
      const answer = lengthSize[big] / lengthSize[small];
      const word = index === 8 ? "dłuższy" : "dłuższy";
      return question({
        label: "Jednostki długości",
        method: "porównaj jednostki",
        prompt: `Ile razy ${word} jest odcinek ${amount} ${big} od odcinka ${amount} ${small}?`,
        answer,
        hint: "Liczby z przodu są takie same, więc zostaje stosunek jednostek.",
        explanation: `1 ${big} = ${answer} ${small}, więc odcinek jest ${answer} razy dłuższy.`,
        visual: equation(`1 ${big} = ${answer} ${small}`, "Ta sama liczba, inna jednostka.")
      });
    });
  }

  function massQuestions() {
    const smaller = [
      ["dag", "g", 2, 40], ["kg", "dag", 2, 20], ["kg", "g", 2, 9], ["t", "kg", 2, 12]
    ];
    const larger = [
      ["g", "dag"], ["dag", "kg"], ["g", "kg"], ["kg", "t"]
    ];
    const mixed = [
      ["kg", "g", 999], ["kg", "dag", 99], ["t", "kg", 999], ["dag", "g", 9]
    ];
    return Array.from({ length: 10 }, (_, index) => {
      if (index <= 2) {
        const [from, to, min, max] = smaller[index % smaller.length];
        const value = rand(min, max);
        const answer = value * (massSize[from] / massSize[to]);
        return question({
          label: "Jednostki masy",
          method: "pomnóż przy zamianie na mniejszą",
          prompt: `Ile ${to} ma ${value} ${from}?`,
          answer,
          hint: `1 ${from} to ${massSize[from] / massSize[to]} ${to}.`,
          explanation: `${value} · ${massSize[from] / massSize[to]} = ${answer} ${to}.`,
          visual: equation("g → dag → kg → t", "W stronę mniejszej jednostki mnożysz.")
        });
      }
      if (index === 3 || index === 4) {
        const [from, to] = larger[rand(0, larger.length - 1)];
        const answer = rand(2, to === "t" ? 9 : 40);
        const shown = answer * (massSize[to] / massSize[from]);
        return question({
          label: "Jednostki masy",
          method: "podziel przy zamianie na większą",
          prompt: `Ile ${to} waży ${shown} ${from}?`,
          answer,
          hint: `1 ${to} to ${massSize[to] / massSize[from]} ${from}.`,
          explanation: `${shown} : ${massSize[to] / massSize[from]} = ${answer} ${to}.`,
          visual: equation("t → kg → dag → g", "W stronę większej jednostki dzielisz.")
        });
      }
      if (index === 5 || index === 6) {
        const [big, small, smallMax] = mixed[rand(0, mixed.length - 1)];
        const bigCount = rand(2, big === "t" ? 8 : 12);
        const smallCount = rand(1, Math.min(smallMax, 80));
        const answer = mixedMeasure(bigCount, big, smallCount, small, massSize) / massSize[small];
        return question({
          label: "Jednostki masy",
          method: "zamień część większą i dodaj",
          prompt: `Ile ${small} waży ${bigCount} ${big} ${smallCount} ${small}?`,
          answer,
          hint: `Zamień ${big} na ${small} i dodaj resztę.`,
          explanation: `${bigCount} ${big} = ${bigCount * massSize[big] / massSize[small]} ${small}, razem ${answer} ${small}.`,
          visual: equation(`${bigCount} ${big} + ${smallCount} ${small}`, "Wynik jest w mniejszej jednostce.")
        });
      }
      if (index === 7 || index === 9) {
        const pairs = [["kg", "g"], ["kg", "dag"], ["t", "kg"], ["dag", "g"]];
        const [big, small] = pairs[rand(0, pairs.length - 1)];
        const amount = rand(2, 9);
        const answer = massSize[big] / massSize[small];
        return question({
          label: "Jednostki masy",
          method: "porównaj jednostki",
          prompt: `Ile razy cięższy jest ładunek ${amount} ${big} od ładunku ${amount} ${small}?`,
          answer,
          hint: "Liczby z przodu są takie same, więc zostaje stosunek jednostek.",
          explanation: `1 ${big} = ${answer} ${small}, więc ładunek jest ${answer} razy cięższy.`,
          visual: equation(`1 ${big} = ${answer} ${small}`, "Ta sama liczba, inna jednostka.")
        });
      }
      const netto = rand(2, 40) * 10;
      const taraDag = rand(1, 9);
      const answer = netto + taraDag * 10;
      return question({
        label: "Jednostki masy",
        method: "dodaj netto i tarę",
        prompt: `Jaka jest masa brutto w gramach, gdy masa netto to ${netto} g, a tara waży ${taraDag} dag?`,
        answer,
        hint: "Masa brutto to netto plus opakowanie. Zamień tarę na gramy.",
        explanation: `${netto} g + ${taraDag} dag = ${netto} g + ${taraDag * 10} g = ${answer} g.`,
        visual: equation("brutto = netto + tara", "Najpierw wspólna jednostka.")
      });
    });
  }

  function romanQuestions() {
    const illegal = [
      ["IIII", "Cztery jedynki z rzędu zastępujemy zapisem IV."],
      ["VV", "Znak V nie powtarza się. Dziesięć zapisujemy jako X."],
      ["XXXX", "Cztery dziesiątki z rzędu zastępujemy zapisem XL."],
      ["IC", "I odejmujemy tylko przed V albo X."],
      ["IL", "I nie stoi przed L."],
      ["IM", "I nie stoi przed M."],
      ["VX", "V nie stoi przed większym znakiem. Piętnaście to XV."],
      ["DD", "Znak D nie powtarza się. Tysiąc to M."],
      ["LC", "L nie stoi przed C."]
    ];
    return Array.from({ length: 10 }, (_, index) => {
      if (index >= 8) {
        const [bad, reason] = pick(illegal);
        const good = [toRoman(rand(1, 39)), toRoman(rand(40, 499))];
        return question({
          label: "System rzymski",
          method: "sprawdź reguły zapisu",
          prompt: "Który zapis nie jest poprawną liczbą rzymską?",
          hint: "Ten sam znak powtarza się najwyżej trzy razy. Odejmowanie działa tylko w parach IV, IX, XL, XC, CD i CM.",
          explanation: `${bad} nie jest poprawne. ${reason}`,
          visual: equation("I  V  X  L  C  D  M", "IV = 4, IX = 9, XL = 40, XC = 90."),
          ...choice(bad, shuffle([bad, ...good]))
        });
      }
      const number = index < 4 ? rand(1, 39) : rand(40, 1999);
      const value = toRoman(number);
      if (index % 2 === 0) {
        return question({
          checker: "roman",
          label: "System rzymski",
          method: "zapisuj od największego znaku",
          prompt: `Zapisz liczbę ${number} cyframi rzymskimi.`,
          answer: value,
          hint: "I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000. Mniejszy znak przed większym odejmujesz.",
          explanation: `${number} zapisujemy ${value}.`,
          visual: equation("I  V  X  L  C  D  M", "IV = 4, IX = 9, XL = 40, XC = 90.")
        });
      }
      return question({
        label: "System rzymski",
        method: "dodawaj albo odejmuj znaki",
        prompt: `Odczytaj liczbę rzymską ${value}.`,
        answer: number,
        hint: "Dodawaj wartości znaków. Mniejszy znak przed większym odejmij.",
        explanation: `${value} = ${number}.`,
        visual: equation(value, "Odczytaj znaki od lewej strony.")
      });
    });
  }

  function calendarQuestions() {
    return Array.from({ length: 10 }, (_, index) => {
      if (index === 0) {
        const pool = months.filter(([name]) => name !== "luty");
        const [month, total] = pick(pool);
        return question({
          label: "Kalendarz",
          method: "przypomnij długość miesiąca",
          prompt: `Ile dni ma ${month}?`,
          answer: total,
          hint: "Miesiące mają 30 albo 31 dni. Luty jest wyjątkiem.",
          explanation: `${month[0].toUpperCase()}${month.slice(1)} ma ${total} dni.`,
          visual: equation("30 albo 31, a luty osobno", "Kwiecień, czerwiec, wrzesień i listopad mają 30 dni.")
        });
      }
      if (index === 1) {
        const start = rand(0, 6);
        const after = rand(1, 20);
        const target = (start + after) % 7;
        const options = shuffle([target, (target + 1) % 7, (target + 3) % 7].map((day) => weekdays[day]));
        return question({
          label: "Kalendarz",
          method: "licz resztę z dzielenia przez 7",
          prompt: `Jeśli dziś jest ${weekdays[start]}, jaki dzień będzie za ${after} dni?`,
          hint: "Co 7 dni dzień tygodnia się powtarza.",
          explanation: `${weekdays[start]} za ${after} dni to ${weekdays[target]}.`,
          visual: equation(`${weekdays[start]} + ${after} dni`, "Zostaw resztę z dzielenia przez 7."),
          ...choice(weekdays[target], options)
        });
      }
      if (index === 2) {
        const century = rand(16, 21);
        const year = (century - 1) * 100 + rand(1, 100);
        return question({
          label: "Kalendarz",
          method: "wiek kończy się rokiem setek",
          prompt: `W którym wieku leży rok ${year}?`,
          answer: century,
          hint: "Wiek kończy się rokiem zakończonym dwoma zerami. Rok 2000 należy do XX wieku.",
          explanation: `Lata ${(century - 1) * 100 + 1}–${century * 100} należą do ${century}. wieku.`,
          visual: equation(`${(century - 1) * 100 + 1}–${century * 100}`, "Ostatni rok wieku ma dwa zera.")
        });
      }
      if (index === 3) {
        const common = Math.random() < 0.5;
        return question({
          label: "Kalendarz",
          method: "odróżnij luty zwykły od przestępnego",
          prompt: `Ile dni ma luty w roku ${common ? "zwykłym" : "przestępnym"}?`,
          answer: common ? 28 : 29,
          hint: common ? "W roku zwykłym luty ma 28 dni." : "W roku przestępnym luty ma 29 dni.",
          explanation: common ? "Rok zwykły ma 365 dni, a luty 28." : "Rok przestępny ma 366 dni, a luty 29.",
          visual: equation(common ? "365 dni" : "366 dni", "Zmienia się tylko luty.")
        });
      }
      if (index === 4) {
        const year = Math.random() < 0.4 ? pick([1900, 2000, 2100]) : rand(1996, 2032);
        const leap = isLeapYear(year);
        return question({
          label: "Kalendarz",
          method: "sprawdź podzielność roku",
          prompt: `Czy rok ${year} jest przestępny?`,
          hint: year % 100 === 0
            ? "Rok setek jest przestępny tylko wtedy, gdy dzieli się przez 400."
            : "Rok przestępny dzieli się przez 4.",
          explanation: leap
            ? `${year} jest przestępny, więc luty ma wtedy 29 dni.`
            : `${year} nie jest przestępny, więc luty ma wtedy 28 dni.`,
          visual: equation(String(year), "Rok zwykły ma 365 dni, przestępny 366."),
          ...choice(leap ? "tak" : "nie", ["tak", "nie"])
        });
      }
      if (index === 5) {
        const month = rand(1, 12);
        const day = rand(1, 28);
        const year = rand(1998, 2030);
        const roman = Math.random() < 0.5;
        const stamp = roman ? `${day} ${toRoman(month)} ${year}` : `${day}.${String(month).padStart(2, "0")}.${year}`;
        return question({
          label: "Kalendarz",
          method: "odczytaj miesiąc z daty",
          prompt: `Który to miesiąc w dacie ${stamp}? Podaj numer miesiąca.`,
          answer: month,
          hint: roman ? "Miesiąc rzymski odczytaj jak liczbę od I do XII." : "W dacie z kropkami miesiąc stoi w środku.",
          explanation: `${stamp} to miesiąc numer ${month}.`,
          visual: equation(stamp, roman ? "Środkowy człon jest rzymski." : "Środkowa liczba to miesiąc.")
        });
      }
      if (index === 6) {
        const weeks = rand(1, 8);
        const days = rand(0, 6);
        const answer = weeks * 7 + days;
        const weekText = polishCount(weeks, "tydzień", "tygodnie", "tygodni");
        const prompt = days === 0
          ? `Ile dni to ${weekText}?`
          : `Ile dni to ${weekText} i ${polishCount(days, "dzień", "dni", "dni")}?`;
        return question({
          label: "Kalendarz",
          method: "tydzień ma 7 dni",
          prompt,
          answer,
          hint: "Jeden tydzień to 7 dni.",
          explanation: days === 0
            ? `${weeks} · 7 = ${answer}.`
            : `${weeks} · 7 + ${days} = ${answer}.`,
          visual: equation("1 tydzień = 7 dni", "Najpierw tygodnie, potem pojedyncze dni.")
        });
      }
      if (index === 7) {
        const quarter = pick([
          ["I", "roku zwykłego", 90],
          ["I", "roku przestępnego", 91],
          ["II", "", 91],
          ["III", "", 92],
          ["IV", "", 92]
        ]);
        const [name, qualifier, answer] = quarter;
        const tail = qualifier ? ` ${qualifier}` : "";
        return question({
          label: "Kalendarz",
          method: "dodaj dni trzech miesięcy",
          prompt: `Ile dni ma ${name} kwartał${tail}?`,
          answer,
          hint: name === "I"
            ? "I kwartał to styczeń, luty i marzec. W lutym sprawdź, czy rok jest przestępny."
            : "Dodaj dni trzech miesięcy tego kwartału.",
          explanation: `${name} kwartał${tail} ma ${answer} dni.`,
          visual: equation("rok = 4 kwartały", "Kwartał to trzy miesiące.")
        });
      }
      if (index === 8) {
        const years = rand(1, 6);
        const extra = rand(0, 11);
        const answer = years * 12 + extra;
        const yearText = polishCount(years, "rok", "lata", "lat");
        const prompt = extra === 0
          ? `Ile miesięcy to ${yearText}?`
          : `Ile miesięcy to ${yearText} i ${polishCount(extra, "miesiąc", "miesiące", "miesięcy")}?`;
        return question({
          label: "Kalendarz",
          method: "rok ma 12 miesięcy",
          prompt,
          answer,
          hint: "Jeden rok to 12 miesięcy.",
          explanation: extra === 0 ? `${years} · 12 = ${answer}.` : `${years} · 12 + ${extra} = ${answer}.`,
          visual: equation("1 rok = 12 miesięcy", "Najpierw lata, potem miesiące.")
        });
      }
      if (Math.random() < 0.5) {
        const days = pick([30, 31]);
        const answer = days === 30 ? 4 : 7;
        return question({
          label: "Kalendarz",
          method: "policz miesiące o tej długości",
          prompt: `Ile miesięcy w roku ma ${days} dni?`,
          answer,
          hint: "Luty nie ma ani 30, ani 31 dni. Zostałe jedenaście miesięcy.",
          explanation: days === 30
            ? "30 dni mają kwiecień, czerwiec, wrzesień i listopad, czyli 4 miesiące."
            : "31 dni ma siedem miesięcy.",
          visual: equation(days === 30 ? "IV, VI, IX, XI" : "siedem miesięcy", "Luty liczysz osobno.")
        });
      }
      const current = rand(0, 11);
      const next = (current + 1) % 12;
      const options = shuffle([next, (next + 1) % 12, (current + 11) % 12].map((item) => months[item][0]));
      return question({
        label: "Kalendarz",
        method: "przejdź do następnego miesiąca",
        prompt: `Jaki miesiąc następuje po miesiącu ${months[current][0]}?`,
        hint: "Po grudniu znowu jest styczeń.",
        explanation: `Po miesiącu ${months[current][0]} jest ${months[next][0]}.`,
        visual: equation(months[current][0], "Rok układa się w koło."),
        ...choice(months[next][0], options)
      });
    });
  }

  function clockQuestions() {
    return Array.from({ length: 10 }, (_, index) => {
      if (index === 0) {
        const hours = rand(1, 8);
        const minutes = rand(0, 59);
        const answer = hours * 60 + minutes;
        const hourText = polishCount(hours, "godzina", "godziny", "godzin");
        const minuteText = polishCount(minutes, "minuta", "minuty", "minut");
        const prompt = minutes === 0
          ? `Ile minut ${polishVerb(hours, "ma", "mają")} ${hourText}?`
          : `Ile minut ${polishVerb(hours, "ma", "mają")} ${hourText} i ${minuteText}?`;
        return question({
          label: "Godziny na zegarach",
          method: "zamień godziny na minuty",
          prompt,
          answer,
          hint: "Jedna godzina ma 60 minut.",
          explanation: `${hours} · 60 + ${minutes} = ${answer} minut.`,
          visual: clockVisual
        });
      }
      if (index === 1) {
        const minutes = rand(2, 20);
        const answer = minutes * 60;
        return question({
          label: "Godziny na zegarach",
          method: "pomnóż minuty przez 60",
          prompt: `Ile sekund ${polishVerb(minutes, "ma", "mają")} ${polishCount(minutes, "minuta", "minuty", "minut")}?`,
          answer,
          hint: "Jedna minuta ma 60 sekund.",
          explanation: `${minutes} · 60 = ${answer} sekund.`,
          visual: clockVisual
        });
      }
      if (index === 2) {
        const start = rand(6 * 60, 20 * 60);
        const duration = rand(1, 18) * 5;
        const end = start + duration;
        return question({
          label: "Godziny na zegarach",
          method: "dodaj minuty do godziny",
          prompt: `Która godzina będzie za ${duration} minut po ${clockText(Math.floor(start / 60), start % 60)}? Zapisz jako liczbę minut po północy.`,
          answer: end,
          hint: "Zamień godzinę startu na minuty i dodaj podany czas.",
          explanation: `${clockText(Math.floor(start / 60), start % 60)} + ${duration} min = ${clockText(Math.floor(end / 60), end % 60)}, czyli ${end} minut po północy.`,
          visual: clockVisual
        });
      }
      if (index === 3) {
        const start = rand(6 * 60, 18 * 60);
        const duration = rand(2, 18) * 5;
        const end = start + duration;
        return question({
          label: "Godziny na zegarach",
          method: "odejmij godziny",
          prompt: `Pociąg odjeżdża o ${clockText(Math.floor(start / 60), start % 60)}, a przyjeżdża o ${clockText(Math.floor(end / 60), end % 60)}. Ile minut trwa podróż?`,
          answer: duration,
          hint: "Odejmij godzinę odjazdu od godziny przyjazdu.",
          explanation: `${clockText(Math.floor(end / 60), end % 60)} − ${clockText(Math.floor(start / 60), start % 60)} = ${duration} minut.`,
          visual: clockVisual
        });
      }
      if (index === 4) {
        const quarters = rand(1, 6);
        const answer = quarters * 15;
        return question({
          label: "Godziny na zegarach",
          method: "kwadrans ma 15 minut",
          prompt: `Ile minut ${polishVerb(quarters, "ma", "mają")} ${polishCount(quarters, "kwadrans", "kwadranse", "kwadransów")}?`,
          answer,
          hint: "Jeden kwadrans to 15 minut.",
          explanation: `${quarters} · 15 = ${answer} minut.`,
          visual: clockVisual
        });
      }
      if (index === 5) {
        const days = rand(1, 3);
        const answer = days * 24;
        return question({
          label: "Godziny na zegarach",
          method: "doba ma 24 godziny",
          prompt: `Ile godzin ${polishVerb(days, "ma", "mają")} ${polishCount(days, "doba", "doby", "dób")}?`,
          answer,
          hint: "Jedna doba ma 24 godziny.",
          explanation: `${days} · 24 = ${answer} godzin.`,
          visual: clockVisual
        });
      }
      if (index === 6 || index === 9) {
        const hour = rand(0, 23);
        const minute = pick([0, 15, 20, 30, 45, 50]);
        const phrase = spokenTime(hour, minute);
        const answer = clockText(hour, minute);
        return question({
          checker: "clock",
          label: "Godziny na zegarach",
          method: "odczytaj zwrot zegarowy",
          prompt: `Która godzina to „${phrase}”? Zapisz ją z dwukropkiem.`,
          answer,
          hint: spokenHint(minute),
          explanation: `„${phrase}” to godzina ${answer}.`,
          visual: clockVisual
        });
      }
      if (index === 7) {
        const steps = [[15, "kwadrans"], [30, "pół godziny"], [45, "3 kwadranse"]];
        const [add, name] = pick(steps);
        const start = rand(8 * 60, 20 * 60 - add);
        const end = start + add;
        return question({
          checker: "clock",
          label: "Godziny na zegarach",
          method: "dodaj kwadrans albo pół godziny",
          prompt: `Zegar wskazuje ${clockText(Math.floor(start / 60), start % 60)}. Która godzina będzie za ${name}? Zapisz ją z dwukropkiem.`,
          answer: clockText(Math.floor(end / 60), end % 60),
          hint: "Kwadrans to 15 minut, pół godziny to 30 minut, a 3 kwadranse to 45 minut.",
          explanation: `${clockText(Math.floor(start / 60), start % 60)} + ${add} min = ${clockText(Math.floor(end / 60), end % 60)}.`,
          visual: clockVisual
        });
      }
      const steps = [[15, "kwadrans"], [30, "pół godziny"], [45, "3 kwadranse"]];
      const [back, name] = pick(steps);
      const end = rand(8 * 60 + back, 22 * 60);
      const start = end - back;
      return question({
        checker: "clock",
        label: "Godziny na zegarach",
        method: "odejmij kwadrans albo pół godziny",
        prompt: `Jest godzina ${clockText(Math.floor(end / 60), end % 60)}. Która godzina była ${name} temu? Zapisz ją z dwukropkiem.`,
        answer: clockText(Math.floor(start / 60), start % 60),
        hint: "Czas „temu” odejmujesz. Kwadrans to 15 minut, a pół godziny to 30.",
        explanation: `${clockText(Math.floor(end / 60), end % 60)} − ${back} min = ${clockText(Math.floor(start / 60), start % 60)}.`,
        visual: clockVisual
      });
    });
  }

  function buildQuestions(mode) {
    const pools = {
      dziesiatkowy: decimalQuestions,
      porownywanie: compareQuestions,
      duze: largeNumberQuestions,
      pieniadze: moneyQuestions,
      dlugosc: lengthQuestions,
      masa: massQuestions,
      rzymskie: romanQuestions,
      kalendarz: calendarQuestions,
      zegary: clockQuestions
    };
    if (pools[mode]) return pools[mode]();
    const mixed = Object.values(pools).map((build) => pick(build()));
    return shuffle([...mixed, pick(decimalQuestions())]).slice(0, 10);
  }

  function parseClock(raw) {
    const text = String(raw).trim().replace(".", ":").replace(/\s+/g, "");
    const direct = text.match(/^(\d{1,2}):(\d{2})$/);
    const compact = text.match(/^(\d{3,4})$/);
    const match = direct || (compact ? compact[1].padStart(4, "0").match(/^(\d{2})(\d{2})$/) : null);
    if (!match) return null;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour > 23 || minute > 59) return null;
    return clockText(hour, minute);
  }

  MathTownGame.start({
    chapterId: "chapter2",
    chapterTitle: "Systemy zapisywania liczb",
    routeLabels,
    // Saved clock rounds keep their old minute answers. New phrase questions use checker "clock".
    roundRevisions: { zegary: 2 },
    buildQuestions,
    answerCheckers: {
      roman(raw, answer) {
        return String(raw).trim().toUpperCase().replace(/\s+/g, "") === answer;
      },
      clock(raw, answer) {
        return parseClock(raw) === answer;
      }
    }
  });
})();
