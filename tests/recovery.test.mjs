import test from 'node:test';
import assert from 'node:assert/strict';
import {RECOVERED_LESSONS,RECOVERY_IDS,clubEvidence,windRelation,matchResult} from '../next/src/recovered-content.js';
import {decisionVisual,isDecisionVisual} from '../next/src/course-plan-visual.js';
import {ZONES} from '../next/src/sharpen-content.js';
import {byId} from '../next/src/academy-content.js';
import {createFocusService,focusNext,allReflections,focusInfo} from '../next/src/focus-service.js';
import {PLAN_KEY,readPlan,writePlan,preparePlan,reflectPlan} from '../next/src/round-plan-state.js';
import {freshLearning,recordAnswer,finishLearning,DAY} from '../next/src/academy-state.js';
import {freshRound} from '../next/src/round-state.js';
import {freshState} from '../next/src/state.js';
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),data};};
const fixture=()=>({learning:freshLearning(),round:freshRound(),course:freshState()});
test('recovered content is explicit, all map destinations resolve, and observations never diagnose a driver via the iron model',()=>{
 assert.deepEqual(RECOVERED_LESSONS.map(l=>l.id),RECOVERY_IDS);
 for(const z of ZONES)for(const c of z.choices){if(c.observation)assert.ok(focusInfo({kind:'observation',id:c.observation}));else{const p=new URLSearchParams(c.href.slice(1));assert.ok(byId(p.get('learn')||p.get('read')));}}
 const driver=ZONES[0].choices.find(c=>c.id==='driver-flight');assert.equal(driver.observation,'driver-flight');assert.equal(driver.href,undefined);
 for(const l of RECOVERED_LESSONS){assert.equal(l.questions.length,4);assert.ok(byId(l.id));for(const q of l.questions){assert.ok(isDecisionVisual(q));for(let choice=0;choice<q.options.length;choice++){assert.ok(!/undefined|NaN/.test(decisionVisual(q,choice)));}assert.ok(!decisionVisual(q).includes(q.explanation));}}
});
test('tee answers follow hazard geometry and the next approach, with a driver-favouring and mirrored case',()=>{
 const qs=RECOVERED_LESSONS[0].questions;assert.deepEqual(qs.map(q=>q.correct),[2,0,1,1]);
 for(const q of qs){const before=JSON.stringify(q.visual),e=q.visual.clubs.map((_,i)=>clubEvidence(q.visual,i));const eligible=e.map((x,i)=>({...x,i})).filter(x=>!x.trouble).sort((a,b)=>a.leave-b.leave);assert.equal(eligible[0].i,q.correct);for(let i=0;i<3;i++)decisionVisual(q,i);assert.equal(JSON.stringify(q.visual),before);}
 assert.deepEqual(qs[2].visual.clubs.map((_,i)=>clubEvidence(qs[2].visual,i)),qs[3].visual.clubs.map((_,i)=>clubEvidence(qs[3].visual,i)));
});
test('recovery tests width and height independently; wind preserves world direction and match arithmetic does not confuse a hole with a match',()=>{
 const recovery=RECOVERED_LESSONS.find(l=>l.id==='recovery-window-v1');for(const q of recovery.questions){const v=q.visual;assert.equal(q.correct,v.forwardHeight<v.ceiling&&v.requiredWidth<=v.forwardWidth?0:1);}
 for(const heading of [0,90,180,270]){assert.equal(windRelation(heading,heading),'Helping');assert.equal(windRelation(heading,(heading+180)%360),'Into you');assert.equal(windRelation(heading,(heading+90)%360),'Left to right');}
 assert.equal(matchResult(1,-1),'All square — extra holes');assert.equal(matchResult(-1,1),'All square — extra holes');assert.equal(matchResult(1,0),'Match won');assert.equal(matchResult(-1,0),'Match lost');assert.equal(matchResult(1,0,2),'Match continues');
});
test('focus initialization preserves existing precedence and never resurrects cleared cues or overwrites legacy learning',()=>{
 const st=memory(),f=fixture();f.round.cue='pace';f.learning.focus='distance';f.course.cues=['distance'];st.setItem('unrelated','unchanged');const before=JSON.stringify(f);
 const svc=createFocusService(st,f);assert.deepEqual(svc.info().ref,{kind:'skill',id:'pace'});svc.select(null);assert.equal(createFocusService(st,f).info(),null);assert.equal(JSON.stringify(f),before);assert.equal(st.getItem('unrelated'),'unchanged');
 const s2=createFocusService(memory(),{...f,round:freshRound()});assert.equal(s2.info().ref.id,'distance');svc.select({kind:'lesson',id:RECOVERY_IDS[0]});assert.equal(svc.info().ref.id,RECOVERY_IDS[0]);assert.throws(()=>svc.select({kind:'lesson',id:'missing'}));
});
test('a round plan snapshots the selected cue, reflection is idempotent and no opportunity creates no learning evidence',()=>{
 const f=fixture(),svc=createFocusService(memory(),f),before=JSON.stringify(f);svc.select({kind:'lesson',id:RECOVERY_IDS[0]});preparePlan(svc.state,svc.info(),{id:'round-one',intention:'Opening tee',course:'My course'});svc.persist();preparePlan(svc.state,svc.info(),{id:'duplicate-click',intention:'Opening tee',course:'My course'});assert.equal(svc.state.plans.length,1);const r=reflectPlan(svc.state,'round-one','no-chance','Never came up');assert.equal(r.result,'no-chance');assert.equal(reflectPlan(svc.state,'round-one','used'),r);assert.equal(svc.state.reflections.length,1);assert.equal(JSON.stringify(f),before);
 svc.select({kind:'skill',id:'pace'});assert.equal(svc.state.activePlanId,null);assert.equal(svc.state.plans[0].focus.id,RECOVERY_IDS[0]);assert.equal(svc.state.plans[0].intention,'Opening tee');assert.throws(()=>reflectPlan(svc.state,'missing','used'));
 f.round.observations.push({skill:'pace',result:'missed',at:'2026-11-01T12:00:00Z',note:'Earlier'});assert.equal(allReflections(svc,f.round).length,2);
});
test('new focus checks use existing eligibility and do not confuse reflection or course revisits with delayed recall',()=>{
 const f=fixture(),l=RECOVERED_LESSONS[0],at=new Date('2026-11-04T00:00:00Z');for(let i=0;i<3;i++)recordAnswer(f.learning,l.id,i,l.questions[i].correct,at);finishLearning(f.learning,l.id,at);
 const ref={kind:'lesson',id:l.id};assert.equal(focusNext(ref,f,+at+DAY-1).due,false);assert.equal(focusNext(ref,f,+at+DAY).due,true);assert.match(focusNext(ref,f,+at+DAY).href,/check=1/);assert.equal(focusNext({kind:'lesson',id:'distance'},f,+at+DAY).due,false);
});
test('unknown plan schemas remain untouched, malformed references cannot invent a plan, blocked storage is honest',()=>{
 const st=memory(),future=JSON.stringify({version:9,activeFocus:{kind:'lesson',id:RECOVERY_IDS[0]}});st.setItem(PLAN_KEY,future);const svc=createFocusService(st,fixture());assert.equal(svc.state.readOnly,true);assert.equal(svc.select({kind:'skill',id:'pace'}),false);assert.equal(st.getItem(PLAN_KEY),future);
 st.setItem(PLAN_KEY,JSON.stringify({version:1,plans:[{id:'x',focus:{kind:'lesson',id:'missing'},at:'2026-11-04'}],activePlanId:'x',reflections:[{result:'used'}]}));const s=readPlan(st,r=>!!focusInfo(r));assert.equal(s.plans.length,0);assert.equal(s.reflections.length,0);assert.equal(s.activePlanId,null);
 const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};const b=createFocusService(blocked,fixture());assert.equal(b.select({kind:'skill',id:'space'}),false);assert.equal(b.info().ref.id,'space');assert.equal(writePlan(null,s),false);
});
