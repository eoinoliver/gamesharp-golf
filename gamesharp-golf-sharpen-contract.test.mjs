import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const engine=html.match(/<script id="gsg-sharpen-engine">([\s\S]*?)<\/script>/)?.[1];
assert(engine,'Sharpen engine missing');
const frozen=engine.slice(0,engine.indexOf('(function(){'));
const sandbox={Object,console};vm.createContext(sandbox);
vm.runInContext(frozen+';this.out={GOLF_SHARPEN_REGIONS,GOLF_SHARPEN_ROUTES,GOLF_SHARPEN_RESULTS,GOLF_SHARPEN_ASSETS,GSS_QUESTION_LEARNING};',sandbox);
const {GOLF_SHARPEN_REGIONS:R,GOLF_SHARPEN_ROUTES:Q,GOLF_SHARPEN_RESULTS:Z,GOLF_SHARPEN_ASSETS:A,GSS_QUESTION_LEARNING:QL}=sandbox.out;
const required=['before','first','tee','approach','green','putting','pressure','nineteenth'];
assert.deepEqual(Object.keys(R),required,'Eight round moments must be authoritative and ordered');
const ids=new Set();
const issueSignatures=new Set(),focusSignatures=new Set();
for(const [rid,r] of Object.entries(R)){
 assert.equal(r.number,required.indexOf(rid)+1,rid+' has wrong round order');
 assert(r.issues.length>=3&&r.issues.length<=5,rid+' must have 3-5 issues');
 const issueSignature=r.issues.map(x=>x.label).sort().join('|');assert(!issueSignatures.has(issueSignature),rid+' duplicates another moment journey');issueSignatures.add(issueSignature);
 for(const issue of r.issues){assert(!ids.has(issue.id),'duplicate issue '+issue.id);ids.add(issue.id);assert(Q[issue.route],'unreachable route '+issue.route)}
 const focusSignature=Object.values(Z).filter(x=>x.regionId===rid).map(x=>x.focus).sort().join('|');assert(!focusSignatures.has(focusSignature),rid+' duplicates another moment focus set');focusSignatures.add(focusSignature);
}
for(const [qid,q] of Object.entries(Q)) for(const answer of q.answers) assert(Z[answer.resultId],qid+' has missing result');
for(const [id,r] of Object.entries(Z)){
 for(const key of ['read','coachLens','watchFor','focus','cue']) assert(r[key],id+' missing '+key);
 assert(Array.isArray(r.learningKeys)&&r.learningKeys.length,id+' lacks semantic learning keys');
 assert(!/^The useful gain is often|^The final outcome is the symptom/.test(r.coachLens),id+' uses generic fallback coaching');
 assert(r.assetIds.length>=1&&r.assetIds.length<=3,id+' must route to 1-3 assets');
 assert.equal(r.confidence,'guided-hypothesis',id+' crosses claim boundary');
 assert.equal(r.reviewStatus,'launch-reviewed',id+' lacks review');assert(r.sources.length,id+' lacks source support');for(const source of r.sources)assert(/^https:\/\/(www\.)?(pga\.com|usga\.org)\//.test(source),id+' uses a non-primary source: '+source);
 for(const aid of r.assetIds){assert(A[aid],id+' missing asset '+aid);assert.equal(A[aid].launchStatus,'approved',id+' links unapproved asset');assert(Array.isArray(A[aid].learningKeys),aid+' lacks semantic keys');assert(r.learningKeys.some(k=>A[aid].learningKeys.includes(k)),id+' is semantically incompatible with '+aid)}
 if(id.startsWith('putting_pace')) assert(/pace|finish|short|long/i.test(r.focus),'pace route has non-pace focus');
 if(id.startsWith('tee_curve')) assert(/start|curve|corridor/i.test(r.focus),'curve route has non-flight focus');
 if(id.startsWith('first_')||id.startsWith('pressure_')) assert(!/swing fix|clubface path/i.test(r.focus),'mental route invents mechanical diagnosis');
}
for(const [id,a] of Object.entries(A)){assert(a.destination&&Array.isArray(a.routeParams),id+' lacks exact destination');assert(!/generic|todo|later/i.test(a.title+a.description),id+' is generic/deferred');assert(Object.values(Z).some(r=>r.assetIds.includes(id)),id+' is dead/unreachable')}
const mini=Object.entries(A).filter(([,a])=>a.type==='mini');
assert(mini.length>=6,'focused legacy mini-session coverage is incomplete');
for(const [id,a] of mini){assert.equal(a.routeParams[1].length,3,id+' must contain exactly three approved question IDs');const covered=new Set(a.routeParams[1].flatMap(qid=>{assert(QL[qid],id+' question '+qid+' lacks reviewed semantic keys');return QL[qid]}));for(const key of a.learningKeys)assert(covered.has(key),id+' claims learning not covered by its questions: '+key)}
assert(!Object.values(A).some(a=>a.destination==='startHole'),'generic Play a Hole destination remains reachable');
assert(Object.values(A).filter(a=>a.destination==='startSharpenHole').length>=4,'exact authored hole mappings incomplete');
assert.equal(A.debrief.destination,'showDebrief','19th Hole promise must open the debrief directly');
assert(/19TH HOLE DEBRIEF[\s\S]{0,300}GameSharpGolfSharpen\.returnFromAsset/.test(html)||/GameSharpGolfSharpen\.returnFromAsset[\s\S]{0,300}19TH HOLE DEBRIEF/.test(html),'debrief native close loses Sharpen context');
for(const id of ['QE5_040','QE5_041','QE5_042','QE5_043','QE5_044','QE5_045']){assert.equal((html.match(new RegExp('"id"\\s*:\\s*"'+id+'"','g'))||[]).length,1,id+' must exist exactly once');assert(new RegExp('"id"\\s*:\\s*"'+id+'"[\\s\\S]{0,500}"visual_must_show"\\s*:\\s*false').test(html),id+' unexpectedly requires an uncontracted visual')}
assert(/else if\(id === 'sharpen'\)\{ GameSharpGolfSharpen\.open\(\); \}/.test(html),'Practice must open the round journey directly');
assert(!/else if\(id === 'sharpen'\)\{ renderSharpen\(\)/.test(html),'Legacy lobby remains primary');
assert(/prefers-reduced-motion:reduce/.test(html),'Reduced-motion treatment missing');
assert(/class="gss-journey-map"/.test(html)&&/class="gss-map-node/.test(html),'interactive round journey UI missing');
assert(!/class="gss-player"|class="gss-hotspot"/.test(html),'legacy golfer/body-map entry remains reachable');
assert(/What do you need now\?/.test(html),'three-state entry prompt missing');
assert.equal((html.match(/data-mode="(prepare|sharpen|reflect)"/g)||[]).length,3,'entry must expose exactly three human states');
assert(fs.existsSync(new URL('./gamesharp-round-journey-v1.png',import.meta.url)),'production round-journey artwork missing');
assert(/id="gss-cinema"[^>]*hidden/.test(html),'persistent cinematic journey layer missing');
assert(/const CINEMA_ORDER=\['before','first','tee','approach','green','putting','pressure','nineteenth'\]/.test(html),'cinematic round order is not authoritative');
assert(/function cinema\(stage,moment='tee',resultId=null\)/.test(html),'authoritative cinematic renderer missing');
assert(/result\?result\.cue/.test(html),'cinematic result caption must derive from the authoritative result cue');
assert(/grid-template-columns:repeat\(8,1fr\)/.test(html),'cinematic journey rail must expose all eight round moments');
assert(/previewMoment=mode=>\(\{prepare:'before',sharpen:'tee',reflect:'nineteenth'\}\[mode\]/.test(html),'entry cinema does not respond to all three intentions');
assert(/function journeyMap\(allowed\)[\s\S]{0,500}gss-map-node/.test(html),'interactive full-round map renderer missing');
assert(/\$\{journeyMap\(allowed\)\}/.test(html),'full-round map is not the moment-selection surface');
for(const id of ['before','first','tee','approach','green','putting','pressure','nineteenth'])assert(new RegExp(`gss-map-node\\[data-region="${id}"\\]`).test(html),`map position missing: ${id}`);
assert(/cinema\('issue',rid\)/.test(html),'persistent illustration missing from symptom selection');
assert(/cinema\('route',state\.regionId\)/.test(html),'persistent illustration missing from distinction');
assert(/cinema\('result',r\.regionId,id\)/.test(html),'persistent illustration missing from focus result');
assert(/cinema\('result',r\.regionId,saved\.resultId\)/.test(html),'saved-focus return loses cinematic context');
assert(!/class="gss-journey-visual"/.test(html),'retired recreated illustration remains reachable');
assert(/mode==='prepare'\?\['before','first'\]:\['tee','approach','green','putting','pressure'\]/.test(html),'entry-state moment filtering is not authoritative');
assert(/if\(mode==='reflect'\)\{state\.entryMode=mode;issues\('nineteenth'\)/.test(html),'reflect must enter the 19th Hole without another menu');
assert(/const focus=`<section class="gss-result-lead"[\s\S]{0,1000}Test it now[\s\S]{0,700}<details class="gss-why"/.test(html),'result does not lead with one focus and one test before explanation');
assert(!/data-save>Save this focus/.test(html)&&/Take this to the course/.test(html)&&/Make this tomorrow’s focus/.test(html),'benefit-led save language missing');
assert(/aria-modal="true"/.test(html)&&/if\(e\.key==='Tab'\)/.test(html),'Modal focus contract missing');
assert(/function set\(html,label\)\{[^}]*el\.scrollTop=0/.test(html),'Sharpen stage transitions can inherit stale mobile scroll');
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
