# GameSharp Golf Next

A clean, isolated Golf prototype. `next/src` is the runtime; Vite builds only this directory into `dist/`. Historical Golf files at repository root remain reference material. Do not add them to the app or ship them alongside `dist`.

## Shotmaker — current entry experience

The default route is now Shotmaker: a fixed fictional coastal par 3, three face/path decisions, an authored close-up of the strike followed by the flight, a controlled comparison and a free-play range. The mobile brief is above the course; each lettered answer requires a separate Hit action. The draw, straight push and mirrored fade require different answers. The key mechanism is face relative to path, not simply aim relative to the flag.

`SHOTMAKER` in `scenario.js` is the explicit manifest. `shotmaker-model.js` defines the deterministic illustrative flights and versioned local state. `shotmaker-scene.js` owns the single permanent course; `shotmaker-impact.js` shows a rigid iron moving through contact. This is an authored impact mechanism, not a measured full-body swing, a grip reconstruction or a calibrated launch monitor. Carry stays at 160 m; curvature is exaggerated for readability. Coaching, physical-device performance, learning transfer and demand have not been validated.

The player can orbit/scrub contact, compare two paths with the face and other inputs held fixed, replay a flight, save a text field note, or share exact free-play settings through `?mode=range&face=3&path=6`. First reads remain immutable in `gamesharp-shotmaker-v1`; later attempts are separate practice. No previous Golf scores become proficiency. Storage failure never prevents play. WebGL unavailability or context loss leads to a playable diagram. Reduced motion skips the cinematic sequence and stops idle GPU rendering. Sound is opt-in.

All new fonts and environment images are bundled locally. See `shotmaker-assets/SOURCES.txt` and the retained font licenses. The 4 MB experimental character is not loaded by Shotmaker. The earlier Six Reads application remains at `?view=library`, and the experimental full-body motion study remains at `?lesson=shot-lab`. Neither is implicitly imported into the new entry experience.

`node tools/export-shotmaker.mjs /absolute/path/Shotmaker.html https://preview-host/` creates a portable file with the current Shotmaker code, textures and fonts embedded. Only the optional practice-library link and shared-shot URL leave that file.

## Learning loop

Six selectable reads, each with an initial decision and a changed setup: distance, shot shape, landing area, next-shot route, pin position, and judging a plan after one flattering or poor result. Players read a short situation above the course, then choose a lettered answer below it. Each answer sets a complete club-and-aim plan, previews its target, and requires an explicit Play action. Nothing is preselected. Two cards cover genuine two-way choices; four cover different target positions. Free aiming and club controls remain under “Make your own plan”. Club choice determines depth. The example pattern is shown before commitment. Reveal and comparison reuse the same twelve latent errors; they never re-roll a favourable outcome for the reference plan.

Question 2 begins with a separate setup preview: matching overhead maps, the facts that change, and the facts that stay the same. The learner explicitly starts the next question, and its number and setup label remain visible beside the course. `setup.js` owns these factual comparisons; its maps use the same geometry as play. This orientation step does not recommend a club or aim and does not change practice scoring or stored first attempts.

`choices.js` defines the twelve direct questions, complete answer plans and evidence summaries; `scenario.js` is the explicit catalogue; `model.js` owns geometry, outcomes, practice scoring and the reference-plan search. `scene.js` renders that geometry. `main.js` owns the browser flow and simple SVG fallback. `state.js` preserves first attempts separately from practice in `gamesharp-golf-next-v2`. No previous Golf scores or v1 pilot results are imported.

## Model boundaries

This is an authored teaching model, not a calibrated golf simulator. Club carries, spreads, outlier and hazard positions are illustrative. Carry means forward distance in the exercise’s coordinate system; lateral aim does not change depth. Flights illustrate the chosen finish, without wind, spin, slope, roll or bounce physics. The next-shot game explicitly restricts the second shot to a straight ground-running route; the tree patch blocks any intersecting segment.

Practice points are visible before play. Approach: green 3, plus 2 if within 8 m of pin; other grass 1, bunker/trees 0, water −3. Fairway exercise: fairway 3, other grass 1, bunker/trees 0, water −3. Route exercise: fairway with clear route 3, other clear grass 1, blocked/bunker/trees 0, water −3. The reference searches available clubs and integer aim positions, −26 through +14 metres; ties use average distance to pin. Plans within two points of the maximum are labelled strong. These weights are teaching choices, not estimated strokes or golf probabilities.

## Checks and limits

`npm test` checks card reachability, meaningful alternatives, changed accepted answers, flag-relative labels, evidence consistency, all twelve cases, accepted aim ranges, reversed useful choices, invariant samples, hazard geometry, outcome-bias examples, first-attempt preservation and corrupt/unavailable storage. Shotmaker checks cover the three different relationships, the complete face/path control range, mirrored flights and first-read preservation. `npm run build` checks an explicit publish allowlist for app HTML, icon, hashed JS/CSS, the approved experimental player, three coastal textures and three font files.

Browser QA must cover desktop and phone width, keyboard controls, the full two-decision loop, reduced motion, local persistence, replay, and SVG fallback. A browser viewport test is not a physical-device test. Neither passing tests nor a strong result in two authored decisions establishes learning transfer, retention or demand. Coach review and tests with golfers are the next validation steps.

The first coastal preview remains on `codex/golf-next-first-hole`; the Six Reads iteration is `codex/golf-six-dilemmas`. Shotmaker and the earlier experimental motion work are on `codex/golf-shot-lab` (draft PR 3). Deploy as a separate Preview; do not change production aliases. Retire the legacy production service worker deliberately before any future production migration.
