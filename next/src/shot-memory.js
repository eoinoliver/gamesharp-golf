import './shot-memory.css';
import {SHOT_MEMORIES} from './scenario.js';
import {bearing, resultFor, shotPoint} from './shotmaker-model.js';
import {REVIEW_DELAY, memoryCase, caseForFlight, cleanNote, choiceOrder, escapeHTML as esc, suggestFlight, scopeIssue, changeFor, flightWords, transferFor, readMemories, saveMemories, beginMemory, recordChange, showSolution, recordTransfer, reviewStatus, forgetMemory, memoryNote} from './shot-memory-model.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
const date=at=>new Date(at).toLocaleDateString('en-GB',{day:'numeric',month:'short'});
const bend=(f,p)=>f===p?'Very little curve':`Curves ${f<p?'left':'right'}`;
const finish=(f,p)=>{const x=resultFor(f,p).x;return Math.abs(x)<4?'Near the flag':`Finishes ${x<0?'left':'right'}`;};
export function flightGlyph(face,path,color='currentColor') {
 // Tee is at the bottom; the flag is at the top, as in the course view.
 const d=Array.from({length:41},(_,i)=>{const p=shotPoint(face,path,i/40);return `${i?'L':'M'}${(70+p.x*1.8).toFixed(2)} ${(18+p.z/160*94).toFixed(2)}`;}).join(' ');
 const end=shotPoint(face,path,1);
 return `<svg viewBox="0 0 140 128" aria-hidden="true"><ellipse cx="70" cy="18" rx="19" ry="9" fill="currentColor" opacity=".055"/><path d="M70 18v94" stroke="currentColor" opacity=".2" stroke-dasharray="3 5"/><path d="M70 18V5l10 4-10 4" fill="none" stroke="currentColor" opacity=".5"/><path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/><circle cx="70" cy="112" r="3" fill="currentColor"/><circle cx="${70+end.x*1.8}" cy="18" r="3" fill="${color}"/></svg>`;
}

export class ShotMemory {
 constructor(api){
  this.api=api;this.state=readMemories(api.storage);this.entry=null;this.active=false;this.pending=null;this.selected=null;this.saved=true;this.view=null;this.review=false;this.scopeAccepted=false;
  $('#sm-memory-start').onclick=()=>this.beginOrResume();$('#sm-memory-example').onclick=()=>this.startExample();$('#sm-book-open').onclick=()=>this.openBook();
  this.syncBook();
 }
 get scene(){return this.api.scene();}
 persist(){this.saved=saveMemories(this.api.storage,this.state);this.syncBook();}
 leave(){this.active=false;this.pending=null;this.entry=null;this.view=null;$('#sm-memory-steps').hidden=true;$('#sm-flight-legend').hidden=true;this.scene?.setChallenge(null);}
 activate(){this.api.leaveJourney();this.active=true;$('#sm-journey').hidden=true;$('#sm-chapters').hidden=true;$('#sm-memory-steps').hidden=false;}
 steps(step){$('#sm-memory-steps').innerHTML=['Remember','Try a change','See why','Make it stick'].map((name,i)=>`<span class="${i===step?'active':i<step?'done':''}" ${i===step?'aria-current="step"':''}><b>${i<step?'✓':String(i+1).padStart(2,'0')}</b>${name}</span>`).join('');}
 layout(stage,title,brief,step,eyebrow='GIVE ME THAT SHOT AGAIN'){
  this.activate();this.api.setStage(`memory-${stage}`);this.steps(step);$('#sm-session').textContent=eyebrow;
  $('#sm-scene-message').hidden=true;$('#sm-goal-tags').hidden=true;$('#sm-flight-legend').hidden=true;$('#sm-pin').hidden=false;
  $('#sm-world-caption').textContent='ILLUSTRATIVE REPLAY · SAME COURSE, SAME CONDITIONS';
  $('#sm-under-copy').textContent='Your remembered flight. One possible strike. A useful discovery.';
  $('#sm-mobile-context').hidden=false;$('#sm-mobile-context').innerHTML=`<span class="sm-eyebrow">${eyebrow}</span><h1>${title}</h1><p>${brief}</p>`;
  $('#sm-impact-open').hidden=!['decision','reveal','complete','transfer-result'].includes(stage);
  return `<div class="memory-panel-head"><span class="sm-eyebrow">${eyebrow}</span><h1>${title}</h1><p class="sm-brief">${brief}</p></div>`;
 }
 ready(message){if(this.scene){$('#sm-overview').setAttribute('aria-pressed',String(this.scene.isOverview));$('#sm-overview span').textContent=this.scene.isOverview?'3D view':'Read the hole';$('#sm-overview').setAttribute('aria-label',this.scene.isOverview?'Switch to 3D course view':'Switch to overhead course view');}this.api.renderFallback();this.api.focusPanel();this.api.announce(message);}
 beginOrResume(){const entry=this.state.entries.find(e=>e.id===this.state.activeId&&e.phase!=='complete');if(entry)this.resume(entry.id);else this.capture();}
 capture(){
  this.entry=null;this.view=null;this.selected=null;this.review=false;this.scopeAccepted=false;
  const d=this.state.draft;
  const head=this.layout('capture','Which shot stays<br>with <em>you?</em>','Think of an iron shot. Tell us where it started and how it curved.',0,'YOUR SHOT · YOUR STARTING POINT');
  this.scene?.prepare(0,0);this.scene?.setMode('hero');
  $('#sm-panel').innerHTML=head+`<label class="memory-label" for="memory-story">What happened? <span>Optional · 280 characters</span></label><textarea id="memory-story" maxlength="280" rows="3" placeholder="My 7 iron started right, then curved farther right…">${esc(d.note)}</textarea><div class="memory-story-tools"><span>Your words stay in this browser.</span><button id="memory-suggest">Use the directions in my words ↗</button></div><p id="memory-suggestion" class="memory-status" aria-live="polite"></p>
   <fieldset class="memory-observation"><legend><b>1</b> Where did it start?</legend><p>Relative to your intended target line.</p><div>${[['left','Left','↖'],['centre','Near the line','↑'],['right','Right','↗']].map(([id,label,icon])=>`<button data-memory-start="${id}" aria-pressed="${d.start===id}"><span>${icon}</span>${label}</button>`).join('')}</div></fieldset>
   <fieldset class="memory-observation"><legend><b>2</b> What happened next?</legend><p>The curve, after the initial start.</p><div>${[['left','Curved left','⤴'],['straight','Stayed straight','↑'],['right','Curved right','⤴']].map(([id,label,icon])=>`<button data-memory-curve="${id}" aria-pressed="${d.curve===id}"><span class="curve-${id}">${icon}</span>${label}</button>`).join('')}</div></fieldset>
   <div id="memory-scope" class="memory-scope" hidden></div><p id="memory-flight-summary" class="memory-status" aria-live="polite">Choose the start and the curve.</p><button id="memory-capture" class="sm-primary sm-wide" disabled>Bring back this flight ${arrow}</button><p class="memory-boundary">We’ll explore a centred iron strike in still air. The flight is an example of your pattern; the impact numbers are not measurements of your swing.</p><button id="memory-use-example" class="sm-link">Not sure? Start with an example <span>↗</span></button>`;
  $('#memory-story').oninput=e=>{d.note=cleanNote(e.target.value);this.scopeAccepted=false;this.persist();this.updateCapture();};
  $$('[data-memory-start]').forEach(b=>b.onclick=()=>{d.start=b.dataset.memoryStart;this.persist();this.updateCapture();});
  $$('[data-memory-curve]').forEach(b=>b.onclick=()=>{d.curve=b.dataset.memoryCurve;this.persist();this.updateCapture();});
  $('#memory-suggest').onclick=()=>{const s=suggestFlight(d.note);if(s.start)d.start=s.start;if(s.curve)d.curve=s.curve;$('#memory-suggestion').textContent=s.start||s.curve?'Suggested from your words. Check both choices below before continuing.':'Choose the two observations below. We could not confidently pick both directions from those words.';this.persist();this.updateCapture();};
  $('#memory-capture').onclick=()=>{const c=caseForFlight(d.start,d.curve);if(!c||$('#memory-capture').disabled)return;this.entry=beginMemory(this.state,{caseId:c.id,note:d.note});this.persist();this.playOriginal();};
  $('#memory-use-example').onclick=()=>this.startExample();this.updateCapture();this.ready('Choose where your iron shot started and how it curved.');
 }
 updateCapture(){
  const d=this.state.draft,c=caseForFlight(d.start,d.curve),issue=scopeIssue(d.note);
  $$('[data-memory-start]').forEach(b=>b.setAttribute('aria-pressed',String(d.start===b.dataset.memoryStart)));
  $$('[data-memory-curve]').forEach(b=>b.setAttribute('aria-pressed',String(d.curve===b.dataset.memoryCurve)));
  const scope=$('#memory-scope');scope.hidden=!issue;
  if(issue==='shot')scope.innerHTML='<strong>This first experience is for iron flights.</strong><p>That shot needs a different contact model. This release can explore an iron example instead.</p><button id="memory-scope-example" class="sm-link">Explore an iron example ↗</button>';
  if(issue==='conditions')scope.innerHTML=`<strong>Those conditions can change the explanation.</strong><p>This model cannot recreate wind or an off-centre strike. You can explore the start-and-curve relationship under calm, centred-strike conditions.</p><label><input id="memory-scope-accept" type="checkbox" ${this.scopeAccepted?'checked':''}> Explore the direction example only</label>`;
  $('#memory-scope-example')?.addEventListener('click',()=>this.startExample());
  $('#memory-scope-accept')?.addEventListener('change',e=>{this.scopeAccepted=e.target.checked;this.updateCapture();});
  $('#memory-capture').disabled=!c||issue==='shot'||issue==='conditions'&&!this.scopeAccepted;
  $('#memory-flight-summary').textContent=c?`${c.observation} Does that match your memory?`:d.start==='centre'&&d.curve==='straight'?'That is a straight, on-line flight. This first experience explores directional misses; choose another memory or an example.':'Choose the start and the curve.';
  if(c){this.view={...c.original,reveal:true};this.scene?.preview(c.original.face,c.original.path);this.scene?.setMode('hero');$('#sm-scene-message').hidden=false;this.api.setSceneMessage(c.observation,'THE FLIGHT YOU REMEMBER');}else{this.view={face:0,path:0,reveal:false};this.scene?.prepare(0,0);this.scene?.setMode('hero');$('#sm-scene-message').hidden=true;}
  this.api.renderFallback();
 }
 startExample(id='right-right'){
  const c=memoryCase(id)||memoryCase('right-right');this.entry=beginMemory(this.state,{caseId:c.id,example:true,note:''});this.activate();this.persist();this.playOriginal();
 }
 playOriginal(){
  const c=memoryCase(this.entry.caseId);this.steps(0);this.pending='original';this.view={...c.original,reveal:true};
  this.api.playShot(c.original.face,c.original.path,true,{eyebrow:'THE FLIGHT YOU REMEMBER',title:'There it goes.<br><em>Now you get another go.</em>',brief:'An illustrative version of this flight. Watch the start, then the bend.'});
 }
 resume(id){
  this.entry=this.state.entries.find(e=>e.id===id);if(!this.entry)return;this.state.activeId=id;this.activate();this.persist();
  if(this.entry.transfer&&this.entry.phase==='transfer-result'){this.review=false;this.prediction=this.entry.transfer;this.transferResult();}else if(this.entry.transfer)this.summary();else if(this.entry.phase==='transfer')this.transfer();else if(this.entry.phase==='reveal')this.reveal();else this.decision();
 }
 decision(){
  const e=this.entry,c=memoryCase(e.caseId);this.selected=null;this.review=false;this.view={...c.original,reveal:true};
  const head=this.layout('decision',c.title,c.brief,1,e.example?'AN EXAMPLE · YOUR DECISION':'YOUR SHOT · ANOTHER CHANCE');
  this.scene?.preview(c.original.face,c.original.path,{overview:true,emphasis:true});$('#sm-flight-legend').hidden=false;$('#sm-flight-legend').innerHTML='<span><i class="gold"></i> AS REMEMBERED</span><span>TEE BELOW · FLAG AHEAD</span>';$('#sm-scene-message').hidden=false;this.api.setSceneMessage(c.observation,'AS REMEMBERED · ILLUSTRATIVE FLIGHT');
  $('#sm-panel').innerHTML=head+`${e.note?`<blockquote class="memory-quote">“${esc(e.note)}”</blockquote>`:''}<div class="memory-observed"><span>THE PATTERN</span><strong>${c.observation}</strong></div><h2 class="sm-question">${c.question}</h2><div class="sm-answers memory-answers" role="group" aria-label="Choose one change">${choiceOrder(e,c.options,'change').map((o,i)=>`<button class="sm-answer" data-memory-choice="${o.id}" aria-pressed="false"><span class="sm-letter">${'ABC'[i]}</span><span><strong>${o.title}</strong><small>${o.detail}</small></span><b class="sm-tick">✓</b></button>`).join('')}</div><p id="memory-selection" class="sm-selection" aria-live="polite">Choose a change. Then see what it does.</p><button id="memory-hit" class="sm-primary sm-wide" disabled>Choose your change ${arrow}</button><button id="memory-explain-terms" class="sm-link">Show me face and path <span>↗</span></button><button id="memory-edit" class="sm-link">${e.first?'Try a different remembered flight':'That isn’t the flight I remember'} <span>↶</span></button>`;
  $$('[data-memory-choice]').forEach(b=>b.onclick=()=>{this.selected=b.dataset.memoryChoice;$$('[data-memory-choice]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});$('#memory-hit').disabled=false;$('#memory-hit').innerHTML=`Give me that shot again ${arrow}`;$('#memory-selection').textContent=c.options.find(o=>o.id===this.selected).detail;});
  $('#memory-hit').onclick=()=>{if(!this.selected||this.pending)return;recordChange(e,this.selected);this.persist();this.playChange();};
  $('#memory-explain-terms').onclick=()=>this.api.openImpact(true);
  $('#memory-edit').onclick=()=>{if(!e.first){this.state.draft={note:e.note,start:c.start,curve:c.curve};forgetMemory(this.state,e.id);this.persist();}this.capture();};
  this.ready(c.question);
 }
 playChange(){const choice=changeFor(this.entry);this.pending='change';this.view={...choice,reveal:false};this.api.playShot(choice.face,choice.path,false,{eyebrow:'YOUR CHANGE · SAME CONDITIONS',title:'One change.<br><em>A different possibility.</em>',brief:'Watch the face and path at contact. Then follow the ball.'});}
 finish(){
  if(!this.pending||!this.active)return false;const next=this.pending;this.pending=null;
  if(next==='original')this.decision();else if(next==='change')this.reveal();else if(next==='transfer')this.transferResult();return true;
 }
 reveal(){
  const e=this.entry,c=memoryCase(e.caseId),choice=changeFor(e),correct=choice.id===c.correct;
  this.progress=1;this.view={...c.original,otherFace:choice.face,otherPath:choice.path,reveal:true,progress:1};
  const head=this.layout('reveal',correct?'There’s the<br><em>difference.</em>':'A different shot.<br><em>But look closer.</em>',choice.feedback,2,correct?'THE USEFUL DISCOVERY':'YOUR CHANGE · THE CONSEQUENCE');
  this.scene?.compareShots(c.original,choice);
  $('#sm-flight-legend').hidden=false;$('#sm-flight-legend').innerHTML='<span><i class="gold"></i> AS REMEMBERED</span><span><i class="teal"></i> THE CHANGE</span>';
  $('#sm-world-caption').textContent='SAME IRON · SAME CONDITIONS · COMPARE THE TWO FLIGHTS';$('#sm-overview').setAttribute('aria-pressed','true');
  $('#sm-panel').innerHTML=head+`<div class="memory-two-flights"><div><span><i class="gold"></i>AS REMEMBERED</span>${flightGlyph(c.original.face,c.original.path,'#edcf87')}<strong>${bend(c.original.face,c.original.path)}</strong><small>${finish(c.original.face,c.original.path)}</small></div><div><span><i class="teal"></i>THE CHANGE</span>${flightGlyph(choice.face,choice.path,'#83c9be')}<strong>${bend(choice.face,choice.path)}</strong><small>${finish(choice.face,choice.path)}</small></div></div><div class="memory-replay-control"><label for="memory-scrub">Follow both flights <output id="memory-moment">THE FINISH</output></label><input id="memory-scrub" type="range" min="0" max="100" value="100" aria-valuetext="The finish"><div><button data-memory-moment="15">The start</button><button data-memory-moment="55">The bend</button><button data-memory-moment="100">The finish</button></div></div>
   <p class="memory-insight">${correct?c.insight:'Compare where they start as well as how they curve. A different flight is not always the change you wanted.'}</p><button id="memory-next" class="sm-primary sm-wide">${correct?'Try it in a fresh situation':'Show one useful change'} ${arrow}</button><div class="memory-inline-actions"><button id="memory-replay">Replay the change ↻</button><button id="memory-impact">Inspect the strike ↗</button></div><button id="memory-retry" class="sm-link">Try another change <span>↶</span></button><details class="memory-details"><summary>The numbers in this example</summary><p>Remembered pattern: face ${bearing(c.original.face)}, path ${bearing(c.original.path)}.<br>Changed example: face ${bearing(choice.face)}, path ${bearing(choice.path)}.</p><p>${SHOT_MEMORIES.modelNote}</p></details>`;
  const seek=value=>{this.progress=value/100;this.view.progress=this.progress;this.scene?.seekPair(this.progress);$('#memory-scrub').value=value;const label=value<28?'THE START':value<90?'THE BEND':'THE FINISH';$('#memory-moment').textContent=label;$('#memory-scrub').setAttribute('aria-valuetext',`${label.toLowerCase()}, ${value}% of the flight`);this.api.renderFallback();};
  $('#memory-scrub').oninput=e=>seek(Number(e.target.value));$$('[data-memory-moment]').forEach(b=>b.onclick=()=>seek(Number(b.dataset.memoryMoment)));
  $('#memory-next').onclick=()=>{if(correct){if(e.transfer)this.summary();else{e.phase='transfer';this.persist();this.transfer();}}else{showSolution(e);this.persist();this.playChange();}};
  $('#memory-replay').onclick=()=>this.playChange();$('#memory-impact').onclick=()=>this.api.openImpact();$('#memory-retry').onclick=()=>this.decision();
  this.ready(choice.feedback);
 }
 transfer(review=false){
  const e=this.entry,q=transferFor(e,review);this.review=review;this.selected=null;this.view={face:q.face,path:q.path,reveal:false};
  const early=review&&Date.now()-e.transfer.at<REVIEW_DELAY;
  const head=this.layout('transfer',review?early?'A little more practice.':'Does the idea<br><em>still stick?</em>':q.title,q.brief,3,review?early?'EARLY RECHECK · PRACTICE':'YOUR LATER CHECK':'A FRESH SITUATION · NO PREVIEW');
  this.scene?.prepare(q.face,q.path);$('#sm-impact-open').hidden=true;
  $('#sm-panel').innerHTML=head+`<div class="memory-facts"><div><span>FACE DIRECTION</span><strong>${bearing(q.face)}</strong></div><div><span>CLUB PATH</span><strong>${bearing(q.path)}</strong></div></div><h2 class="sm-question">Call the flight before you see it.</h2><div class="sm-answers memory-answers" role="group" aria-label="Predict the flight">${choiceOrder(e,q.options,review?'review':'transfer').map((o,i)=>`<button class="sm-answer" data-memory-prediction="${o.id}" aria-pressed="false"><span class="sm-letter">${'ABC'[i]}</span><span><strong>${o.title}</strong><small>${o.detail}</small></span><b class="sm-tick">✓</b></button>`).join('')}</div><p class="sm-selection">${early?'This is practice. Your later check opens 24 hours after the first experience.':'Your first prediction stays saved, even if you practise again.'}</p><button id="memory-predict" class="sm-primary sm-wide" disabled>Choose your prediction ${arrow}</button><button id="memory-transfer-exit" class="sm-link">Save my place in the Shotbook <span>↗</span></button>`;
  $$('[data-memory-prediction]').forEach(b=>b.onclick=()=>{this.selected=b.dataset.memoryPrediction;$$('[data-memory-prediction]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});$('#memory-predict').disabled=false;$('#memory-predict').innerHTML=`See if I read it ${arrow}`;});
  $('#memory-predict').onclick=()=>{if(!this.selected||this.pending)return;this.prediction=recordTransfer(e,this.selected,{review});this.persist();this.pending='transfer';this.api.playShot(q.face,q.path,false,{eyebrow:'YOUR PREDICTION IS IN',title:'You called it.<br><em>Now watch.</em>',brief:'Follow the start and the bend. The first prediction is already on your record.'});};
  $('#memory-transfer-exit').onclick=()=>this.openBook();this.ready(q.brief);
 }
 transferResult(){
  const e=this.entry,q=transferFor(e,this.review),attempt=this.prediction??(this.review?e.reviews.at(-1):e.transfer),correct=attempt.choice===q.correct;
  this.view={face:q.face,path:q.path,reveal:true};
  const head=this.layout('transfer-result',correct?'You read<br><em>a different shot.</em>':'Here’s the part<br><em>to keep.</em>',q.insight,3,correct?'PREDICTION MATCHED THE FLIGHT':'A USEFUL CHECK');
  this.scene?.preview(q.face,q.path,{overview:true,emphasis:true});
  $('#sm-panel').innerHTML=head+`<div class="memory-check-flight">${flightGlyph(q.face,q.path,'#83c9be')}<div><span>THE FLIGHT</span><strong>${flightWords(q.face,q.path)}</strong></div></div><div class="memory-call"><span>YOUR PREDICTION</span><p>${q.options.find(o=>o.id===attempt.choice).title}</p></div><p class="memory-insight">${correct?'You applied the relationship to different directions. That is what this check records.':'This is why the fresh situation matters. Keep comparing the face with the path, then separately with the target.'}</p><button id="memory-keep" class="sm-primary sm-wide">Open my Shotbook card ${arrow}</button><button id="memory-check-impact" class="sm-link">Look inside this strike <span>↗</span></button><p class="memory-boundary">Understanding an example is a step towards better questions and practice. It does not measure your actual swing or playing ability.</p>`;
  $('#memory-keep').onclick=()=>this.summary();$('#memory-check-impact').onclick=()=>this.api.openImpact();this.ready(correct?'Your prediction matched the new flight.':q.insight);
 }
 summary(){
  if(this.entry.phase!=='complete'){this.entry.phase='complete';this.persist();}
  const e=this.entry,c=memoryCase(e.caseId),solution=c.options.find(o=>o.id===c.correct),q=transferFor(e),first=c.options.find(o=>o.id===e.first?.choice),review=reviewStatus(e);
  this.view={...c.original,otherFace:solution.face,otherPath:solution.path,reveal:true,progress:1};
  const head=this.layout('complete','A shot worth<br><em>understanding.</em>',c.takeaway,3,'YOUR SHOTBOOK · KEEP THE DISCOVERY');
  this.scene?.compareShots(c.original,solution);$('#sm-flight-legend').hidden=false;$('#sm-flight-legend').innerHTML='<span><i class="gold"></i> AS REMEMBERED</span><span><i class="teal"></i> ONE USEFUL CHANGE</span>';
  $('#sm-panel').innerHTML=head+`<div class="memory-keepsake"><span>${e.example?'AN EXAMPLE YOU EXPLORED':'YOUR REMEMBERED SHOT'} <b>${date(e.createdAt)}</b></span>${e.note?`<blockquote>“${esc(e.note)}”</blockquote>`:`<strong>${c.observation}</strong>`}<div class="memory-record-row"><span>${e.first?.choice===c.correct?'✓':'↗'}</span><p>First change<small>${first?.title??'Not played'}</small></p></div><div class="memory-record-row"><span>${e.transfer?.choice===q.correct?'✓':'↗'}</span><p>Fresh situation<small>${e.transfer?.choice===q.correct?'Your first prediction matched.':'Your first prediction differed. The explanation is here to revisit.'}</small></p></div>${review.first?`<div class="memory-record-row"><span>${review.first.choice===transferFor(e,true).correct?'✓':'↗'}</span><p>Later check<small>First later prediction ${review.first.choice===transferFor(e,true).correct?'matched':'differed'} · ${date(review.first.at)}</small></p></div>`:''}</div>
   <div class="memory-range-note"><span class="sm-eyebrow">TAKE ONE THING TO THE RANGE</span><p>${c.practice}</p><button id="memory-range-note-open">Add a note after practice ↗</button><div id="memory-range-note-form" ${e.rangeNote?'':'hidden'}><label for="memory-range-note">What did you notice?</label><textarea id="memory-range-note" maxlength="280" rows="3" placeholder="Five shots: three started right and stayed right…">${esc(e.rangeNote)}</textarea><button id="memory-range-note-save" class="sm-secondary">Save my observation</button><span id="memory-range-saved" class="memory-status" aria-live="polite"></span></div></div>
   <button id="memory-another" class="sm-primary sm-wide">Bring back another shot ${arrow}</button><button id="memory-review" class="sm-link">${review.due?'Your later check is ready':review.checked?'Revisit the later check':'Recheck the idea'} <span>↗</span></button><p class="memory-boundary">${review.due?'A fresh read without replaying the explanation first.':review.checked?'Your first later check stays separate from subsequent practice.':'Come back after 24 hours for a later check. Rechecking sooner stays in practice.'}</p><div class="memory-inline-actions"><button id="memory-download">Keep my field note ↓</button><button id="memory-share">Share the challenge ↗</button></div><p id="memory-share-status" class="memory-status" aria-live="polite"></p><button id="memory-revisit" class="sm-link">Revisit the two flights <span>⇄</span></button><p id="memory-save-status" class="memory-boundary">${this.saved?'Saved in this browser. Your words are not included in a shared challenge.':'This browser could not save your Shotbook. Download the field note to keep it.'}</p>`;
  $('#memory-range-note-open').onclick=()=>{$('#memory-range-note-form').hidden=false;$('#memory-range-note').focus();};
  $('#memory-range-note-save').onclick=()=>{e.rangeNote=cleanNote($('#memory-range-note').value);this.persist();$('#memory-range-saved').textContent=this.saved?'Your observation is saved here.':'Could not save in this browser. Download your field note instead.';};
  $('#memory-another').onclick=()=>{this.state.draft={note:'',start:null,curve:null};this.persist();this.capture();};
  $('#memory-review').onclick=()=>this.transfer(true);$('#memory-download').onclick=()=>this.download(e);$('#memory-share').onclick=()=>this.share(e);
  $('#memory-revisit').onclick=()=>{showSolution(e);if(e.transfer)e.phase='complete';this.persist();this.reveal();};
  this.syncBook();this.ready('Your discovery is in the Shotbook. Take the observation exercise to the range, or return for a later check.');
 }
 syncBook(){
  const entries=[...this.state.entries].reverse(),unfinished=entries.find(e=>e.phase!=='complete'&&e.id===this.state.activeId),due=entries.filter(e=>reviewStatus(e).due);
  $('#sm-memory-start').innerHTML=`${unfinished?'Continue your remembered shot':'Bring back a shot'} ${arrow}`;
  $('#sm-book-open').innerHTML=`Shotbook${entries.length?` <span>${entries.length}</span>`:''}`;
  $('#sm-shotbook').innerHTML=`<div class="memory-book-heading"><div><span class="sm-eyebrow">YOUR PERSONAL SHOTBOOK</span><h2>Keep the <em>discovery.</em></h2></div><p>${entries.length?`${entries.filter(e=>e.phase==='complete').length} ${entries.filter(e=>e.phase==='complete').length===1?'experience':'experiences'} completed here.${due.length?` ${due.length} ready for a later check.`:''}`:'A place for the shots you remember—and the ideas you want to keep.'}</p></div>${entries.length?`<div class="memory-book-grid">${entries.map(e=>{const c=memoryCase(e.caseId),r=reviewStatus(e);return `<article class="memory-book-card"><button data-memory-resume="${esc(e.id)}"><div class="memory-book-card-top"><span>${date(e.createdAt)} · ${e.example?'EXAMPLE':'YOUR SHOT'}</span><b>${e.phase!=='complete'?'CONTINUE':r.due?'CHECK READY':r.checked?'REVISITED':'SAVED'}</b></div><div class="memory-book-card-main">${flightGlyph(c.original.face,c.original.path)}<div><h3>${c.observation}</h3><p>${esc(e.note||c.takeaway)}</p></div></div><span class="memory-book-action">${e.phase!=='complete'?'Pick up where you left off':r.due?'Open your card and later check':'Open the discovery'} ${arrow}</span></button><button class="memory-remove" data-memory-remove="${esc(e.id)}" aria-label="Remove shot from ${date(e.createdAt)}">Remove</button></article>`;}).join('')}</div>`:`<div class="memory-example-grid">${[['right-right','The one that kept going','It started right. Then drifted farther away.'],['right-straight','The straight miss','It never curved. It still missed the target.'],['right-left','The one that came back too far','You wanted a draw. You got too much.']].map(([id,title,detail])=>{const c=memoryCase(id);return `<button data-memory-example="${id}">${flightGlyph(c.original.face,c.original.path)}<span><small>TRY AN EXAMPLE</small><strong>${title}</strong><p>${detail}</p></span>${arrow}</button>`;}).join('')}</div>`}<p class="memory-book-foot">${this.saved?'Saved only in this browser. Up to 24 shots; oldest entries leave the book when it fills.':'Storage is unavailable. Play can continue; download a field note to keep your discovery.'} First decisions stay separate from practice.</p>`;
  $$('[data-memory-example]').forEach(b=>b.onclick=()=>this.startExample(b.dataset.memoryExample));
  $$('[data-memory-resume]').forEach(b=>b.onclick=()=>this.resume(b.dataset.memoryResume));
  $$('[data-memory-remove]').forEach(b=>b.onclick=()=>{const id=b.dataset.memoryRemove;b.classList.add('confirm');b.textContent='Remove this shot? Tap again';b.onclick=()=>{const current=this.entry?.id===id;forgetMemory(this.state,id);this.persist();if(current)this.openBook();};});
 }
 openBook(){this.leave();this.api.showHome();this.syncBook();$('#sm-shotbook').hidden=false;$('#sm-shotbook').scrollIntoView({behavior:this.api.reduced()?'instant':'smooth',block:'start'});const h=$('#sm-shotbook h2');h.tabIndex=-1;h.focus({preventScroll:true});}
 download(entry){const url=URL.createObjectURL(new Blob([memoryNote(entry)],{type:'text/plain'})),a=document.createElement('a');a.href=url;a.download='GameSharp-My-Shot-Field-Note.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#memory-download').textContent='Field note downloaded ↓';}
 async share(entry){
  const url=new URL(this.api.shareURL());url.searchParams.set('mode','memory');url.searchParams.set('shot',entry.caseId);
  const text=`GameSharp Golf · Give me that shot again\n${memoryCase(entry.caseId).observation}\nWhat would you change?\n${url.href}`;
  try{await navigator.clipboard.writeText(text);$('#memory-share-status').textContent='Challenge copied. Your personal words and results stay private.';}catch{const area=document.createElement('textarea');area.value=text;area.readOnly=true;area.setAttribute('aria-label','Challenge link to copy');$('#memory-share-status').replaceChildren(area);area.select();}
 }
 get impactShot(){return this.view?.otherFace!==undefined?{face:this.view.otherFace,path:this.view.otherPath}:this.view;}
}
