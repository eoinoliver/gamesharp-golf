import './lesson-sequence.css';

// Tennis's reading cadence: 5.5 words / second, then the decision.
// One owner per journey: navigation, skip and reduced motion all drain this owner.
export class LessonSequence {
 constructor(){this.timers=new Set();this.restore=[];this.pending=[];this.generation=0;this.active=false;}
 later(fn,ms){const generation=this.generation;const timer=setTimeout(()=>{this.timers.delete(timer);if(generation===this.generation)fn();},ms);this.timers.add(timer);}
 cancel(){
  this.generation++;this.timers.forEach(clearTimeout);this.timers.clear();
  this.restore.splice(0).forEach(fn=>fn());
  this.pending.splice(0).forEach(el=>{el.classList.remove('gs-await');el.inert=false;});
  if(this.skip){this.skip.hidden=true;this.skip.onclick=null;}
  if(this.root)delete this.root.dataset.reading;
  this.active=false;this.onReady=null;
 }
 finish(){const done=this.onReady;this.cancel();if(this.root)this.root.dataset.reading='ready';this.setBeat(2);done?.();}
 setBeat(index){this.rail?.querySelectorAll('[data-beat]').forEach((el,i)=>{el.classList.toggle('active',i===index);el.classList.toggle('done',i<index);if(i===index)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});}
 start({root,text,groups=[],skip,rail,reduced=false,onReady}){
  this.cancel();this.root=root;this.skip=skip;this.rail=rail;this.onReady=onReady;
  if(reduced){this.finish();return;}
  this.active=true;root.dataset.reading='situation';this.setBeat(0);
  const words=[];
  for(const el of [text].flat().filter(Boolean)){
   const original=[...el.childNodes];
   const visual=document.createElement('span');visual.setAttribute('aria-hidden','true');visual.append(...original.map(node=>node.cloneNode(true)));
   const spoken=document.createElement('span');spoken.className='gs-reader-only';spoken.textContent=el.innerText||el.textContent;
   const walker=document.createTreeWalker(visual,NodeFilter.SHOW_TEXT),nodes=[];
   while(walker.nextNode())nodes.push(walker.currentNode);
   for(const node of nodes){const fragment=document.createDocumentFragment();for(const part of node.textContent.split(/(\s+)/)){if(!part)continue;if(/^\s+$/.test(part))fragment.append(document.createTextNode(part));else{const word=document.createElement('span');word.className='gs-word';word.textContent=part;fragment.append(word);words.push(word);}}node.replaceWith(fragment);}
   el.replaceChildren(spoken,visual);this.restore.push(()=>el.replaceChildren(...original));
  }
  this.pending=[...new Set(groups.flat().filter(Boolean))];
  this.pending.forEach(el=>{el.classList.add('gs-await');el.inert=true;});
  if(skip){skip.hidden=false;skip.onclick=()=>{const hadFocus=document.activeElement===skip;this.finish();if(hadFocus){const title=root.querySelector('h1,h2');if(title){title.tabIndex=-1;title.focus({preventScroll:true});}}};}
  this.later(()=>this.setBeat(1),350);
  words.forEach((word,i)=>this.later(()=>word.classList.add('on'),350+i*1000/5.5));
  const readEnd=350+words.length*1000/5.5+150;
  groups.forEach((group,i)=>this.later(()=>{for(const el of [group].flat().filter(Boolean)){el.classList.remove('gs-await');el.inert=false;}if(i===0)root.dataset.reading='question';},readEnd+i*180));
  this.later(()=>this.finish(),readEnd+groups.length*180);
 }
}
