import {EPISODES,SKILLS,CHECKS,checksFor,episodeById} from './round-content.js';
import {questionAt,validAnswers} from './round-model.js';
import {NEW_LESSONS} from './academy-content.js';
export const ROUND_KEY='gamesharp-next-shot-v1',DAY=86400000;
export const freshRound=()=>({version:1,runs:{},first:{},firstChecks:{},checks:[],practice:null,cue:null,observations:[]});
const date=v=>typeof v==='string'&&Number.isFinite(Date.parse(v));
const checkById=id=>CHECKS.find(c=>c.id===id);
function validCheck(a){const q=checkById(a?.id);return q&&Number.isInteger(a.choice)&&q.options[a.choice]&&date(a.at);}
export function readRound(storage){const s=freshRound();try{const r=JSON.parse(storage?.getItem(ROUND_KEY));if(r?.version!==1)return s;
 for(const e of EPISODES){const f=validAnswers(e.id,r.first?.[e.id]);if(f.length)s.first[e.id]=f;const run=r.runs?.[e.id];if(!run)continue;const answers=validAnswers(e.id,run.answers);const hasNext=!!questionAt(e,answers);const phase=['question','feedback','transfer','complete'].includes(run.phase)?run.phase:'question';
 s.runs[e.id]={answers,phase:phase==='feedback'&&answers.length?'feedback':!hasNext?(phase==='complete'?'complete':'transfer'):'question',transfer:validCheck(run.transfer)&&run.transfer.id===transferFor(e).id?{id:run.transfer.id,choice:run.transfer.choice,at:run.transfer.at}:null};
 if(s.runs[e.id].phase==='complete'&&!s.runs[e.id].transfer)s.runs[e.id].phase='transfer';
 }
 s.checks=Array.isArray(r.checks)?r.checks.filter(validCheck).slice(-120).map(a=>({id:a.id,choice:a.choice,at:a.at,delayed:a.delayed===true})):[];
 for(const a of [...Object.values(r.firstChecks||{}),...s.checks].filter(validCheck).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)))if(!s.firstChecks[a.id])s.firstChecks[a.id]={id:a.id,choice:a.choice,at:a.at};
 const p=r.practice;if(p&&checkById(p.id)&&date(p.started))s.practice={id:p.id,started:p.started,phase:p.phase==='feedback'&&validCheck(p.answer)&&p.answer.id===p.id?'feedback':'question',answer:validCheck(p.answer)?{id:p.answer.id,choice:p.answer.choice,at:p.answer.at,delayed:p.answer.delayed===true}:null};
 s.cue=SKILLS[r.cue]?r.cue:null;s.observations=Array.isArray(r.observations)?r.observations.filter(o=>SKILLS[o.skill]&&['used','missed','no-chance'].includes(o.result)&&date(o.at)).slice(-30).map(o=>({skill:o.skill,result:o.result,at:o.at,note:typeof o.note==='string'?o.note.slice(0,240):''})):[];
 }catch{}return s;}
export function writeRound(storage,s){try{storage.setItem(ROUND_KEY,JSON.stringify(s));return true;}catch{return false;}}
export function startRound(s,id,restart=false){if(!episodeById(id))throw new Error('Unknown episode');if(restart||!s.runs[id])s.runs[id]={answers:[],phase:'question',transfer:null};return s.runs[id];}
export function commitRound(s,id,choice,now=new Date()){const r=s.runs[id],e=episodeById(id),q=questionAt(e,r?.answers||[]);if(r?.phase!=='question'||!q?.options[choice]||!Number.isInteger(choice))throw new Error('Invalid round commitment');const a={id:q.id,choice,at:now.toISOString()};r.answers.push(a);s.first[id]??=[];if(questionAt(e,s.first[id])?.id===q.id)s.first[id].push(a);r.phase='feedback';return q;}
export function advanceRound(s,id){const r=s.runs[id];if(r.phase!=='feedback')return;r.phase=questionAt(episodeById(id),r.answers)?'question':'transfer';}
export function transferFor(e){return checksFor(e.id==='permission'?'evidence':'space')[e.transfer];}
export function commitTransfer(s,id,choice,now=new Date()){const r=s.runs[id],q=transferFor(episodeById(id));if(r?.phase!=='transfer'||r.transfer||!Number.isInteger(choice)||!q.options[choice])throw new Error('Invalid transfer');r.transfer={id:q.id,choice,at:now.toISOString()};r.phase='complete';s.firstChecks[q.id]??={...r.transfer};if(!s.checks.some(a=>a.id===q.id))s.checks.push({...r.transfer,delayed:false});}
const lessonSkill={ 'start-and-bend':'evidence','straight-is-not-target':'evidence','enough-curve':'evidence','landing-not-hole':'landing','carry-the-trouble':'landing','surface-changes':'landing','pace-and-line':'pace','distance-before-perfection':'pace','same-distance-new-slope':'pace'};
export function evidenceFor(s,learning={first:{}}){const rows=Object.keys(SKILLS).map(skill=>({skill,attempts:0,misses:0,last:0,anchor:0,delayed:0,lastCheck:null}));const add=(skill,correct,at)=>{const r=rows.find(x=>x.skill===skill);r.attempts++;r.misses+=!correct;r.last=Math.max(r.last,Date.parse(at)||0);};
 for(const e of EPISODES){const taken=[];for(const a of s.first[e.id]||[]){const q=questionAt(e,taken);if(!q)break;add(q.skill,a.choice===q.correct,a.at);taken.push(a);}}
 for(const l of NEW_LESSONS)for(let i=0;i<3;i++){const a=learning.first?.[`${l.id}:${i}`];if(a&&['landing','pace'].includes(lessonSkill[l.id]))add(lessonSkill[l.id],a.choice===l.questions[i].correct,a.at);}
 for(const r of rows)r.anchor=r.last;
 for(const a of Object.values(s.firstChecks).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at))){const q=checkById(a.id),r=rows.find(x=>x.skill===q.skill);add(q.skill,a.choice===q.correct,a.at);if(!r.anchor)r.anchor=Date.parse(a.at);}
 for(const a of s.checks){if(!a.delayed)continue;const q=checkById(a.id),r=rows.find(x=>x.skill===q.skill);r.delayed++;r.lastCheck=a;}
 return rows;}
export function reviewStatus(s,row,now=Date.now()){
 const history=s.checks.filter(a=>a.delayed&&checkById(a.id).skill===row.skill).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));let streak=0;for(const a of history)streak=a.choice===checkById(a.id).correct?streak+1:0;
 const last=history.at(-1);const base=last?Date.parse(last.at):row.anchor;const interval=streak===0?1:streak===1?3:7;return {due:row.attempts>0&&now>=base+interval*DAY,at:base+interval*DAY,interval,streak,last};
}
export function recommend(s,learning,now=Date.now()){
 const rows=evidenceFor(s,learning);const ranked=rows.map(r=>{const status=reviewStatus(s,r,now),last=s.checks.filter(a=>checkById(a.id).skill===r.skill).at(-1),observation=s.observations.filter(o=>o.skill===r.skill).at(-1),noticed=observation?.result==='missed'&&Date.parse(observation.at)>(last?Date.parse(last.at):0);return {...r,...status,noticed,priority:noticed?1.2:status.last&&status.last.choice!==checkById(status.last.id).correct?1:r.attempts?r.misses/Math.max(1,r.attempts)/(1+status.streak*4):.15};}).sort((a,b)=>Number(b.due)-Number(a.due)||b.priority-a.priority||Number(!!a.attempts)-Number(!!b.attempts)||a.last-b.last);return ranked[0];
}
export function startPractice(s,learning,skill,now=new Date()){
 if(s.practice?.phase==='question'&&(!skill||checkById(s.practice.id).skill===skill))return checkById(s.practice.id);
 const row=skill&&SKILLS[skill]?evidenceFor(s,learning).find(r=>r.skill===skill):recommend(s,learning,now.getTime());const bank=checksFor(row.skill);const done=s.checks.filter(a=>checkById(a.id).skill===row.skill);const latest=done.at(-1);const q=bank[(latest?bank.findIndex(x=>x.id===latest.id)+1:0)%bank.length];s.practice={id:q.id,started:now.toISOString(),phase:'question',answer:null};return q;
}
export function commitPractice(s,learning,choice,now=new Date()){
 const p=s.practice,q=checkById(p?.id);if(p?.phase!=='question'||!Number.isInteger(choice)||!q?.options[choice])throw new Error('Invalid practice');const row=evidenceFor(s,learning).find(r=>r.skill===q.skill);const delayed=reviewStatus(s,row,Date.parse(p.started)).due;const a={id:q.id,choice,at:now.toISOString(),delayed};s.firstChecks[q.id]??={id:q.id,choice,at:a.at};s.checks.push(a);s.checks=s.checks.slice(-120);p.answer=a;p.phase='feedback';return a;
}
export const practiceQuestion=s=>checkById(s.practice?.id);
