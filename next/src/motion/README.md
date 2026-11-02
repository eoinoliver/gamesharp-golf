# Shot Lab motion provenance

This is a visual learning prototype, pending coaching review. It does not analyse
the learner's swing and must not be presented as measured club delivery.

## Body source

CMU Graphics Lab Motion Capture Database, subject 64, take 01 (golf swing):
https://mocap.cs.cmu.edu/search.php?subjectnumber=64

The data used in this project was obtained from mocap.cs.cmu.edu. The database
was created with funding from NSF EIA-0196217.

CMU's published use conditions permit use in products, including commercial
products, with attribution. They do not permit resale of the database, including
in converted form. This application includes a derived body-motion sample as part
of an interactive lesson; it does not distribute a standalone motion pack.
Review https://mocap.cs.cmu.edu/ and its FAQs before expanding distribution.

Source checksums (SHA256):

- `64.asf`: `931aa1defb080cb8487817b92138cfc042d6bb5c2e84aecc7da0da3af20cd585`
- `64_01.amc`: `ef1380e6ba40e97ad2b6aa9e1def83767d24f8e2b02d2d59049ad829c19ee23f`

## Reproduction

With Blender installed and the two source files in a local directory:

```sh
blender --background --python tools/build-golf-motion.py -- \
  --source-dir /path/to/cmu \
  --output next/src/motion/cmu-64-01.json
```

Generated with Blender 5.2.2 LTS. The converter evaluates the ASF bone hierarchy
and axis rotations against AMC channels, converts units to metres, and aligns
the address pose to a stable local frame. It exports 448 frames, 31 joints at
120 Hz. The browser displays frames 135–447 with interpolation, including an
authored impact marker at frame 334. These markers are editorial, not detected
club/ball contact from the capture. This is joint-position processing in Blender,
not a validated biomechanical reconstruction.

## Authored elements and limits

- The connected character is a tailored derivative of Quaternius Universal Base
  Characters Standard (CC0): https://quaternius.com/packs/universalbasecharacters.html.
  The original license is retained in `assets/QUATERNIUS-LICENSE.txt`.
- `tools/build-golf-player.py` imports the male base in Blender, makes clothing,
  poses real finger bones around a diagonal grip cylinder, bakes the hand pose
  into the bind skeleton, and exports a self-contained GLB. No legacy app assets
  or unselected files from the source pack are shipped.
- The iron has one rigid transform for the handle, shaft, hosel and lofted head.
  Its orientation uses a continuous transported frame, corrected to the lesson's
  face bearing at impact. The club motion is authored; it is not measured mocap.
- Both hands use fixed anchors on that rigid grip. Two-bone arm IK maintains
  30 cm upper-arm and forearm lengths; the common grip is projected into the
  arms' reach instead of stretching an arm. These are character proportions,
  not inferred measurements of the captured athlete.
- A small authored contact window follows each lesson's path. At impact the
  authored sweet spot on the lofted face is tangent to the ball, and its horizontal normal matches
  the displayed face angle. The body reference remains shared between examples.
- Player, Grip and Club cameras inspect the same world geometry and timeline.
  Do not teach the character's grip or technique from this study.
- Face and path angles are deliberately exaggerated examples. They are never
  described as measurements of the capture or of a learner.
- The flight is an illustrative curve. Its face/path launch weighting, height,
  distance and curvature are not a calibrated simulation or measured shot.
- The lesson assumes a right-handed iron, centre strike and no wind. It excludes
  gear effect, lie, turf, individual technique and off-centre contact.
- The product hypothesis is transfer of a concept: hold face direction constant,
  change path, then ask for a fresh prediction. First attempts are preserved
  separately from practice in `gamesharp-golf-shot-lab-v1`.
- No voice coaching, video upload, personal diagnosis, server analytics or
  commercial motion-capture service is connected.

## Next approval gate

Before calling this instruction-ready, a qualified golf coach should review the
lesson's conditions, explanations, illustrative delivery and rendered contact.
Before investing in more shots, test whether golfers can explain and transfer
the concept after using this one. Browser QA alone establishes neither result.

## Character rebuild and verification

Download the free Standard pack from the official Quaternius page, extract it, then:

```sh
blender --background --python tools/build-golf-player.py -- \
  --source-dir '/path/to/Universal Base Characters[Standard]' \
  --output next/src/motion/assets/golf-player.glb \
  --blend-output /path/to/golf-player.blend
```

With the dev server running and Playwright installed, run:

```sh
node tools/verify-shot-rig.mjs
```

`PLAYWRIGHT_MODULE` can point to an existing Playwright module; `RIG_URL` can
select a different local dev server. The browser test checks all 313 frames of
both deliveries: arm lengths, finger joints on the grip cylinder, continuous
club orientation, centred impact and agreement with the lesson's face bearing.
The inspection hook is guarded by `import.meta.env.DEV` and omitted from the
production bundle. Numerical checks supplement visual inspection; they do not
validate golf technique or learning transfer.
