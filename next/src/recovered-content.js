// Selective recovery: original situations, not an import of legacy questions or scores.
const option=(text,why,demo)=>({text,why,...(demo?{demo}:{})});
const question=(situation,prompt,options,correct,explanation,visual,watch)=>({situation,question:prompt,options,correct,explanation,visual,watch});
const lesson=(id,title,line,cue,practice,misconception,source,questions,extra={})=>({id,category:'course',title,line,cue,practice,misconception,source,questions,minutes:4,...extra});
export const RECOVERY_IDS=['tee-club-window-v1','reset-the-decision-v1','recovery-window-v1','reread-the-wind-v1','nearest-complete-relief-v1','match-objective-v1'];
export const RECOVERY_SOURCES={
 strategy:{label:'Shot Scope · Distance, accuracy and the next shot',url:'https://shotscope.com/au/wp-content/uploads/2024/10/eBook-6-How-to-analyse-your-stats.pdf'},
 routine:{label:'PGA · Range session: game planning',url:'https://www.pga.com/story/range-session-game-planning'},
 wind:{label:'APS · Wind direction and golf-ball flight',url:'https://meetings-archive.aps.org/dfd/2020/w01/3/'},
 relief:{label:'R&A · Rule 16.1: abnormal course conditions',url:'https://www.randa.org/rog/the-rules-of-golf/rule-16'},
 match:{label:'R&A · Rule 3.2: match play',url:'https://www.randa.org/rog/the-rules-of-golf/rule-3'},
};
const cloud=(z,side=1)=>[[-10,z-8],[-4,z+2],[3,z-4],[9,z+5],[17,z+9],[5,z+12]].map(([x,y])=>({x:x*side,z:y}));
const clubs=(side=1)=>[{name:'Driver',points:cloud(250,side),leave:125},{name:'3-wood',points:cloud(225,side),leave:150},{name:'Hybrid',points:cloud(200,side),leave:175}];
export const inTrouble=(point,boundary)=>!!boundary&&point.z>=boundary.from&&point.x*(boundary.side==='left'?-1:1)>=boundary.edge;
export const clubEvidence=(v,index)=>({trouble:v.clubs[index].points.filter(p=>inTrouble(p,v.boundary)).length,total:v.clubs[index].points.length,leave:v.clubs[index].leave});
function tee(situation,prompt,boundary,correct,explanation,why,side=1){const visual={type:'course-plan',kind:'tee',clubs:clubs(side),boundary,max:290};return question(situation,prompt,visual.clubs.map((c,i)=>option(c.name,why[i],{club:i})),correct,explanation,visual,'Compare all six finishes for each club with the white boundary.');}
const context=(kind,title,cards)=>({type:'decision-context',kind,title,cards});
const fact=(label,value,detail='')=>({label,value,detail});
const response=(text,why,title,detail,focus=0)=>option(text,why,{title,detail,focus});
function recovery({situation,ceiling,forwardHeight,forwardWidth,requiredWidth,sideOpen,correct,why}){
 const visual={type:'course-plan',kind:'recovery',ceiling,forwardHeight,forwardWidth,requiredWidth,sideOpen};
 return question(situation,'Which route fits the available shot?',[
  option('Play the low shot towards the green',why[0],{route:'forward'}),
  option('Chip sideways through the opening',why[1],{route:'side'}),
  option('Pitch over the trees towards the green',why[2],{route:'over'})
 ],correct,`Compare both width and height. The rehearsed low shot needs ${requiredWidth} m of width and is ${forwardHeight} m high at the branches; the forward opening is ${forwardWidth} m wide with ${ceiling} m of clearance. The trees are too tall for the available pitch.`,visual,'Read the opening, then the shot that has to fit through it.');
}
export function windRelation(heading,windTo){const relative=((windTo-heading)%360+360)%360;return ({0:'Helping',90:'Left to right',180:'Into you',270:'Right to left'})[relative];}
function wind(situation,previous,heading,windTo){const names=['Helping','Into you','Left to right','Right to left'],answer=windRelation(heading,windTo);return question(situation,'Relative to the new target, which way is the wind blowing?',names.map(name=>option(name,name===answer?`The new target arrow and wind arrow show ${answer.toLowerCase()} wind.`:'Read the wind against the new target arrow, not the previous hole.',{relation:name})),names.indexOf(answer),'The wind has not changed its compass direction. Your direction of play has changed. Reassess the wind before choosing a club or target; this diagram does not predict a yardage adjustment.',{type:'course-plan',kind:'wind',previous,heading,windTo},'The turquoise arrow is where the air is moving. Gold is your new target.');}
export function matchResult(lead,holeResult,remaining=0){const next=lead+holeResult;return Math.abs(next)>remaining?(next>0?'Match won':'Match lost'):remaining===0?'All square — extra holes':'Match continues';}

export const RECOVERED_LESSONS=[
 lesson(RECOVERY_IDS[0],'Does less club remove the danger?','A shorter shot can buy safety. Sometimes it buys only a longer approach.',
  'What trouble does this club actually remove?',
  'Before one tee shot, name the hazard a shorter club would remove and the next shot it would leave. If you do not know your pattern, observe it rather than inventing a distance.',
  'A shorter club is automatically the safer useful choice.','strategy',[
   tee('A par 4. Out of bounds begins on the right at 220 m. These are six supplied finishes per club, including roll. Every approach distance shown is comfortable for this player.','Which club removes OB from this supplied set?',{side:'right',from:220,edge:12},2,'The hybrid set stops before this stretch of OB. Both longer clubs still have a finish beyond the boundary. The 175 m approach is the price of removing that particular danger.',[
    'Driver leaves the shortest approach, but one supplied finish crosses OB.','The 3-wood gives up distance while still reaching this OB boundary.','All six hybrid finishes stop short of the OB section. The next shot remains within the stated comfortable range.']),
   tee('A different par 4. No penalties or blocked routes in any of these landing areas; the light rough is playable. The three sets have the same sideways spread.','Which club leaves the shortest approach without adding trouble in the supplied set?',null,0,'All eighteen finishes are playable. Here, the shorter clubs do not remove a hazard. Driver leaves 125 m instead of 150 m or 175 m. This is a comparison of these examples, not a universal driver rule.',[
    'Driver leaves 125 m, and all six supplied finishes stay playable.','All six are playable, but it leaves 25 m more than driver without removing trouble.','It leaves 50 m more than driver, with no removed hazard in this example.']),
   tee('Now the right-side OB section begins at 240 m. The shorter two sets stop before it. All the resulting approaches are comfortable.','Which club removes OB while leaving the shorter approach?',{side:'right',from:240,edge:12},1,'The 3-wood now stops before the OB section and leaves 150 m. Hybrid also removes OB, but leaves 175 m. The relevant boundary changed; the club name did not.',[
    'One driver finish still crosses the OB boundary.','All six 3-wood finishes stop short of this OB section, and it leaves less distance than hybrid.','Hybrid removes OB too, but gives up another 25 m unnecessarily for this stated task.']),
   tee('Fresh hole: OB is on the LEFT, beginning at 240 m. These supplied finish patterns extend left. The remaining approaches are all comfortable.','Which club removes OB and keeps the shorter next shot?',{side:'left',from:240,edge:12},1,'The side has changed, but the decision is the same: compare the actual finish window with the actual boundary, then consider the shot left.',[
    'The driver set still includes a finish across the left OB boundary.','The 3-wood set stops before this OB section and leaves 150 m.','Hybrid also stops short, but leaves 175 m.'], -1)
  ]),
 lesson(RECOVERY_IDS[1],'Keep the plan. Or change the evidence?','Nerves and new information ask different things of you.',
  'Has the situation changed, or only how I feel?',
  'After a difficult hole, pause before choosing the next target. Name any actual change in lie, conditions or available shot. Use your familiar routine once the plan fits.',
  'Feeling nervous means the plan is wrong; sticking to a plan means ignoring new facts.','routine',[
   question('First tee. Your chosen hybrid clears the required carry comfortably and finishes short of the bunker. The wind and lie are unchanged, but your heart is racing.','What needs adjusting now?',[
    response('Choose a shorter iron','It no longer clears the required carry comfortably. A smaller club does not solve the feeling.','A new problem','The carry margin shrinks.',0),
    response('Keep hybrid; begin the familiar routine','The plan still fits the evidence. Use the routine you have practised to organise the start.','The plan still fits','Nerves changed; carry and bunker did not.',2),
    response('Add a swing correction','There is no new strike evidence here to justify changing technique.','No new strike evidence','A feeling alone does not identify a swing fault.',2)
   ],1,'A feeling is information about your state, not proof that the club is wrong. Recheck the actual constraints, then use the routine you know.',context('routine','First-tee check',[fact('Carry','Comfortable'),fact('Bunker','Beyond hybrid'),fact('Changed','Nerves only')]),'Separate the shot’s constraints from the feeling before it.'),
   question('You picked hybrid on the range. On the tee a sustained headwind has strengthened; your normal carry may no longer clear the water.','What should happen before committing?',[
    response('Keep hybrid to protect commitment','Commitment does not restore a lost carry margin.','Conditions changed','The original carry margin is uncertain.',1),
    response('Use the same club and swing harder','That replaces a known shot with an untested one.','An untested replacement','Extra effort is not a verified carry.',1),
    response('Reassess the carry and choose a fitting plan','This is new information that changes whether the original plan fits.','A useful reset','Recheck carry before committing.',1)
   ],2,'Consistency means using a sound decision process. It does not mean repeating a club after the conditions change.',context('routine','A real change',[fact('Earlier','Light wind'),fact('Now','Stronger headwind'),fact('Carry margin','Uncertain')]),'Look for the fact that changed since the original decision.'),
   question('You just three-putted. On the next tee, driver and its normal landing pattern fit the open fairway. No conditions have changed.','Which response fits the new hole?',[
    response('Keep the driver plan and normal routine','The previous score has not changed the new hole’s constraints.','A separate decision','The current hole still supports driver.',1),
    response('Choose an iron to steady the card','It changes the strategy because of the previous result, not the available landing room.','Distance given away','The shorter club removes no new danger here.',1),
    response('Aim closer to the green-side trouble','Trying to recover the lost strokes changes the target without improving the evidence.','A narrower margin','The previous three-putt does not widen this target.',0)
   ],0,'A reset is not automatically a lay-up. Apply the same process to the hole in front of you.',context('routine','The next hole',[fact('Previous hole','Three-putt'),fact('Current landing','Open'),fact('Conditions','Unchanged')]),'Compare the previous result with the current landing area.'),
   question('A cautious target was sensible in the morning. On this return visit the hole is shorter from a forward tee, and your normal pattern fits the wider landing area. You still feel nervous.','What deserves a fresh decision?',[
    response('The nerves: automatically take less club','That would let the feeling decide before checking the new opportunity.','Feeling versus facts','Nerves do not erase the wider landing area.',2),
    response('The new tee and landing area','Those facts change the available shot. Reassess, then commit using your usual routine.','New evidence','Reconsider the plan for today’s tee.',1),
    response('Nothing: repeat the morning plan','That overlooks actual changes in the shot’s constraints.','An old answer','The tee and landing area have changed.',1)
   ],1,'Retain the process, not yesterday’s answer. A changed situation can justify more room to attack as well as more caution.',context('routine','New tee. New decision.',[fact('Tee','Forward'),fact('Landing','Wider'),fact('Feeling','Still nervous')]),'Which changes alter the shot itself?')
  ]),
 lesson(RECOVERY_IDS[2],'Does your escape actually fit?','Read the opening in two dimensions before choosing the route.',
  'Check the lie, the width and the ceiling.',
  'From trouble, identify one playable exit before considering the green. Check the lie and space needed for a shot you have actually rehearsed.',
  'A visible route to the green is necessarily a playable route.','strategy',[
   recovery({situation:'Clean lie under trees. Your rehearsed low shot is 2 m high at the branches and needs a 6 m-wide opening. The forward opening is 8 m wide but only 1.5 m high. A broad sideways chip is clear. The available pitch cannot clear the trees.',ceiling:1.5,forwardHeight:2,forwardWidth:8,requiredWidth:6,sideOpen:true,correct:1,why:['The width fits, but the shot reaches the branches: 2 m into 1.5 m of clearance.','The broad sideways opening fits a simple chip and leaves the next shot in the fairway.','This player’s available pitch cannot clear the tree tops.']}),
   recovery({situation:'Same clean lie and rehearsed low shot. This time the forward opening is 8 m wide and 3 m high, with playable fairway beyond. A sideways chip is also clear. Which route keeps useful forward progress?',ceiling:3,forwardHeight:2,forwardWidth:8,requiredWidth:6,sideOpen:true,correct:0,why:['Both constraints fit: 6 m of required width within 8 m, and 2 m of height below 3 m.','It gets out, but the stated low forward shot now fits and advances towards the green.','The trees are still too tall for the available pitch.']}),
   recovery({situation:'The branches are 3 m high, but the forward gap has narrowed to 4 m. Your rehearsed low shot still needs 6 m of width. The broad sideways exit remains clear.',ceiling:3,forwardHeight:2,forwardWidth:4,requiredWidth:6,sideOpen:true,correct:1,why:['Height fits; width does not. The 6 m shot window exceeds the 4 m gap.','The sideways opening avoids asking for a narrower shot than the player has rehearsed.','The available pitch still does not clear the tree tops.']}),
   recovery({situation:'Fresh recovery: clean lie, a 7 m-wide forward opening with 2.5 m of clearance, and playable ground beyond. Your rehearsed shot needs 5 m of width and reaches 1.5 m at the branches. A sideways exit is clear.',ceiling:2.5,forwardHeight:1.5,forwardWidth:7,requiredWidth:5,sideOpen:true,correct:0,why:['The supplied width and height both fit, so this route keeps forward progress.','A playable exit, but it gives up forward progress when the supplied low shot already fits.','The available pitch cannot clear the trees.']})
  ]),
 lesson(RECOVERY_IDS[3],'The wind did not turn. You did.','Read the air against this target, not the previous hole.',
  'New target. Fresh wind read.',
  'When the course changes direction, reassess the wind relative to your target. Use available course clues; do not assume a ground-level observation describes the whole flight.',
  'A helping wind on one hole is a helping wind on the next.','wind',[
   wind('The previous hole played north with a wind moving north. The new hole plays east. The compass direction of the wind is unchanged.',0,90,0),
   wind('The last hole played east. The next plays south. Air is still moving south across the course.',90,180,180),
   wind('Now you turn to play west. The air is moving east; the wind has not changed while you walked between holes.',180,270,90),
   wind('Fresh read: the previous hole played west; the new target is north. The air is moving east.',270,0,90)
  ]),
 lesson(RECOVERY_IDS[4],'Nearest does not mean nicest.','Relief changes the reference point, not the rules to suit the lie.',
  'Find complete relief first. Then measure.',
  'For cart-path relief in the general area, identify the nearest point of complete relief for the intended stroke before measuring. Check the current rule and local rules if uncertain.',
  'Free relief lets you choose the more attractive side.','relief',[
   question('Your ball is on an artificially surfaced cart path in the general area. For the intended stroke, A is the nearest point of complete relief; B is farther away on fairway. Neither is nearer the hole.','Where does the free-relief procedure start?',[
    option('At B, on the fairway','The nicer surface does not replace the nearest point.',{point:'B'}),option('At A, the nearest complete relief','Use A as the reference point, then determine the permitted relief area.',{point:'A'}),option('At the ball on the path','The original ball position is not the reference point for this procedure.',{point:'ball'})
   ],1,'Rule 16.1b uses the nearest point of complete relief as the reference, with a one-club-length relief area in the general area, not nearer the hole.',{type:'relief',kind:'nearest',nearest:'A'},'Compare complete relief with the more attractive surface.'),
   question('A gives complete relief, but it is in rough. You could also play the ball from the path. This is not a no-play zone.','Must you take free relief?',[
    option('Yes, because the path interferes','Ordinary relief here is optional.',{point:'A'}),option('No; choose the fairway point instead','Declining relief does not create a right to use a different reference point.',{point:'B'}),option('No; playing it as it lies remains an option','You can decline this optional relief.',{point:'ball'})
   ],2,'Free does not necessarily mean preferable. Consider the available options before lifting the ball.',{type:'relief',kind:'optional',nearest:'A'},'A legal relief position need not improve the lie.'),
   question('You found A, the nearest point of complete relief. Area X is within one club-length, in the general area, not nearer the hole and gives complete relief. Area Y is also within one club-length but nearer the hole.','Which area meets the stated limits?',[
    option('Area X','It meets all the supplied limits.',{point:'X'}),option('Area Y','Being within one club-length does not permit a spot nearer the hole.',{point:'Y'}),option('Either area','Both distance and the other relief-area limits must be satisfied.',{point:'both'})
   ],0,'The radius alone is insufficient: the ball must be dropped in, and come to rest in, the permitted relief area.',{type:'relief',kind:'area',nearest:'A'},'Read the no-nearer-the-hole boundary as well as the radius.'),
   question('Fresh case, reversed sides: B is now the nearest point of complete relief for the intended stroke; it is in rough. A is farther away on fairway. Neither is nearer the hole.','Which reference point applies if you take this relief?',[
    option('A','Its fairway lie does not make it the nearest complete-relief point.',{point:'A'}),option('B','Use the stated nearest complete-relief point, then measure the permitted area.',{point:'B'}),option('Whichever side gives the easier next shot','That is not the test for selecting the reference point.',{point:'both'})
   ],1,'Reversing the picture does not change the procedure.',{type:'relief',kind:'nearest',nearest:'B'},'Find the reference from the stated stroke, not a remembered side.')
  ],{category:'rules'}),
 lesson(RECOVERY_IDS[5],'What does this hole need from you?','Your opponent’s score can change the job of the same putt.',
  'Read the match, the opponent and the shots left.',
  'In match play, establish the match score, holes remaining and opponent’s position before deciding what outcome you need. A must-win hole alone does not justify every aggressive shot.',
  'Winning the last hole always wins the match; a must-win situation automatically means attack.','match',[
   question('Last hole, scratch singles. You are one up. Your opponent has finished in 4. You lie 3 on the green. A tied match would go to extra holes.','What does holing this next putt achieve?',[
    response('Wins the hole and the match','Four ties this hole; it does not win the hole.','Hole tied. Match won.','You retain the one-hole lead.'),
    response('Ties the hole and wins the match','Your 4 matches their 4; your existing lead remains.','Hole tied. Match won.','You finish one up.'),
    response('Ties the match; extra holes','That would require losing the hole from one up.','Your lead remains','A tied hole does not erase it.')
   ],1,'Count the hole and the match separately.',context('match','Final hole',[fact('Match','1 UP'),fact('Opponent','Finished in 4'),fact('You','Lying 3')]),'Keep the match score separate from this hole’s score.'),
   question('Same final-hole putt: opponent finished in 4; you lie 3. This time you are one down. A tied match would go to extra holes.','What would holing this next putt achieve?',[
    response('Ties the hole; loses the match','A 4 ties their 4, so the one-hole deficit remains.','Hole tied. Match lost.','The deficit remains one.'),
    response('Wins the hole; extra holes','A 4 does not beat the opponent’s 4.','A tie on the hole','No hole is gained.'),
    response('Wins the match','Neither the hole nor the existing deficit is won back by a 4.','The deficit remains','Match score and hole score are separate.')
   ],0,'The same score can have a different match consequence. Establish the objective before discussing a strategy.',context('match','Final hole',[fact('Match','1 DOWN'),fact('Opponent','Finished in 4'),fact('You','Lying 3')]),'Only the match score changed.'),
   question('Last hole, one down. Opponent has finished in 4. You lie 2 on the green. The competition uses extra holes if the match ends tied.','What does holing your next putt achieve?',[
    response('Wins the match','It wins one hole, cancelling a one-hole deficit.','One hole gained','The match becomes tied, not won.'),
    response('Ties the hole; loses the match','A 3 beats the opponent’s 4.','The hole is won','That squares the match.'),
    response('Wins the hole; sends the match to extra holes','A 3 wins this hole and cancels the deficit.','All square. Extra holes.','The next putt can keep the match alive.')
   ],2,'A putt to keep the match alive is different from a putt to win the match.',context('match','One putt to stay alive',[fact('Match','1 DOWN'),fact('Opponent','Finished in 4'),fact('You','Lying 2')]),'Add one stroke to your count, then update the match.'),
   question('Fresh situation: last hole, one up. Opponent finished in 5; you lie 4. You take two more strokes. The competition uses extra holes for a tied match.','What is the match result?',[
    response('Match lost','Losing one hole from one up cancels the lead.','All square','The match continues into extra holes.'),
    response('All square; extra holes','Your 6 loses to 5. Your one-hole lead becomes zero.','All square. Extra holes.','A lost hole is not automatically a lost match.'),
    response('Match won','A 6 does not tie or beat 5, so the lead is lost.','The lead is gone','The match is now tied.')
   ],1,'Work from the scores actually made, including penalties. Here there are no handicap strokes or other penalties.',context('match','Final-hole result',[fact('Match before','1 UP'),fact('Opponent','5'),fact('Your finish','6')]),'Update a one-hole lead after losing one hole.')
  ])
];
