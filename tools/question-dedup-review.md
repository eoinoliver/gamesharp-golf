# Question Bank Near-Twin Review

**DIRECTION CHANGE (owner, July 2026): twins are KEPT, not merged.** Scenario repetition is
deliberate — re-meeting the same decision after a gap is the spaced-repetition rep that aids
retention. The rule is structural instead: group-mates never appear in the same batch and get
at least 2 days between sightings. That rule is now implemented in index.html:

- `SIMILAR_GROUPS` (40 curated groups, 97 question ids) — the clusters below, embedded as data
- `pickSpaced(pool, n)` — batch builders (Crash Course, Saturday Card, Fix Your Leak, Play Prep)
  take max one question per group and skip twins of anything seen in the last `TWIN_SPACING_DAYS` (2)
- `spreadTwins(list)` — module quizzes keep every question but separate group-mates
- `buildTodaysDaily`'s `tooSimilar` guard now also checks the static groups + cross-day spacing
- `markSeen` records last-seen dates (`at` map) to power the day-spacing

Verified in-browser: 0 same-batch twins in 50 stacked-pool draws, 0 same-day or within-2-day
twins across a 60-day daily simulation, 0 adjacent twins after spreadTwins.

The merge/delete proposals below are therefore **obsolete as deletions** — kept for reference
because the cluster map is the source for `SIMILAR_GROUPS`, and the DIFF rewrite ideas remain
optional content improvements. The two correctness flags at the bottom (Q097, Q001) are still
live and still need owner review. Any rewrite must meet the quality bar: no length-tell on the
correct option, no throwaway/absolute distractors.

---

Detector: `tools/similarity-check.js` (run `node tools/similarity-check.js`). It parses the
QUESTIONS array from index.html, normalizes golf synonyms (punch-out/chip-out/sideways/medicine → one
concept, buried/plugged/fried-egg → one, etc.), and scores pairs on question-token Jaccard +
tag/module overlap + correct-answer concept overlap + why_right overlap. 398 questions scanned;
134 raw candidate pairs (`tools/similarity-report-raw.txt`); the list below is the hand-curated
result after reading each pair — topic-sharing pairs with genuinely different answers were dropped.

Legend: **MERGE** = delete the weaker twin. **DIFF** = keep both but rewrite one so it has a
different lie/distance/stakes AND a different correct answer or angle.

---

## Tier 1 — True near-twins (same scenario, same correct concept). 19 actions.

Ranked by detector score.

| # | Cluster | What they both ask | Proposal |
|---|---------|-------------------|----------|
| 1 | **Q048 / Q129 / Q273** (Greenside Bunker, 0.60) | Buried/fried-egg lie: square-or-closed face, steep, dig | Keep **Q273** (fullest setup detail). **MERGE:** delete Q129. **DIFF:** rewrite Q048 → outcome-expectation angle: buried lie comes out with no spin and runs — where do you land it? (answer: well short of the flag, plan for release; different concept, same lie) |
| 2 | **Q071 / Q147** (Rules Edge Cases, 0.60) | Yellow penalty area, "which relief option is NOT valid" — identical trap option (2 club-lengths from crossing point) | **MERGE:** delete Q071 (vaguer). Keep Q147. Red-vs-yellow nuance already covered by Q352. |
| 3 | **Q019 / Q210** (Tight Lies, 0.55) | Tight lie/hardpan short shot → bump-and-run with 8/9-iron | **MERGE:** delete Q019 (40yd hardpan, thinner). Keep Q210. Q225 (frozen ground, 60yd) and Q229 (links, 145yd) are far enough apart in distance/conditions to keep — noted in Tier 3. |
| 4 | **Q051 / Q276** (Bunker distance control, 0.54) | Long bunker shot → longer swing / vary swing length | **MERGE:** delete Q051. Keep Q276 (diagnostic frame) and Q275 (40yd firm wet sand — already a genuine variant). |
| 5 | **Q139 / Q320** (Bad Bounce Response, 0.50) | Perfect shot hits sprinkler head into bunker → accept it | **MERGE:** delete Q139. Q320's correct option is the more actionable one (accept + physical reset + next shot). Verify Q320's options for length-tell after merge. |
| 6 | **Q006 / Q159** (Par 3 Strategy, 0.37) | Par 3, 165yd, pin front-left behind bunker → centre/right-centre | **MERGE:** delete Q159. Q006's penalty-area-left detail makes the same answer better motivated. (Q119, front-right mirror, is acceptable as the mirrored drill — keep.) |
| 7 | **Q097 / Q105** (Crosswind + fade, 0.48) | Crosswind vs natural fade → "they cancel" | **MERGE + CORRECTNESS FLAG:** the two answers contradict. Q105 (wind from right, fade): "aim at the flag — they cancel" is physically coherent. Q097 (wind right-to-left, fade left-to-right): "aim left and let them cancel — straight shot" is internally inconsistent (if they cancel, you don't aim left). Delete Q097. |
| 8 | **Q086 / Q165 / Q166 / Q189** (Wind Adjustments) | Headwind/tailwind clubbing | **KEEP ALL — already differentiated** (10mph→1 club, 15mph→2 clubs, 20mph tailwind→2 less, 25mph→punch). This is a deliberate graduated set; listed only so you know the detector saw it. |
| 9 | **Q036 / Q126** (Putting IQ, 0.46) | Aim the putter face at your start line, not the hole | **MERGE:** delete Q036. Q126 (30-footer, 4 feet of break) is the richer scenario for the same principle. |
| 10 | **Q106 / Q178** (trees punch vs chip-out, 0.46) | Tee shot in trees, gap vs chip out sideways → chip out | Keep **Q106** (concrete: 210yd, low punch through branches). **DIFF:** rewrite Q178 into the contrast case where the punch IS right — e.g. clean lie on pine straw, gap 12 yards wide at trunk height, 120 to an open front green, your stock low 5-iron punch fits with margin → correct: take the punch; chipping out is over-conservative when the window is wide and the miss is still fine. Gives the bank its "not always medicine" case. (QE5_022 and QE5_031 stay: QE5_031 asks a different question — target score — and QE5_022 is the tour_decision format with its own numbers; flagged for the runtime guard, not for deletion.) |
| 11 | **Q035 / Q209 / Q355** (embedded ball rule, 0.46) | Embedded after rain → free relief | Keep **Q355** (most precise procedure). **MERGE:** delete Q035. **DIFF:** rewrite Q209 → embedded in a bunker (or in fringe vs green) where the answer genuinely changes: embedded-ball relief applies in the general area only, so in sand the answer is play it or take unplayable. Different answer, same theme. |
| 12 | **Q116 / Q202** (Reading Wind, 0.44) | Best wind read → treetops + flag together | **MERGE:** delete Q202 (wordier duplicate of Q116). |
| 13 | **Q044 / Q255 / Q261** (Chip vs Pitch, 0.40) | Clear flat path → low chip with 7/8-iron | Keep **Q261** (light-rough nuance) and Q262 (pressure angle — genuinely different). **MERGE:** delete Q255 (pure definition, weakest). **DIFF:** rewrite Q044 → receptive green, water/drop-off just past the pin: correct becomes the higher softer pitch. Opposite answer, completes the decision tree. |
| 14 | **Q172 / Q240** (punch under tree, 0.43) | Blocked by tree → punch low under branches | Keep **Q172**. **DIFF:** rewrite Q240 (Dogleg Strategy) → low branches make the punch impossible / run-out is bunkered, gap over the tree is generous: correct = go over or pitch out to the fairway. Different answer; the dogleg module keeps a tree question. |
| 15 | **Q060 / Q338** (yips, 0.41) | Cause of the yips → anxiety/over-control | **MERGE:** delete Q060. Q338 defines and explains; Q060 adds nothing. |
| 16 | **Q016 / Q092** (post-double reset, 0.38) | Next tee after a double → reset, next shot | **MERGE:** delete Q016. Keep Q092 (richer: two OB balls, walking to tee). Q193 stays — its answer ("play the SAME strategy, don't change plan") is a distinct point. |
| 17 | **Q142 / Q334** (worst thought after blow-up, 0.42) | Most dangerous next-tee thought → "need birdie back" | **MERGE:** delete Q334. Q142's par-3-over-water context makes the same trap concrete. |
| 18 | **Q213 / Q237** (flyer lie, 0.38) | Flier lie → flies further, less spin/club | **MERGE:** delete Q237 (expectation-only). Q213 includes the club decision. |
| 19 | **Q034 / Q122** (altitude, 0.36) | Altitude → ball flies further, club less | **MERGE:** delete Q034. Q122 is the actionable version (1–2 clubs less). |
| 20 | **Q023 / Q120** (links debut, 0.35) | First links round → bump-and-run everything | **MERGE:** delete Q023. Q120 is the fuller scenario. |
| 21 | **Q266 / Q270** (competition bump-and-run, 0.42) | Under pressure → take the simpler bump-and-run | **MERGE:** delete Q270. Q266's caddie-vs-instinct hook is the stronger frame. |
| 22 | **Q214 / Q238** (deep rough 50yd, 0.41) | Deep rough near green → sand wedge, bounce helps | Keep **Q238** (adds carry-the-bunker constraint). **DIFF:** rewrite Q214 → fluffy lie sitting up, short-sided over a bunker to a tight pin: correct = lob wedge (height/stop beats bounce-through). Different answer, same module. |
| 23 | **Q045 / Q272** (standard bunker setup, 0.41) | Standard greenside bunker → open face, open stance, sand first | **MERGE:** delete Q045 (bare technique recall). Keep Q272. Q089 ("where do you look") and Q271 (diagnostic "sand before ball") are near this concept but distinct enough angles — keep, noted in Tier 3. |
| 24 | **Q042 / Q135 / Q230** (fairway bunker, 0.39) | Fairway bunker 140yd → ball back / grip down / ball-first | Keep **Q135** (full scenario, low lip). **MERGE:** delete Q042 (generic recall; its answer is just Q135+Q230 combined). **DIFF:** rewrite Q230 → same distance but a HIGH lip: correct = loft first, take the shorter club out and advance (different answer — the constraint changes the decision). |
| 25 | **Q050 / Q259 / Q278** (Texas wedge, 0.42/0.37) | When is putter right from off the green → smooth firm ground | Keep **Q259** (best hook). **MERGE:** delete Q278 (pure definition). **DIFF:** rewrite Q050 → soft, wet, grainy fringe after rain: correct = chip, the putter dies in the nap (the "when Texas wedge is WRONG" case). QE5_035 stays (different format/options). |

## Tier 2 — Same concept, different hooks. Differentiate or consciously keep. 7 items.

| # | Pair | Overlap | Proposal |
|---|------|---------|----------|
| 26 | **Q015 / Q138** (match play, opponent in trouble on 17) | Same scenario; answers subtly conflict ("play safe and consolidate" vs "play your own game") | Recommend **MERGE:** delete Q015; Q138's "play your own game, make par" is the cleaner doctrine and Q015's framing half-contradicts it. If you want both philosophies in the bank, Q015 must be rewritten so the situation clearly warrants the different answer. |
| 27 | **Q009 / Q107** (two-tier green) | Both: fly it to the pin's tier | **DIFF:** rewrite Q009 → pin on top tier but steep shaved run-off behind and firm green: correct = play to the lower tier, take the two-putt. Opposite answer, real decision. |
| 28 | **Q094 / Q101 / Q151** (3-wood off the tee) | All: club down for position | **MERGE:** delete Q101 (vaguest — "been spraying it"). Keep Q094 (fairway-pinch math) and Q151 (OB-side aim). Note the bank already holds the contrast case (QE5_016: driver is RIGHT when the accuracy gain is tiny) — good. |
| 29 | **Q082 / Q096** (par-5 layup to full wedge) | Same answer, different dressing | Keep Q096. **DIFF or MERGE** Q082: either delete, or lean into its match-play state (1-up) so the answer hinges on the match, not the wedge number. |
| 30 | **Q378 / Q392** (attack the makeable chip) | Same doctrine | Keep both is defensible (one is mindset, one rebuts a partner's bad advice), but they should never co-appear — confirm the runtime guard catches them; otherwise merge (delete Q378). |
| 31 | **Q018 / Q186** (approach play = biggest leak) | Same stat, two angles (where you lose vs where to gain) | Keep both — acceptable pairing; ensure the daily guard separates them. |
| 32 | **Q308 / Q335** (routine = trigger) | Purpose vs failure-mode | Keep both — different angles on one concept; guard-separate. |

## Tier 3 — Detector hits reviewed and cleared (keep, no action)

- Q087/Q117 (downhill vs uphill lie — opposite adjustments, deliberate pair)
- Q185/Q192 (effective distance uphill vs downhill — deliberate pair)
- Q004/Q389 (lag vs attack birdie putt — opposite answers, good contrast)
- Q001/Q011/Q155/Q156/Q371 (layup cluster — Q371 is the "go for it" contrast case; distances/reasons differ)
- Q225/Q229 (bump-and-run at 60yd frozen vs 145yd links — different shot classes)
- Q089/Q271 ("sand first" — execution focus vs diagnostic concept)
- Q252/Q253/Q254 (pin positions — different answers)
- Q279/Q280/Q281/Q282/Q283 (fringe module — each a distinct sub-decision once Q278 is gone)
- Q123/Q247 (blind shots — different situations and answers)
- Q008/Q110/Q121/Q183/Q215/Q216 (dogleg cluster — answers differ)
- Q114/Q201 (par-5 layup: unreachable vs creek — different reasoning)
- Q31/Q132 (grain: effect vs identification)
- Q310/Q342 (routine length / per-club — distinct)
- QE5_007/QE5_008 (20-hcp vs 5-hcp underclubbing — deliberate progression)
- Q075/Q220 (cart path vs casual water — distinct rules)

## Content-consistency flags (not duplicates, but contradictions worth a look)

1. **Q097 vs Q105** — see #7. Q097's correct answer looks internally wrong; recommend deletion regardless of dedup.
2. **Q001 vs QE5_024** — Q001's correct answer is "lay up to your favourite wedge distance"; QE5_024's whole point is that the favourite-number layup is a myth ("do not lay back to a number unless the closer zone is materially worse"). Q001's water carry may justify the layup, but the "favourite wedge distance" phrasing endorses the exact heuristic QE5_024 debunks. Suggest rewording Q001's correct option to "lay up short of the water to a full-wedge range" once approved.

## Tally

- 398 questions scanned, 134 raw pairs, curated to **25 Tier-1 actions** (≈19 deletions + 7 rewrites), 7 Tier-2 judgment calls, rest cleared.
- Nothing has been changed in index.html. Reply with approvals/rejections per line item and the deletions + rewrites can be applied in one pass (rewrites will be drafted for a second sign-off before insertion, with the no-length-tell / no-throwaway-distractor bar applied).
