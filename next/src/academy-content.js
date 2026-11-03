import {LESSONS} from './scenario.js';

export const SOURCES = {
 impact:{label:'Trackman · Face to Path',url:'https://www.trackman.com/blog/face-to-path'},
 landing:{label:'PGA of America · Choosing a landing spot',url:'https://www.pga.com/story/clutch-kim-two-tips-to-improve-your-chipping-under-pressure'},
 pace:{label:'PGA of America · Match line and speed',url:'https://www.pga.com/story/separate-line-and-speed-in-your-putting-routine'},
 slope:{label:'PGA of America · Practise different slopes and speeds',url:'https://www.pga.com/story/article-how-do-the-pga-championship-players-prepare-for-uneven-greens-part-2'},
 lag:{label:'PGA of America · Choose a finish zone',url:'https://www.pga.com/story/nelly-korda-putting-lesson-how-early-round-focus-and-speed-control-can-save-your-score'},
};
export const CATEGORIES = [
 {id:'shot',name:'Shot-making',symbol:'↗',line:'Read the start. Understand the bend.',need:'My irons keep surprising me.'},
 {id:'course',name:'Course decisions',symbol:'⚑',line:'Give your ordinary shots more room.',need:'I give away shots before I swing.'},
 {id:'short',name:'Short game',symbol:'⌁',line:'Choose the landing. Allow for the roll.',need:'I get close, then waste the chance.'},
 {id:'putt',name:'Putting',symbol:'◎',line:'Match the line, the pace and the slope.',need:'My first putt leaves too much work.'},
];
const o=(text,why,demo)=>({text,why,...(demo?{demo}:{})});
const q=(situation,question,options,correct,explanation,visual,watch)=>({situation,question,options,correct,explanation,visual,watch});
const f=(face,path)=>({type:'flight',face,path});
const green=(type,target,extra={})=>({type,target,...extra});
const chip=(land,end)=>({land,end});
const roll=(side,end)=>({side,end});
const lesson=(id,category,title,line,cue,practice,misconception,source,questions)=>({id,category,title,line,cue,practice,misconception,source,questions,minutes:3});

export const NEW_LESSONS=[
 lesson('start-and-bend','shot','Right face. Left bend.','The target line doesn’t tell the whole story.',
  'Name the start, then the bend. Compare face with path.',
  'Watch five comfortable iron shots at one target. Name the start and bend separately. Look for a pattern before changing anything.',
  'A face pointing right must make a ball curve right.','impact',[
   q('A centred iron strike. The face points 3° right of the target. The club head moves 6° right. Still air.','Which flight would you expect?',[
    o('Starts right, bends farther right','That reads the face against the target. For the curve, compare it with the path.'),o('Starts right, bends left','The face points right of the target, but left of the path.'),o('Straight at the target','Neither direction points at the target, and they do not match.')],1,'The face strongly influences the start. Here it is left of the path, so the ball bends left despite starting right.',f(3,6),'Read the gold face against the teal movement.'),
   q('Keep the face 3° right. Change only the path: it now points 2° left. Same centred strike.','What changes?',[
    o('The curve turns right','The face is now right of the path.'),o('The ball still bends left','The relationship changed when the path crossed to the other side.'),o('It flies straight right','Face and path no longer match, so this is not the straight-flight case.')],0,'One unchanged face can partner with different paths. The face now sits right of the path, producing rightward curve.',f(3,-2),'Same face. A different partner.'),
   q('A new shot: face 2° left, path 5° left. Centre strike, no wind. Call it before seeing the flight.','Which way will it bend?',[
    o('Left','The face is left of the target, but right of this path.'),o('Very little curve','The directions differ by 3°.'),o('Right','The face is right of the path, even though both point left.')],2,'Left and right of the target are not enough. The face is 3° right of the path: a left start with a rightward bend.',f(-2,-5),'A fresh read. Keep the target reference.'),
   q('A return check: face 1° right, path 4° right. Same centred-iron assumptions.','Call the bend.',[o('Right','Compare face with path, not target.'),o('Left','The face sits left of the path.'),o('No curve','The two directions do not match.')],1,'The face is 3° left of the path. This example starts right and bends left.',f(1,4),'Recall the relationship before the reveal.')
  ]),
 lesson('straight-is-not-target','shot','Straight isn’t on target.','A straight miss needs a different question.',
  'Straight describes the curve. On target describes the direction.',
  'Use a distant target and a near reference on the same line. Observe five starts. Ask whether you have a direction pattern or a curve pattern.',
  'Removing curve automatically fixes a miss.','impact',[
   q('The face and path both point 4° right. The strike is centred. The flag is on the target line.','Where does this shot go?',[
    o('Straight right','Matching directions remove curve from this relationship; both still point right.'),o('Curves back to the flag','Nothing in this face–path relationship supplies that returning bend.'),o('Straight at the flag','The target is a reference, not a force pulling the ball towards it.')],0,'Face and path match each other, but not the target. Straight flight can still be a miss.',f(4,4),'Look at both markers relative to zero.'),
   q('The same straight-right example. You want a straight flight on the target line. Choose an impact change, not a swing instruction.','Which change serves both goals?',[
    o('Move only the face to 0°','That introduces a face–path gap and a leftward bend.',{face:0,path:4}),o('Move both to 0°','Both directions now match each other and the target.',{face:0,path:0}),o('Move only the path to 0°','That introduces a rightward bend while the face still points right.',{face:4,path:0})],1,'Moving one direction alone changes the curve. Moving the pair to the target preserves the straight relationship and changes its direction.',f(4,4),'See the result of your chosen change.'),
   q('New side, same puzzle: face and path both point 3° left. The ball is struck centrally.','What should you predict?',[
    o('A fade back to the flag','Matching directions do not create that fade.'),o('A shot straight at the flag','Both directions are off the target line.'),o('A straight flight left','The pair matches, so the flight is straight but left.')],2,'You have separated shape from direction. That distinction prevents treating every miss as a curve problem.',f(-3,-3),'Different side. Same useful distinction.'),
   q('Face 2° right. Path 2° right. You want to preserve the straight shape but aim it on target.','Which impact pair fits?',[
    o('Face 0°, path 2°','This pair introduces curve.',{face:0,path:2}),o('Face 2°, path 0°','This pair also introduces curve.',{face:2,path:0}),o('Face 0°, path 0°','Matching at zero fits both goals.',{face:0,path:0})],2,'Keep the match; change the direction of the pair. This is an impact illustration, not a diagnosis of your alignment.',f(2,2),'Preserve the shape. Change its direction.')
  ]),
 lesson('enough-curve','shot','Your draw is turning too far.','A smaller curve can be more useful than no curve.',
  'Decide whether you need less curve or no curve.',
  'Observe whether your recurring curve returns too far, not far enough, or about right. Take that observation to practice rather than assuming straight is always the goal.',
  'A curving miss always needs to be made straight.','impact',[
   q('Face 2° right, path 8° right. This example bends left more than you want. Keep the face fixed and keep some leftward bend.','Which path reduces the bend?',[
    o('Path 2° right','Matching the face removes the curve instead of keeping some.',{face:2,path:2}),o('Path 2° left','Crossing the face changes the direction of the bend.',{face:2,path:-2}),o('Path 5° right','A smaller gap keeps the face left of the path.',{face:2,path:5})],2,'The smaller face–path gap reduces the left bend in this model. Matching completely answers a different question.',f(2,8),'Change one input. Watch the amount of bend.'),
   q('Now you do want almost no curve. The face stays 2° right. Same centred strike and still air.','Which path fits this new goal?',[
    o('Path 5° right','This preserves some leftward bend.',{face:2,path:5}),o('Path 2° right','Matching face and path removes this source of curve.',{face:2,path:2}),o('Path 5° left','This increases the gap on the other side.',{face:2,path:-5})],1,'The answer changes because your intention changes. This shot flies straight right; removing curve does not promise the flag.',f(2,5),'The intention changed; the right answer changes too.'),
   q('Fresh example: face 2° left, path 8° left. Keep a rightward bend, but reduce it. The face stays fixed.','Choose the path.',[
    o('Path 5° left','It narrows the gap while leaving the face right of the path.',{face:-2,path:-5}),o('Path 2° left','This removes the bend.',{face:-2,path:-2}),o('Path 2° right','This reverses the bend.',{face:-2,path:2})],0,'The same reasoning works on the other side. You control the relationship, not a memorised instruction to move right.',f(-2,-8),'Turn the idea around.'),
   q('Face 1° left, path 6° left. Keep the rightward shape, but reduce the curve.','Which path fits?',[
    o('1° right','This reverses the relationship.',{face:-1,path:1}),o('3° left','This keeps a smaller gap on the same side.',{face:-1,path:-3}),o('1° left','This removes the curve.',{face:-1,path:-1})],1,'A smaller gap on the same side preserves the bend while reducing it in this fixed model.',f(-1,-6),'Recall the goal, then choose the relationship.')
  ]),
 lesson('landing-not-hole','short','Where should the first bounce be?','Separate the flight from the roll.',
  'Pick a landing spot that leaves room for the roll.',
  'On a practice green, land five chips near one towel. Watch how far they roll with that club and lie. Move the landing spot before guessing a universal carry-to-roll ratio.',
  'A chip should be flown all the way to the flag.','landing',[
   q('A 12 m chip from a clean lie. On this flat practice green, this player’s stock chip carries 4 m and rolls 8 m. Those are observed example distances.','Which landing spot matches the hole?',[
    o('4 m from the ball','Four metres of carry leaves the observed eight metres of roll.',chip(4,12)),o('8 m from the ball','With this example’s eight metres of roll, the finish is beyond the hole.',chip(8,16)),o('At the hole, 12 m away','Landing at the hole leaves no room for the roll.',chip(12,20))],0,'The landing spot and the finish are different targets. For this observed shot, 4 m in the air plus 8 m on the green reaches 12 m.',green('chip',12,{edge:2,roll:8,max:21}),'White flight → gold landing → teal roll.'),
   q('Same 12 m hole. A different rehearsed shot rolls only 4 m after landing. The lie and green are unchanged.','Where would you now land it?',[
    o('4 m away','Four plus four finishes short in this example.',chip(4,8)),o('8 m away','Eight metres of carry leaves four metres of roll.',chip(8,12)),o('12 m away','The remaining roll takes it beyond the hole.',chip(12,16))],1,'The useful landing spot changes with the shot you can actually play. There is no universal one-third rule.',green('chip',12,{edge:2,roll:4,max:21}),'Same hole. Different observed roll.'),
   q('A new 15 m chip. Your rehearsed shot rolls 6 m on this surface. The green begins 3 m away.','Choose a landing spot on the green.',[
    o('5 m away','That leaves a total of 11 m, short of this hole.',chip(5,11)),o('15 m away','The six metres of roll are still to come.',chip(15,21)),o('9 m away','Nine plus six reaches the hole in this example.',chip(9,15))],2,'Work back from the finish using the observed roll, then check that the landing surface is suitable.',green('chip',15,{edge:3,roll:6,max:23}),'A new distance, not a new rule.'),
   q('An 11 m chip. Your rehearsal suggests 5 m of roll; the green begins at 2 m.','Where is the useful landing spot?',[
    o('6 m from the ball','Six metres of carry plus five of roll fits.',chip(6,11)),o('At the hole','That ignores the roll.',chip(11,16)),o('2 m from the ball','That finishes well short in this example.',chip(2,7))],0,'Choose the landing from the finish and your observed roll. These numbers are examples, not a prescription for a club.',green('chip',11,{edge:2,roll:5,max:18}),'Land first. Finish second.')
  ]),
 lesson('carry-the-trouble','short','The low shot needs a runway.','Let the obstacle change your choice.',
  'Check the entire route: flight, landing and roll.',
  'Before a short-game shot, identify what must be carried and where the first bounce can safely happen. Choose a shot you have rehearsed from that lie.',
  'The lowest shot is always the safest short-game choice.','landing',[
   q('The hole is 16 m away. A bunker starts just ahead and ends 6 m away. You have rehearsed all three shots from this clean lie. Each totals 16 m on this green.','Which leaves a clear landing margin?',[
    o('Carry 4 m, roll 12 m','That first bounce is in the bunker.',chip(4,16)),o('Carry 8 m, roll 8 m','It clears the bunker and lands on the green.',chip(8,16)),o('Carry 6 m, roll 10 m','Landing at the edge leaves no margin for a small carry miss.',chip(6,16))],1,'The short carry is attractive only when the runway exists. Here the first bounce matters before the total distance.',green('chip',16,{edge:6,hazard:true,max:22}),'The sand stays fixed. Watch the first bounce.'),
   q('New situation: no bunker. Smooth short grass runs all the way to the hole. Your low chip lands reliably; the higher shots have a wider carry spread. All can reach 16 m.','Which uses the evidence best?',[
    o('The higher shot, because it worked before','The reason for that extra flight has disappeared.',chip(8,16)),o('Fly it nearly to the hole','That asks for more carry precision without a stated benefit.',chip(13,16)),o('The rehearsed low chip','The clear runway lets you use your tighter carry pattern.',chip(4,16))],2,'The situation changed, not your courage. With a clear runway and better observed control, the low shot now has a useful advantage.',green('chip',16,{edge:0,max:22}),'Changed setup: clear grass replaces the sand.'),
   q('New hole: 18 m away, with a bunker ending at 8 m. Your three rehearsed options all finish near 18 m on grass.','Choose the landing with some margin.',[
    o('Carry 10 m, roll 8 m','It clears the obstacle with room beyond its edge.',chip(10,18)),o('Carry 5 m, roll 13 m','The first bounce is in sand.',chip(5,18)),o('Carry 8 m, roll 10 m','The edge is not a useful margin.',chip(8,18))],0,'Judge the route, not the final distance alone. A sound total can hide an impossible first bounce.',green('chip',18,{edge:8,hazard:true,max:24}),'A different obstacle. Re-read the landing.'),
   q('A 14 m shot, with sand ending 5 m ahead. You have rehearsed these carry-and-roll combinations.','Which has a clear landing margin?',[
    o('Carry 5 m, roll 9 m','That targets the edge.',chip(5,14)),o('Carry 7 m, roll 7 m','That lands beyond the sand.',chip(7,14)),o('Carry 3 m, roll 11 m','That lands in the bunker.',chip(3,14))],1,'The useful shot carries the obstacle before it asks the ball to roll.',green('chip',14,{edge:5,hazard:true,max:20}),'First bounce before final distance.')
  ]),
 lesson('surface-changes','short','Same landing. Different finish.','Your last green is not this green.',
  'Recheck rollout when the surface changes.',
  'During permitted practice, compare a few chips landing on two different surfaces. Keep the shot as similar as you can and watch the rollout. Do not turn one bounce into a new swing diagnosis.',
  'A longer finish proves the swing changed.','landing',[
   q('On the soft practice green, a chip landed at 5 m and rolled 4 m. On a firmer patch, the same example lands at 5 m and rolls 8 m. The hole is 9 m away.','What does the second ball show?',[
    o('The landing must have moved','The observed landing is still 5 m away.'),o('The extra distance came after landing','The carry stayed 5 m; rollout doubled in this example.'),o('The shot needs a new landing target immediately','That may be a useful adjustment next. First notice that the observed carry stayed the same and rollout changed.')],1,'Separate carry from roll before diagnosing the shot. The second finish is 13 m because the observed roll changed.',green('chip',9,{edge:1,max:17,reference:{land:5,end:9},actual:{land:5,end:13}}),'Compare the same landing on two surfaces.'),
   q('Stay on that firmer surface. A rehearsed alternative lands at 5 m and rolls 4 m. The original rolls 8 m. The hole remains at 9 m.','Which plan fits the observed finish?',[
    o('Use the alternative with 4 m of roll','Five plus four fits this hole.',chip(5,9)),o('Use the original without adjusting','Five plus eight still finishes long.',chip(5,13)),o('Land the original at 9 m','That adds its eight metres of roll after the hole.',chip(9,17))],0,'Use the evidence from this surface and a shot you can reproduce. You do not need to invent a mechanical cure from the long finish.',green('chip',9,{edge:1,max:19}),'Change the plan using observed rollout.'),
   q('New surface, new result. Your chip lands at the intended 6 m spot, then stops at 9 m instead of the expected 12 m.','What should you investigate first?',[
    o('Assume your aim was wrong','The observation concerns length after landing, not left or right.'),o('Add carry before checking the roll','The carry reached its intended spot. First identify why less distance came after it landed.'),o('The shorter roll after landing','The missing distance is in the roll, so start there.')],2,'The ball reached its landing spot. The shorter rollout is the first useful clue; the cause still needs observing.',green('chip',12,{edge:2,max:17,reference:{land:6,end:12},actual:{land:6,end:9}}),'Locate where the result diverged.'),
   q('Expected: carry 4 m, roll 6 m. Observed: carry 4 m, roll 3 m.','Which part changed?',[
    o('Carry','Both observations have the same carry.'),o('Roll','The difference begins after landing.'),o('Both equally','Only the roll differs in the evidence.')],1,'You have identified the changed part without pretending to know an unmeasured swing cause.',green('chip',10,{edge:1,max:15,reference:{land:4,end:10},actual:{land:4,end:7}}),'Observe before diagnosing.')
  ]),
 lesson('pace-and-line','putt','The line belongs to a pace.','A harder putt does not follow the same curve.',
  'Choose the line and pace as a pair.',
  'On a gentle breaking practice putt, compare a softer and a firmer pace. Find the start line each needs. Watch the length of the next putt when you miss.',
  'There is one correct line regardless of speed.','slope',[
   q('A 6 m putt slopes down to the right. At a soft pace, a start line left of the hole bends back to it. Now roll it firmer on that same start line.','Where is it more likely to pass the hole?',[
    o('On the low, right side','The firmer pace generally allows less break, not more.'),o('On the same line into the cup','Changing pace changes the line–speed match.'),o('On the high, left side','With less time to break, it stays higher on this smooth slope.')],2,'On this smooth, uniform slope, a firmer ball takes less break. The same leftward start can now miss high and run farther.',green('putt',6,{slope:1,max:10,reference:{side:0,end:6,aim:-2},actual:{side:-1,end:8,aim:-2}}),'Same start line. Different pace. Width exaggerated.'),
   q('You want to keep that firmer pace on this right-breaking putt. The previous line missed high, to the left.','How should the start line change?',[
    o('Less far left','Less break needs less allowance on the high side.',{side:0,end:6.5,aim:-1}),o('Farther left','That adds allowance when the firmer pace needs less.',{side:-1.5,end:8,aim:-3}),o('Right of the hole','The slope already moves the ball right.',{side:2,end:8,aim:1})],0,'Pair a firmer pace with less high-side allowance. This drawing illustrates the relationship, not an exact aim prescription.',green('putt',6,{slope:1,max:10}),'Keep the pace. Refit the line.'),
   q('A fresh putt breaks left. A firm pace and a rightward start matched well. You now want a softer pace.','How does the useful start line change?',[
    o('Closer to the hole’s direct line','That allows less break when the softer pace needs more.',{side:-1,end:6,aim:1}),o('Farther right, on the high side','A softer pace needs more allowance for this leftward break.',{side:0,end:6,aim:3}),o('Left of the hole','That starts on the low side of this left-breaking putt.',{side:-2,end:6,aim:-1})],1,'The high side switched when the slope switched. Match the slower pace with more allowance on that new high side.',green('putt',6,{slope:-1,max:10}),'New slope. Softer pace. Read it afresh.'),
   q('A left-breaking putt. You make the pace firmer but keep the same rightward start line.','Which miss becomes more likely?',[
    o('High, to the right','Less break leaves it higher than the softer version.'),o('Low, to the left','That would require more break, not less.'),o('No change','Pace is part of the line.')],0,'On this uniform slope, the firmer pace reduces break. High is now right.',green('putt',6,{slope:-1,max:10,reference:{side:0,end:6,aim:2},actual:{side:1,end:8,aim:2}}),'Remember which side is high.')
  ]),
 lesson('distance-before-perfection','putt','Make the next putt easier.','A near miss can hide poor distance control.',
  'Judge a long putt by the next putt it leaves.',
  'From three different distances, choose a finish zone before each practice putt. Finish every ball. Track the length left, not only whether the first putt drops.',
  'One holed putt proves a better pace plan.','lag',[
   q('Two pace plans, six example putts each from 12 m. Plan A leaves 0, 3, 4, 3, 4 and 4 m. Plan B leaves 1, 1, 2, 1, 2 and 1 m. These are examples, not your odds.','Which leaves less work across the set?',[
    o('Plan A, because one went in','The holed ball hides five longer second putts.'),o('Plan B, with the tighter finishes','Its total remaining distance is smaller across these six examples.'),o('The plans are equivalent','Their remaining distances differ substantially.')],1,'A leaves 18 m of next-putt distance across the set; B leaves 8 m. That is a useful comparison, not a strokes-gained estimate.',green('spread',12,{max:18,sets:[[0,3,4,3,4,4],[1,1,2,1,2,1]]}),'Look at all six finishes, including the miss.'),
   q('This time the evidence reverses. A leaves 1, 1, 1, 2, 1 and 2 m. B leaves 0, 4, 3, 4, 3 and 4 m. Same starting distance.','Which set better controls the next putt?',[
    o('B, because it includes a make','One make does not outweigh the five longer leaves in this comparison.'),o('B, because it offers a chance to hole out','The make matters, but the five longer returns give B more total distance remaining in this sample.'),o('A, with less distance remaining','A totals 8 m of leaves against B’s 18 m.')],2,'Good judgement follows the new pattern. It does not keep choosing a letter that worked last time.',green('spread',12,{max:18,sets:[[1,1,1,2,1,2],[0,4,3,4,3,4]]}),'The labels stay. The evidence changes.'),
   q('A new 15 m putt. Plan A leaves 2, 2, 3, 2, 3 and 2 m. B leaves 0, 5, 4, 5, 4 and 6 m.','What is the sound conclusion?',[
    o('A has the shorter leaves in this sample','A totals 14 m; B totals 24 m.'),o('B: the holed ball offsets its longer returns','The make is valuable, but B still leaves 24 m against A’s 14 m across this set.'),o('A will produce fewer three-putts on the course','That is a possibility to test, not something these six distance examples establish.')],0,'Prefer the shorter leaves in the stated evidence while keeping the claim proportionate. Examples inform a plan; they do not guarantee outcomes.',green('spread',15,{max:22,sets:[[2,2,3,2,3,2],[0,5,4,5,4,6]]}),'A useful conclusion without a false guarantee.'),
   q('Six leaves: A = 0, 3, 3, 4, 3, 5 m. B = 1, 2, 1, 2, 1, 2 m.','Which controls remaining distance better here?',[
    o('A, because it holes one','The rest of the sample leaves more work.'),o('They are identical','Their totals differ.'),o('B, across the whole sample','B totals 9 m; A totals 18 m.')],2,'Whole-pattern distance control matters more than one flattering finish in this comparison.',green('spread',12,{max:19,sets:[[0,3,3,4,3,5],[1,2,1,2,1,2]]}),'Read the pattern, not the highlight.')
  ]),
 lesson('same-distance-new-slope','putt','Six metres isn’t always six metres.','Distance is only one part of the pace.',
  'Read uphill or downhill before choosing the pace.',
  'Alternate similar-length uphill and downhill practice putts. Choose a finish zone each time, then notice the different pace needed. Avoid repeating one putt until you only remember its stroke.',
  'Equal-length putts need equal starting pace.','slope',[
   q('Two straight 6 m putts on the same green: one gently uphill, one gently downhill. No sideways slope.','Which needs more starting speed to reach the hole?',[
    o('The uphill putt','Gravity opposes its motion up the slope.'),o('The downhill putt','Gravity assists rather than opposes the downhill roll.'),o('They need the same speed','The length matches, but the slope does not.')],0,'Equal length does not mean equal pace. On the same surface, the uphill ball needs more starting speed.',green('slope',6,{grade:'up',max:10,actual:{side:0,end:4},reference:{side:0,end:6}}),'Same starting pace: flat reference versus uphill.'),
   q('You have just holed the uphill 6 m putt. Now play 6 m downhill on the same surface. You reuse the uphill starting speed.','What is the main risk?',[
    o('It must stop short','That speed was enough to overcome the uphill slope.'),o('It arrives at the same pace','The same starting speed is now assisted by gravity, so the arrival pace changes.'),o('It runs well past','The same speed now has help from the downhill slope.')],2,'A remembered stroke for the distance can be misleading when the slope changes. Re-read the pace before you hit.',green('slope',6,{grade:'down',max:11,actual:{side:0,end:9},reference:{side:0,end:6}}),'Same speed, now downhill.'),
   q('Two new 9 m putts on the same green. One climbs; the other descends. You want both to arrive gently near the hole.','Which pace pairing makes sense?',[
    o('Same starting speed for both','The equal distance does not cancel the slope.'),o('More speed uphill, less downhill','The initial pace adjusts to the opposing or assisting slope.'),o('Less uphill, more downhill','That works against the required adjustment.')],1,'Read the full journey to the hole. Similar arrival pace can require different starting speeds.',green('slope',9,{grade:'up',max:14,actual:{side:0,end:9}}),'Choose the starting pace for the arrival you want.'),
   q('Your level 5 m practice putt was well paced. The next 5 m putt is straight downhill on the same surface.','What adjustment fits?',[
    o('More starting speed','The slope already assists the roll.'),o('No adjustment because it is 5 m','Length is not the only input.'),o('Less starting speed','Less is needed to reach the same distance downhill.')],2,'Carry the intention—controlled arrival—not an identical stroke from a different slope.',green('slope',5,{grade:'down',max:9,actual:{side:0,end:5}}),'Read this putt, not the previous one.')
  ])
];
export const COURSE_LESSONS=LESSONS.map(l=>({id:l.id,category:'course',title:l.name,line:l.teaser,cue:l.cue,minutes:4,legacy:true,questions:l.cases,href:`?view=library&read=${l.id}`}));
export const CATALOG=[NEW_LESSONS[0],COURSE_LESSONS[0],NEW_LESSONS[3],NEW_LESSONS[6],NEW_LESSONS[1],COURSE_LESSONS[1],NEW_LESSONS[4],NEW_LESSONS[7],NEW_LESSONS[2],COURSE_LESSONS[2],NEW_LESSONS[5],NEW_LESSONS[8],...COURSE_LESSONS.slice(3)];
export const byId=id=>CATALOG.find(l=>l.id===id);
export const lessonURL=l=>l.href||`?learn=${l.id}`;
export const coreCount=l=>l.legacy?2:3;
