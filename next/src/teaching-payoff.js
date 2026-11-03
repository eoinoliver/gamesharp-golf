export function distanceText(metres){return metres<1?`${Math.round(metres*100)} cm`:`${metres.toFixed(1)} m`;}
export function landingPayoff(q,demo){
 if(!Number.isFinite(demo?.end))return null;
 if(demo.blocked)return {title:'The first bounce is in the sand.',body:'The grass rollout no longer applies. Carry to a playable landing surface first.'};
 const remaining=Math.hypot(demo.end-q.visual.target,demo.side||0);
 if(q.visual.type==='chip')return {title:remaining<.1?'Carry + roll. The finish fits.':`${distanceText(remaining)} left to the hole.`,body:`${distanceText(demo.land)} through the air, then ${distanceText(Math.abs(demo.end-demo.land))} along the ground. ${remaining<.1?'The landing allowed for the roll.':'The first bounce and the finish are different targets.'}`};
 return {title:remaining<.1?'This pace and line meet the hole.':`${distanceText(remaining)} left to the hole.`,body:remaining<.1?'The illustrated roll reaches the cup. A real green still needs its own read.':'Notice the next putt, as well as the side it missed. This is an authored example.'};
}
export function payoffHTML(payoff){return payoff?`<div class="gs-payoff"><strong>${payoff.title}</strong><p>${payoff.body}</p></div>`:'';}
