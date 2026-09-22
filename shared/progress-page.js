(function (global) {
  "use strict";

  const STORAGE_KEY = "matematyczneMiasteczkoState:v2";
  const STORAGE_WARNING = "W tej przeglądarce nie da się odczytać zapisanych postępów. Możesz grać dalej, ale ta strona pokaże pustą mapę.";

  function element(document, tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function renderProgressPage(root, summary, options = {}) {
    const document = options.document || root.ownerDocument;
    if (!root || !document || !summary || !summary.totals || !Array.isArray(summary.chapters)) return;
    const totals = summary.totals;
    const body = element(document, "div", "progress-body");

    if (options.storageAvailable === false) {
      const warning = element(document, "p", "storage-note", STORAGE_WARNING);
      warning.setAttribute("role", "status");
      body.append(warning);
    } else if (totals.emptyMessage) {
      const empty = element(document, "p", "empty-note", totals.emptyMessage);
      empty.setAttribute("role", "status");
      body.append(empty);
    }
    if (options.storageAvailable !== false && totals.completeMessage) {
      const done = element(document, "p", "complete-note", totals.completeMessage);
      done.setAttribute("role", "status");
      body.append(done);
    }

    const totalList = element(document, "ul", "totals");
    [
      ["Ukończone stacje", `${totals.completedCount} z ${totals.stationCount}`],
      ["Najlepszy wynik", totals.completedCount > 0 ? `${totals.bestScore} pkt` : "—"],
      ["Najdłuższa seria", totals.bestStreak > 0 ? String(totals.bestStreak) : "—"],
      ["Do dokończenia", String(totals.inProgressCount)]
    ].forEach(([label, value]) => {
      const item = element(document, "li");
      item.append(element(document, "span", "", label), element(document, "strong", "", value));
      totalList.append(item);
    });
    body.append(totalList);

    const list = element(document, "div", "chapter-list");
    summary.chapters.forEach((chapter) => {
      const card = element(document, "article", `chapter-stat${chapter.tone ? ` ${chapter.tone}` : ""}`);
      const head = element(document, "div", "chapter-stat-head");
      if (chapter.icon) {
        const icon = element(document, "span", "chapter-icon", chapter.icon);
        icon.setAttribute("aria-hidden", "true");
        head.append(icon);
      }
      const titles = element(document, "div");
      if (chapter.number) titles.append(element(document, "p", "eyebrow", `Rozdział ${chapter.number}`));
      titles.append(element(document, "h2", "", chapter.title));
      head.append(titles);
      card.append(head);

      card.append(element(document, "p", "progress-label", chapter.progressLabel));
      const track = element(document, "div", "progress-track");
      track.setAttribute("aria-hidden", "true");
      const bar = element(document, "div", "progress-bar");
      const percent = chapter.stationCount > 0 ? Math.round((chapter.completedCount / chapter.stationCount) * 100) : 0;
      bar.style.width = `${percent}%`;
      track.append(bar);
      card.append(track);

      const facts = element(document, "p", "chapter-facts");
      facts.append(element(document, "span", "", chapter.recordLabel), element(document, "span", "", chapter.streakLabel));
      card.append(facts);
      if (chapter.pendingLabel) card.append(element(document, "p", "chapter-pending", chapter.pendingLabel));

      const enter = element(document, "a", "chapter-enter", "Wejdź do rozdziału");
      enter.href = chapter.href;
      card.append(enter);

      const details = element(document, "details", "station-details");
      details.append(element(document, "summary", "", "Stacje"));
      const stations = element(document, "ul", "station-list");
      (Array.isArray(chapter.stations) ? chapter.stations : []).forEach((station) => {
        const item = element(document, "li", "station");
        const link = element(document, "a", "station-link", station.title);
        link.href = station.href;
        item.append(link);
        const status = element(document, "span", `station-status ${station.status || "new"}`, station.statusLabel);
        item.append(status);
        if (station.detailLabel) item.append(element(document, "span", "station-detail", station.detailLabel));
        if (station.resumeHref && station.resumeLabel) {
          const resume = element(document, "a", "station-resume", station.resumeLabel);
          resume.href = station.resumeHref;
          item.append(resume);
        }
        stations.append(item);
      });
      details.append(stations);
      card.append(details);
      list.append(card);
    });
    body.append(list);
    root.replaceChildren(body);
  }

  function readProgressState(storage) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      return { state: raw ? JSON.parse(raw) : null, storageAvailable: true };
    } catch {
      return { state: null, storageAvailable: false };
    }
  }

  function mountProgressPage(doc, storage, storageFailed) {
    const root = doc.getElementById("progressRoot");
    if (!root || !global.MathTownGame || !Array.isArray(global.MathTownCatalog)) return;
    const read = storageFailed || !storage
      ? { state: null, storageAvailable: !storageFailed }
      : readProgressState(storage);
    const summary = global.MathTownGame.chapterProgressSummary(read.state, global.MathTownCatalog);
    renderProgressPage(root, summary, { document: doc, storageAvailable: read.storageAvailable });
  }

  global.MathTownProgress = { renderProgressPage, mountProgressPage, readProgressState, STORAGE_WARNING };

  const doc = global.document;
  if (doc && typeof doc.getElementById === "function" && doc.getElementById("progressRoot")) {
    let storage = null;
    let storageFailed = false;
    try { storage = global.localStorage; } catch { storageFailed = true; }
    mountProgressPage(doc, storage, storageFailed);
  }
})(typeof window === "undefined" ? globalThis : window);
