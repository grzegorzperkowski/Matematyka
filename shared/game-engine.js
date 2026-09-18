(function (global) {
  "use strict";

  const STORAGE_KEY = "matematyczneMiasteczkoState:v2";
  const LEGACY_PROGRESS_KEY = "matematyczneMiasteczkoProgress";
  const LEGACY_BEST_KEY = "matematyczneMiasteczkoBest";
  const REPAIR_STAGES = ["none", "offer", "help", "retry", "completed"];
  const REPAIR_ANIMATIONS = ["folding-bridge", "method-lantern", "repair-stamp"];
  const TOAST_DIRECTIONS = ["top", "right", "bottom", "left"];
  const FIFTH_STEP_MESSAGES = [
    "Pięć kroków już za Tobą — jeszcze pięć. Tak trzymaj!",
    "Świetnie Ci idzie! Meta jest coraz bliżej.",
    "Dobra robota: pierwsza połowa gotowa. Ruszaj dalej!",
    "Każdy kolejny krok przybliża Cię do mety.",
    "Brawo za wytrwałość! Zostało tylko pięć małych kroków.",
    "Masz już pół rundy! Spokojnie działaj dalej."
  ];

  function randomItem(items, random) {
    return items[Math.floor(random() * items.length)];
  }

  function fifthStepEncouragement(completed, total, random = Math.random) {
    if (completed !== 5 || total !== 10) return null;
    return {
      message: randomItem(FIFTH_STEP_MESSAGES, random),
      direction: randomItem(TOAST_DIRECTIONS, random)
    };
  }

  function polishFew(count) {
    const absolute = Math.abs(Number(count));
    const mod10 = absolute % 10;
    const mod100 = absolute % 100;
    return mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14);
  }

  function polishCount(count, one, few, many) {
    const absolute = Math.abs(Number(count));
    return `${count} ${absolute === 1 ? one : polishFew(absolute) ? few : many}`;
  }

  function polishVerb(count, singular, plural) {
    const absolute = Math.abs(Number(count));
    return absolute === 1 || !polishFew(absolute) ? singular : plural;
  }

  function questionMethod(question) {
    if (!question || typeof question !== "object") return "";
    const method = typeof question.method === "string" ? question.method.trim() : "";
    if (method) return method;
    const label = typeof question.label === "string" ? question.label.trim() : "";
    return label && label !== "Zadanie" ? label : "";
  }

  function rememberedMethods(questions, limit = 2) {
    const seen = [];
    if (!Array.isArray(questions)) return seen;
    const cap = Number.isInteger(limit) && limit > 0 ? limit : 2;
    for (const question of questions) {
      const method = questionMethod(question);
      if (method && !seen.includes(method)) seen.push(method);
      if (seen.length >= cap) break;
    }
    return seen;
  }

  function lastAnsweredQuestion(round) {
    if (!round || !Array.isArray(round.questions) || round.questions.length === 0) return null;
    const index = Number.isInteger(round.index) ? round.index : 0;
    if (round.answered) return round.questions[index] || null;
    if (index > 0) return round.questions[index - 1] || null;
    return null;
  }

  function resumeSummary({ stationName, current, total, method }) {
    const station = typeof stationName === "string" && stationName.trim() ? stationName.trim() : "";
    const hasStep = Number.isInteger(current) && Number.isInteger(total) && current > 0 && total > 0;
    const parts = [station, hasStep ? `krok ${current}/${total}` : ""].filter(Boolean);
    const lead = parts.join(", ");
    if (method) return lead ? `${lead}. Ostatni sposób: ${method}.` : `Ostatni sposób: ${method}.`;
    return lead ? `${lead}.` : "Przywrócono zapisaną rundę.";
  }

  function omittedMixStations(routeLabels, questions) {
    if (!routeLabels || typeof routeLabels !== "object") return [];
    const focused = Object.keys(routeLabels).filter((id) => id !== "mix");
    const present = new Set((Array.isArray(questions) ? questions : []).map((question) => question && question.routeId).filter(Boolean));
    if (present.size === 0) return [];
    return focused.filter((id) => !present.has(id));
  }

  function normalizeHintSteps(value, length) {
    const size = Number.isInteger(length) && length > 0 ? Math.min(length, 100) : 0;
    const source = Array.isArray(value) ? value : [];
    return Array.from({ length: size }, (_, index) => source[index] === true);
  }

  function hintHelpSummary(count) {
    if (!Number.isInteger(count) || count <= 0) return "";
    if (count === 1) return "Podpowiedź pomogła w 1 kroku — to nauka, nie porażka.";
    return `Podpowiedź pomogła w ${count} krokach — to nauka, nie porażka.`;
  }

  function unfinishedHomeChips(state, chapters) {
    if (!state || state.version !== 2 || !state.rounds || typeof state.rounds !== "object" || !Array.isArray(chapters)) return [];
    const chips = [];
    chapters.forEach((chapter) => {
      if (!chapter || typeof chapter.id !== "string" || typeof chapter.href !== "string" || typeof chapter.title !== "string") return;
      const prefix = `${chapter.id}:`;
      Object.entries(state.rounds).forEach(([key, round]) => {
        if (!key.startsWith(prefix) || !roundHasProgress(round)) return;
        const mode = typeof round.mode === "string" && round.mode ? round.mode : key.slice(prefix.length);
        if (!mode) return;
        const total = Array.isArray(round.questions) && round.questions.length > 0 ? round.questions.length : 10;
        const current = Math.min(Math.max((Number.isInteger(round.index) ? round.index : 0) + 1, 1), total);
        chips.push({
          href: `${chapter.href}?exercise=${encodeURIComponent(mode)}&resume=1`,
          label: `Dokończ: ${chapter.title}`,
          detail: `krok ${current}/${total}`
        });
      });
    });
    return chips;
  }

  function emptyData() {
    return { version: 2, rounds: {}, bestScores: {}, bestStreaks: {}, completedRoutes: {}, legacyBestScores: {} };
  }

  function isQuestion(value) {
    if (!value || typeof value !== "object") return false;
    if (!["input", "choice"].includes(value.kind)) return false;
    if (![value.prompt, value.label, value.hint, value.explanation].every((text) => typeof text === "string" && text.length > 0)) return false;
    if (!(typeof value.answer === "number" && Number.isFinite(value.answer)) && typeof value.answer !== "string") return false;
    if (value.kind === "choice" && (!Array.isArray(value.options) || value.options.length < 2)) return false;
    return true;
  }

  function createRepairBridge(granted) {
    return {
      granted: Boolean(granted),
      available: Boolean(granted),
      stage: "none",
      questionIndex: null,
      firstAnswer: "",
      repairCorrect: false,
      animationVariant: null,
      choiceOrder: []
    };
  }

  function rollRepairBridge(random = Math.random) {
    return createRepairBridge(random() < 0.85);
  }

  function normalizeRepairBridge(value, questionCount = Infinity, currentIndex = null) {
    if (!value || typeof value !== "object" || value.granted !== true) return createRepairBridge(false);
    const normalized = createRepairBridge(true);
    normalized.available = value.available === true;
    normalized.stage = REPAIR_STAGES.includes(value.stage) ? value.stage : "none";
    normalized.questionIndex = Number.isInteger(value.questionIndex) && value.questionIndex >= 0 && value.questionIndex < questionCount ? value.questionIndex : null;
    normalized.firstAnswer = typeof value.firstAnswer === "string" ? value.firstAnswer : "";
    normalized.repairCorrect = value.repairCorrect === true;
    normalized.animationVariant = REPAIR_ANIMATIONS.includes(value.animationVariant) ? value.animationVariant : null;
    normalized.choiceOrder = Array.isArray(value.choiceOrder)
      ? value.choiceOrder.filter((item) => ["string", "number"].includes(typeof item)).slice(0, 100).map(String)
      : [];
    if (normalized.stage !== "none" && (normalized.questionIndex === null || (Number.isInteger(currentIndex) && normalized.questionIndex !== currentIndex))) normalized.stage = "none";
    if (normalized.stage === "offer") normalized.available = true;
    if (["help", "retry", "completed"].includes(normalized.stage)) normalized.available = false;
    if (normalized.stage === "none") {
      normalized.questionIndex = null;
      normalized.firstAnswer = "";
      normalized.animationVariant = null;
      normalized.choiceOrder = [];
    }
    return normalized;
  }

  function isRound(value, validModes) {
    if (!value || typeof value !== "object" || !validModes.includes(value.mode)) return false;
    if (!Array.isArray(value.questions) || value.questions.length === 0 || value.questions.length > 100 || !value.questions.every(isQuestion)) return false;
    if (!Number.isInteger(value.index) || value.index < 0 || value.index >= value.questions.length) return false;
    if (![value.score, value.streak, value.correct].every((number) => Number.isFinite(number) && number >= 0)) return false;
    if (value.bestStreak !== undefined && (!Number.isFinite(value.bestStreak) || value.bestStreak < value.streak)) return false;
    if (value.correct > value.index + (value.answered ? 1 : 0)) return false;
    return typeof value.currentAnswer === "string" && typeof value.answered === "boolean" && typeof value.hintUsed === "boolean";
  }

  function roundHasProgress(round) {
    return Boolean(round && Number(round.correct) > 0);
  }

  function routeCardProgress(completed, inProgress, bestScore) {
    if (completed) {
      return {
        label: "Ukończona",
        completed: true,
        record: `Rekord: ${bestScore} pkt`,
        ariaLabel: "Trasa ukończona"
      };
    }
    if (inProgress) {
      return {
        label: "Nieukończona",
        completed: false,
        record: null,
        ariaLabel: "Trasa jeszcze nieukończona"
      };
    }
    return null;
  }

  function createStore(storage, chapterId, validModes, roundRevisions = {}) {
    let data = emptyData();
    let available = Boolean(storage);
    const revisionFor = (mode) => {
      const value = Number(roundRevisions[mode]);
      return Number.isInteger(value) && value > 0 ? value : 1;
    };
    const savedRevision = (round) => Number.isInteger(round?.revision) && round.revision > 0 ? round.revision : 1;

    function persist() {
      if (!available) return false;
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
      } catch {
        available = false;
        return false;
      }
    }

    if (available) {
      try {
        const parsed = JSON.parse(storage.getItem(STORAGE_KEY));
        if (parsed?.version === 2 && parsed.rounds && parsed.bestScores && parsed.legacyBestScores) {
          data = {
            ...parsed,
            bestStreaks: parsed.bestStreaks && typeof parsed.bestStreaks === "object" ? parsed.bestStreaks : {},
            completedRoutes: parsed.completedRoutes && typeof parsed.completedRoutes === "object" ? parsed.completedRoutes : {}
          };
        }
      } catch {
        data = emptyData();
      }
    }

    function migrateLegacy() {
      if (!available) return;
      let changed = false;
      let legacyRound = null;
      try { legacyRound = JSON.parse(storage.getItem(LEGACY_PROGRESS_KEY)); } catch { /* Ignore malformed legacy data. */ }
      if (isRound({ ...legacyRound, answered: Boolean(legacyRound?.answered), hintUsed: Boolean(legacyRound?.hintUsed), currentAnswer: String(legacyRound?.currentAnswer ?? "") }, validModes)) {
        const normalized = { ...legacyRound, answered: Boolean(legacyRound.answered), hintUsed: Boolean(legacyRound.hintUsed), currentAnswer: String(legacyRound.currentAnswer ?? "") };
        const key = `${chapterId}:${normalized.mode}`;
        if (!data.rounds[key]) {
          data.rounds[key] = normalized;
          changed = true;
        }
      }
      try {
        const legacyBest = Number(storage.getItem(LEGACY_BEST_KEY));
        if (legacyBest > 0 && !Number.isFinite(data.legacyBestScores[chapterId])) {
          data.legacyBestScores[chapterId] = legacyBest;
          changed = true;
        }
      } catch { /* Storage is optional. */ }
      if (changed && persist()) {
        try {
          storage.removeItem(LEGACY_PROGRESS_KEY);
          storage.removeItem(LEGACY_BEST_KEY);
        } catch { /* The replacement is already safely stored. */ }
      }
    }

    migrateLegacy();
    const keyFor = (mode) => `${chapterId}:${mode}`;
    return {
      getRound(mode) {
        const round = data.rounds[keyFor(mode)];
        return isRound(round, validModes) && round.mode === mode && savedRevision(round) === revisionFor(mode)
          ? {
            ...round,
            repairBridge: normalizeRepairBridge(round.repairBridge, round.questions.length, round.index),
            hintSteps: normalizeHintSteps(round.hintSteps, round.questions.length)
          }
          : null;
      },
      listRounds() {
        return validModes.map((mode) => this.getRound(mode)).filter(roundHasProgress);
      },
      saveRound(round) {
        if (!isRound(round, validModes) || savedRevision(round) !== revisionFor(round.mode)) return false;
        data.rounds[keyFor(round.mode)] = {
          ...round,
          repairBridge: normalizeRepairBridge(round.repairBridge, round.questions.length, round.index),
          hintSteps: normalizeHintSteps(round.hintSteps, round.questions.length)
        };
        return persist();
      },
      clearRound(mode) {
        delete data.rounds[keyFor(mode)];
        persist();
      },
      getBest(mode) {
        const value = Number(data.bestScores[keyFor(mode)]);
        return Number.isFinite(value) && value > 0 ? value : 0;
      },
      saveBest(mode, score) {
        const normalizedScore = Number(score);
        data.bestScores[keyFor(mode)] = Math.max(this.getBest(mode), Number.isFinite(normalizedScore) ? normalizedScore : 0);
        data.completedRoutes[keyFor(mode)] = true;
        persist();
        return data.bestScores[keyFor(mode)];
      },
      hasCompleted(mode) {
        const key = keyFor(mode);
        const savedBest = data.bestScores[key];
        return data.completedRoutes[key] === true || (typeof savedBest === "number" && Number.isFinite(savedBest) && savedBest >= 0);
      },
      getBestStreak(mode) {
        const value = Number(data.bestStreaks[keyFor(mode)]);
        return Number.isFinite(value) && value > 0 ? value : 0;
      },
      saveBestStreak(mode, streak) {
        data.bestStreaks[keyFor(mode)] = Math.max(this.getBestStreak(mode), streak);
        persist();
        return data.bestStreaks[keyFor(mode)];
      },
      getLegacyBest() {
        return Number(data.legacyBestScores[chapterId]) || 0;
      },
      getRevision(mode) { return revisionFor(mode); },
      isAvailable() { return available; }
    };
  }

  function resultLevel(correct, total) {
    const ratio = total > 0 ? correct / total : 0;
    return {
      ratio,
      stars: ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1,
      tone: ratio >= 0.8 ? "great" : ratio >= 0.5 ? "good" : "practice"
    };
  }

  function resumeRequestedFromSearch(search) {
    const value = new URLSearchParams(search || "").get("resume");
    return value === "1" || value === "true";
  }

  function roundLaunchDecision(requestedMode, savedRounds, options = {}) {
    if (!requestedMode) return "idle";
    const hasSaved = savedRounds.some((round) => round.mode === requestedMode);
    if (!hasSaved) return "start";
    if (options.resume) return "resume";
    return "choose";
  }

  function withDirectorySlash(url) {
    if (url.protocol === "file:" || url.pathname.endsWith("/") || /\.html$/i.test(url.pathname)) return url;
    const next = new URL(url.href);
    next.pathname += "/";
    return next;
  }

  function directoryRedirectHref(currentHref) {
    try {
      const url = new URL(currentHref);
      const next = withDirectorySlash(url);
      return next.href === url.href ? null : next.href;
    } catch {
      return null;
    }
  }

  function chapterPlayHref(currentHref, mode, extra = {}) {
    const url = withDirectorySlash(new URL(currentHref));
    if (mode) url.searchParams.set("exercise", mode);
    else url.searchParams.delete("exercise");
    url.searchParams.delete("resume");
    if (extra.resume) url.searchParams.set("resume", String(extra.resume));
    return url.href;
  }

  if (global.document && global.document.addEventListener) {
    const redirect = typeof global.location === "object" ? directoryRedirectHref(global.location.href) : null;
    if (redirect && global.location && typeof global.location.replace === "function") {
      global.location.replace(redirect);
    }
    global.document.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target && event.target.closest && event.target.closest("a[href]");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("?exercise=") && !href.startsWith("./?exercise=")) return;
      if (!directoryRedirectHref(global.location.href)) return;
      const mode = new URLSearchParams(href.replace(/^\.\//, "")).get("exercise");
      if (!mode) return;
      event.preventDefault();
      global.location.assign(chapterPlayHref(global.location.href, mode));
    });
  }

  function start(config) {
    const $ = (selector) => document.querySelector(selector);
    const validModes = Object.keys(config.routeLabels);
    let browserStorage = null;
    try { browserStorage = global.localStorage; } catch { /* Some file: contexts block storage access. */ }
    const store = createStore(browserStorage, config.chapterId, validModes, config.roundRevisions);
    const screens = { start: $("#startScreen"), game: $("#gameScreen"), result: $("#resultScreen") };
    const state = {
      mode: "mix", questions: [], index: 0, score: 0, streak: 0, bestStreak: 0, recordStreak: 0,
      correct: 0, answered: false, hintUsed: false, currentAnswer: "", best: 0,
      lastAnswerSetRecord: false, streakBeforeMistake: 0, repairBridge: createRepairBridge(false),
      hintSteps: []
    };
    const el = {
      bestScore: $("#bestScore"), score: $("#score"), streak: $("#streak"), correctCount: $("#correctCount"),
      routeName: $("#routeName"), progressText: $("#progressText"), progressBar: $("#progressBar"), progressSteps: null, category: $("#category"),
      questionNumber: $("#questionNumber"), questionTitle: $("#questionTitle"), visualPanel: $("#visualPanel"),
      answerForm: $("#answerForm"), answerArea: $("#answerArea"), hintButton: $("#hintButton"), hintBox: $("#hintBox"),
      feedback: $("#feedback"), feedbackTitle: $("#feedbackTitle"), feedbackText: $("#feedbackText"),
      resultEmoji: $("#resultEmoji"), resultTitle: $("#resultTitle"), resultMessage: $("#resultMessage"),
      resultScore: $("#resultScore"), resultStars: $("#resultStars"), resultCorrect: $("#resultCorrect"),
      resultBest: $("#resultBest"), resultStreak: null, resultRepair: null, resultHints: null, resultMethods: null, streakBest: null,
      milestoneToast: null, milestoneMessage: null,
      toast: $("#toast"), savedRounds: $("#savedRounds"), savedRoundsList: $("#savedRoundsList"),
      get nextButton() { return $("#nextButton"); }
    };

    const defaultCheckers = {
      numeric(raw, answer) {
        const value = Number(String(raw).trim().replace(",", "."));
        return Number.isFinite(value) && value === answer;
      },
      choice(raw, answer) { return String(raw) === String(answer); }
    };
    const checkers = { ...defaultCheckers, ...(config.answerCheckers || {}) };
    const answerIsCorrect = (question, raw) => (checkers[question.checker || question.kind] || checkers.numeric)(raw, question.answer, question);

    function exerciseFromAddress() {
      const exercise = new URLSearchParams(global.location.search).get("exercise");
      return Object.hasOwn(config.routeLabels, exercise) ? exercise : null;
    }

    function resumeFromAddress() {
      return resumeRequestedFromSearch(global.location.search);
    }

    function showScreen(name, focusTarget) {
      Object.entries(screens).forEach(([key, screen]) => { screen.hidden = key !== name; });
      global.scrollTo({ top: 0, behavior: "smooth" });
      if (focusTarget) global.setTimeout(() => focusTarget.focus(), 0);
    }

    function saveProgress() {
      if (!(Number(state.correct) > 0)) {
        store.clearRound(state.mode);
        return;
      }
      const round = {
        mode: state.mode, questions: state.questions, index: state.index, score: state.score, streak: state.streak, bestStreak: state.bestStreak,
        correct: state.correct, answered: state.answered, hintUsed: state.hintUsed, currentAnswer: state.currentAnswer,
        repairBridge: normalizeRepairBridge(state.repairBridge, state.questions.length, state.index),
        hintSteps: normalizeHintSteps(state.hintSteps, state.questions.length),
        revision: store.getRevision(state.mode)
      };
      store.saveRound(round);
    }

    function hideToast() {
      el.toast.classList.remove("visible");
      global.clearTimeout(showToast.timer);
    }

    function showToast(message, duration = 2200) {
      if (repairStageIs("offer") || repairStageIs("help") || repairStageIs("retry")) return;
      el.toast.textContent = message;
      el.toast.classList.add("visible");
      global.clearTimeout(showToast.timer);
      showToast.timer = global.setTimeout(hideToast, duration);
    }

    function showFifthStepEncouragement() {
      const encouragement = fifthStepEncouragement(state.index, state.questions.length);
      if (!encouragement || !el.milestoneToast) return;
      el.milestoneToast.classList.remove("visible", ...TOAST_DIRECTIONS.map((direction) => `from-${direction}`));
      el.milestoneMessage.textContent = encouragement.message;
      global.clearTimeout(showFifthStepEncouragement.timer);
      void el.milestoneToast.offsetWidth;
      el.milestoneToast.classList.add(`from-${encouragement.direction}`, "visible");
      showFifthStepEncouragement.timer = global.setTimeout(() => {
        el.milestoneToast.classList.remove("visible", ...TOAST_DIRECTIONS.map((direction) => `from-${direction}`));
      }, 6600);
    }

    function updateStats() {
      const total = state.questions.length || 10;
      const current = Math.min(state.index + 1, total);
      const completed = Math.min(state.index + (state.answered ? 1 : 0), total);
      el.score.textContent = state.score;
      el.streak.textContent = state.streak;
      el.correctCount.textContent = state.correct;
      el.progressText.textContent = `Krok ${current} z ${total} · ukończono ${completed}/${total}`;
      el.progressBar.style.width = `${(completed / total) * 100}%`;
      const progressTrack = el.progressBar.parentElement;
      const hintedSteps = normalizeHintSteps(state.hintSteps, total).map((used, index) => used ? index + 1 : null).filter(Boolean);
      progressTrack.setAttribute("aria-valuemax", String(total));
      progressTrack.setAttribute("aria-valuenow", String(completed));
      progressTrack.setAttribute("aria-valuetext", hintedSteps.length
        ? `Ukończono ${completed} z ${total} zadań. Teraz zadanie ${current}. Podpowiedź przy krokach ${hintedSteps.join(", ")}.`
        : `Ukończono ${completed} z ${total} zadań. Teraz zadanie ${current}.`);
      if (el.progressSteps) {
        el.progressSteps.style.setProperty("--round-steps", total);
        while (el.progressSteps.children.length < total) addText(el.progressSteps, "span", el.progressSteps.children.length + 1, "progress-step");
        [...el.progressSteps.children].forEach((step, index) => {
          const usedHint = Boolean(state.hintSteps && state.hintSteps[index]);
          step.hidden = index >= total;
          step.classList.toggle("completed", index < completed);
          step.classList.toggle("current", index === current - 1 && completed < total);
          step.classList.toggle("hint-used", usedHint);
          step.textContent = index < completed ? "✓" : String(index + 1);
          if (usedHint) step.title = "z podpowiedzią";
          else step.removeAttribute("title");
        });
      }
      if (el.streakBest) el.streakBest.textContent = `rekord ${state.recordStreak}`;
      el.streak.closest(".stat-pill")?.classList.toggle("streak-active", state.streak >= 3);
      el.bestScore.textContent = `${state.best} pkt`;
    }

    function addText(parent, tag, text, className) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      node.textContent = String(text);
      parent.append(node);
      return node;
    }

    function prepareEngagementUi() {
      const progressTrack = el.progressBar.parentElement;
      progressTrack.classList.add("step-progress");
      progressTrack.setAttribute("role", "progressbar");
      progressTrack.setAttribute("aria-valuemin", "0");
      el.progressBar.setAttribute("aria-hidden", "true");
      el.progressSteps = document.createElement("div");
      el.progressSteps.className = "progress-steps";
      el.progressSteps.setAttribute("aria-hidden", "true");
      progressTrack.append(el.progressSteps);

      const streakPill = el.streak.closest(".stat-pill");
      if (streakPill) el.streakBest = addText(streakPill, "span", "rekord 0", "streak-best");

      const resultDetails = el.resultCorrect.parentElement?.parentElement;
      if (resultDetails) {
        const streakDetail = document.createElement("div");
        el.resultStreak = addText(streakDetail, "strong", "0");
        streakDetail.append(document.createTextNode("najdłuższa seria"));
        resultDetails.append(streakDetail);
        const repairDetail = document.createElement("div");
        repairDetail.className = "result-repair";
        repairDetail.hidden = true;
        el.resultRepair = addText(repairDetail, "strong", "1 przykład");
        repairDetail.append(document.createTextNode("naprawiony z pomocą"));
        resultDetails.append(repairDetail);
        const hintDetail = document.createElement("div");
        hintDetail.className = "result-hints";
        hintDetail.hidden = true;
        el.resultHints = addText(hintDetail, "strong", "1 krok");
        hintDetail.append(document.createTextNode("z podpowiedzią"));
        resultDetails.append(hintDetail);
      }
      if (el.resultMessage) {
        el.resultMethods = document.createElement("p");
        el.resultMethods.className = "result-methods";
        el.resultMethods.hidden = true;
        el.resultMessage.after(el.resultMethods);
      }

      el.milestoneToast = document.createElement("div");
      el.milestoneToast.className = "milestone-toast";
      el.milestoneToast.setAttribute("role", "status");
      el.milestoneToast.setAttribute("aria-live", "polite");
      el.milestoneToast.setAttribute("aria-atomic", "true");
      const milestoneBadge = addText(el.milestoneToast, "span", "★", "milestone-badge");
      milestoneBadge.setAttribute("aria-hidden", "true");
      const milestoneCopy = document.createElement("div");
      addText(milestoneCopy, "strong", "Półmetek!", "milestone-title");
      el.milestoneMessage = addText(milestoneCopy, "span", "", "milestone-message");
      el.milestoneToast.append(milestoneCopy);
      document.body.append(el.milestoneToast);
    }

    function replayAnimation(node, className) {
      if (!node) return;
      node.classList.remove(className);
      void node.offsetWidth;
      node.classList.add(className);
    }

    function feedbackHeading(correct) {
      if (!correct) {
        const headings = [
          "Jeszcze nie — sprawdźmy to razem.",
          "Dobry trening — zobacz rozwiązanie.",
          "Spokojnie, ten krok już coś wyjaśnia."
        ];
        return headings[state.index % headings.length];
      }
      if (state.lastAnswerSetRecord && state.streak >= 2) return `Nowy rekord: seria ${state.streak}!`;
      if (state.streak >= 5) return `Wspaniała seria ${state.streak}!`;
      if (state.streak >= 3) return `Seria ${state.streak}! Tak trzymaj!`;
      if (state.hintUsed) return ["Dobrze — podpowiedź pomogła!", "Zgadza się — krok po kroku do celu!"][state.index % 2];
      return ["Brawo, wynik się zgadza!", "Świetnie policzone!", "Tak jest — dobra odpowiedź!"][state.index % 3];
    }

    const SVG_NS = "http://www.w3.org/2000/svg";

    function addSvg(parent, tag, attributes = {}, text = null) {
      const node = document.createElementNS(SVG_NS, tag);
      Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, String(value)));
      if (text !== null) node.textContent = String(text);
      parent.append(node);
      return node;
    }

    function regularPoints(count, centerX = 120, centerY = 70, radius = 52) {
      return Array.from({ length: count }, (_, index) => {
        const angle = -Math.PI / 2 + index * 2 * Math.PI / count;
        return [centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius];
      });
    }

    function addArrow(svg, x, y, direction) {
      const size = 7;
      const points = direction === "left"
        ? `${x},${y} ${x + size * 1.5},${y - size} ${x + size * 1.5},${y + size}`
        : `${x},${y} ${x - size * 1.5},${y - size} ${x - size * 1.5},${y + size}`;
      addSvg(svg, "polygon", { points, class: "geometry-arrow" });
    }

    function renderGeometryVisual(visual, panel) {
      const shape = visual.shape || visual.subtype || visual.kind;
      const box = document.createElement("div");
      box.className = "geometry-visual";
      const relationNames = { parallel: "równoległe", perpendicular: "prostopadłe", intersecting: "przecinające się, ale nie prostopadłe", "double-perpendicular": "dwie proste prostopadłe do tej samej prostej" };
      const featureNames = { radius: "promień", diameter: "średnica", circumference: "okrąg", disk: "koło z wnętrzem", center: "środek", chord: "cięciwa", point: `punkt ${visual.pointPosition === "inside" ? "wewnątrz koła" : visual.pointPosition === "outside" ? "na zewnątrz koła" : "na okręgu"}` };
      const descriptions = {
        point: `Punkt ${visual.name || "A"}.`,
        line: `${visual.extent === "ray" ? "Półprosta" : visual.extent === "infinite" ? "Prosta" : "Odcinek"}${visual.pointNames ? ` przez punkty ${visual.pointNames.join(", ")}` : ""}.`,
        polyline: `Łamana ${visual.closed ? "zamknięta" : "otwarta"} złożona z ${visual.segments || visual.lengths?.length || 3} odcinków.`,
        lines: `Proste ${relationNames[visual.relation || visual.lineRelation] || "przecinające się"}.`,
        angle: `Kąt o mierze ${visual.degrees ?? visual.angle ?? 90} stopni${visual.split ? `, podzielony ramieniem przy ${visual.split} stopniach` : ""}.`,
        polygon: visual.variant === "rhombus" ? "Romb o czterech równych bokach i kątach, które nie są proste." : `Wielokąt o ${visual.sides || 3} bokach.`,
        rectangle: `${visual.square || visual.width === visual.height ? "Kwadrat" : "Prostokąt"} o bokach ${visual.width} i ${visual.height}.`,
        perimeter: `Wielokąt o bokach ${(visual.sides || visual.lengths || []).map((value) => value ?? "nieznana długość").join(", ")}${visual.unit ? ` ${visual.unit}` : ""}.`,
        circle: `Diagram koła: zaznaczony element to ${featureNames[visual.feature] || "okrąg"}.`
      };
      const svg = addSvg(box, "svg", { viewBox: "0 0 240 145", role: "img", "aria-label": visual.alt || descriptions[shape] || visual.caption || "Diagram geometryczny", focusable: "false" });
      const line = (x1, y1, x2, y2, className = "geometry-stroke") => addSvg(svg, "line", { x1, y1, x2, y2, class: className });
      const label = (x, y, value, className = "geometry-label") => addSvg(svg, "text", { x, y, class: className }, value);
      const dot = (x, y, className = "geometry-dot") => addSvg(svg, "circle", { cx: x, cy: y, r: 4, class: className });

      if (shape === "point") {
        dot(120, 65); label(130, 58, visual.name || "A");
      } else if (shape === "line") {
        const extent = visual.extent || "segment";
        line(35, 75, 205, 75);
        if (extent === "infinite") { addArrow(svg, 28, 75, "left"); addArrow(svg, 212, 75, "right"); }
        if (extent === "ray") { dot(42, 75); addArrow(svg, 212, 75, "right"); }
        if (extent === "segment") { dot(42, 75); dot(198, 75); }
        const names = visual.pointNames || (visual.points === 2 ? ["A", "B"] : []);
        names.forEach((name, index) => {
          const x = names.length === 3 ? 45 + index * 75 : 48 + index * 144;
          dot(x, 75); label(x - 5, 98, name);
        });
      } else if (shape === "polyline") {
        const segments = Math.max(1, Math.min(10, Number(visual.segments) || (visual.lengths?.length) || 3));
        const points = visual.closed
          ? regularPoints(Math.max(3, segments), 120, 70, 52)
          : Array.from({ length: segments + 1 }, (_, index) => [24 + index * 192 / segments, index % 2 ? 38 + (index % 3) * 12 : 104 - (index % 3) * 9]);
        const sequence = visual.closed ? [...points, points[0]] : points;
        addSvg(svg, "polyline", { points: sequence.map((point) => point.join(",")).join(" "), class: "geometry-stroke", fill: visual.closed ? "rgba(58,167,163,.12)" : "none" });
        if (visual.endpoints && !visual.closed) { dot(points[0][0], points[0][1]); dot(points.at(-1)[0], points.at(-1)[1]); }
        if (Array.isArray(visual.lengths)) visual.lengths.forEach((value, index) => {
          const first = sequence[index], second = sequence[index + 1];
          const deltaX = second[0] - first[0], deltaY = second[1] - first[1];
          const segmentLength = Math.hypot(deltaX, deltaY) || 1;
          let normalX = -deltaY / segmentLength, normalY = deltaX / segmentLength;
          const placeAbove = index % 2 === 0;
          if ((placeAbove && normalY > 0) || (!placeAbove && normalY < 0)) {
            normalX *= -1;
            normalY *= -1;
          }
          const offset = 16;
          label(
            (first[0] + second[0]) / 2 + normalX * offset,
            (first[1] + second[1]) / 2 + normalY * offset,
            value,
            "geometry-measure-label"
          );
        });
      } else if (shape === "lines") {
        const relation = visual.relation || visual.lineRelation || "intersecting";
        const names = visual.names || ["a", "b"];
        if (relation === "parallel") {
          line(35, 50, 205, 35); line(35, 105, 205, 90); label(207, 34, names[0] || "a"); label(207, 89, names[1] || "b");
        } else if (relation === "perpendicular") {
          line(28, 74, 212, 74); line(120, 12, 120, 136); label(205, 66, names[0] || "a"); label(128, 22, names[1] || "b");
          addSvg(svg, "polyline", { points: "120,74 120,58 136,58 136,74", class: "geometry-right-mark" });
          if (visual.rightMarks) {
            addSvg(svg, "polyline", { points: "120,74 104,74 104,58 120,58", class: "geometry-right-mark" });
            addSvg(svg, "polyline", { points: "120,74 120,90 136,90 136,74", class: "geometry-right-mark" });
            addSvg(svg, "polyline", { points: "120,74 104,74 104,90 120,90", class: "geometry-right-mark" });
          }
        } else if (relation === "double-perpendicular") {
          line(25, 73, 215, 73); line(75, 18, 75, 130); line(170, 18, 170, 130);
          label(78, 25, names[0] || "a"); label(203, 65, names[1] || "b"); label(174, 25, names[2] || "c");
          addSvg(svg, "polyline", { points: "75,73 75,58 90,58 90,73", class: "geometry-right-mark" });
          addSvg(svg, "polyline", { points: "170,73 170,58 185,58 185,73", class: "geometry-right-mark" });
        } else {
          line(25, 102, 215, 48); line(45, 25, 195, 122); label(204, 44, names[0] || "a"); label(197, 126, names[1] || "b");
        }
        if (visual.segments) { dot(55, 94); dot(190, 56); dot(76, 45); dot(177, 110); }
      } else if (shape === "angle") {
        const degrees = Math.max(0, Math.min(360, Number(visual.degrees ?? visual.angle ?? 90)));
        const center = [70, 102], radius = 46;
        const pointAt = (value, length = 105) => [center[0] + Math.cos(value * Math.PI / 180) * length, center[1] - Math.sin(value * Math.PI / 180) * length];
        const endpoint = pointAt(degrees);
        line(center[0], center[1], 210, center[1], "geometry-angle-ray");
        line(center[0], center[1], endpoint[0], endpoint[1], "geometry-angle-ray");
        dot(center[0], center[1], "geometry-vertex");
        if (degrees === 360) {
          addSvg(svg, "circle", { cx: center[0], cy: center[1], r: radius, class: "geometry-arc" });
        } else if (degrees > 0) {
          const arcEnd = pointAt(degrees, radius);
          addSvg(svg, "path", { d: `M ${center[0] + radius} ${center[1]} A ${radius} ${radius} 0 ${degrees > 180 ? 1 : 0} 0 ${arcEnd[0]} ${arcEnd[1]}`, class: "geometry-arc" });
        }
        if (Number.isFinite(Number(visual.split))) {
          const splitPoint = pointAt(Number(visual.split));
          line(center[0], center[1], splitPoint[0], splitPoint[1], "geometry-split-ray");
        }
        if (visual.showReflex) addSvg(svg, "path", { d: `M ${endpoint[0]} ${endpoint[1]} A 72 72 0 1 1 190 102`, class: "geometry-reflex-arc" });
        if (visual.markVertex) label(center[0] - 18, center[1] + 22, "wierzchołek", "geometry-small-label");
      } else if (shape === "polygon") {
        const sides = Math.max(3, Math.min(12, Number(visual.sides) || 3));
        const points = visual.variant === "rhombus" && sides === 4
          ? [[75, 42], [140, 42], [165, 102], [100, 102]]
          : regularPoints(sides);
        addSvg(svg, "polygon", { points: points.map((point) => point.join(",")).join(" "), class: "geometry-polygon" });
        if (visual.markVertices) points.forEach((point, index) => { dot(point[0], point[1]); label(point[0] + 6, point[1] - 4, String.fromCharCode(65 + index)); });
        if (visual.markEqualSides) points.forEach((point, index) => {
          const next = points[(index + 1) % points.length];
          label((point[0] + next[0]) / 2, (point[1] + next[1]) / 2 + 4, "•", "geometry-small-label");
        });
      } else if (shape === "rectangle") {
        const isSquare = visual.square || Number(visual.width) === Number(visual.height);
        const numericWidth = Math.max(1, Number(visual.width) || 1);
        const numericHeight = Math.max(1, Number(visual.height) || 1);
        const scale = visual.proportional ? Math.min(150 / numericWidth, 90 / numericHeight) : 1;
        const width = visual.proportional ? Math.max(36, numericWidth * scale) : isSquare ? 94 : 140;
        const height = visual.proportional ? Math.max(36, numericHeight * scale) : isSquare ? 94 : 76;
        const x = 120 - width / 2, y = 70 - height / 2;
        addSvg(svg, "rect", { x, y, width, height, class: "geometry-polygon" });
        if (visual.rightMarks) {
          const markSize = 14;
          [
            [[x, y + markSize], [x + markSize, y + markSize], [x + markSize, y]],
            [[x + width - markSize, y], [x + width - markSize, y + markSize], [x + width, y + markSize]],
            [[x + width, y + height - markSize], [x + width - markSize, y + height - markSize], [x + width - markSize, y + height]],
            [[x + markSize, y + height], [x + markSize, y + height - markSize], [x, y + height - markSize]]
          ].forEach((points) => addSvg(svg, "polyline", {
            points: points.map((point) => point.join(",")).join(" "),
            class: "geometry-right-mark"
          }));
        }
        if (visual.showDimensions) {
          label(120, y - 10, visual.widthLabel ?? visual.width, "geometry-measure-label");
          label(x + width + 18, 70, visual.heightLabel ?? visual.height, "geometry-measure-label");
        }
        if (visual.areaLabel) label(120, 72, visual.areaLabel, "geometry-area-label");
        if (visual.markOpposites) { label(120, y - 7, "•"); label(120, y + height + 18, "•"); label(x - 13, 73, "×"); label(x + width + 10, 73, "×"); }
      } else if (shape === "perimeter") {
        const sides = Array.isArray(visual.sides) ? visual.sides : (visual.lengths || [1, 1, 1, 1]);
        const points = regularPoints(Math.max(3, sides.length), 120, 68, 50);
        addSvg(svg, "polygon", { points: points.map((point) => point.join(",")).join(" "), class: "geometry-polygon" });
        sides.forEach((value, index) => {
          const next = points[(index + 1) % points.length];
          const current = points[index];
          label((current[0] + next[0]) / 2, (current[1] + next[1]) / 2 - 5, `${value ?? "?"}${visual.unit ? ` ${visual.unit}` : ""}`, "geometry-small-label");
        });
        if (visual.total) label(120, 137, `obwód: ${visual.total}`, "geometry-total-label");
      } else if (shape === "circle") {
        const center = [120, 68], radius = 50, feature = visual.feature || "circumference";
        addSvg(svg, "circle", { cx: center[0], cy: center[1], r: radius, class: feature === "disk" ? "geometry-disk" : "geometry-circle" });
        if (["center", "radius", "diameter", "chord", "point"].includes(feature)) { dot(center[0], center[1]); label(center[0] + 7, center[1] - 7, "S"); }
        if (feature === "radius") line(center[0], center[1], center[0] + radius, center[1], "geometry-feature");
        if (feature === "diameter") line(center[0] - radius, center[1], center[0] + radius, center[1], "geometry-feature");
        if (feature === "chord") line(center[0] - 40, center[1] - 30, center[0] + 40, center[1] - 30, "geometry-feature");
        if (feature === "point") {
          const distance = visual.pointPosition === "inside" ? 27 : visual.pointPosition === "outside" ? 72 : radius;
          dot(center[0] + distance, center[1], "geometry-point-p"); label(center[0] + distance + 6, center[1] - 7, "P");
        }
      } else {
        panel.hidden = true;
        return;
      }

      box.append(svg);
      addText(box, "p", visual.caption || "Diagram geometryczny.", "visual-caption");
      panel.append(box);
    }

    function fractionName(numerator, denominator) {
      if (numerator % denominator === 0) return String(numerator / denominator);
      if (numerator > denominator) {
        const whole = Math.floor(numerator / denominator);
        return `${whole} ${numerator % denominator}/${denominator}`;
      }
      return `${numerator}/${denominator}`;
    }

    function isFractionAmount(numerator, denominator) {
      return Number.isInteger(numerator) && numerator >= 0 && Number.isInteger(denominator) && denominator >= 1 && denominator <= 24;
    }

    function renderFractionShape(visual, numerator, denominator, label) {
      const shape = ["bar", "circle", "grid", "collection"].includes(visual.shape) ? visual.shape : "bar";
      const box = document.createElement("div");
      box.className = `fraction-model fraction-${shape}`;
      if (shape === "collection") {
        const collection = document.createElement("div");
        collection.className = "fraction-collection";
        collection.style.setProperty("--collection-columns", Math.min(6, Math.ceil(Math.sqrt(denominator))));
        for (let index = 0; index < denominator; index += 1) {
          const item = document.createElement("span");
          item.className = `fraction-object${index < numerator ? " shaded" : ""}`;
          item.setAttribute("aria-hidden", "true");
          collection.append(item);
        }
        box.append(collection);
      } else {
        const groups = Math.max(1, Math.min(6, Number(visual.groups) || Math.ceil(Math.max(1, numerator) / denominator)));
        let remaining = numerator;
        const shapes = document.createElement("div");
        shapes.className = "fraction-shapes";
        for (let group = 0; group < groups; group += 1) {
          const shaded = Math.max(0, Math.min(denominator, remaining));
          remaining -= shaded;
          const svg = addSvg(shapes, "svg", { viewBox: "0 0 100 100", "aria-hidden": "true", focusable: "false" });
          if (shape === "circle") {
            if (denominator === 1) {
              addSvg(svg, "circle", { cx: 50, cy: 50, r: 39, class: `fraction-part${shaded ? " shaded" : ""}` });
            } else {
              for (let part = 0; part < denominator; part += 1) {
                const start = -Math.PI / 2 + part * 2 * Math.PI / denominator;
                const end = -Math.PI / 2 + (part + 1) * 2 * Math.PI / denominator;
                const x1 = 50 + Math.cos(start) * 39, y1 = 50 + Math.sin(start) * 39;
                const x2 = 50 + Math.cos(end) * 39, y2 = 50 + Math.sin(end) * 39;
                const path = `M 50 50 L ${x1} ${y1} A 39 39 0 ${end - start > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`;
                addSvg(svg, "path", { d: path, class: `fraction-part${part < shaded ? " shaded" : ""}` });
              }
            }
          } else if (shape === "grid") {
            const rows = Math.max(1, Math.min(6, Number(visual.rows) || 1));
            const columns = Math.max(1, Math.min(12, Number(visual.columns) || denominator));
            const cellWidth = 84 / columns, cellHeight = 76 / rows;
            for (let part = 0; part < denominator; part += 1) {
              const row = Math.floor(part / columns), column = part % columns;
              addSvg(svg, "rect", { x: 8 + column * cellWidth, y: 12 + row * cellHeight, width: cellWidth, height: cellHeight, class: `fraction-part${part < shaded ? " shaded" : ""}` });
            }
          } else {
            const partWidth = 84 / denominator;
            for (let part = 0; part < denominator; part += 1) {
              addSvg(svg, "rect", { x: 8 + part * partWidth, y: 27, width: partWidth, height: 46, class: `fraction-part${part < shaded ? " shaded" : ""}` });
            }
          }
        }
        box.append(shapes);
      }
      if (label) addText(box, "p", label, "fraction-compare-label");
      return box;
    }

    function renderFractionModel(visual, panel) {
      const numerator = Number(visual.numerator);
      const denominator = Number(visual.denominator);
      const compareNumerator = Number(visual.compare?.numerator);
      const compareDenominator = Number(visual.compare?.denominator);
      const hasCompare = Boolean(visual.compare) && isFractionAmount(compareNumerator, compareDenominator);
      if (!isFractionAmount(numerator, denominator) || (visual.compare && !hasCompare)) {
        panel.hidden = true;
        return;
      }
      if (hasCompare) {
        const wrap = document.createElement("div");
        wrap.className = "fraction-compare";
        wrap.setAttribute("role", "img");
        wrap.setAttribute("aria-label", visual.alt || `Porównanie ${fractionName(numerator, denominator)} i ${fractionName(compareNumerator, compareDenominator)}. ${visual.caption || ""}`.trim());
        wrap.append(
          renderFractionShape({ shape: visual.shape }, numerator, denominator, fractionName(numerator, denominator)),
          renderFractionShape({ shape: visual.shape }, compareNumerator, compareDenominator, fractionName(compareNumerator, compareDenominator))
        );
        addText(wrap, "p", visual.caption || "Porównaj zaznaczone części obu modeli.", "visual-caption");
        panel.append(wrap);
        return;
      }
      const box = renderFractionShape(visual, numerator, denominator);
      box.setAttribute("role", "img");
      box.setAttribute("aria-label", visual.alt || `Model ułamka ${fractionName(numerator, denominator)}. ${visual.caption || ""}`.trim());
      addText(box, "p", visual.caption || `Zaznaczono ${numerator} z ${denominator} równych części.`, "visual-caption");
      panel.append(box);
    }

    function renderFractionNumberline(visual, panel) {
      const denominator = Number(visual.denominator);
      const min = Number(visual.minNumerator);
      const max = Number(visual.maxNumerator);
      const marked = Array.isArray(visual.markedNumerators) ? visual.markedNumerators.map(Number) : [];
      if (!Number.isInteger(denominator) || denominator < 1 || !Number.isInteger(min) || !Number.isInteger(max) || max <= min || max - min > 24 || marked.some((value) => !Number.isInteger(value) || value < min || value > max)) {
        panel.hidden = true;
        return;
      }
      const box = document.createElement("div");
      box.className = "fraction-numberline";
      box.setAttribute("role", "img");
      box.setAttribute("aria-label", visual.alt || `Oś od ${fractionName(min, denominator)} do ${fractionName(max, denominator)}; zaznaczono ${marked.map((value) => fractionName(value, denominator)).join(", ")}.`);
      box.style.setProperty("--fraction-ticks", max - min + 1);
      const track = document.createElement("div");
      track.className = "fraction-numberline-track";
      const labels = document.createElement("div");
      labels.className = "fraction-numberline-labels";
      for (let value = min; value <= max; value += 1) {
        const isMarked = marked.includes(value);
        const tick = document.createElement("span");
        tick.className = `fraction-numberline-tick${isMarked ? " marked" : ""}`;
        tick.setAttribute("aria-hidden", "true");
        track.append(tick);
        let label = "";
        if (isMarked && visual.unknownLabel) label = visual.unknownLabel;
        else if (isMarked && visual.showMarkedValues) label = fractionName(value, denominator);
        else if (visual.labelEveryWhole !== false && value % denominator === 0) label = String(value / denominator);
        addText(labels, "span", label, isMarked ? "marked-label" : "");
      }
      box.append(track, labels);
      addText(box, "p", visual.caption || `Jednostka jest podzielona na ${denominator} równych części.`, "visual-caption");
      panel.append(box);
    }

    function renderAreaModel(visual, panel) {
      const rows = Number(visual.rows);
      const columns = Number(visual.columns);
      const cells = Array.isArray(visual.cells) ? visual.cells.map(Number) : [];
      const validCell = (value) => value === 0 || value === 0.5 || value === 1;
      if (!Number.isInteger(rows) || rows < 1 || rows > 12 || !Number.isInteger(columns) || columns < 1 || columns > 12 || cells.length !== rows * columns || !cells.every(validCell) || (visual.diagonalHalf && !cells.every((value) => value === 0.5))) {
        panel.hidden = true;
        return;
      }

      const total = cells.reduce((sum, value) => sum + value, 0);
      const cellSize = 24;
      const margin = visual.showDimensions ? 30 : 12;
      const width = columns * cellSize;
      const height = rows * cellSize;
      const box = document.createElement("div");
      box.className = "area-model";
      const svg = addSvg(box, "svg", {
        viewBox: `0 0 ${width + margin * 2} ${height + margin * 2}`,
        role: "img",
        "aria-label": visual.alt || `Model pola złożony z ${total} jednostek kwadratowych.`,
        focusable: "false"
      });

      cells.forEach((value, index) => {
        const row = Math.floor(index / columns);
        const column = index % columns;
        const x = margin + column * cellSize;
        const y = margin + row * cellSize;
        addSvg(svg, "rect", {
          x, y, width: cellSize, height: cellSize,
          class: `area-cell${value === 1 ? " filled" : ""}`
        });
        if (value === 0.5 && !visual.diagonalHalf) {
          addSvg(svg, "polygon", {
            points: `${x},${y + cellSize} ${x},${y} ${x + cellSize},${y + cellSize}`,
            class: "area-half"
          });
          addSvg(svg, "rect", { x, y, width: cellSize, height: cellSize, class: "area-cell outline" });
        }
      });

      if (visual.diagonalHalf) {
        addSvg(svg, "polygon", {
          points: `${margin},${margin} ${margin},${margin + height} ${margin + width},${margin + height}`,
          class: "area-diagonal-half"
        });
        cells.forEach((value, index) => {
          const row = Math.floor(index / columns), column = index % columns;
          addSvg(svg, "rect", {
            x: margin + column * cellSize,
            y: margin + row * cellSize,
            width: cellSize,
            height: cellSize,
            class: "area-cell outline"
          });
        });
        addSvg(svg, "line", {
          x1: margin,
          y1: margin,
          x2: margin + width,
          y2: margin + height,
          class: "area-diagonal-cut"
        });
      }

      if (visual.outlineShape) {
        cells.forEach((value, index) => {
          if (value !== 1) return;
          const row = Math.floor(index / columns), column = index % columns;
          const x = margin + column * cellSize, y = margin + row * cellSize;
          const filledAt = (nextRow, nextColumn) => nextRow >= 0 && nextRow < rows && nextColumn >= 0 && nextColumn < columns && cells[nextRow * columns + nextColumn] === 1;
          if (!filledAt(row - 1, column)) addSvg(svg, "line", { x1: x, y1: y, x2: x + cellSize, y2: y, class: "area-shape-outline" });
          if (!filledAt(row + 1, column)) addSvg(svg, "line", { x1: x, y1: y + cellSize, x2: x + cellSize, y2: y + cellSize, class: "area-shape-outline" });
          if (!filledAt(row, column - 1)) addSvg(svg, "line", { x1: x, y1: y, x2: x, y2: y + cellSize, class: "area-shape-outline" });
          if (!filledAt(row, column + 1)) addSvg(svg, "line", { x1: x + cellSize, y1: y, x2: x + cellSize, y2: y + cellSize, class: "area-shape-outline" });
        });
      }

      if (visual.showDimensions) {
        const unit = visual.unit ? ` ${visual.unit}` : "";
        addSvg(svg, "text", { x: margin + width / 2, y: margin + height + 22, class: "area-dimension horizontal" }, `${columns}${unit}`);
        addSvg(svg, "text", { x: 10, y: margin + height / 2, class: "area-dimension vertical", transform: `rotate(-90 10 ${margin + height / 2})` }, `${rows}${unit}`);
      }
      box.append(svg);
      addText(box, "p", visual.caption || `Każda pełna kratka ma pole 1. Razem: ${total}.`, "visual-caption");
      panel.append(box);
    }

    function renderVisual(visual) {
      const panel = document.createElement("div");
      panel.id = "visualPanel";
      panel.className = "visual-panel";
      if (!visual) {
        panel.hidden = true;
        return panel;
      }
      const legacyColumn = visual.type === "equation" && typeof visual.expression === "string" && /^\s*[\d\s ]+\n[+−×]\s*[\d\s ]+\n─+\s*$/.test(visual.expression);
      const legacyDivision = visual.type === "equation" && typeof visual.expression === "string" && /^(.+)\s⟌\s(.+)$/.test(visual.expression);
      if (visual.type === "area-model") {
        renderAreaModel(visual, panel);
      } else if (visual.type === "fraction-model") {
        renderFractionModel(visual, panel);
      } else if (visual.type === "fraction-numberline") {
        renderFractionNumberline(visual, panel);
      } else if (visual.type === "geometry") {
        renderGeometryVisual(visual, panel);
      } else if (visual.type === "story") {
        panel.classList.add("story");
        visual.items.forEach(([emoji, text]) => {
          const item = document.createElement("div"); item.className = "story-item";
          addText(item, "span", emoji, "big-emoji"); addText(item, "strong", text); panel.append(item);
        });
        addText(panel, "p", visual.caption, "visual-caption");
      } else if (visual.type === "column" || legacyColumn) {
        const legacyLines = legacyColumn ? visual.expression.trim().split("\n") : null;
        const legacyRow = legacyLines ? legacyLines[1].trim().match(/^([+−×])\s*(.+)$/) : null;
        const topValue = legacyLines ? legacyLines[0].trim() : visual.top;
        const bottomValue = legacyRow ? legacyRow[2] : visual.bottom;
        const operator = legacyRow ? legacyRow[1] : visual.operator;
        const box = document.createElement("div"); box.className = "column-visual";
        box.style.setProperty("--column-width", `${Math.max(String(topValue).length, String(bottomValue).length) + 2}ch`);
        const top = addText(box, "div", topValue, "column-number");
        top.setAttribute("aria-label", `Liczba u góry: ${topValue}`);
        const row = document.createElement("div"); row.className = "column-row";
        addText(row, "span", operator, "column-operator"); addText(row, "span", bottomValue, "column-number"); box.append(row);
        const rule = document.createElement("div"); rule.className = "column-rule"; box.append(rule);
        addText(box, "p", visual.caption, "visual-caption"); panel.append(box);
      } else if (visual.type === "division" || legacyDivision) {
        const legacyValues = legacyDivision ? visual.expression.match(/^(.+)\s⟌\s(.+)$/) : null;
        const divisor = legacyValues ? legacyValues[1] : visual.divisor;
        const dividend = legacyValues ? legacyValues[2] : visual.dividend;
        const box = document.createElement("div"); box.className = "division-visual";
        const quotient = addText(box, "span", "?", "division-quotient"); quotient.setAttribute("aria-label", "Szukany iloraz");
        const dividendNode = addText(box, "span", dividend, "division-dividend"); dividendNode.setAttribute("aria-label", `Dzielna: ${dividend}`);
        addText(box, "span", ":", "division-colon").setAttribute("aria-hidden", "true");
        const divisorNode = addText(box, "span", divisor, "division-divisor"); divisorNode.setAttribute("aria-label", `Dzielnik: ${divisor}`);
        addText(box, "p", visual.caption, "visual-caption"); panel.append(box);
      } else if (visual.type === "equation") {
        const box = document.createElement("div"); box.className = "equation-visual";
        addText(box, "span", visual.expression); addText(box, "small", visual.caption); panel.append(box);
      } else if (visual.type === "array") {
        const box = document.createElement("div"); box.className = "array-visual";
        for (let group = 0; group < visual.groups; group += 1) {
          const row = document.createElement("div"); row.className = "array-row";
          row.style.setProperty("--items", visual.itemsPerGroup);
          for (let item = 0; item < visual.itemsPerGroup; item += 1) addText(row, "span", "●", "array-dot");
          box.append(row);
        }
        addText(box, "p", visual.caption, "visual-caption"); panel.append(box);
      } else if (visual.type === "sequence") {
        const box = document.createElement("div"); box.className = "sequence-visual";
        visual.values.forEach((value) => { addText(box, "span", value, "sequence-number"); addText(box, "span", "→", "sequence-arrow"); });
        addText(box, "span", "?", "sequence-number next"); panel.append(box);
      } else if (visual.type === "difference") {
        const box = document.createElement("div"); box.className = "number-visual";
        addText(box, "span", "A", "circle"); addText(box, "span", "↔", "sign"); addText(box, "span", "B", "circle");
        addText(box, "small", "Znajdź odległość między liczbami.", "visual-caption"); panel.append(box);
      } else if (visual.type === "number") {
        const box = document.createElement("div"); box.className = "number-visual";
        addText(box, "span", visual.left); addText(box, "span", "=", "sign"); addText(box, "span", visual.right, "circle"); panel.append(box);
      } else if (visual.type === "numberline") {
        const box = document.createElement("div"); box.className = "numberline-visual";
        const track = document.createElement("div"); track.className = "numberline-track";
        const labels = document.createElement("div"); labels.className = "numberline-labels";
        for (let value = visual.min; value <= visual.max; value += visual.step) {
          const tick = document.createElement("span"); tick.className = "numberline-tick";
          if (value === visual.marked) { tick.classList.add("marked"); tick.setAttribute("aria-label", `Zaznaczony punkt ${value}`); }
          track.append(tick); addText(labels, "span", value);
        }
        box.style.setProperty("--ticks", Math.floor((visual.max - visual.min) / visual.step) + 1);
        box.append(track, labels); addText(box, "small", visual.caption); panel.append(box);
      } else {
        panel.hidden = true;
      }
      return panel;
    }

    function repairStageIs(stage) {
      return state.repairBridge.questionIndex === state.index && state.repairBridge.stage === stage;
    }

    function resetFeedback(title, text) {
      el.feedbackTitle.textContent = title;
      el.feedbackText.textContent = text;
      el.feedback.replaceChildren(el.feedbackTitle, el.feedbackText);
    }

    function addMethodLabel(question) {
      const method = questionMethod(question);
      if (!method) return;
      addText(el.feedback, "p", `Sposób: ${method}`, "method-label");
    }

    function applyRouteHelp(mode) {
      const help = config.routeHelp && (config.routeHelp[mode] || config.routeHelp.mix);
      if (!help) return;
      const side = document.querySelector(".side-card");
      if (!side) return;
      const intro = side.querySelector("h2 + p");
      const list = side.querySelector(".lesson-list");
      if (intro && typeof help.intro === "string") intro.textContent = help.intro;
      if (list && Array.isArray(help.items)) {
        list.replaceChildren();
        help.items.forEach((item) => addText(list, "li", item));
      }
    }

    function routeHeading(mode, questions) {
      const name = config.routeLabels[mode];
      if (mode !== "mix") return name;
      const omitted = omittedMixStations(config.routeLabels, questions);
      if (omitted.length !== 1) return name;
      return `${name} · dziś bez: ${config.routeLabels[omitted[0]]}`;
    }

    function setNextButton(correct) {
      el.nextButton.hidden = false;
      el.nextButton.disabled = false;
      el.nextButton.className = `next-button${state.questions[state.index].kind === "choice" ? " choice-action" : ""}${correct ? "" : " wrong"}`;
      el.nextButton.textContent = state.index === state.questions.length - 1 ? "Zobacz wynik →" : "Następne wyzwanie →";
    }

    function disableAnswerControls(question, revealCorrectAnswer) {
      $("#answerInput")?.setAttribute("disabled", "disabled");
      document.querySelectorAll(".choice-button").forEach((button) => {
        const learnerChoice = button.dataset.choice === state.currentAnswer;
        const correctChoice = String(button.dataset.choice) === String(question.answer);
        button.classList.remove("learner-answer", "correct-answer");
        button.querySelectorAll(".choice-state").forEach((label) => label.remove());
        button.disabled = true;
        button.setAttribute("aria-pressed", String(learnerChoice));
        if (learnerChoice) { button.classList.add("learner-answer"); addText(button, "span", "Twoja odpowiedź", "choice-state"); }
        if (revealCorrectAnswer && correctChoice) { button.classList.add("correct-answer"); addText(button, "span", "Poprawna odpowiedź", "choice-state"); }
      });
    }

    function addRepairDecoration(parent) {
      const decoration = document.createElement("div");
      decoration.className = `repair-decoration ${state.repairBridge.animationVariant || "folding-bridge"}`;
      decoration.setAttribute("aria-hidden", "true");
      if (state.repairBridge.animationVariant === "method-lantern") decoration.textContent = "Sposób";
      else if (state.repairBridge.animationVariant === "repair-stamp") decoration.textContent = "SPRÓBUJ";
      else for (let index = 0; index < 3; index += 1) addText(decoration, "span", "");
      parent.append(decoration);
    }

    function addRepairHelp(parent, question) {
      const help = document.createElement("section");
      help.className = "repair-help";
      addText(help, "h3", "Przeczytaj sposób, a potem popraw swoją odpowiedź.", "repair-help-title");
      addText(help, "strong", "Podpowiedź", "repair-help-label");
      addText(help, "p", question.hint);
      addText(help, "strong", "Sposób rozwiązania", "repair-help-label");
      addText(help, "p", question.explanation);
      parent.append(help);
      return help;
    }

    function showRepairOffer(question) {
      hideToast();
      disableAnswerControls(question, false);
      el.feedback.hidden = false;
      el.feedback.className = "feedback wrong repair-panel repair-offer";
      resetFeedback(
        "Zatrzymaj się na Moście naprawczym",
        "Ta pierwsza odpowiedź nie jest poprawna. Zobacz podpowiedź i sposób rozwiązania, a potem możesz poprawić ten sam przykład. Wynik rundy zachowa pierwszą odpowiedź."
      );
      addMethodLabel(question);
      const actions = document.createElement("div");
      actions.className = "repair-actions";
      const use = addText(actions, "button", "Zobacz pomoc i spróbuj ponownie", "primary-button");
      use.type = "button"; use.id = "repairUseButton";
      const save = addText(actions, "button", "Zachowaj Most na później", "secondary-button");
      save.type = "button"; save.id = "repairSaveButton";
      el.feedback.append(actions);
      el.nextButton.hidden = true;
      replayAnimation(el.feedback, "feedback-pop");
      if (document.hasFocus()) global.setTimeout(() => use.focus(), 0);
    }

    function showRepairHelp(question) {
      hideToast();
      el.answerArea.replaceChildren();
      el.feedback.hidden = false;
      el.feedback.className = "feedback repair-panel repair-help-stage";
      resetFeedback("Most naprawczy pomaga zrobić kolejny krok", "Najpierw spokojnie przejrzyj podpowiedź i sposób rozwiązania.");
      addRepairDecoration(el.feedback);
      const help = addRepairHelp(el.feedback, question);
      help.querySelector("h3").tabIndex = -1;
      const continueButton = addText(el.feedback, "button", "Spróbuj poprawić odpowiedź", "primary-button repair-continue");
      continueButton.type = "button"; continueButton.id = "repairContinueButton";
      el.hintButton.closest(".help-row").hidden = true;
      replayAnimation(el.feedback, "feedback-pop");
      global.setTimeout(() => help.querySelector("h3").focus(), 0);
    }

    function showRepairResult(question) {
      const correct = state.repairBridge.repairCorrect;
      disableAnswerControls(question, true);
      el.feedback.hidden = false;
      el.feedback.className = `feedback ${correct ? "correct" : "wrong"} repair-panel repair-result`;
      resetFeedback(
        correct ? "Dobrze naprawione!" : "Sprawdźmy to krok po kroku.",
        correct
          ? "Pierwsza odpowiedź pozostaje błędem w wyniku rundy, ale poprawnie użyłeś/aś wskazówki. Wiesz już, jak zrobić taki przykład."
          : `Prawidłowa odpowiedź: ${question.answer}. ${question.explanation}`
      );
      if (correct) addText(el.feedback, "strong", "Naprawione z pomocą", "repair-success-label");
      addMethodLabel(question);
      setNextButton(correct);
      replayAnimation(el.feedback, "feedback-pop");
      if (document.hasFocus()) el.nextButton.focus();
    }

    function showAnsweredQuestion(question, correct) {
      if (repairStageIs("offer")) return showRepairOffer(question);
      if (repairStageIs("help")) return showRepairHelp(question);
      if (repairStageIs("completed")) return showRepairResult(question);
      disableAnswerControls(question, true);
      el.feedback.hidden = false;
      el.feedback.className = `feedback ${correct ? "correct" : "wrong"}`;
      const retryMessage = state.streakBeforeMistake >= 2
        ? `Seria ${state.streakBeforeMistake} to dobry wynik — następną możesz zacząć od kolejnego zadania.`
        : "Błąd jest wskazówką — w kolejnym zadaniu próbujesz od nowa.";
      resetFeedback(
        feedbackHeading(correct),
        correct
          ? question.explanation
          : `Twoja odpowiedź: ${state.currentAnswer}. Prawidłowa odpowiedź: ${question.answer}. ${question.explanation} ${retryMessage}`
      );
      addMethodLabel(question);
      replayAnimation(el.feedback, "feedback-pop");
      if (correct && state.streak >= 3) replayAnimation(el.streak.closest(".stat-pill"), "streak-pop");
      setNextButton(correct);
      if (document.hasFocus()) el.nextButton.focus();
    }

    function orderedChoiceOptions(question) {
      const savedOrder = state.repairBridge.questionIndex === state.index ? state.repairBridge.choiceOrder : [];
      if (savedOrder.length) {
        const options = new Map(question.options.map((option) => [String(typeof option === "object" ? option.value : option), option]));
        const ordered = savedOrder.map((value) => options.get(String(value))).filter((option) => option !== undefined);
        question.options.forEach((option) => {
          const value = String(typeof option === "object" ? option.value : option);
          if (!savedOrder.includes(value)) ordered.push(option);
        });
        return ordered;
      }
      return [...question.options].sort(() => Math.random() - 0.5);
    }

    function renderQuestion(restoring = false) {
      const question = state.questions[state.index];
      if (!question) return finishGame();
      if (!restoring) {
        state.answered = false;
        state.hintUsed = false;
        state.currentAnswer = "";
        state.lastAnswerSetRecord = false;
        state.streakBeforeMistake = 0;
      }
      applyRouteHelp(state.mode);
      el.category.textContent = question.label;
      el.questionNumber.textContent = `${String(state.index + 1).padStart(2, "0")} / ${String(state.questions.length).padStart(2, "0")}`;
      el.questionTitle.textContent = question.prompt;
      const nextVisual = renderVisual(question.visual);
      el.visualPanel.replaceWith(nextVisual); el.visualPanel = nextVisual;
      el.feedback.replaceChildren(el.feedbackTitle, el.feedbackText);
      el.feedback.hidden = !state.answered; el.feedback.className = "feedback";
      el.hintButton.closest(".help-row").hidden = false;
      el.hintBox.hidden = !state.hintUsed; el.hintBox.textContent = question.hint;
      el.hintButton.disabled = state.hintUsed || state.answered;
      el.hintButton.textContent = state.hintUsed ? "💡 Podpowiedź pokazana" : "💡 Pokaż podpowiedź";
      el.answerArea.replaceChildren();
      if (question.kind === "choice") {
        addText(el.answerArea, "span", "Wybierz odpowiedź", "answer-label");
        const grid = document.createElement("div"); grid.className = "choice-grid"; grid.setAttribute("role", "group");
        orderedChoiceOptions(question).forEach((option) => {
          const value = typeof option === "object" ? option.value : option;
          const label = typeof option === "object" ? option.label : option;
          const button = addText(grid, "button", label, "choice-button");
          button.type = "button"; button.dataset.choice = value; button.setAttribute("aria-pressed", String(String(value) === state.currentAnswer));
          if (String(value) === state.currentAnswer) button.classList.add("selected");
        });
        el.answerArea.append(grid);
        const submit = addText(el.answerArea, "button", "Sprawdź", "check-button choice-action"); submit.id = "nextButton"; submit.type = "submit";
      } else {
        const label = addText(el.answerArea, "label", "Twoja odpowiedź", "answer-label"); label.htmlFor = "answerInput";
        const row = document.createElement("div"); row.className = "answer-row";
        const customTextInput = question.checker && question.checker !== "numeric";
        const input = document.createElement("input"); input.className = "answer-input"; input.id = "answerInput"; input.inputMode = customTextInput ? "text" : "decimal"; input.autocomplete = "off"; input.placeholder = customTextInput ? "Wpisz odpowiedź" : "Wpisz liczbę"; input.required = true; input.value = state.currentAnswer;
        const submit = addText(row, "button", "Sprawdź", "check-button"); submit.id = "nextButton"; submit.type = "submit";
        row.prepend(input); el.answerArea.append(row);
        if (state.answered) input.disabled = true;
      }
      if (repairStageIs("retry")) {
        const help = document.createElement("div");
        help.className = "repair-retry-help";
        addRepairDecoration(help);
        addRepairHelp(help, question);
        el.answerArea.prepend(help);
        el.answerArea.querySelector(".answer-label").textContent = "Spróbuj poprawić odpowiedź";
        el.nextButton.textContent = "Sprawdź poprawkę";
        el.hintButton.closest(".help-row").hidden = true;
      }
      if (state.answered) showAnsweredQuestion(question, answerIsCorrect(question, state.currentAnswer));
      updateStats();
      if (!restoring) saveProgress();
      if (!state.answered) global.setTimeout(() => {
        const target = question.kind === "choice" ? $(".choice-button") : $("#answerInput");
        target?.focus();
        if (repairStageIs("retry") && question.kind === "input") target?.select();
      }, 0);
    }

    function startGame(mode, saved) {
      const progress = saved && isRound(saved, validModes) ? saved : null;
      const questions = progress ? progress.questions : config.buildQuestions(mode);
      const freshRound = {
        mode, questions, index: 0, score: 0, streak: 0, bestStreak: 0,
        correct: 0, answered: false, hintUsed: false, currentAnswer: "",
        lastAnswerSetRecord: false, streakBeforeMistake: 0,
        repairBridge: progress ? normalizeRepairBridge(progress.repairBridge, questions.length, progress.index) : rollRepairBridge(),
        hintSteps: normalizeHintSteps(progress && progress.hintSteps, questions.length)
      };
      Object.assign(state, freshRound, progress || {});
      state.repairBridge = normalizeRepairBridge(state.repairBridge, state.questions.length, state.index);
      state.hintSteps = normalizeHintSteps(state.hintSteps, state.questions.length);
      if (state.hintUsed) state.hintSteps[state.index] = true;
      state.bestStreak = Math.max(Number(state.bestStreak) || 0, state.streak);
      state.best = store.getBest(mode);
      state.recordStreak = Math.max(store.getBestStreak(mode), state.bestStreak);
      try {
        global.history.replaceState(null, "", chapterPlayHref(global.location.href, mode));
      } catch { /* Direct-file navigation still works without History API access. */ }
      el.routeName.textContent = routeHeading(mode, state.questions);
      showScreen("game"); updateStats(); renderQuestion(Boolean(progress));
      if (progress) {
        const last = lastAnsweredQuestion(progress);
        showToast(resumeSummary({
          stationName: config.routeLabels[mode],
          current: Math.min((progress.index || 0) + 1, progress.questions.length),
          total: progress.questions.length,
          method: questionMethod(last)
        }), 4500);
      } else if (state.repairBridge.granted) showToast("W tej wyprawie masz jeden Most naprawczy. Jeśli utkniesz, pomoże Ci poprawić jeden przykład po podpowiedzi.");
    }

    function askHowToStart(mode, saved) {
      const dialog = document.createElement("dialog");
      dialog.className = "round-choice-dialog";
      dialog.setAttribute("aria-labelledby", "round-choice-title");
      dialog.setAttribute("aria-describedby", "round-choice-description");

      const close = document.createElement("button");
      close.type = "button";
      close.className = "round-choice-close";
      close.setAttribute("aria-label", "Zamknij");
      close.title = "Zamknij";
      const closeArmA = addText(close, "span", "");
      const closeArmB = addText(close, "span", "");
      closeArmA.setAttribute("aria-hidden", "true");
      closeArmB.setAttribute("aria-hidden", "true");
      dialog.append(close);

      const title = addText(dialog, "h2", "Dokończyć rozpoczętą grę?");
      title.id = "round-choice-title";
      const resumeMethod = questionMethod(lastAnsweredQuestion(saved));
      const description = addText(dialog, "p", `W grze „${config.routeLabels[mode]}” czeka zapisana runda: krok ${saved.index + 1}/${saved.questions.length}, ${saved.score} pkt${resumeMethod ? `. Ostatni sposób: ${resumeMethod}` : ""}.`, "round-choice-description");
      description.id = "round-choice-description";
      addText(dialog, "p", "Możesz wrócić do tego miejsca, zacząć od nowa albo zamknąć to okno i wybrać inną stację.", "round-choice-hint");

      const actions = document.createElement("div");
      actions.className = "round-choice-actions";
      const resume = addText(actions, "button", "Wznów grę", "primary-button");
      resume.type = "button";
      resume.autofocus = true;
      const restart = addText(actions, "button", "Rozpocznij nową grę", "secondary-button");
      restart.type = "button";
      dialog.append(actions);

      let decided = false;
      function stayOnMenu() {
        try {
          global.history.replaceState(null, "", chapterPlayHref(global.location.href, ""));
        } catch { /* The chapter menu still works with the current address. */ }
      }
      function dismiss() {
        if (typeof dialog.close === "function") dialog.close();
        else {
          dialog.remove();
          stayOnMenu();
        }
      }
      function choose(action) {
        decided = true;
        if (typeof dialog.close === "function") dialog.close();
        dialog.remove();
        action();
      }

      close.addEventListener("click", dismiss);
      resume.addEventListener("click", () => choose(() => startGame(mode, store.getRound(mode) || saved)));
      restart.addEventListener("click", () => choose(() => { store.clearRound(mode); startGame(mode); }));
      dialog.addEventListener("close", () => {
        dialog.remove();
        if (!decided) stayOnMenu();
      }, { once: true });
      document.body.append(dialog);
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }

    function finishGame() {
      hideToast();
      if (el.milestoneToast) el.milestoneToast.classList.remove("visible", ...TOAST_DIRECTIONS.map((direction) => `from-${direction}`));
      const total = state.questions.length;
      const level = resultLevel(state.correct, total);
      const isNewBest = state.score > state.best;
      state.best = store.saveBest(state.mode, state.score);
      state.recordStreak = store.saveBestStreak(state.mode, state.bestStreak);
      store.clearRound(state.mode);
      el.resultEmoji.textContent = level.tone === "great" ? "🎉" : level.tone === "good" ? "🌟" : "💪";
      el.resultTitle.textContent = level.ratio === 1 ? "Mistrzowska jazda!" : level.tone === "great" ? "Świetna jazda!" : level.tone === "good" ? "Dobra próba!" : "Każdy trening pomaga!";
      const achievement = `${state.correct} z ${total} odpowiedzi poprawnych, najdłuższa seria: ${state.bestStreak}.`;
      const nextStep = level.ratio === 1
        ? "Masz komplet — brawo za dokładność!"
        : level.tone === "great"
          ? "Do kompletu brakuje już naprawdę niewiele."
          : level.tone === "good"
            ? "Solidna baza — kolejna runda może być jeszcze lepsza."
            : "Każde wyjaśnienie przybliża Cię do pewniejszego wyniku.";
      el.resultMessage.textContent = `${achievement} ${isNewBest ? "To także nowy rekord punktowy!" : nextStep}`;
      el.resultScore.textContent = state.score; el.resultCorrect.textContent = `${state.correct}/${total}`; el.resultBest.textContent = state.best;
      el.resultStars.textContent = "★".repeat(level.stars) + "☆".repeat(3 - level.stars);
      el.resultStars.setAttribute("aria-label", `${level.stars} z 3 gwiazdek`);
      if (el.resultStreak) el.resultStreak.textContent = state.bestStreak;
      if (el.resultRepair) el.resultRepair.parentElement.hidden = !state.repairBridge.repairCorrect;
      const methods = rememberedMethods(state.questions);
      if (el.resultMethods) {
        el.resultMethods.hidden = methods.length === 0;
        el.resultMethods.textContent = methods.length === 1
          ? `Sposób z tej rundy: ${methods[0]}.`
          : methods.length > 1
            ? `Sposoby z tej rundy: ${methods.join("; ")}.`
            : "";
      }
      const hintCount = normalizeHintSteps(state.hintSteps, total).filter(Boolean).length;
      if (el.resultHints) {
        el.resultHints.parentElement.hidden = hintCount === 0;
        el.resultHints.textContent = polishCount(hintCount, "krok", "kroki", "kroków");
        const hintNote = hintHelpSummary(hintCount);
        if (hintNote) el.resultHints.parentElement.setAttribute("title", hintNote);
      }
      showScreen("result", el.resultTitle);
      replayAnimation(screens.result.querySelector(".result-card"), "result-celebrate");
    }

    function renderSavedRounds(preferredMode) {
      const rounds = store.listRounds();
      el.savedRounds.hidden = rounds.length === 0;
      el.savedRoundsList.replaceChildren();
      rounds.sort((a, b) => Number(b.mode === preferredMode) - Number(a.mode === preferredMode)).forEach((round) => {
        const item = document.createElement("div"); item.className = "saved-round";
        const copy = document.createElement("div");
        addText(copy, "strong", config.routeLabels[round.mode]);
        const lastMethod = questionMethod(lastAnsweredQuestion(round));
        addText(copy, "span", `Krok ${round.index + 1}/${round.questions.length}, ${round.score} pkt${lastMethod ? ` · ${lastMethod}` : ""}`);
        const actions = document.createElement("div"); actions.className = "saved-round-actions";
        const resume = addText(actions, "button", "Kontynuuj", "primary-button"); resume.type = "button";
        resume.addEventListener("click", () => startGame(round.mode, store.getRound(round.mode)));
        const restart = addText(actions, "button", "Zacznij od nowa", "secondary-button"); restart.type = "button";
        restart.addEventListener("click", () => { store.clearRound(round.mode); startGame(round.mode); });
        item.append(copy, actions); el.savedRoundsList.append(item);
      });
      return rounds;
    }

    function renderRouteProgress() {
      screens.start.querySelectorAll("a.mode-card[href]").forEach((card) => {
        let mode = null;
        try {
          mode = new URL(card.getAttribute("href"), global.location.href).searchParams.get("exercise");
        } catch { /* An invalid card address is left unchanged. */ }
        if (!mode || !Object.hasOwn(config.routeLabels, mode)) return;

        card.querySelector(".route-progress-summary")?.remove();
        const completed = store.hasCompleted(mode);
        const progress = routeCardProgress(completed, roundHasProgress(store.getRound(mode)), store.getBest(mode));
        card.classList.toggle("route-completed", completed);
        card.classList.toggle("route-mix-card", mode === "mix");
        if (!progress) return;

        const summary = document.createElement("div");
        summary.className = "route-progress-summary";
        const completion = addText(summary, "span", progress.label, `route-completion ${progress.completed ? "completed" : "pending"}`);
        completion.setAttribute("aria-label", progress.ariaLabel);
        if (progress.record) addText(summary, "span", progress.record, "route-record");

        const action = card.querySelector(".primary-button");
        if (action) card.insertBefore(summary, action);
        else card.append(summary);
      });
    }

    function rawAnswer() { return $("#answerInput")?.value.trim() || $(".choice-button.selected")?.dataset.choice || ""; }
    function checkAnswer(raw) {
      if (state.answered) return;
      const question = state.questions[state.index];
      if (!String(raw).trim()) { showToast("Najpierw wpisz albo wybierz odpowiedź."); return; }
      if (question.kind === "input" && (!question.checker || question.checker === "numeric") && !Number.isFinite(Number(String(raw).replace(",", ".")))) { showToast("Wpisz liczbę, na przykład 24."); return; }
      if (repairStageIs("retry")) {
        state.currentAnswer = String(raw).trim();
        state.answered = true;
        state.repairBridge.repairCorrect = answerIsCorrect(question, state.currentAnswer);
        state.repairBridge.stage = "completed";
        updateStats(); showAnsweredQuestion(question, state.repairBridge.repairCorrect); saveProgress();
        return;
      }
      state.answered = true; state.currentAnswer = String(raw).trim();
      const correct = answerIsCorrect(question, state.currentAnswer);
      state.lastAnswerSetRecord = false;
      state.streakBeforeMistake = 0;
      if (correct) {
        state.correct += 1;
        state.streak += 1;
        state.score += (state.hintUsed ? 5 : 10) + Math.max(0, state.streak - 1);
        state.bestStreak = Math.max(state.bestStreak, state.streak);
        state.lastAnswerSetRecord = state.streak > store.getBestStreak(state.mode);
        state.recordStreak = store.saveBestStreak(state.mode, state.bestStreak);
      } else {
        state.streakBeforeMistake = state.streak;
        state.streak = 0;
        if (state.repairBridge.granted && state.repairBridge.available && state.repairBridge.stage === "none") {
          state.repairBridge.stage = "offer";
          state.repairBridge.questionIndex = state.index;
          state.repairBridge.firstAnswer = state.currentAnswer;
          state.repairBridge.choiceOrder = question.kind === "choice"
            ? [...document.querySelectorAll(".choice-button")].map((button) => String(button.dataset.choice))
            : [];
        }
      }
      updateStats(); showAnsweredQuestion(question, correct); saveProgress();
    }

    el.answerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (state.answered) {
        if (repairStageIs("completed")) {
          state.repairBridge.stage = "none";
          state.repairBridge = normalizeRepairBridge(state.repairBridge, state.questions.length, state.index);
        }
        state.index += 1;
        if (state.index >= state.questions.length) finishGame();
        else {
          renderQuestion();
          showFifthStepEncouragement();
        }
      }
      else checkAnswer(rawAnswer());
    });
    el.answerArea.addEventListener("click", (event) => {
      const choice = event.target.closest(".choice-button"); if (!choice || state.answered) return;
      document.querySelectorAll(".choice-button").forEach((button) => { button.classList.remove("selected"); button.setAttribute("aria-pressed", "false"); });
      choice.classList.add("selected"); choice.setAttribute("aria-pressed", "true"); state.currentAnswer = choice.dataset.choice; saveProgress();
    });
    el.answerArea.addEventListener("input", (event) => { if (event.target.id === "answerInput" && !state.answered) { state.currentAnswer = event.target.value; saveProgress(); } });
    el.feedback.addEventListener("click", (event) => {
      if (event.target.closest("#repairUseButton") && repairStageIs("offer")) {
        state.repairBridge.available = false;
        state.repairBridge.stage = "help";
        state.repairBridge.animationVariant = REPAIR_ANIMATIONS[Math.floor(Math.random() * REPAIR_ANIMATIONS.length)];
        saveProgress(); renderQuestion(true);
      } else if (event.target.closest("#repairSaveButton") && repairStageIs("offer")) {
        state.repairBridge.stage = "none";
        state.repairBridge = normalizeRepairBridge(state.repairBridge, state.questions.length, state.index);
        saveProgress(); showAnsweredQuestion(state.questions[state.index], false);
      } else if (event.target.closest("#repairContinueButton") && repairStageIs("help")) {
        state.repairBridge.stage = "retry";
        state.answered = false;
        state.currentAnswer = state.repairBridge.firstAnswer;
        saveProgress(); renderQuestion(true);
      }
    });
    el.hintButton.addEventListener("click", () => {
      if (state.answered || repairStageIs("retry")) return;
      state.hintUsed = true;
      state.hintSteps = normalizeHintSteps(state.hintSteps, state.questions.length);
      state.hintSteps[state.index] = true;
      el.hintBox.hidden = false; el.hintButton.disabled = true; el.hintButton.textContent = "💡 Podpowiedź pokazana";
      updateStats(); saveProgress(); el.hintBox.focus();
    });
    $("#backToMenu")?.addEventListener("click", saveProgress);
    $("#playAgain").addEventListener("click", () => { store.clearRound(state.mode); startGame(state.mode); });

    prepareEngagementUi();
    const requested = exerciseFromAddress();
    el.bestScore.textContent = store.getLegacyBest() ? `dawny rekord: ${store.getLegacyBest()} pkt` : "—";
    renderRouteProgress();
    const savedRounds = renderSavedRounds(requested);
    const leftoverRound = requested ? store.getRound(requested) : null;
    if (leftoverRound && !roundHasProgress(leftoverRound)) {
      startGame(requested);
      return;
    }
    const launchDecision = roundLaunchDecision(requested, savedRounds, { resume: resumeFromAddress() });
    if (launchDecision === "start") startGame(requested);
    else if (launchDecision === "resume") startGame(requested, store.getRound(requested));
    else if (launchDecision === "choose") askHowToStart(requested, store.getRound(requested));
  }

  global.MathTownGame = {
    createStore, isQuestion, isRound, resultLevel, roundHasProgress, routeCardProgress, roundLaunchDecision,
    resumeRequestedFromSearch, directoryRedirectHref, chapterPlayHref,
    createRepairBridge, rollRepairBridge, normalizeRepairBridge, fifthStepEncouragement, start,
    polishFew, polishCount, polishVerb, questionMethod, rememberedMethods, lastAnsweredQuestion,
    resumeSummary, omittedMixStations, normalizeHintSteps, hintHelpSummary, unfinishedHomeChips
  };
})(typeof window === "undefined" ? globalThis : window);
