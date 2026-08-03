# GameSharp Golf — whole-app mobile release audit

Date: 2026-08-03  
Build state: local audited preview; not deployed

## User journeys exercised

| Journey | Mobile evidence | Result |
|---|---|---|
| Today → Daily → answer → reveal → exit | Semantic answer buttons, correct reveal, Next Question visible, Home restored at scroll top | Pass |
| Today → Play a Hole → decision → reveal → next shot | Choice remains visible through reveal, score increments, Next Shot opens shot two rather than Home | Pass |
| Interrupted Play a Hole → Home → resume | Home now names the exact saved hole and shot that the action resumes | Pass |
| Sharpen → Putting → pace distinction → focus | Five 48px hole zones, cautious route, one focus and one cue | Pass |
| Sharpen → Shot Clinic → return | Focus/watch bridge remains visible; one-tap return restores the identical result | Pass |
| Save focus → Review bag → Putter | Putter shows current focus; tapping it opens the same Putting router | Pass |
| Fresh Home → 19th Hole → enter round → result | All four inputs and score-state buttons are labelled; result is coherent and non-diagnostic | Pass |
| More ways to play → three-hole Decision Run | Progressive disclosure opens; complete authored hole begins with semantic choices | Pass |

No relevant browser console warnings/errors or horizontal overflow were observed during these journeys.

## Home decision

Simplification was warranted, but a wholesale redesign was not. The mobile Home already had a strong compact visual system; the problem was priority order and continuity.

The final hierarchy is:

1. Daily Challenge;
2. Play a Hole;
3. one contextual depth action;
4. collapsed secondary play formats;
5. Today / Sharpen / Review navigation.

The 19th Hole or saved-focus prompt remains visible, but it no longer separates the two primary actions.

## Failures found and structural remedies

### Home advertised a different hole from the one that opened

Cause: Home calculated the next hole while Play a Hole correctly preferred an interrupted session.

Remedy: the Home promise now reads the same persisted session selector. When a session exists it says `Finish your hole` and names the exact hole and shot. The UX contract fails if this mapping disappears.

### Play a Hole choices were clickable divs

Cause: legacy interaction code relied on pointer-only `onclick` cards.

Remedy: the single decision renderer now creates native buttons, preserves 48px-plus card height, adds focus treatment and exposes the locked state after commitment. This changes all 92 authored decisions structurally.

### Neutral-choice cleanup produced broken English

Cause: a broad replacement changed `fat side` to `widest part of the green side`.

Remedy: the transformer now recognizes the complete phrase and returns `widest part of the green`. Neutral choice copy remains governed by the launch trust audit.

### “Your Round Focus” reopened incidental Sharpen state

Cause: Home called the general resume method rather than a saved-focus destination.

Remedy: an explicit `openSaved` API now routes the Home card to the saved result/check-back. General Sharpen resume and saved-focus entry are separate contracts.

### Debrief controls lacked accessible names

Cause: visible labels were not associated with their numeric inputs; +/E/− buttons exposed no meaning or state.

Remedy: every scorecard label now uses `for`, and score-sign controls expose `Over par`, `Even par`, `Under par` plus `aria-pressed` state.

### Balanced rounds received a contradictory pressure result

Cause: when every gap score was zero or better, the sorting fallback selected Pressure even though its explanation said Pressure was not the priority.

Remedy: a non-positive graph now returns `One Decision to Revisit`, explicitly says no scorecard number stands out, and asks for one costly decision without inventing a diagnosis.

### Mobile could receive stale HTML

Cause: a previously installed cache could continue to serve the pre-audit shell.

Remedy: the release shell is now `gamesharp-golf-v18`. The contract binds the expected cache version and both current one-hole artwork formats. The hero loader now recovers WebP → JPEG, on connectivity/visibility return, or by explicit retry; a transient mobile request failure can no longer permanently hide a valid asset.

The Home surface also has an explicit iOS scroll boundary, momentum scrolling, isolated stacking context, and pointer-enabled primary action layers. At 390×844 the Daily, Play a Hole and Sharpen entries were each exercised through their destination with zero horizontal overflow.

## Remaining operational check

A physical mid-range Android handset under variable course connectivity remains a pre-production field check. The WebP remains below the enforced 160KB budget, mobile layouts have no observed horizontal overflow, and the browser console is clean; no physical-device claim is made.
