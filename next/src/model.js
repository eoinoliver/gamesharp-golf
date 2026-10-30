import {COURSE,SHOT_OFFSETS} from './scenario.js';
export const AIM_MIN=-26, AIM_MAX=14;
export function bankX(z){return 18+2.2*Math.sin((z+8)/22);}
export function isWater({x,z}){return x>bankX(z);}
export function inEllipse({x,z},e){return ((x-e.x)/e.rx)**2+((z-e.z)/e.rz)**2<=1;}
export function isGreen(p){return inEllipse(p,COURSE.green);}
export function fairway(z){return {x:-13+Math.sin(z*.025)*4,width:11+5*Math.sin((z+30)*.015)};}
export function isFairway({x,z}){const f=fairway(z);return z>17&&z<300&&Math.abs(x-f.x)<f.width;}
export function surface(p,c){if(isWater(p))return 'water';if([COURSE.bunker,...c.bunkers].some(b=>inEllipse(p,b)))return 'bunker';if(c.trees.some(t=>inEllipse(p,t)))return 'trees';return isGreen(p)?'green':isFairway(p)?'fairway':'rough';}
export function getClub(c,plan){const club=c.clubs.find(x=>x.id===plan.club);if(!club)throw new Error('Unknown club');return club;}
export function validPlan(c,p){return !!p&&c.clubs.some(x=>x.id===p.club)&&Number.isInteger(p.aim)&&p.aim>=AIM_MIN&&p.aim<=AIM_MAX;}
export function targetFor(c,p){return {x:p.aim,z:getClub(c,p).z};}
export function offsets(c,club){return SHOT_OFFSETS.map((o,i)=>c.outlier?.index===i?{x:c.outlier.x,z:c.outlier.z}:{x:o.x*club.sx+club.bx,z:o.z*club.sz+club.bz});}
export function blockedRoute(p,c){return c.trees.some(e=>{
 // Closest point on the segment in ellipse-normalised coordinates.
 const ax=(p.x-e.x)/e.rx,az=(p.z-e.z)/e.rz,bx=(c.pin.x-e.x)/e.rx,bz=(c.pin.z-e.z)/e.rz;
 const dx=bx-ax,dz=bz-az,den=dx*dx+dz*dz,t=den?Math.max(0,Math.min(1,-(ax*dx+az*dz)/den)):0;
 return (ax+t*dx)**2+(az+t*dz)**2<=1;
 });}
export function pattern(c,plan){const target=targetFor(c,plan),club=getClub(c,plan);return offsets(c,club).map((o,index)=>{const p={x:target.x+o.x,z:target.z+o.z,index};return {...p,lie:surface(p,c),blocked:blockedRoute(p,c),distance:Math.hypot(p.x-c.pin.x,p.z-c.pin.z)};});}
export function pointsFor(p,c){
 if(p.lie==='water')return -3;
 if(['bunker','trees'].includes(p.lie))return 0;
 if(c.objective==='fairway')return p.lie==='fairway'?3:1;
 if(c.objective==='route')return p.lie==='fairway'&&!p.blocked?3:p.blocked?0:1;
 return p.lie==='green'?3+(p.distance<=8?2:0):1;
}
export function summary(c,plan){const points=pattern(c,plan);return {points,score:points.reduce((n,p)=>n+pointsFor(p,c),0),water:points.filter(p=>p.lie==='water').length,bunker:points.filter(p=>p.lie==='bunker').length,green:points.filter(p=>p.lie==='green').length,fairway:points.filter(p=>p.lie==='fairway').length,clear:points.filter(p=>p.lie==='fairway'&&!p.blocked).length,close:points.filter(p=>p.lie==='green'&&p.distance<=8).length,averageDistance:points.reduce((n,p)=>n+p.distance,0)/12};}
const references=new Map();
export function bestPlan(c){if(references.has(c))return {...references.get(c)};let best=null,bs=null;for(const club of c.clubs)for(let aim=AIM_MIN;aim<=AIM_MAX;aim++){const p={club:club.id,aim},s=summary(c,p);if(!bs||s.score>bs.score||(s.score===bs.score&&s.averageDistance<bs.averageDistance)){best=p;bs=s;}}references.set(c,best);return {...best};}
export function evaluate(c,plan){const s=summary(c,plan),best=summary(c,bestPlan(c)),gap=best.score-s.score;return {...s,gap,strong:gap<=2,workable:gap<=5};}
export function carryWindow(c,club){const zs=offsets(c,club).map(o=>Math.round(c.start.z-club.z-o.z));return {min:Math.min(...zs),max:Math.max(...zs),intended:c.start.z-club.z};}
export function aimLabel(aim){const n=aim-COURSE.green.x;return n===0?'Green centre line':`${Math.abs(n)} m ${n<0?'left':'right'} of green centre`;}
export function rules(c){return c.objective==='fairway'?'Fairway +3 · other grass +1 · bunker / trees 0 · water −3':c.objective==='route'?'Fairway + clear route +3 · other clear grass +1 · blocked / bunker / trees 0 · water −3':'Green +3 · within 8 m of pin +2 extra · other grass +1 · bunker / trees 0 · water −3';}
