# Prompt template — implement the next chapter

This is intentionally short. The canonical project rules live in
`AI_DEVELOPMENT_GUIDE.md`; the full workflow and release checklist live in
`CHAPTER_TEMPLATE.md`. To add exercises to a chapter that already exists, use
`EXPAND_CHAPTER_PROMPT_TEMPLATE.md` instead.

Copy the text below into a new agent session and replace the bracketed values.

---

```text
Implement Chapter [NUMBER] — “[POLISH CHAPTER TITLE]” — in the Matematyczne
Miasteczko repository at C:\Sources\Matemetyka.

Read AI_DEVELOPMENT_GUIDE.md and CHAPTER_TEMPLATE.md completely before editing,
then follow them as the canonical requirements. Inspect the current git status
and preserve unrelated changes.

Visually inspect every Chapter[NUMBER]/page_*.png before designing the chapter.
Use those pages to derive the curriculum, progression and terminology, but
create original questions and visuals. Create and maintain
Chapter[NUMBER]/IMPLEMENTATION_NOTES.md as required by the chapter contract.

Chapter details:
- Number and stable ID: [NUMBER] / chapter[NUMBER]
- Polish title: [POLISH CHAPTER TITLE]
- Optional theme: [THEME, OR “choose an appropriate theme”]
- Additional requirements: [REQUIREMENTS, OR “none”]

Deliver the complete playable chapter, tests, homepage integration and offline
registration. Work autonomously and make reasonable curriculum and UX choices
within the documented scope. Ask only if a missing decision would materially
change the result.

Run all checks required by CHAPTER_TEMPLATE.md, perform browser verification
when a browser is available, update IMPLEMENTATION_NOTES.md, and give a concise
handoff with coverage, architecture, changed files, verification and remaining
limitations.
```

