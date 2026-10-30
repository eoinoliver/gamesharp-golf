import test from 'node:test';
import assert from 'node:assert/strict';
import {CASES,LESSONS} from '../next/src/scenario.js';
import {DECISIONS,evidenceFor} from '../next/src/choices.js';
import {evaluate,validPlan,targetFor,carryWindow} from '../next/src/model.js';

test('every question offers distinct, playable plans and a strong answer without custom controls',()=>{
 assert.deepEqual(Object.keys(DECISIONS).sort(),CASES.map(c=>c.id).sort());
 for(const c of CASES){
  const d=DECISIONS[c.id],answers=d.answers;
  assert.ok([2,4].includes(answers.length),c.id);
  assert.equal(new Set(answers.map(a=>a.id)).size,answers.length,c.id);
  assert.equal(new Set(answers.map(a=>JSON.stringify(a.plan))).size,answers.length,c.id);
  for(const a of answers)assert.ok(validPlan(c,a.plan),`${c.id} ${a.id}`);
  assert.ok(answers.some(a=>evaluate(c,a.plan).strong),`${c.id} needs a strong card`);
  assert.ok(answers.some(a=>!evaluate(c,a.plan).strong),`${c.id} needs a meaningful choice`);
 }
});
test('card choices still require a changed read in the next setup',()=>{
 for(const l of LESSONS){
  const accepted=l.cases.map(c=>DECISIONS[c.id].answers.filter(a=>evaluate(c,a.plan).strong).map(a=>a.id));
  assert.notDeepEqual(accepted[0],accepted[1],l.id);
 }
});
test('flag-relative answer text matches the actual preview aim',()=>{
 for(const c of CASES)for(const a of DECISIONS[c.id].answers){
  const target=targetFor(c,a.plan);
  if(a.detail==='Along the flag line'||a.detail==='Aim along the flag line')assert.equal(target.x,c.pin.x,`${c.id} ${a.id}`);
  const match=a.detail.match(/^(\d+) m (left|right)(?: of the flag)?$/);
  if(match)assert.equal(target.x-c.pin.x,Number(match[1])*(match[2]==='left'?-1:1),`${c.id} ${a.id}`);
 }
});
test('visible club evidence comes from the same shots used by the simulation',()=>{
 for(const c of CASES.filter(c=>c.clubs.length>1)){
  const facts=evidenceFor(c);
  for(const [i,cl] of c.clubs.entries()){
   const w=carryWindow(c,cl);assert.equal(facts[i].value,`${w.min}–${w.max} m carry`);
  }
 }
});
