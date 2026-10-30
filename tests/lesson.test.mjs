import test from 'node:test';
import assert from 'node:assert/strict';
import {COURSE,LESSONS,CASES,VERSION,APPROVED_SCENARIOS} from '../next/src/scenario.js';
import {pattern,summary,offsets,getClub,targetFor,bestPlan,evaluate,validPlan,surface,blockedRoute} from '../next/src/model.js';
import {KEY,freshState,readState,saveState,commitAttempt,completeLesson,saveCue} from '../next/src/state.js';
const memory=()=>{const m=new Map();return{getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v)}};
globalThis.localStorage=memory();
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} ≠ ${b}`);

test('six explicit reads have twelve unique cases with complete reachable choices',()=>{
 assert.equal(LESSONS.length,6);assert.equal(CASES.length,12);assert.equal(new Set(CASES.map(c=>c.id)).size,12);assert.deepEqual(APPROVED_SCENARIOS,LESSONS.map(l=>l.id));
 for(const c of CASES){const best=bestPlan(c);assert.ok(validPlan(c,best));assert.ok(evaluate(c,best).strong);assert.equal(pattern(c,best).length,12);assert.ok(c.shotIndex>=0&&c.shotIndex<12);const options=c.clubs.flatMap(cl=>Array.from({length:41},(_,i)=>({club:cl.id,aim:i-26})));assert.ok(options.filter(p=>evaluate(c,p).strong).length>=3,c.id+' must accept a range of aims');assert.ok(options.some(p=>!evaluate(c,p).workable),c.id+' needs a meaningful trade-off');}
});
test('comparison translates the same offsets and preserves their identities',()=>{
 for(const c of CASES)for(const cl of c.clubs){const a={club:cl.id,aim:-9},b={club:cl.id,aim:3},pa=pattern(c,a),pb=pattern(c,b);pa.forEach((p,i)=>{near(pb[i].x-p.x,12);near(pb[i].z,p.z);assert.equal(pb[i].index,p.index);const o=offsets(c,cl)[i],t=targetFor(c,a);near(p.x-t.x,o.x);near(p.z-t.z,o.z);});}
});
test('club choice determines depth; lateral aim cannot invent extra carry',()=>{
 for(const c of CASES)for(const cl of c.clubs){const left=targetFor(c,{club:cl.id,aim:-26}),right=targetFor(c,{club:cl.id,aim:14});assert.equal(left.z,cl.z);assert.equal(left.z,right.z);}
});
test('distance and landing choices reverse with changed evidence',()=>{
 for(const [id,a,b] of [['distance','7i','8i'],['landing','5w','5i']]){const l=LESSONS.find(l=>l.id===id);assert.equal(bestPlan(l.cases[0]).club,a);assert.equal(bestPlan(l.cases[1]).club,b);for(const [i,wrong] of [[0,b],[1,a]])for(let aim=-26;aim<=14;aim++)assert.equal(evaluate(l.cases[i],{club:wrong,aim}).strong,false);}
});
test('shape, next-shot route and pin location require different aims',()=>{
 for(const id of ['shape','next-shot','pin']){const [a,b]=LESSONS.find(l=>l.id===id).cases,pa=bestPlan(a),pb=bestPlan(b);assert.ok(pa.aim>pb.aim+5,id);assert.equal(evaluate(a,pb).strong,false,id+' cannot copy the second plan into the first setup');assert.equal(evaluate(b,pa).strong,false,id+' cannot copy the first plan into transfer');}
});
test('bad last ball can accompany a strong plan; a good ball can hide a weak one',()=>{
 const [a,b]=LESSONS.find(l=>l.id==='last-ball').cases;assert.equal(pattern(a,a.review)[a.shotIndex].lie,'water');assert.ok(evaluate(a,a.review).strong);for(let aim=-26;aim<=14;aim++)assert.equal(pattern(a,{club:'7i',aim})[a.shotIndex].lie,'water');
 assert.equal(pattern(b,b.review)[b.shotIndex].lie,'green');assert.ok(pattern(b,b.review)[b.shotIndex].distance<=8);assert.equal(evaluate(b,b.review).strong,false);assert.equal(summary(b,bestPlan(b)).water,0);assert.ok(summary(b,b.review).water>0);
});
test('hazards and blocking match the explicit geometry',()=>{
 for(const c of CASES){assert.equal(surface({x:90,z:0},c),'water');assert.equal(surface({x:COURSE.bunker.x,z:COURSE.bunker.z},c),'bunker');for(const b of c.bunkers)assert.equal(surface(b,c),'bunker');for(const t of c.trees){assert.equal(surface(t,c),'trees');assert.equal(blockedRoute(t,c),true);}for(const cl of c.clubs)for(let aim=-26;aim<=14;aim++)for(const p of pattern(c,{club:cl.id,aim}))assert.equal(surface(p,c),p.lie);}
});
test('first attempts survive practice, reload, cue saves and completion',()=>{
 const st=freshState(),l=LESSONS[0],a=l.cases[0],b=l.cases[1],weak={club:'8i',aim:-26};commitAttempt(st,a,weak,'sure');commitAttempt(st,a,bestPlan(a));commitAttempt(st,b,bestPlan(b));completeLesson(st,l);saveCue(st,l.id);const re=readState();assert.deepEqual(re.firstAttempts[a.id].plan,weak);assert.equal(re.firstAttempts[a.id].confidence,'sure');assert.ok(re.completed[l.id]);assert.deepEqual(re.cues,[l.id]);assert.deepEqual(re.events.filter(e=>e.type==='plan_committed').map(e=>e.firstAttempt),[true,false,true]);
});
test('invalid and legacy records cannot import proficiency or break the app',()=>{
 const m=memory();m.setItem(KEY,JSON.stringify({version:'old',completed:{distance:'yesterday'}}));assert.deepEqual(readState(m),freshState());m.setItem(KEY,'not json');assert.deepEqual(readState(m),freshState());
 m.setItem(KEY,JSON.stringify({version:VERSION,firstAttempts:{'distance-first':{plan:{club:'invalid',aim:999},at:'now'}},completed:{distance:'now'},cues:['bad-id']}));assert.deepEqual(readState(m).firstAttempts,{});assert.deepEqual(readState(m).completed,{});assert.deepEqual(readState(m).cues,[]);
 const denied={getItem(){throw Error('denied')},setItem(){throw Error('denied')}};assert.deepEqual(readState(denied),freshState());assert.equal(saveState(freshState(),denied),false);assert.throws(()=>commitAttempt(freshState(),CASES[0],{club:'bad',aim:0}));assert.throws(()=>completeLesson(freshState(),LESSONS[0]));
});
