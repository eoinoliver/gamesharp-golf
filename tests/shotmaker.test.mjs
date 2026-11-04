import test from 'node:test';
import assert from 'node:assert/strict';
import {SHOTMAKER} from '../next/src/scenario.js';
import {shotPoint,resultFor,shapeOf,recordShot,readShotState,saveShotState,STORAGE_KEY} from '../next/src/shotmaker-model.js';

test('the three reads require different face-to-path relationships, not one repeated answer',()=>{
 const [draw,straight,fade]=SHOTMAKER.cases;
 assert.equal(shapeOf(draw.face,draw.correct),'Draw');
 assert.equal(shapeOf(straight.face,straight.correct),'Straight');
 assert.equal(shapeOf(fade.face,fade.correct),'Fade');
 assert.ok(shotPoint(draw.face,draw.correct,.05).x>0);
 assert.ok(shotPoint(fade.face,fade.correct,.05).x<0);
 assert.ok(resultFor(draw.face,draw.correct).distance<4);
 assert.ok(resultFor(straight.face,straight.correct).x>7);
 assert.ok(resultFor(fade.face,fade.correct).distance<4);
 for(const c of SHOTMAKER.cases){assert.ok(c.options.some(o=>o.path===c.correct));assert.equal(new Set(c.options.map(o=>shapeOf(c.face,o.path))).size,c.id==='comeback'?2:3);}
});

test('counterfactuals keep face, carry and geography fixed; flights are finite across the full range',()=>{
 for(let face=-8;face<=8;face++)for(let path=-8;path<=8;path++){
  let prev=-Infinity;
  for(let i=0;i<=100;i++){const p=shotPoint(face,path,i/100);assert.ok(Object.values(p).every(Number.isFinite));assert.ok(p.y>=0);assert.ok(160-p.z>=prev);prev=160-p.z;}
  const a=shotPoint(face,path,1),mirror=shotPoint(-face,-path,1);assert.equal(a.z,0);assert.ok(Math.abs(a.x+mirror.x)<1e-10);
 }
 assert.notEqual(resultFor(3,6).x,resultFor(3,0).x);
 assert.equal(shotPoint(3,6,0).z,shotPoint(3,0,0).z);
});

test('first reads survive practice and reload, and blocked storage does not block play',()=>{
 let saved;const store={getItem:()=>saved,setItem:(key,value)=>{assert.equal(key,STORAGE_KEY);saved=value;}};
 const s=readShotState(store),c=SHOTMAKER.cases[0];recordShot(s,c,0,1);recordShot(s,c,6,2);saveShotState(store,s);
 const after=readShotState(store);assert.equal(after.first[c.id].path,0);assert.equal(after.first[c.id].correct,false);assert.equal(after.practice.length,1);assert.equal(after.practice[0].correct,true);
 assert.equal(saveShotState(null,s),false);assert.deepEqual(readShotState(null),{version:1,first:{},practice:[]});assert.throws(()=>recordShot(s,c,99));
});
