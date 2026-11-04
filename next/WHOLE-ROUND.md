# Whole-round learning edition — 3 November 2026

## Product decision

Audience: everyday club golfers seeking consistency and better scores. Mirror Tennis's Home / Sharpen / Explore navigation, staged reading, lettered decisions, deliberate feedback and saved course cues. Use golf-specific interactions and preserve Shotmaker, the Nine, daily impact constraints and the existing Shotbook.

The live Tennis benchmark was inspected on 3 November: 57 activities (32 daily, 16 Live Points, 2 Predict, 7 Play the Point), with subject-based Sharpen and saved cues. Golf does not claim equal breadth or efficacy. This release brings 15 lessons into one catalogue: 9 new three-decision lessons, 6 existing two-decision course lessons, and 9 additional return checks. Totals: 39 core decisions + 9 return checks. Studio, daily and remembered-shot modes are additional tools, not inflated lesson counts.

## Teaching briefs

All new lessons use the following reference frame: view from ball towards target. The question states the useful decision and available evidence. `academy-content.js` keeps each misconception, situation, watch cue, choice-specific feedback, observed demonstration, fresh third decision, separate fourth return check and practical cue together. `scenario.js` explicitly approves the nine IDs.

| Lesson | Useful decision / misconception | Observable evidence and comparison | Transfer and practice |
|---|---|---|---|
| Right face. Left bend. | Read face relative to path; right of target does not necessarily mean rightward curve. | Same face, reversed path; ruler and derived flight, optional 3D contact walkthrough. | Opposite side and new numbers; observe start and bend independently. |
| Straight isn't on target. | Separate direction from shape; removing curve does not promise the flag. | Move one impact direction versus both. | Opposite straight miss; use target and near reference during observation. |
| Keep the bend. Lose the excess. | Distinguish less curve from no curve. | Fixed face, changed path; same-side narrower gap versus match or reversal. | Mirror the intention; observe amount before prescribing a mechanical fix. |
| The hole isn't your landing spot. | Reserve space for rollout; do not fly every chip to the hole. | Authored carry plus roll; same hole, different rehearsed rollout. | New distance and rollout; observe five chips landing near a towel. |
| The low shot needs a runway. | Inspect the first bounce, not only total distance. | Fixed sand edge, three carry plans; then explicitly remove the obstacle. Sand interceptions do not render a fictitious run through sand. | New obstacle length; inspect flight, landing and roll before choosing a rehearsed shot. |
| Same landing. Different finish. | Locate the changed portion of a shot before diagnosing a swing. | Same landing, different observed rollout; grey reference retained. | Shorter rollout instead of longer; compare surfaces in permitted practice. |
| The line belongs to a pace. | Match start line and speed; one line does not suit every pace. | Same start line with softer reference / firmer result; then alter start line. | Opposite break and slower pace; practise speed–line pairs. |
| Leave less work. | Judge all the leaves, not one made long putt. | Six explicitly authored distances per plan; totals only after commitment. | Reverse which plan is preferable, then change distance; choose a finish zone and finish every ball. |
| Six metres isn't always six metres. | Include uphill/downhill in pace; equal distance does not imply equal speed. | Labelled, illustrative slopes and differing travel under matched starting pace. | New distance and slope; alternate uphill/downhill practice. |

## Models and limits

Impact retains the existing centred, right-handed iron model in still air. Face contribution to launch is simplified, curvature is exaggerated. New short-game demonstrations interpolate the authored carry and roll: they are not a spin, bounce, turf or swing simulation. Landing in sand halts the demonstrated route; sand rollout is not modelled. Putting is an authored line/pace illustration, not a calibrated prediction. Slope magnitude, ball size, flight height and sideways break are illustrative. Geometry never silently moves within a question; changed situations are explicitly described.

Primary teaching basis is linked per lesson: Trackman Face to Path; PGA of America landing-spot guidance, line/speed matching, slope practice and finish-zone practice. These establish principles, not validation of the app's examples. Independent coaching review, physical-device validation, demonstrated learning and retention / demand validation remain outstanding.

## State and journeys

New state uses `gamesharp-learning-v1`. Earlier keys are not migrated into proficiency. Course completion and saved cues are read from the existing validated course state. Shotbook and Nine keys are untouched. First three answers are immutable. Practice, comparisons and mixed refreshers cannot replace them. Completion requires all three decisions. A fourth return check is offered after 24 hours; early direct access is practice, not a delayed check. Mixed practice draws from completed lessons. No account, server storage, analytics, purchases or new external service is introduced.

Home recommends an unfinished / next lesson across the whole round. Sharpen groups actual needs and due checks. Explore lists the complete eligible catalogue. My game saves a useful cue and selects one for the next round. Existing memories stay accessible as the Shotbook. A storage failure leaves the experience playable and visibly reports that saving is unavailable.

## Release checks

Run `npm test`, `npm run build` and `tools/verify-academy.mjs` against the built preview. Verify existing impact, all remembered-shot patterns, Nine and daily flows because the entry route and close navigation changed. Inspect new mobile scenes and explanations, normal/reduced reading, keyboard, 320–1440 px, unavailable WebGL/storage, first-answer preservation, reload/resume, 24-hour check and saved cues. Public release must be checked against its exact built entry and pinned Git SHA. Keep the previous production deployment as rollback.
