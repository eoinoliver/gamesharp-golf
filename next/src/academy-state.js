import {NEW_LESSONS,byId} from './academy-content.js';
export const LEARNING_KEY='gamesharp-learning-v1';
export const DAY=86400000;
export const freshLearning=()=>({version:1,first:{},completed:{},sessions:{},saved:[],reviews:{},days:[],focus:null});
const iso=v=>typeof v==='string'&&Number.isFinite(Date.parse(v));
export function loadLearning(storage){
 const s=freshLearning();try{const raw=JSON.parse(storage?.getItem(LEARNING_KEY));if(raw?.version!==1)return s;
 for(const l of NEW_LESSONS){for(let i=0;i<3;i++){const key=`${l.id}:${i}`,a=raw.first?.[key];if(a&&Number.isInteger(a.choice)&&l.questions[i].options[a.choice]&&iso(a.at))s.first[key]={choice:a.choice,at:a.at};}
 if(iso(raw.completed?.[l.id])&&[0,1,2].every(i=>s.first[`${l.id}:${i}`]))s.completed[l.id]=raw.completed[l.id];
 const x=raw.sessions?.[l.id];if(x&&Number.isInteger(x.index)&&x.index>=0&&x.index<=3&&['question','feedback','complete'].includes(x.phase)){
  const valid=x.phase==='question'||x.phase==='complete'||(Number.isInteger(x.choice)&&l.questions[x.index].options[x.choice]);
  if(valid&&(x.phase!=='complete'||s.completed[l.id])&&(x.index===3?!!s.completed[l.id]:Array.from({length:x.index},(_,i)=>i).every(i=>s.first[`${l.id}:${i}`])))s.sessions[l.id]={index:x.index,phase:x.phase,choice:x.phase==='feedback'?x.choice:null};
 }
 const r=raw.reviews?.[l.id];if(Array.isArray(r))s.reviews[l.id]=r.filter(a=>Number.isInteger(a.choice)&&l.questions[3].options[a.choice]&&iso(a.at)).slice(-20).map(a=>({choice:a.choice,at:a.at}));
 }
 s.saved=Array.isArray(raw.saved)?[...new Set(raw.saved.filter(id=>byId(id)&&s.completed[id]))]:[];
 s.days=Array.isArray(raw.days)?[...new Set(raw.days.filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)))].slice(-366):[];
 s.focus=byId(raw.focus)&&(byId(raw.focus).legacy||s.saved.includes(raw.focus))?raw.focus:null;
 }catch{}return s;
}
export function saveLearning(storage,s){try{if(!storage)return false;storage.setItem(LEARNING_KEY,JSON.stringify(s));return true;}catch{return false;}}
export function dayKey(now=new Date()){return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;}
export function recordAnswer(s,id,index,choice,now=new Date()){
 const l=byId(id);if(!l||l.legacy||!l.questions[index]?.options[choice]||!Number.isInteger(choice))throw new Error('Unknown learning answer');
 const a={choice,at:now.toISOString()},key=`${id}:${index}`;
 if(index<3&&!s.first[key])s.first[key]=a;
 if(index===3){s.reviews[id]??=[];s.reviews[id].push(a);s.reviews[id]=s.reviews[id].slice(-20);}
 s.sessions[id]={index,phase:'feedback',choice};
 const day=dayKey(now);if(!s.days.includes(day))s.days.push(day);s.days=s.days.slice(-366);
 return choice===l.questions[index].correct;
}
export function finishLearning(s,id,now=new Date()){
 if(![0,1,2].every(i=>s.first[`${id}:${i}`]))throw new Error('Finish all three decisions first');
 s.completed[id]??=now.toISOString();s.sessions[id]={index:2,phase:'complete',choice:null};
}
export function dueLessons(s,now=Date.now()){
 return NEW_LESSONS.filter(l=>{const at=s.completed[l.id];if(!at)return false;const reviews=s.reviews[l.id]||[],last=reviews.at(-1)?.at||at;return now-Date.parse(last)>=DAY;});
}
export function firstScore(s,l){return [0,1,2].filter(i=>s.first[`${l.id}:${i}`]?.choice===l.questions[i].correct).length;}
