import test from 'node:test';
import assert from 'node:assert/strict';
import {SHOT_MEMORIES} from '../next/src/scenario.js';
import {resultFor,shotPoint} from '../next/src/shotmaker-model.js';
import {MEMORY_KEY,REVIEW_DELAY,caseForFlight,choiceOrder,suggestFlight,scopeIssue,readMemories,saveMemories,beginMemory,recordChange,showSolution,recordTransfer,transferFor,reviewStatus,forgetMemory,memoryNote,escapeHTML} from '../next/src/shot-memory-model.js';

const storage=()=>{const data=new Map();return {getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};};
const blank=()=>readMemories(storage());
test('every remembered flight matches its observations and has one useful, distinct change',()=>{
 assert.equal(SHOT_MEMORIES.cases.length,8);
 for(const c of SHOT_MEMORIES.cases){
  assert.equal(caseForFlight(c.start,c.curve).id,c.id);
  const start=.8*c.original.face+.2*c.original.path;
  assert.equal(Math.abs(start)<.25?'centre':start<0?'left':'right',c.start,c.id);
  const delta=c.original.face-c.original.path;
  assert.equal(delta===0?'straight':delta<0?'left':'right',c.curve,c.id);
  const correct=c.options.find(o=>o.id===c.correct);
  assert.ok(resultFor(correct.face,correct.path).distance<c.radius,c.id);
  for(const o of c.options){
   assert.equal(Number.isFinite(shotPoint(o.face,o.path,.5).x),true);
   if(o.id!==c.correct)assert.ok(resultFor(o.face,o.path).distance>c.radius,`${c.id}:${o.id} needs a meaningful different outcome`);
  }
 }
 assert.equal(caseForFlight('centre','straight'),undefined);
});
test('word suggestions require explicit directions, leave unknowns unresolved, and do not diagnose slices',()=>{
 assert.deepEqual(suggestFlight('My 7 iron started right then curved farther right.'),{start:'right',curve:'right'});
 assert.deepEqual(suggestFlight('It started left and flew straight.'),{start:'left',curve:'straight'});
 assert.deepEqual(suggestFlight('It started on line then bent left.'),{start:'centre',curve:'left'});
 assert.deepEqual(suggestFlight('I sliced my driver.'),{start:null,curve:null});
 assert.equal(scopeIssue('My driver went left'),'shot');
 assert.equal(scopeIssue('A big crosswind took my iron right'),'conditions');
 assert.equal(scopeIssue('My iron started right into water'),null);
});
test('first decision and fresh prediction survive practice, replay, solution and storage',()=>{
 const s=blank(),store=storage(),e=beginMemory(s,{caseId:'right-right',note:'That 7 iron'},1000);
 recordChange(e,'match',1100);const first={...e.first};
 for(let i=0;i<30;i++)recordChange(e,'partner',1200+i);
 showSolution(e);const q=transferFor(e);recordTransfer(e,'none',{at:1500});recordTransfer(e,q.correct,{at:1600});
 assert.deepEqual(e.first,first);assert.equal(e.practice.length,20);assert.equal(e.transfer.choice,'none');
 assert.equal(saveMemories(store,s),true);const loaded=readMemories(store).entries[0];
 assert.deepEqual(loaded.first,first);assert.equal(loaded.transfer.choice,'none');assert.equal(loaded.phase,'transfer-result');
 assert.match(memoryNote(loaded),/First prediction differed/);
});
test('later checks distinguish early practice and preserve the first delayed check through long histories',()=>{
 const s=blank(),store=storage(),e=beginMemory(s,{caseId:'left-straight'},1000);recordChange(e,'together',1100);recordTransfer(e,'away',{at:2000});
 assert.equal(reviewStatus(e,2000+REVIEW_DELAY-1).due,false);
 recordTransfer(e,'away',{review:true,at:3000});assert.equal(reviewStatus(e,3000).checked,false);
 assert.equal(reviewStatus(e,2000+REVIEW_DELAY).due,true);
 recordTransfer(e,'target',{review:true,at:2000+REVIEW_DELAY});
 for(let i=0;i<100;i++)recordTransfer(e,'away',{review:true,at:3000+REVIEW_DELAY+i});
 assert.equal(reviewStatus(e).first.choice,'target');assert.ok(e.reviews.length<=20);
 saveMemories(store,s);assert.equal(reviewStatus(readMemories(store).entries[0]).first.choice,'target');
});
test('all transfer explanations agree with the authored face/path, including mirrored shots',()=>{
 for(const c of SHOT_MEMORIES.cases){const e={caseId:c.id};for(const delayed of [false,true]){const q=transferFor(e,delayed);if(q.correct==='away')assert.equal(q.face,q.path);else {assert.equal(q.correct,'opposite');assert.equal(Math.sign(q.face-q.path),c.sign);}}}
});
test('answer positions vary across memories but stay stable on reload and preserve all options',()=>{
 const c=SHOT_MEMORIES.cases[0],positions=new Set();
 for(let i=0;i<50;i++){
  const e={id:`shot-${i}`},rows=choiceOrder(e,c.options,'change');
  assert.deepEqual(rows,choiceOrder({...e},c.options,'change'));
  assert.deepEqual(rows.map(o=>o.id).sort(),c.options.map(o=>o.id).sort());
  positions.add(rows.findIndex(o=>o.id===c.correct));
 }
 assert.equal(positions.size,3);
});
test('invalid or blocked storage cannot invent completed experiences or prevent play',()=>{
 const store=storage();store.setItem(MEMORY_KEY,JSON.stringify({version:1,entries:[{id:'bad',caseId:'wrong',createdAt:1},{id:'tamper',caseId:'right-right',createdAt:1,phase:'complete',first:{choice:'unknown',at:1},transfer:{choice:'opposite',at:2},solutionSeen:true}]}));
 const s=readMemories(store);assert.equal(s.entries.length,1);assert.equal(s.entries[0].phase,'decision');assert.equal(s.entries[0].transfer,null);
 assert.deepEqual(readMemories({getItem(){throw Error('blocked')}}),blank());
 assert.equal(saveMemories({setItem(){throw Error('blocked')}},s),false);
 assert.throws(()=>recordTransfer(s.entries[0],'opposite'));
 assert.throws(()=>beginMemory(s,{caseId:'unknown'}));
});
test('personal notes remain text, removal is scoped, and book size is bounded',()=>{
 const s=blank();for(let i=0;i<30;i++)beginMemory(s,{caseId:'right-left',note:'<img src=x onerror=alert(1)>'},i);
 assert.equal(s.entries.length,24);assert.equal(s.entries[0].createdAt,6);
 const id=s.activeId;forgetMemory(s,id);assert.equal(s.activeId,null);assert.equal(s.entries.length,23);
 assert.match(escapeHTML(s.entries[0].note),/^&lt;img/);
 assert.equal(s.entries.some(e=>e.id===id),false);
});
