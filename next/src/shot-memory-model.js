import {SHOT_MEMORIES} from './scenario.js';
import {resultFor, shotPoint} from './shotmaker-model.js';

export const MEMORY_KEY = 'gamesharp-shotbook-v1';
export const REVIEW_DELAY = 24 * 60 * 60 * 1000;
const phases = ['decision', 'reveal', 'transfer', 'transfer-result', 'complete'];
const directions = ['left', 'centre', 'right'];
const curves = ['left', 'straight', 'right'];
const fresh = () => ({version:1, draft:{note:'', start:null, curve:null}, entries:[], activeId:null});
export const memoryCase = id => SHOT_MEMORIES.cases.find(c => c.id === id);
export const caseForFlight = (start, curve) => SHOT_MEMORIES.cases.find(c => c.start === start && c.curve === curve);
export const cleanNote = value => typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').slice(0,280) : '';
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
export function choiceOrder(entry, options, phase) {
 // Keep a shot's letters stable on reload, without making one letter the rule.
 let hash=2166136261;
 for(const char of `${entry.id}:${phase}`)hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0;
 const offset=hash%options.length,rows=options.map((_,i)=>options[(i+offset)%options.length]);
 return hash&8?rows.reverse():rows;
}

// Deliberately conservative convenience, not an LLM or a swing diagnosis.
// Suggestions never commit a shot; the player confirms both observations.
export function suggestFlight(note) {
 const text = cleanNote(note).toLowerCase();
 const start = text.match(/(?:start(?:ed|s)?|launch(?:ed|es)?|began)\s+(?:a little |slightly |to the )?(left|right|straight|on line|on target)/)?.[1];
 const curve = text.match(/(?:curv(?:e|ed|es)|b(?:end|ent|ends)|turn(?:ed|s)?)\s+(?:further |farther |back |to the )*(left|right)/)?.[1];
 return {start:start ? ['straight','on line','on target'].includes(start) ? 'centre' : start : null,
  curve:curve ?? (/\b(?:stayed|flew|went) straight\b|\bno curve\b/.test(text) ? 'straight' : null)};
}
export function scopeIssue(note) {
 if (/\b(driver|woods?|hybrid|putt\w*|chip\w*|pitch(?:ed|es|ing)?|bunker|sand shot)\b/i.test(note)) return 'shot';
 if (/\b((?:cross|head|tail)?wind\w*|shank\w*|topp?ed|fat|thin|heel|toe|off.centre|off.center)\b/i.test(note)) return 'conditions';
 return null;
}
export function changeFor(entry) { const c=memoryCase(entry.caseId); return c.options.find(o=>o.id===entry.shownChoice) ?? c.original; }
export function changedOutcome(entry) {
 const c=memoryCase(entry.caseId), choice=changeFor(entry);
 return {before:resultFor(c.original.face,c.original.path), after:resultFor(choice.face,choice.path), correct:choice.id===c.correct};
}
export function flightWords(face,path) {
 const angle=.8*face+.2*path;
 const start=Math.abs(angle)<.25?'near the target line':angle<0?'left':'right';
 const bend=Math.abs(face-path)<.25?'flies straight':`curves ${face<path?'left':'right'}`;
 return `Starts ${start}; ${bend}.`;
}
export function replayPoint(face,path,t) { return shotPoint(face,path,Math.max(0,Math.min(1,t))); }
export function transferFor(entry, delayed=false) { const c=memoryCase(entry.caseId); return SHOT_MEMORIES.transfer(c.family,c.sign,delayed); }
const validTime = at => Number.isFinite(at) && at >= 0;
const validChoice = (rows, attempt) => attempt && rows.some(o=>o.id===attempt.choice) && validTime(attempt.at);
const keepAttempt = a => ({choice:a.choice,at:a.at});
const keepReviews = (rows,completedAt) => {
 const firstLater=rows.find(a=>a.at-completedAt>=REVIEW_DELAY);
 return rows.filter((a,i)=>i===0||a===firstLater||i>=rows.length-18);
};

export function readMemories(storage) {
 const state=fresh();
 try {
  const raw=JSON.parse(storage.getItem(MEMORY_KEY));
  if(raw?.version!==1)return state;
  if(raw.draft)state.draft={note:cleanNote(raw.draft.note),start:directions.includes(raw.draft.start)?raw.draft.start:null,curve:curves.includes(raw.draft.curve)?raw.draft.curve:null};
  const ids=new Set();
  for(const row of Array.isArray(raw.entries)?raw.entries.slice(-24):[]) {
   const c=memoryCase(row?.caseId);
   if(!c || typeof row.id!=='string' || row.id.length>90 || ids.has(row.id) || !validTime(row.createdAt))continue;
   ids.add(row.id);
   const entry={id:row.id,caseId:c.id,note:cleanNote(row.note),example:row.example===true,createdAt:row.createdAt,phase:'decision',first:null,practice:[],shownChoice:null,solutionSeen:false,transfer:null,reviews:[],rangeNote:cleanNote(row.rangeNote)};
   if(validChoice(c.options,row.first))entry.first=keepAttempt(row.first);
   entry.practice=(Array.isArray(row.practice)?row.practice:[]).filter(a=>validChoice(c.options,a)).slice(-20).map(keepAttempt);
   if(c.options.some(o=>o.id===row.shownChoice))entry.shownChoice=row.shownChoice;
   if(entry.first){
    entry.phase=phases.includes(row.phase)?row.phase:'reveal';
    if(!entry.shownChoice)entry.shownChoice=entry.practice.at(-1)?.choice??entry.first.choice;
    entry.solutionSeen=row.solutionSeen===true || entry.shownChoice===c.correct;
   }
   const transfer=transferFor(entry);
   if(entry.solutionSeen&&validChoice(transfer.options,row.transfer))entry.transfer=keepAttempt(row.transfer);
   if(entry.transfer){
    entry.phase=row.phase==='transfer-result'?'transfer-result':'complete';
    const review=transferFor(entry,true);
    entry.reviews=keepReviews((Array.isArray(row.reviews)?row.reviews:[]).filter(a=>validChoice(review.options,a)&&a.at>=entry.transfer.at).map(keepAttempt),entry.transfer.at);
   }else if(entry.phase==='complete')entry.phase='transfer';
   if(entry.phase==='transfer'&&!entry.solutionSeen)entry.phase='reveal';
   state.entries.push(entry);
  }
  state.activeId=state.entries.some(e=>e.id===raw.activeId)?raw.activeId:null;
 }catch{}
 return state;
}
export function saveMemories(storage,state){try{storage.setItem(MEMORY_KEY,JSON.stringify(state));return true;}catch{return false;}}
export function beginMemory(state,{caseId,note='',example=false},at=Date.now()) {
 if(!memoryCase(caseId))throw new Error('Unsupported remembered flight');
 const entry={id:`shot-${at}-${globalThis.crypto?.randomUUID?.()??Math.random().toString(36).slice(2)}`,caseId,note:cleanNote(note),example,createdAt:at,phase:'decision',first:null,practice:[],shownChoice:null,solutionSeen:false,transfer:null,reviews:[],rangeNote:''};
 state.entries.push(entry);state.entries=state.entries.slice(-24);state.activeId=entry.id;state.draft={note:'',start:null,curve:null};return entry;
}
export function recordChange(entry,id,at=Date.now()) {
 const c=memoryCase(entry.caseId);if(!c.options.some(o=>o.id===id))throw new Error('Unknown shot change');
 const attempt={choice:id,at};
 if(!entry.first)entry.first=attempt;else{entry.practice.push(attempt);entry.practice=entry.practice.slice(-20);}
 entry.shownChoice=id;entry.phase='reveal';if(id===c.correct)entry.solutionSeen=true;return attempt;
}
export function showSolution(entry){entry.shownChoice=memoryCase(entry.caseId).correct;entry.solutionSeen=true;entry.phase='reveal';}
export function recordTransfer(entry,choice,{review=false,at=Date.now()}={}) {
 if(!entry.solutionSeen)throw new Error('Explore the relationship before checking it');
 const q=transferFor(entry,review);if(!q.options.some(o=>o.id===choice))throw new Error('Unknown prediction');
 const attempt={choice,at};
 if(review){if(!entry.transfer)throw new Error('Complete the first check');entry.reviews.push(attempt);entry.reviews=keepReviews(entry.reviews,entry.transfer.at);}
 else{if(entry.transfer)return entry.transfer;entry.transfer=attempt;entry.phase='transfer-result';}
 return attempt;
}
export function reviewStatus(entry,now=Date.now()) {
 if(!entry.transfer)return {due:false,checked:false};
 const eligible=entry.reviews.find(a=>a.at-entry.transfer.at>=REVIEW_DELAY);
 return {due:now-entry.transfer.at>=REVIEW_DELAY&&!eligible,checked:Boolean(eligible),first:eligible??null};
}
export function forgetMemory(state,id){state.entries=state.entries.filter(e=>e.id!==id);if(state.activeId===id)state.activeId=null;}
export function memoryNote(entry){
 const c=memoryCase(entry.caseId),first=c.options.find(o=>o.id===entry.first?.choice),q=transferFor(entry),review=reviewStatus(entry);
 return `GAMESHARP GOLF · GIVE ME THAT SHOT AGAIN\n${new Date(entry.createdAt).toLocaleDateString('en-GB')}\n\n${entry.example?'An example shot':entry.note||'My remembered iron shot'}\n${c.observation}\n\nTHE DISCOVERY\n${c.takeaway}\n\nMY FIRST CHANGE\n${first?.title??'Not played yet'}\n${first?.feedback??''}\n\nA FRESH SITUATION\n${entry.transfer?entry.transfer.choice===q.correct?'First prediction matched the example.':'First prediction differed from the example.':'Not checked yet.'}\n${review.first?'Later first check: '+(review.first.choice===transferFor(entry,true).correct?'matched':'differed')+'.':'Later check not completed.'}\n\nTAKE IT TO THE RANGE\n${c.practice}\n${entry.rangeNote?'\nMy practice note: '+entry.rangeNote+'\n':''}\n${SHOT_MEMORIES.modelNote}\nSaved learning activity is not a measure of golf ability.\n`;
}
