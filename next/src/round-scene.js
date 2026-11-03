import * as T from 'three';
import {ShotmakerScene,height} from './shotmaker-scene.js';
import {along,distance,lie,sample,outcome} from './round-model.js';
const V=(x,y,z)=>new T.Vector3(x,y,z);
function ground(p){return height(p.x,p.z)+(lie(p)==='bunker'?-.7:0);}
export class RoundScene {
 constructor(host,{reduced=false,onFailure,onProgress,onFinish}={}){
  this.host=host;this.reduced=reduced;this.onProgress=onProgress;this.onFinish=onFinish;this.base=new ShotmakerScene(host,{reduced:true,onFailure});this.base.suspended=true;this.base.updateCamera=()=>{};this.base.targetLine.visible=false;this.base.targetRing.visible=false;this.group=new T.Group();this.base.scene.add(this.group);this.labels=document.createElement('div');this.labels.className='rd-labels';host.append(this.labels);this.resizeObserver=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(this.e&&(w!==this.lastW||h!==this.lastH)){const wasPlaying=!!this.frame;this.configure(this.e,this.q,{choice:this.choice,comparison:this.comparison,pattern:this.pattern,overview:this.overview});if(wasPlaying)this.onFinish?.();}});this.resizeObserver.observe(host);const refresh=()=>{if(!this.base.live)return;if(this.base.dirty&&!document.hidden)this.render();this.refreshFrame=requestAnimationFrame(refresh);};refresh();
 }
 clear(){this.stop();this.group.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose();});this.group.clear();this.points=null;this.trace=null;this.labels.replaceChildren();this.labelItems=[];}
 line(points,color,dashed=false,width=.12){let line;if(dashed){line=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineDashedMaterial({color,dashSize:1.3,gapSize:1,transparent:true,opacity:.75}));line.computeLineDistances();}else line=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),100,width,5,false),new T.MeshBasicMaterial({color,transparent:true,opacity:.9,depthWrite:false}));this.group.add(line);return line;}
 dot(p,color,radius=.65){const m=new T.Mesh(new T.SphereGeometry(radius,16,10),new T.MeshBasicMaterial({color}));m.position.set(p.x,ground(p)+.55,p.z);this.group.add(m);return m;}
 label(p,text,kind=''){const el=document.createElement('span');el.className=`rd-label ${kind} ${text==='LAND'?'landing':''}`;el.textContent=text;this.labels.append(el);this.labelItems.push({el,p:V(p.x,ground(p)+1.5,p.z)});}
 trajectory(o){const land=o.land||o.end;return Array.from({length:101},(_,i)=>{const t=i/100;let p,y;if(o.kind==='putt'){p=along(o.start,o.end,t);y=ground(p)+.25;}else if(o.land){const fly=t<.55,u=fly?t/.55:(t-.55)/.45;p=fly?along(o.start,land,u):along(land,o.end,u);y=ground(p)+.25+(fly?Math.sin(Math.PI*u)*o.height:0);}else{p=along(o.start,o.end,t);y=ground(p)+.25+Math.sin(Math.PI*t)*o.height;}return V(p.x,y,p.z);});}
 configure(e,q,{choice=null,comparison=null,pattern=false,overview=this.overview||false}={}){
  this.clear();this.e=e;this.q=q;this.choice=choice;this.comparison=comparison;this.pattern=pattern;this.overview=overview;const b=this.base;b.flag.parent.position.set(e.pin.x,height(e.pin.x,e.pin.z)+.09,e.pin.z);b.ball.visible=true;b.ballShadow.visible=false;b.ripple.visible=false;b.clearLines();
  const w=this.host.clientWidth;this.lastW=w;this.lastH=this.host.clientHeight;const framePoints=[q.start,e.pin,...q.options.flatMap(o=>o.end?[o.end,...(o.land?[o.land]:[])]:[])],xs=framePoints.map(p=>p.x),zs=framePoints.map(p=>p.z),minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs);let centre=q.kind==='approach'?{x:0,z:0}:{x:(minX+maxX)/2,z:(minZ+maxZ)/2},span=q.kind==='approach'?65:Math.max(q.kind==='putt'?12:28,Math.hypot(maxX-minX,maxZ-minZ)*1.6);
  if(choice!==null&&q.kind==='approach'){centre={x:0,z:0};span=65;}
  const zoom=w<600?1.12:1;
  const camera=this.overview?V(centre.x,8+span*1.6*zoom,centre.z+span*.05):V(centre.x+span*.32,8+span*.85*zoom,centre.z+span*.85);
  b.camera.position.copy(camera);b.camera.lookAt(V(centre.x,8,centre.z));b.camera.aspect=this.host.clientWidth/this.host.clientHeight;b.camera.updateProjectionMatrix();
  this.label(e.pin,choice===null&&q.kind==='approach'?'A · FLAG':'FLAG','flag');this.label({x:-24,z:15},'SAND','sand');
  if(choice===null){b.ball.position.set(q.start.x,ground(q.start)+.3,q.start.z);this.label(q.start,'YOU','you');if(q.kind==='approach')e.options.forEach((o,i)=>{this.dot(o.aim,'#e8c77e',.55);if(i!==0)this.label(o.aim,'ABC'[i],'target');});}
  else{
   this.o=outcome(e,q,choice);this.points=this.trajectory(this.o);this.trace=this.line(this.points,'#f4d485',false,q.kind==='approach'?.19:.055);this.dot(this.o.end,'#f4d485',q.kind==='approach'?.7:.2);this.label(this.o.end,q.kind==='putt'&&distance(this.o.end,e.pin)<.01?'HOLED':'YOUR BALL','you');
   if(this.o.land){this.dot(this.o.land,'#ffdf98',.2);this.label(this.o.land,'LAND','target');const roll=this.points.slice(55);this.line(roll,'#9de4d5',false,.065);}
   if(comparison!==null){const other=outcome(e,q,comparison);this.line(this.trajectory(other),'#95e4d5',true);this.dot(other.end,'#95e4d5',q.kind==='approach'?.8:.24);this.label(other.end,'ALTERNATIVE','other');}
   if(pattern&&q.kind==='approach'){for(const p of sample(e,choice))this.dot(p,lie(p)==='green'?'#fff4c4':'#eeb599',.55);if(comparison!==null)for(const p of sample(e,comparison))this.dot(p,'#96dcd0',.4);}
   if(pattern&&q.kind==='putt'){const mark=(i,color)=>q.options[i].leaves.forEach(leave=>this.dot(along(q.start,e.pin,1+leave/distance(q.start,e.pin)),color,.12));mark(choice,'#f4d485');if(comparison!==null)mark(comparison,'#95e4d5');}
   this.seek(1);
  }
  this.render();
 }
 seek(t){if(!this.points)return;const index=Math.min(100,Math.max(0,Math.floor(t*100)));this.base.ball.position.copy(this.points[index]);this.trace.geometry.setDrawRange(0,index*30);this.render();this.onProgress?.(t);}
 play(){if(!this.points)return;this.stop();if(this.reduced){this.seek(1);this.onFinish?.();return;}const start=performance.now();const tick=()=>{const u=Math.min(1,(performance.now()-start)/(this.q.kind==='approach'?2600:2200));this.seek(u);if(u<1)this.frame=requestAnimationFrame(tick);else{this.frame=null;this.onFinish?.();}};tick();}
 stop(){cancelAnimationFrame(this.frame);this.frame=null;}
 setReduced(value){this.reduced=value;if(value&&this.frame){this.stop();this.seek(1);this.onFinish?.();}}
 toggleView(){this.configure(this.e,this.q,{choice:this.choice,comparison:this.comparison,pattern:this.pattern,overview:!this.overview});return this.overview;}
 render(){if(!this.base?.live||!this.e)return;const b=this.base,w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;b.renderer.setSize(w,h,false);b.camera.aspect=w/h;b.camera.updateProjectionMatrix();b.renderer.render(b.scene,b.camera);b.dirty=false;for(const {el,p} of this.labelItems||[]){const v=p.clone().project(b.camera);el.hidden=v.z>1||v.z<0||Math.abs(v.x)>1||Math.abs(v.y)>1;el.style.left=`${Math.max(30,Math.min(w-40,(v.x*.5+.5)*w))}px`;el.style.top=`${Math.max(20,Math.min(h-25,(-v.y*.5+.5)*h))}px`;}}
 destroy(){this.clear();cancelAnimationFrame(this.refreshFrame);this.resizeObserver.disconnect();this.labels.remove();this.base.destroy();}
}
