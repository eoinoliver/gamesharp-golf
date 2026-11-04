# Selective recovery — 4 November 2026

## Outcome and boundary

Connect a recognisable on-course problem to a useful decision, one cue for the next round, an observation afterwards, and a fresh check when eligible. The current app remains the runtime. Neither legacy HTML, its engines, clinic diagnoses, ratings, quotes nor scores are imported.

The inventory and source hashes are in the task artifact `outputs/Legacy-Review-2026-11-04/recovery-manifest.json`. This release recovers interaction structures and teaching intentions. It does not assert that the legacy editorial labels were coaching approval.

## Teaching briefs

Every recovered lesson has three first decisions plus one delayed question; its versioned ID, situation, alternatives, explanation, visual facts, watch cue and practice task live together in `src/recovered-content.js`. The approved IDs are listed in `src/scenario.js` without changing its existing state VERSION.

| Lesson | Useful decision and misconception | Reference and evidence | Changed situation and practice |
|---|---|---|---|
| tee-club-window-v1 | Does a shorter club remove a named hazard enough to justify the next shot? Reject automatic clubbing down. | Target-facing plan; finish distances include roll. Six fixed authored finishes per club, explicit longitudinal and lateral OB boundary, stated approach distances. Compare the same supplied sets. | No OB favours driver; moved boundary favours 3-wood; delayed case mirrors the side. Name the removed danger before a tee shot. |
| reset-the-decision-v1 | Distinguish nervousness from new information. Reject both automatic caution and rigid commitment. | Three labelled facts: original plan, changed conditions or feeling. A decision context, not a shot simulation. | A stronger headwind requires a new carry assessment; a prior three-putt alone does not. Delayed example changes tee and landing area. Ask what changed before committing. |
| recovery-window-v1 | Check width and height of an escape. Seeing the green is not enough. | Clean lie and rehearsed shot explicitly supplied. Plan view scales the gap and shot window; side view scales clearance and height at branches. | One case fails height, one fits both, one fails width. New dimensions in the delayed check. Find a playable exit before a hero route. |
| reread-the-wind-v1 | Re-read wind relative to a new target. Prior-hole wind memory can mislead. | Fixed north compass; long gold new-target, grey prior-target and short turquoise air-direction arrows, all labelled. No yardage or curve forecast. | Different cardinal headings produce helping, head and crosswinds. Delayed case changes both reference directions. Reassess on a course turn. |
| nearest-complete-relief-v1 | Separate nearest complete relief, attractive ground and the relief-area limits. | General-area cart path; complete-relief points supplied for the intended stroke. Diagram is schematic, not a model of the player's stance. Permitted area excludes locations nearer the hole. | Optional relief can be declined; one area is nearer the hole; delayed case reverses the nearest side. Find the reference before measuring. |
| match-objective-v1 | Calculate what this hole's result means for the match before discussing risk. | Scratch singles, final hole, stated opponent finish and player strokes; tied match goes to extra holes under the supplied competition terms. | Same putt with a different match score; then a different stroke count. Delayed case loses the last hole from one up: all square, not match lost. Read the score, holes remaining and opponent first. |

The match lesson establishes the objective; it deliberately does not claim that being one down determines an optimal flag attack. A future strategic match episode needs actual opponent state, playable alternatives and evidence for their trade-off.

## Presentation and navigation

- Sharpen is a five-zone fictional course map. Each branch has a specific lesson or an observation task; unresolved driver/contact/bunker-strike/putting-start symptoms do not trigger a mechanical diagnosis.
- Existing course lessons remain at their current IDs and URLs. A lesson opened from Sharpen returns to that zone on close/back. Explore retains direct entry and derives catalogue counts from content: 21 lessons, 57 core decisions, 15 Academy return checks.
- New lesson previews use the actual first-question diagram. Explicit renderer dispatch separates course plans, decision context and relief from chip/putt/slope renderers. No accidental green-renderer fall-through.
- Use the existing Tennis-style staged text, lettered options, commit, visible evidence, explanation and deliberate next step. Show all, reduced motion and keyboard behavior remain available. New diagrams are SVG and work without WebGL or sound. Existing recorded shot sounds remain attached to actual shot animations; a rules diagram does not simulate a golf strike.
- Tee points use shape as well as colour. The bunker/OB/course geometry does not move during a comparison. Recovery uses separate width and height views. Diagrams state their schematic or authored limits.

## State and the learning loop

`focus-service.js` is the sole active-focus reader/writer for the new UI. `gamesharp-round-plan-v1` holds typed focus references, plan snapshots and reflections, never quiz scores. On first successful initialization, a valid existing connected-round cue wins over a valid Academy focus, matching the old UI precedence. Once initialized, null remains null; an old cue is not resurrected.

Existing learning, course, connected-round, remembered-shot and experience-preference keys remain intact. Old round observations are displayed through an adapter. They are not rewritten or promoted into new proficiency. Every new first-answer ID is distinct. First attempts remain immutable; practice, reflection, saved plans and delayed recall remain different evidence.

Unreflected plans can be edited without creating duplicates. A reflected plan remains a historical snapshot; preparing again creates a new round. Repeated reflection submission is idempotent. A change of focus never rewrites the focus of an earlier plan. Blocked storage gives a session-only warning; unknown future plan schemas are not overwritten.

The active focus supplies context to the existing lesson and round check schedules. A new Academy lesson gets its own delayed check, not invented membership in one of the four connected-round skill scores. Existing two-case course lessons are labelled revisits because they have no delayed question. “No opportunity” is neutral and creates no learning evidence.

## Course preparation pilot

Laytown & Bettystown offers three source-linked preparation prompts: the first green's front-left pot bunker, the seventh hole's width/approach trade-off, and the thirteenth green's left bunker/right red-staked ditch. The hazards are not reclassified as tee-shot obstacles. No surveyed geometry, unverified yardage or personal club recommendation is supplied.

The club's published descriptions were checked on 4 November 2026. Its general hole page contains some mismatches between descriptive and tabulated distances; therefore this pilot omits distances. It is explicitly not club-reviewed. A faithful course guide, local-rule advice, County Louth and iconic-hole replicas remain outside this release until the requisite source/club checks exist.

## Sources and limits

- Shot Scope, official statistics-analysis publication: https://shotscope.com/au/wp-content/uploads/2024/10/eBook-6-How-to-analyse-your-stats.pdf. Supports examining the trade-off; the displayed sets are original authored examples, not population predictions.
- PGA, Range Session: Game Planning: https://www.pga.com/story/range-session-game-planning. Targeted practice and familiar routines; no copied warm-up volume or mechanics prescription.
- PGA, First Tee Shot: https://www.pga.com/story/3-keys-to-open-your-round-with-a-successful-first-tee-shot. Routine under nerves. Official search result text was available despite direct automated fetch restrictions.
- APS, wind and golf-ball flight: https://meetings-archive.aps.org/dfd/2020/w01/3/. Direction dependence; the lesson teaches a reference-frame comparison, not a calibrated aerodynamic forecast.
- R&A Rule 16: https://www.randa.org/rog/the-rules-of-golf/rule-16. General-area relief procedure. Scope and optional-relief assumptions are supplied in each situation.
- R&A Rule 3: https://www.randa.org/rog/the-rules-of-golf/rule-3. Hole/match arithmetic and tied-match competition terms.
- Club hole guide: https://landbgolfclub.ie/course/course-detail/ and https://landbgolfclub.ie/course/course-detail/hole-13/.

No independent coach, physical-phone, golfer comprehension, on-course transfer or retention validation is claimed. Browser checks cannot supply those. Observe the first complete journey with target golfers before expanding this content family again.

## Engineering verification

- `npm test`: content/geometry, first-answer preservation, new focus migration, idempotent plans/reflection, neutral no-opportunity, unknown schema protection, and existing models.
- `tools/verify-recovery.mjs`: map → lesson → comparison → cue → plan → reload → reflection → My game → delayed check; observation routing, course-pilot selection, text escaping, mobile sizes, keyboard, reduced motion, no WebGL and blocked storage.
- `tools/verify-academy.mjs`: entire expanded Academy and all six existing course lessons, fresh checks, saved cues, comparisons, replays and fallbacks.
- `tools/verify-round.mjs`: existing connected-round routes and checks, now saving the shared focus and reflecting through the round-plan journey.
- Build boundary remains `dist/`; the explicit asset allowlist admits no legacy packs or HTML.
