import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createClub,clubQuaternion,BALL_CONTACT_LOCAL} from './motion/club.js';
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const direction=V(.08,-.89,.45).normalize();

/** Authored impact mechanism, not a reconstructed player's grip or swing. */
export class ImpactView {
 constructor(host,{face=3,path=6,reduced=false}={}){
  this.host=host;this.face=face;this.path=path;this.progress=.5;this.reduced=reduced;this.focusMode='both';
  this.renderer=new T.WebGLRenderer({antialias:true,alpha:false});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.9;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFShadowMap;host.append(this.renderer.domElement);this.renderer.domElement.setAttribute('aria-label','Interactive 3D iron at impact. Drag to orbit. A labelled direction ruler and step-by-step explanation accompany this view.');
  this.overlay=document.createElement('div');this.overlay.className='it-annotations';this.overlay.setAttribute('aria-hidden','true');this.overlay.innerHTML='<svg><line data-it-line="target"/><line data-it-line="face"/><line data-it-line="path"/></svg><span class="it-tag target" data-it-tag="target">TARGET LINE · 0°</span><span class="it-tag face" data-it-tag="face">FACE POINTS</span><span class="it-tag path" data-it-tag="path">HEAD MOVES</span>';host.append(this.overlay);this.scene=new T.Scene();this.scene.background=new T.Color('#122923');this.scene.fog=new T.Fog('#122923',1.2,3);
  this.camera=new T.PerspectiveCamera(35,1,.005,10);this.camera.position.set(.30,.20,.32);
  this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.target.set(-.01,.045,0);this.controls.enablePan=false;this.controls.minDistance=.18;this.controls.maxDistance=.85;this.controls.maxPolarAngle=Math.PI*.48;this.controls.enableDamping=false;
  const pmrem=new T.PMREMGenerator(this.renderer),room=new RoomEnvironment();this.env=pmrem.fromScene(room,.025);this.scene.environment=this.env.texture;this.scene.environmentIntensity=.8;room.dispose();pmrem.dispose();
  this.scene.add(new T.HemisphereLight('#f3f6f1','#143724',1.4));const key=new T.DirectionalLight('#ffe6b6',3.1);key.position.set(.4,.8,.25);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-.8,right:.8,top:.8,bottom:-.8,near:.01,far:3});key.shadow.bias=-.00005;key.shadow.normalBias=.001;this.scene.add(key);
  const rim=new T.DirectionalLight('#a4e5f0',1.6);rim.position.set(-.4,.3,-.4);this.scene.add(rim);
  const plane=new T.Mesh(new T.PlaneGeometry(6,6),new T.MeshStandardMaterial({color:'#254836',roughness:1}));plane.rotation.x=-Math.PI/2;plane.receiveShadow=true;this.scene.add(plane);
  const dots=[];for(let x=-.6;x<=.6;x+=.05)for(let z=-.6;z<=.6;z+=.05)dots.push(x,.0008,z);const dg=new T.BufferGeometry();dg.setAttribute('position',new T.Float32BufferAttribute(dots,3));this.scene.add(new T.Points(dg,new T.PointsMaterial({color:'#a0bca2',size:.0017,transparent:true,opacity:.35})));
  this.club=createClub();this.faceMesh=this.club.getObjectByName('Striking face');this.scene.add(this.club);
  const sphere=new T.SphereGeometry(.027,80,56),a=sphere.attributes.position,centres=[];
  for(let i=0;i<330;i++){const y=1-(i+.5)/330*2,r=Math.sqrt(1-y*y),phi=i*2.3999632297;centres.push(V(Math.cos(phi)*r,y,Math.sin(phi)*r));}
  for(let i=0;i<a.count;i++){const p=V().fromBufferAttribute(a,i).normalize();let closest=1;for(const c of centres)closest=Math.min(closest,1-p.dot(c));const d=Math.sqrt(2*closest);const dent=d<.082?.00048*(1-(d/.082)**2)**2:0;a.setXYZ(i,p.x*(.027-dent),p.y*(.027-dent),p.z*(.027-dent));}sphere.computeVertexNormals();
  this.ball=new T.Mesh(sphere,new T.MeshStandardMaterial({color:'#fffdf1',roughness:.4}));this.ball.castShadow=true;this.ball.position.set(0,.028,0);this.scene.add(this.ball);
  this.guides=new T.Group();this.scene.add(this.guides);this.controls.addEventListener('change',()=>this.render());this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);this.set(face,path);this.resize();this.controls.update();
 }
 arrow(angle,color,length,from=-.23){const radians=angle*Math.PI/180,dir=V(Math.cos(radians),0,Math.sin(radians));const a=new T.ArrowHelper(dir,dir.clone().multiplyScalar(from).add(V(0,.006,0)),length,color,.028,.015);this.guides.add(a);return a;}
 set(face,path){this.face=face;this.path=path;this.guides.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});this.guides.clear();this.targetArrow=this.arrow(0,'#afc0b5',.48,-.19);this.pathArrow=this.arrow(path,'#74d4cf',.43,-.20);this.faceArrow=this.arrow(face,'#f2c86d',.18,0);this.focus(this.focusMode);this.seek(this.progress);}
 focus(mode='both'){this.focusMode=mode;this.faceArrow.visible=mode!=='path';this.pathArrow.visible=mode!=='face';this.faceMesh.material.emissive.set(mode==='path'?'#000000':'#b48b2c');this.faceMesh.material.emissiveIntensity=.35;this.faceMesh.material.color.set(mode==='path'?'#d2d9d9':'#f5ce74');this.faceMesh.material.metalness=mode==='path'?.78:.35;this.overlay.querySelector('[data-it-tag="face"]').hidden=mode==='path';this.overlay.querySelector('[data-it-tag="path"]').hidden=mode==='face';this.overlay.querySelector('[data-it-line="face"]').style.display=mode==='path'?'none':'';this.overlay.querySelector('[data-it-line="path"]').style.display=mode==='face'?'none':'';this.render();}
 seek(progress){this.progress=progress;const q=clubQuaternion(direction,this.face),distance=(progress-.5)*.5,angle=this.path*Math.PI/180;
  const contact=V(0,.028,0);this.club.quaternion.copy(q);this.club.position.copy(contact).sub(BALL_CONTACT_LOCAL.clone().applyQuaternion(q)).add(V(Math.cos(angle)*distance,.18*distance*distance,Math.sin(angle)*distance));
  const launch=(this.face*.8+this.path*.2)*Math.PI/180,travel=Math.max(0,progress-.5)*.7;this.ball.position.set(Math.cos(launch)*travel,.028+travel*.35,Math.sin(launch)*travel);this.render();
 }
 view(mode){this.camera.up.copy(mode==='top'?V(1,0,0):V(0,1,0));this.camera.position.copy(mode==='top'?V(.015,.70,0):V(.30,.24,.34));this.controls.target.set(.015,.025,0);this.controls.update();this.render();}
 resize(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.render();}
 render(){this.renderer.render(this.scene,this.camera);if(!this.overlay)return;const w=this.host.clientWidth,h=this.host.clientHeight;this.overlay.querySelector('svg').setAttribute('viewBox',`0 0 ${w} ${h}`);for(const [key,angle,distance] of [['target',0,.27],['face',this.face,.14],['path',this.path,-.16]]){const rad=angle*Math.PI/180,point=V(Math.cos(rad)*distance,.008,Math.sin(rad)*distance).project(this.camera),tag=this.overlay.querySelector(`[data-it-tag="${key}"]`),line=this.overlay.querySelector(`[data-it-line="${key}"]`);line.setAttribute('x1',tag.offsetLeft+tag.offsetWidth/2);line.setAttribute('y1',tag.offsetTop+tag.offsetHeight/2);line.setAttribute('x2',Math.max(5,Math.min(w-5,(point.x+1)*w/2)));line.setAttribute('y2',Math.max(5,Math.min(h-5,(1-point.y)*h/2)));}}

 destroy(){this.observer.disconnect();this.controls.dispose();this.scene.traverse(o=>{o.geometry?.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m?.dispose());});this.env.dispose();this.renderer.dispose();this.renderer.domElement.remove();this.overlay.remove();}
}
