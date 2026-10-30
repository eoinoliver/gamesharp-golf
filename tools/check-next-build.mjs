import {readdir,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {join} from 'node:path';
async function walk(path){const files=[];for(const d of await readdir(path,{withFileTypes:true})){const f=join(path,d.name);files.push(...(d.isDirectory()?await walk(f):[f]));}return files;}
const files=await walk('dist');
for(const file of files){assert.match(file,/^dist\/(index\.html|icon\.svg|assets\/[\w.-]+\.(js|css))$/,'Unexpected published file: '+file);const text=await readFile(file,'utf8');for(const forbidden of ['PACK_QS','launchReady','localStorage.golf','golf_engine.js','dr.html','Sharpen Deck'])assert.ok(!text.includes(forbidden),`${forbidden} leaked into ${file}`);}
const html=await readFile('dist/index.html','utf8');assert.ok(html.includes('The Flag Isn’t the Target'));assert.ok(html.includes('noindex'));
console.log(`Clean build verified: ${files.length} files; no legacy HTML, assets, packs or service worker.`);
