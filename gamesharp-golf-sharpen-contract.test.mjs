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
const required=['before','first','tee','approach','green','putting','pressure','nineteenth'];
assert.deepEqual(Object.keys(R),required,'Eight round moments must be authoritative and ordered');
const ids=new Set();
for(const [rid,r] of Object.entries(R)){
 assert.equal(r.number,required.indexOf(rid)+1,rid+' has wrong round order');
 assert(r.issues.length>=3&&r.issues.length<=5,rid+' must have 3-5 issues');
 for(const issue of r.issues){assert(!ids.has(issue.id),'duplicate issue '+issue.id);ids.add(issue.id);assert(Q[issue.route],'unreachable route '+issue.route)}
}
for(const [qid,q] of Object.entries(Q)) for(const answer of q.answers) assert(Z[answer.resultId],qid+' has missing result');
for(const [id,r] of Object.entries(Z)){
 for(const key of ['read','coachLens','watchFor','focus','cue']) assert(r[key],id+' missing '+key);
 assert(r.assetIds.length>=1&&r.assetIds.length<=3,id+' must route to 1-3 assets');
 assert.equal(r.confidence,'guided-hypothesis',id+' crosses claim boundary');
 assert.equal(r.reviewStatus,'launch-reviewed',id+' lacks review');assert(r.sources.length,id+' lacks source support');
 for(const aid of r.assetIds){assert(A[aid],id+' missing asset '+aid);assert.equal(A[aid].launchStatus,'approved',id+' links unapproved asset')}
 if(id.startsWith('putting_pace')) assert(/pace|finish|short|long/i.test(r.focus),'pace route has non-pace focus');
 if(id.startsWith('tee_curve')) assert(/start|curve|corridor/i.test(r.focus),'curve route has non-flight focus');
 if(id.startsWith('first_')||id.startsWith('pressure_')) assert(!/swing fix|clubface path/i.test(r.focus),'mental route invents mechanical diagnosis');
}
for(const [id,a] of Object.entries(A)){assert(a.destination&&Array.isArray(a.routeParams),id+' lacks exact destination');assert(!/generic|todo|later/i.test(a.title+a.description),id+' is generic/deferred')}
const mini=Object.entries(A).filter(([,a])=>a.type==='mini');
assert(mini.length>=6,'focused legacy mini-session coverage is incomplete');
for(const [id,a] of mini) assert.equal(a.routeParams[1].length,3,id+' must contain exactly three approved question IDs');
assert(!Object.values(A).some(a=>a.destination==='startHole'),'generic Play a Hole destination remains reachable');
assert(Object.values(A).filter(a=>a.destination==='startSharpenHole').length>=4,'exact authored hole mappings incomplete');
assert(/else if\(id === 'sharpen'\)\{ GameSharpGolfSharpen\.open\(\); \}/.test(html),'Practice must open the round journey directly');
assert(!/else if\(id === 'sharpen'\)\{ renderSharpen\(\)/.test(html),'Legacy lobby remains primary');
assert(/prefers-reduced-motion:reduce/.test(html),'Reduced-motion treatment missing');
assert(/class="gss-round"/.test(html)&&/class="gss-moment/.test(html),'round journey UI missing');
assert(!/class="gss-player"|class="gss-hotspot"/.test(html),'legacy golfer/body-map entry remains reachable');
assert(/Where did your round need you most\?/.test(html),'round-first prompt missing');
assert(/aria-modal="true"/.test(html)&&/if\(e\.key==='Tab'\)/.test(html),'Modal focus contract missing');
assert(/returnPending/.test(html)&&/returnFromAsset/.test(html),'Asset return context missing');
assert(/SHARPEN FOCUS/.test(html)&&/During this rep:/.test(html),'Legacy asset does not carry Sharpen learning context');
assert(!/<h3>The Read<\/h3>/.test(html),'duplicated Read section remains visible');
assert(/resultViews/.test(html)&&/gss-result\$\{compact\?' compact'/.test(html),'return-player progressive disclosure missing');
assert(/PLAY WITH SEVE’S IMAGINATION/.test(html)&&/europeantour\.com\/dpworld-tour\/news\/video\/the-best-of-seve-ballesteros/.test(html),'sourced Seve identity moment missing');
assert((html.match(/Find the Culprit ·/g)||[]).length>=8,'Shot Clinic is not explicitly wired as Find the Culprit');
assert(/function exitQuiz\(\)\{\s*if\(window\.GameSharpGolfSharpen&&GameSharpGolfSharpen\.returnFromAsset\(\)\) return;/.test(html),'focused mini-session native exit loses Sharpen context');
assert((html.match(/hvh-back" onclick="if\(!GameSharpGolfSharpen\.returnFromAsset\(\)\)/g)||[]).length>=2,'focused hole native exit loses Sharpen context');
assert(/\.gss-moment\{[^}]*min-height:68px/.test(html),'48px round-moment target missing');
console.log(JSON.stringify({ok:true,regions:Object.keys(R).length,routes:Object.keys(Q).length,results:Object.keys(Z).length,assets:Object.keys(A).length},null,2));
