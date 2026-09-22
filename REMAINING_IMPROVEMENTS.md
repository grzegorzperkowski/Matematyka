# Remaining improvements — 2026-09-18

Follow-up list after the live-app pass and the later engine slice. This is a
backlog, not product status.

Canonical product inventory: `PRODUCT_FEATURE_BRIEF.md`.
Do not treat items here as “Available now” until they are implemented and the
brief is updated in the same change.

Already shipped (do not redo):

- Polish number agreement in generated prompts (`cd6e37e`)
- Homepage hero starts Chapter 1 (`5f1b3ff`)
- Station cards hide empty “Nieukończona” marks (`28247d2`)
- Status toasts stay off **Sprawdź** and dismiss during Most naprawczy (`d115aa7`)
- Paired fraction models on Wieża porównań (`3247a4b`)
- Method name on feedback and the result screen
- Richer resume line (station + krok + last method)
- Hint-used marks on the 10-step bar; result screen treats them as help
- Chapter 1 mix rotates the omitted station and names it
- Homepage “Dokończ: …” chip for an unfinished round
- Station-specific Mała ściąga (Chapter 1 `routeHelp`, and Chapter 8 when a round is open)
- Chapter 8, Prostopadłościany i sześciany: ten focused stations plus a mixed round
- CI job, `package.json` test script, shared cache-name assertion, Chapter 1
  mix-coverage test, Polish helpers on `MathTownGame`, dead-code tails
  removed, Chapter 1 `IMPLEMENTATION_NOTES.md`, engagement audit marked
  historical

---

## Then — still worth doing

- One optional **check ticket** per round (unit / estimate) — still cheaper than a new mode.
- Chapter 1 HTML still forks a lot of CSS. Stop adding local duplicates; migrate
  Ch1 controls to shared styles on the next touch.

### Do not build yet

No accounts, teacher dashboards, shops, leaderboards, or adaptive diagnostics
until the brief’s open questions about setting and success are answered.

Known leftover, not a new feature: on a phone the status toast is at the top
and no longer covers **Sprawdź**, but it can still overlap the brand/score row.
