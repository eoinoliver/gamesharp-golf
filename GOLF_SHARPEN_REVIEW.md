# GameSharp Golf Sharpen — audited preview review

## Release decision

This build replaces the winding eight-stage Sharpen journey with one immediately readable golf hole and five direct decision zones. It is locally implemented and audited, but intentionally not deployed. Production still requires explicit approval of this preview.

## Authoritative coverage

Sharpen has one source of truth containing five regions, 20 observable issues, 20 discriminating routes, 40 cautious results and 23 reviewed asset definitions.

| Hole zone | Bag identity | What it sharpens | Existing content pulled through |
|---|---|---|---|
| Off the Tee | Driver | start line, curve, strike window, target commitment | exact driver comparisons and relevant Play a Hole decisions |
| Recovery & Fairway | Hybrid | wind, lie, recovery corridor, club/target window | Course IQ mini-sessions and The Recovery scenario |
| Approach | Iron | contact, distance window, target side, attack/protect | iron comparisons and focused approach decisions |
| Around the Green | Wedge | lie, landing spot, shot choice, bunker/recovery | short-game comparisons and focused short-game decisions |
| Putting | Putter | pace, start line, read and commitment | putting comparisons and focused putting decisions |

Pressure, routine and Course IQ remain contextual lenses inside these decisions. They are not extra hotspots competing with the hole.

## One-hole entry

The primary Sharpen entry is a single purpose-built, elevated broadcast illustration showing the complete hole from tee to green. Five semantic 48px targets sit directly on the corresponding parts of the hole. A tap opens that zone's issue screen immediately; there is no intention selector, lobby or intermediate menu.

The production WebP is 140,872 bytes, reduced from a 2,449,065-byte PNG master (94.2%). The illustration contains no baked-in labels and is not the source of product truth. If it fails to load, the same five zones become a usable text grid.

## Bag integration

The bag is a compact memory of the same five-zone system, not a sixth feature. Driver, Hybrid, Iron, Wedge and Putter each open the exact same router as their hole hotspot. Their states are derived only from saved and tested focus history:

- current focus;
- taken for testing;
- tested/sharp;
- revisit;
- neutral.

The UI explicitly says this is learning activity, not a measure of swing or ability. A fuller bag summary appears in Review and uses the same authoritative state and routing functions. No parallel bag diagnosis or content bank exists.

## Reference journey and content symbiosis

The hostile reference path is:

`Sharpen → Recovery & Fairway → trouble → unclear corridor → Playable side first → Play the Recovery → return to the identical result → save → Hybrid becomes current focus`.

The linked Play a Hole experience carries the selected focus and a route-specific observation instruction. Its return restores the originating result rather than dropping the golfer on Home. Course-wind, course-lie, hazard and club-window learning keys were added to the authoritative question mapping so Recovery cannot silently link irrelevant material.

Every reachable recommendation points to an existing launch-approved asset. Result, cue, animation/content destination, return summary and share output derive from the same route/result definitions. The structural test fails semantic mismatches, missing assets, missing sources, dead returns and unsupported routes.

## Claim boundary

Sharpen is guided self-reflection and judgment training. A tap reports what felt closest; it does not diagnose mechanics or measure ability. Every result preserves the cautious hypothesis boundary, gives exactly one focus and one short course cue, and avoids invented probability, swing capture, strokes-gained or improvement claims. Uncertain routes gather observable evidence instead of guessing.

## Mobile and resilience evidence

Rendered checks passed at 320×568, 390×844 and 844×390. The same responsive constraints cover 375×812 and 430×932 and are enforced by the contract. Across the rendered checks:

- the entire hole and all five targets remain reachable;
- every target is at least 48×48px;
- no horizontal overflow or unexplained blank panel appears;
- the home screen scrolls normally on the smallest phone;
- landscape keeps all five hole targets in view;
- interruption restores the current issue/result safely;
- save updates the corresponding bag club;
- Review routes back through the same zone router;
- no relevant console errors were observed.

Reduced motion removes pulsing/transition motion without removing state or learning. Image failure, keyboard activation, focus restoration and persistence are structurally enforced. A physical mid-range Android field test remains an operational pre-production check and is not represented as completed.

## Hard gates passed

- `gamesharp-golf-sharpen-contract.test.mjs`: PASS — 5 regions, 20 routes, 40 results, 23 assets.
- `gamesharp-golf-ux-contract.test.mjs`: PASS.
- `tools/launch-trust-audit.js index.html`: PASS — 404 questions; 67 launch-approved and 337 quarantined; 12 holes, 237 nodes and 92 decisions.
- JavaScript syntax/integrity and whitespace checks: PASS.
- Service-worker shell updated to cache v17 and the current one-hole WebP, evicting every pre-mobile-audit shell and the retired journey artwork.

## Honest limitations and quarantines

- The generated illustration is a bespoke visual orientation asset, not a technical ball-flight diagram. The five semantic controls and authoritative route graph carry the technical meaning.
- A physical Android handset under variable course connectivity has not yet been field-tested.
- Retired journey styling remains as overridden, unreachable CSS in the single-file app. No retired journey DOM, navigation mode or renderer is reachable. Removing those declarations is safe technical cleanup, not a release-behaviour dependency.
- The 337 legacy questions remain quarantined from launch-standard journeys.

## Definition-of-done status

The requested local build is complete: one hole, five direct zones, one shared router, one bag-based habit memory, exact-context content returns, synchronized learning truth, mobile-safe presentation and structural release gates. It is an audited preview, not a production deployment.
