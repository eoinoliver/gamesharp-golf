import {decisionVisual,isDecisionVisual,isGreenVisual} from './course-plan-visual.js';
import {directionRuler,flightReadout} from './impact-teaching.js';
export function demoFor(q,choice){const d=q.options[choice]?.demo||q.visual.actual||{face:q.visual.face,path:q.visual.path};return q.visual.hazard&&d.land<q.visual.edge?{...d,end:d.land,blocked:true}:d;}
export const comparisonChoice=(q,choice)=>choice===q.correct?(q.correct+1)%q.options.length:q.correct;
const txt=(x,y,s,fill='#d9e5d5',size=12,anchor='middle')=>`<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" text-anchor="${anchor}">${s}</text>`;
export function learningVisual(q,choice=null,{compare=false}={}){
 const v=q.visual,revealed=choice!==null;
 if(isDecisionVisual(q))return decisionVisual(q,compare?comparisonChoice(q,choice):choice);
 if(v.type==='flight'){
  const pair=revealed?demoFor(q,compare?comparisonChoice(q,choice):choice):v;
  return `<div class="ac-impact-visual">${revealed?flightReadout(pair.face,pair.path):'<div class="ac-predict"><span>↗</span><strong>Call the flight.</strong><p>The target is 0°. Gold is the face; teal is the head’s movement.</p></div>'}${directionRuler(pair.face,pair.path)}<p class="ac-model">Centred iron · still air · right-handed example${revealed?' · curve exaggerated':''}</p></div>`;
 }
 if(v.type==='spread')return spreadVisual(v,revealed);
 if(!isGreenVisual(q))return '<p class="rc-fallback">This illustration is unavailable. Read the supplied situation.</p>';
 const max=v.max||v.target*1.6,startY=310,endY=55,y=d=>startY-d/max*(startY-endY),cx=250;
 const d=revealed?demoFor(q,compare?comparisonChoice(q,choice):choice):null;
 const edge=v.edge||0,greenY=y(edge);
 let backdrop=`<rect width="500" height="365" fill="#12392e"/><path d="M85 365Q40 250 125 80Q250 -20 370 80Q465 210 415 365Z" fill="#27573b"/><path d="M115 350Q95 225 150 95Q250 25 350 95Q405 225 385 350Z" fill="#397147"/>`;
 for(let i=0;i<8;i++)backdrop+=`<path d="M100 ${85+i*34}H400" stroke="#79a069" stroke-width="17" opacity=".12"/>`;
 if(v.type==='chip'&&edge>0)backdrop+=`<path d="M80 ${v.hazard?y(1):350}V${greenY}H420V${v.hazard?y(1):350}Z" fill="${v.hazard?'#cfb37a':'#28503a'}"/>${txt(95,greenY+21,v.hazard?'SAND':'FRINGE','#fff0ca',11,'start')}${txt(402,greenY-8,`GREEN · ${edge} m`,'#e0e9c9',11,'end')}`;
 let svg=`${backdrop}<path d="M250 310V42" stroke="#e0e6cd" stroke-dasharray="4 6" opacity=".4"/>`;
 if(v.type==='putt')svg+=txt(250,24,`SLOPE DOWN ${v.slope>0?'RIGHT →':'← LEFT'}`,'#b9e0d0',12);
 if(v.type==='slope')svg+=txt(250,24,`${v.grade==='up'?'UPHILL ↑':'DOWNHILL ↓'} · NO SIDE SLOPE`,'#b9e0d0',12);
 svg+=`<ellipse cx="250" cy="${y(v.target)}" rx="8" ry="4" fill="#07150e"/><path d="M250 ${y(v.target)}v-30l19 6-19 6" stroke="#ead08a" fill="#ead08a"/>${txt(270,y(v.target)+5,`HOLE · ${v.target} m`,'#fff2cf',12,'start')}`;
 const path=(a,color,reference=false)=>{
  if(!Number.isFinite(a?.end))return '';
  const lateral=(a.side||0)*38,ey=y(a.end),land=a.land??0;
  const line=v.type==='chip'?`M250 310 L250 ${y(land)} L250 ${ey}`:`M250 310 Q${250+(a.aim??a.side??0)*(a.end/6)*40} ${y(a.end/2)} ${250+lateral} ${ey}`;
  let out=`<path d="${line}" fill="none" stroke="${color}" stroke-width="${reference?2:4}" ${reference?'stroke-dasharray="5 5"':''} opacity="${reference?.65:1}"/>`;
  if(v.type==='chip'&&!reference)out=`<path d="M250 310L250 ${y(land)}" fill="none" stroke="#fff9df" stroke-width="3" stroke-dasharray="5 4"/><path d="M250 ${y(land)}L250 ${ey}" fill="none" stroke="#83d8c1" stroke-width="4"/>`;
  if(v.type==='chip')out+=`<circle cx="250" cy="${y(land)}" r="6" fill="${color}"/>${!reference?txt(234,y(land)-6,`LAND · ${land} m`,color,12,'end'):''}`;
  out+=`<circle cx="${250+lateral}" cy="${ey}" r="6" fill="${color}"/>`;
  if(!reference)out+=txt(250+lateral-15,ey+21,`FINISH · ${a.end} m`,color,12,'end');
  return out;
 };
 if(revealed&&v.reference)svg+=path(v.reference,'#b8b9b2',true);
 if(d)svg+=path(d,compare?'#80d2c1':'#f4d184');
 svg+=`<circle cx="250" cy="310" r="6" fill="#fffbea"/>${txt(250,338,'BALL · LOOKING TOWARDS THE HOLE','#e9eddf',11)}`;
 return `<svg class="ac-green-map" viewBox="0 0 500 365" role="img" aria-label="${revealed?`${v.type==='chip'?'Landing and finish':'Roll towards the hole'} shown after your choice.`:`Situation before your choice. Hole ${v.target} metres ahead.`}">${svg}</svg><p class="ac-model">${v.type==='chip'?'Overhead plan · authored carry and roll · height not shown':v.type==='slope'?'Illustrative pace comparison · slope labelled, not to scale':'Illustrative roll · sideways break exaggerated'}${revealed&&v.reference?' · dashed line = earlier reference':''}</p>`;
}
function spreadVisual(v,revealed){
 const max=Math.max(...v.sets.flat(),1),x=n=>38+n/(max+1)*370;
 return `<div class="ac-spread"><span>THE SECOND PUTTS THEY LEAVE</span>${v.sets.map((set,i)=>`<div class="ac-set"><strong>PLAN ${'AB'[i]} · SIX FINISHES</strong><svg class="gs-leave-map" viewBox="0 0 460 208" role="img" aria-label="Plan ${'AB'[i]}: ${set.join(', ')} metres left"><defs><linearGradient id="turf-${i}" x2="0" y2="1"><stop stop-color="#5d9751"/><stop offset="1" stop-color="#34663e"/></linearGradient></defs><rect width="460" height="208" rx="12" fill="url(#turf-${i})"/>${set.map((n,j)=>`<path d="M38 ${32+j*27}H420" stroke="#d9efd0" stroke-opacity=".1"/><ellipse cx="38" cy="${32+j*27}" rx="7" ry="4.5" fill="#142b20"/>${n?`<path d="M47 ${32+j*27}H${x(n)-7}" stroke="#e4e3b7" stroke-width="1" stroke-dasharray="3 4"/><circle cx="${x(n)}" cy="${32+j*27}" r="5" fill="#fffbe5" stroke="#ffffff"/>`:''}<text x="${n?x(n)+12:53}" y="${36+j*27}" fill="#fff9da" font-size="12">${n?n+' m':'Holed'}</text>`).join('')}<text x="20" y="198" fill="#e4edca" font-size="10">CUP</text><text x="420" y="198" text-anchor="end" fill="#e4edca" font-size="10">DISTANCE LEFT →</text></svg>${revealed?`<b>${set.reduce((a,b)=>a+b,0)} m total remaining</b>`:''}</div>`).join('')}<p>One row per ball. Same starting distance. Distance strips show length left, not actual directions of misses.</p></div>`;
}
