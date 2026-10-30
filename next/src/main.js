import './style.css';
import {GolfScene} from './scene.js';
import {SCENARIO,VERSION} from './scenario.js';
import {feedback,summary,bankX} from './model.js';
import {readState,record,commitAttempt,saveCue,saveState} from './state.js';
import {GolfAudio} from './audio.js';

const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
const flagIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V3m0 1c4-4 8 4 13 0v10c-5 4-9-4-13 0"/></svg>';
const targetIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4"/></svg>';
const state=readState(),audio=new GolfAudio(state.sound),media=matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion=media.matches,stage='intro',round=0,choice=null,displayChoice=null,seen=new Set(),scene=null,saveFailed=false,completed=false;
const $=s=>document.querySelector(s);
const label=c=>c==='flag'?'At the flag':'At the middle';
const app=$('#app');
app.innerHTML=`
 <header class="site-header"><a class="brand" href="#" aria-label="GameSharp Golf home"><span class="brand-mark">g<span>↗</span></span><span>GAMESHARP<small>GOLF</small></span></a><span class="header-line">A clearer mind. A smarter next shot.</span><div class="header-tools"><button id="sound" class="icon-button" aria-pressed="${state.sound}"><span class="sound-symbol">♪</span><span id="sound-label">Sound ${state.sound?'on':'off'}</span></button><button id="about" class="icon-button">About the scene <span class="info-symbol">i</span></button></div></header>
 <main><div class="session-header"><span class="eyebrow"><span class="live-dot"></span> THE DECISION SERIES <span class="slash">/</span> 01</span><span class="session-length">Two decisions. One useful habit.</span></div>
 <section class="experience" aria-label="The flag isn’t the target" data-stage="intro">
  <div class="course-wrap"><div id="course" role="img" aria-label="A fictional coastal golf green with water on its right. The first flag is near the water."></div>
   <div class="scene-top"><span class="location"><span class="north">N ↗</span><span>NORTH POINT<small>Original coastal practice hole</small></span></span><button id="view" class="glass-button" aria-pressed="false">${targetIcon}<span>Overhead</span></button></div>
   <div id="target-labels" aria-hidden="true"><span class="target-label" data-target="flag">Flag</span><span class="target-label" data-target="middle">Middle</span></div>
   <div id="scene-caption" class="scene-caption"><span class="eyebrow">YOUR NEXT SHOT STARTS HERE</span><p>Read the hole. <br>Choose your miss.</p></div>
   <div class="scene-bottom"><span id="scene-status">145 m approach <span>·</span> Fairway lie</span><span class="scene-signature">NORTH POINT — 01</span></div>
   <div id="pattern-legend" class="pattern-legend" hidden><span><i class="dot-white"></i>Land</span><span><i class="dot-water">×</i>Water</span><span>12 example finishes</span></div>
  </div>
  <div class="lesson-panel" id="panel"></div>
 </section>
 <div class="below-scene"><p><span class="mini-flag">↗</span> Train the decision. Take it to the course.</p><button id="motion" class="text-button" aria-pressed="${reducedMotion}">Motion ${reducedMotion?'reduced':'on'}</button></div>
 <footer><span>A GameSharp field study</span><span>Playable preview <i>·</i> One complete lesson</span><button id="evidence" class="text-button">Session details</button></footer></main>
 <div class="sr-only" id="announce" aria-live="polite" aria-atomic="true"></div>
 <dialog id="details-dialog"><button class="dialog-close" aria-label="Close details">×</button><div id="dialog-body"></div></dialog>`;

function announce(text){$('#announce').textContent=text;}
function render({focus=false}={}){
 $('.experience').dataset.stage=stage;
 $('#target-labels').hidden=!['decision','compare'].includes(stage);
 $('#scene-caption').hidden=stage!=='intro';
 $('#pattern-legend').hidden=stage!=='compare';
 $('#view').disabled=stage==='flight';
 const panel=$('#panel');
 $('#course').setAttribute('aria-label',round===0?'A fictional coastal green. The flag is near water on the right.':'The same coastal green. The flag is now on the left, away from the water.');
 if(scene){$('#view').setAttribute('aria-pressed',String(scene.overview));$('#view span').textContent=scene.overview?'Perspective':'Overhead';}
 const kicker=`<div class="panel-kicker"><span>${stage==='intro'?'FIELD NOTE 001':stage==='complete'?'TAKE IT WITH YOU':`DECISION 0${round+1} <span class="muted">/ 02</span>`}</span><span class="progress-dots"><i class="${round===0?'current':'done'}"></i><i class="${round===1?'current':''}"></i></span></div>`;
 if(stage==='intro'){
  panel.innerHTML=`${kicker}<div class="intro-copy"><span class="serif-index">01.</span><h1>The flag isn’t <br>the target.</h1><p class="lead">One coastal green. Two pin positions. A better way to choose where you aim.</p></div><div class="intro-bottom"><div class="lesson-promise"><span>${targetIcon}</span><p>See the shot. <br><strong>Understand the decision.</strong></p></div><button class="primary" id="start">Play the approach ${arrow}</button><p class="micro">About 2 minutes <span>·</span> No sign-up</p>${state.cue?'<button class="text-button saved-link" id="saved-cue">View your saved cue ↗</button>':''}</div>`;
  $('#start').onclick=begin;$('#saved-cue')?.addEventListener('click',()=>showDialog('cue'));
 }else if(stage==='decision'){
  const r=SCENARIO.rounds[round];
  panel.innerHTML=`${kicker}<div class="decision-copy"><span class="chapter-label">${round===0?'READ THE RISK':'READ IT AGAIN'}</span><h1>${r.prompt}</h1><p class="lead">${r.situation}</p></div><fieldset class="choices"><legend class="sr-only">Choose your target</legend>${['flag','middle'].map(c=>`<label class="choice ${choice===c?'selected':''}"><input type="radio" name="target" value="${c}" ${choice===c?'checked':''}><span class="choice-icon">${c==='flag'?flagIcon:targetIcon}</span><span><strong>${label(c)}</strong><small>${c==='flag'?'Play toward the pin':'Play toward the centre of the green'}</small></span><span class="radio-mark"></span></label>`).join('')}</fieldset><p class="assumption">${SCENARIO.profile}</p><div class="panel-bottom"><button class="primary" id="commit" ${choice?'':'disabled'}>Commit to your target ${arrow}</button><p class="micro">${scene?'Choose with the buttons or tap a target on the green.':'Choose a target above, then commit.'}</p></div>`;
  panel.querySelectorAll('input[name="target"]').forEach(el=>el.onchange=()=>select(el.value));$('#commit').onclick=commit;
 }else if(stage==='flight'){
  panel.innerHTML=`${kicker}<div class="flight-copy"><span class="chapter-label">TARGET COMMITTED</span><h1>Let it fly.</h1><p class="lead">${label(choice)}. <br>Watch where this shot finishes.</p><div class="flight-track"><span></span></div><p class="micro">One selected shot from the example pattern.</p></div><div class="panel-bottom"><p class="small-quote">“A good result and a good decision aren’t always the same thing.”</p></div>`;
 }else if(stage==='single'){
  panel.innerHTML=`${kicker}<div class="result-copy"><span class="chapter-label">ONE BALL ISN’T THE WHOLE STORY</span><h1>${choice==='flag'?'That one <br>looks good.':'Safely <br>on the green.'}</h1><p class="lead">${choice==='flag'?'This example shot finished close to the flag.':'This example shot finished on the green, away from the water.'} But one finish can’t tell you whether the target was a good choice.</p></div><div class="panel-bottom"><div class="shot-count"><strong>01<span>/12</span></strong><p>Now see the other <br>possible finishes.</p></div><button class="primary" id="reveal">Show the whole pattern ${arrow}</button><p class="micro">Same target. Eleven more example shots.</p></div>`;
  $('#reveal').onclick=()=>{stage='compare';displayChoice=choice;seen=new Set([choice]);scene?.setMode('compare');scene?.showPattern(choice);record(state,'pattern_revealed',{round,choice});render({focus:true});announce('The full example pattern is now visible.');};
 }else if(stage==='compare'){
  const f=feedback(round,displayChoice),s=summary(round,displayChoice),other=choice==='flag'?'middle':'flag';
  panel.innerHTML=`${kicker}<div class="comparison-copy"><span class="chapter-label">${seen.size>1?'SAME SHOTS. DIFFERENT TARGET.':'LOOK AT THE WHOLE PATTERN'}</span><h1 class="result-title">${f.title}</h1><p class="lead small">${f.body}</p></div><div class="compare-control" role="group" aria-label="Compare targets">${['flag','middle'].map(c=>`<button data-compare="${c}" class="${displayChoice===c?'active':''}" aria-pressed="${displayChoice===c}">${label(c)}${choice===c?'<small>Your choice</small>':'<small>Compare</small>'}</button>`).join('')}</div><div class="pattern-stats" aria-live="polite"><div><strong>${12-s.water}<span>/12</span></strong><span>stay on land</span></div><div class="${s.water?'has-water':''}"><strong>${s.water}<span>/12</span></strong><span>in the water</span></div><p>${label(displayChoice)} <br><span>Authored examples, not odds</span></p></div><div class="panel-bottom"><button class="primary" id="continue">${seen.size<2?`Compare ${label(other).toLowerCase()}`:round===0?'Move the flag':'Keep the useful part'} ${arrow}</button><p class="micro">${seen.size<2?'Change only the target. Keep all 12 shots the same.':round===0?'A new pin position. The same shot pattern.':'One cue for your next round.'}</p></div>`;
  panel.querySelectorAll('[data-compare]').forEach(b=>b.onclick=()=>compare(b.dataset.compare));
  $('#continue').onclick=()=>{if(seen.size<2){compare(other);return;}if(round===0){round=1;choice=null;stage='decision';scene?.setRound(1);scene?.setMode('decision');record(state,'transfer_started');render({focus:true});announce('The flag is now on the left half of the green. Choose a target again.');}else finish();};
 }else if(stage==='complete'){
  panel.innerHTML=`${kicker}<div class="complete-copy"><span class="chapter-label">THE HABIT TO KEEP</span><h1>Choose for your <br>whole pattern.</h1><p class="lead">The first flag rewarded room. The second rewarded opportunity. Read what’s changed before you decide.</p><div class="cue-card"><span>YOUR NEXT-ROUND CUE</span><p>Protect the costly miss. <br>Then use the opportunity.</p><span class="cue-footer">GAMESHARP GOLF <i>↗</i></span></div></div><div class="panel-bottom"><button class="primary ${state.cue?'saved':''}" id="save-cue">${state.cue&&!saveFailed?'Cue saved on this browser <span>✓</span>':`Save my course cue ${arrow}`}</button><p class="micro" id="save-status">${saveFailed?'This browser could not save it. You can still copy the cue above.':state.cue?'Come back here before your next round.':'Saved privately on this browser.'}</p><button class="text-button replay" id="replay">Play it again ↗</button></div>`;
  $('#save-cue').onclick=()=>{saveCue(state);saveFailed=!saveState(state);audio.play('success');render();announce(saveFailed?'This browser could not save the cue.':'Your course cue is saved on this browser.');};
  $('#replay').onclick=begin;
 }
 $('#scene-status').innerHTML=stage==='compare'?`${label(displayChoice)} <span>·</span> Same 12 shots`:stage==='complete'?'Your decision practice is complete':round===0?'145 m approach <span>·</span> Fairway lie':'New pin position <span>·</span> Same club';
 updateFallback();
 if(focus){const h=panel.querySelector('h1');h?.setAttribute('tabindex','-1');h?.focus({preventScroll:true});focusScene();}
}
function focusScene(){if(matchMedia('(max-width: 800px)').matches)(stage==='complete'?$('#panel'):$('.course-wrap')).scrollIntoView({block:'start',behavior:'instant'});}
function begin(){round=0;choice=null;completed=false;stage='decision';scene?.setRound(0);scene?.setMode('decision');record(state,'session_started',{practice:state.completions>0});audio.unlock();render({focus:true});announce(SCENARIO.rounds[0].situation);}
function select(c){if(stage!=='decision')return;choice=c;scene?.setChoice(c);render();const input=$(`input[value="${c}"]`);input?.focus({preventScroll:true});announce(`${label(c)} selected.`);}
function commit(){if(stage!=='decision'||!choice)return;commitAttempt(state,round,choice);stage='flight';render();focusScene();audio.play('strike');if(scene)scene.shoot(choice);else landed();}
function landed(){if(stage!=='flight')return;stage='single';audio.play('land');record(state,'shot_seen',{round,choice});render({focus:true});announce('The shot has finished on the green. Inspect the whole pattern next.');}
function compare(c){displayChoice=c;seen.add(c);scene?.setChoice(c);scene?.showPattern(c);record(state,'comparison_viewed',{round,choice:c});render();const b=$(`[data-compare="${c}"]`);b?.focus({preventScroll:true});focusScene();}
function finish(){stage='complete';if(!completed){state.completions++;record(state,'session_completed',{firstAttempts:state.firstAttempts});completed=true;}scene?.setMode('complete');render({focus:true});announce('Lesson complete. Save the cue for your next round.');}
function showDialog(kind='about'){
 const d=$('#details-dialog'),body=$('#dialog-body');
 if(kind==='cue')body.innerHTML=`<span class="eyebrow">YOUR SAVED CUE</span><h2>Protect the costly miss. <br>Then use the opportunity.</h2><p>Before you pick a target, imagine the whole pattern of shots you might hit. Give the costly miss room, then use the opportunity the hole offers.</p><p class="micro">Saved on this browser. Your real pattern may differ from the example.</p>`;
 else if(kind==='evidence')body.innerHTML=`<span class="eyebrow">THIS BROWSER ONLY</span><h2>Practice, with a clear boundary.</h2><p>This preview remembers your first choices, completed sessions and saved cue on this browser. It does not send those events to a server.</p><dl class="session-data"><div><dt>Completed sessions</dt><dd>${state.completions}</dd></div><div><dt>First target · water-side flag</dt><dd>${state.firstAttempts['protected-pin']?label(state.firstAttempts['protected-pin'].choice):'Not played'}</dd></div><div><dt>First target · open flag</dt><dd>${state.firstAttempts['open-pin']?label(state.firstAttempts['open-pin'].choice):'Not played'}</dd></div><div><dt>Course cue</dt><dd>${state.cue?'Saved':'Not saved'}</dd></div></dl><p>Replays are practice. They do not overwrite those first choices. This is a demonstration, not evidence of improved golf or customer demand.</p><button id="export" class="secondary">Download this session’s notes ↓</button>`;
 else body.innerHTML=`<span class="eyebrow">ABOUT THIS FIELD STUDY</span><h2>A small scene. <br>A useful decision.</h2><p>GameSharp Golf is exploring short, visual practice for the decisions you make before a shot. This first lesson asks one question twice, with a changed pin position.</p><h3>What you’re seeing</h3><p>${SCENARIO.modelNote}</p><p>The first animated ball is deliberately one of the good finishes. The full pattern includes that ball. Switching targets translates exactly the same offsets; it does not re-roll your luck.</p><h3>What this doesn’t tell you</h3><p>This scene does not measure your swing, recommend a club or predict your score. It is an early teaching prototype and has not yet been validated with a golf coach or learner study.</p><h3>A fresh build</h3><p>One lesson, one course, one versioned local record. No old scores, question packs or retired prototype routes are included.</p><button id="simple-view" class="secondary">Use the simple overhead view</button><p class="micro">Build ${VERSION}</p>`;
 d.showModal();$('#simple-view')?.addEventListener('click',()=>{scene?.destroy();scene=null;$('#course').dataset.fallback='true';document.documentElement.dataset.renderer='fallback';$('#view').hidden=true;$('#motion').hidden=true;d.close();render();focusScene();});$('#export')?.addEventListener('click',()=>{const blob=new Blob([JSON.stringify({note:'Local prototype session. Not centrally collected or evidence of efficacy.',...state},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='gamesharp-golf-session.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
}
$('.dialog-close').onclick=()=>$('#details-dialog').close();$('#details-dialog').onclick=e=>{if(e.target===$('#details-dialog'))$('#details-dialog').close();};
$('#about').onclick=()=>showDialog();$('#evidence').onclick=()=>showDialog('evidence');
$('#sound').onclick=()=>{audio.enabled=!audio.enabled;state.sound=audio.enabled;saveState(state);audio.unlock();$('#sound').setAttribute('aria-pressed',String(audio.enabled));$('#sound-label').textContent=`Sound ${audio.enabled?'on':'off'}`;if(audio.enabled)audio.play('success');};
$('#motion').onclick=()=>{reducedMotion=!reducedMotion;if(scene)scene.reducedMotion=reducedMotion;$('#motion').textContent=`Motion ${reducedMotion?'reduced':'on'}`;$('#motion').setAttribute('aria-pressed',String(reducedMotion));};
$('#view').onclick=()=>{if(!scene)return;const overhead=scene.toggleView();$('#view').setAttribute('aria-pressed',String(overhead));$('#view span').textContent=overhead?'Perspective':'Overhead';};
$('.brand').onclick=e=>{e.preventDefault();stage='intro';round=0;scene?.setRound(0);scene?.setMode('intro');render({focus:true});};
$('#course').addEventListener('sceneproject',e=>{for(const c of ['flag','middle']){const p=e.detail[c],el=$(`[data-target="${c}"]`);el.style.transform=`translate(${p.x}px,${p.y-26}px) translate(-50%,-100%)`;el.style.opacity=p.visible?'1':'0';el.classList.toggle('chosen',(stage==='compare'?displayChoice:choice)===c);}});

function updateFallback(){
 if(scene)return;
 const host=$('#course');if(!host.dataset.fallback)return;$('#target-labels').hidden=true;$('.location small').textContent='Simple overhead view';
 const pin=SCENARIO.rounds[round].pin,points=stage==='compare'?summary(round,displayChoice).points:[];
 const x=n=>150+n*3.8,z=n=>140+n*3.8;const bank=Array.from({length:57},(_,i)=>{const v=-40+i*2.2;return `${x(bankX(v))},${z(v)}`;}).join(' ');const land=`0,-12 ${bank} 0,457`;
 host.innerHTML=`<svg class="fallback-map" viewBox="0 0 400 400" role="img" aria-label="Overhead map: green on the left, water on the right, flag ${round===0?'near the water':'left of centre'}."><defs><clipPath id="land-clip"><polygon points="${land}"/></clipPath><pattern id="mow" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#94b66c"/><rect width="12" height="24" fill="#9bbe73"/></pattern></defs><rect width="400" height="400" fill="#2d858d"/><polygon points="${land}" fill="#6a864b"/><path d="M80 400Q95 300 120 210L185 210Q160 300 165 400" fill="#86a65b"/><ellipse cx="${x(-3)}" cy="140" rx="${22*3.8}" ry="${25*3.8}" fill="url(#mow)" clip-path="url(#land-clip)"/><circle cx="${x(-3)}" cy="140" r="8" fill="none" stroke="#fff" stroke-width="2"/><path d="M${x(pin.x)} ${z(pin.z)}v-22l16 5-16 7" fill="#e9c46b" stroke="#fff3ce" stroke-width="2"/>${points.map(p=>`<circle cx="${x(p.x)}" cy="${z(p.z)}" r="3.5" fill="${p.lie==='water'?'#f2a583':'#fff6cf'}"/>`).join('')}</svg>`;
}
render();
try{scene=new GolfScene($('#course'),{onSelect:select,onLand:landed,reducedMotion});document.documentElement.dataset.renderer='webgl';}catch(error){console.warn('3D scene unavailable. Using the overhead learning view.',error);$('#course').dataset.fallback='true';document.documentElement.dataset.renderer='fallback';$('#view').hidden=true;$('#target-labels').hidden=true;updateFallback();}
