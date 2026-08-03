import fs from 'node:fs';
import assert from 'node:assert/strict';

const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');

assert.equal((html.match(/function presentHoleDecisionTheatre\(/g)||[]).length,1,'default-expanded presenter must have one implementation');
assert.equal((html.match(/presentHoleDecisionTheatre\(\);/g)||[]).length,1,'default-expanded presenter must be invoked only by the authoritative node renderer');
assert(/function renderHoleNode\(nodeId\)[\s\S]{0,2200}mountShotSimulator\(nodeId, node\);[\s\S]{0,180}saveHoleSession\(\);\s*presentHoleDecisionTheatre\(\);/.test(html),'every rendered shot must enter the theatre after its visual, choices and session exist');
assert(/function presentHoleDecisionTheatre\(\)[\s\S]{0,700}view\.classList\.contains\('active'\)[\s\S]{0,350}GameSharpHoleTheatre\.open\(map\)/.test(html),'presenter must refuse stale/invisible holes and use the shared theatre');
assert(/function beginHole\([\s\S]{0,900}renderHoleNode\('tee'\)/.test(html),'fresh holes must use the authoritative node renderer');
assert(/function resumeHole\([\s\S]{0,900}renderHoleNode\(HS\.currentNode\)/.test(html),'interrupted holes must use the authoritative node renderer');
assert(/function advanceHole\([\s\S]{0,600}renderHoleNode\(nextId\)/.test(html),'later shots must use the authoritative node renderer');

assert(/const subjects=\[map,panel,outcome,score\]/.test(html),'theatre must keep visual, decision, result and scorecard in one surface');
assert(/if\(theatre\.classList\.contains\('open'\)\)\{refreshTheatreTitle\(\);theatreBody\.scrollTop=0;return;\}/.test(html),'each new shot must refresh its title and return the visual to view');
assert(/function commitTheatreChoice\([\s\S]{0,500}theatreBody\.scrollTo\(\{top:0,behavior:'auto'\}\)/.test(html),'committing a below-fold choice must reveal the shot animation');
assert(/phaseLabels=\{study:'Study',flight:'Watch the shot',result:'Read the result',complete:'Hole complete'\}/.test(html),'theatre phases must explain the choice-to-flight-to-result sequence');
assert(/if\(id!=='hole'&&window\.GameSharpHoleTheatre&&window\.GameSharpHoleTheatre\.isOpen\(\)\)window\.GameSharpHoleTheatre\.close\(\)/.test(html),'leaving the feature must close and restore the theatre');

assert(/app\.setAttribute\('inert',''\);app\.setAttribute\('aria-hidden','true'\)/.test(html),'background must be inert and hidden from assistive technology while the theatre is open');
assert(/if\(!inert\)el\.removeAttribute\('inert'\)[\s\S]{0,180}aria-hidden/.test(html),'background accessibility state must be restored exactly');
assert(/theatre\.addEventListener\('keydown',[\s\S]{0,650}e\.key!=='Tab'[\s\S]{0,500}last\.focus\(\)[\s\S]{0,180}first\.focus\(\)/.test(html),'keyboard focus must be trapped inside the modal');
assert(/const restore=theatreOpener;theatreOpener=null;if\(restore&&restore\.isConnected\)restore\.focus/.test(html),'closing must restore focus to the opener');
assert(/aria-label="Use compact hole view"/.test(html),'theatre close control must describe its actual compact-view action');

assert(/\.gs-hole-theatre\{[^}]*height:100dvh[^}]*overscroll-behavior:none/.test(html),'theatre must own the dynamic mobile viewport');
assert(/\.gs-hole-theatre-bar\{[^}]*width:100%;min-width:0/.test(html)&&/\.gs-hole-theatre-body\{width:100%;min-width:0[^}]*overflow-x:hidden/.test(html),'theatre grid items must never expand beyond the mobile viewport');
assert(/\.gs-hole-theatre-close\{width:48px;height:48px;flex:0 0 48px/.test(html),'compact-view control must meet the 48px target contract');
assert(/\.sim-camera-btn\s*\{[^}]*min-height:44px/.test(html),'camera review controls must meet the iOS 44px target contract');
assert(/height:clamp\(210px,38svh,340px\)!important;min-height:210px/.test(html),'portrait visual must leave room for the decision on short phones');
assert(/orientation:landscape[\s\S]{0,500}grid-template-columns:minmax\(0,58%\) minmax\(270px,42%\)/.test(html),'landscape must show the shot and decision side-by-side');
assert(/prefers-reduced-motion:reduce\)\{\.gs-focus-overlay\.open,\.gs-hole-theatre\.open\{animation:none/.test(html),'reduced motion must remove theatre entrance motion without removing information');
assert(/document\.documentElement\.dataset\.gsMotion=reduce\?'reduce':'full'/.test(html)&&/html\[data-gs-motion="reduce"\] \*/.test(html),'reduced-motion audit hook must exercise the same information-preserving no-motion path');

assert(/dataset\.gsHoleTheatreDefault='expanded-v1'/.test(html),'production integrity report must expose the default-expanded contract');
assert(/dataset\.gsHoleTheatre=`expanded:\$\{typeof HS/.test(html)&&/dataset\.gsHoleTheatre='compact'/.test(html),'production integrity report must expose current theatre state');
assert(/GameSharpHoleTheatre=\{open:openHoleTheatre,close:closeHoleTheatre,phase:setTheatrePhase,commit:commitTheatreChoice,isOpen:/.test(html),'theatre must expose one auditable public controller');

console.log(JSON.stringify({ok:true,defaultView:'expanded',authoritativeEntry:'renderHoleNode',subjects:4,mobileTargets:{close:48,camera:44},resume:true,focusTrap:true},null,2));
