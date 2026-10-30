import test from 'node:test';
import assert from 'node:assert/strict';
import {SCENARIO,SHOT_OFFSETS,APPROVED_SCENARIOS} from '../next/src/scenario.js';
import {pattern,summary,targetFor,preferredChoice,isWater,isGreen} from '../next/src/model.js';
import {freshState,readState,saveState,commitAttempt,saveCue} from '../next/src/state.js';
const memory=()=>{const m=new Map();return{getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v)}};
globalThis.localStorage=memory();

test('changing target preserves every shot offset and ordering',()=>{
 for(let r=0;r<2;r++)for(const c of ['flag','middle']){const t=targetFor(r,c);pattern(r,c).forEach((p,i)=>{assert.equal(p.x-t.x,SHOT_OFFSETS[i].x);assert.equal(p.z-t.z,SHOT_OFFSETS[i].z);});}
});
test('lesson reverses the useful target when only the flag moves',()=>{
 assert.equal(preferredChoice(0),'middle');assert.equal(preferredChoice(1),'flag');
 assert.equal(summary(0,'flag').water,4);assert.equal(summary(0,'middle').water,0);
 assert.equal(summary(1,'flag').water,0);assert.equal(summary(1,'middle').water,0);
 assert.ok(summary(1,'flag').averageDistance<summary(1,'middle').averageDistance);
 assert.deepEqual(pattern(0,'middle'),pattern(1,'middle'));
});
test('the first illustrated ball is included in the sample and stays on the green',()=>{
 for(let r=0;r<2;r++)for(const c of ['flag','middle']){const p=pattern(r,c);assert.equal(p.length,12);assert.equal(p[0].lie,'green');assert.ok(isGreen(p[0]));assert.equal(isWater(p[0]),false);}
});
test('practice preserves the first committed choices, completion and saved cue',()=>{
 const state=freshState();commitAttempt(state,0,'flag');commitAttempt(state,0,'middle');commitAttempt(state,1,'flag');state.completions=1;saveCue(state);
 const restored=readState();assert.equal(restored.firstAttempts['protected-pin'].choice,'flag');assert.equal(restored.firstAttempts['open-pin'].choice,'flag');assert.equal(restored.completions,1);assert.equal(restored.cue.text,SCENARIO.rounds[1].cue);assert.deepEqual(state.events.filter(e=>e.type==='choice_committed').map(e=>e.firstAttempt),[true,false,true]);
});
test('legacy, corrupt and unavailable storage cannot import old proficiency',()=>{
 const old=memory();old.setItem('gamesharp-golf-next-v1',JSON.stringify({version:'old',completions:999}));assert.equal(readState(old).completions,0);
 old.setItem('gamesharp-golf-next-v1','not-json');assert.equal(readState(old).completions,0);
 const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};assert.deepEqual(readState(blocked),freshState());assert.equal(saveState(freshState(),blocked),false);
});
test('only the explicitly approved lesson enters the new application',()=>{
 assert.deepEqual(APPROVED_SCENARIOS,[SCENARIO.id]);assert.equal(SCENARIO.rounds.length,2);
});
