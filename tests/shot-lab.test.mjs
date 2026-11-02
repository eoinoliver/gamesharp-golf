import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LESSON,MOTION,STORAGE_KEY,curveFor,launchAngle,flightPoint,freshRecord,readRecord,commitAnswer,saveRecord} from '../next/src/shot-lab-model.js';
const memory=()=>{const data=new Map();return{getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)}};

test('a changed path reverses the curve without changing face direction or start side',()=>{
 const [a,b]=LESSON.cases;assert.equal(a.face,b.face);assert.equal(curveFor(a),'left');assert.equal(curveFor(b),'right');
 for(const c of [a,b]){
  assert.equal(c.correct,curveFor(c));assert.ok(launchAngle(c)>0);assert.ok(flightPoint(c,.001).z>0);
  const firstSlope=(flightPoint(c,.02).z-flightPoint(c,.01).z)/.01;
  const lastSlope=(flightPoint(c,.99).z-flightPoint(c,.98).z)/.01;
  assert.equal(Math.sign(lastSlope-firstSlope),c.correct==='left'?-1:1);
  assert.equal(flightPoint(c,0).y,.027);assert.ok(Math.abs(flightPoint(c,1).y-.027)<1e-9);
 }
});
test('first predictions remain independent of practice, comparison and completion events',()=>{
 const record=freshRecord(),[a,b]=LESSON.cases,store=memory();
 const wrong=commitAnswer(record,a,'right','first');assert.equal(wrong.correct,false);assert.equal(wrong.first,true);
 const right=commitAnswer(record,a,'left','practice');assert.equal(right.correct,true);assert.equal(right.first,false);
 commitAnswer(record,b,'right','transfer');record.cueSaved=true;record.events.push({type:'delivery_compared',case:a.id});
 assert.equal(saveRecord(record,store),true);const saved=readRecord(store);
 assert.equal(saved.first[a.id].choice,'right');assert.equal(saved.first[a.id].correct,false);
 assert.equal(saved.first[b.id].correct,true);assert.equal(saved.practice.length,1);assert.equal(saved.cueSaved,true);
 assert.throws(()=>commitAnswer(record,a,null));assert.throws(()=>commitAnswer(record,a,'straight'));
});
test('blocked storage, corrupted data and unrelated scores do not invent proficiency',()=>{
 const denied={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};
 assert.deepEqual(readRecord(denied),freshRecord());assert.equal(saveRecord(freshRecord(),denied),false);
 const store=memory();for(const bad of ['not JSON',JSON.stringify({version:99,first:{}}),JSON.stringify({completed:6})]){store.setItem(STORAGE_KEY,bad);assert.deepEqual(readRecord(store),freshRecord());}
 store.setItem(STORAGE_KEY,JSON.stringify({version:1,first:{[LESSON.cases[0].id]:{choice:'right',correct:true,at:'first'},[LESSON.cases[1].id]:{choice:'made-up',correct:true,at:'first'}},practice:[],events:[]}));
 const record=readRecord(store);assert.equal(record.first[LESSON.cases[0].id].correct,false);assert.equal(record.first[LESSON.cases[1].id],undefined);
});
test('the shipped capture contains finite, correctly dimensioned body motion for every checkpoint',()=>{
 const motion=JSON.parse(fs.readFileSync(new URL('../next/src/motion/cmu-64-01.json',import.meta.url)));
 assert.equal(motion.fps,MOTION.fps);assert.equal(motion.frames.length,448);assert.equal(new Set(motion.joints).size,31);
 for(const name of ['lhand','rhand','head','ltibia','rtibia'])assert.ok(motion.joints.includes(name));
 assert.ok(MOTION.start<MOTION.top&&MOTION.top<MOTION.impact&&MOTION.impact<MOTION.end);assert.ok(MOTION.end<motion.frames.length);
 for(const frame of motion.frames){assert.equal(frame.length,motion.joints.length);for(const point of frame){assert.equal(point.length,3);assert.ok(point.every(Number.isFinite));}}
});
