const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const i0 = src.indexOf('const QUESTIONS = [');
let i = src.indexOf('[', i0), depth=0, end=-1, inStr=false, strCh='';
for (let j=i;j<src.length;j++){const c=src[j];
 if(inStr){if(c==='\\'){j++;continue;}if(c===strCh)inStr=false;continue;}
 if(c==='"'||c==="'"){inStr=true;strCh=c;continue;}
 if(c==='[')depth++;else if(c===']'){depth--;if(!depth){end=j;break;}}}
const Q = new Function('return '+src.slice(i,end+1))();

const SYN = {
 'punch-out':'chipout','punchout':'chipout','punch':'chipout','chip-out':'chipout','chipout':'chipout',
 'sideways':'chipout','medicine':'chipout','bailout':'safe','bail':'safe',
 'lay':'layup','lay-up':'layup','layup':'layup','laying':'layup',
 'tree':'trees','trees':'trees','branches':'trees','woods':'trees',
 'three-putt':'threeputt','3-putt':'threeputt','threeputt':'threeputt',
 'lag':'lagputt','lagputt':'lagputt','lag-putt':'lagputt',
 'sand':'bunker','bunkers':'bunker','bunker':'bunker','trap':'bunker',
 'buried':'plugged','plugged':'plugged','fried':'plugged','egg':'plugged',
 'water':'penalty','hazard':'penalty','penalty':'penalty',
 'fairway-wood':'3wood','3-wood':'3wood','3wood':'3wood',
 'putt':'putt','putts':'putt','putting':'putt','putter':'putt',
 'wedge':'wedge','wedges':'wedge',
 'wind':'wind','crosswind':'wind','downwind':'wind','headwind':'wind','breeze':'wind','treetops':'wind',
 'chip':'chip','chipping':'chip','chips':'chip',
 'pitch':'pitch','pitching':'pitch',
 'fade':'fade','fades':'fade','slice':'fade',
 'draw':'draw','hook':'draw',
 'uphill':'slope','downhill':'slope','upslope':'slope','downslope':'slope','slope':'slope',
 'tier':'tier','two-tier':'tier','tiered':'tier','shelf':'tier',
 'ob':'ob','out-of-bounds':'ob','bounds':'ob',
 'green':'green','greens':'green','greenside':'green',
 'drive':'tee','driver':'tee','tee':'tee',
 'bogey':'bogey','bogeys':'bogey','double':'double','doubles':'double',
 'embedded':'plugged','fringe':'fringe',
 'rules':'rules','rule':'rules','relief':'relief','drop':'relief',
 'match':'matchplay','match-play':'matchplay','matchplay':'matchplay',
 'stroke':'strokeplay','stroke-play':'strokeplay',
 'mental':'mental','reset':'mental','routine':'routine','pre-shot':'routine',
 'blind':'blind','ridge':'blind','hill':'blind',
};
const STOP = new Set('a an the and or of to in on for with your you your youre is are it its at from what would do be that this how many much per by if not no out over under short long left right into just have has can cant should whats when most one two your play playing player hole yards yard feet foot ball shot shots'.split(' '));
function norm(w){ w=w.replace(/s$/,''); return SYN[w]||SYN[w+'s']||w; }
function toks(s){
  const out=new Set();
  for (let w of String(s||'').toLowerCase().replace(/[^a-z0-9-]+/g,' ').split(' ')){
    if(!w) continue;
    if(SYN[w]){out.add(SYN[w]);continue;}
    for(const p of w.split('-')){ if(p.length>2&&!STOP.has(p)) out.add(norm(p)); }
  }
  return out;
}
function jac(a,b){ if(!a.size||!b.size) return 0; let n=0; for(const t of a) if(b.has(t)) n++; return n/(a.size+b.size-n); }
function ov(a,b){ if(!a.size||!b.size) return 0; let n=0; for(const t of a) if(b.has(t)) n++; return n/Math.min(a.size,b.size); }

const qs = Q.map(q=>{
  const correct = q['option_'+String(q.correct_answer||'a').toLowerCase()]||'';
  return { id:q.id, module:q.module, q,
    qt: toks(q.question),
    tg: toks(q.tags+' '+q.module),
    ct: toks(correct),
    wt: toks(q.why_right) };
});
const pairs=[];
for(let a=0;a<qs.length;a++)for(let b=a+1;b<qs.length;b++){
  const A=qs[a],B=qs[b];
  const sq=jac(A.qt,B.qt), st=ov(A.tg,B.tg), sc=ov(A.ct,B.ct), sw=jac(A.wt,B.wt);
  const score=0.4*sq+0.25*st+0.25*sc+0.1*sw;
  if(score>=0.34) pairs.push({score,sq,st,sc,sw,A,B});
}
pairs.sort((x,y)=>y.score-x.score);
console.log(pairs.length,'pairs >= 0.34');
for(const p of pairs){
  console.log('---', p.score.toFixed(3), `q=${p.sq.toFixed(2)} t=${p.st.toFixed(2)} c=${p.sc.toFixed(2)} w=${p.sw.toFixed(2)}`);
  for(const X of [p.A,p.B])
    console.log(` ${X.id} [${X.module}] ${X.q.question.slice(0,110)} || CORRECT: ${(X.q['option_'+X.q.correct_answer.toLowerCase()]||'').slice(0,70)}`);
}
