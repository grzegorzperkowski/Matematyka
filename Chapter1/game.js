(() => {
  "use strict";

  const routeLabels = {
    park: "Wesołe miasteczko",
    plusminus: "Sprytne rachunki",
    moreless: "O ile więcej?",
    multdiv: "Mnożenie i dzielenie",
    by10: "Przez 10, 100, ...",
    timesmore: "Razy więcej, razy mniej",
    remainder: "Dzielenie z resztą",
    powers: "Kwadraty i sześciany",
    word: "Zadania tekstowe",
    order: "Kolejność działań",
    numberline: "Oś liczbowa i łamigłówki",
    mix: "Wielka przejażdżka"
  };

  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function shuffle(list) { return [...list].sort(() => Math.random() - 0.5); }

  function question(data) {
    return { kind: "input", label: "Zadanie", visual: null, ...data };
  }

  function parkQuestions() {
    const templates = [
      () => { const start = rand(8, 12), end = rand(start + 5, 22); return question({ label: "Wesołe miasteczko", prompt: `Wesołe miasteczko jest czynne od godziny ${start}:00 do ${end}:00. Przez ile godzin dziennie działa?`, answer: end - start, hint: `Policz, ile godzin mija od ${start} do ${end}.`, explanation: `${end} − ${start} = ${end - start}, więc miasteczko działa ${end - start} godzin.`, visual: { type: "story", items: [["🎡", `od ${start}:00`], ["⏰", `do ${end}:00`]], caption: "Ile godzin trwa zabawa?" } }); },
      () => { const smaller = rand(10, 30), difference = rand(2, 15), larger = smaller + difference; return question({ label: "Wesołe miasteczko", prompt: `Na karuzeli jedzie ${smaller} osób, a kolejką górską ${larger} osób. O ile więcej osób jedzie kolejką?`, answer: difference, hint: "„O ile więcej” oznacza odejmowanie.", explanation: `${larger} − ${smaller} = ${difference}.`, visual: { type: "story", items: [["🎠", `${smaller} osób`], ["🚂", `${larger} osób`]], caption: "Porównaj liczby osób." } }); },
      () => { const price = rand(2, 9), count = rand(2, 8), answer = price * count; return question({ label: "Wesołe miasteczko", prompt: `Jedna gałka lodów kosztuje ${price} zł. Ile zapłacisz za ${count} gałki?`, answer, hint: `Pomnóż ${price} przez ${count}.`, explanation: `${count} · ${price} = ${answer} zł.`, visual: { type: "story", items: [["🍦", `${price} zł`], ["🍦", `${count} gałek`]], caption: "Ta sama cena powtarza się." } }); },
      () => { const price = rand(2, 9), count = rand(2, 9), total = price * count; return question({ label: "Wesołe miasteczko", prompt: `Jeden żeton kosztuje ${price} zł. Ile żetonów można kupić za ${total} zł?`, answer: count, hint: `Podziel ${total} zł na paczki po ${price} zł.`, explanation: `${total} : ${price} = ${count}.`, visual: { type: "story", items: [["💰", `${total} zł`], ["🎟️", `${price} zł za 1`]], caption: "Ile razy cena mieści się w kwocie?" } }); },
      () => { const price = rand(3, 9), count = rand(3, 8), remainder = rand(1, price - 1), paid = price * count + remainder; return question({ label: "Wesołe miasteczko", prompt: `Za ${paid} zł kupujesz żetony po ${price} zł. Ile pieniędzy zostanie po kupieniu maksymalnej liczby żetonów?`, answer: remainder, hint: `Najpierw kup ${count} żetonów za ${count * price} zł.`, explanation: `${paid} − ${count * price} = ${remainder} zł.`, visual: { type: "story", items: [["💰", `${paid} zł`], ["🎟️", `${price} zł za 1`]], caption: "Ile zostanie reszty?" } }); }
    ];
    const price = rand(3, 12), count = rand(2, 8), answer = price * count;
    return templates.map((make) => make()).concat(question({ label: "Wesołe miasteczko", prompt: `Bilet na jedną atrakcję kosztuje ${price} zł. Ile kosztuje ${count} biletów?`, answer, hint: "Pomnóż cenę jednego biletu przez ich liczbę.", explanation: `${count} · ${price} = ${answer} zł.`, visual: { type: "story", items: [["🎟️", `${price} zł`], ["🎟️", `${count} biletów`]], caption: "Pomnóż cenę przez liczbę biletów." } }));
  }

  function plusMinusQuestions() {
    return Array.from({ length: 10 }, (_, index) => {
      let prompt, answer, hint, explanation;
      if (index % 3 === 0) { const a = rand(10, 99), b = rand(10, 99), complement = 100 - b; answer = a + 100; prompt = `${a} + ${b} + ${complement}`; hint = `Połącz ${b} i ${complement}, aby otrzymać 100.`; explanation = `${a} + ${b} + ${complement} = ${a} + 100 = ${answer}.`; }
      else if (index % 3 === 1) { const base = rand(2, 9) * 100, difference = rand(1, 99), smaller = base - difference, larger = base + rand(1, 99); answer = larger - smaller; prompt = `${larger} − ${smaller}`; hint = `Dojdź od ${smaller} do ${base}, a potem do ${larger}.`; explanation = `${larger} − ${smaller} = ${answer}.`; }
      else { const tens = rand(2, 90) * 10, subtract = rand(1, 9); answer = tens - subtract; prompt = `${tens} − ${subtract}`; hint = `Odejmij 10, a potem dodaj ${10 - subtract}.`; explanation = `${tens} − ${subtract} = ${answer}.`; }
      return question({ label: "Dodawanie i odejmowanie", prompt: `Oblicz sprytnie: ${prompt} = ?`, answer, hint, explanation, visual: { type: "equation", expression: prompt, caption: "Znajdź wygodną parę liczb." } });
    });
  }

  function moreLessQuestions() {
    const templates = [
      () => {
        const base = rand(10, 90), difference = rand(2, 20);
        return [`Jaka liczba jest o ${difference} większa od ${base}?`, base + difference,
          `Do ${base} dodaj ${difference}.`, `${base} + ${difference} = ${base + difference}.`];
      },
      () => {
        const base = rand(25, 100), difference = rand(2, 20);
        return [`Jaka liczba jest o ${difference} mniejsza od ${base}?`, base - difference,
          `Od ${base} odejmij ${difference}.`, `${base} − ${difference} = ${base - difference}.`];
      },
      () => {
        const smaller = rand(10, 90), difference = rand(2, 30);
        const larger = smaller + difference;
        return [`O ile liczba ${larger} jest większa od liczby ${smaller}?`, difference,
          `Odejmij ${smaller} od ${larger}.`, `${larger} − ${smaller} = ${difference}.`];
      },
      () => {
        const smaller = rand(10, 90), difference = rand(2, 30);
        const larger = smaller + difference;
        return [`O ile liczba ${smaller} jest mniejsza od liczby ${larger}?`, difference,
          `Odejmij ${smaller} od ${larger}.`, `${larger} − ${smaller} = ${difference}.`];
      },
      () => {
        const anastazja = rand(5, 10), bogumila = anastazja + rand(1, 3);
        const cecylia = bogumila + rand(1, 3);
        return [`Pani Anastazja ma ${anastazja} kapeluszy, Bogumiła ${bogumila}, a Cecylia ${cecylia}. O ile więcej kapeluszy ma Cecylia niż Anastazja?`, cecylia - anastazja,
          `Porównaj ${cecylia} i ${anastazja}.`, `${cecylia} − ${anastazja} = ${cecylia - anastazja}. O tyle więcej kapeluszy ma Cecylia.`];
      },
      () => {
        const weight = rand(24, 40), difference = rand(3, 12);
        return [`Zosia waży ${weight} kg i jest o ${difference} kg lżejsza od brata Andrzeja. Ile waży Andrzej?`, weight + difference,
          `Brat waży o ${difference} kg więcej, więc dodaj ${difference}.`, `${weight} + ${difference} = ${weight + difference} kg.`];
      },
      () => {
        // Keep both siblings' ages positive and the Polish age wording valid (5–19 lat).
        const age = rand(12, 19), difference = rand(5, 7);
        return [`Janek ma ${age} lat i jest o ${difference} lat starszy od Oli. Ile lat ma Ola?`, age - difference,
          `Ola jest młodsza, więc odejmij ${difference} od ${age}.`, `${age} − ${difference} = ${age - difference} lat.`];
      },
      () => {
        const money = rand(25, 80), difference = rand(2, 20);
        return [`Kuba ma ${money} zł, czyli o ${difference} zł więcej niż Julek. Ile złotych ma Julek?`, money - difference,
          `Julek ma mniej, więc odejmij ${difference}.`, `${money} − ${difference} = ${money - difference} zł.`];
      },
      () => {
        // Even the larger class stays at or below 30 pupils.
        const pupils = rand(18, 25), difference = rand(2, 5);
        return [`W klasie jest ${pupils} uczniów. W drugiej klasie jest o ${difference} więcej. Ilu uczniów jest w drugiej klasie?`, pupils + difference,
          `Więcej oznacza dodawanie. Dodaj ${difference} do ${pupils}.`, `${pupils} + ${difference} = ${pupils + difference} uczniów.`];
      },
      () => {
        const pencils = rand(25, 60), difference = rand(5, 15);
        return [`Liczba kredek w pierwszym pudełku to ${pencils}. W drugim jest o ${difference} mniej. Ile kredek jest w drugim pudełku?`, pencils - difference,
          `Mniej oznacza odejmowanie. Od ${pencils} odejmij ${difference}.`, `${pencils} − ${difference} = ${pencils - difference}. Tyle kredek jest w drugim pudełku.`];
      }
    ];
    return shuffle(templates).map((make) => {
      const [prompt, answer, hint, explanation] = make();
      return question({ label: "O ile więcej, o ile mniej", prompt, answer, hint, explanation, visual: { type: "difference", answer } });
    });
  }

  function multDivQuestions() {
    return Array.from({ length: 10 }, (_, index) => {
      const a = rand(2, 9), b = rand(2, 9);
      if (index === 0) return question({ label: "Mnożenie i dzielenie", prompt: `Oblicz: ${a} · 0 = ?`, answer: 0, hint: "Każda liczba pomnożona przez zero daje zero.", explanation: `${a} · 0 = 0.`, visual: { type: "equation", expression: `${a} · 0`, caption: "Mnożenie przez zero." } });
      if (index % 3 === 0) { const c = rand(2, 5), answer = a * b * c; return question({ label: "Mnożenie i dzielenie", prompt: `Oblicz: ${a} · ${b} · ${c} = ?`, answer, hint: "Pomnóż kolejno dwa czynniki, a potem trzeci.", explanation: `${a} · ${b} · ${c} = ${answer}.`, visual: { type: "equation", expression: `${a} · ${b} · ${c}`, caption: "Grupuj czynniki wygodnie." } }); }
      if (index % 2) { const answer = a * b; return question({ label: "Mnożenie i dzielenie", prompt: `Oblicz: ${a} · ${b} = ?`, answer, hint: `To ${a} grup po ${b}.`, explanation: `${a} · ${b} = ${answer}.`, visual: { type: "array", groups: a, itemsPerGroup: b, caption: `${a} równych grup po ${b} elementów.` } }); }
      const answer = a, dividend = a * b;
      return question({ label: "Mnożenie i dzielenie", prompt: `Oblicz: ${dividend} : ${b} = ?`, answer, hint: `Pomyśl: ${b} · ? = ${dividend}.`, explanation: `${dividend} : ${b} = ${answer}, bo ${b} · ${answer} = ${dividend}.`, visual: { type: "equation", expression: `${dividend} : ${b}`, caption: "Dzielenie sprawdzaj mnożeniem." } });
    });
  }

  function by10Questions() {
    // Generate from the arithmetic relationship, so every hint stays applicable.
    const zeroWords = { 10: "jedno zero", 100: "dwa zera" };
    const direct = (scale, divide) => {
      const base = rand(11, 99);
      const expression = divide ? `${base * scale} : ${scale}` : `${base} · ${scale}`;
      const answer = divide ? base : base * scale;
      return [`Oblicz: ${expression} = ?`, answer,
        `Przy ${divide ? "dzieleniu" : "mnożeniu"} przez ${scale} ${divide ? "skreśl" : "dopisz"} ${zeroWords[scale]}.`,
        `${expression} = ${answer}.`];
    };
    const scaledDivision = (scale, cancelBoth) => {
      const divisor = rand(2, 9);
      const quotient = rand(2, 9);
      // Build the dividend from the divisor and quotient: no fractions or remainders.
      const product = divisor * quotient;
      const expression = `${product * scale} : ${divisor * (cancelBoth ? scale : 1)}`;
      const answer = quotient * (cancelBoth ? 1 : scale);
      const hint = cancelBoth
        ? `Podziel dzielną i dzielnik przez ${scale}: ${product} : ${divisor}.`
        : `${product} : ${divisor} = ${quotient}, a potem dopisz ${zeroWords[scale]}.`;
      return [`Oblicz: ${expression} = ?`, answer, hint,
        cancelBoth ? `${expression} = ${product} : ${divisor} = ${answer}.` : `${expression} = ${quotient} · ${scale} = ${answer}.`];
    };
    const templates = [
      () => direct(10, false),
      () => direct(100, false),
      () => direct(10, true),
      () => direct(100, true),
      () => {
        const a = rand(2, 9), b = rand(2, 9);
        return [`Jaką liczbą zastąpić znak ?: ${a} · ${b * 10} = ${a} · ${b} · ?`, 10,
          `${b * 10} = ${b} · 10.`, `${a} · ${b * 10} = ${a} · ${b} · 10, więc ? = 10.`];
      },
      () => {
        const a = rand(2, 9), b = rand(2, 9);
        return [`Jaką liczbą zastąpić znak ?: ${a * 100} · ${b} = ${a} · ${b} · ?`, 100,
          `${a * 100} = ${a} · 100.`, `${a * 100} · ${b} = ${a} · ${b} · 100, więc ? = 100.`];
      },
      () => {
        const a = rand(2, 9), b = rand(2, 9);
        return [`Jaką liczbą zastąpić znak ?: ${a * 10} · ${b * 10} = ${a} · ${b} · ?`, 100,
          `${a * 10} · ${b * 10} = ${a} · 10 · ${b} · 10.`,
          `${a * 10} · ${b * 10} = ${a} · ${b} · 100, więc ? = 100.`];
      },
      () => scaledDivision(100, false),
      () => scaledDivision(10, false),
      () => {
        // Whole tens keep both the lottery quantities and the mental arithmetic suitable.
        const tickets = rand(2, 9) * 10, prize = rand(2, 9) * 10;
        return [`W loterii jest ${tickets} losów wygrywających. Każdy daje ${prize} zł. Ile złotych przeznaczono na wygrane?`, tickets * prize,
          `Pomnóż ${tickets} · ${prize}.`, `${tickets} · ${prize} = ${tickets * prize} zł.`];
      },
      () => {
        const n = rand(11, 99);
        return [`Oblicz sprytnie: ${n} · 2 · 5 = ?`, n * 10,
          "Połącz 2 · 5 = 10.", `${n} · 2 · 5 = ${n} · 10 = ${n * 10}.`];
      },
      () => {
        const n = rand(11, 99);
        // These pairs deliberately multiply to 100; arbitrary factors lose the shortcut.
        const [a, b] = pick([[20, 5], [25, 4], [50, 2]]);
        return [`Oblicz sprytnie: ${a} · ${n} · ${b} = ?`, n * 100,
          `Połącz ${a} · ${b} = 100.`, `${a} · ${n} · ${b} = 100 · ${n} = ${n * 100}.`];
      },
      () => scaledDivision(10, true),
      () => scaledDivision(100, true),
      () => {
        // Multiples of four make multiplication by 25 yield whole hundreds.
        const a = rand(3, 24) * 4, b = rand(2, 5) * 5;
        const grouped = a * 25;
        return [`Oblicz sprytnie: ${a} · ${b} · 25 = ?`, grouped * b,
          `Najpierw połącz ${a} · 25 = ${grouped}, potem pomnóż przez ${b}.`,
          `${a} · ${b} · 25 = ${grouped} · ${b} = ${grouped * b}.`];
      }
    ];
    return shuffle(templates).slice(0, 10).map((make) => {
      const [prompt, answer, hint, explanation] = make();
      return question({ label: "Mnożenie i dzielenie przez 10, 100, ...", prompt, answer, hint, explanation, visual: { type: "equation", expression: "× 10 → + 1 zero   •   × 100 → + 2 zera", caption: "Zerami można sprytnie ułatwiać rachunki." } });
    });
  }

  function timesMoreQuestions() {
    return Array.from({ length: 10 }, (_, index) => {
      const factor = rand(2, 9), base = rand(2, 30); let prompt, answer, hint, explanation;
      if (index % 3 === 0) { answer = base * factor; prompt = `Jaka liczba jest ${factor} razy większa niż ${base}?`; hint = `Pomnóż ${base} przez ${factor}.`; explanation = `${factor} · ${base} = ${answer}.`; }
      else if (index % 3 === 1) { answer = base; prompt = `Jaka liczba jest ${factor} razy mniejsza niż ${base * factor}?`; hint = `Podziel ${base * factor} przez ${factor}.`; explanation = `${base * factor} : ${factor} = ${answer}.`; }
      else { answer = factor; prompt = `Ile razy liczba ${base * factor} jest większa niż ${base}?`; hint = `Podziel ${base * factor} przez ${base}.`; explanation = `${base * factor} : ${base} = ${answer}.`; }
      return question({ label: "Razy więcej, razy mniej", prompt, answer, hint, explanation, visual: { type: "equation", expression: "× lub :", caption: "„Razy więcej” łączymy z mnożeniem, a „razy mniej” z dzieleniem." } });
    });
  }

  function remainderQuestions() {
    const division = (divisor, allowZero = false) => {
      const quotient = rand(2, 9), remainder = rand(allowZero ? 0 : 1, divisor - 1);
      return { divisor, quotient, remainder, total: divisor * quotient + remainder };
    };
    const explain = ({ total, divisor, quotient, remainder }) => `${total} : ${divisor} = ${quotient} r ${remainder}.`;
    const exercises = shuffle([2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 5).map((divisor) => {
      const d = division(divisor);
      return [`Jaka jest reszta z dzielenia ${d.total} przez ${divisor}?`, d.remainder,
        `${divisor} · ${d.quotient} = ${divisor * d.quotient}. Sprawdź, ile zostaje do ${d.total}.`, explain(d)];
    });
    const candy = division(rand(2, 5));
    // Both questions must stand alone: rounds are shuffled and sampled.
    const candyStory = `Babcia dzieli po równo cukierki między dzieci. Liczba cukierków: ${candy.total}. Liczba dzieci: ${candy.divisor}.`;
    exercises.push(
      [`${candyStory} Ile całych cukierków dostanie każde dziecko?`, candy.quotient,
        `Weź pełne równe porcje: ${candy.total} : ${candy.divisor}.`, explain(candy)],
      [`${candyStory} Ile cukierków zostanie babci po rozdaniu pełnych równych porcji?`, candy.remainder,
        `Od ${candy.total} odejmij ${candy.divisor} · ${candy.quotient}.`, explain(candy)]
    );
    const cookies = division(rand(2, 6));
    exercises.push([`Dziadek ma ciastka w liczbie ${cookies.total} i rozdaje je w paczkach po ${cookies.divisor}. Ile ciastek zostanie po zrobieniu jak największej liczby pełnych paczek?`, cookies.remainder,
      `${cookies.divisor} · ${cookies.quotient} = ${cookies.divisor * cookies.quotient}. Ile brakuje do ${cookies.total}?`, explain(cookies)]);
    const divisible = division(rand(2, 9), true);
    exercises.push([`Czy liczba ${divisible.total} dzieli się przez ${divisible.divisor} bez reszty? Wybierz 1 = TAK, 0 = NIE.`, Number(divisible.remainder === 0),
      "Sprawdź, czy reszta z dzielenia wynosi zero.", `${divisible.remainder === 0 ? "Tak" : "Nie"}. ${explain(divisible)}`]);
    const cycle = rand(3, 8), position = rand(cycle + 1, cycle * 5);
    const color = (position - 1) % cycle + 1;
    exercises.push([`Kolory koralików powtarzają się w kolejności: ${Array.from({ length: cycle }, (_, i) => i + 1).join(", ")}. Jaki numer koloru ma ${position}. koralik?`, color,
      `Podziel numer koralika przez ${cycle}. Reszta zero oznacza ostatni kolor w cyklu.`,
      `${position} : ${cycle} = ${Math.floor(position / cycle)} r ${position % cycle}. Numer koloru: ${color}.`]);
    // Compatible remainders guarantee a solution; search for the smallest two-digit one.
    const first = rand(3, 8), second = first + 1, target = rand(10, 99);
    const r1 = target % first, r2 = target % second;
    let smallest = 10;
    while (smallest % first !== r1 || smallest % second !== r2) smallest += 1;
    exercises.push([`Podaj najmniejszą liczbę dwucyfrową, która przy dzieleniu przez ${first} daje resztę ${r1}, a przez ${second} daje resztę ${r2}.`, smallest,
      `Sprawdzaj liczby od 10 do 99. Najpierw wybierz te, które przy dzieleniu przez ${first} dają resztę ${r1}.`,
      `${smallest} : ${first} = ${Math.floor(smallest / first)} r ${r1} oraz ${smallest} : ${second} = ${Math.floor(smallest / second)} r ${r2}. To najmniejsza liczba dwucyfrowa spełniająca oba warunki.`]);
    return shuffle(exercises).slice(0, 10).map(([prompt, answer, hint, explanation]) => question({ label: "Dzielenie z resztą", prompt, answer, hint, explanation, visual: { type: "equation", expression: "dzielna : dzielnik = iloraz r reszta", caption: "Reszta jest zawsze mniejsza od dzielnika." } }));
  }

  function powersQuestions() {
    const superscript = { 2: "²", 3: "³", 4: "⁴", 5: "⁵" };
    const power = (base, exponent, verbal = false) => {
      const expression = `${base}${superscript[exponent]}`;
      const factors = Array(exponent).fill(base).join(" · ");
      return [verbal ? `Jaki jest ${exponent === 2 ? "kwadrat" : "sześcian"} liczby ${base}?` : `Oblicz: ${expression} = ?`,
        base ** exponent, `To ${factors}.`, `${expression} = ${factors} = ${base ** exponent}.`];
    };
    // Distinct bases avoid repeating the same square or cube within a round.
    const exercises = [
      ...shuffle(Array.from({ length: 11 }, (_, i) => i + 2)).slice(0, 4).map((base, i) => power(base, 2, i === 3)),
      ...shuffle(Array.from({ length: 8 }, (_, i) => i + 2)).slice(0, 4).map((base, i) => power(base, 3, i === 3)),
      power(rand(2, 4), rand(4, 5)),
      power(10, rand(3, 4))
    ];
    const soups = rand(2, 4), mains = rand(2, 6);
    exercises.push([`W restauracji liczba zup do wyboru to ${soups}, a liczba drugich dań to ${mains}. Ile różnych zestawów z jednej zupy i jednego drugiego dania można zamówić?`, soups * mains,
      "Każdą zupę połącz z każdym drugim daniem.", `${soups} · ${mains} = ${soups * mains}. Tyle różnych zestawów można zamówić.`]);
    const folds = rand(2, 5);
    exercises.push([`Prostokątną kartkę złożono ${folds} razy na pół, za każdym razem wzdłuż linii równoległej do krawędzi. Ile prostokątnych części wyznaczają zgięcia po rozłożeniu?`, 2 ** folds,
      `Każde złożenie podwaja liczbę części: ${Array.from({ length: folds }, (_, i) => 2 ** (i + 1)).join(", ")}.`,
      `Liczba części po rozłożeniu: 2${superscript[folds]} = ${2 ** folds}.`]);
    return shuffle(exercises).slice(0, 10).map(([prompt, answer, hint, explanation]) => question({ label: "Kwadraty i sześciany", prompt, answer, hint, explanation, visual: { type: "equation", expression: "a² = a · a   •   a³ = a · a · a", caption: "Wykładnik mówi, ile razy używamy tej samej liczby jako czynnika." } }));
  }

  function wordProblemQuestions() {
    return Array.from({ length: 10 }, (_, index) => {
      let prompt, answer, hint, explanation;
      if (index % 5 === 0) { const remaining = rand(10, 80), shown = rand(20, 120), total = remaining + shown; prompt = `Serial ma ${total} odcinków. Nadano już ${shown}. Ile odcinków pokaże jeszcze telewizja?`; answer = remaining; hint = "Od wszystkich odcinków odejmij te już pokazane."; explanation = `${total} − ${shown} = ${answer} odcinków.`; }
      else if (index % 5 === 1) { const price = rand(2, 10), sold = rand(10, 60), total = price * sold; prompt = `Jeden los kosztował ${price} zł. Uczniowie zebrali ${total} zł. Ile losów sprzedali?`; answer = sold; hint = "Podziel zebrane pieniądze przez cenę jednego losu."; explanation = `${total} : ${price} = ${answer} losów.`; }
      else if (index % 5 === 2) { const smaller = rand(20, 90), difference = rand(5, 30), larger = smaller + difference; prompt = `Duży plik zajmuje ${larger} MB, a mały jest o ${difference} MB mniejszy. Ile zajmuje mały plik?`; answer = smaller; hint = "„O mniej” oznacza odejmowanie."; explanation = `${larger} − ${difference} = ${answer} MB.`; }
      else if (index % 5 === 3) { const daily = rand(2, 9), days = rand(4, 20), total = daily * days; prompt = `Opakowanie ma ${total} tabletek. Dziecko bierze ${daily} tabletki dziennie. Na ile dni wystarczy opakowanie?`; answer = days; hint = "Podziel liczbę tabletek przez dzienną dawkę."; explanation = `${total} : ${daily} = ${answer} dni.`; }
      else { const count = rand(2, 9), price = rand(3, 20), extra = rand(1, 10); answer = count * price + extra; prompt = `W kwiaciarni jest ${count} róż po ${price} zł i jedna wstążka za ${extra} zł. Ile kosztuje bukiet?`; hint = "Pomnóż cenę róży przez ich liczbę i dodaj wstążkę."; explanation = `${count} · ${price} + ${extra} = ${answer} zł.`; }
      return question({ label: "Zadania tekstowe", prompt, answer, hint, explanation, visual: { type: "story", items: [["📖", "czytaj"], ["🧩", "połącz informacje"]], caption: "Zapisz w głowie dane i wybierz działania." } });
    });
  }

  function orderQuestions() {
    const fixed = [
      ["Oblicz: 4 · (7 + 1) = ?", 32, "Najpierw policz działanie w nawiasie.", "7 + 1 = 8, a 4 · 8 = 32."],
      ["Oblicz: (4 · 7) + 1 = ?", 29, "Najpierw wykonaj mnożenie.", "4 · 7 + 1 = 28 + 1 = 29."],
      ["Oblicz: (6 + 8) : 2 = ?", 7, "Najpierw dodaj liczby w nawiasie.", "(6 + 8) : 2 = 14 : 2 = 7."],
      ["Oblicz: (3 + 5) · (2 + 4) = ?", 48, "Oblicz oba nawiasy, a potem pomnóż wyniki.", "8 · 6 = 48."],
      ["Oblicz: 1 + 4 · 7 = ?", 29, "Mnożenie wykonujemy przed dodawaniem.", "4 · 7 = 28, a 1 + 28 = 29."],
      ["Oblicz: 2 · 16 − 6 = ?", 26, "Najpierw pomnóż, potem odejmij.", "2 · 16 − 6 = 32 − 6 = 26."],
      ["Oblicz: 6 − 8 : 2 = ?", 2, "Najpierw podziel 8 przez 2.", "6 − 4 = 2."],
      ["Oblicz: 32 : 2 + 4 = ?", 20, "Najpierw wykonaj dzielenie.", "32 : 2 + 4 = 16 + 4 = 20."],
      ["Oblicz: 14 − 7 + 3 = ?", 10, "Dodawanie i odejmowanie wykonuj od lewej do prawej.", "14 − 7 = 7, a 7 + 3 = 10."],
      ["Oblicz: 9 + 10 − 5 − 7 = ?", 7, "Dodawanie i odejmowanie wykonaj po kolei od lewej.", "9 + 10 − 5 − 7 = 19 − 5 − 7 = 7."],
      ["Oblicz: 24 : 8 · 5 = ?", 15, "Dzielenie i mnożenie mają ten sam priorytet: licz od lewej.", "24 : 8 · 5 = 3 · 5 = 15."],
      ["Oblicz: 30 : 5 · 7 = ?", 42, "Wykonuj działania od lewej do prawej.", "30 : 5 · 7 = 6 · 7 = 42."],
      ["Oblicz: 4² − 3² = ?", 7, "Najpierw oblicz obie potęgi.", "16 − 9 = 7."],
      ["Oblicz: 5 · 3² − 3 = ?", 42, "Potęga jest przed mnożeniem i odejmowaniem.", "3² = 9, więc 5 · 9 − 3 = 42."],
      ["Oblicz: 2³ : 4 + 9 = ?", 11, "Najpierw potęga, potem dzielenie.", "8 : 4 + 9 = 2 + 9 = 11."],
      ["Oblicz: 10 − 4³ : 8 = ?", 2, "Najpierw potęga, potem dzielenie.", "10 − 64 : 8 = 10 − 8 = 2."],
      ["Oblicz: 5 · (6 + 9 : 3) = ?", 45, "Najpierw dzielenie w nawiasie, potem dodawanie.", "5 · (6 + 3) = 5 · 9 = 45."]
    ];
    const generated = Array.from({ length: 10 }, (_, index) => {
      const a = rand(2, 9), b = rand(2, 9), c = rand(2, 9); let prompt, answer, hint, explanation;
      if (index % 4 === 0) { answer = a * (b + c); prompt = `${a} · (${b} + ${c})`; hint = "Najpierw policz działanie w nawiasie."; explanation = `${b} + ${c} = ${b + c}, a ${a} · ${b + c} = ${answer}.`; }
      else if (index % 4 === 1) { answer = a + b * c; prompt = `${a} + ${b} · ${c}`; hint = "Mnożenie wykonujemy przed dodawaniem."; explanation = `${b} · ${c} = ${b * c}, a ${a} + ${b * c} = ${answer}.`; }
      else if (index % 4 === 2) { const quotient = rand(2, 9), divisor = rand(2, 9), add = rand(1, 20), dividend = quotient * divisor; answer = quotient + add; prompt = `${dividend} : ${divisor} + ${add}`; hint = "Najpierw wykonaj dzielenie."; explanation = `${dividend} : ${divisor} = ${quotient}, a ${quotient} + ${add} = ${answer}.`; }
      else { const base = rand(2, 9), subtract = rand(1, base * base - 1); answer = base * base - subtract; prompt = `${base}² − ${subtract}`; hint = "Najpierw oblicz potęgę."; explanation = `${base}² = ${base * base}, więc ${base * base} − ${subtract} = ${answer}.`; }
      return [prompt, answer, hint, explanation];
    });
    return generated.map(([prompt, answer, hint, explanation]) => question({ label: "Kolejność działań", prompt: `Oblicz: ${prompt} = ?`, answer, hint, explanation, visual: { type: "equation", expression: "( )  →  potęgi  →  · :  →  + −", caption: "Kolejność pomaga uniknąć pomyłek." } }));
  }

  function numberLineQuestions() {
    return Array.from({ length: 10 }, (_, index) => {
      if (index % 3 === 0) {
        const step = pick([1, 2, 5, 10]), tick = rand(2, 9), answer = step * tick;
        return question({ label: "Oś liczbowa i łamigłówki", prompt: `Na osi liczbowej każda kreska oznacza ${step}. Punkt jest na ${tick}. kresce za zerem. Jaka to liczba?`, answer, hint: `${tick} · ${step} = ?`, explanation: `${tick} · ${step} = ${answer}.`, visual: { type: "numberline", min: 0, max: step * (tick + 2), step, marked: answer, caption: "Równe kreski oznaczają równe odległości." } });
      }
      if (index % 3 === 1) {
        const lower = rand(2, 40) * 5, gap = rand(2, 20) * 2, upper = lower + gap, answer = lower + gap / 2;
        return question({ label: "Oś liczbowa i łamigłówki", prompt: `Między ${lower} i ${upper} zaznaczono punkt dokładnie pośrodku. Jaka jest jego współrzędna?`, answer, hint: "Znajdź liczbę w połowie odcinka.", explanation: `Połowa między ${lower} i ${upper} to ${answer}.`, visual: { type: "numberline", min: lower, max: upper, step: gap / 2, marked: answer, caption: "Równe kreski oznaczają równe odległości." } });
      }
      const total = rand(100, 300), left = rand(10, total - 10), answer = total - left;
      return question({ label: "Oś liczbowa i łamigłówki", prompt: `Miarka ma po obu stronach liczby, które w tym samym miejscu dają razem ${total}. Po jednej stronie widzisz ${left}. Co jest po drugiej stronie?`, answer, hint: `Oblicz ${total} − ${left}.`, explanation: `${total} − ${left} = ${answer}.`, visual: { type: "equation", expression: `${left} + ? = ${total}`, caption: "Dwie liczby dają stałą sumę." } });
    });

    const fixed = [
      ["Na osi liczbowej każda kreska oznacza 1. Punkt jest na siódmej kresce za zerem. Jaka to liczba?", 7, "Policz siedem równych odcinków od 0.", "Siódma kreska ma współrzędną 7.", { min: 0, max: 10, step: 1, marked: 7 }],
      ["Na osi każda kreska oznacza 5. Punkt C jest na trzeciej kresce za zerem. Jaka jest jego współrzędna?", 15, "3 · 5 = ?", "3 · 5 = 15.", { min: 0, max: 25, step: 5, marked: 15 }],
      ["Na osi każda kreska oznacza 5. Punkt D jest na szóstej kresce za zerem. Jaka jest jego współrzędna?", 30, "6 · 5 = ?", "6 · 5 = 30.", { min: 0, max: 35, step: 5, marked: 30 }],
      ["Między 30 i 40 zaznaczono punkt dokładnie pośrodku. Jaka jest jego współrzędna?", 35, "Znajdź liczbę w połowie odcinka 30–40.", "Połowa między 30 a 40 to 35.", { min: 30, max: 40, step: 5, marked: 35 }],
      ["Rafał wyrzucił: 1 i 3, 4 i 6, 3 i 5, 6 i 5. Jaki wynik ma po czterech rzutach?", 33, "Dodaj sumy par: 4 + 10 + 8 + 11.", "4 + 10 + 8 + 11 = 33."],
      ["Andrzej wyrzucił: 2 i 4, 6 i 6, 3 i 2, 1 i 6. Jaki wynik ma po czterech rzutach?", 30, "Dodaj: 6 + 12 + 5 + 7.", "6 + 12 + 5 + 7 = 30."],
      ["Kto jest bliżej mety 50: Rafał ma 33 punkty, a Andrzej 30? Wybierz 1 = RAFAŁ, 2 = ANDRZEJ.", 1, "Rafałowi brakuje 17, a Andrzejowi 20 punktów.", "Rafał jest bliżej, bo 17 < 20."],
      ["Na wadze: koło + kwadrat = trójkąt, a koło + koło = trójkąt. Ile kół waży tyle co jeden trójkąt?", 2, "Skoro dwa koła ważą tyle co trójkąt, odpowiedź jest w drugim obrazku.", "Trójkąt waży tyle co 2 koła."],
      ["W łamigłówce 4 × 4 w każdym wierszu i kolumnie mają być liczby 1, 2, 3, 4. W drugim wierszu są 4, ?, 2, 1. Jaka liczba pasuje?", 3, "W wierszu brakuje liczby, której jeszcze nie ma.", "Brakuje liczby 3."],
      ["Miarka ma po obu stronach liczby, które w tym samym miejscu dają razem 151. Po jednej stronie widzisz 67. Co jest po drugiej stronie?", 84, "Oblicz 151 − 67.", "151 − 67 = 84."],
      ["Na osi liczbowej każda kreska oznacza 10. Jaka liczba jest na dziewiątej kresce za zerem?", 90, "9 · 10 = ?", "9 · 10 = 90.", { min: 0, max: 100, step: 10, marked: 90 }]
    ];
    return shuffle(fixed).slice(0, 10).map(([prompt, answer, hint, explanation, numberline]) => {
      const isChoice = prompt.includes("Wybierz");
      return question({ kind: isChoice ? "choice" : "input", label: "Oś liczbowa i łamigłówki", prompt, answer, options: isChoice ? [{ value: 1, label: "RAFAŁ" }, { value: 2, label: "ANDRZEJ" }] : undefined, hint, explanation, visual: numberline ? { type: "numberline", ...numberline, caption: "Równe kreski oznaczają równe odległości." } : null });
    });
  }

  function patternQuestions() {
    const step = pick([2, 5, 10, 15, 20]) * pick([-1, 1]);
    const start = step < 0 ? rand(100, 500) : rand(20, 300);
    const values = Array.from({ length: 4 }, (_, index) => start + step * index);
    const answer = values[3] + step;
    const options = shuffle([answer, answer + Math.abs(step), answer - Math.abs(step)]);
    return question({ kind: "choice", label: "Ciąg liczb", prompt: `Jaka liczba będzie następna? ${values.join(", ")}, ...`, answer, options, hint: "Sprawdź, o ile zmieniają się kolejne liczby.", explanation: `${step > 0 ? "Dodajemy" : "Odejmujemy"} ${Math.abs(step)}: ${values[3]} ${step > 0 ? "+" : "−"} ${Math.abs(step)} = ${answer}.`, values, visual: { type: "sequence", values } });

    const patterns = [
      { prompt: "Jaka liczba będzie następna? 157, 167, 177, 187, ...", answer: 197, options: [197, 198, 207], hint: "Każda kolejna liczba jest większa o 10.", explanation: "Dodajemy 10: 187 + 10 = 197.", values: [157, 167, 177, 187] },
      { prompt: "Jaka liczba będzie następna? 450, 465, 480, 495, ...", answer: 510, options: [500, 505, 510], hint: "Sprawdź, o ile rosną kolejne liczby.", explanation: "Każda liczba rośnie o 15, więc 495 + 15 = 510.", values: [450, 465, 480, 495] },
      { prompt: "Jaka liczba będzie następna? 250, 240, 230, 220, ...", answer: 210, options: [200, 210, 215], hint: "Tym razem liczby maleją o 10.", explanation: "220 − 10 = 210.", values: [250, 240, 230, 220] },
      { prompt: "Jaka liczba będzie następna? 500, 492, 484, 476, ...", answer: 468, options: [468, 464, 470], hint: "Od każdej liczby odejmujemy 8.", explanation: "476 − 8 = 468.", values: [500, 492, 484, 476] }
    ];
    const chosen = pick(patterns);
    return question({ kind: "choice", label: "Ciąg liczb", ...chosen, visual: { type: "sequence", values: chosen.values } });
  }

  function extraChallengeQuestions() {
    return Array.from({ length: 5 }, (_, index) => {
      if (index % 3 === 0) {
        const answer = rand(10, 80), addend = rand(10, 80), total = answer + addend;
        return question({ label: "Zagadki liczbowe", prompt: `W równaniu x + ${addend} = ${total} jaka liczba kryje się pod x?`, answer, hint: `Od ${total} odejmij ${addend}.`, explanation: `x = ${total} − ${addend} = ${answer}.`, visual: { type: "number", left: `x + ${addend}`, right: String(total) } });
      }
      if (index % 3 === 1) {
        const start = rand(10, 50), end = rand(start + 10, 150), answer = end - start - 1;
        return question({ label: "Zagadki liczbowe", prompt: `Ile jest liczb większych od ${start} i jednocześnie mniejszych od ${end}?`, answer, hint: `Policz liczby od ${start + 1} do ${end - 1}.`, explanation: `Od ${start + 1} do ${end - 1} jest ${answer} liczb.`, visual: { type: "number", left: `${start + 1} … ${end - 1}`, right: "?" } });
      }
      const n = rand(4, 9), answer = n * (n + 1) / 2, values = Array.from({ length: n - 1 }, (_, i) => (i + 1) * (i + 2) / 2);
      return question({ label: "Zagadki liczbowe", prompt: `Jaka jest ${n}. liczba trójkątna? ${values.join(", ")}, ...`, answer, hint: `Dodaj kolejną liczbę, czyli ${n}.`, explanation: `${values[values.length - 1]} + ${n} = ${answer}.`, visual: { type: "sequence", values } });
    });

    const fixed = [
      ["W równaniu x + 27 = 50 jaka liczba kryje się pod x?", 23, "Od 50 odejmij 27.", "x = 50 − 27 = 23.", { type: "number", left: "x + 27", right: "50" }],
      ["W równaniu 35 + y = 72 jaka liczba kryje się pod y?", 37, "Od 72 odejmij 35.", "y = 72 − 35 = 37.", { type: "number", left: "35 + y", right: "72" }],
      ["Jaka jest piąta liczba trójkątna? 1, 3, 6, 10, ...", 15, "Dodaj kolejno 1, 2, 3, 4, a potem 5.", "Piąta liczba trójkątna to 1 + 2 + 3 + 4 + 5 = 15.", { type: "sequence", values: [1, 3, 6, 10] }],
      ["Ile jest liczb dwucyfrowych mniejszych od 20?", 10, "Wypisz je: 10, 11, ..., 19.", "To liczby od 10 do 19, czyli 10 liczb.", { type: "number", left: "10 … 19", right: "?" }],
      ["Ile jest liczb większych od 260 i jednocześnie mniejszych od 500?", 239, "Policz liczby od 261 do 499: 499 − 261 + 1.", "499 − 261 + 1 = 239 liczb.", { type: "number", left: "261 … 499", right: "?" }]
    ];
    return shuffle(fixed).map(([prompt, answer, hint, explanation, visual]) => question({ label: "Zagadki liczbowe", prompt, answer, hint, explanation, visual }));
  }

  function buildQuestions(mode) {
    if (mode === "park") return shuffle(parkQuestions()).slice(0, 10).concat(plusMinusQuestions().slice(0, 4)).slice(0, 10);
    if (mode === "plusminus") return plusMinusQuestions();
    if (mode === "moreless") return shuffle([...moreLessQuestions().slice(0, 8), patternQuestions(), ...extraChallengeQuestions().slice(0, 1)]);
    if (mode === "multdiv") return multDivQuestions();
    if (mode === "by10") return by10Questions();
    if (mode === "timesmore") return timesMoreQuestions();
    if (mode === "remainder") return remainderQuestions();
    if (mode === "powers") return powersQuestions();
    if (mode === "word") return wordProblemQuestions();
    if (mode === "order") return orderQuestions();
    if (mode === "numberline") return numberLineQuestions();
    const pools = [
      parkQuestions(), plusMinusQuestions(), moreLessQuestions(), multDivQuestions(),
      by10Questions(), timesMoreQuestions(), remainderQuestions(), powersQuestions(), wordProblemQuestions(),
      orderQuestions(), numberLineQuestions()
    ];
    return shuffle(pools.map((pool) => pick(pool))).slice(0, 10);
  }

  MathTownGame.start({
    chapterId: "chapter1",
    chapterTitle: "Liczby i działania",
    routeLabels,
    buildQuestions
  });
})();
