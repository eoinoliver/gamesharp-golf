import {readdir,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {join} from 'node:path';
async function walk(path){const files=[];for(const d of await readdir(path,{withFileTypes:true})){const f=join(path,d.name);files.push(...(d.isDirectory()?await walk(f):[f]));}return files;}
const files=await walk('dist');
for(const file of files){assert.match(file,/^dist\/(index\.html|icon\.svg|assets\/(?:[\w.-]+\.(js|css)|golf-player-[\w-]+\.glb))$/,'Unexpected published file: '+file);if(file.endsWith('.glb')){const data=await readFile(file);assert.equal(data.readUInt32LE(0),0x46546c67);assert.ok(data.length<5_000_000,'Character exceeded the approved asset budget');continue;}const text=await readFile(file,'utf8');for(const forbidden of ['PACK_QS','launchReady','localStorage.golf','golf_engine.js','dr.html','Sharpen Deck'])assert.ok(!text.includes(forbidden),`${forbidden} leaked into ${file}`);}
const html=await readFile('dist/index.html','utf8');assert.ok(html.includes('Six Reads'));assert.ok(html.includes('noindex'));
console.log(`Clean build verified: ${files.length} files; approved player GLB only; no legacy HTML, packs or service worker.`);
