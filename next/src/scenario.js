// Explicit catalogue. These authored examples require coaching and player validation.
export const VERSION = 'golf-next-2026-10-30.2';
export const COURSE = Object.freeze({
 id:'north-point', course:'North Point', start:{x:-10,z:148},
 green:{x:-3,z:0,rx:22,rz:25},
 bunker:{x:-29,z:23,rx:8,rz:11},
 modelNote:'12 authored finishes, not measured probabilities. Club distances and practice points belong to these fictional exercises. Ball flights illustrate a finish; they are not a physics simulation. No handicap or strokes-saved claim.'
});
export const SHOT_OFFSETS = Object.freeze([
 [1,1],[5,-6],[11,1],[2,5],[-4,10],[-9,7],[7,-10],[10,6],[-2,-5],[8,9],[0,-2],[-6,-12]
].map(([x,z])=>Object.freeze({x,z})));
const club=(id,name,z,sx=1,sz=1,bx=0,bz=0)=>({id,name,z,sx,sz,bx,bz});
const hole=(id,props)=>({id,pin:{x:-3,z:0},start:{x:-10,z:148},bunkers:[],trees:[],objective:'approach',initialAim:-3,shotIndex:0,...props});
const pinch=z=>[{x:-20,z,rx:7,rz:12},{x:0,z,rx:7,rz:12}];
export const LESSONS = [
 {id:'distance',number:'01',name:'The distance',teaser:'The number you can hit. The number you usually hit.',cue:'Plan with your normal carry, not your longest shot.',
 cases:[
  hole('distance-first',{title:'138 metres to the flag.',brief:'Clean lie. A front bunker begins about 120 m away. These club labels are intended carries; the dots show what this example player actually produces.',pin:{x:-3,z:10},clubs:[club('8i','8 iron',12,.75,.7,0,10),club('7i','7 iron',-2,.75,.7,0,10)],bunkers:[{x:-3,z:24,rx:19,rz:7}],insight:'The 8 iron has the right number on paper, but much of its actual pattern finishes short, in the bunker. The 7 iron moves the whole pattern onto the green.',transferNote:'New player. New carry pattern. A different bunker.',success:'You used the actual carry window.',alternative:'The longer club moves the short finishes past the front bunker.'}),
  hole('distance-transfer',{title:'A back bunker. A new player.',brief:'A different example player. Same front flag, but their shots carry closer to the intended number. The bunker is now behind the green. Inspect both patterns.',pin:{x:-3,z:10},clubs:[club('8i','8 iron',12,.7,.7),club('7i','7 iron',-11,.7,1.3)],bunkers:[{x:-3,z:-24,rx:21,rz:8}],insight:'Here the 8 iron already reaches the front flag. The 7 iron brings the rear bunker into the pattern. “Take more club” was never the rule.',success:'Your plan fits this player’s carry window.',alternative:'The shorter club already reaches this flag and keeps the rear bunker out of the sample.'})
 ]},
 {id:'shape',number:'02',name:'The shot shape',teaser:'The centre of your pattern may not be your aim line.',cue:'Move your aim for the pattern you bring.',
 cases:[
  hole('shape-first',{title:'Where is this pattern centred?',brief:'One club reaches the green. The white dots are this player’s 12 example finishes relative to the aim line. Choose where to place that pattern.',pin:{x:-1,z:0},clubs:[club('7i','7 iron',0,.7,.7,-10)],insight:'This pattern finishes left of its aim line. A target right of the flag can place the actual finishes nearer it. Moving the aim and moving the pattern are different things.',success:'You allowed for the leftward pattern.',alternative:'A rightward aim moves these leftward finishes toward the pin.'}),
  hole('shape-transfer',{title:'Same green. A different pattern.',brief:'This player’s finishes sit on the other side of the aim line. The flag has also moved left. Use the evidence shown below.',pin:{x:-7,z:1},clubs:[club('7i','7 iron',0,.7,.7,9)],insight:'This pattern finishes right of its aim line. A leftward aim brings the actual finishes back toward the flag, and away from the coast.',success:'You adapted to the opposite shot shape.',alternative:'A leftward aim brings this rightward pattern back toward the pin.'})
 ]},
 {id:'landing',number:'03',name:'The landing area',teaser:'A shorter club is only part of the safety calculation.',cue:'Choose the landing area before you choose the club.',
 cases:[
  hole('landing-first',{title:'Which landing area gives you room?',brief:'Lay-up from 260 m. Your task is to finish on fairway. Bunkers pinch the shorter landing area; the longer landing area is open. Compare each club’s width as well as its carry.',start:{x:-12,z:260},objective:'fairway',initialAim:-10,clubs:[club('5i','5 iron',100,.58,.65),club('5w','5 wood',65,1.05,.9)],bunkers:pinch(100),insight:'The 5 wood scatters more widely, but its landing area is wider too. The shorter, tighter pattern still has to fit between those bunkers.',success:'You matched the shot window to the available space.',alternative:'The longer landing area gives the wider pattern more room.'}),
  hole('landing-transfer',{title:'A different landing layout.',brief:'The longer landing area is now pinched by bunkers. The shorter area is open. Same clubs and same shot patterns; choose the area that fits.',start:{x:-12,z:260},objective:'fairway',initialAim:-10,clubs:[club('5i','5 iron',100,.58,.65),club('5w','5 wood',65,1.05,.9)],bunkers:pinch(65),insight:'Now the 5 iron’s tighter pattern fits the open fairway. The useful choice changed when the landing areas changed.',success:'Your plan fits the new landing window.',alternative:'The shorter landing area now gives this pattern clear fairway.'})
 ]},
 {id:'next-shot',number:'04',name:'The next shot',teaser:'A good finish can leave an awkward beginning.',cue:'Choose where the next shot begins.',
 cases:[
  hole('next-first',{title:'What will you leave yourself?',brief:'A two-shot practice game: first lay up, then play a straight ground-running approach. A route through the marked tree patch is blocked. Find fairway with an open route to the flag.',objective:'route',start:{x:-12,z:205},initialAim:-10,pin:{x:-3,z:0},clubs:[club('6i','6 iron',70,.65,.6)],trees:[{x:-11,z:30,rx:6,rz:8}],insight:'A finish on fairway is only half this task. The right side opens the straight running route around the tree patch. This is a constrained practice game, not advice to run every approach.',success:'You made room for the next shot.',alternative:'The right-hand fairway opens more running routes around this tree patch.'}),
  hole('next-transfer',{title:'Find the route again.',brief:'Same two-shot game. The tree patch is now on the right and the flag is on the left. Finish on fairway with a clear straight running route.',objective:'route',start:{x:-12,z:205},initialAim:-10,pin:{x:-8,z:0},clubs:[club('6i','6 iron',70,.65,.6)],trees:[{x:0,z:30,rx:6,rz:8}],insight:'The left side now opens the route. The cue is to look one shot ahead, not to keep choosing the same side.',success:'You found the new route to the flag.',alternative:'A leftward finish leaves more clear running routes in this setup.'})
 ]},
 {id:'pin',number:'05',name:'The invitation',teaser:'Some flags invite you closer. Some ask for restraint.',cue:'Protect the costly miss. Then use the opportunity.',
 cases:[
  hole('pin-first',{title:'How much of this flag would you take?',brief:'The pin sits near the coast. This club reaches the green. Set an aim line that balances proximity with room for the whole pattern.',pin:{x:11,z:-3},clubs:[club('7i','7 iron',0,1,1)],insight:'Aiming at this flag puts several ordinary finishes in the water. Moving left keeps more of the pattern on the green, even though the average ball finishes farther from the pin.',success:'You gave the costly miss some room.',alternative:'A little more room left of the pin protects the right-hand misses.'}),
  hole('pin-transfer',{title:'The flag is offering something different.',brief:'The flag has moved to the open left half. The club, water and shot pattern are unchanged. Decide whether the previous aim still serves you.',pin:{x:-9,z:0},clubs:[club('7i','7 iron',0,1,1)],insight:'The pattern can now sit closer to the pin without reaching water. Safety depends on the setup; it is not a permanent spot in the middle.',success:'You used the opportunity when the pin moved.',alternative:'A target closer to this open pin improves proximity without adding water finishes.'})
 ]},
 {id:'last-ball',number:'06',name:'The last ball',teaser:'A bad result. A good result. Two tempting conclusions.',cue:'Judge the plan by its pattern, not the last ball.',
 cases:[
  hole('outcome-first',{title:'That ball went in the water.',brief:'The last shot was the far-right outlier marked in the pattern below. The starting plan aimed near the centre. Keep it or change it after seeing all 12 finishes.',pin:{x:-3,z:0},clubs:[club('7i','7 iron',0,.8,.8)],outlier:{index:2,x:55,z:1},shotIndex:2,review:{club:'7i',aim:-6},insight:'The extreme right outlier reaches water from every available aim line. Moving the other eleven balls away from a useful target does not fix that miss. One bad finish is not enough to reject the plan.',success:'You protected the useful part of the pattern.',alternative:'The centre keeps the other eleven finishes useful; the outlier remains beyond every available aim line.'}),
  hole('outcome-transfer',{title:'That ball finished close.',brief:'The last shot finished close to this flag. The starting plan aimed near it. Keep it or change it after inspecting the full pattern; the highlighted dot is only one finish.',pin:{x:11,z:0},clubs:[club('7i','7 iron',0,1,1)],shotIndex:10,review:{club:'7i',aim:11},insight:'The close ball hid a plan that sends several ordinary finishes into water. This time a changed aim improves the whole pattern. A good result does not certify a good plan.',success:'You challenged the plan after a flattering result.',alternative:'Moving left protects ordinary misses even though the last ball looked good.'})
 ]}
];
export const CASES=LESSONS.flatMap(l=>l.cases);
export const APPROVED_SCENARIOS=Object.freeze(LESSONS.map(l=>l.id));

// Separate illustrative shot lesson; not a measured swing or proficiency score.
export const SHOT_LAB_LESSON = Object.freeze({
 id:'face-path', version:1, title:'The face. The path. The flight.',
 assumptions:'Right-handed iron · Centre strike · No wind',
 cue:'Read the face against the path—not just against the target.',
 cases:Object.freeze([
  Object.freeze({id:'face-path-first',label:'A surprising curve',face:8,path:18,question:'Where will this ball go?',situation:'The face points right of the target. The club travels even farther right.',correct:'left',explanation:'The face points right of the target, but left of the path. With a centre strike, the ball starts right and curves left.'}),
  Object.freeze({id:'face-path-transfer',label:'Same face. A new path.',face:8,path:-10,question:'And now—which way will it curve?',situation:'The face still points right of the target. This time, the club travels left.',correct:'right',explanation:'The face is now right of the path. With a centre strike, the ball starts right and curves farther right.'}),
 ]),
});

// Shotmaker: one fixed fictional hole. Geometry never changes between reads.
// Face/path signs are relative to the target for a right-handed, centred iron strike.
export const SHOTMAKER = Object.freeze({
 version:1, id:'shotmaker-1', name:'The Headland', distance:160,
 assumptions:'Right-handed iron · Centre strike · No wind',
 modelNote:'An authored flight illustration, not a launch monitor or a prediction of your swing. Carry is held at 160 m. Curvature is exaggerated for visibility. Lie, strike variation, wind and speed are held constant.',
 source:'https://www.trackman.com/blog/face-to-path',
 cases:[
  {id:'comeback',number:'01',title:'Bring it back.',subtitle:'Start right. Curve left. Find the green.',face:3,correct:6,
   question:'Which club path brings it back?',
   brief:'The face points 3° right of the flag at impact. Keep it there. Choose the direction the club moves through the ball.',
   options:[{path:0,title:'Straight at the flag',detail:'Club path · 0°'},{path:6,title:'Farther to the right',detail:'Club path · 6° right'},{path:-6,title:'Across to the left',detail:'Club path · 6° left'}],
   win:'That’s a draw.',loss:'The face needs a different partner.',
   insight:'The face can point right of the flag and still produce a draw. It must point left of the club’s path.',
   takeaway:'The face starts it. Face relative to path bends it.',compare:0},
  {id:'straight',number:'02',title:'Take out the curve.',subtitle:'Same face. A different intention.',face:3,correct:3,
   question:'Which path makes it fly straight?',
   brief:'Keep the face 3° right. This time, remove the curve—even if the ball finishes right of the flag.',
   options:[{path:6,title:'Farther to the right',detail:'Club path · 6° right'},{path:-3,title:'Across to the left',detail:'Club path · 3° left'},{path:3,title:'Match the face',detail:'Club path · 3° right'}],
   win:'Straight. But not at the flag.',loss:'There’s still a gap between face and path.',
   insight:'When face and path match, there is little curvature from their relationship. Both point right here, so the ball stays right.',
   takeaway:'A straight ball is not necessarily an on-target ball.',compare:6},
  {id:'mirror',number:'03',title:'Make the mirror image.',subtitle:'Start left. Fade it home.',face:-3,correct:-6,
   question:'Which path curves it back right?',
   brief:'Now the face points 3° left of the flag. Start the ball left and bring it back with a fade.',
   options:[{path:-6,title:'Farther to the left',detail:'Club path · 6° left'},{path:-3,title:'Match the face',detail:'Club path · 3° left'},{path:3,title:'Across to the right',detail:'Club path · 3° right'}],
   win:'You’ve seen both sides.',loss:'Read the face against the path again.',
   insight:'The face points left of the flag, but right of this path. That relationship produces the rightward curve.',
   takeaway:'Open or closed only makes sense when you say “relative to what?”.',compare:-3}
 ]
});

// The Nine extends the same illustrative flight model. These are target
// constraints, not prescriptions for the player's actual swing.
export const SHOTMAKER_NINE = Object.freeze({
 version:1,
 workshop:[
  {id:'build-draw',title:'Make the comeback.',brief:'The face is fixed 3° right. Set the club path to draw the ball back into the gold circle.',face:3,path:null,initial:[3,0],shape:'Draw',radius:4,
   cue:'To draw it, the face must point left of the path. Move the path right of the face, then find how much brings it home.'},
  {id:'build-fade',title:'Give it the other partner.',brief:'The path is fixed 6° left. This time, you control the face. Fade the ball into the gold circle.',face:null,path:-6,initial:[0,-6],shape:'Fade',radius:4,
   cue:'A fade needs the face right of the path. It can still point left of the flag. Find that space between the two.'},
  {id:'build-window',title:'Thread the window.',brief:'You control both directions. Pass through the teal window, then finish inside the gold circle. Set the start first; use the path to bring it back.',face:null,path:null,initial:[0,0],gate:[1.2,1.8],radius:4,
   cue:'The face mostly sets the start. A path farther right makes the ball bend back left. Change one control at a time.'}
 ],
 pressure:[
  {id:'card-right',title:'A different draw.',brief:'The path is fixed 5° right. Set the face to start right and draw back inside 3 metres. One shot goes on your card.',face:null,path:5,initial:[0,5],shape:'Draw',gate:[1.1,2.7],radius:3},
  {id:'card-left',title:'Turn it around.',brief:'The face is fixed 2° left. Choose a path that starts left, then fades back inside 3 metres. One shot.',face:-2,path:null,initial:[-2,0],shape:'Fade',gate:[-2.7,-1.1],radius:3},
  {id:'card-window',title:'The smallest window.',brief:'Both controls are yours. Pass through the smaller teal window, then finish inside 2 metres. Make this one count.',face:null,path:null,initial:[0,0],gate:[.55,1.1],radius:2}
 ]
});
