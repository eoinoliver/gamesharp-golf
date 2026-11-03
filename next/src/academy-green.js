import {distanceText} from './teaching-payoff.js';
import * as T from 'three';
import {demoFor,comparisonChoice} from './academy-visual.js';

/** Authored spatial demonstration. Distances come from the lesson, not a physics forecast. */
export class LearningGreen {
 constructor(host,q,{choice=null,compare=false,reduced=false,onPhase=()=>{},onEvent=()=>{}}={}){
  this.host=host;this.q=q;this.v=q.visual;this.choice=choice;this.reduced=reduced;this.onPhase=onPhase;this.onEvent=onEvent;this.live=true;this.frame=null;this.maps=[];this.labels=[];this.overlay=document.createElement('div');this.overlay.className='ac-spatial-labels';host.append(this.overlay);
  this.renderer=new T.WebGLRenderer({antialias:true,alpha:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));this.renderer.setClearColor('#9fcbd0');this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.domElement.setAttribute('aria-hidden','true');host.prepend(this.renderer.domElement);
  this.scene=new T.Scene();this.scene.fog=new T.Fog('#b8d8cf',35,95);this.camera=new T.PerspectiveCamera(38,1,.1,100);this.scene.add(new T.HemisphereLight('#eff9db','#314634',1.5));const sun=new T.DirectionalLight('#fff1ce',2.5);sun.position.set(-8,16,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-16,right:16,top:30,bottom:-30,near:.1,far:65});sun.shadow.normalBias=.03;sun.target.position.set(0,0,-8);this.scene.add(sun,sun.target);
  const v=this.v,max=v.max||v.target*1.6;
  this.camera.position.set(v.type==='chip'?9:0,Math.max(17,max*.95),v.type==='chip'?12:9);this.camera.lookAt(0,0,-max*.43);
  const mesh=(geo,color,x,y,z)=>{const m=new T.Mesh(geo,new T.MeshStandardMaterial({color,roughness:.9}));m.position.set(x,y,z);m.receiveShadow=true;m.castShadow=true;this.scene.add(m);return m;};
  const surround=mesh(new T.PlaneGeometry(180,180),'#496b3d',0,-.73,-max/2);surround.rotation.x=-Math.PI/2;
  const outline=new T.Shape(),left=-6,right=6,top=max+2,bottom=-2;
  outline.moveTo(-3,bottom);outline.bezierCurveTo(-7,bottom,-6.1,6,-5.8,max*.5);outline.bezierCurveTo(-6.8,max*.8,-5.5,top,-1.5,top);outline.bezierCurveTo(3,top+1,6.7,top-2,5.8,max*.55);outline.bezierCurveTo(5,max*.25,7,bottom,3,bottom);outline.closePath();
  const turf=mesh(new T.ExtrudeGeometry(outline,{depth:.24,bevelEnabled:true,bevelSize:.12,bevelThickness:.06,bevelSegments:3,steps:1}),'#ffffff',0,-.3,0);turf.rotation.x=-Math.PI/2;
  const textureCanvas=document.createElement('canvas');textureCanvas.width=textureCanvas.height=512;const ctx=textureCanvas.getContext('2d'),pixels=ctx.createImageData(512,512);let seed=218;
  for(let i=0;i<pixels.data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=(i/4)%512,y=Math.floor(i/4/512),stripe=Math.floor(y/512*(max+4)/2)%2?1:.93,grain=.94+(seed/4294967296)*.12;pixels.data[i]=94*stripe*grain;pixels.data[i+1]=148*stripe*grain;pixels.data[i+2]=66*stripe*grain;pixels.data[i+3]=255;}
  ctx.putImageData(pixels,0,0);const texture=new T.CanvasTexture(textureCanvas);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(1/12,1/(max+4));texture.offset.set(.5,2/(max+4));turf.material.map=texture;this.maps.push(texture);
  if(v.type==='chip'&&v.edge>0)mesh(new T.PlaneGeometry(11.8,v.edge-(v.hazard?1:0)),v.hazard?'#ecd5a0':'#47733b',0,-.02,-(v.edge+(v.hazard?1:0))/2).rotation.x=-Math.PI/2;
  const line=points=>new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p)));
  const targetLine=new T.Line(line([[0,.025,0],[0,.025,-max]]),new T.LineDashedMaterial({color:'#b8cbb0',dashSize:.35,gapSize:.3,transparent:true,opacity:.5}));targetLine.computeLineDistances();this.scene.add(targetLine);
  mesh(new T.CylinderGeometry(.36,.36,.05,32),'#0a160e',0,.01,-v.target);
  mesh(new T.CylinderGeometry(.025,.025,1.9,12),'#f5e5b9',0,.98,-v.target);
  mesh(new T.PlaneGeometry(.65,.35),'#e6bd66',.33,1.7,-v.target);
  this.label(`HOLE · ${v.target} m`,0,2.3,-v.target);
  this.label('BALL',0,.65,.65);
  if(v.edge>0)this.label(`${v.hazard?'SAND ENDS':'GREEN STARTS'} · ${v.edge} m`,-3,.4,-v.edge);
  this.ball=mesh(new T.SphereGeometry(.18,24,16),'#fffcdf',0,.15,0);
  if(choice!==null){this.demo=demoFor(q,compare?comparisonChoice(q,choice):choice);if(Number.isFinite(this.demo.end)){
   const points=Array.from({length:101},(_,i)=>this.point(i/100));if(v.type==='chip'){this.scene.add(new T.Line(new T.BufferGeometry().setFromPoints(points.slice(0,56)),new T.LineBasicMaterial({color:'#fff9df'})));this.scene.add(new T.Line(new T.BufferGeometry().setFromPoints(points.slice(55)),new T.LineBasicMaterial({color:'#83d8c1'})));const ring=mesh(new T.RingGeometry(.25,.33,36),'#f5ce7c',0,.035,-this.demo.land);ring.rotation.x=-Math.PI/2;}else this.scene.add(new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:compare?'#8adbc5':'#f7d383'})));
   if(v.type==='chip')this.label(this.demo.blocked?'IN THE SAND':`LAND · ${this.demo.land} m`,2.5,.5,-this.demo.land);
   if(this.demo.blocked||Math.abs(this.demo.end-v.target)>.1||Math.abs(this.demo.side||0)>.1)this.label(this.demo.blocked?'ROLL NOT MODELLED':`${distanceText(Math.hypot(this.demo.end-v.target,this.demo.side||0))} LEFT`,(this.demo.side||0)*.7-4,.55,-this.demo.end);
   if(v.reference){const original=this.demo;this.demo=v.reference;const reference=new T.Line(new T.BufferGeometry().setFromPoints(Array.from({length:101},(_,i)=>this.point(i/100))),new T.LineDashedMaterial({color:'#b1bdb4',dashSize:.3,gapSize:.2,transparent:true,opacity:.6}));reference.computeLineDistances();this.scene.add(reference);this.demo=original;}
  }}
  if(v.type==='slope')this.scene.rotation.x=v.grade==='up'?.15:-.15;else if(v.type==='putt')this.scene.rotation.z=-v.slope*.06;
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);this.resize();this.seek(choice===null?0:1);
  this.lost=e=>{e.preventDefault();this.stop();host.dispatchEvent(new CustomEvent('learning-render-failed'));};this.renderer.domElement.addEventListener('webglcontextlost',this.lost);
 }
 point(u){const d=this.demo||{end:0},v=this.v;let x=0,y=.14,z=0;
  if(v.type==='chip'){const land=d.land||0;if(u<.55){const t=u/.55;z=-land*t;y=.14+Math.sin(t*Math.PI)*Math.max(1,land*.28);}else{const t=(u-.55)/.45;z=-(land+(d.end-land)*(1-(1-t)**2));y+=Math.abs(Math.sin(t*Math.PI*3))*Math.max(0,1-t*4)*.24;}}
  else{const t=1-(1-u)**1.7;z=-d.end*t;x=2*(1-t)*t*(d.aim||0)*(d.end/6)*.7+t*t*(d.side||0)*.7;}
  return new T.Vector3(x,y,z);
 }
 label(text,x,y,z){const el=document.createElement('span');el.textContent=text;el.className='ac-spatial-label';this.overlay.append(el);this.labels.push({el,point:new T.Vector3(x,y,z)});}

 resize(){if(!this.live)return;const w=this.host.clientWidth,h=this.host.clientHeight;this.renderer.setSize(w,h);this.camera.aspect=w/Math.max(h,1);this.camera.updateProjectionMatrix();this.render();}
 seek(u){this.u=u;if(this.demo){this.ball.position.copy(this.point(u));const holed=this.v.type!=='chip'&&Math.hypot(this.demo.end-this.v.target,this.demo.side||0)<.1;this.ball.visible=!(holed&&u>=1);if(holed&&u>.96)this.ball.position.y-=(u-.96)/.04*.2;}this.onPhase(this.demo?(u>=1?'FINISH':this.v.type==='chip'?(u<.55?'IN THE AIR':'ROLLING'):'FOLLOW THE ROLL'):'READ THE SITUATION',u);this.render();}
 render(){if(!this.live)return;this.renderer.render(this.scene,this.camera);const w=this.host.clientWidth,h=this.host.clientHeight;for(const {el,point} of this.labels){const p=this.scene.localToWorld(point.clone()).project(this.camera);const x=Math.max(el.offsetWidth/2+5,Math.min(w-el.offsetWidth/2-5,(p.x+1)*w/2)),y=Math.max(12,Math.min(h-20,(1-p.y)*h/2));el.style.left=x+'px';el.style.top=y+'px';}}
 play(){this.stop();if(this.reduced){this.seek(1);return;}this.seek(0);this.onEvent(this.v.type==='chip'?'wedge':'putt');const start=performance.now();let landed=false;const tick=now=>{if(!this.live)return;const u=Math.min(1,(now-start)/2800);this.seek(u);if(!landed&&u>=(this.v.type==='chip'?.55:1)){landed=true;if(this.v.type==='chip')this.onEvent(this.demo?.blocked?'sand':'land');else if(Math.hypot((this.demo?.end||0)-this.v.target,this.demo?.side||0)<.1)this.onEvent('cup');}if(u<1)this.frame=requestAnimationFrame(tick);};this.frame=requestAnimationFrame(tick);}

 stop(){cancelAnimationFrame(this.frame);}
 destroy(){this.live=false;this.stop();this.observer.disconnect();this.renderer.domElement.removeEventListener('webglcontextlost',this.lost);this.scene.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});this.maps.forEach(m=>m.dispose());this.renderer.dispose();this.renderer.domElement.remove();this.overlay.remove();}
}
