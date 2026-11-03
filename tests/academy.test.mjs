import test from 'node:test';
import assert from 'node:assert/strict';
import {CATALOG,NEW_LESSONS,CATEGORIES,coreCount} from '../next/src/academy-content.js';
import {WHOLE_ROUND_LESSON_IDS} from '../next/src/scenario.js';
import {freshLearning,loadLearning,saveLearning,recordAnswer,finishLearning,dueLessons,firstScore,LEARNING_KEY,DAY} from '../next/src/academy-state.js';
import {demoFor,comparisonChoice,learningVisual} from '../next/src/academy-visual.js';
const storage=()=>{let value=null;return{getItem:()=>value,setItem:(k,v)=>value=v};};
test('the whole-round catalogue is approved, bounded and balanced, with distinct fresh return questions',()=>{
 assert.equal(CATALOG.length,15);assert.equal(CATALOG.reduce((n,l)=>n+coreCount(l),0),39);assert.deepEqual(NEW_LESSONS.map(l=>l.id),WHOLE_ROUND_LESSON_IDS);
 for(const c of CATEGORIES)assert.ok(CATALOG.filter(l=>l.category===c.id).length>=3);
 for(const l of NEW_LESSONS){assert.equal(l.questions.length,4);assert.equal(new Set(l.questions.map(q=>q.situation)).size,4);assert.ok(l.cue&&l.practice&&l.misconception&&l.source);for(const q of l.questions){assert.ok(q.watch&&q.explanation&&q.options[q.correct]);assert.equal(new Set(q.options.map(o=>o.text)).size,q.options.length);assert.ok(q.options.every(o=>o.why));}}
});
test('chip comparisons preserve the hole, identify sand interceptions, and use different plans after a correct choice',()=>{
 for(const l of NEW_LESSONS.filter(l=>l.category==='short'))for(const q of l.questions){const before=JSON.stringify(q);for(let choice=0;choice<q.options.length;choice++){const d=demoFor(q,choice);if(q.options[choice].demo){assert.ok(d.land<=d.end);if(q.visual.hazard&&d.land<q.visual.edge){assert.equal(d.blocked,true);assert.equal(d.end,d.land);}assert.notEqual(comparisonChoice(q,choice),choice);}}assert.equal(JSON.stringify(q),before);}
 const l=NEW_LESSONS.find(l=>l.id==='landing-not-hole');for(const q of l.questions)assert.equal(demoFor(q,q.correct).end,q.visual.target);
});
test('first reads survive wrong replays, feedback reload, completion, cue saves and delayed practice',()=>{
 const s=freshLearning(),l=NEW_LESSONS[0],now=new Date('2026-11-03T00:00:00Z');for(let i=0;i<3;i++)recordAnswer(s,l.id,i,l.questions[i].correct,now);finishLearning(s,l.id,now);s.saved.push(l.id);s.focus=l.id;
 const first=JSON.stringify(s.first);recordAnswer(s,l.id,0,0,new Date(+now+100));assert.equal(JSON.stringify(s.first),first);assert.equal(firstScore(s,l),3);
 assert.equal(dueLessons(s,+now+DAY-1).length,0);assert.equal(dueLessons(s,+now+DAY).length,1);recordAnswer(s,l.id,3,1,new Date(+now+DAY));assert.equal(dueLessons(s,+now+DAY+1).length,0);
 const st=storage();assert.equal(saveLearning(st,s),true);const loaded=loadLearning(st);assert.deepEqual(loaded.first,s.first);assert.equal(loaded.sessions[l.id].phase,'feedback');assert.deepEqual(loaded.saved,[l.id]);assert.equal(loaded.focus,l.id);
});
test('corrupt and unavailable storage cannot invent mastery or break play',()=>{
 assert.deepEqual(loadLearning({getItem:()=>'{bad'}),freshLearning());assert.equal(saveLearning(null,freshLearning()),false);assert.equal(saveLearning({setItem:()=>{throw Error('blocked');}},freshLearning()),false);
 const st=storage();st.setItem(LEARNING_KEY,JSON.stringify({version:1,completed:{'start-and-bend':'2026-11-03'},sessions:{'start-and-bend':{index:99,phase:'feedback',choice:0}},first:{'start-and-bend:0':{choice:99,at:'2026-11-03'}},saved:['start-and-bend']}));assert.deepEqual(loadLearning(st),freshLearning());
 assert.throws(()=>finishLearning(freshLearning(),'start-and-bend'));assert.throws(()=>recordAnswer(freshLearning(),'unknown',0,0));
});
test('question diagrams withhold the flight and answer explanations; feedback contains finite matching evidence',()=>{
 for(const l of NEW_LESSONS)for(const q of l.questions){const before=learningVisual(q);assert.ok(!before.includes(q.explanation));if(q.visual.type==='flight')assert.ok(!before.includes('Bends left')&&!before.includes('Bends right'));for(let i=0;i<q.options.length;i++){const out=learningVisual(q,i);assert.ok(!out.includes('NaN'));assert.ok(!out.includes('undefined'));}}
});
