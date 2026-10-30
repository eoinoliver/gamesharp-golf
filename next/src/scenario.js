// Explicit catalogue: only this reviewed-for-structure pilot is eligible.
export const VERSION = 'golf-next-2026-10-30.1';
export const SCENARIO = Object.freeze({
  id: 'the-flag-isnt-the-target',
  title: 'The flag isn’t the target.',
  course: 'North Point',
  subtitle: 'An original coastal practice hole',
  distance: 145,
  start: { x: 0, z: 142 },
  green: { x: -3, z: 0, rx: 22, rz: 25 },
  rounds: [
    { id: 'protected-pin', pin: { x: 11, z: -8 }, title: 'A tempting flag. An expensive miss.', prompt: 'Where would you aim?', situation: '145 metres. A clean fairway lie. The flag is close to the water on the right.', cue: 'Give your normal misses somewhere to finish.' },
    { id: 'open-pin', pin: { x: -8, z: -3 }, title: 'The flag moved. Does your plan?', prompt: 'Same club. Same shot pattern. Your target?', situation: 'The flag is now on the left half. There is room around it, and the water has not moved.', cue: 'Protect the costly miss. Then use the opportunity.' },
  ],
  profile: 'Assume this club reaches the green. The dots show an example pattern, not your measured shots.',
  modelNote: 'An authored teaching example: 12 fixed shot offsets, reused for every target. These are possible finishes, not measured probabilities or a prediction of your game. The hole is fictional. No handicap or strokes-saved claim.',
});
// Metres relative to target. Same errors for both targets and both pin positions.
export const SHOT_OFFSETS = Object.freeze([
  {x:1,z:1}, {x:5,z:-6}, {x:11,z:1}, {x:2,z:5},
  {x:-4,z:10}, {x:-9,z:7}, {x:7,z:-10}, {x:10,z:6},
  {x:-2,z:-5}, {x:8,z:9}, {x:0,z:-2}, {x:-6,z:-12},
].map(Object.freeze));
export const APPROVED_SCENARIOS = Object.freeze([SCENARIO.id]);
