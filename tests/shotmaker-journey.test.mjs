import test from 'node:test';
import assert from 'node:assert/strict';
import {SHOTMAKER_NINE as N} from '../next/src/scenario.js';
import {JOURNEY_KEY,dailyChallenge,judgeChallenge,routesFor,validSettings,readJourney,saveJourney,recordWorkshop,workshopCleared,beginCard,recordCard,recordDaily,cardScore} from '../next/src/shotmaker-journey-model.js';
const memory=()=>{let value;return {getItem:()=>value,setItem:(key,text)=>{assert.equal(key,JOURNEY_KEY);value=text;}};};

test('every authored build and final target is achievable, has a meaningful miss, and tests transfer',()=>{
 for(const c of [...N.workshop,...N.pressure]){const routes=routesFor(c);assert.ok(routes.length>0,c.id);assert.ok(routes.length<15,c.id+' is selective');assert.equal(judgeChallenge(c,...c.initial).pass,false,c.id+' does not start solved');for(const r of routes){assert.ok(validSettings(c,r.face,r.path));assert.ok(r.distance<=c.radius);}}
 assert.equal(judgeChallenge(N.pressure[0],3,5).pass,false,'memorising the first 3° face does not solve the new 5° path');
 assert.equal(judgeChallenge(N.pressure[0],2,5).pass,true);
 assert.equal(judgeChallenge(N.pressure[2],2,5).pass,false,'a good finish alone does not pass the smaller start window');
 assert.equal(judgeChallenge(N.pressure[2],1,2).pass,true);
 assert.throws(()=>judgeChallenge(N.workshop[0],2,6),'cannot change a locked face');
});

test('daily constraints are deterministic, varied, and all reachable across a full year',()=>{
 const constraints=new Set();for(let day=0;day<365;day++){const date=new Date(Date.UTC(2026,0,1+day)).toISOString().slice(0,10),c=dailyChallenge(date);assert.deepEqual(c,dailyChallenge(date));assert.ok(routesFor(c).length>0,date);assert.equal(judgeChallenge(c,...c.initial).pass,false,date);constraints.add(JSON.stringify([c.face,c.path,c.gate,c.radius]));}
 assert.ok(constraints.size>=20,'at least twenty distinct constrained problems');assert.throws(()=>dailyChallenge('2026-02-31'));assert.throws(()=>dailyChallenge('arbitrary'));
});

test('workshop success and first miss survive long practice histories and reload',()=>{
 const store=memory(),s=readJourney(store),c=N.workshop[0];recordWorkshop(s,c,3,0,{at:1});recordWorkshop(s,c,3,7,{at:2,assisted:true});for(let i=0;i<100;i++)recordWorkshop(s,c,3,0,{at:3+i});saveJourney(store,s);const after=readJourney(store);
 assert.equal(after.workshop[c.id][0].path,0);assert.equal(workshopCleared(after,c),true);assert.ok(after.workshop[c.id].some(a=>a.path===7&&a.assisted));assert.ok(after.workshop[c.id].length<=50);
});

test('a final-three card resumes exactly once, closes after three shots, and never overwrites the first card',()=>{
 const store=memory(),s=readJourney(store),card=beginCard(s,1);recordCard(s,card.id,0,5,2);saveJourney(store,s);const after=readJourney(store),resumed=beginCard(after,3);assert.equal(resumed.id,card.id);assert.equal(resumed.attempts.length,1);recordCard(after,resumed.id,-2,-5,4);recordCard(after,resumed.id,1,2,5);assert.equal(cardScore(resumed),2);assert.throws(()=>recordCard(after,resumed.id,1,2,6));
 for(let i=0;i<35;i++){const next=beginCard(after,10+i);recordCard(after,next.id,2,5);recordCard(after,next.id,-2,-4);recordCard(after,next.id,1,3);}saveJourney(store,after);const reload=readJourney(store);assert.equal(reload.cards[0].id,card.id);assert.equal(cardScore(reload.cards[0]),2);assert.equal(reload.cards[0].attempts[0].face,0);assert.ok(reload.cards.length<=30);
});

test('first daily attempt remains independent of successful practice and storage cannot invent results',()=>{
 const s=readJourney(null),day='2026-11-01',c=dailyChallenge(day),route=routesFor(c)[0];recordDaily(s,day,...c.initial,1);recordDaily(s,day,route.face,route.path,2);assert.equal(judgeChallenge(c,s.daily[day].first.face,s.daily[day].first.path).pass,false);assert.equal(s.daily[day].practice.length,1);assert.equal(saveJourney(null,s),false);
 const store=memory();saveJourney(store,{...s,workshop:{[N.workshop[0].id]:[{face:99,path:6,at:1,pass:true},{face:3,path:0,at:2,pass:true}]},cards:[{id:'fake',startedAt:1,attempts:[{face:99,path:5,at:1,pass:true}]}]});const after=readJourney(store);assert.equal(workshopCleared(after,N.workshop[0]),false);assert.equal(after.cards[0].attempts.length,0);assert.equal(after.daily[day].first.at,1);assert.deepEqual(readJourney({getItem:()=>'{broken'}),readJourney(null));
});
