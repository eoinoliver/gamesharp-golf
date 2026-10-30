# GameSharp Golf Next — first playable scene

A clean application built from the verified live baseline `771677f`. The runtime source is exclusively `next/`; Vite produces `dist/`, and only `dist/` is deployed. The old root site remains as historical reference in Git. It is not copied into the build. This is a preview, not a production promotion.

## Run

Node 22.12+ (Vercel project: Node 24), then `npm ci`, `npm test`, `npm run build`. `npm run dev` serves http://127.0.0.1:5174. `npm run preview` serves the production bundle on that port. Stop the dev server before using preview.

## The complete lesson

North Point is an original, procedural coastal approach hole. The learner chooses flag or middle, commits, watches one selected good shot, reveals the same 12 authored finishes, then compares the alternative target. The pin moves to the open half for a second decision. The learner saves one next-round cue and can replay.

The shot pattern is an authored teaching example. No measured probabilities, personal shot data, strokes-gained model or swing physics are implied. Every comparison translates the identical 12 offsets. With the water-side flag, flag produces four water finishes and middle produces none. With the open flag, neither reaches water and the flag centres the same pattern closer to the pin. Outcome markers above water have stems to preserve visibility behind the raised bank.

The first animated shot is deliberately a good finish, included in the 12. Its job is to expose the difference between one lucky outcome and a sensible target. The flight arc is visual illustration, not a calibrated ball-flight model.

## Source ownership

- `next/src/scenario.js`: version, single approved lesson, targets and sample.
- `next/src/model.js`: consistent water/green geometry, sample translation and coaching.
- `next/src/scene.js`: Three.js renderer, procedural environment, ball, camera, flag, water and outcome markers.
- `next/src/main.js`: learner journey, accessible controls, SVG fallback and session export.
- `next/src/state.js`: a separate versioned storage key; first attempts cannot be overwritten by replay.
- `next/src/audio.js`: opt-in generated audio; no media licence dependencies.
- `tools/check-next-build.mjs`: output whitelist and legacy-content boundary.

No old question packs, technical advice, scores, navigation, service worker or prototypes are imported. The new preview does not register a service worker. Before any eventual promotion to the old production origin, explicitly handle retirement of the old origin's service worker and cached pages. A new preview origin avoids that migration issue but does not solve it for production.

## Validation boundary

Six Node tests cover identical sample reuse, changed-pin reversal, the illustrated ball, first-attempt preservation, storage failure/version isolation, and the single-lesson manifest. The production build checks the publication boundary. Browser checks cover both choices in both decisions, full completion, cue persistence across reload, replay preservation, keyboard activation, reduced motion, phone layout and the simple overhead mode.

These are desktop browser tests, including a 390×844 viewport override. They are not physical iPhone/Android performance tests, coach approval, learning efficacy or evidence of demand. The opt-in audio controls have been inspected for operation; audio quality needs human listening on a device.

## Next decision

Review this first complete loop before adding more lessons. The next two outcome-changing checks are (1) a qualified coach reviewing the target/dispersion explanation, and (2) five golfers trying it without guidance on their own phones and explaining the changed-pin decision. Record first attempts, unprompted explanation, willingness to replay, and a follow-up after a real round. Local session export supports a manual consented pilot; there is no centrally collected analytics backend.
