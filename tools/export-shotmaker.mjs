import {build} from 'vite';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {resolve,dirname,basename} from 'node:path';

// Portable, offline version of the current Shotmaker entry only. The archive
// and experimental motion study are intentionally not included in this file.
const [destination,canonical]=process.argv.slice(2);
if(!destination||!canonical)throw new Error('Usage: node tools/export-shotmaker.mjs OUTPUT.html https://PREVIEW/');
const publicURL=new URL(canonical);if(publicURL.protocol!=='https:')throw new Error('Expected an HTTPS preview URL');
const result=await build({configFile:false,root:resolve('next'),logLevel:'warn',plugins:[{
 name:'portable-shotmaker-links',enforce:'pre',transform(code,id){
  if(!id.endsWith('/shotmaker.js'))return null;
  return code.replaceAll('href="?view=library"',`href="${publicURL.href}?view=library"`)
   .replace('href="/" aria-label="GameSharp Golf home"',`href="./${basename(destination)}" aria-label="GameSharp Golf home"`)
   .replaceAll('const url=new URL(location.href);url.search=',`const url=new URL(${JSON.stringify(publicURL.href)});url.search=`);
 }
}],build:{write:false,minify:true,cssCodeSplit:false,lib:{entry:resolve('next/src/shotmaker.js'),name:'GameSharpShotmaker',formats:['iife']},rollupOptions:{output:{inlineDynamicImports:true}},chunkSizeWarningLimit:4000}});
const files=(Array.isArray(result)?result:[result]).flatMap(r=>r.output),js=files.filter(f=>f.type==='chunk').map(f=>f.code).join('\n'),css=files.filter(f=>f.type==='asset'&&f.fileName.endsWith('.css')).map(f=>f.source).join('\n');
if(files.some(f=>f.type==='asset'&&!f.fileName.endsWith('.css')))throw new Error('Portable build contains a non-inlined asset');
const licenses=(await readFile('next/public/shotmaker-licenses.txt','utf8')).replaceAll('&','&amp;').replaceAll('<','&lt;');
const html=`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#0c1916"><meta name="robots" content="noindex,nofollow"><title>Shotmaker · GameSharp Golf</title><style>${css}</style></head><body><div id="app"></div><template id="asset-licenses">${licenses}</template><script>${js.replace(/<\/script/gi,'<\\/script')}</script></body></html>`;
await mkdir(dirname(resolve(destination)),{recursive:true});await writeFile(destination,html);console.log(`Portable Shotmaker: ${destination} (${(Buffer.byteLength(html)/1e6).toFixed(2)} MB). Fonts, terrain, sky and impact code are embedded.`);
