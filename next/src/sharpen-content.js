export const OBSERVATIONS={
 'driver-flight':{title:'Separate start, curve and contact',cue:'Name the start and the bend separately.',practice:'At practice, use one clear target. Note the club and whether you play right- or left-handed. For five comfortable shots, record start left / on line / right, curve left / none / right, and contact if you can observe it. This is evidence to discuss with a coach, not a swing diagnosis.'},
 contact:{title:'Locate the inconsistency',cue:'Notice contact before choosing a correction.',practice:'In a practice area, note the club, lie and where the ball first contacts the face or ground when observable. Describe what changed across several shots. A thin or heavy result alone does not identify a body or grip fault.'},
 'putt-start':{title:'Separate start from read',cue:'Did it start on the line you chose?',practice:'Choose a short practice putt and a visible intended start line. Notice whether the ball starts on that line before judging the read. If the start varies, keep that observation for a putting lesson; do not infer a stroke fault from the miss alone.'},
 'bunker-escape':{title:'Make the escape observable',cue:'Separate getting out from distance after escape.',practice:'During a supervised practice session, note the lie, lip and whether the ball escapes before judging its final distance. This app does not yet model your bunker strike. Take those observations to a qualified coach.'},
};
const learn=(id,label,detail)=>({id,label,detail,href:`?learn=${id}`});
const course=(id,label,detail)=>({id,label,detail,href:`?view=library&read=${id}`});
const observe=(id,label)=>({id,label,observation:id,detail:OBSERVATIONS[id].title});
export const ZONES=[
 {id:'tee',number:1,title:'Off the tee',line:'Club, corridor and commitment.',position:[30,85],choices:[
  learn('tee-club-window-v1','I clubbed down and still found trouble','Compare what each club removes and leaves.'),
  course('landing','The fairway felt too narrow','Find where the landing area gives your pattern room.'),
  observe('driver-flight','My driver flight surprised me'),
  learn('reset-the-decision-v1','Nerves changed my plan','Separate new evidence from a new feeling.')
 ]},
 {id:'recovery',number:2,title:'Recovery & fairway',line:'Read the lie and find a route.',position:[66,68],choices:[
  learn('recovery-window-v1','I could see the green, but hit the trees','Check the opening in width and height.'),
  learn('reread-the-wind-v1','The wind fooled me after the turn','Read the air against the new target.'),
  learn('nearest-complete-relief-v1','I was unsure about free relief','Find the reference before choosing a drop.'),
  course('next-shot','My escape left another blocked shot','Consider the route for the shot after this one.')
 ]},
 {id:'approach',number:3,title:'Approach',line:'Carry, pattern and the tempting flag.',position:[37,46],choices:[
  course('distance','My normal shot finished short','Separate your ordinary carry from your best.'),
  course('shape','My usual miss found the trouble','Place the whole pattern in playable space.'),
  course('pin','I was unsure whether to attack','Check when the flag fits the available pattern.'),
  learn('start-and-bend','Help me understand an iron flight','A centred, right-handed iron example in still air. It explains a relationship, not your swing.')
 ]},
 {id:'green',number:4,title:'Around the green',line:'First bounce. Then the finish.',position:[62,28],choices:[
  learn('landing-not-hole','The chip landed well, then ran too far','Choose the bounce for the finish you want.'),
  learn('carry-the-trouble','My low shot never reached the green','Check what the flight must carry.'),
  learn('surface-changes','The same chip behaved differently','Look at the first-bounce surface.'),
  observe('bunker-escape','Getting out of sand is the problem'),
  observe('contact','My contact keeps changing')
 ]},
 {id:'putting',number:5,title:'Putting',line:'Read the line. Control the next putt.',position:[44,12],choices:[
  learn('distance-before-perfection','My first putt left too much work','Judge the whole set, not the one that dropped.'),
  learn('pace-and-line','Should I hit that breaking putt firmer?','See how pace and line work together.'),
  learn('same-distance-new-slope','The distance felt right, but the pace did not','Account for uphill and downhill.'),
  observe('putt-start','I cannot tell if it was my start or my read'),
  learn('match-objective-v1','What does this putt mean for the match?','Read the opponent’s score and the result you need.')
 ]}
];
export const zoneById=id=>ZONES.find(z=>z.id===id);
export const choiceById=(zone,id)=>zoneById(zone)?.choices.find(c=>c.id===id);
