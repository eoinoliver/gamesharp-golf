import {impactRead} from './impact-teaching.js';
import {LessonSequence} from './lesson-sequence.js';

const $=s=>document.querySelector(s);
const sentence=node=>node?.innerHTML.replace(/<br\s*\/?\s*>/gi,' ')||'';
export class ShotmakerPresentation {
 constructor({reduced,back,close,teaching}){
  this.teaching=teaching;this.reduced=reduced;this.sequence=new LessonSequence();this.seen=new Set();this.ticket=0;
  this.root=$('#sm-experience');
  this.sound=$('#sm-sound');this.soundHome=this.sound.parentElement;
  const header=document.createElement('nav');header.className='gs-lesson-header';header.hidden=true;header.setAttribute('aria-label','Lesson navigation');
  header.innerHTML='<button id="sm-lesson-back" aria-label="Back to your lessons">←</button><span class="gs-lesson-brand">GAME<span>SHARP</span><small>GOLF</small></span><button id="sm-lesson-close" aria-label="Close lesson">×</button>';
  this.root.before(header);this.header=header;$('#sm-lesson-back').onclick=back;$('#sm-lesson-close').onclick=close;
  this.rail=document.createElement('nav');this.rail.className='gs-lesson-rail';this.rail.setAttribute('aria-label','This shot');$('.sm-world-wrap').after(this.rail);
 }
 reset(stage){this.ticket++;this.sequence.cancel();this.stage=stage;const active=stage!=='intro';document.body.classList.toggle('sm-learning',active);this.header.hidden=!active;this.rail.hidden=!active;for(const button of this.header.querySelectorAll('button'))button.disabled=stage==='flight';if(active)$('.sm-course-head').append(this.sound);else this.soundHome.insertBefore(this.sound,$('#sm-about'));}
 motionChanged(){if(this.reduced())this.sequence.finish();}
 present(key,{focus=true}={}){
  const ticket=++this.ticket;
  queueMicrotask(()=>{if(ticket!==this.ticket||this.stage==='intro')return;this.render(key,focus);});
 }
 render(key,focus){
  const panel=$('#sm-panel'),stage=this.stage,context=$('#sm-mobile-context');
  const head=panel.querySelector('.memory-panel-head')||panel;
  const title=head.querySelector('h1,h2:not(.sm-question)');
  const brief=head.querySelector('.sm-brief')||panel.querySelector('.sm-insight');
  panel.querySelectorAll('[data-gs-context]').forEach(el=>el.removeAttribute('data-gs-context'));
  for(const node of [head!==panel?head:title,brief,panel.querySelector('.sm-panel-top'),panel.querySelector(':scope > .sm-eyebrow')])if(node)node.dataset.gsContext='true';
  let count='';
  if(stage.startsWith('memory-')){const step=$('#sm-memory-steps [aria-current] b')?.textContent;count=step?`${Number(step)} of 4`:'';}
  else count=panel.querySelector('.sm-count')?.textContent.replace(/0(\d)/g,'$1').replace('/', ' of ')||'';
  const pattern=stage==='memory-decision'?panel.querySelector('.memory-observed'):null;
  if(pattern)pattern.dataset.gsContext='true';
  const eyebrow=head.querySelector('.sm-eyebrow')?.textContent||$('#sm-session').textContent;
  context.hidden=false;
  context.innerHTML=`<div class="gs-lesson-meta"><h1 tabindex="-1">${sentence(title)}</h1><span class="gs-count"></span></div><p class="gs-situation">${pattern?sentence(pattern.querySelector('strong'))+' ':''}${sentence(brief)}</p><div class="gs-reading-tools"><span class="sm-eyebrow"></span><button class="gs-show-all" hidden>Show all ↓</button></div>`;
  context.querySelector('.gs-count').textContent=count;context.querySelector('.sm-eyebrow').textContent=eyebrow;
  const decision=['decision','memory-decision','memory-transfer','challenge'].includes(stage),flight=stage==='flight';
  const labels=flight?['YOUR CHOICE','WATCH THE FLIGHT','SEE WHY']:decision?['SEE THE SHOT','READ THE SITUATION','YOUR ANSWER']:stage==='memory-capture'?['YOUR MEMORY','READ THE PROMPT','DESCRIBE THE FLIGHT']:stage==='range'?['SEE THE FLIGHT','READ THE PROMPT','TRY A CHANGE']:stage==='card-brief'?['YOUR NINE','READ THE BRIEF','PLAY THE FINAL THREE']:['complete','memory-complete','scorecard'].includes(stage)?['YOUR SHOTS','KEEP THE INSIGHT','YOUR NEXT STEP']:['SEE THE RESULT','READ THE REASON','TAKE IT FORWARD'];
  this.rail.innerHTML=labels.map((label,i)=>`<span data-beat="${i}"><b>${i+1}</b> ${label}</span>`).join('');
  panel.querySelector('.it-result')?.remove();
  if(['result','challenge-result','memory-reveal','memory-transfer-result'].includes(stage)){
   const shot=this.teaching(),read=impactRead(shot.face,shot.path),card=document.createElement('div');card.className='it-result';card.innerHTML=`<span>WHY THIS FLIGHT · ${shot.label}</span><p>${read.relation}</p><button>Walk through the strike <span>1 → 2 → 3</span></button>`;card.querySelector('button').onclick=shot.open;const insight=panel.querySelector('.sm-insight,.memory-insight');if(insight)insight.after(card);else panel.append(card);
  }
  const visible=[...panel.children].filter(el=>!el.hasAttribute('data-gs-context')&&!el.hidden);
  const question=panel.querySelector('.sm-question'),answers=panel.querySelector('.sm-answers');
  let groups;
  if(question){const q=visible.indexOf(question);groups=[visible.slice(0,q),[question],answers?[answers]:[],visible.slice(q+1).filter(el=>el!==answers)].filter(g=>g.length);}
  else {const primary=visible.findIndex(el=>el.matches('.sm-primary'));groups=primary<0?[visible]:[visible.slice(0,primary),visible.slice(primary)].filter(g=>g.length);}
  this.sequence.start({root:this.root,text:context.querySelector('.gs-situation'),groups,skip:context.querySelector('.gs-show-all'),rail:this.rail,reduced:flight||this.reduced()||this.seen.has(key)});
  this.seen.add(key);if(flight)this.sequence.setBeat(1);
  if(focus){context.querySelector('h1').focus({preventScroll:true});this.header.scrollIntoView({block:'start',behavior:'instant'});}
 }
}
