import {bearing, shapeOf, shotPoint} from './shotmaker-model.js';

/** The lesson and the renderer use the same face/path pair. Never infer a player's numbers. */
export function impactRead(face,path){
 const launch=face*.8+path*.2,shape=shapeOf(face,path),delta=face-path;
 const start=Math.abs(launch)<.05?'Starts on the target line':`Starts ${launch<0?'left':'right'}`;
 const bend=shape==='Straight'?'Very little curve':`Bends ${delta<0?'left':'right'}`;
 const relation=shape==='Straight'?'Face and path point in the same direction.':`The face points ${Math.abs(delta)}° ${delta<0?'left':'right'} of the club’s path.`;
 const faceTarget=face===0?'at the target':`${Math.abs(face)}° ${face<0?'left':'right'} of the target`;
 const pathTarget=path===0?'towards the target':`${Math.abs(path)}° ${path<0?'left':'right'} of the target`;
 return {start,bend,relation,faceTarget,pathTarget,summary:`${start}. ${bend.toLowerCase()}.`,watch:`${start.toUpperCase()} · ${bend.toUpperCase()}`};
}

/** A direction ruler, not magnified geometry. Both rows have exactly the same scale. */
export function directionRuler(face,path,focus='both'){
 const extent=Math.max(8,Math.abs(face),Math.abs(path)),x=n=>50+n/extent*43;
 return `<div class="it-ruler" aria-label="Face and path compared with the target"><div class="it-ruler-axis"><span>LEFT OF TARGET</span><b>0°</b><span>RIGHT OF TARGET</span></div>${[['face','FACE POINTS',face],['path','HEAD MOVES',path]].map(([key,label,value])=>`<div class="it-ruler-row ${key} ${focus!==key&&focus!=='both'?'is-muted':''}"><span>${label}<b>${bearing(value)}</b></span><div class="it-track"><i class="it-zero"></i><i class="it-direction" style="left:${x(value)}%"></i></div></div>`).join('')}<p>Both rows use the same direction scale. The centre line is the target.</p></div>`;
}

export function flightReadout(face,path){
 const points=Array.from({length:41},(_,i)=>shotPoint(face,path,i/40)),extent=Math.max(6,...points.map(p=>Math.abs(p.x))),x=n=>100+n/extent*62;
 // Tee at the bottom, target at the top, matching the course and direction ruler.
 const reversed=points.map((p,i)=>`${i?'L':'M'}${x(p.x).toFixed(2)} ${(27+p.z/160*98).toFixed(2)}`).join(' ');
 const r=impactRead(face,path);
 return `<div class="it-flight"><svg viewBox="0 0 200 150" role="img" aria-label="${r.summary}"><path d="M100 125V22" stroke="#8a9d91" stroke-dasharray="3 5"/><path d="M100 22V9l12 4-12 4" fill="none" stroke="#eee7cd"/><path d="${reversed}" fill="none" stroke="#eee7cd" stroke-width="3"/><circle cx="100" cy="125" r="4" fill="#eee7cd"/><text x="100" y="145" text-anchor="middle" fill="#bdcdbd" font-size="10">LOOKING TOWARDS THE TARGET</text></svg><div><span>FOLLOW THE BALL</span><strong>${r.start}</strong><strong>${r.bend}</strong><small>Illustrative flight · curve exaggerated</small></div></div>`;
}

export function teachingStep(face,path,step){
 const r=impactRead(face,path);
 return [
  {focus:'face',title:'Where does the face point?',text:`Gold highlights the surface that hits the ball. Its arrow points ${r.faceTarget}. The face strongly influences where the ball starts.`,cue:`GOLD = WHERE THE FACE POINTS`,next:'Now follow the club head',view:'angle'},
  {focus:'path',title:'Which way is the head moving?',text:`Teal shows the club head travelling ${r.pathTarget} through contact. This is its movement through the ball, not the direction the shaft leans.`,cue:'TEAL = WHERE THE HEAD MOVES',next:'Connect it to the flight',view:'top'},
  {focus:'both',title:r.bend==='Very little curve'?'Why is there so little curve?':`Why does it bend ${face<path?'left':'right'}?`,text:`${r.relation} ${r.bend==='Very little curve'?'Matching directions remove the curve from this relationship. They can still both point away from the target.':`With a centred strike, that relationship makes this ball bend ${face<path?'left':'right'}. Read the face against the path to understand the bend.`}`,cue:'COMPARE FACE WITH PATH',next:'Back to my shot',view:'top'}
 ][step];
}
