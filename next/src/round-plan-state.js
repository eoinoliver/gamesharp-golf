export const PLAN_KEY='gamesharp-round-plan-v1';
const iso=s=>typeof s==='string'&&Number.isFinite(Date.parse(s));
export const sameFocus=(a,b)=>!!a&&!!b&&a.kind===b.kind&&a.id===b.id;
const clean=s=>typeof s==='string'?s.trim().slice(0,240):'';
export const freshPlan=()=>({version:1,activeFocus:null,activePlanId:null,plans:[],reflections:[]});
export function readPlan(storage,validFocus,initialFocus=null){const s=freshPlan();let raw;
 try{raw=storage?.getItem(PLAN_KEY);if(raw==null){s.activeFocus=validFocus(initialFocus)?{...initialFocus}:null;return s;}const v=JSON.parse(raw);if(v?.version!==1)return {...s,readOnly:true};
  s.activeFocus=validFocus(v.activeFocus)?{kind:v.activeFocus.kind,id:v.activeFocus.id}:null;
  s.plans=Array.isArray(v.plans)?v.plans.filter(p=>typeof p?.id==='string'&&validFocus(p.focus)&&iso(p.at)).slice(-50).map(p=>({id:p.id,focus:{kind:p.focus.kind,id:p.focus.id},cue:clean(p.cue),intention:clean(p.intention),course:clean(p.course),at:p.at})):[];
  s.activePlanId=s.plans.some(p=>p.id===v.activePlanId)?v.activePlanId:null;
  s.reflections=Array.isArray(v.reflections)?v.reflections.filter(r=>typeof r?.id==='string'&&typeof r.planId==='string'&&validFocus(r.focus)&&['used','missed','no-chance'].includes(r.result)&&iso(r.at)).slice(-100).map(r=>({id:r.id,planId:r.planId,focus:{kind:r.focus.kind,id:r.focus.id},cue:clean(r.cue),result:r.result,note:clean(r.note),at:r.at})):[];
  return s;
 }catch{return {...s,readOnly:raw!=null};}
}
export function writePlan(storage,s){if(s.readOnly)return false;try{if(!storage)return false;storage.setItem(PLAN_KEY,JSON.stringify({version:1,activeFocus:s.activeFocus,activePlanId:s.activePlanId,plans:s.plans,reflections:s.reflections}));return true;}catch{return false;}}
export function chooseFocus(s,focus){if(!sameFocus(s.activeFocus,focus))s.activePlanId=null;s.activeFocus=focus?{...focus}:null;}
export function preparePlan(s,info,{intention='',course='',at=new Date(),id=globalThis.crypto?.randomUUID?.()||String(Date.now())}={}){if(!info||!sameFocus(s.activeFocus,info.ref))throw Error('Choose a valid focus');const existing=s.plans.find(p=>p.id===s.activePlanId&&sameFocus(p.focus,info.ref)&&!s.reflections.some(r=>r.planId===p.id));if(existing){existing.intention=clean(intention);existing.course=clean(course);return existing;}const p={id,focus:{...info.ref},cue:clean(info.cue),intention:clean(intention),course:clean(course),at:at.toISOString()};s.plans.push(p);s.plans=s.plans.slice(-50);s.activePlanId=id;return p;}
export function reflectPlan(s,planId,result,note='',at=new Date()){const p=s.plans.find(p=>p.id===planId);if(!p||!['used','missed','no-chance'].includes(result))throw Error('Choose a plan and what happened');const prior=s.reflections.find(r=>r.planId===planId);if(prior)return prior;const r={id:globalThis.crypto?.randomUUID?.()||String(+at),planId,focus:{...p.focus},cue:p.cue,result,note:clean(note),at:at.toISOString()};s.reflections.push(r);s.reflections=s.reflections.slice(-100);return r;}
