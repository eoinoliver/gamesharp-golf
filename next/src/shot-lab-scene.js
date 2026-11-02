import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {Golfer,authoredClubRotation} from './motion/golfer.js';
import {createClub,BALL_CONTACT_LOCAL} from './motion/club.js';
import {MOTION,duration,impactTime,flightPoint} from './shot-lab-model.js';
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),Y=V(0,1,0);
const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.65,...extra});
function line(points,color,{dashed=false,opacity=1}={}){
 const material=dashed?new T.LineDashedMaterial({color,dashSize:.09,gapSize:.075,transparent:true,opacity}):new T.LineBasicMaterial({color,transparent:true,opacity});
 const l=new T.Line(new T.BufferGeometry().setFromPoints(points),material);if(dashed)l.computeLineDistances();return l;
}
function label(text,color='#f5eed8'){
 const c=document.createElement('canvas');c.width=256;c.height=64;const ctx=c.getContext('2d');ctx.font='600 32px system-ui';ctx.fillStyle='rgba(13,31,24,.9)';ctx.beginPath();ctx.roundRect(2,3,252,58,10);ctx.fill();ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(text,128,33);
 const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,depthTest:false}));sprite.scale.set(.7,.175,1);sprite.renderOrder=20;return sprite;
}
export class ShotLabScene{
 constructor(host,{onTime,onStop,onFailure,reduced=false,asset}={}){
  this.host=host;this.onTime=onTime;this.onStop=onStop;this.onFailure=onFailure;this.reduced=reduced;this.time=0;this.playing=false;this.view='swing';this.detail='player';this.revealed=false;this.speed=.6;this.alive=true;
  this.scene=new T.Scene();this.scene.background=new T.Color('#91a7a0');this.scene.fog=new T.Fog('#91a7a0',14,53);
  this.camera=new T.PerspectiveCamera(36,1,.02,150);
  this.renderer=new T.WebGLRenderer({antialias:true,alpha:false});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));this.renderer.setClearColor('#91a7a0');this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.95;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;
  const studio=new RoomEnvironment();const pmrem=new T.PMREMGenerator(this.renderer);this.environment=pmrem.fromScene(studio,.06);this.scene.environment=this.environment.texture;this.scene.environmentIntensity=.22;studio.dispose();pmrem.dispose();
  this.renderer.domElement.setAttribute('aria-hidden','true');host.append(this.renderer.domElement);
  this.contextLost=e=>{e.preventDefault();this.pause();this.onFailure?.();};this.renderer.domElement.addEventListener('webglcontextlost',this.contextLost);
  this.scene.add(new T.HemisphereLight('#f4f1d9','#274436',1.1));const sun=new T.DirectionalLight('#fff4dd',2);sun.position.set(-4,8,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-4,right:5,top:5,bottom:-5,near:.1,far:30});sun.shadow.normalBias=.015;this.scene.add(sun);
  const ground=new T.Mesh(new T.PlaneGeometry(140,16),mat('#536b49'));ground.rotation.x=-Math.PI/2;ground.position.set(20,-.012,3);ground.receiveShadow=true;this.scene.add(ground);
  const strip=new T.Mesh(new T.PlaneGeometry(45,6),mat('#648354'));strip.rotation.x=-Math.PI/2;strip.position.set(19,-.008,0);strip.receiveShadow=true;this.scene.add(strip);
  for(let i=0;i<9;i++){const band=new T.Mesh(new T.PlaneGeometry(2.5,6),mat('#6d8b5b'));band.rotation.x=-Math.PI/2;band.position.set(i*5+.5,-.006,0);band.receiveShadow=true;this.scene.add(band);}
  const sea=new T.Mesh(new T.PlaneGeometry(140,110),mat('#3f7378',{roughness:.33}));sea.rotation.x=-Math.PI/2;sea.position.set(14,-.3,-30);this.scene.add(sea);
  const rockGeo=new T.IcosahedronGeometry(1,1),rockMat=mat('#6c7767');
  for(let i=0;i<18;i++){const rock=new T.Mesh(rockGeo,rockMat);rock.position.set(i*2-6,-.11,-5.05);rock.scale.set(.8+(i%3)*.2,.16+(i%4)*.035,.37+(i%2)*.15);rock.rotation.y=i*2.4;this.scene.add(rock);}
  // The sea remains behind this fixed practice strip; cameras change, geometry does not.
  this.golfer=new Golfer(asset);this.scene.add(this.golfer.group);this.golfer.pose(MOTION.impact);this.ballOrigin=this.golfer.grip.clone().addScaledVector(this.golfer.direction,1);this.ballOrigin.y=.027;this.ballOrigin.z+=.04;
  this.club=createClub();this.scene.add(this.club);
  const dimpleCanvas=document.createElement('canvas');dimpleCanvas.width=512;dimpleCanvas.height=256;const dc=dimpleCanvas.getContext('2d');dc.fillStyle='#b8b8b8';dc.fillRect(0,0,512,256);
  for(let row=0;row<18;row++){const y=(row+.5)*256/18,count=Math.max(5,Math.round(36*Math.sin((row+.5)*Math.PI/18)));for(let col=0;col<count;col++){const x=(col+(row%2)*.5)*512/count,g=dc.createRadialGradient(x,y,1,x,y,5.5);g.addColorStop(0,'#565656');g.addColorStop(.6,'#777777');g.addColorStop(1,'#b8b8b8');dc.fillStyle=g;dc.beginPath();dc.ellipse(x,y,5.5,5.5,0,0,Math.PI*2);dc.fill();}}
  const dimples=new T.CanvasTexture(dimpleCanvas);this.ball=new T.Mesh(new T.SphereGeometry(.027,48,32),mat('#fffdf1',{roughness:.48,bumpMap:dimples,bumpScale:.00065}));this.ball.castShadow=true;this.scene.add(this.ball);
  this.landing=new T.Mesh(new T.RingGeometry(.18,.23,32),new T.MeshBasicMaterial({color:'#fff0bf',side:T.DoubleSide}));this.landing.rotation.x=-Math.PI/2;this.scene.add(this.landing);
  this.reference=new T.Group();this.scene.add(this.reference);this.reference.add(line([this.ballOrigin.clone().add(V(-2,0,0)),this.ballOrigin.clone().add(V(30,0,0))],'#d3d5b5',{dashed:true,opacity:.7}));
  this.flag=new T.Group();const pole=new T.Mesh(new T.CylinderGeometry(.014,.014,1.9,8),mat('#e9ecd8'));pole.position.y=.95;this.flag.add(pole);const flag=new T.Mesh(new T.PlaneGeometry(.46,.28),mat('#d3b779',{side:T.DoubleSide}));flag.rotation.y=Math.PI/2;flag.position.set(0,1.68,.23);this.flag.add(flag);this.flag.position.copy(this.ballOrigin).add(V(24,-.027,0));this.scene.add(this.flag);
  this.evidence=new T.Group();this.scene.add(this.evidence);this.trail=new T.Group();this.scene.add(this.trail);
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);
  this.visibility=()=>{if(document.hidden)this.pause();};document.addEventListener('visibilitychange',this.visibility);
  this.resize();this.previous=performance.now();this.frame=requestAnimationFrame(t=>this.tick(t));
 }
 clear(group){for(const object of [...group.children]){group.remove(object);object.traverse(o=>{o.geometry?.dispose();if(o.material){const materials=Array.isArray(o.material)?o.material:[o.material];for(const m of materials){m.map?.dispose();m.bumpMap?.dispose();m.dispose();}}});}}
 setCase(c){this.c=c;this.revealed=false;this.time=0;this.pause();this.clear(this.evidence);this.clear(this.trail);const at=this.ballOrigin.clone();at.y=.035;
  const arrow=(angle,color,length)=>{const d=V(Math.cos(angle*Math.PI/180),0,Math.sin(angle*Math.PI/180));const a=new T.ArrowHelper(d,at.clone(),length,color,.13,.07);this.evidence.add(a);return d;};
  const f=arrow(c.face,'#edc879',1.55),p=arrow(c.path,'#91d6d9',2.0);
  const fl=label('FACE','#edc879');fl.position.copy(at).addScaledVector(f,1.45).add(V(0,.14,-.12));this.evidence.add(fl);
  const pl=label('PATH','#91d6d9');pl.position.copy(at).addScaledVector(p,2.25).add(V(0,.12,.13));this.evidence.add(pl);
  const tl=label('TARGET','#dbe0cb');tl.position.copy(at).add(V(2.72,.08,-.4));this.evidence.add(tl);
  this.flightLine=line(Array.from({length:91},(_,i)=>{const q=flightPoint(c,i/90);return this.ballOrigin.clone().add(V(q.x,q.y-.027,q.z));}),'#fff0bf');this.trail.add(this.flightLine);this.flightLine.geometry.setDrawRange(0,0);this.draw();
 }
 setRevealed(value){this.revealed=value;if(!value&&this.time>impactTime)this.seek(impactTime);this.draw();}
 setView(view){this.view=view;if(view==='impact')this.seek(impactTime);if(view==='flight'){if(!this.revealed)this.view='swing';else this.seek(duration+1.8);}this.draw();}
 setDetail(detail){this.detail=detail;this.draw();}
 setReduced(value){this.reduced=value;if(value)this.pause();}
 resize(){const w=this.host.clientWidth,h=this.host.clientHeight;if(w<1||h<1)return;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.draw();}
 seek(time){this.pause();this.time=T.MathUtils.clamp(time,0,this.revealed?duration+1.8:impactTime);this.draw();this.onTime?.(this.time);}
 play({full=false}={}){if(this.reduced)return;this.view='swing';this.time=0;this.playing=true;this.full=full&&this.revealed;this.draw();}
 pause(){const was=this.playing;this.playing=false;if(was)this.onStop?.({finished:false});}
 tick(now){if(!this.alive)return;const dt=Math.min(.06,(now-this.previous)/1000);this.previous=now;if(this.playing){this.time+=dt*this.speed;const end=this.full?duration+1.8:impactTime;if(this.time>=end){this.time=end;this.playing=false;this.draw();this.onTime?.(this.time);this.onStop?.({finished:true});}else{this.draw();this.onTime?.(this.time);}}this.frame=requestAnimationFrame(t=>this.tick(t));}
 draw(){if(!this.c)return;
  const isImpact=this.view==='impact',isFlight=this.view==='flight'||(this.playing&&this.full&&this.time>duration);
  const time=isImpact?impactTime:this.time,frame=MOTION.start+Math.min(duration,time)*MOTION.fps;
  this.golfer.pose(frame);this.golfer.group.visible=!isImpact&&!isFlight;
  let grip=this.golfer.grip.clone(),dir=this.golfer.direction.clone();
  const clubQ=authoredClubRotation(frame,this.c.face);dir.copy(Y).applyQuaternion(clubQ);
  // Author a rigid delivery through the ball. CMU has no club measurements.
  // Contact uses the authored sweet spot on the lofted face plus the ball radius.
  const addressWeight=1-T.MathUtils.smoothstep(frame,MOTION.start,MOTION.start+35);
  const addressGrip=this.ballOrigin.clone().add(V(-.065,.012,0)).sub(BALL_CONTACT_LOCAL.clone().applyQuaternion(clubQ));grip.lerp(addressGrip,addressWeight);
  const deltaFrame=frame-MOTION.impact,s=deltaFrame*.07,w=Math.exp(-Math.pow(deltaFrame/13,4));
  const delivered=this.ballOrigin.clone().add(V(s,.8*s*s,Math.tan(this.c.path*Math.PI/180)*s));
  const deliveredGrip=delivered.sub(BALL_CONTACT_LOCAL.clone().applyQuaternion(clubQ));
  grip.lerp(deliveredGrip,w);
  this.golfer.placeHands(grip,dir,clubQ);grip.copy(this.golfer.grip);
  const head=grip.clone().add(dir);this.club.position.copy(grip);this.club.quaternion.copy(clubQ);this.club.visible=!isFlight;
  const ft=this.revealed?T.MathUtils.clamp((this.time-impactTime)/2.25,0,1):0;
  const f=flightPoint(this.c,isFlight&&!this.playing?1:ft);this.ball.position.copy(this.ballOrigin);if(this.revealed&&!isImpact)this.ball.position.add(V(f.x,f.y-.027,f.z));
  this.ball.scale.setScalar(isFlight?4:1);this.landing.position.copy(this.ball.position);this.landing.position.y=.01;this.landing.visible=isFlight&&(!this.playing||ft>=.99);
  this.evidence.visible=isImpact;this.trail.visible=this.revealed&&!isImpact;
  if(this.flightLine)this.flightLine.geometry.setDrawRange(0,Math.max(0,Math.floor((isFlight&&!this.playing?1:ft)*90)+1));
  const portrait=this.camera.aspect<1,origin=this.ballOrigin;
  if(isImpact){this.camera.position.copy(origin).add(V(-1.8,3.8,0));this.camera.lookAt(origin.clone().add(V(.85,0,0)));}
  else if(isFlight){this.camera.position.copy(origin).add(V(-14,29,0));this.camera.lookAt(origin.clone().add(V(9,0,1.5)));}
  else {this.camera.position.set(-2.25,1.75,3.5);this.camera.lookAt(.1,1.08,.15);if(portrait){this.camera.position.set(-2.5,1.85,3.7);}
   if(this.detail==='grip'){this.camera.position.copy(grip).add(V(-.46,.16,.65));this.camera.lookAt(grip);}
   if(this.detail==='club'){this.camera.position.copy(head).add(V(.30,.19,.33));this.camera.lookAt(head.clone().add(V(0,.025,.025)));}}
  this.scene.fog.near=isFlight?40:isImpact?10:14;this.scene.fog.far=isFlight?120:53;this.renderer.render(this.scene,this.camera);
 }
 destroy(){this.alive=false;cancelAnimationFrame(this.frame);this.resizeObserver.disconnect();document.removeEventListener('visibilitychange',this.visibility);this.renderer.domElement.removeEventListener('webglcontextlost',this.contextLost);this.scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.bumpMap?.dispose();m.dispose();}}});this.environment.dispose();this.renderer.dispose();this.renderer.domElement.remove();}
}
