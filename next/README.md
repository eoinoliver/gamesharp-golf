# Six Reads: North Point

A clean, isolated Golf prototype. `next/src` is the runtime; Vite builds only this directory into `dist/`. Historical Golf files at repository root remain reference material. Do not add them to the app or ship them alongside `dist`.

## Learning loop

Six selectable reads, each with an initial decision and a changed setup: distance, shot shape, landing area, next-shot route, pin position, and judging a plan after one flattering or poor result. Players choose a club where relevant and move an aim line sideways. Club choice determines depth. The example pattern is shown before commitment. Reveal and comparison reuse the same twelve latent errors; they never re-roll a favourable outcome for the reference plan.

`scenario.js` is the explicit catalogue; `model.js` owns geometry, outcomes, practice scoring and the reference-plan search. `scene.js` renders that geometry. `main.js` owns the browser flow and simple SVG fallback. `state.js` preserves first attempts separately from practice in `gamesharp-golf-next-v2`. No previous Golf scores or v1 pilot results are imported.

## Model boundaries

This is an authored teaching model, not a calibrated golf simulator. Club carries, spreads, outlier and hazard positions are illustrative. Carry means forward distance in the exercise’s coordinate system; lateral aim does not change depth. Flights illustrate the chosen finish, without wind, spin, slope, roll or bounce physics. The next-shot game explicitly restricts the second shot to a straight ground-running route; the tree patch blocks any intersecting segment.

Practice points are visible before play. Approach: green 3, plus 2 if within 8 m of pin; other grass 1, bunker/trees 0, water −3. Fairway exercise: fairway 3, other grass 1, bunker/trees 0, water −3. Route exercise: fairway with clear route 3, other clear grass 1, blocked/bunker/trees 0, water −3. The reference searches available clubs and integer aim positions, −26 through +14 metres; ties use average distance to pin. Plans within two points of the maximum are labelled strong. These weights are teaching choices, not estimated strokes or golf probabilities.

## Checks and limits

`npm test` checks all twelve cases, accepted aim ranges, reversed useful choices, invariant samples, hazard geometry, outcome-bias examples, first-attempt preservation and corrupt/unavailable storage. `npm run build` also checks the publish boundary: only the app HTML, icon and hashed JS/CSS may ship.

Browser QA must cover desktop and phone width, keyboard controls, the full two-decision loop, reduced motion, local persistence, replay, and SVG fallback. A browser viewport test is not a physical-device test. Neither passing tests nor a strong result in two authored decisions establishes learning transfer, retention or demand. Coach review and tests with golfers are the next validation steps.

The first coastal preview remains on `codex/golf-next-first-hole`. This iteration is `codex/golf-six-dilemmas`. Deploy as a separate Preview; do not change production aliases. Retire the legacy production service worker deliberately before any future production migration.
