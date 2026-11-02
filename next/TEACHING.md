# GameSharp Golf teaching compass

Established from the 2 November 2026 audit of the live Shotmaker, remembered-shot and decision-library journeys. This is the teaching contract for future work, alongside AGENTS.md. A visually impressive object is not yet an explanation.

## The outcome we are building towards

A golfer can say what changed, why it changed the flight or decision, and apply the relationship to a different situation without a prompt that gives away the answer. Completing an animation or recognising a familiar option is not evidence of that outcome.

## The two release priorities

1. Make the cause legible. State one thing to watch before the relevant motion. Attach the label to the feature. Establish the target/reference frame. Keep geometry, numbers, description and result in agreement. Give a persistent, self-paced explanation after the result.
2. Test understanding honestly. Ask for a prediction before revealing its outcome. Keep answer cards parallel, about outcomes rather than explanations. Explain afterwards. Change the setup for transfer; preserve the first attempt separately from practice, hints and shown solutions.

## Required lesson brief

Before building a new lesson, record:

- **Useful decision:** What can the golfer judge afterwards that they could not judge before?
- **Misconception:** What plausible wrong belief does this lesson expose?
- **Reference:** Relative to what? Target, path, ground, flag, or earlier shot? Which viewpoint, handedness and conditions?
- **Watch cue:** One specific visible feature and the moment it matters. “Watch the head move along the teal arrow” works; “Everything starts here” does not.
- **Learner action:** A clear prediction or choice. No mystery sliders or simultaneous unintroduced variables.
- **Evidence:** The visual event that distinguishes the options. If it cannot be seen at phone size, change the representation rather than adding more animation.
- **Explanation:** State the causal relationship using the exact values shown. Connect it to the observed start, bend or outcome. Avoid praise as a substitute for explanation.
- **Comparison:** Hold other conditions and the shot sample fixed while changing the relevant variable. Name both shots locally.
- **Transfer:** A different setup with no preview or answer-revealing wording. State whether assistance was available.
- **Carry-forward cue:** One observable task for practice. Keep it within what this lesson actually supports.
- **Validation:** Distinguish model tests, browser checks, coach review, golfer comprehension and real-world transfer. List which exist.

## Presentation contract

Use the Tennis rhythm: situation text arrives in sequence; question then lettered options; commit; visible outcome; explanation; deliberate next step. Preserve Show all and reduced motion. Do not force the learner to read and track two moving objects simultaneously. Self-paced explanatory steps do not auto-advance.

Use a 3D view when spatial movement matters. Use an aligned direction ruler or a simple flight diagram when a few degrees are otherwise illegible. Label the representation and any exaggeration. Never exaggerate a club's displayed angle while continuing to claim it is the measured angle.

Keep target-facing diagrams consistent: target ahead, left and right defined against that line. Orbiting must retain a labelled reference. Colour must be paired with text or shape. Gold face/teal path within an impact explanation are not interchangeable with gold original/teal changed flight in a comparison; every comparison needs its own visible labels.

Explanations must remain available with reduced motion and without WebGL. Do not make sound, a timed animation, orbiting or perfect colour discrimination prerequisites for meaning. Keep controls labelled, keyboard operable, and at least 44px in touch height. Cancel timers and animation when the explanation closes.

## Accuracy and scope

The current model illustrates a right-handed, centred iron strike in still air, fixed carry and exaggerated curvature. It is not a launch monitor or a calibrated personal prediction. A remembered flight selects an example; it does not recover the user's face/path numbers.

Face direction strongly influences the initial start; path also contributes. Face relative to path helps explain the bend under these stated assumptions. Never teach that the face is the sole determinant of start, or that “straight” means “at the target”. Define open/closed relative to something, or use plain left/right language.

The impact close-up explains the hitting surface and head movement. It does not teach how the golfer produces those conditions with their grip, wrist, body, strike location or lie. Do not add a body-mechanics prescription without an appropriate model, observable evidence and qualified coaching review. Do not present an illustrative score or successful in-app prediction as swing proficiency.

## Next validation gate

Observe five target golfers, including novices, on their own phones. Give no live explanation. Ask them to point to the striking face, show the head's direction and identify the target reference. Then ask them to explain a right-pointing face with a farther-right path and predict a mirrored case. Return the next day with a changed example before a replay.

Proposed product gate (a judgment, not a statistical result): at least four of five can identify all three references and explain/predict the unfamiliar case unaided. Investigate every recurring misunderstanding before adding another lesson family. Five sessions identify confusion; they do not establish market demand or efficacy. Run a broader test before making either claim.

## Evidence for this release

- Code and rendered UI audit, 2 November 2026; prior automatic impact beat 1.9 seconds, generic prompt, unlabelled reference line.
- `impact-teaching.js` centralises the explanation; renderer and copy consume the same face/path pair.
- `impact-teaching.test.mjs` checks direction logic across the available settings and the actual club-face normal.
- `tools/verify-impact-teaching.mjs` checks normal/reduced motion, mirrored/straight cases, context continuity, mobile layout, no-WebGL fallback and no pre-commit worked explanation.
- Golf principle reference: https://www.trackman.com/blog/face-to-path (centred-contact assumption and target-versus-path distinction). This supports the principle, not the app's exact numerical flight or teaching effectiveness.
