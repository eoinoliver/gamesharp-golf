import {SHOTMAKER} from './scenario.js';
export const STORAGE_KEY='gamesharp-shotmaker-v1';
export const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export const shoreX=z=>28+5*Math.sin((z+12)*.031)+2*Math.sin(z*.093);
export function shotPoint(face,path,t){
 const u=clamp(t,0,1),start=(face*.8+path*.2)*Math.PI/180;
 return {x:Math.tan(start)*SHOTMAKER.distance*u+(face-path)*2.75*u*u,y:Math.sin(Math.PI*u)**.85*29,z:SHOTMAKER.distance*(1-u)};
}
export function shapeOf(face,path){const delta=face-path;return Math.abs(delta)<.25?'Straight':delta<0?'Draw':'Fade';}
export function bearing(n){return n===0?'0° · on target':`${Math.abs(n)}° ${n<0?'left':'right'}`;}
export function resultFor(face,path){const p=shotPoint(face,path,1),edge=p.x<0?23*.975:23*1.025;return {...p,shape:shapeOf(face,path),distance:Math.abs(p.x),lie:p.x>shoreX(p.z)?'water':Math.abs(p.x)<edge?'green':'rough'};}
export function readShotState(storage){
 try {const value=JSON.parse(storage.getItem(STORAGE_KEY));if(value?.version===1&&value.first&&typeof value.first==='object'&&Array.isArray(value.practice)){
  const valid=a=>a&&SHOTMAKER.cases.some(c=>c.id===a.id&&c.options.some(o=>o.path===a.path))&&Number.isFinite(a.at);
  return {version:1,first:Object.fromEntries(Object.entries(value.first).filter(([id,a])=>a.id===id&&valid(a))),practice:value.practice.filter(valid).slice(-60)};
 }}catch{}
 return {version:1,first:{},practice:[]};
}
export function recordShot(state,c,path,at=Date.now()){
 if(!c.options.some(o=>o.path===path))throw new Error('Invalid shot choice');
 const attempt={id:c.id,path,correct:path===c.correct,at};
 if(!state.first[c.id])state.first[c.id]=attempt;else state.practice.push(attempt);
 state.practice=state.practice.slice(-60);return attempt;
}
export function saveShotState(storage,state){try{storage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch{return false;}}
