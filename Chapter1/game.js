(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const PROGRESS_STORAGE_KEY = "matematyczneMiasteczkoProgress";
  const screens = { start: $("#startScreen"), game: $("#gameScreen"), result: $("#resultScreen") };
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

  function exerciseFromAddress() {
    const exercise = new URLSearchParams(window.location.search).get("exercise");
    return Object.hasOwn(routeLabels, exercise) ? exercise : null;
  }

  const state = {
    mode: "mix",
    questions: [],
    index: 0,
    score: 0,
    streak: 0,
    correct: 0,
    answered: false,
    hintUsed: false,
    currentAnswer: "",
    best: readBest()
  };

  const el = {
    bestScore: $("#bestScore"),
    score: $("#score"),
    streak: $("#streak"),
    correctCount: $("#correctCount"),
    routeName: $("#routeName"),
    progressText: $("#progressText"),
    progressBar: $("#progressBar"),
    category: $("#category"),
    questionNumber: $("#questionNumber"),
    questionTitle: $("#questionTitle"),
    visualPanel: $("#visualPanel"),
    answerForm: $("#answerForm"),
    answerArea: $("#answerArea"),
    hintButton: $("#hintButton"),
    hintBox: $("#hintBox"),
    feedback: $("#feedback"),
    feedbackTitle: $("#feedbackTitle"),
    feedbackText: $("#feedbackText"),
    get nextButton() { return $("#nextButton"); },
    resultEmoji: $("#resultEmoji"),
    resultTitle: $("#resultTitle"),
    resultMessage: $("#resultMessage"),
    resultScore: $("#resultScore"),
    resultStars: $("#resultStars"),
    resultCorrect: $("#resultCorrect"),
    resultBest: $("#resultBest"),
    toast: $("#toast")
  };

  function readBest() {
    try { return Number(localStorage.getItem("matematyczneMiasteczkoBest")) || 0; }
    catch { return 0; }
  }

  function saveBest(value) {
    state.best = Math.max(state.best, value);
    try { localStorage.setItem("matematyczneMiasteczkoBest", String(state.best)); } catch { /* localStorage may be blocked */ }
    el.bestScore.textContent = `${state.best} pkt`;
  }

  function readProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY));
      if (!saved || !Object.hasOwn(routeLabels, saved.mode) || !Array.isArray(saved.questions) || !saved.questions.length) return null;
      if (!Number.isInteger(saved.index) || saved.index < 0 || saved.index >= saved.questions.length) return null;
      if (![saved.score, saved.streak, saved.correct].every(Number.isFinite)) return null;
      return saved;
    } catch { return null; }
  }

  function saveProgress() {
    const progress = {
      mode: state.mode,
      questions: state.questions,
      index: state.index,
      score: state.score,
      streak: state.streak,
      correct: state.correct,
      answered: state.answered,
      hintUsed: state.hintUsed,
      currentAnswer: state.currentAnswer
    };
    try { localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress)); } catch { /* Storage is optional. */ }
  }

  function clearProgress() {
    try { localStorage.removeItem(PROGRESS_STORAGE_KEY); } catch { /* Storage is optional. */ }
  }

  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function shuffle(list) { return [...list].sort(() => Math.random() - 0.5); }

  function question(data) {
    return { kind: "input", label: "Zadanie", visual: null, ...data };
  }

  function parkQuestions() {
    const templates = [
      () => question({ label: "Wesołe miasteczko", prompt: "Wesołe miasteczko jest czynne od godziny 9:00 do 20:00. Przez ile godzin dziennie działa?", answer: 11, hint: "Policz, ile godzin mija od 9 do 20: 9 → 20.", explanation: "20 − 9 = 11, więc miasteczko działa 11 godzin.", visual: { type: "story", items: [["🎡", "od 9:00"], ["⏰", "do 20:00"]], caption: "Ile godzin trwa zabawa?" } }),
      () => question({ label: "Wesołe miasteczko", prompt: "Na karuzeli jedzie 18 osób, a kolejką górską 36 osób. O ile więcej osób jedzie kolejką?", answer: 18, hint: "„O ile więcej” podpowiada odejmowanie: większa liczba − mniejsza liczba.", explanation: "36 − 18 = 18. Kolejką jedzie o 18 osób więcej.", visual: { type: "story", items: [["🎠", "18 osób"], ["🚂", "36 osób"]], caption: "Porównaj liczby osób." } }),
      () => question({ label: "Wesołe miasteczko", prompt: "Jedna gałka lodów kosztuje 4 zł. Ile zapłacisz za 2 gałki?", answer: 8, hint: "Dwie gałki po 4 zł to 4 + 4 albo 2 · 4.", explanation: "2 · 4 = 8, więc za lody zapłacisz 8 zł.", visual: { type: "story", items: [["🍦", "4 zł"], ["🍦🍦", "2 gałki"]], caption: "Ta sama cena powtarza się dwa razy." } }),
      () => question({ label: "Wesołe miasteczko", prompt: "Jeden żeton kosztuje 8 zł. Ile żetonów można kupić za 40 zł?", answer: 5, hint: "Podziel 40 zł na paczki po 8 zł.", explanation: "40 : 8 = 5, więc można kupić 5 żetonów.", visual: { type: "story", items: [["💰", "40 zł"], ["🎟️", "8 zł za 1"]], caption: "Ile razy 8 mieści się w 40?" } }),
      () => question({ label: "Wesołe miasteczko", prompt: "Bilet na jedną atrakcję kosztuje 6 zł. Ile kosztują 3 bilety?", answer: 18, hint: "Trzy bilety to trzy razy po 6 zł.", explanation: "3 · 6 = 18, więc trzy bilety kosztują 18 zł.", visual: { type: "story", items: [["🎟️", "6 zł"], ["🎟️🎟️🎟️", "3 bilety"]], caption: "Pomnóż cenę jednego biletu przez 3." } }),
      () => question({ label: "Wesołe miasteczko", prompt: "Za 60 zł kupujesz żetony po 8 zł. Ile żetonów kupisz i ile pieniędzy zostanie? Wpisz kwotę, która zostanie.", answer: 4, hint: "7 żetonów kosztuje 7 · 8 = 56 zł. Sprawdź, ile brakuje do 60 zł.", explanation: "60 − 56 = 4, więc po kupieniu 7 żetonów zostaną 4 zł.", visual: { type: "story", items: [["💰", "60 zł"], ["🎟️ × 7", "56 zł"]], caption: "Ile zostanie reszty?" } })
    ];
    return templates.map((make) => make());
  }

  function plusMinusQuestions() {
    const fixed = [
      ["86 + 97 + 3", 186, "Połącz 97 i 3, aby otrzymać pełną setkę.", "86 + 97 + 3 = 86 + 100 = 186."],
      ["99 + 27 + 1", 127, "Najpierw połącz 99 i 1.", "99 + 27 + 1 = 100 + 27 = 127."],
      ["6 + 78 + 94 + 2", 180, "Połącz 6 i 94 oraz 78 i 2.", "6 + 94 = 100, a 78 + 2 = 80. Razem 180."],
      ["91 − 86", 5, "Ile brakuje od 86 do 91?", "91 − 86 = 5."],
      ["102 − 98", 4, "Doprowadź 98 do 100, a potem skoryguj wynik.", "102 − 98 = 102 − 100 + 2 = 4."],
      ["510 − 490", 20, "Zaokrąglij obie liczby do setek.", "510 − 490 = 510 − 500 + 10 = 20."],
      ["910 − 850", 60, "Odejmij najpierw 800, a potem 50.", "910 − 850 = 60."],
      ["75 + 8", 83, "Dodaj 5 do 75, a potem jeszcze 3.", "75 + 8 = 80 + 3 = 83."],
      ["330 − 8", 322, "Odejmij 10 i dodaj 2.", "330 − 8 = 330 − 10 + 2 = 322."],
      ["220 − 188", 32, "Od 188 do 200 brakuje 12, a do 220 jeszcze 20.", "12 + 20 = 32, więc 220 − 188 = 32."]
    ];
    return shuffle(fixed).map(([prompt, answer, hint, explanation]) => question({ label: "Dodawanie i odejmowanie", prompt: `Oblicz sprytnie: ${prompt} = ?`, answer, hint, explanation, visual: { type: "equation", expression: prompt, caption: "Znajdź wygodną parę liczb." } }));
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
    const fixed = [
      ["4 · 5", 20, "To 5 + 5 + 5 + 5.", "4 · 5 = 20."],
      ["8 · 8", 64, "Pomyśl o 8 grupach po 8.", "8 · 8 = 64."],
      ["6 · 0", 0, "Każda liczba pomnożona przez zero daje zero.", "6 · 0 = 0."],
      ["6 · 7", 42, "6 · 7 to 6 grup po 7.", "6 · 7 = 42."],
      ["9 · 8", 72, "8 · 9 = 72, a kolejność czynników nie zmienia wyniku.", "9 · 8 = 72."],
      ["24 : 6", 4, "Pytanie brzmi: ile szóstek mieści się w 24?", "24 : 6 = 4."],
      ["49 : 7", 7, "Pomyśl: 7 · ? = 49.", "49 : 7 = 7."],
      ["56 : 8", 7, "Sprawdź działaniem 8 · 7.", "56 : 8 = 7, bo 8 · 7 = 56."],
      ["4 · 2 · 3", 24, "Najpierw policz 4 · 2 albo 2 · 3.", "4 · 2 · 3 = 8 · 3 = 24."],
      ["36 : 9", 4, "Ile razy 9 mieści się w 36?", "36 : 9 = 4."]
    ];
    return shuffle(fixed).slice(0, 10).map(([prompt, answer, hint, explanation]) => {
      const hasEqualGroups = ["4 · 5", "8 · 8", "6 · 7", "9 · 8", "4 · 2 · 3"].includes(prompt);
      return question({ label: "Mnożenie i dzielenie", prompt: `Oblicz: ${prompt} = ?`, answer, hint, explanation, visual: { type: hasEqualGroups ? "array" : "equation", expression: prompt, caption: hasEqualGroups ? "Równe grupy mają tyle samo elementów." : "Dzielenie sprawdzaj mnożeniem." } });
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
    const fixed = [
      ["Jaka liczba jest 3 razy większa niż 45?", 135, "Pomnóż 45 przez 3.", "3 · 45 = 135."],
      ["Jaka liczba jest 4 razy mniejsza niż 12?", 3, "Podziel 12 przez 4.", "12 : 4 = 3."],
      ["Jaka liczba jest 5 razy większa niż 16?", 80, "Pomnóż 16 przez 5.", "5 · 16 = 80."],
      ["Jaka liczba jest 8 razy mniejsza niż 120?", 15, "Podziel 120 przez 8.", "120 : 8 = 15."],
      ["Ile razy liczba 51 jest większa niż 17?", 3, "Sprawdź, ile siedemnastek mieści się w 51.", "51 : 17 = 3."],
      ["Ile razy liczba 14 jest mniejsza niż 28?", 2, "Podziel 28 przez 14.", "28 : 14 = 2."],
      ["Ile razy liczba 25 jest mniejsza niż 200?", 8, "Podziel 200 przez 25.", "200 : 25 = 8."],
      ["Ile razy liczba 160 jest większa niż 4?", 40, "Podziel 160 przez 4.", "160 : 4 = 40."],
      ["W schronisku jest 12 kotów, a psów 4 razy więcej. Ile psów mieszka w schronisku?", 48, "Pomnóż liczbę kotów przez 4.", "4 · 12 = 48 psów."],
      ["Krzysiek ma 80 zł, czyli 5 razy więcej niż Wojtek. Ile złotych ma Wojtek?", 16, "Pieniądze Wojtka znajdziesz, dzieląc 80 przez 5.", "80 : 5 = 16 zł."],
      ["Monika zerwała 5 razy mniej jabłek niż tata. Monika ma 40 jabłek. Ile jabłek zerwał tata?", 200, "Tata zerwał 5 takich grup po 40 jabłek.", "5 · 40 = 200 jabłek."],
      ["Winogrona kosztują dwa razy więcej niż jabłka. Razem kosztują 18 zł. Ile kosztują jabłka?", 6, "Cena jabłek to jedna część, a winogron dwie części.", "3 części kosztują 18 zł, więc jedna część, czyli jabłka, kosztuje 6 zł."]
    ];
    return shuffle(fixed).slice(0, 10).map(([prompt, answer, hint, explanation]) => question({ label: "Razy więcej, razy mniej", prompt, answer, hint, explanation, visual: { type: "equation", expression: "× lub :", caption: "„Razy więcej” łączymy z mnożeniem, a „razy mniej” z dzieleniem." } }));
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
    const fixed = [
      ["Serial ma 150 odcinków. Nadano już 82. Ile odcinków pokaże jeszcze telewizja?", 68, "Od wszystkich odcinków odejmij te już pokazane.", "150 − 82 = 68 odcinków."],
      ["Jeden los kosztował 2 zł. Uczniowie zebrali 120 zł. Ile losów sprzedali?", 60, "Podziel 120 zł przez cenę jednego losu.", "120 : 2 = 60 losów."],
      ["Duży plik zajmuje 85 MB, a mały jest o 17 MB mniejszy. Ile zajmuje mały plik?", 68, "„O 17 mniej” oznacza odejmowanie.", "85 − 17 = 68 MB."],
      ["Opakowanie ma 48 tabletek. Dziecko bierze 3 tabletki dziennie. Na ile dni wystarczy opakowanie?", 16, "Podziel liczbę tabletek przez dzienną dawkę.", "48 : 3 = 16 dni."],
      ["Kot waży 4 kg, a pies jest o 20 kg cięższy. Ile waży pies?", 24, "Do wagi kota dodaj 20 kg.", "4 + 20 = 24 kg."],
      ["W pudełku są 4 piłki tenisowe. Ile pudełek trzeba, aby zapakować 30 piłek?", 8, "7 pudełek mieści 28 piłek, więc potrzebne jest jeszcze jedno.", "30 : 4 = 7 r 2, dlatego trzeba 8 pudełek."],
      ["Wojtek ma 13 lat, a jego siostra Zosia 15 lat. Ile lat miała Zosia, gdy urodził się Wojtek?", 2, "Oblicz różnicę ich wieku.", "15 − 13 = 2 lata."],
      ["Niebiescy zdobyli 26 punktów, a Czarni 21. O ile więcej punktów zdobyli Niebiescy?", 5, "Porównaj 26 i 21.", "26 − 21 = 5 punktów."],
      ["W akwarium jest 17 gupików, 7 więcej kirysków, 4 więcej neonów niż kirysków i 1 glonojad. Ile ryb jest razem?", 70, "Najpierw znajdź 24 kiryski i 28 neonów, potem dodaj wszystkie ryby.", "17 + 24 + 28 + 1 = 70 ryb."],
      ["W kolejce jest 17 osób przed Wojtkiem, 8 osób między Jolą i Wojtkiem, a za Jolą stanęło jeszcze 26 osób. Ile osób jest w całej kolejce?", 35, "Najpierw policz osoby za Wojtkiem: 26 − 8 = 18, potem dodaj 17.", "17 + 18 = 35 osób."],
      ["W pudełku są 24 zielone baloniki, czerwonych jest 2 razy mniej, a żółtych 3 razy więcej niż zielonych. Ile baloników jest razem?", 108, "Czerwonych jest 12, a żółtych 72.", "24 + 12 + 72 = 108 baloników."],
      ["W kwiaciarni jest 5 róż po 10 zł i jedna wstążka za 2 zł. Ile kosztuje bukiet?", 52, "Pomnóż cenę róży przez 5 i dodaj wstążkę.", "5 · 10 + 2 = 52 zł."],
      ["Na parterze wymieniono 3 okna, na pierwszym piętrze 4 razy więcej, a na drugim o 2 mniej niż na pierwszym. Ile okien wymieniono razem?", 25, "Na pierwszym piętrze są 12 okna, na drugim 10.", "3 + 12 + 10 = 25 okien."],
      ["W autobusie jechało 17 pasażerów. Wysiedli wszyscy oprócz 5, a na kolejnym przystanku wsiadło 10 osób. Ilu pasażerów jedzie teraz?", 15, "Po pierwszym przystanku zostało 5 osób.", "5 + 10 = 15 pasażerów."],
      ["Czysta koszula kosztowałaby 3 razy więcej niż przeceniona do 36 zł. Ile kosztowałaby czysta koszula?", 108, "Pomnóż 36 zł przez 3.", "3 · 36 = 108 zł."]
    ];
    return shuffle(fixed).slice(0, 10).map(([prompt, answer, hint, explanation]) => question({ label: "Zadania tekstowe", prompt, answer, hint, explanation, visual: { type: "story", items: [["📖", "czytaj"], ["🧩", "połącz informacje"]], caption: "Zapisz w głowie dane i wybierz działania." } }));
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
    return shuffle(fixed).slice(0, 10).map(([prompt, answer, hint, explanation]) => question({ label: "Kolejność działań", prompt, answer, hint, explanation, visual: { type: "equation", expression: "( )  →  potęgi  →  · :  →  + −", caption: "Kolejność pomaga uniknąć pomyłek." } }));
  }

  function numberLineQuestions() {
    const fixed = [
      ["Na osi liczbowej każda kreska oznacza 1. Punkt jest na siódmej kresce za zerem. Jaka to liczba?", 7, "Policz siedem równych odcinków od 0.", "Siódma kreska ma współrzędną 7."],
      ["Na osi każda kreska oznacza 5. Punkt C jest na trzeciej kresce za zerem. Jaka jest jego współrzędna?", 15, "3 · 5 = ?", "3 · 5 = 15."],
      ["Na osi każda kreska oznacza 5. Punkt D jest na szóstej kresce za zerem. Jaka jest jego współrzędna?", 30, "6 · 5 = ?", "6 · 5 = 30."],
      ["Między 30 i 40 zaznaczono punkt dokładnie pośrodku. Jaka jest jego współrzędna?", 35, "Znajdź liczbę w połowie odcinka 30–40.", "Połowa między 30 a 40 to 35."],
      ["Rafał wyrzucił: 1 i 3, 4 i 6, 3 i 5, 6 i 5. Jaki wynik ma po czterech rzutach?", 33, "Dodaj sumy par: 4 + 10 + 8 + 11.", "4 + 10 + 8 + 11 = 33."],
      ["Andrzej wyrzucił: 2 i 4, 6 i 6, 3 i 2, 1 i 6. Jaki wynik ma po czterech rzutach?", 30, "Dodaj: 6 + 12 + 5 + 7.", "6 + 12 + 5 + 7 = 30."],
      ["Kto jest bliżej mety 50: Rafał ma 33 punkty, a Andrzej 30? Wybierz 1 = RAFAŁ, 2 = ANDRZEJ.", 1, "Rafałowi brakuje 17, a Andrzejowi 20 punktów.", "Rafał jest bliżej, bo 17 < 20."],
      ["Na wadze: koło + kwadrat = trójkąt, a koło + koło = trójkąt. Ile kół waży tyle co jeden trójkąt?", 2, "Skoro dwa koła ważą tyle co trójkąt, odpowiedź jest w drugim obrazku.", "Trójkąt waży tyle co 2 koła."],
      ["W łamigłówce 4 × 4 w każdym wierszu i kolumnie mają być liczby 1, 2, 3, 4. W drugim wierszu są 4, ?, 2, 1. Jaka liczba pasuje?", 3, "W wierszu brakuje liczby, której jeszcze nie ma.", "Brakuje liczby 3."],
      ["Miarka ma po obu stronach liczby, które w tym samym miejscu dają razem 151. Po jednej stronie widzisz 67. Co jest po drugiej stronie?", 84, "Oblicz 151 − 67.", "151 − 67 = 84."],
      ["Na osi liczbowej każda kreska oznacza 10. Jaka liczba jest na dziewiątej kresce za zerem?", 90, "9 · 10 = ?", "9 · 10 = 90."]
    ];
    return shuffle(fixed).slice(0, 10).map(([prompt, answer, hint, explanation]) => {
      const isChoice = prompt.includes("Wybierz");
      return question({ kind: isChoice ? "choice" : "input", label: "Oś liczbowa i łamigłówki", prompt, answer, options: isChoice ? [{ value: 1, label: "RAFAŁ" }, { value: 2, label: "ANDRZEJ" }] : undefined, hint, explanation, visual: { type: "numberline", caption: "Równe kreski oznaczają równe odległości." } });
    });
  }

  function patternQuestions() {
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
    return shuffle(pools.map((pool) => pick(pool)));
  }

  function showScreen(name) {
    Object.entries(screens).forEach(([key, screen]) => { screen.hidden = key !== name; });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startGame(mode, savedProgress = null) {
    if (savedProgress) {
      state.mode = savedProgress.mode;
      state.questions = savedProgress.questions;
      state.index = savedProgress.index;
      state.score = savedProgress.score;
      state.streak = savedProgress.streak;
      state.correct = savedProgress.correct;
      state.answered = Boolean(savedProgress.answered);
      state.hintUsed = Boolean(savedProgress.hintUsed);
      state.currentAnswer = String(savedProgress.currentAnswer ?? "");
    } else {
      state.mode = mode;
      state.questions = buildQuestions(mode);
      state.index = 0;
      state.score = 0;
      state.streak = 0;
      state.correct = 0;
      state.answered = false;
      state.hintUsed = false;
      state.currentAnswer = "";
    }
    el.routeName.textContent = routeLabels[mode];
    showScreen("game");
    updateStats();
    renderQuestion(Boolean(savedProgress));
    if (savedProgress) showToast("Przywrócono zapisaną rundę.");
  }

  function updateStats() {
    el.score.textContent = state.score;
    el.streak.textContent = state.streak;
    el.correctCount.textContent = state.correct;
    const total = state.questions.length || 10;
    el.progressText.textContent = `Wyzwanie ${Math.min(state.index + 1, total)} z ${total}`;
    el.progressBar.style.width = `${(state.index / total) * 100}%`;
  }

  function renderVisual(visual) {
    if (!visual) return "";
    if (visual.type === "story") {
      return `<div class="visual-panel story">${visual.items.map(([emoji, text]) => `<div class="story-item"><span class="big-emoji">${emoji}</span><strong>${text}</strong></div>`).join("")}<p class="visual-caption">${visual.caption}</p></div>`;
    }
    if (visual.type === "equation") {
      return `<div class="visual-panel"><div class="equation-visual"><span>${visual.expression}</span><small>${visual.caption}</small></div></div>`;
    }
    if (visual.type === "array") {
      const rows = visual.expression.includes("8 · 8") ? 2 : visual.expression.includes("4 · 2 · 3") ? 2 : 2;
      const cols = visual.expression.includes("8 · 8") ? 8 : visual.expression.includes("4 · 2 · 3") ? 4 : 5;
      return `<div class="visual-panel"><div class="array-visual">${Array.from({length: rows}, () => `<div class="array-row">${Array.from({length: cols}, () => `<span class="array-dot">🍬</span>`).join("")}</div>`).join("")}<p class="visual-caption">${visual.caption}</p></div>`;
    }
    if (visual.type === "sequence") {
      return `<div class="visual-panel"><div class="sequence-visual">${visual.values.map((value) => `<span class="sequence-number">${value}</span><span class="sequence-arrow">→</span>`).join("")}<span class="sequence-number next">?</span></div></div>`;
    }
    if (visual.type === "difference") {
      return `<div class="visual-panel"><div class="number-visual"><span class="circle">A</span><span class="sign">↔</span><span class="circle">B</span><small class="visual-caption">Znajdź odległość między liczbami.</small></div></div>`;
    }
    if (visual.type === "number") {
      return `<div class="visual-panel"><div class="number-visual"><span>${visual.left}</span><span class="sign">=</span><span class="circle">${visual.right}</span></div></div>`;
    }
    if (visual.type === "numberline") {
      return `<div class="visual-panel"><div class="numberline-visual"><div class="numberline-track"><span class="numberline-dot start"></span><span class="numberline-dot mid"></span><span class="numberline-dot end"></span></div><div class="numberline-labels"><span>0</span><span>5</span><span>10</span><span>15</span><span>20</span></div><small>${visual.caption}</small></div></div>`;
    }
    return "";
  }

  function renderQuestion(restoringProgress = false) {
    const q = state.questions[state.index];
    if (!q) return finishGame();
    if (!restoringProgress) {
      state.answered = false;
      state.hintUsed = false;
      state.currentAnswer = "";
    }
    el.category.textContent = q.label;
    el.questionNumber.textContent = `${String(state.index + 1).padStart(2, "0")} / ${String(state.questions.length).padStart(2, "0")}`;
    el.questionTitle.textContent = q.prompt;
    const visualHolder = document.createElement("div");
    visualHolder.innerHTML = renderVisual(q.visual);
    const nextVisual = visualHolder.firstElementChild || document.createElement("div");
    nextVisual.id = "visualPanel";
    if (!nextVisual.className) nextVisual.className = "visual-panel";
    el.visualPanel.replaceWith(nextVisual);
    el.visualPanel = nextVisual;
    el.feedback.hidden = !state.answered;
    el.feedback.className = "feedback";
    el.hintBox.hidden = !state.hintUsed;
    el.hintBox.textContent = q.hint;
    el.hintButton.disabled = state.hintUsed || state.answered;
    el.hintButton.textContent = state.hintUsed ? "💡 Podpowiedź pokazana" : "💡 Pokaż podpowiedź";
    if (q.kind === "choice") {
      el.answerArea.innerHTML = `<span class="answer-label">Wybierz odpowiedź</span><div class="choice-grid">${shuffle(q.options).map((option) => { const value = typeof option === "object" ? option.value : option; const label = typeof option === "object" ? option.label : option; return `<button class="choice-button" type="button" data-choice="${value}">${label}</button>`; }).join("")}</div><button class="check-button choice-action" id="nextButton" type="submit">Sprawdź</button>`;
      document.querySelectorAll(".choice-button").forEach((button) => {
        if (button.dataset.choice === state.currentAnswer) button.classList.add("selected");
      });
    } else {
      el.answerArea.innerHTML = `<label class="answer-label" for="answerInput">Twoja odpowiedź</label><div class="answer-row"><input class="answer-input" id="answerInput" inputmode="numeric" autocomplete="off" aria-label="Wpisz odpowiedź" placeholder="Wpisz liczbę" required><button class="check-button" id="nextButton" type="submit">Sprawdź</button></div>`;
      const input = $("#answerInput");
      input.value = state.currentAnswer;
      if (state.answered) input.setAttribute("disabled", "disabled");
      else window.setTimeout(() => input?.focus(), 80);
    }
    if (state.answered) showAnsweredQuestion(q, Number(state.currentAnswer) === q.answer);
    updateStats();
    if (!restoringProgress) saveProgress();
  }

  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => el.toast.classList.remove("visible"), 2200);
  }

  function getRawAnswer() {
    const input = $("#answerInput");
    if (input) return input.value.trim();
    const selected = $(".choice-button.selected");
    return selected?.dataset.choice || "";
  }

  function checkAnswer(rawAnswer) {
    if (state.answered) return;
    const q = state.questions[state.index];
    const raw = String(rawAnswer ?? "").trim().replace(",", ".");
    if (!raw) { showToast("Najpierw wpisz albo wybierz odpowiedź."); return; }
    const numericAnswer = Number(raw);
    if (!Number.isFinite(numericAnswer)) { showToast("Wpisz liczbę, na przykład 24."); return; }

    state.answered = true;
    state.currentAnswer = raw;
    const correct = numericAnswer === q.answer;
    if (correct) {
      state.correct += 1;
      state.streak += 1;
      state.score += state.hintUsed ? 5 : 10;
      state.score += Math.max(0, state.streak - 1);
    } else {
      state.streak = 0;
    }
    updateStats();
    showAnsweredQuestion(q, correct);
    saveProgress();
  }

  function showAnsweredQuestion(q, correct) {
    $("#answerInput")?.setAttribute("disabled", "disabled");
    document.querySelectorAll(".choice-button").forEach((button) => {
      button.disabled = true;
      if (Number(button.dataset.choice) === q.answer) button.classList.add("selected");
    });
    el.feedback.hidden = false;
    el.feedback.className = `feedback ${correct ? "correct" : "wrong"}`;
    el.feedbackTitle.textContent = correct ? (state.hintUsed ? "Dobrze! Podpowiedź pomogła." : "Brawo, dobrze policzone!") : "Jeszcze raz przeanalizuj zadanie.";
    el.feedbackText.textContent = correct ? q.explanation : `Prawidłowa odpowiedź to ${q.answer}. ${q.explanation}`;
    el.nextButton.className = `next-button${q.kind === "choice" ? " choice-action" : ""}${correct ? "" : " wrong"}`;
    el.nextButton.textContent = state.index === state.questions.length - 1 ? "Zobacz wynik →" : "Następne wyzwanie →";
    if (document.hasFocus()) el.nextButton.focus();
  }

  function finishGame() {
    const total = state.questions.length;
    const isNewBest = state.score > state.best;
    saveBest(state.score);
    clearProgress();
    el.resultEmoji.textContent = state.correct >= 8 ? "🎉" : state.correct >= 5 ? "🌟" : "💪";
    el.resultTitle.textContent = state.correct === total ? "Mistrzowska jazda!" : state.correct >= 7 ? "Świetna jazda!" : state.correct >= 4 ? "Dobra próba!" : "Każdy trening pomaga!";
    el.resultMessage.textContent = isNewBest ? "Ustanawiasz nowy najlepszy wynik. Miasteczko bije brawo!" : "Zobacz, które stacje już znasz, a które warto przećwiczyć jeszcze raz.";
    el.resultScore.textContent = state.score;
    el.resultCorrect.textContent = `${state.correct}/${total}`;
    el.resultBest.textContent = state.best;
    el.resultStars.textContent = state.correct >= 9 ? "★★★" : state.correct >= 6 ? "★★☆" : "★☆☆";
    showScreen("result");
  }

  function advanceQuestion() {
    state.index += 1;
    if (state.index >= state.questions.length) finishGame();
    else renderQuestion();
  }

  el.answerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (state.answered) advanceQuestion();
    else checkAnswer(getRawAnswer());
  });
  el.answerArea.addEventListener("click", (event) => {
    const choice = event.target.closest(".choice-button");
    if (!choice || state.answered) return;
    document.querySelectorAll(".choice-button").forEach((button) => button.classList.remove("selected"));
    choice.classList.add("selected");
    state.currentAnswer = choice.dataset.choice;
    saveProgress();
  });
  el.answerArea.addEventListener("input", (event) => {
    if (event.target.id !== "answerInput" || state.answered) return;
    state.currentAnswer = event.target.value;
    saveProgress();
  });
  el.hintButton.addEventListener("click", () => {
    if (state.answered) return;
    state.hintUsed = true;
    el.hintBox.hidden = false;
    el.hintButton.disabled = true;
    el.hintButton.textContent = "💡 Podpowiedź pokazana";
    saveProgress();
  });
  $("#backToMenu").addEventListener("click", () => showScreen("start"));
  $("#resultMenu").addEventListener("click", () => showScreen("start"));
  $("#playAgain").addEventListener("click", () => startGame(state.mode));

  el.bestScore.textContent = `${state.best} pkt`;
  const sharedExercise = exerciseFromAddress();
  const savedProgress = readProgress();
  if (sharedExercise) startGame(sharedExercise, savedProgress?.mode === sharedExercise ? savedProgress : null);
})();
