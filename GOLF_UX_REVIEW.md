# GameSharp Golf — simplicity and motion review

## Home-screen root cause

The mobile hero previously changed from a large 5:4 image to a 92px strip after 1.8 seconds. Pointer-down, touch-move and scroll also triggered the same height change. The resulting layout shift moved content underneath the user's finger and could make the page feel unstable or unresponsive.

The hero is now a stable 96px brand strip in portrait and 72px in short landscape. It never changes height in response to time, touch or scroll. On a 320x568 viewport the inner home surface scrolls normally while the hero remains 96px. Re-selecting the active Today tab now returns that surface to the top.

## Jobs-style hierarchy

Home now follows the Tennis hierarchy with exactly two immediate actions: today’s decision and `Play a Hole`. The golf-hole image is the sporting canvas rather than another content card. The 19th Hole and secondary formats no longer compete on Today; their underlying journeys remain available contextually elsewhere. No learning or scoring logic was duplicated.

Daily Complete already follows the same hierarchy: Today's Edge and one primary `Use it now` action are visible; rationale and secondary actions are progressively disclosed. Sharpen likewise shows three human intentions, one focus and one primary test. Profile/Review remains the secondary destination for progress and the broader library.

All bottom-navigation instances are now semantic buttons, the profile icon has an accessible name, and the active tab follows the familiar mobile convention of returning to the top when tapped again.

## Structural prevention

`gamesharp-golf-ux-contract.test.mjs` fails if automatic home collapse returns, touch or scroll becomes a layout trigger, home exposes more direct play choices, decision runs escape progressive disclosure, bottom navigation regresses to non-semantic controls, active-tab reset disappears, or landscape compaction is removed.

The launch-trust, Sharpen structural and semantic routing contracts continue to pass unchanged.

## Release state

Audited locally at 320x568, 390x844 and 844x390. The 320px surface scrolls from 0 to its available extent, keeps the hero at 96px throughout, and returns to 0 when Today is tapped again. Production publication was explicitly approved for this combined release.
