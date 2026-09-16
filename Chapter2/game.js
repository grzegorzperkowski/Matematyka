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
  const format = (number) => number.toLocaleString("pl-PL");
  const question = (data) => ({ kind: "input", label: "Zadanie", visual: null, ...data });
  const equation = (expression, caption) => ({ type: "equation", expression, caption });
  const choices = (answer, options) => ({ kind: "choice", answer, options: options.map((value) => ({ value, label: String(value) })) });

  function decimalQuestions() {
    const placeNames = { 1: "jedności", 10: "dziesiątek", 100: "setek", 1000: "tysięcy", 10000: "dziesiątek tysięcy", 100000: "setek tysięcy" };
    const makeNumber = (digits = rand(4, 6)) => {
      const values = [rand(1, 9), ...Array.from({ length: digits - 1 }, () => rand(0, 9))];
      return { values, number: Number(values.join("")) };
    };
    return Array.from({ length: 10 }, (_, index) => {
      if (index % 5 === 0) {
        const { values, number } = makeNumber(); const position = 10 ** rand(0, values.length - 1); const digit = values[values.length - 1 - Math.log10(position)];
        return question({ label: "System dziesiątkowy", prompt: `W liczbie ${format(number)} jaka jest wartość cyfry ${digit} na miejscu ${placeNames[position]}?`, answer: digit * position, hint: `Cyfra na miejscu ${placeNames[position]} jest mnożona przez ${format(position)}.`, explanation: `${digit} · ${format(position)} = ${format(digit * position)}.`, visual: equation(format(number), "Cyfra ma wartość zależną od miejsca.") });
      }
      if (index % 5 === 1) {
        const { values, number } = makeNumber(); const position = 10 ** rand(0, values.length - 1); const digit = values[values.length - 1 - Math.log10(position)];
        return question({ label: "System dziesiątkowy", prompt: `W liczbie ${format(number)} która cyfra stoi na miejscu ${placeNames[position]}?`, answer: digit, hint: "Licz miejsca od prawej strony.", explanation: `Na miejscu ${placeNames[position]} stoi ${digit}.`, visual: equation(format(number), "Spójrz od prawej strony liczby.") });
      }
      if (index % 5 === 2) {
        const digits = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4); const answer = Number([...digits].sort((a, b) => b - a).join(""));
        return question({ label: "System dziesiątkowy", prompt: `Zapisz największą liczbę czterocyfrową z cyfr ${digits.join(", ")}, używając każdej tylko raz.`, answer, hint: "Największą cyfrę postaw najbardziej z lewej.", explanation: `Cyfry malejąco dają ${format(answer)}.`, visual: equation(digits.join(" | "), "Największe miejsca są po lewej.") });
      }
      if (index % 5 === 3) {
        const { values, number } = makeNumber(); const answer = values.reduce((sum, digit) => sum + digit, 0);
        return question({ label: "System dziesiątkowy", prompt: `Jaka jest suma cyfr liczby ${format(number)}?`, answer, hint: "Dodaj wszystkie cyfry, także zera.", explanation: `${values.join(" + ")} = ${answer}.`, visual: equation(values.join(" + "), "Dodaj wszystkie cyfry.") });
      }
      const thousands = rand(10, 999), rest = rand(1, 999);
      return question({ label: "System dziesiątkowy", prompt: `Ile pełnych tysięcy jest w liczbie ${format(thousands * 1000 + rest)}?`, answer: thousands, hint: "Pełne tysiące to grupy po 1000.", explanation: `${format(thousands * 1000 + rest)} = ${thousands} · 1000 + ${rest}.`, visual: equation("pełne tysiące", "Spójrz na grupę tysięcy.") });
    });
  }

  function compareQuestions() {
    const pairs = Array.from({ length: 10 }, (_, index) => {
      const digits = rand(3, 6); const left = rand(10 ** (digits - 1), 10 ** digits - 1);
      if (index === 0) return [left, left];
      const difference = rand(1, Math.min(999, left - 1));
      return index % 2 ? [left, left - difference] : [left - difference, left];
    });
    return shuffle(pairs).map(([left, right]) => {
      const answer = left === right ? "=" : left > right ? ">" : "<";
      return question({ label: "Porównywanie liczb", prompt: `Wstaw właściwy znak: ${left.toLocaleString("pl-PL")} ? ${right.toLocaleString("pl-PL")}.`, hint: "Porównuj cyfry od lewej strony. Liczba z większą pierwszą różną cyfrą jest większa.", explanation: `${left.toLocaleString("pl-PL")} ${answer} ${right.toLocaleString("pl-PL")}.`, visual: equation(`${left.toLocaleString("pl-PL")}  ?  ${right.toLocaleString("pl-PL")}`, "Znak otwiera się w stronę większej liczby."), ...choices(answer, ["<", "=", ">"]) });
    });
  }

  function largeNumberQuestions() {
    return Array.from({ length: 10 }, (_, index) => {
      let prompt, answer, hint, explanation;
      if (index % 5 === 0) { const a = rand(12, 90) * 1000, b = rand(5, 40) * 1000; answer = a + b; prompt = `Oblicz: ${format(a)} + ${format(b)}.`; hint = "Połącz tysiące."; explanation = `${format(a)} + ${format(b)} = ${format(answer)}.`; }
      else if (index % 5 === 1) { const b = rand(10, 60) * 1000, a = b + rand(10, 60) * 1000; answer = a - b; prompt = `Oblicz: ${format(a)} − ${format(b)}.`; hint = "Odejmij tysiące."; explanation = `${format(a)} − ${format(b)} = ${format(answer)}.`; }
      else if (index % 5 === 2) { const a = rand(11, 99), scale = pick([100, 1000]); answer = a * scale; prompt = `Oblicz: ${a} · ${scale}.`; hint = `Dopisz ${Math.log10(scale)} zera.`; explanation = `${a} · ${scale} = ${format(answer)}.`; }
      else if (index % 5 === 3) { const scale = pick([10, 100, 1000]), answerBase = rand(12, 999); answer = answerBase; prompt = `Oblicz: ${format(answerBase * scale)} : ${scale}.`; hint = `Skreśl ${Math.log10(scale)} zera.`; explanation = `${format(answerBase * scale)} : ${scale} = ${answer}.`; }
      else { const base = rand(1000, 9000), step = rand(1, 9) * 100; answer = base + step; prompt = `Jaka liczba jest o ${format(step)} większa od ${format(base)}?`; hint = "Dodaj wskazaną liczbę."; explanation = `${format(base)} + ${format(step)} = ${format(answer)}.`; }
      return question({ label: "Rachunki na dużych liczbach", prompt, answer, hint, explanation, visual: equation("Tysiące i zera", "Wykorzystaj zależności między liczbami.") });
    });
  }

  function moneyQuestions() {
    const amount = () => ({ zl: rand(1, 30), gr: rand(0, 99) });
    const text = ({ zl, gr }) => `${zl} zł ${String(gr).padStart(2, "0")} gr`;
    const gross = ({ zl, gr }) => zl * 100 + gr;
    return Array.from({ length: 10 }, (_, index) => {
      const first = amount(); const second = amount(); let prompt, answer, hint, explanation;
      if (index % 4 === 0) { answer = gross(first); prompt = `Ile groszy to ${text(first)}?`; hint = "Jeden złoty to 100 groszy."; explanation = `${first.zl} · 100 + ${first.gr} = ${answer} gr.`; }
      else if (index % 4 === 1) { answer = gross(first) + gross(second); prompt = `Ile groszy kosztują razem ${text(first)} i ${text(second)}?`; hint = "Zamień obie kwoty na grosze."; explanation = `${gross(first)} gr + ${gross(second)} gr = ${answer} gr.`; }
      else if (index % 4 === 2) { const price = amount(); const paid = gross(price) + rand(1, 12) * 100; answer = paid - gross(price); prompt = `Produkt kosztuje ${text(price)}. Ile groszy reszty dostaniesz z ${format(paid)} gr?`; hint = "Odejmij cenę od wpłaconej kwoty."; explanation = `${paid} gr − ${gross(price)} gr = ${answer} gr.`; }
      else { const count = rand(2, 9), price = rand(1, 15) * 100; answer = count * price; prompt = `Ile groszy kosztuje ${count} biletów po ${format(price)} gr?`; hint = "Pomnóż cenę jednego biletu przez ich liczbę."; explanation = `${count} · ${price} gr = ${answer} gr.`; }
      return question({ label: "Złote i grosze", prompt, answer, hint, explanation, visual: equation("1 zł = 100 gr", "W razie potrzeby zamień wszystko na grosze.") });
    });
  }

  function lengthQuestions() {
    const units = [["cm", "mm", 10], ["dm", "cm", 10], ["m", "cm", 100], ["km", "m", 1000]];
    return Array.from({ length: 10 }, (_, index) => {
      const [from, to, scale] = pick(units); const value = rand(2, 99); const answer = value * scale;
      const prompt = index % 2 ? `Ile ${to} ma ${value} ${from}?` : `Zamień ${value} ${from} na ${to}.`;
      return question({ label: "Jednostki długości", prompt, answer, hint: `1 ${from} to ${scale} ${to}.`, explanation: `${value} · ${scale} = ${answer} ${to}.`, visual: equation("mm → cm → dm → m → km", "Każdy krok ma swoją zależność.") });
    });
  }

  function massQuestions() {
    const units = [["dag", "g", 10], ["kg", "g", 1000], ["kg", "dag", 100], ["t", "kg", 1000]];
    return Array.from({ length: 10 }, () => {
      const [from, to, scale] = pick(units); const value = rand(2, from === "t" ? 9 : 99); const answer = value * scale;
      return question({ label: "Jednostki masy", prompt: `Ile ${to} ma ${value} ${from}?`, answer, hint: `1 ${from} to ${scale} ${to}.`, explanation: `${value} · ${scale} = ${answer} ${to}.`, visual: equation("g → dag → kg → t", "Wybierz właściwą zależność.") });
    });
  }

  function romanQuestions() {
    const roman = (number) => [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]].reduce((result, [value, symbol]) => {
      while (number >= value) { result += symbol; number -= value; }
      return result;
    }, "");
    return Array.from({ length: 10 }, (_, index) => {
      // Keep values within the introductory Roman-numeral range used in this chapter.
      const number = rand(1, 1999); const value = roman(number);
      return index % 2
        ? question({ label: "System rzymski", prompt: `Odczytaj liczbę rzymską ${value}.`, answer: number, hint: "Dodawaj wartości znaków; przed większym znakiem odejmujemy.", explanation: `${value} = ${number}.`, visual: equation(value, "Odczytaj znaki od lewej strony.") })
        : question({ checker: "roman", label: "System rzymski", prompt: `Zapisz liczbę ${number} cyframi rzymskimi.`, answer: value, hint: "Przypomnij sobie: I = 1, V = 5, X = 10. Mała cyfra przed większą oznacza odejmowanie.", explanation: `${number} zapisujemy ${value}.`, visual: equation("I  V  X  L  C  D  M", "IV = 4, IX = 9, XL = 40, XC = 90.") });
    });
  }

  function calendarQuestions() {
    const months = [["styczeń", 31], ["luty", 28], ["marzec", 31], ["kwiecień", 30], ["maj", 31], ["czerwiec", 30], ["lipiec", 31], ["sierpień", 31], ["wrzesień", 30], ["październik", 31], ["listopad", 30], ["grudzień", 31]];
    const days = ["poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota", "niedziela"];
    return Array.from({ length: 10 }, (_, index) => {
      let prompt, answer, hint, explanation;
      if (index % 3 === 0) { const [month, total] = pick(months); prompt = `Ile dni ma ${month}?`; answer = total; hint = "Sprawdź, czy to miesiąc trzydziesto- czy trzydziestojednodniowy."; explanation = `${month} ma ${total} dni.`; }
      else if (index % 3 === 1) { const start = rand(0, 6), after = rand(1, 20), target = (start + after) % 7; const options = shuffle([target, (target + 1) % 7, (target + 2) % 7]); answer = options.indexOf(target) + 1; prompt = `Jeśli dziś jest ${days[start]}, jaki dzień będzie za ${after} dni? Wybierz 1 = ${days[options[0]]}, 2 = ${days[options[1]]}, 3 = ${days[options[2]]}.`; hint = "Co 7 dni dzień tygodnia się powtarza."; explanation = `${days[start]} + ${after} dni to ${days[target]}.`; }
      else { const century = rand(16, 21), year = (century - 1) * 100 + rand(1, 100); prompt = `W którym wieku leży rok ${year}?`; answer = century; hint = "Wiek zaczyna się rokiem z końcówką 01."; explanation = `Lata ${(century - 1) * 100 + 1}–${century * 100} należą do ${century}. wieku.`; }
      return question({ label: "Kalendarz", prompt, answer, hint, explanation, visual: equation("rok → 4 kwartały → 12 miesięcy", "Kalendarz pomaga porządkować czas."), ...(index % 3 === 1 ? choices(answer, [1, 2, 3]) : {}) });
    });
  }

  function clockQuestions() {
    const time = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
    return Array.from({ length: 10 }, (_, index) => {
      let prompt, answer, hint, explanation;
      if (index % 4 === 0) { const hours = rand(1, 8), minutes = rand(0, 59); answer = hours * 60 + minutes; prompt = `Ile minut mają ${hours} godziny i ${minutes} minut?`; hint = `${hours} godziny zamień na minuty.`; explanation = `${hours} · 60 + ${minutes} = ${answer} minut.`; }
      else if (index % 4 === 1) { const minutes = rand(2, 20); answer = minutes * 60; prompt = `Ile sekund ma ${minutes} minut?`; hint = "Jedna minuta ma 60 sekund."; explanation = `${minutes} · 60 = ${answer} sekund.`; }
      else if (index % 4 === 2) { const start = rand(6 * 60, 20 * 60), duration = rand(1, 18) * 5; const end = start + duration; answer = end; prompt = `Która godzina będzie za ${duration} minut po ${time(start)}? Zapisz jako liczbę minut po północy.`; hint = "Dodaj liczbę minut do godziny startu."; explanation = `${time(start)} + ${duration} min = ${time(end)}, czyli ${end} minut po północy.`; }
      else { const start = rand(6 * 60, 19 * 60), duration = rand(2, 18) * 5; const end = start + duration; answer = duration; prompt = `Pociąg odjeżdża o ${time(start)}, a przyjeżdża o ${time(end)}. Ile minut trwa podróż?`; hint = "Odejmij godzinę odjazdu od godziny przyjazdu."; explanation = `${time(end)} − ${time(start)} = ${duration} minut.`; }
      return question({ label: "Godziny na zegarach", prompt, answer, hint, explanation, visual: equation("1 h = 60 min   •   1 min = 60 s", "Zamieniaj czas krok po kroku.") });
    });
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
