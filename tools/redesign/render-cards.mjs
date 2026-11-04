import {webkit} from '/Users/eoinlynn/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {mkdir} from 'node:fs/promises';
const browser=await webkit.launch({headless:true});const page=await browser.newPage({viewport:{width:960,height:540},deviceScaleFactor:1});
await page.goto('http://127.0.0.1:5174/?all=1');await page.waitForSelector('.ac-card');
await page.evaluate(()=>{document.querySelector('#app').remove();document.body.innerHTML='<div id="capture" style="position:fixed;inset:0;width:960px;height:540px"></div>';document.body.style.margin='0';});
const items=await page.evaluate(async()=>{const {CATALOG}=await import('/src/academy-content.js');return CATALOG.map(l=>({id:l.id,type:l.legacy?'course':l.category}));});
await mkdir('next/src/scene-assets',{recursive:true});
for(const item of [...items,...['temptation','bunker','permission'].map(id=>({id:'round-'+id,type:'round',episode:id})),{id:'memory',type:'coast'},{id:'nine',type:'coast'},{id:'impact',type:'shot'},{id:'daily',type:'coast'}]){
 await page.evaluate(async item=>{window.previewScene?.destroy();const host=document.querySelector('#capture');host.replaceChildren();const {CATALOG}=await import('/src/academy-content.js');const l=CATALOG.find(l=>l.id===item.id);
 if(item.type==='round'){const {RoundScene}=await import('/src/round-scene.js');const {episodeById}=await import('/src/round-content.js');const {approachQuestion}=await import('/src/round-model.js');const e=episodeById(item.episode);window.previewScene=new RoundScene(host,{reduced:true});window.previewScene.configure(e,approachQuestion(e));window.previewScene.labels.hidden=true;}
 else if(item.type==='course'){const {GolfScene}=await import('/src/scene.js');window.previewScene=new GolfScene(host,{reducedMotion:true});window.previewScene.setCase(l.questions[0]);window.previewScene.setMode('choice');window.previewScene.aimGroup.visible=false;}
 else if(item.type==='shot'){const {ImpactView}=await import('/src/shotmaker-impact.js');window.previewScene=new ImpactView(host,{...(l?.questions[0].visual||{face:3,path:6}),reduced:true});window.previewScene.overlay.hidden=true;window.previewScene.seek(.43);window.previewScene.focus(item.id==='straight-is-not-target'?'path':'face');window.previewScene.overlay.hidden=true;}
 else if(item.type==='coast'){const {ShotmakerScene}=await import('/src/shotmaker-scene.js');window.previewScene=new ShotmakerScene(host,{reduced:true});if(item.id==='nine')window.previewScene.setMode('choice',true);}
 else {const {LearningGreen}=await import('/src/academy-green.js');let q=l.questions[0];if(q.visual.type==='spread')q={...q,visual:{type:'putt',target:12,max:17,slope:0}};window.previewScene=new LearningGreen(host,q,{reduced:true});window.previewScene.overlay.hidden=true;}
 },item);
 await page.waitForTimeout(400);await page.locator('#capture').screenshot({path:`next/src/scene-assets/${item.id}.png`});console.log(item.id);
}
await browser.close();
