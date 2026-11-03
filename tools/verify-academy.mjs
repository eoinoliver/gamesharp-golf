const {webkit,chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {CATALOG,NEW_LESSONS} from '../next/src/academy-content.js';
const base=process.env.BASE||'http://127.0.0.1:5177',out=resolve(process.env.QA_OUTPUT||'work/academy-qa');await mkdir(out,{recursive:true});
const browser=await webkit.launch(),errors=[],reports=[];const report=x=>{reports.push(x);console.log(x);};
const watch=p=>p.on('pageerror',e=>errors.push(e.message));
const overflow=async p=>assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,p.url());
const answer=async(p,choice)=>{await p.locator(`[data-choice="${choice}"]`).click();await p.locator('#ac-commit').click();await p.locator('.ac-feedback').waitFor();};
try{
 const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});watch(p);
 await p.goto(base);await p.locator('.gs-home-hero').waitFor();assert.equal(await p.locator('.ac-nav a').count(),3);await p.screenshot({path:resolve(out,'home.png'),fullPage:true});
 await p.getByRole('link',{name:'Explore',exact:true}).click();await p.locator('.ac-card').first().waitFor();assert.equal(await p.locator('.ac-card').count(),15);for(const c of ['shot','course','short','putt']){await p.goto(`${base}/?all=1&kind=${c}`);await p.locator('.ac-card').first().waitFor();assert.ok(await p.locator('.ac-card').count()>=3);}
 report('Home, Sharpen and Explore link one catalogue with 15 eligible lessons in four categories.');
 for(const l of NEW_LESSONS){await p.goto(`${base}/?learn=${l.id}`);for(let i=0;i<3;i++){
  assert.equal(await p.locator('#ac-commit').isDisabled(),true);assert.equal(await p.locator('.ac-feedback').count(),0);await answer(p,l.questions[i].correct);
  if(i===0){await p.reload();await p.locator('.ac-feedback').waitFor();assert.match(await p.locator('.ac-your-answer').innerText(),new RegExp('Your answer'));
   if(await p.locator('#ac-compare').count()){await p.locator('#ac-compare').click();assert.equal(await p.locator('#ac-comparison-label').isVisible(),true);await p.locator('#ac-compare').click();}
  }
  if(l.category==='short'||l.category==='putt'){if(await p.locator('#ac-view').count()){await p.locator('#ac-green canvas').waitFor();await p.locator('#ac-view').click();assert.equal(await p.locator('#ac-visual').isVisible(),true);await p.locator('#ac-view').click();await p.locator('#ac-scrub').fill('55');await p.locator('#ac-replay').click();}}
  await overflow(p);await p.screenshot({path:resolve(out,`${l.id}-${i}.png`),fullPage:true});await p.locator('.ac-demonstration').screenshot({path:resolve(out,`${l.id}-${i}-scene.png`)});await p.locator('#ac-next').click();
 }
 await p.locator('#ac-save-cue').click();assert.match(await p.locator('#ac-save-cue').innerText(),/Saved/);await p.reload();await p.locator('.ac-complete').waitFor();
 // Make a delayed check due without changing the original answers.
 await p.evaluate(id=>{const s=JSON.parse(localStorage.getItem('gamesharp-learning-v1'));s.completed[id]=new Date(Date.now()-25*3600000).toISOString();localStorage.setItem('gamesharp-learning-v1',JSON.stringify(s));},l.id);
 await p.goto(`${base}/?learn=${l.id}&check=1`);await answer(p,l.questions[3].correct);await p.locator('#ac-next').click();assert.match(await p.locator('.ac-result-score').innerText(),/3 of 3 first reads/);
 }
 report('All nine new lessons: 27 core decisions, comparisons, 9 delayed return checks, saved cues, feedback reload and immutable first scores.');
 await p.goto(base+'/?book=1');assert.equal(await p.locator('.ac-cue').count(),9);await p.locator('[data-focus]').first().click();assert.equal(await p.locator('.ac-focus').count(),1);await p.screenshot({path:resolve(out,'my-game.png'),fullPage:true});
 const first=await p.evaluate(()=>JSON.parse(localStorage.getItem('gamesharp-learning-v1')).first);await p.goto(base+'/?review=1');await p.locator('#ac-mix').click();for(let i=0;i<3;i++){await answer(p,0);await p.locator('#ac-next').click();}assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('gamesharp-learning-v1')).first),first);report('My game chooses a course cue; three-decision mixed practice leaves original lesson answers unchanged.');
 for(const l of CATALOG.filter(l=>l.legacy)){
  await p.goto(base+'/'+l.href);await p.locator('.answer-grid').waitFor();for(let i=0;i<2;i++){await p.locator('[data-answer]').first().click();await p.locator('#commit').click();if(await p.locator('#reveal').isVisible())await p.locator('#reveal').click();await p.locator('[data-compare="alternative"]').click();await p.locator('#continue').click();if(!i)await p.locator('#play-next-question').click();}await p.locator('#save-cue').click();await p.locator('#back-to-reads').click();await p.locator('.ac-card').first().waitFor();assert.match(p.url(),/kind=course/);
 }
 await p.goto(base+'/?review=1');assert.match(await p.locator('.ac-needs').innerText(),/6\/6 played/);report('All six existing course lessons: 12 decisions, comparison, cue saving, direct catalogue entry and return; earlier progress remains visible.');
 for(const width of [320,390,768,1440])for(const path of ['/?home=1','/?all=1','/?review=1','/?book=1','/?learn=landing-not-hole&check=1']){await p.setViewportSize({width,height:950});await p.goto(base+path);await p.locator('#ac-main').waitFor();await overflow(p);}
 report('Home, catalogue, Sharpen, My game and lesson layouts fit 320, 390, 768 and 1440 px.');
 await p.close();
 const n=await browser.newPage({viewport:{width:390,height:844}});watch(n);await n.goto(base+'/?learn=landing-not-hole');await n.locator('.ac-options').waitFor({state:'attached'});assert.equal(await n.locator('.ac-options').evaluate(e=>e.inert),true);assert.equal(await n.locator('.ac-options').evaluate(e=>{e.querySelector('button').focus();return e.contains(document.activeElement);}),false);await n.locator('#ac-show-all').focus();await n.keyboard.press('Enter');assert.equal(await n.locator('.ac-options').evaluate(e=>e.inert),false);await n.locator('[data-choice="1"]').focus();await n.keyboard.press('Enter');await n.locator('#ac-commit').click();assert.equal(await n.locator('#ac-answer-area').evaluate(e=>e.inert),true);await n.locator('#ac-see-why').click();assert.equal(await n.locator('#ac-answer-area').evaluate(e=>e.inert),false);await n.locator('#ac-next').click();await n.emulateMedia({reducedMotion:'reduce'});await n.waitForFunction(()=>!document.querySelector('.ac-options').inert);await n.locator('.ac-header a[aria-label="Close lesson"]').click();await n.locator('.ac-card').first().waitFor();assert.equal(await n.locator('.gs-await').count(),0);report('Normal reading hides and inerts answers; keyboard Show all works; outcome precedes explanation; reduced-motion changes and close cancel pending work.');await n.close();
 const f=await browser.newPage({viewport:{width:320,height:800},reducedMotion:'reduce'});watch(f);await f.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return /^webgl/.test(kind)?null:get.call(this,kind,...args);};Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked storage');}});});await f.goto(base+'/?learn=landing-not-hole');await answer(f,0);await f.locator('.ac-save-warning').waitFor();assert.equal(await f.locator('#ac-visual').isVisible(),true);await f.locator('#ac-next').click();await answer(f,1);await f.locator('#ac-next').click();await answer(f,2);await f.locator('#ac-next').click();await f.locator('#ac-save-cue').click();assert.match(await f.locator('#ac-save-cue').innerText(),/unavailable/);await overflow(f);report('No WebGL and blocked storage: all three decisions, overhead evidence, completion and honest save warning remain usable.');await f.close();
 assert.deepEqual(errors,[]);await writeFile(resolve(out,'verification.json'),JSON.stringify({base,reports,errors},null,2));
}finally{await browser.close();}
