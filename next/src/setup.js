import {COURSE} from './scenario.js';
import {bankX, fairway, targetFor} from './model.js';

// Describe facts that changed, without suggesting a club or aim.
export const SETUPS = {
 distance: {
  title:'New question. Different layout.',
  introduction:'Question 1 is complete. Question 2 uses a separate practice layout and a different example player.',
  labels:['Front bunker','Back bunker'],
  rows:[{label:'Bunker',before:'In front of the green',after:'Behind the green'},{label:'Player',before:'The first carry pattern',after:'A different carry pattern'}],
  unchanged:'The flag, distance and left-side bunker stay the same.'
 },
 shape: {
  title:'New question. Different shot pattern.',
  introduction:'Question 1 is complete. Now read a different player’s pattern and a new flag position.',
  labels:['Leftward pattern','Rightward pattern'],
  rows:[{label:'Shot pattern',before:'Left of the aim line',after:'Right of the aim line'},{label:'Flag',before:'Near the centre',after:'On the left'}],
  unchanged:'The green and water stay the same.'
 },
 landing: {
  title:'New question. Different layout.',
  introduction:'Question 1 is complete. Question 2 uses a separate practice layout with the bunkers in a different landing area.',
  labels:['Bunkers at 160 m','Bunkers at 195 m'],
  rows:[{label:'Bunkers',before:'At the shorter landing area',after:'At the longer landing area'}],
  unchanged:'Both clubs and their shot patterns stay the same.'
 },
 'next-shot': {
  title:'New question. Different route.',
  introduction:'Question 1 is complete. The next practice layout has a different tree position and flag position.',
  labels:['Trees on the left','Trees on the right'],
  rows:[{label:'Tree patch',before:'Left of the centre line',after:'Right of the centre line'},{label:'Flag',before:'Near the centre',after:'On the left'}],
  unchanged:'The club, shot pattern and ground-running rule stay the same.'
 },
 pin: {
  title:'New question. New flag position.',
  introduction:'Question 1 is complete. Only the flag changes for question 2.',
  labels:['Flag on the right','Flag on the left'],
  rows:[{label:'Flag',before:'Near the water on the right',after:'On the open left half'}],
  unchanged:'The green, water, club and shot pattern stay the same.'
 },
 'last-ball': {
  title:'New question. Another last ball.',
  introduction:'Question 1 is complete. Watch another example shot, then judge its starting plan.',
  labels:['Centre-side aim','Flag-side aim'],
  rows:[{label:'Flag',before:'Near the centre',after:'On the right'},{label:'Starting aim',before:'Near the green centre',after:'Near the right-hand flag'},{label:'Shot pattern',before:'Includes a far-right outlier',after:'A different set of finishes'}],
  unchanged:'The green and water stay the same. You will see the new pattern before choosing.'
 }
};

export function layoutMap(c,{label,id}={}){
 const far=c.objective!=='approach',zmin=-43,zmax=far?128:45,scale=far?1.06:1.65;
 const x=v=>88+v*scale,z=v=>18+(v-zmin)*scale;
 const aim=c.review?targetFor(c,c.review):null;
 const aimMark=aim?`<circle cx="${x(aim.x)}" cy="${z(aim.z)}" r="7" fill="none" stroke="#fff5d9" stroke-width="1.5"/><text x="${x(aim.x)-10}" y="${z(aim.z)+18}">AIM</text>`:'';
 const bank=Array.from({length:70},(_,i)=>{const v=zmin+(zmax-zmin)*i/69;return `${x(bankX(v))},${z(v)}`;}).join(' ');
 const land=`0,0 ${x(bankX(zmin))},0 ${bank} ${x(bankX(zmax))},220 0,220`;
 const ellipse=(b,fill,changed=false)=>`<ellipse cx="${x(b.x)}" cy="${z(b.z)}" rx="${b.rx*scale}" ry="${b.rz*scale}" fill="${fill}" ${changed?'stroke="#74562d" stroke-width="1.5"':''}/>`;
 const fs=Array.from({length:40},(_,i)=>17+(zmax-17)*i/39),fw=[...fs.map(v=>`${x(fairway(v).x-fairway(v).width)},${z(v)}`),...fs.toReversed().map(v=>`${x(fairway(v).x+fairway(v).width)},${z(v)}`)].join(' ');
 return `<svg class="setup-map" viewBox="0 0 180 220" role="img" aria-label="${label}. View from above; the ball is below the green and water is on the right."><defs><clipPath id="${id}"><polygon points="${land}"/></clipPath></defs><rect width="180" height="220" fill="#60969a"/><polygon points="${land}" fill="#6f864e"/><g clip-path="url(#${id})"><polygon points="${fw}" fill="#8ca760"/>${ellipse(COURSE.green,'#b1c885')}${ellipse(COURSE.bunker,'#dbc99e')}${c.bunkers.map(b=>ellipse(b,'#f2cf81',true)).join('')}${c.trees.map(t=>ellipse(t,'#385e3b',true)).join('')}</g><path d="M${x(c.pin.x)} ${z(c.pin.z)}v-13l11 3-11 5" fill="#f8df94" stroke="#fff5d9" stroke-width="1.5"/>${aimMark}<text x="9" y="12">BACK</text><text x="9" y="196">FRONT</text><path d="M87 209v-13m-4 5 4-5 4 5" fill="none" stroke="#fff5d9" stroke-width="1.3"/><text x="100" y="211">FROM BALL</text></svg>`;
}
