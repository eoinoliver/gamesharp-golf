import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {impactRead,teachingStep,directionRuler} from '../next/src/impact-teaching.js';
import {clubQuaternion,FACE_NORMAL_LOCAL} from '../next/src/motion/club.js';
import {SHOT_MEMORIES} from '../next/src/scenario.js';

test('the teaching separates target direction from curve for every available face/path setting',()=>{
 for(let face=-8;face<=8;face++)for(let path=-8;path<=8;path++){
  const r=impactRead(face,path),launch=face*.8+path*.2;
  assert.equal(r.bend,face===path?'Very little curve':`Bends ${face<path?'left':'right'}`);
  assert.equal(r.start,Math.abs(launch)<.05?'Starts on the target line':`Starts ${launch<0?'left':'right'}`);
  assert.match(teachingStep(face,path,0).text,/surface that hits the ball/);
  assert.match(teachingStep(face,path,1).text,/not the direction the shaft leans/);
 }
 assert.equal(impactRead(3,6).relation,'The face points 3° left of the club’s path.');
 assert.equal(impactRead(-3,-6).relation,'The face points 3° right of the club’s path.');
 assert.equal(impactRead(3,3).summary,'Starts right. very little curve.');
});

test('the striking surface actually points in the direction used by the teaching',()=>{
 const direction=new T.Vector3(.08,-.89,.45).normalize();
 for(let face=-8;face<=8;face++){
  const normal=FACE_NORMAL_LOCAL.clone().applyQuaternion(clubQuaternion(direction,face));
  assert.ok(Math.abs(Math.atan2(normal.z,normal.x)*180/Math.PI-face)<1e-8);
 }
});

test('matching directions remain two labelled markers and transfer choices do not reveal causal explanations',()=>{
 const html=directionRuler(3,3);assert.equal((html.match(/left:66.125%/g)||[]).length,2);assert.match(html,/FACE POINTS/);assert.match(html,/HEAD MOVES/);
 for(const c of SHOT_MEMORIES.cases)for(const delayed of [false,true]){
  const q=SHOT_MEMORIES.transfer(c.family,c.sign,delayed);
  for(const o of q.options)assert.doesNotMatch(o.detail,/face|path|matching directions means/i);
 }
});
