import {RECOVERED_LESSONS} from './recovered-content.js';
import {decisionVisual} from './course-plan-visual.js';
const images=import.meta.glob('./scene-assets/*.webp',{eager:true,query:'?url',import:'default'});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const invitations={
 'start-and-bend':['Where will this ball go?','Read the start. Then the bend.','THE MOMENT OF CONTACT'],
 'straight-is-not-target':['Straight. But at what?','Find the difference between straight and on target.','ONE STRIKE · TWO DIRECTIONS'],
 'enough-curve':['Your draw is turning too far.','Keep the shape. Change how much.','KEEP THE SHOT YOU LIKE'],
 'landing-not-hole':['Where should the first bounce be?','Watch what happens after it lands.','12 M · CLEAN LIE'],
 'carry-the-trouble':['Can your low shot get there?','The finish looks right. Check the route.','16 M · SAND AHEAD'],
 'surface-changes':['Same landing. Why so long?','Follow the ball to find what changed.','ONE SHOT · TWO SURFACES'],
 'pace-and-line':['Would you hit it firmer?','One small change. A different way to the cup.','6 M · BREAKING RIGHT'],
 'distance-before-perfection':['Make the next putt easier.','One goes in. Look at the other five.','12 M · TWO PACE PLANS'],
 'same-distance-new-slope':['Same distance. Same stroke?','Feel the difference a slope makes.','6 M · A NEW SLOPE'],
 'round-temptation':['Would you take on this flag?','160 m. The coast is close. What do you leave next?','THE HEADLAND · PIN RIGHT'],
 'round-bunker':['Where can you afford to miss?','A tucked flag. A recovery you can avoid.','THE HEADLAND · PIN LEFT'],
 'round-permission':['Is this your moment to attack?','A shorter approach. A different opportunity.','THE HEADLAND · 95 M'],
};
export function sceneImage(id,{label='',priority=false}={}){const lesson=RECOVERED_LESSONS.find(l=>l.id===id);if(lesson)return `<div class="gs-scene-art rc-preview" aria-hidden="true">${decisionVisual(lesson.questions[0])}${label?`<span class="gs-scene-caption">${esc(label)}</span>`:''}</div>`;const src=images[`./scene-assets/${id}.webp`];return `<div class="gs-scene-art">${src?`<img src="${src}" alt="" width="960" height="540" loading="${priority?'eager':'lazy'}" decoding="async" ${priority?'fetchpriority="high"':''}>`:''}${label?`<span class="gs-scene-caption">${esc(label)}</span>`:''}</div>`;}
export function invitation(l){const text=invitations[l.id];return {title:text?.[0]||l.title,line:text?.[1]||l.line,label:text?.[2]||'READ THE HOLE · MAKE YOUR CALL'};}
export function toolCards(){return `<section class="ac-group gs-own"><div class="ac-section-head"><h2>Bring your golf into it.</h2><span>Explore a shot. Keep a discovery.</span></div><div class="ac-tools">${[
 ['memory','?mode=memory','A SHOT STILL ON YOUR MIND','Bring back a shot you wish you could play again.','Choose the flight you remember. Explore what could change it.'],
 ['nine','?mode=shotmaker','YOUR NINE-SHOT CHALLENGE','Read it. Build it. Play it.','Three reads, three experiments, three new situations.'],
 ['impact','?mode=range&face=3&path=6','THE IMPACT STUDIO','What changes the flight?','One club. One ball. Make the relationship visible.'],
 ['daily','?mode=daily','TODAY’S CHALLENGE','One shot to make your own.','Read today’s constraints. Build a flight that fits.'],
 ].map(([id,url,label,title,line])=>`<a href="${url}">${sceneImage(id,{label})}<div class="gs-tool-copy"><b>${title}</b><span>${line}</span><small>Step in <i aria-hidden="true">→</i></small></div></a>`).join('')}</div></section>`;}
