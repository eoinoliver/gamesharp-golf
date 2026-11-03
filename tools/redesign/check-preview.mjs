import {webkit} from '/Users/eoinlynn/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {mkdir} from 'node:fs/promises';
const browser=await webkit.launch({headless:true});const page=await browser.newPage({viewport:{width:430,height:932},deviceScaleFactor:1});page.on('pageerror',e=>console.log('ERROR',e.message));
await mkdir('tools/redesign/qa',{recursive:true});
for(const [id,route] of [['home',''],['explore','?all=1'],['round','?play=temptation'],['short','?learn=landing-not-hole'],['studio','?mode=range&face=3&path=6']]){await page.goto('http://127.0.0.1:5174/'+route);await page.waitForTimeout(1800);await page.screenshot({path:`tools/redesign/qa/${id}.png`,fullPage:id==='explore'});console.log(id,await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,controls:document.querySelectorAll('.gs-preferences').length,text:document.querySelector('h1')?.textContent})));}
await browser.close();
