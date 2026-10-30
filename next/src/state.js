import {VERSION, SCENARIO} from './scenario.js';
const KEY='gamesharp-golf-next-v1';
export function freshState(){return {version:VERSION,firstAttempts:{},completions:0,cue:null,events:[],sound:false};}
export function readState(storage){
 try{
  const x=JSON.parse((storage??globalThis.localStorage).getItem(KEY));
  if(x?.version!==VERSION)return freshState();
  const firstAttempts={};for(const round of SCENARIO.rounds){const a=x.firstAttempts?.[round.id];if(a&&['flag','middle'].includes(a.choice)&&typeof a.at==='string')firstAttempts[round.id]={choice:a.choice,at:a.at};}
  return {...freshState(),firstAttempts,completions:Number.isSafeInteger(x.completions)&&x.completions>=0?x.completions:0,cue:x.cue&&typeof x.cue.savedAt==='string'?{text:SCENARIO.rounds[1].cue,savedAt:x.cue.savedAt}:null,sound:x.sound===true,events:Array.isArray(x.events)?x.events.filter(e=>e&&typeof e==='object'&&typeof e.type==='string').slice(-250):[]};
 }catch{return freshState();}
}
export function saveState(state,storage){try{(storage??globalThis.localStorage).setItem(KEY,JSON.stringify(state));return true;}catch{return false;}}
export function record(state,type,detail={}){state.events.push({type,at:new Date().toISOString(),scenario:SCENARIO.id,version:VERSION,...detail});state.events=state.events.slice(-250);saveState(state);}
export function commitAttempt(state,round,choice){const id=SCENARIO.rounds[round].id;const first=!state.firstAttempts[id];if(first)state.firstAttempts[id]={choice,at:new Date().toISOString()};record(state,'choice_committed',{round:id,choice,firstAttempt:first});return first;}
export function saveCue(state){state.cue={text:SCENARIO.rounds[1].cue,savedAt:new Date().toISOString()};record(state,'cue_saved');}
