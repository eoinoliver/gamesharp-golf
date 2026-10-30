import {COURSE} from './scenario.js';
import {carryWindow, getClub, offsets} from './model.js';

const answer=(id,title,detail,club,aim)=>({id,title,detail,plan:{club,aim}});
// Complete, authored plans. Their order stays stable when the situation changes.
// Nothing here looks up the reference plan or marks a choice as correct.
export const DECISIONS={
 'distance-first':{
  situation:'138 m to the flag. A bunker guards the front of the green.',
  question:'Which club would you play?',
  note:'Both answers aim along the flag line. Choose the carry you trust.',
  answers:[answer('A','Play the 8 iron','Aim along the flag line','8i',-3),answer('B','Play the 7 iron','Aim along the flag line','7i',-3)]
 },
 'distance-transfer':{
  situation:'138 m to the same flag. A different player, with the bunker behind the green.',
  question:'Which club would you play?',
  note:'Both answers aim along the flag line. Read this player’s carries afresh.',
  answers:[answer('A','Play the 8 iron','Aim along the flag line','8i',-3),answer('B','Play the 7 iron','Aim along the flag line','7i',-3)]
 },
 'shape-first':{
  situation:'Your 7 iron reaches this green. Use the example shot pattern to choose your aim.',
  question:'Where would you aim?',
  note:'Same 7 iron in every answer. Only your aim changes.',
  answers:[answer('A','Left of the flag','9 m left','7i',-10),answer('B','At the flag','Along the flag line','7i',-1),answer('C','Right of the flag','8 m right','7i',7),answer('D','Further right','15 m right of the flag','7i',14)]
 },
 'shape-transfer':{
  situation:'A different player’s 7 iron, and a flag on the left. Read the new shot pattern before choosing.',
  question:'Where would you aim?',
  note:'Same 7 iron in every answer. Only your aim changes.',
  answers:[answer('A','Left of the flag','9 m left','7i',-16),answer('B','At the flag','Along the flag line','7i',-7),answer('C','Right of the flag','8 m right','7i',1),answer('D','Further right','15 m right of the flag','7i',8)]
 },
 'landing-first':{
  situation:'260 m from the green. You’re laying up. Bunkers narrow the landing area around 160 m.',
  question:'Which lay-up would you play?',
  note:'Both answers aim down the fairway. Choose where to land.',
  answers:[answer('A','5 iron · shorter','Aim for the 160 m landing area','5i',-10),answer('B','5 wood · longer','Aim for the 195 m landing area','5w',-10)]
 },
 'landing-transfer':{
  situation:'A different layout: bunkers narrow the landing area around 195 m. Your clubs are unchanged.',
  question:'Which lay-up would you play?',
  note:'Both answers aim down the fairway. Choose where to land.',
  answers:[answer('A','5 iron · shorter','Aim for the 160 m landing area','5i',-10),answer('B','5 wood · longer','Aim for the 195 m landing area','5w',-10)]
 },
 'next-first':{
  situation:'Lay up with a 6 iron. Your next shot must run straight to the flag, so the marked trees can block its route.',
  question:'Where would you leave the ball?',
  note:'Same club and distance. Choose a side of the fairway.',
  answers:[answer('A','Left side','Lay up left of the fairway centre','6i',-17),answer('B','Down the middle','Lay up near the fairway centre','6i',-10),answer('C','Right side','Lay up right of the fairway centre','6i',-1),answer('D','Further right','Lay up beyond the fairway’s right edge','6i',10)]
 },
 'next-transfer':{
  situation:'The trees are now on the right, and the flag is left. Your next shot still has to run straight to the flag.',
  question:'Where would you leave the ball?',
  note:'Same club and distance. Choose a side of the fairway.',
  answers:[answer('A','Left side','Lay up left of the fairway centre','6i',-17),answer('B','Down the middle','Lay up near the fairway centre','6i',-10),answer('C','Right side','Lay up right of the fairway centre','6i',-1),answer('D','Further right','Lay up beyond the fairway’s right edge','6i',10)]
 },
 'pin-first':{
  situation:'Your 7 iron reaches the green. The flag is close to the water on the right.',
  question:'How close would you aim?',
  note:'Balance a chance to finish close with room for your misses.',
  answers:[answer('A','At the flag','Along the flag line','7i',11),answer('B','Just left of the flag','5 m left of the flag','7i',6),answer('C','Middle of the green','Along the green centre line','7i',-3),answer('D','Left side of the green','14 m left of centre','7i',-17)]
 },
 'pin-transfer':{
  situation:'The flag has moved to the open left half. Your club and shot pattern are unchanged.',
  question:'How close would you aim?',
  note:'Read the new flag position before repeating your last answer.',
  answers:[answer('A','At the flag','Along the flag line','7i',-9),answer('B','Just left of the flag','5 m left of the flag','7i',-14),answer('C','Middle of the green','Along the green centre line','7i',-3),answer('D','Right side of the green','9 m right of centre','7i',6)]
 },
 'outcome-first':{
  situation:'You aimed near the centre. The last ball went into the water. Look at all 12 shots before reacting.',
  question:'Keep your aim, or change it?',
  note:'Judge the starting plan, not just the last ball.',
  answers:[answer('A','Keep this aim','Stay near the green centre','7i',-6),answer('B','Move further left','Aim 11 m left of the starting plan','7i',-17)]
 },
 'outcome-transfer':{
  situation:'This time you aimed near the right-hand flag. The last ball finished close. Look at the whole pattern again.',
  question:'Keep your aim, or change it?',
  note:'Judge the starting plan, not just the last ball.',
  answers:[answer('A','Keep this aim','Stay on the flag line','7i',11),answer('B','Move a little left','Aim 5 m left of the starting plan','7i',6)]
 }
};

export function evidenceFor(c){
 if(c.clubs.length>1)return c.clubs.map(cl=>{
  const w=carryWindow(c,cl),os=offsets(c,cl),width=Math.round(Math.max(...os.map(p=>p.x))-Math.min(...os.map(p=>p.x)));
  return {label:cl.name,value:`${w.min}–${w.max} m carry`,extra:c.objective==='fairway'?`${width} m wide pattern`:`${w.intended} m intended`};
 });
 const cl=c.clubs[0],os=offsets(c,cl),normal=c.outlier?os.filter((_,i)=>i!==c.outlier.index):os;
 const left=Math.round(Math.min(...normal.map(p=>p.x))),right=Math.round(Math.max(...normal.map(p=>p.x)));
 const side=n=>`${Math.abs(n)} m ${n<0?'left':'right'}`;
 return [{label:c.outlier?'Other 11 shots':`${cl.name} · 12 shots`,value:`${side(left)} to ${side(right)}`,extra:'Finishes relative to your aim'},...(c.outlier?[{label:'Last ball',value:`${side(c.outlier.x)} of aim`,extra:'The far-right finish'}]:[])];
}
export function planDescription(c,p){
 const cl=getClub(c,p),centre=c.objective==='approach'?COURSE.green.x:-10,offset=p.aim-centre;
 const place=c.objective==='approach'?'green centre':'fairway centre line';
 return `${cl.name} · ${offset===0?place:`${Math.abs(offset)} m ${offset<0?'left':'right'} of ${place}`}`;
}
