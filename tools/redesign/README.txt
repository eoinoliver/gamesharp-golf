GameSharp Golf invitation and consequence redesign — 3 November 2026

Runtime remains in next/src. Only dist is deployed.
Scene previews use the actual first-question geometry, without a revealed result.
render-cards.mjs captures 960x540 PNGs from local Vite (port 5174).
Encode those PNGs as WebP at quality 87 before building; PNGs are QA/source renders and are not deployed.
prepare-audio.py makes contact-aligned, levelled excerpts from the source recordings in next/src/audio-assets.
The original source recordings are retained for reproducibility; Vite imports only golf-*.mp3 excerpts.
Recording sources and licenses are in next/public/shotmaker-licenses.txt and the in-app Sound credits.

Verification:
- npm test
- npm run build (includes the explicit deployable-asset boundary)
- tools/verify-academy.mjs: 39 core decisions and 9 return checks, cue persistence, comparison, mobile, keyboard, reduced motion, storage/WebGL fallback.
- tools/verify-round.mjs: all 9 approach starts, subsequent shots, comparison, transfer, returns, 12 check variants and fallback.
- tools/verify-impact-teaching.mjs: impact reference, self-paced cause/effect, mirrored examples, unchanged assessed predictions.
- tools/verify-reading-flow.mjs: Tennis-style text rhythm and no preselected answers across old/new journeys.
- tools/redesign/verify-experience.mjs: recorded AudioContext events, mute, shared preferences, payoffs, My game deep links (run against Vite dev source).
Use BASE and PLAYWRIGHT_MODULE to select a built preview and installed browser runtime for the four general verification scripts.
Local evidence is kept under tools/redesign/qa (ignored).

Product validation still required: actual golfers on their phones, unprompted comprehension, next-day recall, physical-device audio/performance, and independent coaching review.
