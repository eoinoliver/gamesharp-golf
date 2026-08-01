import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const engine=html.match(/<script id="gsg-sharpen-engine">([\s\S]*?)<\/script>/)?.[1];
assert(engine,'Sharpen engine missing');
const frozen=engine.slice(0,engine.indexOf('(function(){'));
const sandbox={Object,console};vm.createContext(sandbox);
vm.runInContext(frozen+';this.out={GOLF_SHARPEN_REGIONS,GOLF_SHARPEN_ROUTES,GOLF_SHARPEN_RESULTS,GOLF_SHARPEN_ASSETS};',sandbox);
const {GOLF_SHARPEN_REGIONS:R,GOLF_SHARPEN_ROUTES:Q,GOLF_SHARPEN_RESULTS:Z,GOLF_SHARPEN_ASSETS:A}=sandbox.out;
const required=['mental','course','tee','approach','short','putting','routine'];
assert.deepEqual(Object.keys(R),required,'Seven required diagnostic regions must be authoritative');
const ids=new Set(),aria=new Set();
for(const [rid,r] of Object.entries(R)){
 assert(r.issues.length>=3&&r.issues.length<=5,rid+' must have 3-5 issues');
 for(const issue of r.issues){assert(!ids.has(issue.id),'duplicate issue '+issue.id);ids.add(issue.id);assert(Q[issue.route],'unreachable route '+issue.route)}
 for(const h of r.hotspots){assert(h.x>=0&&h.x<=100&&h.y>=0&&h.y<=100,'invalid hotspot '+rid);assert(h.labelSide&&Number.isFinite(h.lineAngle),'missing label geometry '+rid);assert(h.ariaLabel&&!aria.has(h.ariaLabel),'duplicate/missing accessible name '+rid);aria.add(h.ariaLabel)}
}
for(const [qid,q] of Object.entries(Q)) for(const answer of q.answers) assert(Z[answer.resultId],qid+' has missing result');
for(const [id,r] of Object.entries(Z)){
 for(const key of ['read','coachLens','focus','cue']) assert(r[key],id+' missing '+key);
 assert(r.assetIds.length>=1&&r.assetIds.length<=3,id+' must route to 1-3 assets');
 assert.equal(r.confidence,'guided-hypothesis',id+' crosses claim boundary');
 assert.equal(r.reviewStatus,'launch-reviewed',id+' lacks review');assert(r.sources.length,id+' lacks source support');
 for(const aid of r.assetIds){assert(A[aid],id+' missing asset '+aid);assert.equal(A[aid].launchStatus,'approved',id+' links unapproved asset')}
 if(id.startsWith('putting_pace')) assert(/pace|finish|short|long/i.test(r.focus),'pace route has non-pace focus');
 if(id.startsWith('tee_curve')) assert(/start|curve|corridor/i.test(r.focus),'curve route has non-flight focus');
 if(id.startsWith('mental_')) assert(!/swing fix|clubface path/i.test(r.focus),'mental route invents mechanical diagnosis');
}
for(const [id,a] of Object.entries(A)){assert(a.destination&&Array.isArray(a.routeParams),id+' lacks exact destination');assert(!/generic|todo|later/i.test(a.title+a.description),id+' is generic/deferred')}
assert(/else if\(id === 'sharpen'\)\{ GameSharpGolfSharpen\.open\(\); \}/.test(html),'Practice must open golfer directly');
assert(!/else if\(id === 'sharpen'\)\{ renderSharpen\(\)/.test(html),'Legacy lobby remains primary');
assert(/prefers-reduced-motion:reduce/.test(html),'Reduced-motion treatment missing');
assert(/classList\.add\('fallback'\)/.test(html),'Image failure fallback missing');
assert(/aria-modal="true"/.test(html)&&/if\(e\.key==='Tab'\)/.test(html),'Modal focus contract missing');
assert(/returnPending/.test(html)&&/returnFromAsset/.test(html),'Asset return context missing');
assert(/\.gss-hotspot\{[^}]*width:48px;height:48px/.test(html),'48px hotspot target missing');
console.log(JSON.stringify({ok:true,regions:Object.keys(R).length,routes:Object.keys(Q).length,results:Object.keys(Z).length,assets:Object.keys(A).length},null,2));
