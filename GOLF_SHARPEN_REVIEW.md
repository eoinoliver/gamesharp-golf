# GameSharp Golf Sharpen - launch review

## Coverage

The authoritative graph contains eight ordered round moments, 32 observable issues, 32 discriminating routes, 64 cautious results and 23 reviewed asset definitions. The launch bank contains 67 questions; 337 legacy questions remain quarantined. These round moments are the Sharpen navigation model; they do not replace the app's five educational pillars.

| Region | Issues | Existing content pulled through |
|---|---:|---|
| Before the Round | 4 | three newly reviewed preparation, warm-up and transfer reps |
| First Tee | 4 | three newly reviewed nerves, opening-club and corridor reps |
| Off the Tee | 4 | exact driver fault comparisons, Play a Hole |
| Approach | 4 | iron contact, focused approach session |
| Around the Green | 4 | chipping, bunker and focused short-game session |
| Putting | 4 | start-line, pace and three-putt comparisons |
| Pressure Moments | 4 | differentiated score, consequence, routine-pace and reset routes; exact pressure/hazard holes |
| 19th Hole | 4 | direct post-round debrief with exact Sharpen return |

## Golf-native entry model

Sharpen now begins with one human question—`What do you need now?`—and three intentions: `I'm about to play`, `Something cost me shots`, and `I've just finished`. Only then does it reveal the relevant moments of a round. Preparation exposes Before the Round and First Tee; in-round sharpening exposes Off the Tee through Pressure Moments; reflection enters the 19th Hole route directly. The eight-moment taxonomy remains authoritative without becoming eight simultaneous doors.

The former golfer/body-hotspot diagnosis metaphor has been removed from the reachable UI. The production illustration is a golf-native round journey: it supports orientation and emotional continuity, while semantic buttons and live text—not labels baked into the artwork—remain the accessible source of truth.

A single persistent cinematic layer now carries the golfer through the whole Sharpen journey. The three-intention entry previews the relevant part of the round; the full eight-stage course illustration then becomes the selection surface itself, with large semantic buttons positioned on the path. Symptom, distinction, result, asset return and saved-focus check-back reuse the same layer, progressively tightening the view instead of recreating unrelated pictures. At result, the illustrated caption is generated directly from the authoritative course cue. The visual moment is generated from the same region ID as the question and result, so it cannot independently describe a different part of the round.

The full selection map is hidden during narrowing so it does not compete with the decision. A compact eight-stop rail preserves place and progress. No labels are embedded in the image, no body part claims diagnosis, and the semantic controls remain authoritative. Reduced motion removes zoom and transition while preserving every state; a failed image leaves the background colour, cue, rail, questions and actions fully usable.

## High-leverage legacy integration

The highest-frequency tee-flight, putting, Course IQ, approach-contact and short-game routes now use individually authored Coach's Lens explanations. Every linked legacy asset receives the current focus and a route-specific observation instruction, keeps that context visible during the asset, and offers an exact one-tap return to the originating Sharpen result. This turns Shot Clinic, Play a Hole, Play a Course and decision content into continuations of the lesson rather than generic destinations.

Eight focused mini-sessions each contain exactly three named launch-approved questions. Four high-value routes enter an exact authored Play-a-Hole scenario: Reachable Risk, White Dogwood, Match-Play Closer and Recovery. Conditions, hazard and recovery content that became unreachable during the round-model migration is now distributed across Approach and Pressure. Generic Play-a-Hole routing is not reachable from Sharpen. Both the coaching-strip return and each destination's normal exit restore the originating result. The 19th Hole action opens the debrief itself—not Profile—and its native close restores Sharpen context.

## Semantic synchronization gate

Every result and every Sharpen asset declares reviewed learning keys. A result cannot link an asset unless at least one learning key agrees. Focused question sessions also declare question-level keys; the build fails if their three questions do not substantiate every learning claim made by the asset. The contract additionally fails duplicate moment issue/focus sets, generic fallback lenses, unused assets, dead destinations and a 19th Hole action that does not open the debrief directly.

The second-pass audit found and repaired two semantic failures before rollout: a pre-round result initially claimed coverage not taught by its question set, and a pressure-consequence result initially pointed to the wrong authored hole. The gate rejected both mappings.

## Result-page simplification and identity

The visible `The Read` block has been removed. Every first and repeat result now leads with one large focus, one short cue, one primary test and one benefit-led course action. Coach's Lens, the cautious hypothesis, mentor identity and any secondary test are collapsed under `Why this focus?`; copy and restart controls sit under `More`. A repeat visit changes the label to `Back to your focus` and does not restore the polite explanation stack.

Shot Clinic actions are explicitly named `Find the Culprit` and open the exact relevant fault comparison. The current focus and observation instruction stay visible inside that legacy experience, and its native close returns to the same compact Sharpen result. Short-game identity includes a reviewed Seve Ballesteros film link from the DP World Tour; no quotation or mechanical claim is attributed to a player without a source.

## Claim boundary

Every result is labelled guided-hypothesis, uses observable user-reported distinctions, states that multiple mechanisms can produce the outcome, and supplies one focus and one course cue. No result claims swing capture, diagnosis, measured improvement, probability or strokes gained.

## Sources and review

The launch graph stores reviewable PGA and USGA source URLs on every technical result. Existing linked assets remain governed by the app's launch trust contract.

## Quarantines

No weak Sharpen route is reachable. "I'm not sure" deliberately returns an evidence-collection plan instead of a guessed mechanism. Physical pain is outside the feature's selectable taxonomy; no injury prescription is offered.

## Current release state

The persistent cinematic build passed the structural contract (8 moments, 32 routes, 64 results, 23 real assets), launch-trust audit, semantic journey audit and rendered mobile audit at 320x568, 375x812, 390x844, 430x932 and 844x390. The browser reference journey also passed exact Shot Clinic return, persistent moment/cue continuity, reload recovery, repeat-result progressive disclosure, 48px controls and zero horizontal overflow. Focused-session, Play-a-Hole, 19th Hole, reduced-motion and image-independent paths remain enforced by the structural and app-wide trust contracts.

This semantic/content rebuild is locally audited and intentionally not published. It requires the contract's explicit audited-preview approval before production publication.
