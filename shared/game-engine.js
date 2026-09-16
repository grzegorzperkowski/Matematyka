(function (global) {
  "use strict";

  const STORAGE_KEY = "matematyczneMiasteczkoState:v2";
  const LEGACY_PROGRESS_KEY = "matematyczneMiasteczkoProgress";
  const LEGACY_BEST_KEY = "matematyczneMiasteczkoBest";

  function emptyData() {
    return { version: 2, rounds: {}, bestScores: {}, legacyBestScores: {} };
  }

  function isQuestion(value) {
    if (!value || typeof value !== "object") return false;
    if (!["input", "choice"].includes(value.kind)) return false;
    if (![value.prompt, value.label, value.hint, value.explanation].every((text) => typeof text === "string" && text.length > 0)) return false;
    if (!(typeof value.answer === "number" && Number.isFinite(value.answer)) && typeof value.answer !== "string") return false;
    if (value.kind === "choice" && (!Array.isArray(value.options) || value.options.length < 2)) return false;
    return true;
  }

  function isRound(value, validModes) {
    if (!value || typeof value !== "object" || !validModes.includes(value.mode)) return false;
    if (!Array.isArray(value.questions) || value.questions.length === 0 || value.questions.length > 100 || !value.questions.every(isQuestion)) return false;
    if (!Number.isInteger(value.index) || value.index < 0 || value.index >= value.questions.length) return false;
    if (![value.score, value.streak, value.correct].every((number) => Number.isFinite(number) && number >= 0)) return false;
    if (value.correct > value.index + (value.answered ? 1 : 0)) return false;
    return typeof value.currentAnswer === "string" && typeof value.answered === "boolean" && typeof value.hintUsed === "boolean";
  }

  function createStore(storage, chapterId, validModes) {
    let data = emptyData();
    let available = Boolean(storage);

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
        if (parsed?.version === 2 && parsed.rounds && parsed.bestScores && parsed.legacyBestScores) data = parsed;
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
        return isRound(round, validModes) && round.mode === mode ? round : null;
      },
      listRounds() {
        return validModes.map((mode) => this.getRound(mode)).filter(Boolean);
      },
      saveRound(round) {
        if (!isRound(round, validModes)) return false;
        data.rounds[keyFor(round.mode)] = round;
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
        data.bestScores[keyFor(mode)] = Math.max(this.getBest(mode), score);
        persist();
        return data.bestScores[keyFor(mode)];
      },
      getLegacyBest() {
        return Number(data.legacyBestScores[chapterId]) || 0;
      },
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

  function start(config) {
    const $ = (selector) => document.querySelector(selector);
    const validModes = Object.keys(config.routeLabels);
    let browserStorage = null;
    try { browserStorage = global.localStorage; } catch { /* Some file: contexts block storage access. */ }
    const store = createStore(browserStorage, config.chapterId, validModes);
    const screens = { start: $("#startScreen"), game: $("#gameScreen"), result: $("#resultScreen") };
    const state = { mode: "mix", questions: [], index: 0, score: 0, streak: 0, correct: 0, answered: false, hintUsed: false, currentAnswer: "", best: 0 };
    const el = {
      bestScore: $("#bestScore"), score: $("#score"), streak: $("#streak"), correctCount: $("#correctCount"),
      routeName: $("#routeName"), progressText: $("#progressText"), progressBar: $("#progressBar"), category: $("#category"),
      questionNumber: $("#questionNumber"), questionTitle: $("#questionTitle"), visualPanel: $("#visualPanel"),
      answerForm: $("#answerForm"), answerArea: $("#answerArea"), hintButton: $("#hintButton"), hintBox: $("#hintBox"),
      feedback: $("#feedback"), feedbackTitle: $("#feedbackTitle"), feedbackText: $("#feedbackText"),
      resultEmoji: $("#resultEmoji"), resultTitle: $("#resultTitle"), resultMessage: $("#resultMessage"),
      resultScore: $("#resultScore"), resultStars: $("#resultStars"), resultCorrect: $("#resultCorrect"),
      resultBest: $("#resultBest"), toast: $("#toast"), savedRounds: $("#savedRounds"), savedRoundsList: $("#savedRoundsList"),
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

    function showScreen(name, focusTarget) {
      Object.entries(screens).forEach(([key, screen]) => { screen.hidden = key !== name; });
      global.scrollTo({ top: 0, behavior: "smooth" });
      if (focusTarget) global.setTimeout(() => focusTarget.focus(), 0);
    }

    function saveProgress() {
      store.saveRound({
        mode: state.mode, questions: state.questions, index: state.index, score: state.score, streak: state.streak,
        correct: state.correct, answered: state.answered, hintUsed: state.hintUsed, currentAnswer: state.currentAnswer
      });
    }

    function showToast(message) {
      el.toast.textContent = message;
      el.toast.classList.add("visible");
      global.clearTimeout(showToast.timer);
      showToast.timer = global.setTimeout(() => el.toast.classList.remove("visible"), 2200);
    }

    function updateStats() {
      const total = state.questions.length || 10;
      el.score.textContent = state.score;
      el.streak.textContent = state.streak;
      el.correctCount.textContent = state.correct;
      el.progressText.textContent = `Wyzwanie ${Math.min(state.index + 1, total)} z ${total}`;
      el.progressBar.style.width = `${(state.index / total) * 100}%`;
      el.bestScore.textContent = `${state.best} pkt`;
    }

    function addText(parent, tag, text, className) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      node.textContent = String(text);
      parent.append(node);
      return node;
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
        polygon: `Wielokąt o ${visual.sides || 3} bokach.`,
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
        const points = regularPoints(sides);
        addSvg(svg, "polygon", { points: points.map((point) => point.join(",")).join(" "), class: "geometry-polygon" });
        if (visual.markVertices) points.forEach((point, index) => { dot(point[0], point[1]); label(point[0] + 6, point[1] - 4, String.fromCharCode(65 + index)); });
      } else if (shape === "rectangle") {
        const isSquare = visual.square || Number(visual.width) === Number(visual.height);
        const width = isSquare ? 94 : 140, height = isSquare ? 94 : 76;
        const x = 120 - width / 2, y = 70 - height / 2;
        addSvg(svg, "rect", { x, y, width, height, class: "geometry-polygon" });
        if (visual.rightMarks) [[x, y], [x + width, y], [x + width, y + height], [x, y + height]].forEach(([cornerX, cornerY], index) => label(cornerX + (index === 1 || index === 2 ? -18 : 6), cornerY + (index >= 2 ? -6 : 16), "∟", "geometry-right-label"));
        if (visual.showDimensions) { label(120, y - 8, visual.width); label(x + width + 8, 73, visual.height); }
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
      if (visual.type === "geometry") {
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

    function showAnsweredQuestion(question, correct) {
      $("#answerInput")?.setAttribute("disabled", "disabled");
      document.querySelectorAll(".choice-button").forEach((button) => {
        const learnerChoice = button.dataset.choice === state.currentAnswer;
        const correctChoice = String(button.dataset.choice) === String(question.answer);
        button.disabled = true;
        button.setAttribute("aria-pressed", String(learnerChoice));
        if (learnerChoice) { button.classList.add("learner-answer"); addText(button, "span", "Twoja odpowiedź", "choice-state"); }
        if (correctChoice) { button.classList.add("correct-answer"); addText(button, "span", "Poprawna odpowiedź", "choice-state"); }
      });
      el.feedback.hidden = false;
      el.feedback.className = `feedback ${correct ? "correct" : "wrong"}`;
      el.feedbackTitle.textContent = correct ? (state.hintUsed ? "Dobrze! Podpowiedź pomogła." : "Brawo, dobrze policzone!") : "Sprawdź rozwiązanie.";
      el.feedbackText.textContent = correct ? question.explanation : `Twoja odpowiedź: ${state.currentAnswer}. Prawidłowa odpowiedź: ${question.answer}. ${question.explanation}`;
      el.nextButton.className = `next-button${question.kind === "choice" ? " choice-action" : ""}${correct ? "" : " wrong"}`;
      el.nextButton.textContent = state.index === state.questions.length - 1 ? "Zobacz wynik →" : "Następne wyzwanie →";
      if (document.hasFocus()) el.nextButton.focus();
    }

    function renderQuestion(restoring = false) {
      const question = state.questions[state.index];
      if (!question) return finishGame();
      if (!restoring) { state.answered = false; state.hintUsed = false; state.currentAnswer = ""; }
      el.category.textContent = question.label;
      el.questionNumber.textContent = `${String(state.index + 1).padStart(2, "0")} / ${String(state.questions.length).padStart(2, "0")}`;
      el.questionTitle.textContent = question.prompt;
      const nextVisual = renderVisual(question.visual);
      el.visualPanel.replaceWith(nextVisual); el.visualPanel = nextVisual;
      el.feedback.hidden = !state.answered; el.feedback.className = "feedback";
      el.hintBox.hidden = !state.hintUsed; el.hintBox.textContent = question.hint;
      el.hintButton.disabled = state.hintUsed || state.answered;
      el.hintButton.textContent = state.hintUsed ? "💡 Podpowiedź pokazana" : "💡 Pokaż podpowiedź";
      el.answerArea.replaceChildren();
      if (question.kind === "choice") {
        addText(el.answerArea, "span", "Wybierz odpowiedź", "answer-label");
        const grid = document.createElement("div"); grid.className = "choice-grid"; grid.setAttribute("role", "group");
        [...question.options].sort(() => Math.random() - 0.5).forEach((option) => {
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
      if (state.answered) showAnsweredQuestion(question, answerIsCorrect(question, state.currentAnswer));
      updateStats();
      if (!restoring) saveProgress();
      if (!state.answered) global.setTimeout(() => (question.kind === "choice" ? $(".choice-button") : $("#answerInput"))?.focus(), 0);
    }

    function startGame(mode, saved) {
      const progress = saved && isRound(saved, validModes) ? saved : null;
      Object.assign(state, progress || { mode, questions: config.buildQuestions(mode), index: 0, score: 0, streak: 0, correct: 0, answered: false, hintUsed: false, currentAnswer: "" });
      state.best = store.getBest(mode);
      try {
        const address = new URL(global.location.href);
        address.searchParams.set("exercise", mode);
        global.history.replaceState(null, "", address);
      } catch { /* Direct-file navigation still works without History API access. */ }
      el.routeName.textContent = config.routeLabels[mode];
      showScreen("game"); updateStats(); renderQuestion(Boolean(progress));
      if (progress) showToast("Przywrócono zapisaną rundę.");
    }

    function finishGame() {
      const total = state.questions.length;
      const level = resultLevel(state.correct, total);
      const isNewBest = state.score > state.best;
      state.best = store.saveBest(state.mode, state.score);
      store.clearRound(state.mode);
      el.resultEmoji.textContent = level.tone === "great" ? "🎉" : level.tone === "good" ? "🌟" : "💪";
      el.resultTitle.textContent = level.ratio === 1 ? "Mistrzowska jazda!" : level.tone === "great" ? "Świetna jazda!" : level.tone === "good" ? "Dobra próba!" : "Każdy trening pomaga!";
      el.resultMessage.textContent = isNewBest ? "Ustanawiasz nowy najlepszy wynik na tej trasie. Miasteczko bije brawo!" : "Zobacz, które stacje już znasz, a które warto przećwiczyć jeszcze raz.";
      el.resultScore.textContent = state.score; el.resultCorrect.textContent = `${state.correct}/${total}`; el.resultBest.textContent = state.best;
      el.resultStars.textContent = "★".repeat(level.stars) + "☆".repeat(3 - level.stars);
      showScreen("result", el.resultTitle);
    }

    function renderSavedRounds(preferredMode) {
      const rounds = store.listRounds();
      el.savedRounds.hidden = rounds.length === 0;
      el.savedRoundsList.replaceChildren();
      rounds.sort((a, b) => Number(b.mode === preferredMode) - Number(a.mode === preferredMode)).forEach((round) => {
        const item = document.createElement("div"); item.className = "saved-round";
        const copy = document.createElement("div"); addText(copy, "strong", config.routeLabels[round.mode]); addText(copy, "span", `Wyzwanie ${round.index + 1} z ${round.questions.length}, ${round.score} pkt`);
        const actions = document.createElement("div"); actions.className = "saved-round-actions";
        const resume = addText(actions, "button", "Kontynuuj", "primary-button"); resume.type = "button";
        resume.addEventListener("click", () => startGame(round.mode, store.getRound(round.mode)));
        const restart = addText(actions, "button", "Zacznij od nowa", "secondary-button"); restart.type = "button";
        restart.addEventListener("click", () => { store.clearRound(round.mode); startGame(round.mode); });
        item.append(copy, actions); el.savedRoundsList.append(item);
      });
      if (preferredMode && rounds.length) showScreen("start", el.savedRounds.querySelector("h2"));
    }

    function rawAnswer() { return $("#answerInput")?.value.trim() || $(".choice-button.selected")?.dataset.choice || ""; }
    function checkAnswer(raw) {
      if (state.answered) return;
      const question = state.questions[state.index];
      if (!String(raw).trim()) { showToast("Najpierw wpisz albo wybierz odpowiedź."); return; }
      if (question.kind === "input" && (!question.checker || question.checker === "numeric") && !Number.isFinite(Number(String(raw).replace(",", ".")))) { showToast("Wpisz liczbę, na przykład 24."); return; }
      state.answered = true; state.currentAnswer = String(raw).trim();
      const correct = answerIsCorrect(question, state.currentAnswer);
      if (correct) { state.correct += 1; state.streak += 1; state.score += (state.hintUsed ? 5 : 10) + Math.max(0, state.streak - 1); } else state.streak = 0;
      updateStats(); showAnsweredQuestion(question, correct); saveProgress();
    }

    el.answerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (state.answered) { state.index += 1; state.index >= state.questions.length ? finishGame() : renderQuestion(); }
      else checkAnswer(rawAnswer());
    });
    el.answerArea.addEventListener("click", (event) => {
      const choice = event.target.closest(".choice-button"); if (!choice || state.answered) return;
      document.querySelectorAll(".choice-button").forEach((button) => { button.classList.remove("selected"); button.setAttribute("aria-pressed", "false"); });
      choice.classList.add("selected"); choice.setAttribute("aria-pressed", "true"); state.currentAnswer = choice.dataset.choice; saveProgress();
    });
    el.answerArea.addEventListener("input", (event) => { if (event.target.id === "answerInput" && !state.answered) { state.currentAnswer = event.target.value; saveProgress(); } });
    el.hintButton.addEventListener("click", () => {
      if (state.answered) return; state.hintUsed = true; el.hintBox.hidden = false; el.hintButton.disabled = true; el.hintButton.textContent = "💡 Podpowiedź pokazana"; saveProgress(); el.hintBox.focus();
    });
    $("#playAgain").addEventListener("click", () => { store.clearRound(state.mode); startGame(state.mode); });

    const requested = exerciseFromAddress();
    const saved = requested ? store.getRound(requested) : null;
    el.bestScore.textContent = store.getLegacyBest() ? `dawny rekord: ${store.getLegacyBest()} pkt` : "—";
    renderSavedRounds(requested);
    if (requested && !saved) startGame(requested);
  }

  global.MathTownGame = { createStore, isQuestion, isRound, resultLevel, start };
})(typeof window === "undefined" ? globalThis : window);
