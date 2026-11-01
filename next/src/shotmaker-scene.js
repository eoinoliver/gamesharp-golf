import * as T from 'three';
import {shotPoint,resultFor,clamp,shoreX} from './shotmaker-model.js';
import skyURL from './shotmaker-assets/headland-sky.jpg';
import rockURL from './shotmaker-assets/headland-rock.jpg';
import rockNormalURL from './shotmaker-assets/headland-rock-normal.jpg';

const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),lerp=T.MathUtils.lerp;
const seed=n=>()=>{n|=0;n=n+0x6D2B79F5|0;let t=Math.imul(n^n>>>15,1|n);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
export const coast=shoreX;
export function height(x,z){
 const g=Math.sqrt((x/25)**2+(z/28)**2),smooth=T.MathUtils.smoothstep(g,1,2.4);
 const dune=8.1+2.2*Math.sin(x*.052+z*.021)+1.2*Math.cos(z*.073)+Math.max(0,-x-34)*.055;
 return lerp(8.3+.005*z-.009*x,dune,smooth);
}
function grain(){
 const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),d=ctx.createImageData(256,256),r=seed(82);
 for(let i=0;i<d.data.length;i+=4){const v=200+r()*55;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255;}ctx.putImageData(d,0,0);
 const texture=new T.CanvasTexture(c);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(55,85);texture.colorSpace=T.SRGBColorSpace;return texture;
}
const standard=(color,roughness=1)=>new T.MeshStandardMaterial({color,roughness});
function dispose(group){group.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{m.map?.dispose();m.dispose();});});}

/** A single fixed, fictional headland. Camera cuts never alter its hazards. */
export class ShotmakerScene {
 constructor(host,{reduced=false,onFinish,onProgress,onFailure}={}){
  this.host=host;this.reduced=reduced;this.onFinish=onFinish;this.onProgress=onProgress;this.onFailure=onFailure;this.live=true;this.dirty=true;this.clock=0;this.mode='hero';this.face=3;this.path=6;this.playing=false;this.isOverview=false;this.showGhost=false;
  this.renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.08;
  this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.domElement.setAttribute('aria-hidden','true');host.prepend(this.renderer.domElement);
  this.contextLost=e=>{e.preventDefault();this.onFailure?.();};this.renderer.domElement.addEventListener('webglcontextlost',this.contextLost);
  this.scene=new T.Scene();this.scene.fog=new T.FogExp2('#c9d8d2',.0022);this.camera=new T.PerspectiveCamera(43,1,.15,30000);this.look=V();this.destination=V();this.lookDestination=V();
  this.scene.add(new T.HemisphereLight('#c0dced','#768363',1.1));
  this.sun=new T.DirectionalLight('#fff0d0',2.5);this.sun.position.set(-65,70,30);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);Object.assign(this.sun.shadow.camera,{left:-130,right:100,top:190,bottom:-90,near:1,far:360});this.sun.shadow.bias=-.0002;this.sun.shadow.normalBias=.035;this.sun.target.position.set(-10,5,40);this.scene.add(this.sun,this.sun.target);
  this.makeSky();this.makeTerrain();this.makeSea();this.makeDetails();this.makeFlag();this.makeBall();
  this.lines=new T.Group();this.scene.add(this.lines);this.targetLine=this.makeLine([V(0,height(0,160)+.1,160),V(0,8.5,0)],'#fff6ce',.22,true);this.scene.add(this.targetLine);this.targetLine.visible=false;
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);this.resize();this.setMode('hero',true);this.last=performance.now();this.animate();
 }
 makeSky(){
  const mat=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{sun:{value:V(-.5,.36,-.85).normalize()},photo:{value:null},hasPhoto:{value:0}},vertexShader:'varying vec3 vDirection;void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 vDirection;uniform vec3 sun;uniform sampler2D photo;uniform float hasPhoto;
  void main(){vec3 d=normalize(vDirection);float h=max(d.y,0.);vec3 c=mix(vec3(.84,.85,.76),vec3(.27,.49,.65),pow(h,.48));float s=max(dot(d,sun),0.);c+=vec3(1.,.71,.35)*pow(s,28.)*.28;c+=vec3(1.,.86,.55)*pow(s,900.)*.9;float streak=sin(d.x*19.+d.z*7.+sin(d.z*13.))*sin(d.z*22.-d.x*9.);c=mix(c,vec3(.91,.9,.82),smoothstep(.2,.75,streak)*smoothstep(.12,.3,h)*(1.-smoothstep(.3,.6,h))*.18);if(hasPhoto>.5){vec2 uv=vec2(atan(d.z,d.x)/6.2831853+.5,.53+h*.47);c=texture2D(photo,uv).rgb;c=mix(c,vec3(.64,.75,.75),pow(1.-h,18.)*.75);}gl_FragColor=vec4(c,1.);#include <tonemapping_fragment>\n#include <colorspace_fragment>}`.replace(';#include',';\n#include')});
  this.sky=new T.Mesh(new T.SphereGeometry(2200,32,20),mat);this.scene.add(this.sky);
  new T.TextureLoader().load(skyURL,texture=>{if(!this.live){texture.dispose();return;}texture.mapping=T.EquirectangularReflectionMapping;texture.colorSpace=T.SRGBColorSpace;this.dirty=true;this.skyTexture=texture;this.sky.material.uniforms.photo.value=texture;this.sky.material.uniforms.hasPhoto.value=1;this.scene.environment=texture;this.scene.environmentIntensity=.25;this.scene.environmentRotation.y=2.2;},undefined,()=>{});
 }
 makeTerrain(){
  const positions=[],colors=[],uv=[],indices=[],nx=150,nz=240;
  const rough=new T.Color('#748459'),fair=new T.Color('#417749'),green=new T.Color('#729452');
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
   const z=-190+j/nz*540,x=lerp(-230,coast(z),i/nx),edge=coast(z)-x;
   let y=height(x,z);const b=((x+24)/8)**2+((z-15)/10)**2;if(b<1)y-=1.2*(1-b);
   positions.push(x,y,z);uv.push(i/nx,j/nz);
   const fairCentre=-5+Math.sin(z*.023)*4,fw=12+Math.sin(z*.02)*3;
   const c=rough.clone();if(z>17&&z<260&&Math.abs(x-fairCentre)<fw)c.copy(fair).multiplyScalar(Math.floor(z/8)%2?1.025:.96);
   if((x/24)**2+(z/27)**2<1)c.copy(green);
   const noise=Math.sin(x*.47+z*.26)*Math.cos(z*.42-x*.21)*.07;c.multiplyScalar(1+noise);
   if(edge<2.3)c.lerp(new T.Color('#b1a374'),.6);colors.push(c.r,c.g,c.b);
  }
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+nx+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
  const land=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,map:grain(),roughness:1}));land.receiveShadow=true;this.scene.add(land);
  // Cliff layers are genuine geometry, with a continuous turf lip above them.
  const cp=[],cc=[],ci=[],cu=[],rock=new T.Color('#b2aea1');
  for(let j=0;j<=280;j++)for(let k=0;k<=8;k++){
   const z=-190+j/280*540,t=k/8,x=coast(z)+t*5+Math.sin(z*.7+k*2)*t*.8,y=lerp(height(coast(z),z)-.08,-4,t);
   cp.push(x,y,z);cu.push(z/18,t*.8);const c=rock.clone().multiplyScalar(.74+.18*Math.sin(z*1.2+k*.7)**2+.08*(k%2));cc.push(c.r,c.g,c.b);
   if(j<280&&k<8){const a=j*9+k,b=a+9;ci.push(a,a+1,b,b,a+1,b+1);}
  }
  const cg=new T.BufferGeometry();cg.setAttribute('position',new T.Float32BufferAttribute(cp,3));cg.setAttribute('color',new T.Float32BufferAttribute(cc,3));cg.setAttribute('uv',new T.Float32BufferAttribute(cu,2));cg.setIndex(ci);cg.computeVertexNormals();
  const loader=new T.TextureLoader(),rockMap=loader.load(rockURL),normalMap=loader.load(rockNormalURL);rockMap.colorSpace=T.SRGBColorSpace;for(const texture of [rockMap,normalMap]){texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy());}
  const cliff=new T.Mesh(cg,new T.MeshStandardMaterial({vertexColors:true,map:rockMap,normalMap,normalScale:new T.Vector2(.9,.9),roughness:1,side:T.DoubleSide}));cliff.receiveShadow=true;this.scene.add(cliff);
  this.oval(0,0,24.5,27.5,'#5b874c',.025);this.oval(0,0,23,26,'#6d9c54',.06,true);this.oval(-24,15,7.6,9.6,'#dbcfac',.08,false,true);
  this.oval(0,160,5,3.4,'#64914e',.035);
  for(const x of [-3,3]){const tee=new T.Mesh(new T.BoxGeometry(.38,.27,.32),standard('#eee7c8'));tee.position.set(x,height(x,160)+.15,160);tee.castShadow=true;this.scene.add(tee);}
 }
 oval(cx,cz,rx,rz,color,lift,stripe=false,bunker=false){
  const p=[],co=[],idx=[],r=24,n=128,base=new T.Color(color);
  for(let j=0;j<=r;j++)for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,t=j/r,shape=1+.035*Math.sin(3*a)+.025*Math.cos(a*5),x=cx+Math.cos(a)*rx*t*shape,z=cz+Math.sin(a)*rz*t*shape;
   p.push(x,height(x,z)+lift-(bunker?(1-t*t)*1.05:0),z);const c=base.clone().multiplyScalar(stripe?(Math.floor((x*.3+z)/5)%2?1.015:.97):1-.05*(1-t));co.push(c.r,c.g,c.b);
   if(j<r&&i<n){const k=j*(n+1)+i,b=k+n+1;idx.push(k,b,k+1,b,b+1,k+1);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('color',new T.Float32BufferAttribute(co,3));g.setIndex(idx);g.computeVertexNormals();const m=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide}));m.receiveShadow=true;this.scene.add(m);
 }
 makeSea(){
  this.waterTime={value:0};const mat=new T.ShaderMaterial({uniforms:{time:this.waterTime},vertexShader:'varying vec3 wp;void main(){wp=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}',fragmentShader:`uniform float time;varying vec3 wp;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
  void main(){vec2 p=wp.xz;float edge=28.+5.*sin((p.y+12.)*.031)+2.*sin(p.y*.093);float shore=max(0.,p.x-edge);float n=noise(p*.15+time*.02);float w=sin(p.x*.5+p.y*.73-time*.5+n*5.);float w2=sin(p.y*2.2-p.x*.8+time*.7);vec3 col=mix(vec3(.12,.43,.42),vec3(.095,.27,.32),smoothstep(1.,95.,shore));col+=pow(max(0.,w*w2),9.)*.1;float foam=(1.-smoothstep(3.,10.+n*3.,shore))*smoothstep(-.4,.8,sin(shore*1.3-time*.8+n*2.));col=mix(col,vec3(.78,.85,.78),foam*.75);float glint=pow(max(0.,w),35.)*pow(max(0.,w2),5.);col+=vec3(.7,.61,.36)*glint*.32;float fog=1.-exp(-pow(length(cameraPosition-wp)*.0022,2.));col=mix(col,vec3(.64,.75,.75),fog);gl_FragColor=vec4(col,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>}`});
  const sea=new T.Mesh(new T.PlaneGeometry(24000,24000),mat);sea.rotation.x=-Math.PI/2;sea.position.y=-2.5;this.scene.add(sea);
  // Distant headlands are atmospheric scenery, never play surfaces.
  for(let i=0;i<4;i++){const m=new T.Mesh(new T.SphereGeometry(1,32,12),standard(i%2?'#91a6a0':'#879d96'));m.position.set(80+i*150,-5,-440-i*100);m.scale.set(130,35+i*9,85);this.scene.add(m);}
 }
 makeDetails(){
  const r=seed(1717),o=new T.Object3D();
  const rocks=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),standard('#9b9482'),250);
  for(let i=0;i<250;i++){const z=-140+r()*420,x=coast(z)+5+r()*7,s=.3+r()*1.3;o.position.set(x,-2.4+r()*1.3,z);o.scale.set(s*1.4,s*.8,s);o.rotation.set(r()*2,r()*6,r()*2);o.updateMatrix();rocks.setMatrixAt(i,o.matrix);rocks.setColorAt(i,new T.Color().setHSL(.1,.08,.35+r()*.2));}rocks.castShadow=true;rocks.receiveShadow=true;this.scene.add(rocks);
  const blade=new T.BufferGeometry();blade.setAttribute('position',new T.Float32BufferAttribute([-.10,0,0,.10,0,0,.06,.8,.04,0,0,-.10,0,0,.10,.05,.65,.04],3));blade.computeVertexNormals();
  const grass=new T.InstancedMesh(blade,new T.MeshStandardMaterial({color:'#ffffff',side:T.DoubleSide,roughness:1}),6000);
  for(let i=0;i<6000;i++){
   let x,z;do{z=-80+r()*290;x=-75+r()*110;}while(x>coast(z)-.6||(x/27)**2+(z/30)**2<1||(z>20&&Math.abs(x+5-Math.sin(z*.023)*4)<17)||((x+24)/10)**2+((z-15)/12)**2<1);
   o.position.set(x,height(x,z),z);o.scale.setScalar(.23+r()*.6);o.rotation.set(0,r()*6,0);o.updateMatrix();grass.setMatrixAt(i,o.matrix);grass.setColorAt(i,new T.Color().setHSL(.19+r()*.035,.21,.30+r()*.15));
  }this.scene.add(grass);
  // Wind-shaped pines frame the inland edge, not a repeated wall of spheres.
  const trunks=new T.InstancedMesh(new T.CylinderGeometry(.15,.3,5,6),standard('#645f44'),55),crowns=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),standard('#3e5841'),165);
  for(let i=0;i<55;i++){const x=-51-r()*100,z=-145+r()*390,s=.65+r()*.75,y=height(x,z);o.position.set(x,y+2*s,z);o.scale.set(s,s,s);o.rotation.set(.13,0,-.13);o.updateMatrix();trunks.setMatrixAt(i,o.matrix);
   for(let j=0;j<3;j++){o.position.set(x+j*s*.8,y+(4.4+j*.6)*s,z+(j-1)*s);o.scale.set((2.5+j*.3)*s,(.9+j*.1)*s,2*s);o.rotation.set(.05,r()*2,.1);o.updateMatrix();crowns.setMatrixAt(i*3+j,o.matrix);crowns.setColorAt(i*3+j,new T.Color().setHSL(.27,.20,.19+r()*.06));}}
  trunks.castShadow=crowns.castShadow=true;this.scene.add(trunks,crowns);
  // A small stone lookout gives the headland a recognisable silhouette.
  const tower=new T.Group(),stone=standard('#c3bba3');const base=new T.Mesh(new T.CylinderGeometry(1.7,2.1,7.5,16),stone);base.position.y=3.75;tower.add(base);
  const roof=new T.Mesh(new T.ConeGeometry(2.3,1.7,16),standard('#445954'));roof.position.y=8.2;tower.add(roof);tower.position.set(-62,height(-62,-95),-95);tower.traverse(o=>{if(o.isMesh)o.castShadow=true;});this.scene.add(tower);
  const birds=[];for(let i=0;i<6;i++){const l=this.makeLine([V(-.7,0,.1),V(0,.17,0),V(.7,0,.1)],'#50615b',.6);l.position.set(38+i*7,21+i%3*2,-42+i*11);birds.push(l);this.scene.add(l);}this.birds=birds;
 }
 makeFlag(){
  const group=new T.Group();group.position.set(0,height(0,0)+.09,0);const pole=new T.Mesh(new T.CylinderGeometry(.045,.052,3.1,12),standard('#f4edda',.4));pole.position.y=1.55;pole.castShadow=true;group.add(pole);
  const hole=new T.Mesh(new T.CircleGeometry(.13,24),new T.MeshBasicMaterial({color:'#1b3023'}));hole.rotation.x=-Math.PI/2;hole.position.y=.015;group.add(hole);
  const geo=new T.PlaneGeometry(1.2,.65,16,6);geo.translate(.6,2.72,0);this.flag=new T.Mesh(geo,new T.MeshStandardMaterial({color:'#e9b956',roughness:.7,side:T.DoubleSide}));group.add(this.flag);this.scene.add(group);
  const target=new T.Mesh(new T.RingGeometry(3.9,4.03,100),new T.MeshBasicMaterial({color:'#eee8bf',side:T.DoubleSide,transparent:true,opacity:.7,depthWrite:false}));target.rotation.x=-Math.PI/2;target.position.set(0,height(0,0)+.12,0);this.scene.add(target);this.targetRing=target;
 }
 makeBall(){
  this.ball=new T.Mesh(new T.SphereGeometry(.19,24,16),standard('#fffef0',.32));this.ball.castShadow=true;this.scene.add(this.ball);this.ball.position.set(0,height(0,160)+.2,160);
  this.ballShadow=new T.Mesh(new T.CircleGeometry(.55,24),new T.MeshBasicMaterial({color:'#1d3726',transparent:true,opacity:.3,depthWrite:false}));this.ballShadow.rotation.x=-Math.PI/2;this.scene.add(this.ballShadow);
  this.ripple=new T.Mesh(new T.RingGeometry(.94,1,80),new T.MeshBasicMaterial({color:'#ffdc83',side:T.DoubleSide,transparent:true,opacity:0,depthWrite:false}));this.ripple.rotation.x=-Math.PI/2;this.scene.add(this.ripple);
 }
 makeLine(points,color,opacity=1,dashed=false){const material=dashed?new T.LineDashedMaterial({color,transparent:true,opacity,dashSize:2,gapSize:2}):new T.LineBasicMaterial({color,transparent:true,opacity});const line=new T.Line(new T.BufferGeometry().setFromPoints(points),material);if(dashed)line.computeLineDistances();return line;}
 clearLines(){dispose(this.lines);this.lines.clear();this.trace=null;this.pair=null;if(this.pairMarker){dispose(this.pairMarker);this.scene.remove(this.pairMarker);this.pairMarker=null;}}
 point(face,path,u){const p=shotPoint(face,path,u);const ground=p.x>coast(p.z)?-2:height(p.x,p.z);return V(p.x,lerp(height(0,160),ground,u)+p.y+.22,p.z);}
 makeFlight(face,path,color,opacity=1,radius=.11){this.dirty=true;const points=Array.from({length:121},(_,i)=>this.point(face,path,i/120));const curve=new T.CatmullRomCurve3(points);const tube=new T.Mesh(new T.TubeGeometry(curve,120,radius,6,false),new T.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false}));this.lines.add(tube);return tube;}
 setChallenge(challenge){
  if(this.gateGroup){dispose(this.gateGroup);this.scene.remove(this.gateGroup);this.gateGroup=null;}
  this.challenge=challenge;this.gatePoint=null;this.targetRing.scale.setScalar((challenge?.radius??4)/4);this.targetRing.material.color.set('#edcf87');this.targetRing.material.opacity=challenge ? .9 : .7;
  if(challenge?.gate){const [left,right]=challenge.gate,mid=(left+right)/2,y=this.point(0,0,.25).y,z=120;
   this.gateGroup=new T.Group();this.scene.add(this.gateGroup);const color='#83c9be';
   const frame=[V(left,y-3,z),V(left,y+3,z),V(right,y+3,z),V(right,y-3,z),V(left,y-3,z)];
   for(let i=1;i<frame.length;i++){const delta=frame[i].clone().sub(frame[i-1]),mesh=new T.Mesh(new T.CylinderGeometry(.065,.065,delta.length(),8),new T.MeshBasicMaterial({color}));mesh.position.copy(frame[i]).add(frame[i-1]).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(V(0,1,0),delta.normalize());this.gateGroup.add(mesh);}
   const pane=new T.Mesh(new T.PlaneGeometry(right-left,6),new T.MeshBasicMaterial({color,transparent:true,opacity:.13,side:T.DoubleSide,depthWrite:false}));pane.position.set(mid,y,z);this.gateGroup.add(pane);
   this.gateGroup.add(this.makeLine([V(mid,height(mid,z)+.2,z),V(mid,y-3,z)],color,.35,true));this.gatePoint=V(mid,y+4,z);
  }
  if(challenge&&this.mode==='decision')this.updateCamera();this.dirty=true;
 }
 markChallenge(result){this.targetRing.material.color.set(result.checks[1].pass?'#83c9be':'#edcf87');this.dirty=true;}
 setMode(mode,instant=false){this.mode=mode;this.playing=false;this.targetLine.visible=mode!=='hero';this.isOverview=false;this.updateCamera(instant);}
 updateCamera(instant=false){
  this.dirty=true;
  const mobile=this.host.clientWidth<640;let p,l;
  if(this.isOverview){p=V(0,240,84);l=V(0,8,80);}
  else if(this.mode==='hero'){p=mobile?V(85,71,146):V(81,34,116);l=V(1,9,15);}
  else if(this.mode==='decision'&&this.challenge?.gate){p=mobile?V(24,74,191):V(37,66,172);l=V(0,17,74);}
  else if(this.mode==='decision'){p=mobile?V(23,45,117):V(44,43,123);l=V(0,9,31);}
  else {const x=this.ball?.position.x??0;p=mobile?V(x*.6+31,53,63):V(x*.6+45,43,61);l=V(x*.7,10,9);}
  this.destination.copy(p);this.lookDestination.copy(l);if(instant||this.reduced){this.camera.position.copy(p);this.look.copy(l);this.camera.lookAt(l);}
 }
 prepare(face,path=0){this.face=face;this.path=path;this.clearLines();this.ball.position.set(0,height(0,160)+.2,160);this.ball.visible=true;this.ripple.material.opacity=0;this.setMode('decision');}
 compare(face,path,other){this.clearLines();this.face=face;this.path=path;this.makeFlight(face,path,'#ffdd8c');this.makeFlight(face,other,'#72d4d1',.8);this.mode='compare';this.playing=false;this.isOverview=true;this.ball.visible=false;this.updateCamera();}
 compareShots(original,changed){
  this.clearLines();this.face=changed.face;this.path=changed.path;
  const width=this.host.clientWidth<640?.65:.35;const before=this.makeFlight(original.face,original.path,'#ffdd8c',.95,width),after=this.makeFlight(changed.face,changed.path,'#72d4d1',1,width);
  this.pair={original,changed,before,after};this.pairMarker=new T.Mesh(new T.SphereGeometry(.55,12,12),new T.MeshBasicMaterial({color:'#ffdd8c'}));this.scene.add(this.pairMarker);
  this.playing=false;this.mode='compare';this.isOverview=true;this.landedAt=undefined;this.ripple.material.opacity=0;this.seekPair(1);this.updateCamera();
 }
 seekPair(value){if(!this.pair)return;const u=clamp(value,0,1),p=this.pair,count=u===1?Infinity:Math.floor(u*120)*36;p.before.geometry.setDrawRange(0,count);p.after.geometry.setDrawRange(0,count);this.pairMarker.position.copy(this.point(p.original.face,p.original.path,u));this.ball.position.copy(this.point(p.changed.face,p.changed.path,u));this.ball.visible=true;this.dirty=true;}
 preview(face,path,{overview=false,emphasis=false}={}){this.clearLines();this.face=face;this.path=path;this.makeFlight(face,path,'#ffdd8c',1,emphasis?(this.host.clientWidth<640?.65:.35):.11);if(overview)this.isOverview=true;this.ball.position.copy(this.point(face,path,1));this.ball.visible=true;this.mode='range';this.updateCamera();}
 shoot(face,path,{replay=false}={}){
  this.face=face;this.path=path;this.clearLines();this.trace=this.makeFlight(face,path,'#ffdf96');this.trace.geometry.setDrawRange(0,0);this.flightStart=this.clock;this.playing=true;this.mode='flight';this.isOverview=false;this.ball.visible=true;this.replay=replay;this.ripple.material.opacity=0;
  this.camera.position.set(-5,16,178);this.look.set(0,19,85);this.destination.copy(this.camera.position);this.lookDestination.copy(this.look);this.camera.lookAt(this.look);
  if(this.reduced)this.finish();
 }
 finish(){this.playing=false;this.mode='result';this.trace?.geometry.setDrawRange(0,Infinity);this.ball.position.copy(this.point(this.face,this.path,1));this.landedAt=this.clock;this.ripple.position.copy(this.ball.position);this.ripple.position.y-=.12;this.updateCamera(this.reduced);this.onProgress?.(1);this.onFinish?.({replay:this.replay,result:resultFor(this.face,this.path)});}
 skip(){if(this.playing)this.finish();}
 toggleView(){this.isOverview=!this.isOverview;this.updateCamera();return this.isOverview;}
 setReduced(value){this.reduced=value;if(value&&this.playing)this.finish();else this.updateCamera(value);}
 resize(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();if(!this.playing)this.updateCamera(true);}
 animate(){
  if(!this.live)return;this.frame=requestAnimationFrame(()=>this.animate());const now=performance.now(),dt=Math.min((now-this.last)/1000,.5);this.last=now;if(document.hidden||this.suspended||(this.reduced&&!this.dirty&&!this.playing))return;this.clock+=dt;
  if(!this.reduced){this.waterTime.value=this.clock;const a=this.flag.geometry.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i);a.setZ(i,Math.sin(x*5-this.clock*2)*.13*x);}a.needsUpdate=true;
   this.birds.forEach((b,i)=>{b.position.x=40+i*7+Math.sin(this.clock*.1+i)*5;b.rotation.z=Math.sin(this.clock*.4+i)*.09;});}
  if(this.playing){
   const elapsed=this.clock-this.flightStart,t=clamp(elapsed/4.1,0,1),u=clamp(t/.9,0,1);this.ball.position.copy(this.point(this.face,this.path,u));if(t>.9&&this.ball.position.x<=coast(0))this.ball.position.y+=Math.sin((t-.9)/.1*Math.PI)*.55;
   this.trace.geometry.setDrawRange(0,Math.max(0,Math.floor(u*120))*36);const c=T.MathUtils.smoothstep(t,.12,.87);this.destination.set(lerp(-5,35,c),lerp(16,44,c),lerp(178,53,c));this.lookDestination.set(lerp(0,this.ball.position.x*.5,c),lerp(24,10,c),lerp(75,4,c));this.onProgress?.(u);
   if(t>=1)this.finish();
  }
  if(this.landedAt!==undefined&&!this.reduced){const t=this.clock-this.landedAt;this.ripple.scale.setScalar(1+t*3);this.ripple.material.opacity=Math.max(0,1-t/2.5);}
  const speed=this.reduced?1:1-Math.exp(-dt*3.6);this.camera.position.lerp(this.destination,speed);this.look.lerp(this.lookDestination,speed);this.camera.lookAt(this.look);
  this.ballShadow.visible=this.ball.visible&&this.ball.position.x<=coast(this.ball.position.z);this.ballShadow.position.set(this.ball.position.x,height(this.ball.position.x,this.ball.position.z)+.1,this.ball.position.z);
  const project=point=>{const p=point.clone().project(this.camera);return {x:(p.x*.5+.5)*this.host.clientWidth,y:(-.5*p.y+.5)*this.host.clientHeight,visible:Math.abs(p.x)<.9&&Math.abs(p.y)<.78&&p.z<1};};
  this.host.dispatchEvent(new CustomEvent('shotproject',{detail:{pin:project(V(0,height(0,0)+3.5,0)),ball:project(this.ball.position),gate:this.gatePoint?project(this.gatePoint):null,target:this.challenge?project(V(0,height(0,0)+4,0)):null}}));
  this.renderer.render(this.scene,this.camera);this.dirty=false;
 }
 destroy(){this.live=false;cancelAnimationFrame(this.frame);this.observer.disconnect();this.renderer.domElement.removeEventListener('webglcontextlost',this.contextLost);dispose(this.scene);this.skyTexture?.dispose();this.renderer.dispose();this.renderer.domElement.remove();}
}
