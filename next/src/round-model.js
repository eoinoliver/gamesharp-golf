import {distanceText} from './teaching-payoff.js';
import {HEADLAND,ERRORS,EPISODES,episodeById} from './round-content.js';
import {shoreX} from './shotmaker-model.js';
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export const along=(a,b,t)=>({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t});
export function lie(p){const b=HEADLAND.bunker,g=HEADLAND.green;if(p.x>shoreX(p.z))return 'coast';if(((p.x-b.x)/b.rx)**2+((p.z-b.z)/b.rz)**2<1)return 'bunker';if((p.x/g.rx)**2+(p.z/g.rz)**2<=1)return 'green';return 'rough';}
export function sample(e,choice){const aim=e.options[choice].aim;return ERRORS.map(p=>({x:aim.x+p.x*e.scale,z:aim.z+p.z*e.scale}));}
export function sampleSummary(e,choice){const points=sample(e,choice);return {green:points.filter(p=>lie(p)==='green').length,trouble:points.filter(p=>['bunker','coast'].includes(lie(p))).length,rough:points.filter(p=>lie(p)==='rough').length,mean:points.reduce((s,p)=>s+distance(p,e.pin),0)/points.length};}
export const approachEnd=(e,choice)=>sample(e,choice)[e.miss];
export function approachQuestion(e){return {id:'approach',skill:'space',situation:e.intro,question:e.question,watch:e.watch,options:e.options,correct:e.best,start:{x:0,z:e.id==='permission'?95:160},kind:'approach'};}
export function nextQuestion(e,choice){const start=approachEnd(e,choice),surface=lie(start),d=distance(start,e.pin);
 if(surface==='green')return puttQuestion(e,start,'putt');
 if(surface==='bunker')return {id:'recovery',skill:'landing',kind:'bunker',start,situation:`Your approach finished in the front-left bunker, ${Math.round(d)} m from the flag. A clean splash is available. The flag leaves little green beyond the lip; the broader landing area is towards the centre.`,question:'What is the job of this recovery?',watch:'Find the first-bounce area, then the putt it leaves.',correct:1,options:[
 {name:'Land beside the flag',detail:'Use the narrow landing strip to chase a tap-in.',end:{x:e.pin.x+11,z:e.pin.z-7},land:along(start,e.pin,.9),why:'The narrow strip asks for a very precise splash. In this authored example the extra carry and roll leave a longer putt beyond the flag.'},
 {name:'Use the broad landing area',detail:'Get onto the green; accept a longer first putt.',end:{x:e.pin.x+6,z:e.pin.z-3},land:{x:e.pin.x+4,z:e.pin.z-1},why:'The broader patch gives the recovery more landing room. The finish is still several metres away, but the next task is a putt.'},
 {name:'Fly it all the way to the hole',detail:'Try to remove the roll from the shot.',end:{x:e.pin.x+15,z:e.pin.z-9},land:{...e.pin},why:'Landing at the hole does not make the ball stop there. This example still rolls, leaving the longest return of these three rehearsed shots.'}
 ]};
 return {id:'recovery',skill:'landing',kind:'chip',start,situation:`Your ball is on a clean patch of rough, ${Math.round(d)} m from the flag. The first few metres are uneven grass. You have rehearsed a low chip and a lofted pitch from this lie.`,question:'Where should the first bounce happen?',watch:'Rough first, green next. Read the landing surface.',correct:1,options:[
 {name:'Just get it running',detail:'Land the low chip in the rough, near your feet.',land:along(start,e.pin,.15),end:along(start,e.pin,.42),why:'This first bounce is in uneven rough. The ball loses speed before reaching the smooth green. Low is useful when the route supports it.'},
 {name:'Carry onto the green',detail:'Land the rehearsed pitch on the smooth surface.',land:along(start,e.pin,.62),end:along(start,e.pin,.92),why:'The pitch carries the unpredictable first-bounce surface. It leaves the ball to roll on the green, using the shot you have rehearsed.'},
 {name:'Carry straight to the flag',detail:'Fly the pitch almost the whole distance.',land:along(start,e.pin,.96),end:along(start,e.pin,1.42),why:'The carry reaches the flag, but the rollout is still to come. Choosing the landing spot and choosing the finish are different decisions.'}
 ]};
}
export function puttQuestion(e,start,id='putt'){
 const d=distance(start,e.pin),u=Math.min(1,Math.max(.25,d/8)),metres=n=>`${Math.abs(n).toFixed(1)} m ${n<0?'short':'long'}`;
 const plans=[
  {name:'Measured pace',leaves:[-u,u,-.5*u],shown:1,why:`These three rehearsals leave between ${(u*.5).toFixed(1)} and ${u.toFixed(1)} m. There is no holed highlight, but the whole set leaves less work than the other plans.`},
  {name:'Positive pace',leaves:[0,3.5*u,4*u],shown:0,why:`One goes in. The other two leave ${(3.5*u).toFixed(1)} and ${(4*u).toFixed(1)} m coming back. The make is valuable; it does not erase the longer returns in the rest of the sample.`},
  {name:'Soft pace',leaves:[-.5*u,-3*u,-4*u],shown:1,why:`One finishes close. The other two stop ${(3*u).toFixed(1)} and ${(4*u).toFixed(1)} m short. That attractive first ball hides a less useful full pattern.`}
 ];
 const order=Math.round(d)%3,options=[...plans.slice(order),...plans.slice(0,order)].map(o=>({...o,detail:o.leaves.map(n=>n===0?'Holed':metres(n)).join(' · '),end:along(start,e.pin,1+o.leaves[o.shown]/d)}));
 return {id,skill:'pace',kind:'putt',start,situation:`You have ${d.toFixed(1)} m left${lie(start)==='green'?' on the green':', on the smooth collar with a clear putting route'}. Below are three practice finishes for each of this example golfer’s pace plans, from a similar distance.`,question:'Which plan leaves the least work across the set?',watch:'Judge all three finishes. One good ball can flatter a plan.',correct:options.findIndex(o=>o.name==='Measured pace'),options};
}
export function questionAt(e,answers){if(!answers.length)return approachQuestion(e);const next=nextQuestion(e,answers[0].choice);if(answers.length===1)return next;if(next.kind!=='putt'&&answers.length===2)return puttQuestion(e,next.options[answers[1].choice].end);return null;}
export function outcome(e,q,choice){if(q.kind==='approach'){const end=approachEnd(e,choice);return {start:q.start,end,kind:'approach',height:27,lie:lie(end)};}const o=q.options[choice];return {start:q.start,end:o.end,land:o.land,kind:q.kind,height:q.kind==='putt'?0:q.kind==='bunker'?5:3,lie:lie(o.end)};}
export function resultLabel(e,q,choice){const o=outcome(e,q,choice),d=distance(o.end,e.pin);return `${q.kind==='putt'&&d<.01?'Holed':o.lie==='green'?`${distanceText(d)} putt left`:o.lie==='bunker'?'Front-left bunker':o.lie==='coast'?'Beyond the coast':`${d.toFixed(1)} m from the rough`}`;}
export function validAnswers(id,answers){const e=episodeById(id);if(!e||!Array.isArray(answers))return [];const clean=[];for(const a of answers.slice(0,3)){const q=questionAt(e,clean);if(!q||a.id!==q.id||!Number.isInteger(a.choice)||!q.options[a.choice]||!Number.isFinite(Date.parse(a.at)))break;clean.push({id:a.id,choice:a.choice,at:a.at});}return clean;}
// Fail during authoring if the narrative's green targets contradict the fixed geometry.
for(const e of EPISODES){if(lie(e.pin)!=='green')throw new Error('Flag outside green');}
