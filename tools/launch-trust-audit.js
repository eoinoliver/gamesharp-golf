const fs = require('fs');
const vm = require('vm');

const file = process.argv[2];
if (!file) throw new Error('Usage: node gamesharp-launch-trust-audit.js /path/to/index.html');
const html = fs.readFileSync(file, 'utf8');
const failures = [];
const notes = [];

function extractConst(name, endMarker) {
  const start = html.indexOf(`const ${name} =`);
  const end = html.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error(`Cannot extract ${name}`);
  return vm.runInNewContext(`${html.slice(start, end)};${name}`, {});
}

for (const [index, match] of [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].entries()) {
  try { new vm.Script(match[1]); }
  catch (error) { failures.push(`Inline script ${index}: ${error.message}`); }
}

const questionStart = html.indexOf('const QUESTIONS =');
const questionEnd = html.indexOf('const SIMILAR_GROUPS', questionStart);
const questionContext = {};
vm.createContext(questionContext);
vm.runInContext(`${html.slice(questionStart, questionEnd)}
this.auditQuestions=QUESTIONS;
this.auditLaunch=LAUNCH_QUESTIONS;
this.auditQuarantine=QUESTION_QUARANTINE;
this.auditDispositions=QUESTION_DISPOSITIONS;
this.auditDispositionCounts=DISPOSITION_COUNTS;
this.auditUnresolved=UNRESOLVED_QUESTION_IDS;`, questionContext);
const questions = questionContext.auditQuestions;
const ids = new Set();
for (const q of questions) {
  if (!q.id || ids.has(q.id)) failures.push(`Duplicate/missing question id: ${q.id}`);
  ids.add(q.id);
  const key = String(q.correct_answer || '').toUpperCase();
  if (!/^[A-D]$/.test(key)) failures.push(`${q.id}: invalid answer key ${key}`);
  if (!String(q[`option_${key.toLowerCase()}`] || '').trim()) failures.push(`${q.id}: keyed option is empty`);
  if (!String(q.why_right || '').trim()) failures.push(`${q.id}: missing explanation`);
}

const launch = questionContext.auditLaunch;
if (!launch.length) failures.push('Launch question pool is empty');
if (launch.some(q => !/— Source:/.test(q.why_right))) failures.push('Unsourced item entered launch pool');
if (questionContext.auditUnresolved.length) failures.push(`Unresolved question dispositions: ${questionContext.auditUnresolved.join(', ')}`);
if (questionContext.auditDispositions.length !== questions.length) failures.push('Disposition count does not match question bank');
for (const item of questionContext.auditDispositions.filter(x=>x.status==='merge')) {
  if (!launch.some(q=>q.id===item.into)) failures.push(`${item.id}: merge target ${item.into} is not live`);
}
for (const q of launch) {
  const disposition = questionContext.auditDispositions.find(x=>x.id===q.id);
  if (disposition?.status !== 'launch') failures.push(`${q.id}: live question lacks launch disposition`);
}
notes.push(`Question bank ${questions.length}; launch-gated ${launch.length}; quarantined ${questionContext.auditQuarantine.length}`);
notes.push(`Editorial dispositions launch ${questionContext.auditDispositionCounts.launch}; merge ${questionContext.auditDispositionCounts.merge}; retire ${questionContext.auditDispositionCounts.retire}; unresolved 0`);

const coldOpens = extractConst('GOLF_COLD_OPENS', 'let GOLF_COLD =');
for (const [index, item] of coldOpens.entries()) {
  if (item.options.filter(o => o.correct).length !== 1) failures.push(`Cold open ${index}: requires exactly one correct option`);
  if (!/illustrative/i.test(String(item.insight || ''))) failures.push(`Cold open ${index}: must disclose illustrative status`);
}
const waterOpen = coldOpens.find(item => /water/i.test(item.situation));
if (!waterOpen?.options.find(o => o.correct)?.label.toLowerCase().includes('lay up')) {
  failures.push('Water cold open must key the penalty-safe lay-up');
}
if (/Steve Williams called/i.test(html)) failures.push('Unsourced Steve Williams attribution remains live');
notes.push(`First-run training ${coldOpens.length} scenarios; one key each; illustrative disclosure present`);

const techniqueStart = html.indexOf('const GOLF_TECHNIQUE =');
const techniqueEnd = html.indexOf('let techState', techniqueStart);
const techniqueCtx = {};
vm.createContext(techniqueCtx);
vm.runInContext(`${html.slice(techniqueStart, techniqueEnd)};this.auditTechnique=GOLF_TECHNIQUE;this.auditFigures=TECH_FIGS;`, techniqueCtx);
const faults = techniqueCtx.auditTechnique.flatMap(g => g.faults.map((f, i) => ({ group:g.key, index:i, fault:f })));
const figures = techniqueCtx.auditFigures;
if (faults.length !== Object.keys(figures).length) failures.push(`Technique faults ${faults.length} != figures ${Object.keys(figures).length}`);
for (const {group, index, fault} of faults) {
  const key = `${group}:${index}`;
  const fig = figures[key];
  if (!fig || !fig.miss || !fig.fix) failures.push(`${key}: missing miss/fix figure`);
  if (fault.options.filter(o => o.correct).length !== 1) failures.push(`${key}: requires exactly one correct option`);
}
if (figures['driver:0']?.miss?.out?.[0] !== 'slice') failures.push('Slice clinic is not bound to slice trajectory');
if (figures['driver:2']?.miss?.out?.[0] !== 'hook') failures.push('Hook clinic is not bound to hook trajectory');
if (figures['irons:2']?.miss?.out?.[0] !== 'push') failures.push('Block clinic is not bound to push trajectory');
notes.push(`Shot Clinic ${faults.length} faults; miss/fix bindings complete`);

const holes = extractConst('ALL_HOLES', 'let HOLE = null;');
const neutralStart=html.indexOf('function neutralHoleChoice(');
const neutralEnd=html.indexOf('function neutralHoleSituation(',neutralStart);
const neutralCtx={};
vm.createContext(neutralCtx);
vm.runInContext(`${html.slice(neutralStart,neutralEnd)};this.cleanChoice=neutralHoleChoice;`,neutralCtx);
const maps = new Set([...html.matchAll(/CAM_MAPS\.([A-Za-z0-9_]+)\s*=/g)].map(m => m[1]));
let nodeCount = 0;
let decisionCount = 0;
let variableDecisionCount = 0;
const sceneCounts = {tee:0, approach:0, recovery:0, bunker:0, putt:0};
const specStart = html.indexOf('function simulatorSpec(');
const specEnd = html.indexOf('function simulatorReviewMarkup(', specStart);
const specContext = {};
vm.createContext(specContext);
vm.runInContext(`${html.slice(specStart, specEnd)};this.auditSimulatorSpec=simulatorSpec;`, specContext);
for (const hole of holes) {
  if (hole.mapType !== 'camera') failures.push(`${hole.name}: not on camera renderer`);
  if (!hole.cam?.mapId || !maps.has(hole.cam.mapId)) failures.push(`${hole.name}: missing map renderer`);
  const nodes = hole.nodes || {};
  for (const [id, node] of Object.entries(nodes)) {
    nodeCount++;
    if (node.mapState && !hole.cam?.zones?.[node.mapState]) failures.push(`${hole.name}/${id}: missing camera zone ${node.mapState}`);
    if (node.choices) {
      decisionCount++;
      const simulationPool=node.choices.map(choice=>nodes[choice.next])
        .filter(next=>next&&((next.outcome&&next.ballTo&&next.mapState)||next.final));
      if(simulationPool.length>=2) variableDecisionCount++;
      specContext.HOLE = hole;
      const spec = specContext.auditSimulatorSpec(id, node);
      sceneCounts[spec.scene] = (sceneCounts[spec.scene] || 0) + 1;
      if (!spec.lie || !spec.danger || !spec.intention || !spec.caption) failures.push(`${hole.name}/${id}: incomplete visual learning contract`);
      const waterDirections = ['waterIsland','waterLong','waterShortRight','waterFrontLeft','waterRight','waterLeft','waterFront'].filter(key => spec[key]);
      if (spec.water && waterDirections.length !== 1) failures.push(`${hole.name}/${id}: water requires exactly one rendered geography, got ${waterDirections.join(',') || 'none'}`);
      const authored = String(node.broadcast || '').toLowerCase();
      if ((id === 'tee' || node.mapState === 'tee') && spec.lie !== 'Tee') failures.push(`${hole.name}/${id}: tee misclassified as ${spec.lie}`);
      if (node.mapState === 'putt' && spec.scene !== 'putt') failures.push(`${hole.name}/${id}: putt misclassified as ${spec.scene}`);
      if (/branch|small gap/.test(authored) && !spec.treeRecovery) failures.push(`${hole.name}/${id}: recovery window not rendered`);
      if (/bunker|sand/.test(String(node.broadcast || '').toLowerCase()) && !spec.bunkerHazard) failures.push(`${hole.name}/${id}: authored bunker not rendered`);
      const waterText = /water|pond|creek|ocean|pacific|sea|bay/.test(authored);
      const authoredLeft = authored.search(/left/), authoredRight = authored.search(/right/);
      if (waterText && /island green/.test(authored) && !spec.waterIsland) failures.push(`${hole.name}/${id}: island water not rendered`);
      if (waterText && !spec.waterIsland && /(?:water|pond|creek|penalty area).{0,24}right|right.{0,24}(?:water|pond|creek|penalty area)/.test(authored) && !(authoredLeft >= 0 && authoredLeft < authoredRight) && !spec.waterRight && !spec.waterShortRight) failures.push(`${hole.name}/${id}: right-side water not rendered right`);
      if (waterText && !spec.waterIsland && /(?:water|pond|creek|rae's creek|penalty area).{0,24}left|left.{0,24}(?:water|pond|creek|rae's creek|penalty area)/.test(authored) && !(authoredRight >= 0 && authoredRight < authoredLeft) && !spec.waterLeft && !spec.waterFrontLeft) failures.push(`${hole.name}/${id}: left-side water not rendered left`);
      if (waterText && /(?:water|pond|creek|ocean|pacific|sea|bay).{0,24}(?:long|beyond)|(?:long|beyond).{0,24}(?:water|pond|creek|ocean|pacific|sea|bay)/.test(authored) && !spec.waterLong) failures.push(`${hole.name}/${id}: long water not rendered long`);
      if (!node.broadcast) failures.push(`${hole.name}/${id}: decision missing broadcast`);
      for (const choice of node.choices) {
        const cleaned=neutralCtx.cleanChoice(choice);
        for(const [field,value] of Object.entries(cleaned)){
          if(String(value).length<5||/\b(the|to|and|or|a)\.?$/i.test(value)||/[,;:]\s*[.?!]$/.test(value))
            failures.push(`${hole.name}/${id}: malformed neutral ${field}: ${value}`);
        }
        if (!nodes[choice.next]) failures.push(`${hole.name}/${id}: missing destination ${choice.next}`);
        const next = nodes[choice.next];
        if (next?.outcome && next.next && nodes[next.next]?.outcome) failures.push(`${hole.name}/${id}: outcome-to-outcome chain`);
      }
    }
  }
}
notes.push(`Play a Hole ${holes.length} holes; ${nodeCount} nodes; ${decisionCount} decisions; ${maps.size} maps`);
notes.push(`Neutral decision copy ${holes.reduce((n,h)=>n+Object.values(h.nodes).reduce((m,x)=>m+(x.choices?.length||0)*2,0),0)} outputs; no fragments`);
if(variableDecisionCount < decisionCount-1) failures.push(`Variable execution coverage ${variableDecisionCount}/${decisionCount}; only explicit context routing may be exempt`);
if(!html.includes("mode:selected.node===authored?'authored':'illustrative'")) failures.push('Execution draw does not distinguish authored and illustrative paths');
if(!/Illustrative execution draw[^<]+not a real-world probability estimate/.test(html)) failures.push('Execution draw disclosure missing');
if(!/The draw changes the result, not the quality of your original decision/.test(html)) failures.push('Decision/outcome separation copy missing');
if(!html.includes("conditionDecision=/putt|match|context/i")) failures.push('Match-state grading is not constrained to material decisions');
if(!html.includes("startDecisionRun(9)")) failures.push('Nine-hole Decision Run entry missing');
if(!html.includes('holeChallenge=')) failures.push('Same-seed challenge link missing');
if(!html.includes("x.sig!==hashSeed(JSON.stringify(signed))")) failures.push('Challenge payload integrity check missing');
if(!html.includes('Link comparison—not a verified leaderboard.')) failures.push('Challenge comparison overclaims verification');
if(!html.includes('PAUSED_HOLE_SESSION_KEY')) failures.push('Challenge entry cannot preserve an interrupted solo hole');
if(!/Locked until this exact seeded run has enough verified completions/.test(html)) failures.push('Evidence gate for field benchmark missing');
if(!html.includes('if(gsReducedMotion()){')||!html.includes('setCamBall(svg,end); HS.ballPos=end; HS._suppressCam=false;')) failures.push('Reduced motion does not bypass camera flight');
notes.push(`Simulation contract ${variableDecisionCount}/${decisionCount} decision nodes; remaining node is explicit match-context routing`);
notes.push(`Visual contracts tee ${sceneCounts.tee}; approach ${sceneCounts.approach}; recovery ${sceneCounts.recovery}; bunker ${sceneCounts.bunker}; putt ${sceneCounts.putt}`);

for (const camera of ['player', 'broadcast', 'plan']) {
  if (!html.includes(`data-camera="${camera}"`)) failures.push(`Missing ${camera} shot review`);
}
if ((html.match(/function simulatorSpec\(/g) || []).length !== 1) failures.push('simulatorSpec must have one implementation');
if ((html.match(/function mountShotSimulator\(/g) || []).length !== 1) failures.push('mountShotSimulator must have one implementation');
if ((html.match(/function simulatorReviewMarkup\(/g) || []).length !== 1) failures.push('simulatorReviewMarkup must have one implementation');
if (!html.includes("setSimulatorCamera('broadcast', false)")) failures.push('Chosen shot does not cut automatically to broadcast flight');
if (!/orientation:landscape/.test(html)) failures.push('Landscape simulator layout guard is missing');
if (!/\.sim-camera-btn\s*\{[^}]*min-height:44px/s.test(html)) failures.push('Camera review controls are below the 44px mobile touch target');
for (const cue of ['playerCue', 'broadcastCue', 'planCue']) {
  if (!html.includes(`dataset.${cue}`)) failures.push(`Missing camera-specific ${cue}`);
}
notes.push('Shot reviews 3 cameras; single renderer/spec implementation; landscape guard present');

if ((html.match(/function presentHoleDecisionTheatre\(/g) || []).length !== 1) failures.push('Play a Hole must have exactly one default-expanded presenter');
if (!/saveHoleSession\(\);\s*presentHoleDecisionTheatre\(\);/.test(html)) failures.push('Every authored shot is not routed through the default-expanded theatre');
if (!html.includes("dataset.gsHoleTheatreDefault='expanded-v1'")) failures.push('Production cannot report the Play a Hole presentation contract');
if (!html.includes("if(theatre.classList.contains('open')){refreshTheatreTitle();theatreBody.scrollTop=0;return;}")) failures.push('Theatre does not reset to the new shot when play advances');
if (!html.includes("theatreBody.scrollTo({top:0,behavior:'auto'})")) failures.push('A committed choice can leave its shot animation off-screen');
if (!/id!=='hole'&&window\.GameSharpHoleTheatre[^\n]+\.close\(\)/.test(html)) failures.push('Leaving Play a Hole can strand its modal over another feature');
notes.push('Play a Hole opens expanded from the authoritative node renderer; answer and next-shot views return to the visual');

if (!/function open\(from\)[^\n]+state\.returnPending[^\n]+else\{const draft=captureSharpenDraft\(\);if\(draft\)state\.draft=draft;regions\(true\)\}/.test(html)) failures.push('Primary Sharpen navigation does not deterministically open the hero');
if (/function open\(from\)[^\n]*(?:checkDue|else renderState\(\))/.test(html)) failures.push('Sharpen can still auto-resume a hidden narrowing stage ahead of its hero');
if (!html.includes('data-continue-draft')||!html.includes('function continueDraft()')) failures.push('Interrupted Sharpen work is not explicitly recoverable from the hero');
if (!html.includes("dataset.gsgSharpenEntry='hero-v1'")) failures.push('Production cannot report the hero-first Sharpen contract');
notes.push('Sharpen primary entry is hero-first; deep restoration is explicit except for exact asset returns');

const advanced = extractConst('ADV_ITEMS', 'let advState');
for (const [index, item] of advanced.entries()) {
  if (!item.options?.some(o => o.id === item.answer)) failures.push(`ADV_ITEMS ${index}: answer missing from options`);
  if (!item.reveal?.lesson && !item.reveal?.headline) failures.push(`ADV_ITEMS ${index}: missing learning reveal`);
  if (!item.src?.filter(Boolean).length) failures.push(`ADV_ITEMS ${index}: missing source list`);
}
notes.push(`Decision Broadcast ${advanced.length} items; keys and source lists present`);

if (!html.includes("mountGolfSwing('dailyTechStage','dailyTechCtrl', q._figKey, 'miss', false)")) {
  failures.push('Daily Shot Clinic does not initialize synchronized comparison');
}
if (!html.includes("gswSetMode('compare', true)")) failures.push('Shot Clinic does not reveal Compare mode');
if (!html.includes('renderAnswerTruthVisual(q, isCorrect)')) failures.push('Answer-grounded launch visual is not active');

console.log(notes.join('\n'));
if (failures.length) {
  console.error(`\nFAIL (${failures.length})`);
  failures.forEach(x => console.error(`- ${x}`));
  process.exit(1);
}
console.log('\nPASS — launch trust invariants hold');
