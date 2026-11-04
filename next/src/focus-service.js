import {byId,lessonURL} from './academy-content.js';
import {dueLessons,loadLearning} from './academy-state.js';
import {readState as readCourse} from './state.js';
import {SKILLS} from './round-content.js';
import {readRound,reviewStatus,evidenceFor,recommend} from './round-state.js';
import {OBSERVATIONS} from './sharpen-content.js';
import {PLAN_KEY,readPlan,writePlan,chooseFocus,sameFocus} from './round-plan-state.js';
export function focusInfo(ref){if(!ref)return null;
 if(ref.kind==='lesson'){const l=byId(ref.id);return l?{ref,title:l.title,cue:l.cue,practice:l.practice||'Apply this idea to the actual hole and your own pattern before deciding.',href:lessonURL(l),legacy:l.legacy}:null;}
 if(ref.kind==='skill'){const s=SKILLS[ref.id];return s?{ref,title:s.name,cue:s.cue,practice:s.practice,href:`?practice=1&new=1&skill=${ref.id}`}:null;}
 if(ref.kind==='observation'){const o=OBSERVATIONS[ref.id];return o?{ref,...o,href:`?review=1&observe=${ref.id}`}:null;}
 return null;
}
export function createFocusService(storage,{learning=loadLearning(storage),round=readRound(storage),course=readCourse(storage)}={}){
 const valid=r=>!!focusInfo(r);const legacy=SKILLS[round.cue]?{kind:'skill',id:round.cue}:byId(learning.focus)&&(byId(learning.focus).legacy?course.cues.includes(learning.focus):learning.saved.includes(learning.focus))?{kind:'lesson',id:learning.focus}:null;
 let state=readPlan(storage,valid,legacy),saved=true;
 // Initialize once; an explicit null in the new store must never resurrect an old cue.
 try{if(storage?.getItem(PLAN_KEY)==null)saved=writePlan(storage,state);}catch{saved=false;}
 const service={get state(){return state;},get saved(){return saved;},info:()=>focusInfo(state.activeFocus),persist(){saved=writePlan(storage,state);return saved;},select(ref){if(ref&&!valid(ref))throw Error('Unknown focus');chooseFocus(state,ref);return service.persist();},reload(){state=readPlan(storage,valid,legacy);return state;}};
 return service;
}
export function focusNext(ref,{learning,round},now=Date.now()){
 const info=focusInfo(ref);if(!info)return null;
 if(ref.kind==='lesson'){const l=byId(ref.id),due=dueLessons(learning,now).some(x=>x.id===l.id),done=l.legacy?false:!!learning.completed[l.id];return {href:due?`?learn=${l.id}&check=1`:info.href,label:due?'Try a fresh check after a break':done||l.legacy?'Revisit this decision':'Explore this decision',due};}
 if(ref.kind==='skill'){const row=evidenceFor(round,learning).find(r=>r.skill===ref.id),due=reviewStatus(round,row,now).due;return {href:info.href,label:due?'Try a fresh check after a break':'Practise this decision',due};}
 return {href:info.href,label:'Return to my observation',due:false};
}
export function nextUseful(service,learning,round,now=Date.now()){
 const last=service.state.reflections.at(-1);
 // User-selected focus stays authoritative; reflection is context, never a score.
 if(service.state.activeFocus)return {...focusNext(service.state.activeFocus,{learning,round},now),info:service.info(),noticed:last&&sameFocus(last.focus,service.state.activeFocus)?last.result:null};
 const due=dueLessons(learning,now)[0];if(due)return {...focusNext({kind:'lesson',id:due.id},{learning,round},now),info:focusInfo({kind:'lesson',id:due.id})};
 const r=recommend(round,learning,now);return r.due?{...focusNext({kind:'skill',id:r.skill},{learning,round},now),info:focusInfo({kind:'skill',id:r.skill})}:null;
}
export function allReflections(service,round){return [...round.observations.map((o,i)=>({...o,id:`earlier-${i}-${o.at}`,focus:{kind:'skill',id:o.skill},cue:SKILLS[o.skill]?.cue})),...service.state.reflections].sort((a,b)=>Date.parse(b.at)-Date.parse(a.at));}
