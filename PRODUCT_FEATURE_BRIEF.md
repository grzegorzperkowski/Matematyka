# Product feature brief — Matematyczne miasteczko

## Purpose of this document

This is the canonical product input for finding missing capabilities and
generating ideas that could make the app more useful, educational, engaging or
accessible for its target users.

Use this document when asking an AI to:

- audit the current product for feature gaps;
- propose new app features;
- compare an idea with what already exists;
- prioritize enhancements for the target users;
- identify product questions that should be answered before investing in a
  feature.

This is not an implementation guide. It intentionally omits source-code
locations, CSS structure, test commands and other engineering details that do
not change what users need or experience.

### Information-inclusion test

Add information here only when knowing it could materially change at least one
of these outcomes:

1. which feature an AI proposes;
2. who the feature is for;
3. what user problem the feature should solve;
4. how the feature should behave;
5. how the feature should be prioritized;
6. whether the feature would be safe, appropriate or feasible for this
   product.

Examples:

| Information | Add it? | Reason |
| --- | --- | --- |
| The app is for Polish-speaking children around age 10. | Yes | It changes language, difficulty, interaction and safety choices. |
| Children may use the app offline. | Yes | It can inspire or rule out whole classes of features. |
| A hint reduces the points awarded for a correct answer. | Yes | It affects motivation and any proposal involving help or scoring. |
| The app has no accounts or backend. | Yes | It constrains personalization, sharing and reporting ideas. |
| Users struggle to choose what to practise next. | Yes, if supported by evidence | It identifies a product problem that a new feature could solve. |
| The location of the CSS file. | No | It does not help an AI identify or design a user-facing feature. |
| The name of a JavaScript function or test file. | No | It is implementation detail, not product context. |
| A brand colour value. | Usually no | Add only if the colour itself is a product or accessibility constraint. |

## Status vocabulary

- **Available now** — present in the current application source.
- **Planned** — intentionally expected, but not available to users yet.
- **Not currently present** — a useful boundary of the current product, not an
  automatically approved feature request.
- **Unknown** — information that has not yet been confirmed. Do not silently
  convert it into an assumption.

Proposed ideas and wishlist items do not belong in the “Available now” list.
Keep them in a separate discovery or prioritization document until implemented.

## Product summary

**Matematyczne miasteczko** is a friendly, Polish-language maths practice game
for children around 10 years old. It turns primary-school textbook topics into
short interactive challenges. A child chooses a maths chapter, selects a
focused practice station or a mixed round, and completes a predictable round
of ten questions with immediate teaching feedback.

The curriculum sources determine topic order, terminology and age-appropriate
limits, while the playable questions and visuals are original rather than
copies of textbook exercises.

The experience is designed to make independent practice feel approachable. It
emphasizes small steps, supportive explanations and personal progress rather
than competition with other children.

## Target users and use context

### Confirmed primary user

- A Polish-speaking child around 10 years old.
- The child is practising primary-school mathematics.
- The child may need help understanding a method, not merely checking whether
  an answer is correct.
- The child may use a keyboard, mouse or touch device and may work on a narrow
  mobile screen.
- The child may return after an interruption or use the app with an unreliable
  internet connection.

### People who may influence use, but whose needs are not yet defined

- parent or guardian;
- teacher or tutor;
- school or other purchasing/commissioning decision-maker.

Do not design dashboards, assignments, supervision or reporting around these
roles until their real goals and context are confirmed.

### Target-client questions still worth answering

These answers would materially improve feature proposals:

- Is the intended school level specifically Polish class 4, or is age 10 only
  an approximation?
- Is the main setting independent home practice, classroom work, tutoring,
  homework or a combination?
- Who chooses the next topic: the child, an adult or both?
- What is the primary desired outcome: curriculum coverage, confidence,
  conceptual understanding, calculation fluency, homework support, engagement
  or assessment?
- Which devices, browsers and assistive technologies are most common?
- What problems do children, parents and teachers currently report?
- What evidence would define success: completed rounds, return visits, fewer
  repeated errors, curriculum mastery, enjoyment or something else?
- Is the product expected to remain fully anonymous and local, or could
  optional accounts ever be acceptable?

## Core user journey available now

1. The child opens a town-style homepage and chooses one of eight visible
   curriculum chapters. Seven are playable; one is marked as coming soon. The
   hero action starts Chapter 1, “Liczby i działania”.
2. Inside a published chapter, the child chooses a focused station or a mixed
   station covering that chapter.
3. Each station starts a ten-question round. Questions ask the child either to
   enter an answer or choose from supplied answers. Many topics include a
   mathematical visual.
4. During the round the child sees the route name, current step, completed
   steps, score, correct-answer count, current streak and personal streak
   record. Steps where a hint was used carry a discreet mark. The side panel
   (“Mała ściąga”) matches the current station, not a generic chapter dump.
5. The child can reveal a hint before answering. The app then awards fewer base
   points for a correct answer, while still recognizing it as correct. Hint use
   is marked as help on the step bar and on the result screen, not as failure.
6. After an answer the app gives immediate, supportive feedback, an
   explanation, and a short Polish name for the method just used. A wrong
   answer does not block progress.
7. 85% of new rounds offer one voluntary “Most naprawczy” (Repair Bridge):
   after a wrong first answer, the child can read help and retry the same
   example. The original mistake remains a mistake for score, accuracy, stars
   and streak.
8. The app automatically preserves unfinished rounds on the device after the
   child has given at least one correct answer. A round left with no correct
   answers is not saved, so it does not come back as “Dokończ” or an unfinished
   station. After a saved round exists, the child can resume it or deliberately
   start again. Resume names the station, the current step and the last method,
   not the answer. The homepage can show a “Dokończ: …” chip; tapping it
   resumes that round immediately, without asking again. Opening the same
   station from a chapter menu still offers resume, restart or closing the
   window to stay on the menu.
9. At the end, the child sees points, correct answers, one to three stars, the
   longest streak, the best score, one or two method names from the round,
   hint-as-help wording when a hint was used, and supportive next-step wording.
10. Back at a chapter menu, stations the child has started or finished show
    completion and, after a finished round, their best score. Untouched
    stations stay unmarked.

## Feature inventory — available now

### Navigation and content choice

- Homepage with eight chapter cards, a hero action into Chapter 1, and clear
  published/coming-soon status.
- A chapter menu with focused practice stations and one mixed station.
- Direct links to individual stations, so a specific exercise can be shared or
  reopened as `ChapterN/index.html?exercise=…`. Directory addresses such as
  `/Chapter1` are normalized to `/Chapter1/` so a station query does not become
  `/Chapter1?exercise=…`.
- Child-friendly Polish names and short descriptions for chapters and stations.
- A return path from a round to its chapter menu and from a chapter to the
  homepage.

### Practice and learning

- Fixed, predictable rounds of ten questions.
- Procedurally generated question values, allowing a station to be replayed
  with fresh examples.
- Two main response formats: typed answers and multiple choice.
- Acceptance of a decimal comma in numeric answers.
- Topic-appropriate mathematical visuals, including number lines, fraction
  models, paired fraction models for comparison, written calculations, geometry
  diagrams, clocks, grids and equations.
- A concise hint available before submitting an answer.
- Immediate correctness feedback after submission.
- A worked or explanatory response for every question.
- A persistent chapter-specific “how to think” reference panel during play.
- A mixed station that samples all focused skills in its chapter. Chapter 1
  has eleven focused stations, so its mix keeps ten questions, rotates the
  omitted station and names it on the route heading.
- A short Polish method name after each answer and again on the result screen
  (one or two methods from the round).
- A station-specific “Mała ściąga” during play when the chapter supplies one.
- One optional guided retry after a mistake in most new rounds. The retry
  supports learning without rewriting the original performance result.

### Motivation and progress

- Visible ten-step progress, including completed and current steps, with a
  discreet mark on steps where a hint was used.
- Score, correct-answer count and current answer streak.
- Personal best streak for each station.
- Streak milestones and varied supportive feedback.
- Reduced base points when a hint was used; streak bonus for consecutive
  correct answers.
- End-of-round result with accuracy, points, one-to-three-star summary, longest
  streak and personal best score.
- Completion status shown on a station card only after that station has been
  started or finished; the best score appears after a finished round. Untouched
  stations have no empty “not completed” mark.
- No public leaderboard or child-to-child comparison.

### Continuity and persistence

- Automatic local saving of an unfinished station round only after at least
  one correct answer. Leaving earlier discards that attempt.
- Separate unfinished progress and records for each chapter and station.
- Resume/restart choice when opening a station with saved progress, with a
  close control to stay on the chapter menu.
- A chapter-level list of unfinished rounds with quick resume actions.
- A homepage “Dokończ: …” chip that opens an unfinished chapter round and
  resumes it immediately. The resume/restart choice remains on the chapter menu.
- Saved answer, hint state, score, position, streak and guided-retry state.
- Defensive behavior when browser storage is unavailable: the app remains
  playable, but persistence is lost.
- Completing a route writes a separate, optional Playground result summary
  with completed-route count, best score and best streak. The main progress
  record remains authoritative.

### Offline and install-like behavior

- The homepage, shared game experience and published chapters are cached after
  an online visit.
- Previously cached published chapters and their direct station links can work
  without a network connection.
- Unknown offline navigation falls back to the cached town homepage.
- The hosted `/Matematyka/` version can be installed as a standalone PWA with
  its own identity and icons; installation is optional.
- A waiting application update is activated only after the user chooses
  **Wczytaj**, avoiding an automatic reload during a round.
- No installation, account or sign-in is required.

### Accessibility and responsive behavior

- Semantic HTML and native buttons/inputs.
- Full keyboard-oriented flow, including Enter-to-submit.
- Visible focus states.
- Polite live announcements for feedback and status changes. Status toasts
  stay off the answer button on a narrow screen and are dismissed while the
  Repair Bridge panel is open.
- Text and state cues that do not rely on colour alone.
- Question content appears before the reference panel on narrow screens.
- Layout is intended to remain usable at 320 px viewport width.
- Reduced-motion support for decorative animations.
- Supportive feedback avoids framing a mistake as failure.

### Privacy and external services

- Gameplay and records stay in the current browser's local storage.
- There are no user accounts, profiles, cloud synchronization or social
  features.
- There is no backend required for question generation or play.
- Anonymous page/click analytics are present through GoatCounter.
- The core app does not depend on third-party fonts, frameworks or content
  services.

## Curriculum coverage

There are currently **67 focused practice stations** across seven published
chapters, plus one mixed station per chapter (**74 playable stations in all**).

| Chapter | Status | Focused skills available now |
| --- | --- | --- |
| 1. Liczby i działania | Available now | addition and subtraction; comparisons such as “how many more”; multiplication and division; multiplying/dividing by 10, 100 and similar powers; times more/times less; division with remainder; squares and cubes; word problems; order of operations; number lines and puzzles. Mixed rounds use ten of the eleven stations and rotate which one rests. |
| 2. Systemy zapisywania liczb | Available now | decimal place value and reading numbers; comparing numbers; large-number calculations; money; length; mass; Roman numerals; calendar; clocks and elapsed time |
| 3. Działania pisemne | Available now | written addition; written subtraction; multiplication by one digit; longer multiplication; division by one digit; longer division; written-method word problems |
| 4. Figury geometryczne | Available now | points, lines, segments, rays and broken lines; parallel/perpendicular relations; lengths; angle types and measurement; polygons; rectangles and squares; perimeter; circles; scale |
| 5. Ułamki zwykłe | Available now | equal parts of a whole; mixed numbers; fraction number line; comparison; equivalent/simplified fractions; improper fractions and wholes; fraction as quotient; addition; subtraction; fraction problems |
| 6. Ułamki dziesiętne | Available now | decimal notation and place value; decimal number line; length and mass conversions; equivalent decimal notation; comparison; addition; subtraction; shopping/money; decimal problems |
| 7. Pola figur | Available now | unit squares; area units; rectangle and square area; missing side; composite figures; area-unit conversions; ares and hectares; cutting/rearranging shapes; practical area problems |
| 8. Prostopadłościany i sześciany | Planned | cuboids, cubes, nets and surface area; no playable stations yet |

## Product rules that new feature ideas must respect

These constraints materially shape feature design:

- All child-facing language, help, feedback and accessibility labels are in
  Polish.
- The tone is warm, specific and encouraging. A mistake is treated as part of
  learning.
- Mathematical correctness and a useful explanation take priority over
  decorative game mechanics.
- Children must always be able to access the essential teaching explanation;
  luck, points or payment must never gate it.
- Random rewards must not create gambling-like loops, artificial scarcity,
  near misses or pressure to restart.
- Personal progress is preferred over competition between children.
- Meaning cannot depend only on colour, sound or animation.
- Any new interaction must remain understandable with keyboard navigation,
  assistive technology and a 320 px-wide screen.
- Offline use and anonymous use are meaningful product capabilities, not just
  engineering conveniences.
- New external data collection, accounts, advertising, payments, social
  sharing or third-party services require an explicit product decision because
  the primary users are children.
- A feature should work across chapters when its user need is general; a
  chapter-specific feature should teach something unique to that topic.

## Important capabilities not currently present

This list records the product boundary so an AI can distinguish a genuinely new
idea from an existing feature. It is not a commitment to build these items.

- No chapter 8 gameplay.
- No user account, named profile or multiple-child profile on one device.
- No cloud backup or synchronization between devices.
- No teacher/parent dashboard, assignments, classroom management or progress
  export.
- No long-term attempt history or trend view beyond completion, best score and
  best streak.
- No formal skill-mastery model, diagnostic assessment or adaptive difficulty.
- No personalized recommendation of what to practise next.
- No explicit learning goals selected by the child before a round.
- No audio narration, speech input or read-aloud control.
- No language choice; the product is Polish-only.
- No real-time multiplayer, public leaderboard, chat or social feed.
- No badges, collectible currency, shop or paid feature.
- No backend-authored content editor or in-app way for adults to create custom
  questions.
- No explicit feedback channel for a child or adult to report a confusing or
  incorrect question.

## Known evidence and uncertainty

What the source confirms well:

- current chapters and practice coverage;
- the ten-question learning loop;
- help, explanation, scoring, streak and saved-progress behavior;
- offline, accessibility and privacy boundaries.

What is not yet supported by user evidence:

- why children stop or return;
- which stations are too easy, too hard or confusing;
- whether points, streaks and stars motivate or pressure the target children;
- whether the current explanations produce transfer to later questions;
- whether parents or teachers need visibility or control;
- which accessibility needs occur most often in the real audience;
- which proposed feature would have the greatest learning or engagement impact.

AI-generated feature ideas should label assumptions that depend on these
unknowns and should propose a lightweight way to validate high-risk
assumptions.

## How to evaluate proposed features

For every proposal, describe:

1. **Target user and problem** — who benefits and what observed or hypothesized
   problem is solved?
2. **User experience** — what changes in the child's or adult's journey?
3. **Learning value** — does it improve understanding, practice quality,
   confidence, independence or curriculum coverage?
4. **Evidence** — is the need confirmed, inferred from the current product or
   purely speculative?
5. **Fit with existing features** — does it reuse or duplicate hints,
   explanations, mixed rounds, saved progress, scoring or station completion?
6. **Child safety and motivation** — could it add pressure, unhealthy chance
   mechanics, comparison or unnecessary data collection?
7. **Accessibility and offline impact** — who might be excluded, and does it
   weaken current offline/anonymous use?
8. **Expected benefit and effort** — use relative estimates and explain the main
   cost driver.
9. **Success signal** — what user behavior or learning outcome would indicate
   that the feature helped?
10. **Recommendation** — do next, validate first, consider later or reject.

Prefer ideas tied to a clear user problem over decorative novelty. Do not
recommend a capability merely because it is absent.

## Maintenance rule

Updating this brief is a required part of implementing a feature, not optional
follow-up documentation. Whenever a user-facing capability is added, removed
or materially changed, the implementing AI must update this file in the same
change before declaring the work complete. It must:

- describe the resulting behavior under the correct status;
- revise the user journey or feature inventory when applicable;
- remove or amend any now-obsolete entry under “Important capabilities not
  currently present”;
- update curriculum coverage or product constraints when affected; and
- set the “Last verified” date below to the date of verification.

Also update this brief when a target-user fact, known problem or meaningful
research finding changes. Do not update it for refactors, file moves, CSS
changes, test changes, cache versions or other implementation-only work.

Last verified against the current application source: **2026-09-19**.
