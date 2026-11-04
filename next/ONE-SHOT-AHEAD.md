# One shot ahead — learning release, 3 November 2026

## The product decision

The strongest objection to the previous release: breadth and tidy question sequencing did not make the learner feel the cost of a decision. Lesson completion also gave us little reason to choose their next practice. This release prioritises connected consequences and evidence-led return practice. It does not claim to beat every golf product or establish demand.

The live Tennis benchmark (3 November) leads with a singular situation, staged reading and a clear challenge. Its connected-point idea is adapted to golf: the decision changes the next position, and that position is played. Home, Sharpen and Explore remain familiar; the whole-round catalogue and the iron-flight tools remain available.

Arccos currently describes targets and strategy informed by personal shot history: https://eu.arccosgolf.com/pages/ai-strategy . That is a real advantage we do not reproduce with synthetic personalization. Our proposed value is rehearsal of judgement without sensors or an upload. The second-order value is recognising an unfamiliar version of a familiar mistake. The third-order opportunity is earning a useful place in the golfer’s actual practice/round routine. Both latter claims require golfer evidence.

## Teaching briefs

| Situation | Useful decision | Misconception | Evidence and controlled comparison | Transfer |
|---|---|---|---|---|
| The tempting flag | Place the broad approach pattern away from the costly miss | The best strike is a sufficient target plan; moving maximally away from water is always safest | Nine fixed strike offsets, three targets; chosen offset is 13 m right and 7 m short for all three. Compare green, sand/coast, other grass and mean remaining distance, without converting examples into probabilities | Water moves to the other side on a new hole |
| The short-side trap | Leave room for the miss and the recovery | Avoiding a front bunker by adding depth solves every problem | Same nine offsets and fixed front-left bunker. Flag attack leaves a bunker; middle leaves a putt. Recovery compares first landing with final roll | A wider iron pattern replaces a tight wedge pattern |
| Permission to attack | Use a well-protected flag when the actual pattern fits | Safe always means farther from the flag | Tight pattern fits around the flag. Other placements leave more distance or introduce sand. Same strike offsets across targets | Recognise why using different strike samples makes a comparison unfair |
| Branch: rough/collar | Carry a poor first-bounce surface, then use a rehearsed shot | Low is always safest; landing at the flag removes rollout | Three authored landing/finish pairs. The failed low chip really stays on the collar; next screen identifies putting from a clear collar | Three rotating landing questions include a clear runway where the low chip is useful |
| Branch: bunker | Use a broad landing patch when short-sided | Chase the shortest possible putt without allowing for landing variation | Fixed bunker; visible first bounce and subsequent roll. No reconstruction of club/sand impact | Landing-surface checks; no prescription for an unmeasured swing |
| Branch: putting | Compare the whole practice set | A holed putt proves the best pace plan | Actual remaining distance from the previous shot; three authored rehearsal finishes per plan. The inferior positive-pace sample holes its shown ball but leaves longer returns in the other two. Answer positions vary with the distance | New slope, line–pace pairing, and whole-pattern evidence checks |

Primary course-management principle: https://www.pga.com/story/the-course-management-lessons-from-haeran-ryus-aig-womens-open-bounce-back . Broader existing landing and putting sources remain in WHOLE-ROUND.md. These support principles, not our authored numbers or graphics. Independent coaching review remains outstanding.

Spacing/retrieval design reference: Carpenter, Pan & Butler (2022), https://www.nature.com/articles/s44159-022-00089-1 . This educational research supports testing after a break. It is not evidence that our app improves on-course scores.

## Interface contract

Situation arrives with Tennis’s reading cadence, then the question and lettered complete plans. Show all, keyboard input and reduced motion remain supported. A commitment is stored before animation. There is an explicit next action after the consequence. Full-pattern comparison uses the same offsets and sample identity; the short-game and putting alternatives are explicitly authored outcomes, not a physics prediction.

The fixed Headland green and front-left bunker use the existing coastal scene. An overhead view preserves orientation. A labelled SVG plan supports unavailable WebGL. Scene changes never relocate the bunker. Course geometry, start/end coordinates, copy and local state must agree. The golfer plays from the actual previous finish, including the collar branch. Balls and lines are enlarged for readability.

## Return and evidence contract

New local key: gamesharp-next-shot-v1. Existing academy, tactical and Shotbook records are preserved. The first connected route is immutable; replays can follow different branches without replacing it. The first answer to each fresh check is kept in an immutable map, separately from the bounded later-practice history. Committed feedback resumes on reload. Explicit new-practice links start a fresh check and normalize their URL for reload.

Four practice themes, three rotating checks each: room for the miss, first bounce, putt left, decision versus result. Priorities use first-read errors from connected rounds and relevant short-game/putting lessons; successful delayed recall reduces that priority. A missed course opportunity can prioritize its theme until the next check. Unexplored themes remain available. Iron-flight lesson errors are not misclassified as course-judgement errors.

Delayed eligibility begins one day after the initial evidence; early practice does not move that anchor. Correct eligible checks expand the next interval to three, then seven days. A wrong delayed check resets to one day. These are simple scheduling choices, not a validated optimum. First reads, practice and delayed recall are labelled separately. Nothing is called mastery or a handicap gain.

The golfer can save one course focus, then record recognised/used, noticed afterwards or no opportunity, with an optional 240-character note. Observations are private browser-local text, never executed HTML, never uploaded, and not counted as proof of improvement. No notification or account system is implied.

## Release evidence needed

Model checks: all branch combinations, identical comparison offsets, geometry consistency, first-record immutability, invalid storage, early versus eligible practice, rotating checks and scheduler priority. Browser checks: every approach branch, wrong and sound recoveries, comparisons, reload, completion, transfer, saved focus, course observation, mobile widths, keyboard/staged text, reduced-motion change, no WebGL and unavailable storage. Production must serve the exact tested build.

Human evidence remains missing: independent coach review; five everyday golfers asked to explain the cause without prompts, solve a fresh situation, and choose to return after a break. The decisive question is whether they recognise and use the idea on the course. That is the next validation gate, not a claim this code can prove.
