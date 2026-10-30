import {SCENARIO, SHOT_OFFSETS} from './scenario.js';
export function bankX(z) { return 18 + 2.2 * Math.sin((z + 8) / 22); }
export function isWater({x,z}) { return x > bankX(z); }
export function isGreen({x,z}) { const g=SCENARIO.green; return ((x-g.x)/g.rx)**2+((z-g.z)/g.rz)**2 <= 1; }
export function surface(point) { return isWater(point)?'water':isGreen(point)?'green':'grass'; }
export function targetFor(round, choice) { return {...(choice==='flag'?SCENARIO.rounds[round].pin:{x:-3,z:0})}; }
export function pattern(round, choice) { const target=targetFor(round,choice); return SHOT_OFFSETS.map((o,i)=>({x:target.x+o.x,z:target.z+o.z,index:i,lie:surface({x:target.x+o.x,z:target.z+o.z})})); }
export function summary(round, choice) { const points=pattern(round,choice),pin=SCENARIO.rounds[round].pin; return {points,water:points.filter(p=>p.lie==='water').length,green:points.filter(p=>p.lie==='green').length,averageDistance:points.reduce((s,p)=>s+Math.hypot(p.x-pin.x,p.z-pin.z),0)/points.length}; }
export function preferredChoice(round) { const f=summary(round,'flag'),m=summary(round,'middle'); return f.water!==m.water?(f.water<m.water?'flag':'middle'):(f.averageDistance<m.averageDistance?'flag':'middle'); }
export function feedback(round, choice) {
 const good=choice===preferredChoice(round),s=summary(round,choice);
 if(round===0) return {good,title:good?'Room for the shot you actually hit.':'One good shot can hide a costly plan.',body:good?'The middle gives this pattern room. You give up some closeness to the flag to keep the water outside this example pattern.':'A single shot can finish close. But several of these example misses reach the water. Judge the whole pattern, not the best ball.',cue:SCENARIO.rounds[0].cue,summary:s};
 return {good,title:good?'This time, take the flag on.':'Safe is a condition, not a permanent target.',body:good?'The same pattern now fits around the flag without reaching the water. With the costly miss protected, you can use the closer target.':'The middle still avoids the water. But the flag now does too—and brings this example pattern closer. The situation changed, so the plan can change.',cue:SCENARIO.rounds[1].cue,summary:s};
}
