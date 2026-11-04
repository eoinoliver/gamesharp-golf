import {SHOTMAKER_NINE} from './scenario.js';
import {shotPoint,resultFor,shapeOf} from './shotmaker-model.js';

export const JOURNEY_KEY='gamesharp-shotmaker-journey-v1';
export const localDay=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const angle=n=>Number.isInteger(n)&&n>=-8&&n<=8;
const validDay=day=>typeof day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(day)&&!Number.isNaN(Date.parse(`${day}T12:00:00Z`))&&new Date(`${day}T12:00:00Z`).toISOString().slice(0,10)===day;
const fresh=()=>({version:1,workshop:{},cards:[],daily:{}});

export function dailyChallenge(day=localDay()){
 if(!validDay(day))throw new Error('Invalid challenge date');
 const serial=Math.floor(Date.parse(`${day}T12:00:00Z`)/86400000),side=serial%2?1:-1,variant=Math.floor(serial/2)%12;
 const common={id:`daily-${day}`,day,title:'One shot. Your signature.',face:null,path:null,initial:[0,0],radius:3};
 if(variant<4){const face=(variant%3+1)*side,radius=[2,3,4,3][variant];return {...common,face,radius,initial:[face,0],shape:side>0?'Draw':'Fade',brief:`The face is fixed ${Math.abs(face)}° ${side>0?'right':'left'}. Shape it back inside ${radius} metres. Your first shot is the daily record; you can practise afterwards.`};}
 if(variant<8){const path=(variant-1)*side,radius=variant%2?3:2;return {...common,path,radius,initial:[0,path],shape:side>0?'Draw':'Fade',brief:`The path is fixed ${Math.abs(path)}° ${side>0?'right':'left'}. Find a face direction that brings the ball inside ${radius} metres. First shot counts; practice stays separate.`};}
 const window=variant%2?[1.2,1.8]:[.55,1.1],radius=variant<10?2:3;
 return {...common,gate:side>0?window:[-window[1],-window[0]],radius,brief:`Pass through the teal start window, then finish inside ${radius} metres. Both controls are yours. First shot counts; practice stays separate.`};
}
export function validSettings(c,face,path){return angle(face)&&angle(path)&&(c.face===null||face===c.face)&&(c.path===null||path===c.path);}
export function judgeChallenge(c,face,path){
 if(!validSettings(c,face,path))throw new Error('Settings do not match this challenge');
 const result=resultFor(face,path),gateX=shotPoint(face,path,.25).x;
 const startOK=c.gate?gateX>=c.gate[0]-1e-9&&gateX<=c.gate[1]+1e-9:result.shape===c.shape;
 const shapeOK=!c.shape||result.shape===c.shape,finishOK=result.distance<=c.radius+1e-9;
 const checks=[{id:'start',label:c.gate?'Through the start window':`${c.shape} flight`,pass:startOK&&shapeOK,detail:c.gate?`${Math.abs(gateX).toFixed(2)} m ${gateX<0?'left':'right'} at 40 m`:`${result.shape} · face ${Math.abs(face-path)}° ${face===path?'aligned with':face<path?'left of':'right of'} path`},{id:'finish',label:`Inside ${c.radius} m of the flag`,pass:finishOK,detail:`${result.distance.toFixed(1)} m ${result.x<0?'left':'right'} · model`}];
 let feedback;
 if(checks.every(x=>x.pass))feedback=c.gate?'You controlled the start and the finish. The face set the window; its relationship to the path brought the ball home.':'You made the relationship work. The ball started to one side and curved back into the target.';
 else if(!shapeOK||(!c.gate&&!startOK))feedback=`This produced ${result.shape==='Straight'?'a straight ball':`a ${result.shape.toLowerCase()}`}. A ${c.shape.toLowerCase()} needs the face ${c.shape==='Draw'?'left':'right'} of the path. Compare the two directions before changing the next shot.`;
 else if(!startOK)feedback=`The ball passed ${Math.abs(gateX).toFixed(2)} m ${gateX<0?'left':'right'} at 40 m, outside the teal window. ${c.face===null?`Move the face a little ${gateX<c.gate[0]?'right':'left'} to shift the start. Then adjust the path to recover the finish.`:'Keep the face fixed and adjust the path; check the start as well as the bend.'}`;
 else feedback=`The start worked. The ball finished ${result.distance.toFixed(1)} m ${result.x<0?'left':'right'}. ${c.path===null?`Keep the face and move the path a little ${result.x>0?'right':'left'} to move the finish ${result.x>0?'left':'right'}.`:`Keep the path and move the face a little ${result.x>0?'left':'right'} to shift the finish toward the flag.`}`;
 return {...result,gateX,pass:checks.every(x=>x.pass),checks,feedback};
}
export function routesFor(c){const routes=[];for(let face=-8;face<=8;face++)for(let path=-8;path<=8;path++)if(validSettings(c,face,path)&&judgeChallenge(c,face,path).pass)routes.push({face,path,distance:resultFor(face,path).distance});return routes.sort((a,b)=>a.distance-b.distance||Math.abs(a.face)-Math.abs(b.face));}
function cleanAttempt(c,a){return a&&validSettings(c,a.face,a.path)&&Number.isFinite(a.at)&&a.at>=0?{face:a.face,path:a.path,at:a.at,assisted:a.assisted===true}:null;}
function keepWorkshop(c,rows){const firstSuccess=rows.find(a=>judgeChallenge(c,a.face,a.path).pass);return rows.filter((a,i)=>i===0||a===firstSuccess||i>=rows.length-48);}
export function readJourney(storage){
 const s=fresh();
 try{const raw=JSON.parse(storage.getItem(JOURNEY_KEY));if(raw?.version!==1)return s;
  for(const c of SHOTMAKER_NINE.workshop){const rows=raw.workshop?.[c.id];if(Array.isArray(rows))s.workshop[c.id]=keepWorkshop(c,rows.map(a=>cleanAttempt(c,a)).filter(Boolean));}
  if(Array.isArray(raw.cards)){const ids=new Set();s.cards=raw.cards.filter(card=>card&&typeof card.id==='string'&&card.id.length<100&&Number.isFinite(card.startedAt)&&Array.isArray(card.attempts)&&card.attempts.length<=3).map(card=>{
   const attempts=[];for(let i=0;i<card.attempts.length;i++){const a=cleanAttempt(SHOTMAKER_NINE.pressure[i],card.attempts[i]);if(!a)break;attempts.push({...a,assisted:false});}return {id:card.id,startedAt:card.startedAt,attempts};
  }).filter(card=>{if(ids.has(card.id))return false;ids.add(card.id);return true;}).filter((_,i,all)=>i===0||i>=all.length-29);
  // An incomplete older card cannot be used to overwrite a completed first card.
  s.cards=s.cards.filter((c,i,all)=>c.attempts.length===3||i===all.length-1);}
  if(raw.daily&&typeof raw.daily==='object')for(const day of Object.keys(raw.daily).filter(validDay).sort().slice(-90)){const c=dailyChallenge(day),entry=raw.daily[day],first=cleanAttempt(c,entry?.first);if(first)s.daily[day]={first,practice:Array.isArray(entry.practice)?entry.practice.map(a=>cleanAttempt(c,a)).filter(Boolean).slice(-30):[]};}
 }catch{}
 return s;
}
export function saveJourney(storage,state){try{storage.setItem(JOURNEY_KEY,JSON.stringify(state));return true;}catch{return false;}}
export function workshopCleared(state,c){return (state.workshop[c.id]||[]).some(a=>judgeChallenge(c,a.face,a.path).pass);}
export function recordWorkshop(state,c,face,path,{assisted=false,at=Date.now()}={}){
 if(!SHOTMAKER_NINE.workshop.some(row=>row.id===c.id))throw new Error('Unknown workshop');judgeChallenge(c,face,path);const a={face,path,at,assisted},list=state.workshop[c.id]??=[];list.push(a);state.workshop[c.id]=keepWorkshop(c,list);return a;
}
export function beginCard(state,at=Date.now()){
 const last=state.cards.at(-1);if(last&&last.attempts.length<3)return last;
 const card={id:`card-${at}-${state.cards.length}`,startedAt:at,attempts:[]};state.cards.push(card);if(state.cards.length>30)state.cards.splice(1,state.cards.length-30);return card;
}
export function recordCard(state,id,face,path,at=Date.now()){
 const card=state.cards.find(c=>c.id===id);if(!card||card.attempts.length>=3)throw new Error('Card is closed');const c=SHOTMAKER_NINE.pressure[card.attempts.length];judgeChallenge(c,face,path);const a={face,path,at,assisted:false};card.attempts.push(a);return a;
}
export function recordDaily(state,day,face,path,at=Date.now()){
 const c=dailyChallenge(day);judgeChallenge(c,face,path);const a={face,path,at,assisted:false};if(!state.daily[day])state.daily[day]={first:a,practice:[]};else {state.daily[day].practice.push(a);state.daily[day].practice=state.daily[day].practice.slice(-30);}const keys=Object.keys(state.daily).sort();for(const key of keys.slice(0,-90))delete state.daily[key];return a;
}
export const cardScore=card=>card.attempts.reduce((n,a,i)=>n+Number(judgeChallenge(SHOTMAKER_NINE.pressure[i],a.face,a.path).pass),0);
