import {VERSION,LESSONS,CASES} from './scenario.js';
import {validPlan,evaluate} from './model.js';
export const KEY='gamesharp-golf-next-v2';
export function freshState(){return {version:VERSION,firstAttempts:{},completed:{},cues:[],events:[],sound:false};}
export function readState(storage){
 try{
  const x=JSON.parse((storage??globalThis.localStorage).getItem(KEY));if(x?.version!==VERSION)return freshState();
  const firstAttempts={},completed={};
  for(const c of CASES){const a=x.firstAttempts?.[c.id];if(a&&validPlan(c,a.plan)&&typeof a.at==='string')firstAttempts[c.id]={plan:{club:a.plan.club,aim:a.plan.aim},at:a.at,strong:evaluate(c,a.plan).strong,confidence:a.confidence==='sure'?'sure':'exploring',action:a.action==='keep'?'keep':'adjust'};}
  for(const l of LESSONS)if(typeof x.completed?.[l.id]==='string'&&l.cases.every(c=>firstAttempts[c.id]))completed[l.id]=x.completed[l.id];
  return {...freshState(),firstAttempts,completed,cues:Array.isArray(x.cues)?[...new Set(x.cues.filter(id=>LESSONS.some(l=>l.id===id)))]:[],events:Array.isArray(x.events)?x.events.filter(e=>e&&typeof e==='object'&&typeof e.type==='string').slice(-500):[],sound:x.sound===true};
 }catch{return freshState();}
}
export function saveState(state,storage){try{(storage??globalThis.localStorage).setItem(KEY,JSON.stringify(state));return true;}catch{return false;}}
export function record(state,type,detail={}){state.events.push({type,at:new Date().toISOString(),version:VERSION,...detail});state.events=state.events.slice(-500);return saveState(state);}
export function commitAttempt(state,c,plan,confidence='exploring',action='adjust'){
 if(!validPlan(c,plan))throw new Error('Invalid plan');
 const first=!state.firstAttempts[c.id],a={plan:{...plan},at:new Date().toISOString(),strong:evaluate(c,plan).strong,confidence,action};
 if(first)state.firstAttempts[c.id]=a;
 const saved=record(state,'plan_committed',{case:c.id,...a,firstAttempt:first});return {first,saved,...a};
}
export function completeLesson(state,lesson){if(!lesson.cases.every(c=>state.firstAttempts[c.id]))throw new Error('Both decisions required');state.completed[lesson.id]=new Date().toISOString();return record(state,'lesson_completed',{lesson:lesson.id,firstTransferStrong:state.firstAttempts[lesson.cases[1].id].strong});}
export function saveCue(state,id){if(!LESSONS.some(l=>l.id===id))return false;if(!state.cues.includes(id))state.cues.push(id);return record(state,'cue_saved',{lesson:id});}
