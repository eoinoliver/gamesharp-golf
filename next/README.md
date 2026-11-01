# GameSharp Golf Next

A clean, isolated Golf prototype. `next/src` is the runtime; Vite builds only this directory into `dist/`. Historical Golf files at repository root remain reference material. Do not add them to the app or ship them alongside `dist`.

## Give me that shot again — current entry experience

The home screen now opens a personal remembered-shot journey, with the existing Shotmaker Nine as an alternate path. Players can keep a short note, explicitly confirm the observed start and curve, and explore one of eight authored iron-flight patterns. Three ideas distinguish these examples: controlling an outward curve, separating straightness from target alignment, and reducing an excessive returning curve. The note is never sent to a service. A conservative phrase matcher can suggest explicitly stated directions, but both observations remain visible for confirmation. Unsupported clubs/shot types route to an iron example; wind and strike-quality descriptions require acknowledging the narrower direction-only example.

`SHOT_MEMORIES` in `scenario.js` is the manifest. `shot-memory-model.js` validates the versioned `gamesharp-shotbook-v1` state, and `shot-memory.js` owns the journey. A player commits to one change, sees the existing authored iron/ball impact and flight, and compares the remembered example with the changed example under identical conditions. Both face and path may change in the straight-miss family. The comparison supports scrubbing, start/bend/finish stops and inspection of the changed strike. Desktop and mobile decisions use an overhead view with explicit tee/flag orientation; the cinematic replay retains the 3D camera sequence. The SVG fallback uses the same settings and progression.

A new situation asks for a flight prediction without a trajectory preview. The first change and first fresh prediction persist before animation; replay and worked examples cannot overwrite them. Answer letters are deterministically varied per entry and phase, remaining stable on reload. A later check becomes due after 24 hours; earlier rechecks are practice. The first eligible later check survives bounded practice history. These records demonstrate activity on authored examples, not validated retention or on-course transfer.

The Shotbook retains up to 24 entries with range-observation notes, resumable in-progress experiences, text field-note downloads, and individual removal. Sharing creates a playable `?mode=memory&shot=<pattern>` invitation without private notes or results. Browser storage is optional; the complete journey remains playable and save failure is disclosed. No account, server, automatic notifications, speech capture, swing upload, LLM diagnostic service or analytics backend is introduced. The standalone HTML export includes this journey and the Nine.

The remembered pattern is not a measured reconstruction. All face/path numbers, 160 m distances and curves belong to the authored example; actual wind, strike position, speed and biomechanics are unknown. Full-body motion remains experimental. Coach review, physical-device performance, real learning and repeat demand still require direct validation.

## Shotmaker Nine — the extended practice experience

The extended Shotmaker route offers: a fixed fictional coastal par 3, three face/path decisions, an authored close-up of the strike followed by the flight, a controlled comparison, the Shotmaker Nine progression, and a free-play range. The mobile brief is above the course; each lettered answer requires a separate Hit action. The draw, straight push and mirrored fade require different answers. The key mechanism is face relative to path, not simply aim relative to the flag.

`SHOTMAKER` in `scenario.js` is the explicit manifest. `shotmaker-model.js` defines the deterministic illustrative flights and versioned local state. `shotmaker-scene.js` owns the single permanent course; `shotmaker-impact.js` shows a rigid iron moving through contact. This is an authored impact mechanism, not a measured full-body swing, a grip reconstruction or a calibrated launch monitor. Carry stays at 160 m; curvature is exaggerated for readability. Coaching, physical-device performance, learning transfer and demand have not been validated.

The player can orbit/scrub contact, compare two paths with the face and other inputs held fixed, replay a flight, save a text field note, or share exact free-play settings through `?mode=range&face=3&path=6`. First reads remain immutable in `gamesharp-shotmaker-v1`; later attempts are separate practice. No previous Golf scores become proficiency. Storage failure never prevents play. WebGL unavailability or context loss leads to a playable diagram. Reduced motion skips the cinematic sequence and stops idle GPU rendering. Sound is opt-in.

All new fonts and environment images are bundled locally. See `shotmaker-assets/SOURCES.txt` and the retained font licenses. The 4 MB experimental character is not loaded by Shotmaker. The earlier Six Reads application remains at `?view=library`, and the experimental full-body motion study remains at `?lesson=shot-lab`. Neither is implicitly imported into the new entry experience.

`node tools/export-shotmaker.mjs /absolute/path/Shotmaker.html https://preview-host/` creates a portable file with the current Shotmaker code, textures and fonts embedded. Only the optional practice-library link and shared-shot URL leave that file.

## The Shotmaker Nine

The three introductory reads now lead into three construction challenges, then three single-attempt transfer challenges. In the workshop, a fixed face, a fixed path, and finally two adjustable directions progressively remove scaffolding. A teal window marks the ball’s lateral position 40 m into the flight; the gold circle marks the finishing tolerance. All challenges use the exact same flight equation, coordinates, fixed course and condition set. There is no flight forecast before commitment. Slider and one-degree buttons have explicit direction labels; the mobile brief remains above the scene. Feedback separately evaluates start/shape and finish, with an optional cue or worked route in the workshop.

`SHOTMAKER_NINE` in `scenario.js` owns authored constraints. `shotmaker-journey-model.js` judges them and owns the versioned `gamesharp-shotmaker-journey-v1` record. It derives success from validated settings rather than trusting persisted result flags. A workshop preserves its first attempt and first successful build through bounded practice history. Each final-three card records immediately on commitment, resumes after interruption, closes after three attempts, and preserves the first card through subsequent practice cards. Replaying a flight never records another attempt. Progress and prior reads remain local; no analytics, accounts or remote backend have been added.

Completing the nine opens a daily shot on the home screen. Twenty-four authored constraint combinations rotate by the device’s local date, with the first daily attempt kept separate from practice. A shared `?mode=daily&day=YYYY-MM-DD` invitation is directly playable without completing the nine and preserves the requested date. These are repeating variations of the same face/path mechanism, not twenty-four different golf skills. Returning users resume unfinished cards or go directly to the daily shot. Field notes download as text. Shared result text always uses the saved first daily attempt.

The Nine is a hypothesis for a useful return loop, not evidence of retention or on-course learning. First cards measure performance on these particular authored problems. No golf handicap or general proficiency is inferred. The mechanical motion remains an authored close-up; the full-body reconstruction is still experimental.

## Earlier Six Reads library


Six selectable reads, each with an initial decision and a changed setup: distance, shot shape, landing area, next-shot route, pin position, and judging a plan after one flattering or poor result. Players read a short situation above the course, then choose a lettered answer below it. Each answer sets a complete club-and-aim plan, previews its target, and requires an explicit Play action. Nothing is preselected. Two cards cover genuine two-way choices; four cover different target positions. Free aiming and club controls remain under “Make your own plan”. Club choice determines depth. The example pattern is shown before commitment. Reveal and comparison reuse the same twelve latent errors; they never re-roll a favourable outcome for the reference plan.

Question 2 begins with a separate setup preview: matching overhead maps, the facts that change, and the facts that stay the same. The learner explicitly starts the next question, and its number and setup label remain visible beside the course. `setup.js` owns these factual comparisons; its maps use the same geometry as play. This orientation step does not recommend a club or aim and does not change practice scoring or stored first attempts.

`choices.js` defines the twelve direct questions, complete answer plans and evidence summaries; `scenario.js` is the explicit catalogue; `model.js` owns geometry, outcomes, practice scoring and the reference-plan search. `scene.js` renders that geometry. `main.js` owns the browser flow and simple SVG fallback. `state.js` preserves first attempts separately from practice in `gamesharp-golf-next-v2`. No previous Golf scores or v1 pilot results are imported.

## Model boundaries

This is an authored teaching model, not a calibrated golf simulator. Club carries, spreads, outlier and hazard positions are illustrative. Carry means forward distance in the exercise’s coordinate system; lateral aim does not change depth. Flights illustrate the chosen finish, without wind, spin, slope, roll or bounce physics. The next-shot game explicitly restricts the second shot to a straight ground-running route; the tree patch blocks any intersecting segment.

Practice points are visible before play. Approach: green 3, plus 2 if within 8 m of pin; other grass 1, bunker/trees 0, water −3. Fairway exercise: fairway 3, other grass 1, bunker/trees 0, water −3. Route exercise: fairway with clear route 3, other clear grass 1, blocked/bunker/trees 0, water −3. The reference searches available clubs and integer aim positions, −26 through +14 metres; ties use average distance to pin. Plans within two points of the maximum are labelled strong. These weights are teaching choices, not estimated strokes or golf probabilities.

## Checks and limits

The current test suite has 33 checks. Remembered-shot coverage includes all eight observation/flight mappings, reachable useful changes and distinct alternatives, mirrored transfer explanations, conservative phrase suggestions, stable varied answer positions, first-result preservation, interrupted reveals, delayed-check separation, bounded history, scoped removal, escaped personal text and blocked/corrupt storage. Built-browser QA covers the full personal journey, comparison scrubbing and strike inspection, reloads, all eight invitation routes, saved range observations, private sharing, downloads, 390/360 px layouts, and complete SVG/storage fallback. The existing Nine and daily paths are regression checked independently.

`npm test` checks card reachability, meaningful alternatives, changed accepted answers, flag-relative labels, evidence consistency, all twelve cases, accepted aim ranges, reversed useful choices, invariant samples, hazard geometry, outcome-bias examples, first-attempt preservation and corrupt/unavailable storage. Shotmaker checks cover the three different relationships, the complete face/path control range, mirrored flights and first-read preservation. Nine checks cover reachable targets, meaningful misses, changed transfer constraints, 365 daily dates, bounded-history preservation, interrupted cards, first-attempt separation, invalid state and blocked storage. `npm run build` checks an explicit publish allowlist for app HTML, icon, hashed JS/CSS, the approved experimental player, three coastal textures and three font files.

Browser QA must cover desktop and phone width, keyboard controls, the full two-decision loop, reduced motion, local persistence, replay, and SVG fallback. A browser viewport test is not a physical-device test. Neither passing tests nor a strong result in two authored decisions establishes learning transfer, retention or demand. Coach review and tests with golfers are the next validation steps.

The first coastal preview remains on `codex/golf-next-first-hole`; the Six Reads iteration is `codex/golf-six-dilemmas`. Shotmaker and the earlier experimental motion work are on `codex/golf-shot-lab` (draft PR 3). Production promotion was explicitly authorised on 1 November 2026. The release includes a retirement-only `/sw.js` and `legacy-cache.js`: update the known old root worker, remove only `gsg-v1` and `gamesharp-golf-v<number>` CacheStorage entries, then unregister. Local game records are preserved. The retirement worker has no fetch handler; no new offline worker is registered.


## Tennis reading journey — 2 November 2026

The reference is the live Tennis player `play.html?l=answer-the-drop`, app version
`1d8e1511d4`, and the current Tennis source `rally/lesson_body.html` (`stageSit`,
`typeSit`, `enableAsk`, `startStep`, `verdict`). The observed sequence is scene,
word-by-word situation at 5.5 words/second, then question and lettered choices.
Feedback follows the played consequence and stays until the learner continues.

Golf now uses `lesson-sequence.js` for that reading cadence, with a shared vertical
lesson layout. `shotmaker-presentation.js` adapts the existing remembered-shot,
Nine, daily and range screens; `main.js` uses the same controller for all six
library journeys. The original coastal home remains the entry point. Lesson
navigation is back / centred GameSharp Golf / close; sound stays on the scene.
The overhead camera is pulled back to include the green, bunker and flag. Hole
geometry and learning/scoring models are unchanged.

- Situation comes before the question; choices and actions enter afterwards.
- Hidden controls are inert, with their space reserved to prevent layout jumps.
- A complete readable sentence is exposed to assistive technology, not individual
  word announcements. Focus starts on the context and returns safely after skip.
- Show all, reduced motion, navigation and page hiding drain pending timers.
- Revisiting a screen in the same session skips its reading delay. Re-rendering a
  selected answer or a custom plan does not restart the introduction.
- Exit returns to a visible Shotbook / Nine board. Closing clears the invitation
  query on the current origin; the portable export's canonical share origin is
  never used for local navigation.
- First attempts, saved progress, optional custom controls, replays, downloads
  and shared links retain their original data semantics.

Build and model checks: `npm test && npm run build`. Browser regression:
`BASE=http://127.0.0.1:5177 node tools/verify-reading-flow.mjs` with Playwright and
its Chromium/WebKit browsers available. `PLAYWRIGHT_MODULE` can name a host's
installed module; `QA_OUTPUT` selects the evidence directory. The regression
covers reading order, keyboard exclusion, stable layout, skip, preference changes,
navigation cancellation, custom controls, all twelve library decisions and a
complete WebKit remembered-shot journey. These are browser checks, not physical
phone, screen-reader listening, coaching or user-learning validation.
