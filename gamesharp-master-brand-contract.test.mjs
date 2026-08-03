import fs from 'node:fs';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const expected = 'GOLF';
const alternative = 'TENNIS';
const failures = [];
const check = (truth, message) => { if (!truth) failures.push(message); };
const count = (pattern) => (html.match(pattern) || []).length;
const engine = html.match(/<script id="gs-master-brand-engine">([\s\S]*?)<\/script>/)?.[1] || '';
const intro = html.match(/<div id="bootSplash"[\s\S]*?<script id="gs-master-brand-engine">[\s\S]*?<\/script>/)?.[0] || '';

check(count(/id="bootSplash"/g) === 1, 'exactly one startup introduction must exist');
check(count(/id="gs-master-brand-engine"/g) === 1, 'exactly one master-brand engine must exist');
check(new RegExp(`data-product="${expected}"`).test(intro), 'destination product must come from the Golf project');
check(/gs-master-g">G<\/span><span class="gs-master-fill gs-master-game">AME/.test(intro), 'G must construct GAME rather than use a typewriter effect');
check(/gs-master-s">S<\/span><span class="gs-master-fill gs-master-sharp">HARP/.test(intro), 'S must construct SHARP rather than use a typewriter effect');
check(/@keyframes gsMasterConstruct/.test(intro), 'wordmark construction animation is required');
check(/data-gs-primary/.test(intro) && /data-gs-alternative/.test(intro), 'both sports must stay visible');
check(/product==='TENNIS'\?'GOLF':'TENNIS'/.test(engine), 'alternative sport must derive from selected product');
check(/name==='TENNIS'\?'is-tennis':'is-golf'/.test(engine), 'each offering must receive its truthful ball treatment');
check(/gsMasterTennisBall/.test(intro) && /gsMasterGolfBall/.test(intro), 'both restrained ball movements are required');
check(/meta\[property="og:url"\]/.test(engine), 'site identity must derive from existing project metadata');
check(!/gamesharp(?:golf|tennis)\.com/i.test(engine), 'brand engine must not hard-code a product address');
check(/3050/.test(engine) && /3600/.test(engine), 'full first-visit sequence must finish within 3–4 seconds');
check(/seen&&!force/.test(engine) && /620/.test(engine), 'return visits must use the brief transition');
check(/prefers-reduced-motion: reduce/.test(intro) && /260/.test(engine), 'reduced motion must preserve content with a short static handoff');
check(/brandMotion=reduce/.test(engine), 'reduced-motion path must remain directly auditable');
check(/pointerdown','wheel','touchmove/.test(engine), 'tap, click and scroll skip paths are required');
check(/e\.key==='Enter'/.test(engine) && /e\.key==='Escape'/.test(engine), 'keyboard skip must work');
check(/gsMasterSafety/.test(intro) && /5000/.test(engine), 'a safety escape must prevent a blocking loading screen');
check(/dataset\.gsMasterBrand/.test(engine) && /GS_MASTER_BRAND_CONFIG/.test(engine), 'production-readable integrity state is required');
check(/gs-master-intro-done/.test(engine), 'destination handoff event is required');
check(/function gsStartHomeReveal\(\)[\s\S]{0,520}gsMasterIntroActive[\s\S]{0,260}gs-master-intro-done/.test(html), 'Golf home reveal must wait for the shared introduction');
check(!/spinner|loading/i.test(intro), 'the introduction must not present itself as loading UI');

if (failures.length) {
  console.error(JSON.stringify({ contract: 'gamesharp-master-brand-v1', product: expected, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ contract: 'gamesharp-master-brand-v1', product: expected, alternative, status: 'PASS', checks: 23 }, null, 2));
