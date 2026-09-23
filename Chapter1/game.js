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

  const polishCount = MathTownGame.polishCount;
  const polishVerb = MathTownGame.polishVerb;
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function shuffle(list) { return [...list].sort(() => Math.random() - 0.5); }

  function question(data) {
    return { kind: "input", label: "Zadanie", visual: null, ...data };
  }

  function parkQuestions() {
    const templates = [
      () => { const start = rand(8, 12), end = rand(start + 5, 22), hours = end - start; return question({ label: "Wesołe miasteczko", prompt: `Wesołe miasteczko jest czynne od godziny ${start}:00 do ${end}:00. Przez ile godzin dziennie działa?`, answer: hours, hint: `Policz, ile godzin mija od ${start} do ${end}.`, explanation: `${end} − ${start} = ${hours}, więc miasteczko działa ${polishCount(hours, "godzinę", "godziny", "godzin")}.`, visual: { type: "story", items: [["🎡", `od ${start}:00`], ["⏰", `do ${end}:00`]], caption: "Ile godzin trwa zabawa?" } }); },
      () => { const smaller = rand(10, 30), difference = rand(2, 15), larger = smaller + difference; return question({ label: "Wesołe miasteczko", prompt: `Na karuzeli jedzie ${smaller} osób, a kolejką górską ${larger} osób. O ile więcej osób jedzie kolejką?`, answer: difference, hint: "„O ile więcej” oznacza odejmowanie.", explanation: `${larger} − ${smaller} = ${difference}.`, visual: { type: "story", items: [["🎠", `${smaller} osób`], ["🚂", `${larger} osób`]], caption: "Porównaj liczby osób." } }); },
      () => { const price = rand(2, 9), count = rand(2, 8), answer = price * count; return question({ label: "Wesołe miasteczko", prompt: `Jedna gałka lodów kosztuje ${price} zł. Ile zapłacisz za ${polishCount(count, "gałkę", "gałki", "gałek")}?`, answer, hint: `Pomnóż ${price} przez ${count}.`, explanation: `${count} · ${price} = ${answer} zł.`, visual: { type: "story", items: [["🍦", `${price} zł`], ["🍦", polishCount(count, "gałka", "gałki", "gałek")]], caption: "Ta sama cena powtarza się." } }); },
      () => { const price = rand(2, 9), count = rand(2, 9), total = price * count; return question({ label: "Wesołe miasteczko", prompt: `Jeden żeton kosztuje ${price} zł. Ile żetonów można kupić za ${total} zł?`, answer: count, hint: `Podziel ${total} zł na paczki po ${price} zł.`, explanation: `${total} : ${price} = ${count}.`, visual: { type: "story", items: [["💰", `${total} zł`], ["🎟️", `${price} zł za 1`]], caption: "Ile razy cena mieści się w kwocie?" } }); },
      () => { const price = rand(3, 9), count = rand(3, 8), remainder = rand(1, price - 1), paid = price * count + remainder; return question({ label: "Wesołe miasteczko", prompt: `Za ${paid} zł kupujesz żetony po ${price} zł. Ile pieniędzy zostanie po kupieniu maksymalnej liczby żetonów?`, answer: remainder, hint: `Najpierw kup ${count} żetonów za ${count * price} zł.`, explanation: `${paid} − ${count * price} = ${remainder} zł.`, visual: { type: "story", items: [["💰", `${paid} zł`], ["🎟️", `${price} zł za 1`]], caption: "Ile zostanie reszty?" } }); }
    ];
    const price = rand(3, 12), count = rand(2, 8), answer = price * count;
    return templates.map((make) => make()).concat(question({ label: "Wesołe miasteczko", prompt: `Bilet na jedną atrakcję kosztuje ${price} zł. Ile ${polishVerb(count, "kosztuje", "kosztują")} ${polishCount(count, "bilet", "bilety", "biletów")}?`, answer, hint: "Pomnóż cenę jednego biletu przez ich liczbę.", explanation: `${count} · ${price} = ${answer} zł.`, visual: { type: "story", items: [["🎟️", `${price} zł`], ["🎟️", polishCount(count, "bilet", "bilety", "biletów")]], caption: "Pomnóż cenę przez liczbę biletów." } }));
  }

  function plusMinusQuestions() {
    const smart = (index) => {
      let prompt, answer, hint, explanation;
      if (index % 3 === 0) { const a = rand(10, 99), b = rand(10, 99), complement = 100 - b; answer = a + 100; prompt = `${a} + ${b} + ${complement}`; hint = `Połącz ${b} i ${complement}, aby otrzymać 100.`; explanation = `${a} + ${b} + ${complement} = ${a} + 100 = ${answer}.`; }
      else if (index % 3 === 1) { const base = rand(2, 9) * 100, difference = rand(1, 99), smaller = base - difference, larger = base + rand(1, 99); answer = larger - smaller; prompt = `${larger} − ${smaller}`; hint = `Dojdź od ${smaller} do ${base}, a potem do ${larger}.`; explanation = `${larger} − ${smaller} = ${answer}.`; }
      else { const tens = rand(2, 90) * 10, subtract = rand(1, 9); answer = tens - subtract; prompt = `${tens} − ${subtract}`; hint = `Odejmij 10, a potem dodaj ${10 - subtract}.`; explanation = `${tens} − ${subtract} = ${answer}.`; }
      return question({ label: "Dodawanie i odejmowanie", prompt: `Oblicz sprytnie: ${prompt} = ?`, answer, hint, explanation, visual: { type: "equation", expression: prompt, caption: "Znajdź wygodną parę liczb." } });
    };
    const compensationAdd = () => {
      const aRound = rand(2, 7) * 10, bRound = rand(2, 7) * 10, aExtra = rand(1, 9), bExtra = rand(1, 9);
      const a = aRound + aExtra, b = bRound + bExtra, answer = a + b;
      const expression = `${a} + ${b}`;
      return question({ label: "Dodawanie i odejmowanie", method: "najpierw okrągła suma", prompt: `Oblicz sprytnie: ${expression} = ?`, answer, hint: `Najpierw ${aRound} + ${bRound} = ${aRound + bRound}, potem dodaj ${aExtra} i ${bExtra}.`, explanation: `${aRound} + ${bRound} = ${aRound + bRound}, a ${aExtra} + ${bExtra} = ${aExtra + bExtra}, więc ${expression} = ${answer}.`, visual: { type: "equation", expression, caption: "Najpierw dziesiątki, potem jedności." } });
    };
    const compensationSub = () => {
      const roundSub = rand(2, 6) * 10, extra = rand(1, 9), sub = roundSub + extra, base = rand(sub + 5, 99), answer = base - sub;
      const expression = `${base} − ${sub}`;
      return question({ label: "Dodawanie i odejmowanie", method: "najpierw okrągła różnica", prompt: `Oblicz sprytnie: ${expression} = ?`, answer, hint: `Najpierw ${base} − ${roundSub} = ${base - roundSub}, potem odejmij jeszcze ${extra}.`, explanation: `${base} − ${roundSub} = ${base - roundSub}, a ${base - roundSub} − ${extra} = ${answer}.`, visual: { type: "equation", expression, caption: "Odejmij dziesiątki, a potem jeszcze kilka jedności." } });
    };
    const missingAddend = () => {
      const known = rand(12, 80), hidden = rand(3, 25), sum = known + hidden;
      return question({ label: "Dodawanie i odejmowanie", method: "szukaj brakującej liczby", prompt: `Jaką liczbą zastąpić znak ?: ${known} + ? = ${sum}`, answer: hidden, hint: `Od ${sum} odejmij ${known}.`, explanation: `${known} + ${hidden} = ${sum}, więc ? = ${hidden}.`, visual: { type: "equation", expression: `${known} + ? = ${sum}`, caption: "Brakujący składnik to różnica." } });
    };
    const missingSubtrahend = () => {
      const known = rand(30, 99), hidden = rand(3, 20), result = known - hidden;
      return question({ label: "Dodawanie i odejmowanie", method: "szukaj brakującej liczby", prompt: `Jaką liczbą zastąpić znak ?: ${known} − ? = ${result}`, answer: hidden, hint: `Od ${known} odejmij ${result}.`, explanation: `${known} − ${hidden} = ${result}, więc ? = ${hidden}.`, visual: { type: "equation", expression: `${known} − ? = ${result}`, caption: "Odjemnik to różnica odjemnej i wyniku." } });
    };
    const missingMinuend = () => {
      const hiddenPart = rand(8, 40), result = rand(10, 60), hidden = result + hiddenPart;
      return question({ label: "Dodawanie i odejmowanie", method: "szukaj brakującej liczby", prompt: `Jaką liczbą zastąpić znak ?: ? − ${hiddenPart} = ${result}`, answer: hidden, hint: `Do ${result} dodaj ${hiddenPart}.`, explanation: `${hidden} − ${hiddenPart} = ${result}, więc ? = ${hidden}.`, visual: { type: "equation", expression: `? − ${hiddenPart} = ${result}`, caption: "Odjemna jest sumą odjemnika i wyniku." } });
    };
    const arrow = (sign) => {
      const step = rand(3, 25);
      const start = sign === "+" ? rand(15, 80) : rand(step + 10, 120);
      const answer = sign === "+" ? start + step : start - step;
      const expression = sign === "+" ? `${start} + ${step}` : `${start} − ${step}`;
      return question({ label: "Dodawanie i odejmowanie", method: "idź wzdłuż strzałki", prompt: `Strzałka ${sign} ${step} prowadzi od liczby ${start}. Jaka liczba jest na jej końcu?`, answer, hint: sign === "+" ? `Dodaj ${step} do ${start}.` : `Odejmij ${step} od ${start}.`, explanation: `${expression} = ${answer}.`, visual: { type: "equation", expression, caption: sign === "+" ? "Strzałka ze znakiem + zwiększa liczbę." : "Strzałka ze znakiem − zmniejsza liczbę." } });
    };
    const missing = shuffle([missingAddend, missingSubtrahend, missingMinuend]).slice(0, 2).map((make) => make());
    return shuffle([
      ...Array.from({ length: 6 }, (_, index) => smart(index)),
      compensationAdd(),
      compensationSub(),
      ...missing,
      arrow("+"),
      arrow("−")
    ]);
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
    const label = "Mnożenie i dzielenie";
    const zeroProduct = () => {
      const a = rand(2, 9);
      return question({ label, prompt: `Oblicz: ${a} · 0 = ?`, answer: 0, hint: "Każda liczba pomnożona przez zero daje zero.", explanation: `${a} · 0 = 0.`, visual: { type: "equation", expression: `${a} · 0`, caption: "Mnożenie przez zero." } });
    };
    const tableProduct = () => {
      const a = rand(2, 9), b = rand(2, 9), answer = a * b;
      return question({ label, prompt: `Oblicz: ${a} · ${b} = ?`, answer, hint: `To ${a} grup po ${b}.`, explanation: `${a} · ${b} = ${answer}.`, visual: { type: "array", groups: a, itemsPerGroup: b, caption: `${a} równych grup po ${b} elementów.` } });
    };
    const tableQuotient = () => {
      const a = rand(2, 9), b = rand(2, 9), dividend = a * b;
      return question({ label, prompt: `Oblicz: ${dividend} : ${b} = ?`, answer: a, hint: `Pomyśl: ${b} · ? = ${dividend}.`, explanation: `${dividend} : ${b} = ${a}, bo ${b} · ${a} = ${dividend}.`, visual: { type: "equation", expression: `${dividend} : ${b}`, caption: "Dzielenie sprawdzaj mnożeniem." } });
    };
    const threeFactors = () => {
      const a = rand(2, 9), b = rand(2, 9), c = rand(2, 5), answer = a * b * c;
      return question({ label, prompt: `Oblicz: ${a} · ${b} · ${c} = ?`, answer, hint: "Pomnóż kolejno dwa czynniki, a potem trzeci.", explanation: `${a} · ${b} · ${c} = ${answer}.`, visual: { type: "equation", expression: `${a} · ${b} · ${c}`, caption: "Grupuj czynniki wygodnie." } });
    };
    const splitProduct = () => {
      const factor = rand(2, 9), ones = rand(1, 9), teen = 10 + ones, answer = factor * teen;
      const expression = `${factor} · ${teen}`;
      return question({ label, method: "rozdziel liczbę", prompt: `Oblicz sprytnie: ${expression} = ?`, answer, hint: `Rozdziel ${teen} na 10 i ${ones}: ${factor} · 10 + ${factor} · ${ones}.`, explanation: `${expression} = ${factor} · 10 + ${factor} · ${ones} = ${factor * 10} + ${factor * ones} = ${answer}.`, visual: { type: "equation", expression, caption: "Mnożenie przez liczbę od 11 do 19 rozdziel na dziesiątkę i jedności." } });
    };
    const splitQuotient = () => {
      const divisor = rand(2, 9), tensQuotient = rand(1, 5) * 10, onesQuotient = rand(1, 9);
      const left = divisor * tensQuotient, right = divisor * onesQuotient, dividend = left + right, answer = tensQuotient + onesQuotient;
      const expression = `${dividend} : ${divisor}`;
      return question({ label, method: "rozdziel dzielną", prompt: `Oblicz sprytnie: ${expression} = ?`, answer, hint: `Rozdziel ${dividend} na ${left} i ${right}. Obie części dzielą się przez ${divisor}.`, explanation: `${expression} = ${left} : ${divisor} + ${right} : ${divisor} = ${tensQuotient} + ${onesQuotient} = ${answer}.`, visual: { type: "equation", expression, caption: "Dziel osobno obie części, potem dodaj ilorazy." } });
    };
    const missingFactor = () => {
      const factor = rand(2, 9), other = rand(2, 9), product = factor * other;
      return question({ label, method: "brakujący czynnik", prompt: `Jaką liczbą zastąpić znak ?: ${factor} · ? = ${product}`, answer: other, hint: `Podziel ${product} przez ${factor}.`, explanation: `${factor} · ${other} = ${product}, więc ? = ${other}.`, visual: { type: "equation", expression: `${factor} · ? = ${product}`, caption: "Brakujący czynnik sprawdzisz dzieląc." } });
    };
    const missingDividend = () => {
      const divisor = rand(2, 9), quotient = rand(2, 9), dividend = divisor * quotient;
      return question({ label, method: "brakująca dzielna", prompt: `Jaką liczbą zastąpić znak ?: ? : ${divisor} = ${quotient}`, answer: dividend, hint: `Pomnóż ${quotient} przez ${divisor}.`, explanation: `${dividend} : ${divisor} = ${quotient}, więc ? = ${dividend}.`, visual: { type: "equation", expression: `? : ${divisor} = ${quotient}`, caption: "Dzielna to iloraz razy dzielnik." } });
    };
    return shuffle([
      zeroProduct(),
      tableProduct(), tableProduct(), tableProduct(),
      tableQuotient(), tableQuotient(),
      threeFactors(),
      splitProduct(), splitProduct(),
      splitQuotient(), splitQuotient(),
      pick([missingFactor, missingDividend])()
    ]);
  }

  function by10Questions() {
    // Generate from the arithmetic relationship, so every hint stays applicable.
    const zeroWords = { 10: "jedno zero", 100: "dwa zera" };
    const product = (...parts) => parts.join("\u00A0·\u00A0");
    const by10Tip = "× 10 → + 1 zero\u2003\u2003× 100 → + 2 zera";
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
        return [`Jaką liczbą zastąpić znak ?: ${product(a, b * 10)} = ${product(a, b, "?")}`, 10,
          `${product(b * 10)} = ${product(b, 10)}.`, `${product(a, b * 10)} = ${product(a, b, 10)}, więc ? = 10.`];
      },
      () => {
        const a = rand(2, 9), b = rand(2, 9);
        return [`Jaką liczbą zastąpić znak ?: ${product(a * 100, b)} = ${product(a, b, "?")}`, 100,
          `${product(a * 100)} = ${product(a, 100)}.`, `${product(a * 100, b)} = ${product(a, b, 100)}, więc ? = 100.`];
      },
      () => {
        const a = rand(2, 9), b = rand(2, 9);
        return [`Jaką liczbą zastąpić znak ?: ${product(a * 10, b * 10)} = ${product(a, b, "?")}`, 100,
          `${product(a * 10, b * 10)} = ${product(a, 10, b, 10)}.`,
          `${product(a * 10, b * 10)} = ${product(a, b, 100)}, więc ? = 100.`];
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
    const missingTensFactor = () => {
      const factor = rand(2, 9), scale = pick([10, 100]), shown = factor * scale;
      return [`Jaką liczbą zastąpić znak ?: ${shown} = ${product(scale, "?")}`, factor,
        `Szukana liczba razy ${scale} daje ${shown}.`,
        `${shown} = ${product(scale, factor)}, więc ? = ${factor}.`];
    };
    const timesTens = () => {
      const n = rand(3, 12), small = pick([2, 3]), scale = small * 10, answer = n * scale;
      return [`Oblicz: ${n} · ${scale} = ?`, answer,
        `${scale} = ${product(small, 10)}. Najpierw pomnóż przez ${small}, potem dopisz jedno zero.`,
        `${n} · ${scale} = ${n} · ${small} · 10 = ${n * small} · 10 = ${answer}.`];
    };
    const core = shuffle(templates).slice(0, 10).map((make) => make());
    return shuffle([...core, missingTensFactor(), timesTens()]).map(([prompt, answer, hint, explanation]) => {
      return question({ label: "Mnożenie i dzielenie przez 10, 100, ...", prompt, answer, hint, explanation, visual: { type: "equation", expression: by10Tip, caption: "Zerami można sprytnie ułatwiać rachunki." } });
    });
  }

  function timesMoreQuestions() {
    const label = "Razy więcej, razy mniej";
    const visual = { type: "equation", expression: "× lub :", caption: "„Razy więcej” łączymy z mnożeniem, a „razy mniej” z dzieleniem." };
    const classic = (index) => {
      // Both factors stay in the multiplication table, so "razy mniej" never asks for 203 : 7.
      const factor = rand(2, 9), base = rand(2, 10); let prompt, answer, hint, explanation;
      if (index % 3 === 0) { answer = base * factor; prompt = `Jaka liczba jest ${factor} razy większa niż ${base}?`; hint = `Pomnóż ${base} przez ${factor}.`; explanation = `${factor} · ${base} = ${answer}.`; }
      else if (index % 3 === 1) { answer = base; prompt = `Jaka liczba jest ${factor} razy mniejsza niż ${base * factor}?`; hint = `Podziel ${base * factor} przez ${factor}.`; explanation = `${base * factor} : ${factor} = ${answer}.`; }
      else { answer = factor; prompt = `Ile razy liczba ${base * factor} jest większa niż ${base}?`; hint = `Podziel ${base * factor} przez ${base}.`; explanation = `${base * factor} : ${base} = ${answer}.`; }
      return question({ label, prompt, answer, hint, explanation, visual });
    };
    const missingSlot = () => {
      const factor = rand(2, 9), base = rand(2, 10), product = base * factor;
      if (rand(0, 1) === 0) {
        return question({ label, method: "uzupełnij brak", prompt: `Uzupełnij zdanie. ${factor} razy więcej niż jaka liczba to ${product}?`, answer: base, hint: `Podziel ${product} przez ${factor}.`, explanation: `${product} : ${factor} = ${base}.`, visual: { type: "equation", expression: `${factor} · ? = ${product}`, caption: "„Razy więcej” sprawdzaj mnożeniem." } });
      }
      return question({ label, method: "uzupełnij brak", prompt: `Uzupełnij zdanie. Jaka liczba razy więcej niż ${base} daje ${product}?`, answer: factor, hint: `Podziel ${product} przez ${base}.`, explanation: `${product} : ${base} = ${factor}.`, visual: { type: "equation", expression: `? · ${base} = ${product}`, caption: "Szukany czynnik to wynik dzielenia." } });
    };
    const chain = () => {
      const start = rand(2, 5), first = rand(2, 3), second = rand(2, 3);
      const middle = start * first, end = middle * second;
      return question({ label, method: "dwa mnożenia po kolei", prompt: `Bilet kosztuje ${start} zł. Karnet kosztuje ${first} razy więcej niż bilet, a wycieczka ${second} razy więcej niż karnet. Ile złotych kosztuje wycieczka?`, answer: end, hint: `Najpierw ${first} · ${start}, potem pomnóż wynik przez ${second}.`, explanation: `${first} · ${start} = ${middle}, a ${second} · ${middle} = ${end} zł.`, visual: { type: "equation", expression: `${start} · ${first} · ${second}`, caption: "Każde „razy więcej” to kolejne mnożenie." } });
    };
    const scaleWord = () => {
      const kind = pick(["podwojona", "potrojona", "połowa"]);
      if (kind === "połowa") {
        const base = rand(2, 10) * 2, answer = base / 2;
        return question({ label, method: "połowa liczby", prompt: `Jaka jest połowa liczby ${base}?`, answer, hint: `Podziel ${base} przez 2.`, explanation: `${base} : 2 = ${answer}.`, visual });
      }
      const factor = kind === "podwojona" ? 2 : 3, base = rand(2, 10), answer = base * factor;
      return question({ label, method: kind === "podwojona" ? "podwojona liczba" : "potrojona liczba", prompt: `Jaka jest ${kind} liczba ${base}?`, answer, hint: `Pomnóż ${base} przez ${factor}.`, explanation: `${factor} · ${base} = ${answer}.`, visual });
    };
    const classicQuestions = [];
    const seen = new Set();
    let spins = 0;
    while (classicQuestions.length < 9 && spins < 60) {
      const item = classic(classicQuestions.length);
      spins += 1;
      if (seen.has(item.prompt) && spins < 50) continue;
      seen.add(item.prompt);
      classicQuestions.push(item);
    }
    return shuffle([...classicQuestions, missingSlot(), chain(), scaleWord()]);
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
    const explicitQuotient = () => {
      const divisor = rand(2, 9), quotient = rand(2, 9), remainder = rand(1, divisor - 1);
      const total = divisor * quotient + remainder;
      return [`Jaki jest iloraz całkowity z dzielenia ${total} przez ${divisor}?`, quotient,
        `Weź pełne porcje: ${divisor} · ${quotient} = ${divisor * quotient}.`,
        `${total} : ${divisor} = ${quotient} r ${remainder}.`];
    };
    const reconstructDividend = () => {
      const divisor = rand(2, 9), quotient = rand(2, 9), remainder = rand(1, divisor - 1);
      const total = divisor * quotient + remainder;
      return [`Jaką liczbę dzielono, jeśli dzielnik to ${divisor}, iloraz to ${quotient}, a reszta to ${remainder}?`, total,
        `Oblicz ${divisor} · ${quotient} + ${remainder}.`,
        `${divisor} · ${quotient} + ${remainder} = ${total}. ${total} : ${divisor} = ${quotient} r ${remainder}.`];
    };
    const remainderBy10 = () => {
      const total = rand(11, 99), remainder = total % 10, quotient = Math.floor(total / 10);
      return [`Jaka jest reszta z dzielenia ${total} przez 10?`, remainder,
        "Reszta z dzielenia przez 10 to ostatnia cyfra.",
        `${total} : 10 = ${quotient} r ${remainder}.`];
    };
    const core = shuffle(exercises).slice(0, 9);
    return shuffle([...core, explicitQuotient(), reconstructDividend(), remainderBy10()]).map(([prompt, answer, hint, explanation]) => question({ label: "Dzielenie z resztą", prompt, answer, hint, explanation, visual: { type: "equation", expression: "dzielna : dzielnik = iloraz r reszta", caption: "Reszta jest zawsze mniejsza od dzielnika." } }));
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
      ...shuffle([0, 1, ...Array.from({ length: 11 }, (_, i) => i + 2)]).slice(0, 4).map((base, i) => power(base, 2, i === 3)),
      ...shuffle([0, 1, ...Array.from({ length: 8 }, (_, i) => i + 2)]).slice(0, 4).map((base, i) => power(base, 3, i === 3)),
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
    const standard = { type: "equation", expression: "a² = a · a   •   a³ = a · a · a", caption: "Wykładnik mówi, ile razy używamy tej samej liczby jako czynnika." };
    const core = shuffle(exercises).slice(0, 10).map(([prompt, answer, hint, explanation]) => question({ label: "Kwadraty i sześciany", prompt, answer, hint, explanation, visual: standard }));
    const contrast = () => {
      const exponent = pick([2, 3]);
      const base = exponent === 2 ? pick([2, 2, 3, 4, 5, 6, 7, 8, 9]) : rand(2, 9);
      const times = base * exponent, value = base ** exponent, same = value === times;
      const mark = superscript[exponent];
      return question({
        kind: "choice", label: "Kwadraty i sześciany", method: "potęga to nie mnożenie przez wykładnik",
        prompt: `Czy ${base}${mark} oznacza to samo co ${base} · ${exponent}? Wybierz TAK albo NIE.`,
        answer: same ? 1 : 0,
        options: [{ value: 1, label: "TAK" }, { value: 0, label: "NIE" }],
        hint: exponent === 2 ? `${base}${mark} to ${base} · ${base}.` : `${base}${mark} to ${base} · ${base} · ${base}.`,
        explanation: same
          ? `${base}${mark} = ${value} i ${base} · ${exponent} = ${times}. Tak, wyniki są równe.`
          : `${base}${mark} = ${value}, a ${base} · ${exponent} = ${times}. Nie, to różne wyniki.`,
        visual: { type: "equation", expression: `${base}${mark}   oraz   ${base} · ${exponent}`, caption: "Wykładnik liczy czynniki, a nie mówi, przez ile pomnożyć." }
      });
    };
    const factorCount = () => {
      const base = rand(2, 9), exponent = pick([2, 3, 4]), mark = superscript[exponent];
      return question({
        label: "Kwadraty i sześciany", method: "policz równe czynniki",
        prompt: `Ile jednakowych czynników ma iloczyn równy ${base}${mark}?`,
        answer: exponent,
        hint: `Wykładnik mówi, ile razy ${base} jest czynnikiem.`,
        explanation: `${base}${mark} = ${Array(exponent).fill(base).join(" · ")}. Czynników jest ${exponent}.`,
        visual: { type: "equation", expression: `${base}${mark}`, caption: "Policz czynniki, nie obliczaj potęgi." }
      });
    };
    return shuffle([...core, contrast(), factorCount()]);
  }

  function wordProblemQuestions() {
    const story = { type: "story", items: [["📖", "czytaj"], ["🧩", "połącz informacje"]], caption: "Zapisz w głowie dane i wybierz działania." };
    const classic = Array.from({ length: 10 }, (_, index) => {
      let prompt, answer, hint, explanation;
      if (index % 5 === 0) { const remaining = rand(10, 80), shown = rand(20, 120), total = remaining + shown; prompt = `Serial ma ${total} odcinków. Nadano już ${shown}. Ile odcinków pokaże jeszcze telewizja?`; answer = remaining; hint = "Od wszystkich odcinków odejmij te już pokazane."; explanation = `${total} − ${shown} = ${answer} odcinków.`; }
      else if (index % 5 === 1) { const price = rand(2, 10), sold = rand(10, 60), total = price * sold; prompt = `Jeden los kosztował ${price} zł. Uczniowie zebrali ${total} zł. Ile losów sprzedali?`; answer = sold; hint = "Podziel zebrane pieniądze przez cenę jednego losu."; explanation = `${total} : ${price} = ${answer} losów.`; }
      else if (index % 5 === 2) { const smaller = rand(20, 90), difference = rand(5, 30), larger = smaller + difference; prompt = `Duży plik zajmuje ${larger} MB, a mały jest o ${difference} MB mniejszy. Ile zajmuje mały plik?`; answer = smaller; hint = "„O mniej” oznacza odejmowanie."; explanation = `${larger} − ${difference} = ${answer} MB.`; }
      else if (index % 5 === 3) { const daily = rand(2, 9), days = rand(4, 20), total = daily * days; prompt = `Opakowanie ma ${total} tabletek. Dziecko bierze ${polishCount(daily, "tabletkę", "tabletki", "tabletek")} dziennie. Na ile dni wystarczy opakowanie?`; answer = days; hint = "Podziel liczbę tabletek przez dzienną dawkę."; explanation = `${total} : ${daily} = ${answer} dni.`; }
      else { const count = rand(2, 9), price = rand(3, 20), extra = rand(1, 10); answer = count * price + extra; prompt = `W kwiaciarni ${polishVerb(count, "jest", "są")} ${polishCount(count, "róża", "róże", "róż")} po ${price} zł i jedna wstążka za ${extra} zł. Ile kosztuje bukiet?`; hint = "Pomnóż cenę róży przez ich liczbę i dodaj wstążkę."; explanation = `${count} · ${price} + ${extra} = ${answer} zł.`; }
      return question({ label: "Zadania tekstowe", prompt, answer, hint, explanation, visual: story });
    });
    const twoStep = (prompt, answer, hint, explanation, method = "dwa działania") => question({
      label: "Zadania tekstowe", method, prompt, answer, hint, explanation, visual: story
    });
    const makers = shuffle([
      () => {
        const papers = rand(3, 9), factor = rand(2, 4), total = papers * factor, bag = total - papers;
        return twoStep(
          `Na stole ${polishVerb(papers, "leży", "leżą")} ${polishCount(papers, "papierek", "papierki", "papierków")} po cukierkach. Wszystkich cukierków było ${factor} razy więcej niż papierków, a każdy papierek zostawił jeden zjedzony cukierek. Ile cukierków zostało w torebce?`,
          bag,
          `Najpierw oblicz ${factor} · ${papers}, potem odejmij zjedzone.`,
          `${factor} · ${papers} = ${total}, a ${total} − ${papers} = ${bag}. W torebce zostało ${bag} cukierków.`
        );
      },
      () => {
        const youngest = rand(6, 10), extra = rand(3, 6), middle = youngest * 2, oldest = middle + extra;
        return twoStep(
          `Marek ma ${youngest} lat. Ewa jest od niego 2 razy starsza, a Adam jest od Ewy o ${polishCount(extra, "rok", "lata", "lat")} starszy. Ile lat ma Adam?`,
          oldest,
          `Najpierw 2 · ${youngest}, potem dodaj ${extra}.`,
          `2 · ${youngest} = ${middle}, a ${middle} + ${extra} = ${oldest}. Adam ma ${oldest} lat.`
        );
      },
      () => {
        const ola = rand(18, 40), less = rand(3, 9), iwo = ola - less, sum = ola + iwo;
        return twoStep(
          `Ola zebrała ${ola} autografów, a Iwo o ${less} mniej. Ile autografów zebrali razem?`,
          sum,
          `Najpierw odejmij ${less} od ${ola}, potem dodaj obie liczby.`,
          `${ola} − ${less} = ${iwo}, a ${ola} + ${iwo} = ${sum}.`
        );
      },
      () => {
        const one = rand(6, 14), extra = rand(2, 8), two = one + extra, total = one + 2 * two;
        return twoStep(
          `W karawanie jest ${polishCount(one, "wielbłąd jednogarbny", "wielbłądy jednogarbne", "wielbłądów jednogarbnych")} i o ${extra} więcej dwugarbnych. Ile garbów mają wszystkie wielbłądy razem?`,
          total,
          `Dwugarbnych jest ${one} + ${extra}. Każdy z nich ma 2 garby, a jednogarbny ma 1.`,
          `Dwugarbnych: ${one} + ${extra} = ${two}. Garby: ${one} + 2 · ${two} = ${total}.`
        );
      },
      () => {
        const count = rand(4, 12), gap = rand(2, 5), spaces = count - 1, answer = spaces * gap;
        return twoStep(
          `Ogrodnik sadzi ${polishCount(count, "drzewko", "drzewka", "drzewek")} w jednej linii. Między sąsiednimi drzewkami jest ${gap} m. Jaka jest odległość od pierwszego do ostatniego drzewka?`,
          answer,
          `Między ${count} drzewkami jest ${spaces} odstępów, nie ${count}.`,
          `Odstępów jest ${count} − 1 = ${spaces}. ${spaces} · ${gap} = ${answer} m.`,
          "odcinki między drzewami"
        );
      },
      () => {
        const between = rand(2, 6), behindJacek = rand(2, 8), behindBeata = between + 1 + behindJacek, frontOfJacek = rand(6, 14);
        const total = frontOfJacek + 1 + behindJacek;
        return twoStep(
          `Beata siedzi bliżej ekranu niż Jacek. Między nimi ${polishVerb(between, "jest", "są")} ${polishCount(between, "rząd", "rzędy", "rzędów")}. Przed Jackiem jest ${frontOfJacek} rzędów, a za Beatą ${behindBeata} rzędów. Ile rzędów ma ta sala?`,
          total,
          `Za Jackiem zostaje ${behindBeata} − ${between} − 1. Potem dodaj rzędy przed nim i jego własny rząd.`,
          `Za Jackiem: ${behindBeata} − ${between} − 1 = ${behindJacek}. Razem: ${frontOfJacek} + 1 + ${behindJacek} = ${total} rzędów.`
        );
      },
      () => {
        const bronze = rand(6, 12), gap = rand(2, 5), silver = bronze + gap, total = bronze + silver + silver;
        return twoStep(
          `Drużyna zdobyła ${bronze} brązowych medali. Srebrnych ma o ${gap} więcej niż brązowych, a złotych tyle samo co srebrnych. Ile medali zdobyła razem?`,
          total,
          `Srebrne: ${bronze} + ${gap}. Złote są takie same. Dodaj trzy liczby.`,
          `Srebrne i złote: po ${silver}. Razem ${bronze} + ${silver} + ${silver} = ${total}.`
        );
      }
    ]);
    return shuffle([...classic, ...makers.slice(0, 2).map((make) => make())]);
  }

  function orderQuestions() {
    const generated = Array.from({ length: 8 }, (_, index) => {
      const a = rand(2, 9), b = rand(2, 9), c = rand(2, 9); let prompt, answer, hint, explanation;
      if (index % 4 === 0) { answer = a * (b + c); prompt = `${a} · (${b} + ${c})`; hint = "Najpierw policz działanie w nawiasie."; explanation = `${b} + ${c} = ${b + c}, a ${a} · ${b + c} = ${answer}.`; }
      else if (index % 4 === 1) { answer = a + b * c; prompt = `${a} + ${b} · ${c}`; hint = "Mnożenie wykonujemy przed dodawaniem."; explanation = `${b} · ${c} = ${b * c}, a ${a} + ${b * c} = ${answer}.`; }
      else if (index % 4 === 2) { const quotient = rand(2, 9), divisor = rand(2, 9), add = rand(1, 20), dividend = quotient * divisor; answer = quotient + add; prompt = `${dividend} : ${divisor} + ${add}`; hint = "Najpierw wykonaj dzielenie."; explanation = `${dividend} : ${divisor} = ${quotient}, a ${quotient} + ${add} = ${answer}.`; }
      else { const base = rand(2, 9), subtract = rand(1, base * base - 1); answer = base * base - subtract; prompt = `${base}² − ${subtract}`; hint = "Najpierw oblicz potęgę."; explanation = `${base}² = ${base * base}, więc ${base * base} − ${subtract} = ${answer}.`; }
      return [prompt, answer, hint, explanation];
    });
    const visual = { type: "equation", expression: "( )  →  potęgi  →  · :  →  + −", caption: "Kolejność pomaga uniknąć pomyłek." };
    const plain = generated.map(([prompt, answer, hint, explanation]) => question({ label: "Kolejność działań", prompt: `Oblicz: ${prompt} = ?`, answer, hint, explanation, visual }));
    const inner = rand(2, 4);
    const divisor = inner * rand(2, 3);
    const multiplier = rand(2, 4);
    const dividend = divisor * inner * multiplier;
    const bracketed = dividend / (divisor / inner);
    const leftToRight = multiplier;
    const divisionContrast = [
      question({ label: "Kolejność działań", method: "nawias zmienia kolejność", prompt: `Oblicz: ${dividend} : (${divisor} : ${inner}) = ?`, answer: bracketed, hint: "Najpierw podziel w nawiasie.", explanation: `${divisor} : ${inner} = ${divisor / inner}, a ${dividend} : ${divisor / inner} = ${bracketed}. Bez nawiasu ${dividend} : ${divisor} : ${inner} = ${leftToRight}.`, visual: { type: "equation", expression: `${dividend} : (${divisor} : ${inner})`, caption: "Nawias każe najpierw policzyć dzielenie w środku." } }),
      question({ label: "Kolejność działań", method: "dzielenia od lewej", prompt: `Oblicz: ${dividend} : ${divisor} : ${inner} = ?`, answer: leftToRight, hint: "Dzielenia wykonuj po kolei od lewej do prawej.", explanation: `${dividend} : ${divisor} = ${dividend / divisor}, a ${dividend / divisor} : ${inner} = ${leftToRight}. Z nawiasem ${dividend} : (${divisor} : ${inner}) byłoby ${bracketed}.`, visual: { type: "equation", expression: `${dividend} : ${divisor} : ${inner}`, caption: "Bez nawiasu dzielenia idą od lewej." } })
    ];
    const total = rand(20, 60), left = rand(2, 9), right = rand(2, 9);
    const subtractionContrast = [
      question({ label: "Kolejność działań", method: "nawias zmienia kolejność", prompt: `Oblicz: ${total} − (${left} + ${right}) = ?`, answer: total - left - right, hint: "Najpierw dodaj liczby w nawiasie, potem odejmij sumę.", explanation: `${left} + ${right} = ${left + right}, a ${total} − ${left + right} = ${total - left - right}. Bez nawiasu ${total} − ${left} + ${right} = ${total - left + right}.`, visual: { type: "equation", expression: `${total} − (${left} + ${right})`, caption: "Nawias łączy dodawanie przed odejmowaniem." } }),
      question({ label: "Kolejność działań", method: "dodawanie i odejmowanie od lewej", prompt: `Oblicz: ${total} − ${left} + ${right} = ?`, answer: total - left + right, hint: "Dodawanie i odejmowanie wykonuj od lewej do prawej.", explanation: `${total} − ${left} = ${total - left}, a ${total - left} + ${right} = ${total - left + right}. Z nawiasem ${total} − (${left} + ${right}) byłoby ${total - left - right}.`, visual: { type: "equation", expression: `${total} − ${left} + ${right}`, caption: "Bez nawiasu idziemy od lewej." } })
    ];
    return shuffle([...plain, ...divisionContrast, ...subtractionContrast]);
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
  }

  function comparisonChain() {
    const step1 = rand(3, 12), step2 = rand(3, 12);
    if (rand(0, 1) === 0) {
      const base = rand(12, 40), middle = base + step1, last = middle + step2;
      return question({ label: "O ile więcej, o ile mniej", method: "porównanie w dwóch krokach", prompt: `Cebula waży ${base} dag. Marchew waży o ${step1} dag więcej niż cebula, a seler o ${step2} dag więcej niż marchew. Ile dag waży seler?`, answer: last, hint: `Najpierw dodaj ${step1} do ${base}, potem jeszcze ${step2}.`, explanation: `${base} + ${step1} = ${middle}, a ${middle} + ${step2} = ${last} dag.`, visual: { type: "equation", expression: `${base} → +${step1} → +${step2}`, caption: "Każdy kolejny krok dodaje podaną różnicę." } });
    }
    const last = rand(8, 30), middle = last + step2, base = middle + step1;
    return question({ label: "O ile więcej, o ile mniej", method: "porównanie w dwóch krokach", prompt: `Seler waży ${base} dag. Marchew waży o ${step1} dag mniej niż seler, a cebula o ${step2} dag mniej niż marchew. Ile dag waży cebula?`, answer: last, hint: `Najpierw odejmij ${step1} od ${base}, potem jeszcze ${step2}.`, explanation: `${base} − ${step1} = ${middle}, a ${middle} − ${step2} = ${last} dag.`, visual: { type: "equation", expression: `${base} → −${step1} → −${step2}`, caption: "Każdy kolejny krok odejmuje podaną różnicę." } });
  }

  function missingComparison() {
    const difference = rand(3, 18);
    if (rand(0, 1) === 0) {
      const start = rand(20, 70), result = start + difference;
      return question({ label: "O ile więcej, o ile mniej", method: "uzupełnij porównanie", prompt: `O ${difference} zł więcej od jakiej kwoty to ${result} zł?`, answer: start, hint: `Od ${result} odejmij ${difference}.`, explanation: `${start} + ${difference} = ${result}, więc szukana kwota to ${start} zł.`, visual: { type: "difference", answer: start } });
    }
    const result = rand(15, 60), start = result + difference;
    return question({ label: "O ile więcej, o ile mniej", method: "uzupełnij porównanie", prompt: `O ${difference} zł mniej od jakiej kwoty to ${result} zł?`, answer: start, hint: `Do ${result} dodaj ${difference}.`, explanation: `${start} − ${difference} = ${result}, więc szukana kwota to ${start} zł.`, visual: { type: "difference", answer: start } });
  }

  const stationMethods = {
    park: "policz dane z historii",
    plusminus: "szukaj wygodnej pary",
    moreless: "szukanie różnicy",
    multdiv: "równe grupy",
    by10: "dopisz lub skreśl zera",
    timesmore: "razy więcej to mnożenie",
    remainder: "iloraz i reszta",
    powers: "równe czynniki",
    word: "wybierz działanie z treści",
    order: "nawiasy, potem potęgi",
    numberline: "równe kroki na osi"
  };

  const routeHelp = {
    park: {
      intro: "W historiach z miasteczka najpierw znajdź dane, potem działanie.",
      items: ["„o ile więcej” oznacza odejmowanie", "ta sama cena powtarza się — mnoż", "reszty szukaj po kupieniu pełnych żetonów"]
    },
    plusminus: {
      intro: "Szukaj wygodnej pary, zanim policzysz wszystko po kolei.",
      items: ["liczby dopełniające do 100 łącz razem", "najpierw policz okrągłą sumę albo różnicę", "brakującą liczbę znajdź odwrotnym działaniem", "przy strzałce + dodaj, przy strzałce − odejmij"]
    },
    moreless: {
      intro: "„O ile więcej” i „o ile mniej” to zawsze szukanie różnicy.",
      items: ["większa minus mniejsza", "„jest o … większa” oznacza dodawanie", "łańcuszek licz krok po kroku", "gdy brakuje kwoty początkowej, cofnij różnicę"]
    },
    multdiv: {
      intro: "Mnożenie to równe grupy, a dzielenie sprawdzaj mnożeniem.",
      items: ["a · 0 = 0", "liczbę od 11 do 19 rozdziel na 10 i jedności", "brakujący czynnik znajdziesz dzieląc"]
    },
    by10: {
      intro: "Przy 10, 100 i 1000 pracuj zerami, nie długim mnożeniem.",
      items: ["· 10 dopisz jedno zero", ": 10 skreśl jedno zero", "20 = 2 · 10, a 30 = 3 · 10", "brakujący czynnik przy 10 lub 100 znajdziesz, skreślając zera"]
    },
    timesmore: {
      intro: "„Razy więcej” łączy się z mnożeniem, „razy mniej” z dzieleniem.",
      items: ["razy większa — pomnóż", "razy mniejsza — podziel", "połowa, podwojona i potrojona to też dzielenie albo mnożenie", "w łańcuszku każde „razy więcej” licz osobno"]
    },
    remainder: {
      intro: "Przy dzieleniu z resztą najpierw pełne porcje, potem to, co zostaje.",
      items: ["reszta jest mniejsza od dzielnika", "sprawdź: dzielnik · iloraz + reszta = dzielna", "reszta z dzielenia przez 10 to ostatnia cyfra"]
    },
    powers: {
      intro: "Wykładnik mówi, ile razy ta sama liczba jest czynnikiem.",
      items: ["a² = a · a", "a³ = a · a · a", "kwadrat i sześcian to nie to samo co a · 2 albo a · 3", "wykładnik mówi, ile jest równych czynników"]
    },
    word: {
      intro: "Najpierw zaznacz w głowie, jakie działanie pasuje do treści.",
      items: ["„razem” oznacza dodawanie", "„po tyle samo” oznacza mnożenie", "w zadaniu na dwa kroki zapisz oba działania", "między drzewkami odstępów jest o jeden mniej niż drzewek"]
    },
    order: {
      intro: "Kolejność działań chroni przed pomyłką.",
      items: ["najpierw nawiasy", "potem potęgi", "potem mnożenie i dzielenie, na końcu dodawanie i odejmowanie", "ten sam zapis z nawiasem może dać inny wynik"]
    },
    numberline: {
      intro: "Na osi równe kreski oznaczają równe odległości.",
      items: ["policz kroki, nie zgaduj miejsca", "środek odcinka to połowa sumy końców", "zagadka: zapisz równanie z niewiadomą"]
    },
    mix: {
      intro: "Najpierw rozpoznaj typ zadania, dopiero potem licz.",
      items: ["„o ile” oznacza różnicę", "„po tyle samo” oznacza mnożenie", "dzielenie sprawdzaj mnożeniem", "nawiasy i potęgi liczymy pierwsze"]
    }
  };

  const builders = {
    park: () => shuffle(parkQuestions()).slice(0, 10).concat(plusMinusQuestions().slice(0, 4)).slice(0, 10),
    plusminus: plusMinusQuestions,
    moreless: () => shuffle([...moreLessQuestions().slice(0, 8), patternQuestions(), ...extraChallengeQuestions().slice(0, 1), comparisonChain(), missingComparison()]),
    multdiv: multDivQuestions,
    by10: by10Questions,
    timesmore: timesMoreQuestions,
    remainder: remainderQuestions,
    powers: powersQuestions,
    word: wordProblemQuestions,
    order: orderQuestions,
    numberline: numberLineQuestions
  };

  function withRoute(routeId, item) {
    return { ...item, routeId, method: item.method || stationMethods[routeId] || item.label };
  }

  function buildQuestions(mode) {
    if (builders[mode]) return builders[mode]().map((item) => withRoute(mode, item));
    const focused = Object.keys(builders);
    const omitted = pick(focused);
    return shuffle(focused.filter((routeId) => routeId !== omitted).map((routeId) => withRoute(routeId, pick(builders[routeId]()))));
  }

  MathTownGame.start({
    chapterId: "chapter1",
    chapterTitle: "Liczby i działania",
    routeLabels,
    buildQuestions,
    routeHelp
  });
})();
