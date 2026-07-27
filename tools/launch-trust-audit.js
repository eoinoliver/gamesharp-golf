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
for (const hole of holes) {
  if (hole.mapType !== 'camera') failures.push(`${hole.name}: not on camera renderer`);
  if (!hole.cam?.mapId || !maps.has(hole.cam.mapId)) failures.push(`${hole.name}: missing map renderer`);
  const nodes = hole.nodes || {};
  for (const [id, node] of Object.entries(nodes)) {
    nodeCount++;
    if (node.mapState && !hole.cam?.zones?.[node.mapState]) failures.push(`${hole.name}/${id}: missing camera zone ${node.mapState}`);
    if (node.choices) {
      decisionCount++;
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
