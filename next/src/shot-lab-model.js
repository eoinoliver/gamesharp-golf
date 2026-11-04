import {SHOT_LAB_LESSON} from './scenario.js';
export const LESSON=SHOT_LAB_LESSON;
export const STORAGE_KEY='gamesharp-golf-shot-lab-v1';
export const MOTION={start:135,top:263,impact:334,end:447,fps:120};
export const duration=(MOTION.end-MOTION.start)/MOTION.fps;
export const impactTime=(MOTION.impact-MOTION.start)/MOTION.fps;
export const topTime=(MOTION.top-MOTION.start)/MOTION.fps;
export function curveFor(c){return c.face<c.path?'left':c.face>c.path?'right':'straight';}
export function launchAngle(c){return .85*c.face+.15*c.path;}
// Deliberately illustrative: no measured yardage, spin or flight probability.
export function flightPoint(c,t){
 const u=Math.max(0,Math.min(1,t));
 return {x:u*22,y:.027+Math.sin(Math.PI*u)*5.5,z:Math.tan(launchAngle(c)*Math.PI/180)*22*u+Math.sign(c.face-c.path)*6*u*u};
}
export function freshRecord(){return {version:1,first:{},practice:[],events:[],cueSaved:false};}
export function readRecord(storage){
 try{
  const x=JSON.parse(storage.getItem(STORAGE_KEY));if(x?.version!==1)return freshRecord();
  const first={};for(const c of LESSON.cases){const a=x.first?.[c.id];if(a&&['left','right'].includes(a.choice)&&typeof a.at==='string')first[c.id]={choice:a.choice,correct:a.choice===c.correct,at:a.at};}
  return {...freshRecord(),first,practice:Array.isArray(x.practice)?x.practice.slice(-100):[],events:Array.isArray(x.events)?x.events.slice(-200):[],cueSaved:x.cueSaved===true};
 }catch{return freshRecord();}
}
export function commitAnswer(record,c,choice,now=new Date().toISOString()){
 if(!['left','right'].includes(choice))throw new Error('Choose a flight first');
 const attempt={choice,correct:curveFor(c)===choice,at:now};
 const first=!record.first[c.id];if(first)record.first[c.id]=attempt;else record.practice.push({case:c.id,...attempt});
 record.practice=record.practice.slice(-100);return {...attempt,first};
}
export function saveRecord(record,storage){try{storage.setItem(STORAGE_KEY,JSON.stringify(record));return true;}catch{return false;}}
export function directionDiagram(c,{flight=false}={}){
 const end=a=>({x:150+Math.sin(a*Math.PI/180)*220,y:245-Math.cos(a*Math.PI/180)*220});const f=end(c.face),p=end(c.path);
 const curve=curveFor(c)==='left'?'M150 245 Q200 130 95 32':'M150 245 Q190 155 260 45';
 return `<svg viewBox="0 0 320 290" role="img" aria-label="Target straight ahead. Face points right. Club path points ${c.path>0?'farther right':'left'}.${flight?` Ball curves ${curveFor(c)}.`:''}"><defs><marker id="tip-face" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3 0 6" fill="#edc879"/></marker><marker id="tip-path" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3 0 6" fill="#91d6d9"/></marker></defs><path d="M150 260V15" stroke="#a9b4a3" stroke-dasharray="4 5"/><path d="M150 245L${f.x} ${f.y}" stroke="#edc879" stroke-width="4" marker-end="url(#tip-face)"/><path d="M150 245L${p.x} ${p.y}" stroke="#91d6d9" stroke-width="4" marker-end="url(#tip-path)"/>${flight?`<path d="${curve}" fill="none" stroke="#fff9e6" stroke-width="3" stroke-dasharray="7 4"/>`:''}<circle cx="150" cy="245" r="7" fill="#fff9e6"/><text x="134" y="15" text-anchor="end" fill="#bdc8b9">Target</text><text x="${f.x-4}" y="${f.y+17}" fill="#edc879">Face</text><text x="${p.x+10}" y="${p.y+10}" fill="#91d6d9">Path</text></svg>`;
}
