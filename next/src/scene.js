import * as THREE from 'three';
import {SCENARIO} from './scenario.js';
import {bankX, isGreen, pattern, targetFor} from './model.js';

const clamp=THREE.MathUtils.clamp;
const mix=THREE.MathUtils.lerp;
export function terrainY(x,z){
 const edge=bankX(z)-x;
 const g=SCENARIO.green;
 const r=Math.sqrt(((x-g.x)/g.rx)**2+((z-g.z)/g.rz)**2);
 const green=3.7 + .005*z-.012*x;
 const rolling=3.8+1.6*Math.sin(x*.041+z*.025)+.8*Math.cos(z*.078-x*.037);
 const dunes=Math.max(0,(-x-34)/50)*(3+2*Math.sin(z*.06));
 let h=mix(green,rolling+dunes,THREE.MathUtils.smoothstep(r,1,1.7));
 if(edge<4)h=mix(-2.2,h,THREE.MathUtils.smoothstep(edge,-1.5,4));
 return h;
}
function seeded(seed){let a=seed;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function grassTexture(){
 const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');
 const data=ctx.createImageData(256,256),r=seeded(423);
 for(let i=0;i<data.data.length;i+=4){const v=213+r()*42;data.data[i]=v;data.data[i+1]=v;data.data[i+2]=v;data.data[i+3]=255;}
 ctx.putImageData(data,0,0);ctx.strokeStyle='rgba(50,70,20,.10)';ctx.lineWidth=.5;
 for(let i=0;i<5000;i++){const x=r()*256,y=r()*256;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+1,y-2-r()*3);ctx.stroke();}
 const tex=new THREE.CanvasTexture(c);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(42,55);tex.colorSpace=THREE.SRGBColorSpace;return tex;
}
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
export class GolfScene {
 constructor(host,{onSelect,onLand,reducedMotion=false}={}){
  this.host=host;this.onSelect=onSelect;this.onLand=onLand;this.reducedMotion=reducedMotion;this.round=0;this.choice=null;this.mode='intro';this.markers=[];this.live=true;this.overview=false;this.time=0;this.flight=null;this.patternGroup=new THREE.Group();this.aimGroup=new THREE.Group();this.dots=[];
  this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#bfdce0');this.scene.fog=new THREE.FogExp2('#c6dfdc',.0027);
  this.camera=new THREE.PerspectiveCamera(43,1,.1,1200);
  this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.7));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFShadowMap;
  this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.96;
  this.renderer.domElement.setAttribute('aria-hidden','true');host.prepend(this.renderer.domElement);
  this.scene.add(new THREE.HemisphereLight('#e6f2f1','#3b492b',1.5));
  const sun=new THREE.DirectionalLight('#fff0c9',2.8);sun.position.set(-70,65,48);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-120;sun.shadow.camera.right=100;sun.shadow.camera.top=140;sun.shadow.camera.bottom=-100;sun.shadow.camera.far=260;sun.shadow.bias=-.0003;sun.shadow.normalBias=.08;sun.target.position.set(-15,0,25);this.scene.add(sun,sun.target);
  this.makeTerrain();this.makeGreen();this.makeBunker();this.makeOcean();this.makeDetails();this.makeFlag();this.makeBall();this.scene.add(this.patternGroup,this.aimGroup);
  this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();
  this.clickHandler=e=>this.pick(e);this.renderer.domElement.addEventListener('pointerup',this.clickHandler);
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);
  this.camera.position.copy(V(-48,51,104));this.look=V(-1,2,26);this.camera.lookAt(this.look);this.destPos=this.camera.position.clone();this.destLook=this.look.clone();
  this.resize();this.frame=0;this.lastTime=performance.now();this.animate();
 }
 makeTerrain(){
  const geo=new THREE.PlaneGeometry(450,650,260,360);geo.rotateX(-Math.PI/2);geo.translate(-145,0,-45);
  const p=geo.attributes.position,colors=[];const rough=new THREE.Color('#536d35'),fair=new THREE.Color('#527d34'),green=new THREE.Color('#62873e'),sand=new THREE.Color('#cbb584'),cliff=new THREE.Color('#827761');
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),z=p.getZ(i),edge=bankX(z)-x;p.setY(i,terrainY(x,z));
   const c=rough.clone();const line=-13+Math.sin(z*.025)*4;const fwWidth=11+5*Math.sin((z+30)*.015);
   if(z>17&&z<165&&Math.abs(x-line)<fwWidth){c.copy(fair);c.multiplyScalar(Math.floor(z/9)%2===0?1.035:.97);}
   if(isGreen({x,z}))c.copy(green);
   c.multiplyScalar(1+.045*Math.sin(x*.23+z*.17)*Math.sin(x*.08-z*.2));
   const bunker=((x+29)/8)**2+((z-23)/11)**2;
   if(bunker<1)p.setY(i,p.getY(i)-.18*(1-bunker));
   if(edge<3.5){c.copy(edge<.6?cliff:sand);}
   const noise=Math.sin(x*2.7+z*1.32)*Math.sin(z*2.12+x)*.025;c.multiplyScalar(1+noise);
   colors.push(c.r,c.g,c.b);
  }
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
  this.terrain=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,map:grassTexture(),roughness:1}));this.terrain.receiveShadow=true;this.scene.add(this.terrain);
  const farGeo=new THREE.PlaneGeometry(800,1200,60,80);farGeo.rotateX(-Math.PI/2);farGeo.translate(-320,0,-970);const farP=farGeo.attributes.position;
  for(let i=0;i<farP.count;i++){const x=farP.getX(i),z=farP.getZ(i);farP.setY(i,terrainY(x,z));}farGeo.computeVertexNormals();this.scene.add(new THREE.Mesh(farGeo,new THREE.MeshStandardMaterial({color:'#536d35',roughness:1})));

 }
 makeGreen(){
  const make=(extra,color)=>{
   const positions=[],colours=[],uv=[],indices=[],segments=144,rings=32,g=SCENARIO.green,base=new THREE.Color(color);
   for(let r=0;r<=rings;r++)for(let i=0;i<=segments;i++){
    const a=i/segments*Math.PI*2,t=r/rings,x=g.x+(g.rx+extra)*t*Math.cos(a),z=g.z+(g.rz+extra)*t*Math.sin(a);
    positions.push(x,terrainY(x,z)+.045+(extra===0?.035:0),z);uv.push(x*.015,z*.015);
    const c=base.clone();if(extra===0)c.multiplyScalar(Math.floor((z+x*.28)/5)%2===0?1.045:.955);colours.push(c.r,c.g,c.b);
   }
   for(let r=0;r<rings;r++)for(let i=0;i<segments;i++){const a=r*(segments+1)+i,b=a+segments+1;for(const tri of [[a,b,a+1],[b,b+1,a+1]]){if(tri.every(n=>positions[n*3]<bankX(positions[n*3+2])-.2))indices.push(...tri);}}
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
   const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide}));mesh.receiveShadow=true;this.scene.add(mesh);
  };make(1.2,'#486b2d');make(0,'#6b9345');
 }
 makeBunker(){
  const positions=[],uv=[],indices=[],seg=96,rings=20;
  for(let r=0;r<=rings;r++)for(let i=0;i<=seg;i++){const a=i/seg*Math.PI*2,t=r/rings,x=-29+8*t*Math.cos(a),z=23+11*t*Math.sin(a);positions.push(x,terrainY(x,z)-.18*(1-t*t)+.07,z);uv.push(t*Math.cos(a),t*Math.sin(a));}
  for(let r=0;r<rings;r++)for(let i=0;i<seg;i++){const a=r*(seg+1)+i,b=a+seg+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:'#c9b585',roughness:1,side:THREE.DoubleSide}));mesh.receiveShadow=true;this.scene.add(mesh);
 }
 makeOcean(){
  const uniforms={time:{value:0},deep:{value:new THREE.Color('#185366')},shallow:{value:new THREE.Color('#68a59b')},fogColor:{value:new THREE.Color('#c6dfdc')}};this.waterUniforms=uniforms;
  const mat=new THREE.ShaderMaterial({uniforms,vertexShader:`varying vec3 vWorld; void main(){vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`uniform float time;uniform vec3 deep;uniform vec3 shallow;uniform vec3 fogColor;varying vec3 vWorld;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
void main(){vec2 p=vWorld.xz;float bank=18.+2.2*sin((p.y+8.)/22.);float d=max(0.,p.x-bank);float n=noise(p*vec2(.15,.5)+vec2(time*.09,0.));float n2=noise(p*vec2(.5,2.)+vec2(-time*.12,time*.05));float rip=sin(p.y*1.2+n*5.+time*.8)*.5+.5;vec3 c=mix(shallow,deep,smoothstep(0.,30.,d));c+=n*.045+pow(rip,18.)*n2*.065;float foam=(1.-smoothstep(0.,2.2+n*2.,d))*(.55+.3*n2);c=mix(c,vec3(.8,.88,.8),foam*.8);float fog=1.-exp(-pow(length(cameraPosition-vWorld)*.0027,2.));c=mix(c,fogColor,fog);gl_FragColor=vec4(c,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`});
  const ocean=new THREE.Mesh(new THREE.PlaneGeometry(6000,6000),mat);ocean.rotation.x=-Math.PI/2;ocean.position.set(0,-1.7,0);this.scene.add(ocean);
  // Far offshore silhouettes add depth without introducing licensed course imagery.
  const islandMat=new THREE.MeshStandardMaterial({color:'#8ba59b',roughness:1});
  for(let i=0;i<3;i++){const island=new THREE.Mesh(new THREE.SphereGeometry(1,24,8),islandMat);island.scale.set(60+i*20,9+i*6,24);island.position.set(200+i*100,-3,-240-i*65);this.scene.add(island);}
 }
 makeDetails(){
  const r=seeded(803),treeCount=125;const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.17,.3,4,5),new THREE.MeshStandardMaterial({color:'#6b6850',roughness:1}),treeCount);
  const crowns=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshStandardMaterial({color:'#304d31',roughness:1,flatShading:true}),treeCount*3);
  const obj=new THREE.Object3D();
  for(let i=0;i<treeCount;i++){
   const x=i<28?-39-r()*24:-53-r()*115,z=i<28?-80+r()*145:-245+r()*475,y=terrainY(x,z),s=.8+r()*.9;
   obj.position.set(x,y+1.5*s,z);obj.scale.set(s,s,s);obj.rotation.set(0,r()*6,0);obj.updateMatrix();trunks.setMatrixAt(i,obj.matrix);
   for(let j=0;j<3;j++){obj.position.set(x+(j-1)*1.5*s,y+(4.4+(j===1?1.7:0))*s,z+(j%2)*s);obj.scale.set(2.5*s,2.4*s,2.4*s);obj.updateMatrix();crowns.setMatrixAt(i*3+j,obj.matrix);crowns.setColorAt(i*3+j,new THREE.Color().setHSL(.30+r()*.035,.23,.19+r()*.07));}
  }
  crowns.castShadow=true;trunks.castShadow=true;this.scene.add(crowns,trunks);
  const rocks=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),new THREE.MeshStandardMaterial({color:'#a59d83',roughness:1,flatShading:true}),65);
  for(let i=0;i<65;i++){const z=-105+r()*320,x=bankX(z)-r()*1.7+.2,y=terrainY(x,z);obj.position.set(x,y+.15,z);const s=.25+r()*1.1;obj.scale.set(s*1.3,s*.55,s);obj.rotation.set(r(),r()*6,r());obj.updateMatrix();rocks.setMatrixAt(i,obj.matrix);}
  rocks.castShadow=true;this.scene.add(rocks);
  // Low tufts around the rough make the near ground feel tangible.
  const tufts=new THREE.InstancedMesh(new THREE.ConeGeometry(.3,1.2,3),new THREE.MeshStandardMaterial({color:'#96a565',roughness:1}),700);
  for(let i=0;i<700;i++){const z=-50+r()*240,x=-36-r()*14;obj.position.set(x,terrainY(x,z)+.35,z);obj.scale.set(1,.5+r()*.8,1);obj.rotation.set(0,r()*6,.15);obj.updateMatrix();tufts.setMatrixAt(i,obj.matrix);}
  this.scene.add(tufts);
 }
 makeFlag(){
  this.flag=new THREE.Group();
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.065,.07,4.8,8),new THREE.MeshStandardMaterial({color:'#f1ead6',roughness:.5}));pole.position.y=2.4;pole.castShadow=true;this.flag.add(pole);
  const hole=new THREE.Mesh(new THREE.CircleGeometry(.16,24),new THREE.MeshBasicMaterial({color:'#20372d'}));hole.rotation.x=-Math.PI/2;hole.position.y=.015;this.flag.add(hole);
  const flagGeo=new THREE.PlaneGeometry(1.6,.85,16,6);flagGeo.translate(.82,4.25,0);
  this.flagCloth=new THREE.Mesh(flagGeo,new THREE.MeshStandardMaterial({color:'#e6b94f',side:THREE.DoubleSide,roughness:.8}));this.flagCloth.castShadow=true;this.flag.add(this.flagCloth);this.scene.add(this.flag);this.positionFlag();
 }
 positionFlag(){const p=SCENARIO.rounds[this.round].pin;this.flag.position.set(p.x,terrainY(p.x,p.z)+.03,p.z);}
 makeBall(){
  this.ball=new THREE.Mesh(new THREE.SphereGeometry(.25,16,12),new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.45}));this.ball.castShadow=true;this.scene.add(this.ball);
  this.ballShadow=new THREE.Mesh(new THREE.CircleGeometry(.5,24),new THREE.MeshBasicMaterial({color:'#273d2a',transparent:true,opacity:.2,depthWrite:false}));this.ballShadow.rotation.x=-Math.PI/2;this.scene.add(this.ballShadow);
  this.resetBall();
 }
 resetBall(){const p=SCENARIO.start;this.ball.position.set(p.x,terrainY(p.x,p.z)+.3,p.z);this.ball.visible=true;this.ballShadow.visible=true;this.ballShadow.position.set(p.x,terrainY(p.x,p.z)+.04,p.z);}
 resize(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h);this.mobile=w<600;this.updateCamera();}
 setCamera(pos,look,instant=false){this.destPos=pos;this.destLook=look;if(instant||this.reducedMotion){this.camera.position.copy(pos);this.look.copy(look);this.camera.lookAt(this.look);}}
 updateCamera(){
  if(this.flight)return;
  if(this.overview){this.setCamera(V(-9,104,44),V(-3,0,13));return;}
  if(this.mode==='intro')this.setCamera(this.mobile?V(-46,42,108):V(-40,27,108),V(-1,3,0));
  else if(this.mode==='compare')this.setCamera(this.mobile?V(-12,86,48):V(-16,67,45),V(-2,2,1));
  else if(this.mode==='flight')this.setCamera(V(-10,8,154),V(0,5,50));
  else this.setCamera(this.mobile?V(-29,66,81):V(-34,44,66),V(-2,2,3));
 }
 setRound(round){this.flight=null;this.overview=false;this.round=round;this.positionFlag();this.clearPattern();this.resetBall();this.choice=null;this.updateAim();}
 setMode(mode){this.mode=mode;this.updateCamera();this.updateAim();}
 setChoice(choice){this.choice=choice;this.updateAim();}
 toggleView(){this.overview=!this.overview;this.updateCamera();return this.overview;}
 clearGroup(group){while(group.children.length){const c=group.children[0];group.remove(c);c.traverse(o=>{o.geometry?.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material?.dispose();});}}
 updateAim(){
  this.clearGroup(this.aimGroup);this.markers=[];
  if(!['decision','compare'].includes(this.mode))return;
  for(const key of ['flag','middle']){
   const p=targetFor(this.round,key),selected=this.choice===key;
   const ring=new THREE.Mesh(new THREE.RingGeometry(selected?1.65:1.2,selected?1.95:1.4,64),new THREE.MeshBasicMaterial({color:selected?'#f1c66d':'#ffffff',side:THREE.DoubleSide,transparent:true,opacity:selected?.95:.7,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.set(p.x,terrainY(p.x,p.z)+.13,p.z);ring.userData.choice=key;this.aimGroup.add(ring);
   // Invisible but generous ground target, kept within the actual rendered scene.
   const hit=new THREE.Mesh(new THREE.CircleGeometry(4,32),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}));hit.rotation.x=-Math.PI/2;hit.position.copy(ring.position);hit.userData.choice=key;this.aimGroup.add(hit);this.markers.push(hit);
  }
 }
 pick(e){if(this.mode!=='decision')return;const r=this.renderer.domElement.getBoundingClientRect();this.pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);const hit=this.raycaster.intersectObjects(this.markers)[0];if(hit)this.onSelect?.(hit.object.userData.choice);}
 clearPattern(){this.clearGroup(this.patternGroup);this.dots=[];if(this.tracer){this.scene.remove(this.tracer);this.tracer.geometry.dispose();this.tracer.material.dispose();this.tracer=null;}}
 showPattern(choice,animate=true){
  this.clearPattern();this.choice=choice;this.updateAim();const points=pattern(this.round,choice);const target=targetFor(this.round,choice);
  const ringPoints=[];for(let i=0;i<=80;i++){const a=i/80*Math.PI*2;const x=target.x+13*Math.cos(a),z=target.z+13*Math.sin(a);ringPoints.push(V(x,Math.max(terrainY(x,z),-1.5)+.2,z));}
  const outline=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(ringPoints),new THREE.LineDashedMaterial({color:'#f0e3b4',dashSize:.6,gapSize:.5,transparent:true,opacity:.5}));outline.computeLineDistances();this.patternGroup.add(outline);
  for(const [i,p] of points.entries()){
   const g=new THREE.Group(),water=p.lie==='water',y=water?4.8:terrainY(p.x,p.z)+.18;
   const disc=new THREE.Mesh(new THREE.CircleGeometry(.8,24),new THREE.MeshBasicMaterial({color:water?'#f2a583':'#fff6cf',side:THREE.DoubleSide,transparent:true,opacity:.9}));disc.rotation.x=-Math.PI/2;g.add(disc);
   const core=new THREE.Mesh(new THREE.SphereGeometry(.22,12,8),new THREE.MeshStandardMaterial({color:water?'#e9aa8d':'#ffffff',roughness:.5}));core.position.y=.2;g.add(core);
   if(water){const stem=new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0,-6.2,0),V(0,-.1,0)]),new THREE.LineBasicMaterial({color:'#e9aa8d',transparent:true,opacity:.65}));g.add(stem);const crossMat=new THREE.MeshBasicMaterial({color:'#713c2c'});for(const angle of [-Math.PI/4,Math.PI/4]){const bar=new THREE.Mesh(new THREE.PlaneGeometry(.65,.12),crossMat.clone());bar.rotation.set(-Math.PI/2,0,angle);bar.position.y=.04;g.add(bar);}}
   g.position.set(p.x,y,p.z);g.userData.appear=this.time+(animate&&!this.reducedMotion?i*.055:0);g.scale.setScalar(animate&&!this.reducedMotion?.01:1);this.patternGroup.add(g);this.dots.push(g);
  }
  this.ball.visible=false;this.ballShadow.visible=false;this.updateCamera();
 }
 async shoot(choice){
  this.clearPattern();this.choice=choice;this.mode='flight';this.updateAim();this.overview=false;const end=pattern(this.round,choice)[0],start=SCENARIO.start;
  const startV=V(start.x,terrainY(start.x,start.z)+.3,start.z),endV=V(end.x,terrainY(end.x,end.z)+.28,end.z);
  this.ball.visible=true;this.ballShadow.visible=true;this.ball.position.copy(startV);
  this.setCamera(V(-9,8,154),V(0,7,50),true);
  if(this.reducedMotion){this.ball.position.copy(endV);this.mode='single';this.updateCamera();this.onLand?.();return;}
  const curve=[];for(let i=0;i<=90;i++){const t=i/90;curve.push(V(mix(startV.x,endV.x,t),mix(startV.y,endV.y,t)+Math.sin(Math.PI*t)*29,mix(startV.z,endV.z,t)));}
  this.tracer=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve),new THREE.LineBasicMaterial({color:'#fff5cc',transparent:true,opacity:.78}));this.tracer.geometry.setDrawRange(0,0);this.scene.add(this.tracer);
  this.flight={start:this.time,from:startV,to:endV,duration:3.3};
 }
 project(point){const v=V(point.x,terrainY(point.x,point.z)+.5,point.z).project(this.camera);return{x:(v.x*.5+.5)*this.host.clientWidth,y:(-v.y*.5+.5)*this.host.clientHeight,visible:v.z<1&&v.z>-1};}
 animate(){
  if(!this.live)return;this.frame=requestAnimationFrame(()=>this.animate());const now=performance.now(),dt=Math.min((now-this.lastTime)/1000,.04);this.lastTime=now;this.time+=dt;
  if(document.hidden)return;
  if(!this.reducedMotion){this.waterUniforms.time.value=this.time;const p=this.flagCloth.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i);p.setZ(i,Math.sin(x*3-this.time*2.4)*.14*(x/1.6));}p.needsUpdate=true;}
  if(this.flight){
   const f=this.flight,t=clamp((this.time-f.start)/f.duration,0,1),travel=Math.min(t/.88,1);
   this.ball.position.set(mix(f.from.x,f.to.x,travel),mix(f.from.y,f.to.y,travel)+Math.sin(Math.PI*travel)*29+(t>.88?Math.sin((t-.88)/.12*Math.PI)*.6:0),mix(f.from.z,f.to.z,travel));
   this.ballShadow.position.set(this.ball.position.x,terrainY(this.ball.position.x,this.ball.position.z)+.06,this.ball.position.z);
   this.tracer?.geometry.setDrawRange(0,Math.max(2,Math.floor(travel*91)));
   const ct=THREE.MathUtils.smoothstep(t,.07,.82);this.destPos=V(mix(-9,-30,ct),mix(8,40,ct),mix(154,64,ct));this.destLook=V(mix(0,-2,ct),mix(7,3,ct),mix(50,3,ct));
   if(t>=1){this.flight=null;this.mode='single';this.updateCamera();this.onLand?.();}
  }
  for(const d of this.dots){const t=clamp((this.time-d.userData.appear)*5,0,1);d.scale.setScalar(t<1?.01+(1-Math.pow(1-t,3))*.99:1);}
  const lerp=this.reducedMotion?1:1-Math.exp(-dt*3);this.camera.position.lerp(this.destPos,lerp);this.look.lerp(this.destLook,lerp);this.camera.lookAt(this.look);
  this.host.dispatchEvent(new CustomEvent('sceneproject',{detail:{flag:this.project(targetFor(this.round,'flag')),middle:this.project(targetFor(this.round,'middle'))}}));
  this.renderer.render(this.scene,this.camera);
 }
 destroy(){this.live=false;cancelAnimationFrame(this.frame);this.observer.disconnect();this.renderer.domElement.removeEventListener('pointerup',this.clickHandler);this.renderer.dispose();this.renderer.domElement.remove();}
}
