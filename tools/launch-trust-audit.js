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

const questions = extractConst('QUESTIONS', 'const SIMILAR_GROUPS');
const ids = new Set();
for (const q of questions) {
  if (!q.id || ids.has(q.id)) failures.push(`Duplicate/missing question id: ${q.id}`);
  ids.add(q.id);
  const key = String(q.correct_answer || '').toUpperCase();
  if (!/^[A-D]$/.test(key)) failures.push(`${q.id}: invalid answer key ${key}`);
  if (!String(q[`option_${key.toLowerCase()}`] || '').trim()) failures.push(`${q.id}: keyed option is empty`);
  if (!String(q.why_right || '').trim()) failures.push(`${q.id}: missing explanation`);
}

const launch = questions.filter(q => {
  const key = String(q.correct_answer || '').toUpperCase();
  return /^[A-D]$/.test(key)
    && String(q[`option_${key.toLowerCase()}`] || '').trim()
    && /— Source:/.test(String(q.why_right || ''));
});
if (!launch.length) failures.push('Launch question pool is empty');
if (launch.some(q => !/— Source:/.test(q.why_right))) failures.push('Unsourced item entered launch pool');
notes.push(`Question bank ${questions.length}; launch-gated ${launch.length}; quarantined ${questions.length - launch.length}`);

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
const maps = new Set([...html.matchAll(/CAM_MAPS\.([A-Za-z0-9_]+)\s*=/g)].map(m => m[1]));
let nodeCount = 0;
let decisionCount = 0;
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
        if (!nodes[choice.next]) failures.push(`${hole.name}/${id}: missing destination ${choice.next}`);
        const next = nodes[choice.next];
        if (next?.outcome && next.next && nodes[next.next]?.outcome) failures.push(`${hole.name}/${id}: outcome-to-outcome chain`);
      }
    }
  }
}
notes.push(`Play a Hole ${holes.length} holes; ${nodeCount} nodes; ${decisionCount} decisions; ${maps.size} maps`);
notes.push(`Visual contracts tee ${sceneCounts.tee}; approach ${sceneCounts.approach}; recovery ${sceneCounts.recovery}; bunker ${sceneCounts.bunker}; putt ${sceneCounts.putt}`);

for (const camera of ['player', 'broadcast', 'plan']) {
  if (!html.includes(`data-camera="${camera}"`)) failures.push(`Missing ${camera} shot review`);
}
if ((html.match(/function simulatorSpec\(/g) || []).length !== 1) failures.push('simulatorSpec must have one implementation');
if ((html.match(/function mountShotSimulator\(/g) || []).length !== 1) failures.push('mountShotSimulator must have one implementation');
if ((html.match(/function simulatorReviewMarkup\(/g) || []).length !== 1) failures.push('simulatorReviewMarkup must have one implementation');
if (!html.includes("setSimulatorCamera('broadcast', false)")) failures.push('Chosen shot does not cut automatically to broadcast flight');
if (!/orientation:landscape/.test(html)) failures.push('Landscape simulator layout guard is missing');
if (!/\.sim-camera-btn\s*\{[^}]*min-height:38px/s.test(html)) failures.push('Camera review controls are below the 38px mobile touch target');
for (const cue of ['playerCue', 'broadcastCue', 'planCue']) {
  if (!html.includes(`dataset.${cue}`)) failures.push(`Missing camera-specific ${cue}`);
}
notes.push('Shot reviews 3 cameras; single renderer/spec implementation; landscape guard present');

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
