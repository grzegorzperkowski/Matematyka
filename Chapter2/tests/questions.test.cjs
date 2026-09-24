const test = require("node:test");
const assert = require("node:assert/strict");

require("../../shared/game-engine.js");
let config;
global.MathTownGame = { ...global.MathTownGame, start(value) { config = value; } };
require("../game.js");

test("each Chapter 2 station produces a complete ten-question round", () => {
  for (const route of Object.keys(config.routeLabels)) {
    const questions = config.buildQuestions(route);
    assert.equal(questions.length, 10, `${route} should contain 10 questions`);
    for (const question of questions) {
      assert.ok(["input", "choice"].includes(question.kind));
      assert.ok(question.prompt.length > 0);
      assert.ok(question.hint.length > 0);
      assert.ok(question.explanation.length > 0);
      assert.ok(typeof question.answer === "number" || typeof question.answer === "string");
      if (question.kind === "choice") assert.ok(question.options.length >= 2);
    }
  }
});

test("Roman-numeral answers accept lowercase input and reject a different value", () => {
  const checker = config.answerCheckers.roman;
  assert.equal(checker(" xiv ", "XIV"), true);
  assert.equal(checker("XVI", "XIV"), false);
});

test("money ticket prompts agree with Polish number forms", () => {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    for (const question of config.buildQuestions("pieniadze")) {
      assert.doesNotMatch(question.prompt, /kosztuje [2-4] biletów/);
      assert.doesNotMatch(question.prompt, /kosztują [2-4] biletów/);
      assert.doesNotMatch(question.prompt, /kosztuje [2-4] bilety/);
      assert.doesNotMatch(question.prompt, /kosztują [5-9] biletów/);
    }
  }
});

test("clock conversion reference keeps values with their units and separates both facts with whitespace", () => {
  const [question] = config.buildQuestions("zegary");
  assert.equal(question.visual.expression, "1\u00a0h = 60\u00a0min\u2003\u20031\u00a0min = 60\u00a0s");
  assert.equal(config.roundRevisions.zegary, 2);
});

const lengthSize = { mm: 1, cm: 10, dm: 100, m: 1000, km: 1000000 };
const massSize = { g: 1, dag: 10, kg: 1000, t: 1000000 };
const placePower = {
  jedności: 1,
  dziesiątek: 10,
  setek: 100,
  tysięcy: 1000,
  "dziesiątek tysięcy": 10000,
  "setek tysięcy": 100000,
  milionów: 1000000,
  "dziesiątek milionów": 10000000
};
const digitCount = {
  dwucyfrowa: 2,
  trzycyfrowa: 3,
  czterocyfrowa: 4,
  pięciocyfrowa: 5,
  sześciocyfrowa: 6,
  siedmiocyfrowa: 7,
  ośmiocyfrowa: 8,
  dziewięciocyfrowa: 9
};
const leadingPlace = {
  2: "dziesiątek",
  3: "setek",
  4: "tysięcy",
  5: "dziesiątek tysięcy",
  6: "setek tysięcy",
  7: "milionów"
};
const monthLengths = {
  styczeń: 31, marzec: 31, kwiecień: 30, maj: 31, czerwiec: 30, lipiec: 31,
  sierpień: 31, wrzesień: 30, październik: 31, listopad: 30, grudzień: 31
};
const monthNames = Object.keys({ styczeń: 1, luty: 1, marzec: 1, kwiecień: 1, maj: 1, czerwiec: 1, lipiec: 1, sierpień: 1, wrzesień: 1, październik: 1, listopad: 1, grudzień: 1 });
const weekdays = ["poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota", "niedziela"];
const romanPairs = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
const hourNom = { pierwsza: 1, druga: 2, trzecia: 3, czwarta: 4, piąta: 5, szósta: 6, siódma: 7, ósma: 8, dziewiąta: 9, dziesiąta: 10, jedenasta: 11, dwunasta: 12 };
const hourGen = { pierwszej: 1, drugiej: 2, trzeciej: 3, czwartej: 4, piątej: 5, szóstej: 6, siódmej: 7, ósmej: 8, dziewiątej: 9, dziesiątej: 10, jedenastej: 11, dwunastej: 12 };

function parseNumber(text) {
  const value = Number(String(text).replace(/[\s\u00a0\u202f]/g, ""));
  assert.equal(Number.isSafeInteger(value), true, text);
  return value;
}

function toRoman(number) {
  let rest = number;
  return romanPairs.reduce((result, [value, symbol]) => {
    while (rest >= value) {
      result += symbol;
      rest -= value;
    }
    return result;
  }, "");
}

function fromRoman(text) {
  const values = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let index = 0; index < text.length; index += 1) {
    const current = values[text[index]];
    const next = values[text[index + 1]] || 0;
    if (!current) return null;
    total += current < next ? -current : current;
  }
  return total;
}

function isCanonicalRoman(text) {
  const number = fromRoman(text);
  return Number.isInteger(number) && number > 0 && number < 4000 && toRoman(number) === text;
}

function isLeapYear(year) {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  return year % 4 === 0;
}

function digitAt(number, power) {
  return Math.floor(number / power) % 10;
}

function dayPeriod(hour, minute) {
  if (hour === 12 && minute === 0) return "w południe";
  if (hour < 5) return "w nocy";
  if (hour < 12) return "rano";
  if (hour < 18) return "po południu";
  return "wieczorem";
}

function clockText(hour, minute) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function resolveSpoken(face, minute, period) {
  const base = face === 12 ? 0 : face;
  const matches = [base, base + 12].filter((hour) => dayPeriod(hour, minute) === period);
  assert.equal(matches.length, 1, `${face}:${minute} ${period}`);
  return clockText(matches[0], minute);
}

function spokenToClock(phrase) {
  const period = ["po południu", "w południe", "w nocy", "rano", "wieczorem"].find((item) => phrase.endsWith(item));
  assert.ok(period, phrase);
  const head = phrase.slice(0, phrase.length - period.length).trim();
  const quarterPast = head.match(/^kwadrans po (\S+)$/);
  if (quarterPast) return resolveSpoken(hourGen[quarterPast[1]], 15, period);
  const twenty = head.match(/^dwadzieścia po (\S+)$/);
  if (twenty) return resolveSpoken(hourGen[twenty[1]], 20, period);
  const half = head.match(/^wpół do (\S+)$/);
  if (half) {
    const named = hourGen[half[1]];
    return resolveSpoken(named === 1 ? 12 : named - 1, 30, period);
  }
  const quarterTo = head.match(/^za kwadrans (\S+)$/);
  if (quarterTo) {
    const named = hourNom[quarterTo[1]];
    return resolveSpoken(named === 1 ? 12 : named - 1, 45, period);
  }
  const tenTo = head.match(/^za dziesięć (\S+)$/);
  if (tenTo) {
    const named = hourNom[tenTo[1]];
    return resolveSpoken(named === 1 ? 12 : named - 1, 50, period);
  }
  assert.ok(hourNom[head], phrase);
  return resolveSpoken(hourNom[head], 0, period);
}

function evalSimple(text) {
  const source = String(text).replace(/[\s\u00a0\u202f]/g, "");
  const match = source.match(/^(\d+)([+\u2212·:])(\d+)$/);
  assert.ok(match, text);
  const left = Number(match[1]);
  const right = Number(match[2 + 1]);
  const operator = match[2];
  if (operator === "+") return left + right;
  if (operator === "\u2212") return left - right;
  if (operator === "·") return left * right;
  assert.equal(left % right, 0, text);
  return left / right;
}

function moneyGross(text) {
  const mixed = text.match(/^(\d+) zł (\d{1,2}) gr$/);
  if (mixed) return Number(mixed[1]) * 100 + Number(mixed[2]);
  const onlyZl = text.match(/^(\d+) zł$/);
  if (onlyZl) return Number(onlyZl[1]) * 100;
  const onlyGr = text.match(/^(\d+) gr$/);
  if (onlyGr) return Number(onlyGr[1]);
  assert.fail(text);
}

function convertMeasure(amount, from, to, sizes) {
  assert.equal((amount * sizes[from]) % sizes[to], 0);
  return (amount * sizes[from]) / sizes[to];
}

function prove(question) {
  assert.equal(typeof question.hint, "string");
  assert.equal(typeof question.explanation, "string");
  assert.equal(question.hint.length > 0, true);
  assert.equal(question.explanation.includes("NaN") || question.explanation.includes("undefined"), false);
  if (question.kind === "choice") {
    assert.ok(question.options.some((option) => String(option.value) === String(question.answer)));
  }
  const prompt = question.prompt;
  let match;
  if ((match = prompt.match(/^W liczbie (.+) jaka jest wartość cyfry (\d) na miejscu (.+)\?$/))) {
    const number = parseNumber(match[1]);
    const digit = Number(match[2]);
    const power = placePower[match[3]];
    assert.equal(digitAt(number, power), digit);
    assert.equal(question.answer, digit * power);
    return;
  }
  if ((match = prompt.match(/^W liczbie (.+) która cyfra stoi na miejscu (.+)\?$/))) {
    assert.equal(question.answer, digitAt(parseNumber(match[1]), placePower[match[2]]));
    return;
  }
  if ((match = prompt.match(/^Zapisz największą liczbę czterocyfrową z cyfr (.+), używając każdej tylko raz\.$/))) {
    const digits = match[1].split(", ").map(Number).sort((left, right) => right - left);
    assert.equal(question.answer, Number(digits.join("")));
    return;
  }
  if ((match = prompt.match(/^Jaka jest suma cyfr liczby (.+)\?$/))) {
    assert.equal(question.answer, [...String(parseNumber(match[1]))].reduce((sum, digit) => sum + Number(digit), 0));
    return;
  }
  if ((match = prompt.match(/^Ile pełnych tysięcy jest w liczbie (.+)\?$/))) {
    assert.equal(question.answer, Math.floor(parseNumber(match[1]) / 1000));
    return;
  }
  if (question.label === "System dziesiątkowy" && (match = prompt.match(/^Oblicz: (.+)\.$/))) {
    const total = match[1].split(" + ").reduce((sum, term) => {
      const parts = term.replace(/[\s\u00a0\u202f]/g, "").match(/^(\d+)·(\d+)$/);
      assert.ok(parts, term);
      return sum + Number(parts[1]) * Number(parts[2]);
    }, 0);
    assert.equal(question.answer, total);
    return;
  }
  if ((match = prompt.match(/^Zapisz cyframi: (\d+) mln (\d+) tys\.$/))) {
    assert.equal(question.answer, Number(match[1]) * 1000000 + Number(match[2]) * 1000);
    return;
  }
  if ((match = prompt.match(/^Zapisz cyframi: (\d+) tys\.$/))) {
    assert.equal(question.answer, Number(match[1]) * 1000);
    return;
  }
  if ((match = prompt.match(/^Zapisz cyframi: (\d+) mln\.$/))) {
    assert.equal(question.answer, Number(match[1]) * 1000000);
    return;
  }
  if ((match = prompt.match(/^Zapisz cyframi: (\d+) mld\.$/))) {
    assert.equal(question.answer, Number(match[1]) * 1000000000);
    return;
  }
  if ((match = prompt.match(/^Ile tysięcy to (\d+) setek\?$/))) {
    assert.equal(question.answer, Number(match[1]) / 10);
    return;
  }
  if ((match = prompt.match(/^Ile setek to (\d+) (?:tysiąc|tysiące|tysięcy)\?$/))) {
    assert.equal(question.answer, Number(match[1]) * 10);
    return;
  }
  if ((match = prompt.match(/^Ile tysięcy to (\d+) (?:milion|miliony|milionów)\?$/))) {
    assert.equal(question.answer, Number(match[1]) * 1000);
    return;
  }
  if ((match = prompt.match(/^Ile milionów to (\d+) setek tysięcy\?$/))) {
    assert.equal(question.answer, Number(match[1]) / 10);
    return;
  }
  if ((match = prompt.match(/^Ile cyfr ma liczba (.+)\?$/))) {
    assert.equal(question.answer, String(parseNumber(match[1])).length);
    return;
  }
  if ((match = prompt.match(/^Jaka jest najmniejsza liczba (\S+)\?$/))) {
    assert.equal(question.answer, 10 ** (digitCount[match[1]] - 1));
    return;
  }
  if ((match = prompt.match(/^Jaka jest największa liczba (\S+)\?$/))) {
    assert.equal(question.answer, 10 ** digitCount[match[1]] - 1);
    return;
  }
  if ((match = prompt.match(/^Liczba (\S+) ma cyfrę (.+) równą (\d), a pozostałe cyfry równe 0\. Jaka to liczba\?$/))) {
    const digits = digitCount[match[1]];
    assert.equal(match[2], leadingPlace[digits]);
    assert.equal(question.answer, Number(match[3]) * 10 ** (digits - 1));
    return;
  }
  if ((match = prompt.match(/^Wstaw właściwy znak: (.+) \? (.+)\.$/))) {
    const left = parseNumber(match[1]);
    const right = parseNumber(match[2]);
    const sign = left === right ? "=" : left > right ? ">" : "<";
    assert.equal(question.answer, sign);
    return;
  }
  if (prompt === "Która z tych liczb jest największa?" || prompt === "Która z tych liczb jest najmniejsza?") {
    const numbers = question.options.map((option) => Number(option.value));
    const expected = prompt.includes("największa") ? Math.max(...numbers) : Math.min(...numbers);
    assert.equal(question.answer, expected);
    return;
  }
  if ((match = prompt.match(/^Ile jest liczb naturalnych większych od (.+) i mniejszych od (.+)\?$/))) {
    const low = parseNumber(match[1]);
    const high = parseNumber(match[2]);
    assert.equal(question.answer, high - low - 1);
    assert.equal(question.answer > 0, true);
    return;
  }
  if ((match = prompt.match(/^Nie wykonując działań, wstaw znak: (.+) \? (.+)\.$/))) {
    const left = evalSimple(match[1]);
    const right = evalSimple(match[2]);
    assert.notEqual(left, right);
    assert.equal(question.answer, left < right ? "<" : ">");
    return;
  }
  if (question.label === "Rachunki na dużych liczbach" && (match = prompt.match(/^Oblicz: (.+)\.$/))) {
    assert.equal(question.answer, evalSimple(match[1]));
    return;
  }
  if ((match = prompt.match(/^Jaka liczba jest o (.+) większa od (.+)\?$/))) {
    assert.equal(question.answer, parseNumber(match[2]) + parseNumber(match[1]));
    return;
  }
  if ((match = prompt.match(/^Jaka liczba jest o (.+) mniejsza od (.+)\?$/))) {
    assert.equal(question.answer, parseNumber(match[2]) - parseNumber(match[1]));
    return;
  }
  if ((match = prompt.match(/^Ile trzeba dodać do (.+), aby otrzymać (.+)\?$/))) {
    assert.equal(question.answer, parseNumber(match[2]) - parseNumber(match[1]));
    return;
  }
  if ((match = prompt.match(/^Jaka liczba jest (\d+) razy większa od (.+)\?$/))) {
    assert.equal(question.answer, Number(match[1]) * parseNumber(match[2]));
    return;
  }
  if ((match = prompt.match(/^Jaka liczba jest (\d+) razy mniejsza od (.+)\?$/))) {
    const whole = parseNumber(match[2]);
    assert.equal(whole % Number(match[1]), 0);
    assert.equal(question.answer, whole / Number(match[1]));
    return;
  }
  if ((match = prompt.match(/^Ile groszy to (.+)\?$/))) {
    assert.equal(question.answer, moneyGross(match[1]));
    return;
  }
  if ((match = prompt.match(/^Ile groszy kosztują razem (.+) i (.+)\?$/))) {
    assert.equal(question.answer, moneyGross(match[1]) + moneyGross(match[2]));
    return;
  }
  if ((match = prompt.match(/^Zakup kosztuje (.+)\. Płacisz banknotem (\d+) zł\. Ile groszy reszty otrzymasz\?$/))) {
    assert.equal(question.answer, Number(match[2]) * 100 - moneyGross(match[1]));
    assert.equal(question.answer > 0, true);
    return;
  }
  if ((match = prompt.match(/^Produkt kosztuje (.+)\. Ile groszy reszty dostaniesz z (.+) gr\?$/))) {
    assert.equal(question.answer, parseNumber(match[2]) - moneyGross(match[1]));
    return;
  }
  if ((match = prompt.match(/^Ile groszy kosztuj[eą] (\d+) bilet(?:|y|ów) po (.+) gr\?$/))) {
    assert.equal(question.answer, Number(match[1]) * parseNumber(match[2]));
    return;
  }
  if ((match = prompt.match(/^Ile pełnych złotych jest w kwocie (\d+) gr\?$/))) {
    assert.equal(question.answer, Math.floor(Number(match[1]) / 100));
    return;
  }
  if ((match = prompt.match(/^Ile groszy zostanie, gdy z (\d+) gr odliczysz pełne złote\?$/))) {
    assert.equal(question.answer, Number(match[1]) % 100);
    return;
  }
  if ((match = prompt.match(/^Która kwota jest większa: (.+) czy (.+)\?$/))) {
    const first = moneyGross(match[1]);
    const second = moneyGross(match[2]);
    assert.notEqual(first, second);
    assert.equal(question.answer, first > second ? "pierwsza" : "druga");
    return;
  }
  if ((match = prompt.match(/^Ile groszy kosztuj[eą] (\d+) zeszyt(?:|y|ów) po (\d+) zł (\d{2}) gr\?$/))) {
    assert.equal(question.answer, Number(match[1]) * (Number(match[2]) * 100 + Number(match[3])));
    return;
  }
  if ((match = prompt.match(/^Kilogram jabłek kosztuje (\d+) zł\. Ile groszy kosztuje pół kilograma\?$/))) {
    assert.equal(Number(match[1]) % 2, 0);
    assert.equal(question.answer, (Number(match[1]) / 2) * 100);
    return;
  }
  if ((match = prompt.match(/^Ile (mm|cm|dm|m|km) ma (\d+) (mm|cm|dm|m|km) (\d+) (mm|cm|dm|m|km)\?$/))) {
    assert.equal(question.answer, convertMeasure(Number(match[2]), match[3], match[1], lengthSize) + convertMeasure(Number(match[4]), match[5], match[1], lengthSize));
    return;
  }
  if ((match = prompt.match(/^Ile (mm|cm|dm|m|km) ma (\d+) (mm|cm|dm|m|km)\?$/))) {
    assert.equal(question.answer, convertMeasure(Number(match[2]), match[3], match[1], lengthSize));
    return;
  }
  if ((match = prompt.match(/^Dodaj (\d+) (mm|cm|dm|m|km) (\d+) (mm|cm|dm|m|km) i (\d+) (mm|cm|dm|m|km) (\d+) (mm|cm|dm|m|km)\. Podaj wynik w (mm|cm|dm|m|km)\.$/))) {
    const unit = match[9];
    const total = convertMeasure(Number(match[1]), match[2], unit, lengthSize)
      + convertMeasure(Number(match[3]), match[4], unit, lengthSize)
      + convertMeasure(Number(match[5]), match[6], unit, lengthSize)
      + convertMeasure(Number(match[7]), match[8], unit, lengthSize);
    assert.equal(question.answer, total);
    return;
  }
  if ((match = prompt.match(/^Ile razy dłuższy jest odcinek (\d+) (mm|cm|dm|m|km) od odcinka (\d+) (mm|cm|dm|m|km)\?$/))) {
    assert.equal(match[1], match[3]);
    assert.equal(question.answer, lengthSize[match[2]] / lengthSize[match[4]]);
    return;
  }
  if ((match = prompt.match(/^Ile (g|dag|kg|t) waży (\d+) (g|dag|kg|t) (\d+) (g|dag|kg|t)\?$/))) {
    assert.equal(question.answer, convertMeasure(Number(match[2]), match[3], match[1], massSize) + convertMeasure(Number(match[4]), match[5], match[1], massSize));
    return;
  }
  if ((match = prompt.match(/^Ile (g|dag|kg|t) (?:ma|waży) (\d+) (g|dag|kg|t)\?$/))) {
    assert.equal(question.answer, convertMeasure(Number(match[2]), match[3], match[1], massSize));
    return;
  }
  if ((match = prompt.match(/^Ile razy cięższy jest ładunek (\d+) (g|dag|kg|t) od ładunku (\d+) (g|dag|kg|t)\?$/))) {
    assert.equal(match[1], match[3]);
    assert.equal(question.answer, massSize[match[2]] / massSize[match[4]]);
    return;
  }
  if ((match = prompt.match(/^Jaka jest masa brutto w gramach, gdy masa netto to (\d+) g, a tara waży (\d+) dag\?$/))) {
    assert.equal(question.answer, Number(match[1]) + Number(match[2]) * 10);
    return;
  }
  if ((match = prompt.match(/^Zapisz liczbę (\d+) cyframi rzymskimi\.$/))) {
    assert.equal(question.answer, toRoman(Number(match[1])));
    assert.equal(isCanonicalRoman(question.answer), true);
    return;
  }
  if ((match = prompt.match(/^Odczytaj liczbę rzymską ([IVXLCDM]+)\.$/))) {
    assert.equal(isCanonicalRoman(match[1]), true);
    assert.equal(question.answer, fromRoman(match[1]));
    return;
  }
  if (prompt === "Który zapis nie jest poprawną liczbą rzymską?") {
    assert.equal(isCanonicalRoman(question.answer), false);
    for (const option of question.options) {
      if (option.value !== question.answer) assert.equal(isCanonicalRoman(option.value), true);
    }
    return;
  }
  if ((match = prompt.match(/^Ile dni ma ([a-ząćęłńóśźż]+)\?$/))) {
    assert.notEqual(match[1], "luty");
    assert.equal(question.answer, monthLengths[match[1]]);
    return;
  }
  if ((match = prompt.match(/^Jeśli dziś jest (\S+), jaki dzień będzie za (\d+) dni\?$/))) {
    const start = weekdays.indexOf(match[1]);
    assert.equal(question.answer, weekdays[(start + Number(match[2])) % 7]);
    return;
  }
  if ((match = prompt.match(/^W którym wieku leży rok (\d+)\?$/))) {
    assert.equal(question.answer, Math.floor((Number(match[1]) - 1) / 100) + 1);
    return;
  }
  if ((match = prompt.match(/^Ile dni ma luty w roku (zwykłym|przestępnym)\?$/))) {
    assert.equal(question.answer, match[1] === "zwykłym" ? 28 : 29);
    return;
  }
  if ((match = prompt.match(/^Czy rok (\d+) jest przestępny\?$/))) {
    assert.equal(question.answer, isLeapYear(Number(match[1])) ? "tak" : "nie");
    return;
  }
  if ((match = prompt.match(/^Który to miesiąc w dacie (\d+)\.(\d+)\.(\d+)\? Podaj numer miesiąca\.$/))) {
    assert.equal(question.answer, Number(match[2]));
    return;
  }
  if ((match = prompt.match(/^Który to miesiąc w dacie (\d+) ([IVXLCDM]+) (\d+)\? Podaj numer miesiąca\.$/))) {
    assert.equal(question.answer, fromRoman(match[2]));
    return;
  }
  if ((match = prompt.match(/^Ile dni to (\d+) (?:tydzień|tygodnie|tygodni)(?: i (\d+) (?:dzień|dni))?\?$/))) {
    assert.equal(question.answer, Number(match[1]) * 7 + Number(match[2] || 0));
    return;
  }
  if ((match = prompt.match(/^Ile dni ma (I|II|III|IV) kwartał(?: (roku zwykłego|roku przestępnego))?\?$/))) {
    const expected = { I: { "roku zwykłego": 90, "roku przestępnego": 91 }, II: { "": 91 }, III: { "": 92 }, IV: { "": 92 } };
    assert.equal(question.answer, expected[match[1]][match[2] || ""]);
    return;
  }
  if ((match = prompt.match(/^Ile miesięcy to (\d+) (?:rok|lata|lat)(?: i (\d+) (?:miesiąc|miesiące|miesięcy))?\?$/))) {
    assert.equal(question.answer, Number(match[1]) * 12 + Number(match[2] || 0));
    return;
  }
  if ((match = prompt.match(/^Ile miesięcy w roku ma (30|31) dni\?$/))) {
    assert.equal(question.answer, match[1] === "30" ? 4 : 7);
    return;
  }
  if ((match = prompt.match(/^Jaki miesiąc następuje po miesiącu (\S+)\?$/))) {
    const index = monthNames.indexOf(match[1]);
    assert.equal(question.answer, monthNames[(index + 1) % monthNames.length]);
    return;
  }
  if ((match = prompt.match(/^Ile minut (?:ma|mają) (\d+) (?:godzina|godziny|godzin)(?: i (\d+) (?:minuta|minuty|minut))?\?$/))) {
    assert.equal(question.answer, Number(match[1]) * 60 + Number(match[2] || 0));
    return;
  }
  if ((match = prompt.match(/^Ile sekund (?:ma|mają) (\d+) (?:minuta|minuty|minut)\?$/))) {
    assert.equal(question.answer, Number(match[1]) * 60);
    return;
  }
  if ((match = prompt.match(/^Która godzina będzie za (\d+) minut po (\d{2}):(\d{2})\? Zapisz jako liczbę minut po północy\.$/))) {
    assert.equal(question.answer, Number(match[2]) * 60 + Number(match[3]) + Number(match[1]));
    return;
  }
  if ((match = prompt.match(/^Pociąg odjeżdża o (\d{2}):(\d{2}), a przyjeżdża o (\d{2}):(\d{2})\. Ile minut trwa podróż\?$/))) {
    const start = Number(match[1]) * 60 + Number(match[2]);
    const end = Number(match[3]) * 60 + Number(match[4]);
    assert.equal(question.answer, end - start);
    return;
  }
  if ((match = prompt.match(/^Ile minut (?:ma|mają) (\d+) (?:kwadrans|kwadranse|kwadransów)\?$/))) {
    assert.equal(question.answer, Number(match[1]) * 15);
    return;
  }
  if ((match = prompt.match(/^Ile godzin (?:ma|mają) (\d+) (?:doba|doby|dób)\?$/))) {
    assert.equal(question.answer, Number(match[1]) * 24);
    return;
  }
  if ((match = prompt.match(/^Która godzina to „(.+)”\? Zapisz ją z dwukropkiem\.$/))) {
    assert.equal(question.answer, spokenToClock(match[1]));
    assert.equal(config.answerCheckers.clock(question.answer, question.answer), true);
    return;
  }
  if ((match = prompt.match(/^Zegar wskazuje (\d{2}):(\d{2})\. Która godzina będzie za (.+)\? Zapisz ją z dwukropkiem\.$/))) {
    const steps = { kwadrans: 15, "pół godziny": 30, "3 kwadranse": 45 };
    const total = Number(match[1]) * 60 + Number(match[2]) + steps[match[3]];
    assert.equal(question.answer, clockText(Math.floor(total / 60), total % 60));
    return;
  }
  if ((match = prompt.match(/^Jest godzina (\d{2}):(\d{2})\. Która godzina była (.+) temu\? Zapisz ją z dwukropkiem\.$/))) {
    const steps = { kwadrans: 15, "pół godziny": 30, "3 kwadranse": 45 };
    const total = Number(match[1]) * 60 + Number(match[2]) - steps[match[3]];
    assert.equal(question.answer, clockText(Math.floor(total / 60), total % 60));
    return;
  }
  assert.fail(`no rule matched: ${prompt}`);
}

test("generated Chapter 2 answers agree with their prompts", () => {
  const seenFebruary = new Set();
  for (let round = 0; round < 40; round += 1) {
    for (const route of Object.keys(config.routeLabels)) {
      const questions = config.buildQuestions(route);
      assert.equal(questions.length, 10);
      for (const item of questions) {
        try {
          prove(item);
        } catch (error) {
          assert.fail(`${route}: ${item.prompt} => ${item.answer}\n${error.message}`);
        }
        if (typeof item.answer === "number") assert.equal(Number.isSafeInteger(item.answer) && item.answer >= 0, true);
        assert.equal(/słownie|Zapisz podane liczby słowami/.test(item.prompt), false);
        if (item.prompt.includes("luty w roku zwykłym")) seenFebruary.add("zwykły");
        if (item.prompt.includes("luty w roku przestępnym")) seenFebruary.add("przestępny");
      }
      if (route === "mix") {
        const labels = new Set(questions.map((item) => item.label));
        for (const label of ["System dziesiątkowy", "Porównywanie liczb", "Rachunki na dużych liczbach", "Złote i grosze", "Jednostki długości", "Jednostki masy", "System rzymski", "Kalendarz", "Godziny na zegarach"]) {
          assert.equal(labels.has(label), true, label);
        }
      }
    }
  }
  assert.deepEqual([...seenFebruary].sort(), ["przestępny", "zwykły"]);
});

test("clock answers accept a colon, a dot and four digits", () => {
  const checker = config.answerCheckers.clock;
  assert.equal(checker(" 14:30 ", "14:30"), true);
  assert.equal(checker("14.30", "14:30"), true);
  assert.equal(checker("1430", "14:30"), true);
  assert.equal(checker("2:05", "02:05"), true);
  assert.equal(checker("205", "02:05"), true);
  assert.equal(checker("14:31", "14:30"), false);
  assert.equal(checker("24:00", "00:00"), false);
  assert.equal(checker("14:3", "14:03"), false);
});

test("spoken clock phrases keep the afternoon and night apart", () => {
  assert.equal(spokenToClock("druga po południu"), "14:00");
  assert.equal(spokenToClock("druga w nocy"), "02:00");
  assert.equal(spokenToClock("wpół do czwartej po południu"), "15:30");
  assert.equal(spokenToClock("wpół do pierwszej w nocy"), "00:30");
  assert.equal(spokenToClock("wpół do pierwszej po południu"), "12:30");
  assert.equal(spokenToClock("za kwadrans trzecia po południu"), "14:45");
  assert.equal(spokenToClock("za dziesięć dwunasta rano"), "11:50");
  assert.equal(spokenToClock("kwadrans po dwunastej w nocy"), "00:15");
  assert.equal(spokenToClock("dwunasta w południe"), "12:00");
  assert.equal(spokenToClock("dwunasta w nocy"), "00:00");
  assert.equal(spokenToClock("dziesiąta wieczorem"), "22:00");
  assert.equal(spokenToClock("ósma rano"), "08:00");
});
