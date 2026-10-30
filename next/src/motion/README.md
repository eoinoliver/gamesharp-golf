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
not a GLB character export or a validated biomechanical reconstruction.

## Authored elements and limits

- The visible character, clothing, joint volumes, grip and club were authored in
  Three.js. The capture contains no club or complete finger grip.
- Club direction is keyed. A small authored contact window follows each lesson's
  specified path; hand placement adapts to keep contact with the shaft. The body
  reference is shared between examples. Do not teach the character's technique.
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
