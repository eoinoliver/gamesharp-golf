import './shot-lab.css';
import {ShotLabScene} from './shot-lab-scene.js';
import {LESSON,duration,impactTime,topTime,directionDiagram,readRecord,commitAnswer,saveRecord} from './shot-lab-model.js';

const $=s=>document.querySelector(s),media=matchMedia('(prefers-reduced-motion: reduce)');
let storage;try{storage=localStorage;}catch{/* The lesson also works without storage. */}
const record=readRecord(storage),home=new URL(location.href);home.searchParams.delete('lesson');home.searchParams.delete('renderer');
let index=0,choice=null,answer=null,scene=null,reduced=media.matches,fallback=false,phase='question',shownCase=0,saveFailed=false;
const current=()=>LESSON.cases[index];
document.title='The face. The path. The flight. · GameSharp Golf';
document.querySelector('meta[name="theme-color"]').content='#0c1a13';
$('#app').innerHTML=`
<header class="lab-header"><a class="circle-button" href="${home.href}" aria-label="Back to Six Reads">←</a><a class="lab-brand" href="${home.href}" aria-label="GameSharp Golf home">GAME<span>SHARP</span><small>GOLF</small></a><button class="circle-button" id="about" aria-label="About this motion study">i</button></header>
<main class="lab-shell">
 <div class="lab-context"><div class="lab-meta"><span id="case-label"></span><span id="progress">1 of 2</span></div><h1 id="question" tabindex="-1"></h1><p id="situation"></p></div>
 <section class="lab-viewer" aria-label="Interactive shot illustration">
  <div class="view-tabs" aria-label="Camera views"><button data-view="swing" aria-pressed="true">1 <span>Swing</span></button><button data-view="impact" aria-pressed="false">2 <span>Impact</span></button><button data-view="flight" aria-pressed="false" disabled>3 <span>Flight</span></button></div>
  <div id="shot-stage" role="img" aria-label="A right-handed golfer on a coastal practice range. Use Watch to impact, or choose Impact to inspect the delivery."></div>
  <span class="scene-badge" id="scene-badge">THE SHOT LAB</span>
  <div id="diagram-key" class="diagram-key" hidden><span class="face-key">Face = where it points</span><span class="path-key">Path = where it travels</span></div>
  <div class="transport"><button id="play" aria-label="Watch swing to impact">▶ <span>Watch to impact</span></button><label class="scrubber"><span class="sr-only">Swing position</span><input id="scrub" type="range" min="0" max="${impactTime}" step=".005" value="0" aria-valuetext="Address"></label><span id="phase-label">Address</span></div>
  <div class="checkpoints" aria-label="Swing checkpoints"><button data-time="0">Address</button><button data-time="${topTime}">Top</button><button data-time="${impactTime}">Impact</button></div>
 </section>
 <div class="lab-assumptions"><span>${LESSON.assumptions}</span><button id="motion" aria-pressed="${reduced}">Motion ${reduced?'reduced':'on'}</button></div>
 <section id="decision" class="decision" aria-label="Your prediction"></section>
 <p class="save-notice" id="save-notice" role="status" hidden>Progress stays in this visit because browser storage is unavailable.</p>
 <footer class="lab-footer"><span>Motion study · Coaching review pending</span><button id="sources">Sources &amp; limits</button></footer>
</main>
<div id="announce" class="sr-only" aria-live="polite" aria-atomic="true"></div>
<dialog id="lab-dialog"><button id="close-dialog" class="circle-button" aria-label="Close details">×</button><div id="dialog-content"></div></dialog>`;

function announce(text){$('#announce').textContent=text;}
function persist(){saveFailed=!saveRecord(record,storage);$('#save-notice').hidden=!saveFailed;}
function event(type,data={}){record.events.push({type,...data,at:new Date().toISOString()});record.events=record.events.slice(-200);persist();}
function clock(time){
 $('#scrub').max=answer?duration+1.8:impactTime;
 $('#scrub').value=time;
 const label=time<.13?'Address':Math.abs(time-topTime)<.09?'Top':Math.abs(time-impactTime)<.06?'Impact':time<topTime?'Backswing':time<impactTime?'Downswing':time<duration?'Follow-through':'Ball flight';
 $('#phase-label').textContent=label;$('#scrub').setAttribute('aria-valuetext',label);
}
function transport(){
 const playing=scene?.playing;
 $('#play').disabled=reduced||fallback||phase==='setup'||phase==='complete';
 $('#play').innerHTML=playing?'Ⅱ <span>Pause</span>':`▶ <span>${answer?'Replay the shot':'Watch to impact'}</span>`;
 $('#play').setAttribute('aria-label',playing?'Pause swing':answer?'Replay the shot':'Watch swing to impact');
 $('#scrub').disabled=fallback||phase==='setup'||phase==='complete';
 $('#scrub').max=answer?duration+1.8:impactTime;
 $('#motion').textContent=`Motion ${reduced?'reduced':'on'}`;$('#motion').setAttribute('aria-pressed',String(reduced));
}
function updateView(view){
 if(view==='flight'&&!answer)return;
 scene?.pause();scene?.setView(view);
 for(const button of document.querySelectorAll('[data-view]')){button.setAttribute('aria-pressed',String(button.dataset.view===view));button.disabled=(button.dataset.view==='flight'&&!answer)||phase==='setup'||phase==='complete'||(fallback&&button.dataset.view==='swing');}
 $('#diagram-key').hidden=view!=='impact';
 $('#scene-badge').textContent=fallback?'DIAGRAM VIEW':view==='impact'?'AT IMPACT':view==='flight'?'ILLUSTRATIVE FLIGHT':'THE SHOT LAB';
 const c=LESSON.cases[shownCase];
 $('#shot-stage').setAttribute('aria-label',view==='swing'?'A right-handed golfer. Use the timeline or named checkpoints to inspect the swing.':view==='flight'?`${c.explanation} This is an illustrative trajectory.`:`${c.situation} Gold shows the clubface direction. Blue shows the club path. The dashed line is the target.`);
 if(fallback)$('#shot-stage').innerHTML=directionDiagram(c,{flight:!!answer&&view==='flight'});
 transport();
}
function useDiagram(){
 scene?.destroy();scene=null;fallback=true;$('#shot-stage').classList.add('diagram-stage');
 updateView(answer?'flight':'impact');
 for(const button of document.querySelectorAll('[data-time]'))button.disabled=true;
 announce('Diagram view is active. You can complete both questions without 3D.');
}
function renderQuestion({focus=false}={}){
 const c=current();phase='question';shownCase=index;
 $('#case-label').textContent=c.label;$('#progress').textContent=`${index+1} of 2`;
 $('#question').textContent=c.question;$('#situation').textContent=c.situation;
 $('#decision').innerHTML=`<h2>What’s your prediction?</h2><p class="decision-help">Both start right. Choose what happens next.</p><div class="answer-grid"><button class="answer-card" data-choice="left" aria-pressed="false"><span class="answer-letter">A</span><span>Starts right.<br><strong>Curves left.</strong></span><svg viewBox="0 0 60 64" aria-hidden="true"><path d="M25 58Q54 24 17 7M17 7l5 14M17 7l14 1"/></svg></button><button class="answer-card" data-choice="right" aria-pressed="false"><span class="answer-letter">B</span><span>Starts right.<br><strong>Curves right.</strong></span><svg viewBox="0 0 60 64" aria-hidden="true"><path d="M14 58Q17 28 49 9M49 9l-15 1M49 9l-2 15"/></svg></button></div><button class="lab-primary" id="commit" disabled>Choose A or B to see the shot <span>↗</span></button><p class="quiet-note">${record.first[c.id]?'Practice round. Your first prediction is kept.':'Make a prediction, then see why.'}</p>`;
 document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{
  choice=b.dataset.choice;document.querySelectorAll('[data-choice]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#commit').disabled=false;$('#commit').innerHTML='See the shot <span>↗</span>';
 });
 $('#commit').onclick=submit;
 scene?.setCase(c);scene?.setView('swing');clock(0);updateView(fallback?'impact':'swing');
 for(const b of document.querySelectorAll('[data-time]'))b.disabled=fallback;
 if(focus)$('#question').focus({preventScroll:true});
}
function submit(){
 if(!choice||answer||phase!=='question')return;
 answer=commitAnswer(record,current(),choice);event('prediction_committed',{case:current().id,choice,correct:answer.correct,first:answer.first});scene?.setRevealed(true);
 phase='result';renderResult();
 if(scene&&!reduced){scene.play({full:true});updateViewButtons('swing');transport();}else updateView('flight');
 announce(`${answer.correct?'Correct.':'A different result.'} ${current().explanation}`);
}
function updateViewButtons(view){for(const b of document.querySelectorAll('[data-view]')){b.setAttribute('aria-pressed',String(b.dataset.view===view));b.disabled=(b.dataset.view==='flight'&&!answer)||(fallback&&b.dataset.view==='swing');}$('#diagram-key').hidden=view!=='impact';}
function renderResult(){
 const c=current();
 $('#decision').innerHTML=`<div class="result-heading"><span class="result-mark">${answer.correct?'✓':'↗'}</span><div><span class="lab-meta">${answer.first?'YOUR FIRST PREDICTION':'PRACTICE PREDICTION'}</span><h2>${answer.correct?'You read it.':`It curves ${c.correct}. Here’s why.`}</h2></div></div><p class="result-explanation">${c.explanation}</p><div class="takeaway"><span>THE USEFUL PART</span><p>Start: face against target.<br><strong>Curve: face against path.</strong></p></div><button class="lab-secondary" id="inspect-impact">Look closer at impact <span>⌕</span></button>${index===1?'<div class="compare"><span>Compare the two deliveries</span><div><button data-compare="0" aria-pressed="false">First path · right</button><button data-compare="1" aria-pressed="true">New path · left</button></div><p id="compare-copy">The face stayed the same. The curve changed.</p></div>':''}<button class="lab-primary" id="next">${index===0?'Now change one thing':'Keep the useful part'} <span>→</span></button><p class="quiet-note">${saveFailed?'Prediction kept for this visit.':answer.first?'First prediction saved on this browser.':'Practice recorded separately from your first prediction.'}</p>`;
 $('#inspect-impact').onclick=()=>{updateView('impact');event('impact_inspected',{case:current().id});$('#shot-stage').scrollIntoView({behavior:'instant',block:'center'});};
 $('#next').onclick=index===0?showSetup:complete;
 document.querySelectorAll('[data-compare]').forEach(b=>b.onclick=()=>{
  shownCase=Number(b.dataset.compare);const c=LESSON.cases[shownCase];scene?.setCase(c);scene?.setRevealed(true);updateView('flight');
  $('#case-label').textContent='Compare both deliveries';$('#question').textContent=shownCase===0?'First delivery: a path to the right.':'Second delivery: a path to the left.';
  $('#situation').textContent='The face still points right. Watch how the flight changes with the path.';
  $('.result-heading .lab-meta').textContent='YOUR ANSWER TO QUESTION 2';
  document.querySelectorAll('[data-compare]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  $('#compare-copy').textContent=c.explanation;event('delivery_compared',{case:c.id});
 });
}
function showSetup(){
 scene?.pause();phase='setup';$('#case-label').textContent='Before question 2';$('#progress').textContent='1 → 2';$('#question').textContent='Same face. A new path.';$('#situation').textContent='The next shot uses the same target and face direction. Only the club’s path changes.';
 updateView('impact');
 $('#decision').innerHTML=`<div class="change-card"><span>ONE CHANGE</span><h2>The club will travel left.</h2><p>In question 1, it travelled right.<br>Take a fresh look before you predict the next flight.</p></div><button class="lab-primary" id="start-transfer">Play question 2 <span>→</span></button>`;
 $('#start-transfer').onclick=()=>{index=1;choice=null;answer=null;event('transfer_started');renderQuestion({focus:true});window.scrollTo({top:0,behavior:'instant'});};
 for(const b of document.querySelectorAll('[data-time]'))b.disabled=true;
 $('#question').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});event('change_explained');
}
function complete(){
 scene?.pause();phase='complete';shownCase=index;scene?.setCase(current());scene?.setRevealed(true);updateView('flight');
 $('#case-label').textContent='Take it to the course';$('#progress').textContent='2 of 2';$('#question').textContent='One useful way to see a shot.';$('#situation').textContent='A face pointing right can produce either curve. The path is the missing piece.';
 const correct=Object.values(record.first).filter(a=>a.correct).length;
 $('#decision').innerHTML=`<div class="takeaway completion-cue"><span>YOUR COURSE CUE</span><p>${LESSON.cue}</p></div><p class="first-score">${correct} of 2 first predictions correct. ${record.first[LESSON.cases[1].id]?.correct?'You applied the idea to a new delivery.':'Revisit the changed path and test the idea again.'}</p><button class="lab-primary" id="save-cue">${record.cueSaved?'Cue saved on this browser ✓':'Save this cue'} <span>↗</span></button><div class="completion-links"><button id="restart">Practise both again</button><a href="${home.href}">Explore Six Reads →</a></div><button class="session-export" id="export">Download my practice record</button>`;
 $('#save-cue').onclick=()=>{record.cueSaved=true;event('cue_saved');$('#save-cue').textContent=saveFailed?'Cue kept for this visit ✓':'Cue saved on this browser ✓';};
 $('#restart').onclick=()=>{index=0;choice=null;answer=null;event('lesson_replayed');renderQuestion({focus:true});window.scrollTo({top:0,behavior:'instant'});};
 $('#export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({lesson:LESSON.id,...record},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='gamesharp-shot-lab-practice.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 for(const b of document.querySelectorAll('[data-time]'))b.disabled=true;
 event('lesson_completed');$('#question').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});
}
function details(){
 scene?.pause();$('#dialog-content').innerHTML=`<span class="lab-meta">A MOTION STUDY</span><h2>The body is captured.<br>The delivery is illustrated.</h2><p>This prototype tests whether seeing the swing, impact and flight helps a golfer explain a shot—and apply the idea when the path changes.</p><h3>What you are seeing</h3><p>The body movement comes from <a href="https://mocap.cs.cmu.edu/search.php?subjectnumber=64" target="_blank" rel="noopener">Carnegie Mellon’s motion-capture database, subject 64, take 01</a>, processed with Blender. The character, hand placement and club animation are authored. The source did not capture a club or a complete finger grip.</p><p>The impact directions are deliberately exaggerated. The flight is an illustrative curve, not a measured ball flight or a calibrated simulator. The body reference is shared between examples; the authored club delivery and flight change.</p><h3>Conditions matter</h3><p>This lesson assumes a right-handed iron shot, centre contact and no wind. It does not model off-centre contact, gear effect, turf, lie or individual technique. Coaching review is still pending. This is not an analysis of your swing.</p><h3>Data on this browser</h3><p>Your first predictions, later practice and saved cue stay on this browser. They are separate from Six Reads progress. No account, video upload or server analytics are involved.</p><p class="attribution">The data used in this project was obtained from mocap.cs.cmu.edu. The database was created with funding from NSF EIA-0196217.</p><button class="lab-secondary" id="use-diagram">Use the lightweight diagram view</button>`;
 $('#use-diagram').onclick=()=>{$('#lab-dialog').close();useDiagram();};$('#lab-dialog').showModal();
}
$('#about').onclick=details;$('#sources').onclick=details;$('#close-dialog').onclick=()=>$('#lab-dialog').close();
$('#play').onclick=()=>{if(!scene)return;if(scene.playing)scene.pause();else{scene.play({full:!!answer});updateViewButtons('swing');$('#scene-badge').textContent='THE SHOT LAB';}transport();};
$('#scrub').oninput=e=>{scene?.setView('swing');scene?.seek(Number(e.target.value));updateViewButtons('swing');transport();};
document.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>{const t=Number(b.dataset.time);updateView(t===impactTime?'impact':'swing');scene?.seek(t);clock(t);});
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{updateView(b.dataset.view);event('view_selected',{view:b.dataset.view});});
function setMotion(value){reduced=value;scene?.setReduced(reduced);document.documentElement.dataset.reducedMotion=String(reduced);transport();}
$('#motion').onclick=()=>setMotion(!reduced);media.addEventListener('change',e=>setMotion(e.matches));
renderQuestion();
try{
 if(new URLSearchParams(location.search).get('renderer')==='diagram')useDiagram();
 else{
  scene=new ShotLabScene($('#shot-stage'),{reduced,onTime:clock,onStop:({finished})=>{transport();if(finished&&scene?.time>=impactTime-.001&&!scene.playing&&phase!=='setup'&&phase!=='complete')updateView(answer&&scene.time>=duration?'flight':'impact');},onFailure:()=>useDiagram()});
  scene.setCase(current());
 }
}catch{useDiagram();}
setMotion(reduced);event('lesson_started',{practice:!!record.first[LESSON.cases[0].id],renderer:fallback?'diagram':'3d'});
window.addEventListener('pagehide',()=>scene?.pause());
