import {readdir,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {join} from 'node:path';
async function walk(path){const files=[];for(const d of await readdir(path,{withFileTypes:true})){const f=join(path,d.name);files.push(...(d.isDirectory()?await walk(f):[f]));}return files;}
const files=await walk('dist');
for(const file of files){assert.match(file,/^dist\/(index\.html|sw\.js|icon\.svg|shotmaker-licenses\.txt|assets\/(?:[\w.-]+\.(js|css)|golf-player-[\w-]+\.glb|headland-(?:sky|rock|rock-normal)-[\w-]+\.jpg|(?:dm-sans-normal|instrument-serif-normal|instrument-serif-italic)-[\w-]+\.woff2))$/,'Unexpected published file: '+file);if(file.endsWith('.glb')){const data=await readFile(file);assert.equal(data.readUInt32LE(0),0x46546c67);assert.ok(data.length<5_000_000,'Character exceeded the approved asset budget');continue;}if(file.endsWith('.jpg')||file.endsWith('.woff2')){const data=await readFile(file);assert.ok(data.length<800_000,'Shotmaker asset exceeded its budget');continue;}const text=await readFile(file,'utf8');for(const forbidden of ['PACK_QS','launchReady','localStorage.golf','golf_engine.js','dr.html','Sharpen Deck'])assert.ok(!text.includes(forbidden),`${forbidden} leaked into ${file}`);}
const html=await readFile('dist/index.html','utf8');assert.ok(html.includes('Shotmaker'));assert.ok(html.includes('noindex'));
const worker=await readFile('dist/sw.js','utf8');assert.ok(worker.includes('registration.unregister()'));assert.ok(!/addEventListener\(['"]fetch['"]/.test(worker),'Retirement worker must not intercept fetches');
console.log(`Clean build verified: ${files.length} files; explicit character, coastal materials and font allowlist; no legacy HTML or packs; retirement-only service worker.`);
