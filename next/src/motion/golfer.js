import * as T from 'three';
import capture from './cmu-64-01.json';
import {MOTION} from '../shot-lab-model.js';
const v=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),Y=v(0,1,0);
const material=color=>new T.MeshStandardMaterial({color,roughness:.78});
const keys=[
 [135,[.24,-.81,.535]],[170,[-.7,-.6,.35]],[203,[-.55,.82,-.15]],
 [240,[.7,.25,-.65]],[275,[.8,.12,-.59]],[306,[-.3,.9,.3]],
 [321,[-.94,.2,.26]],[334,[.08,-.89,.45]],[348,[.91,.36,.2]],
 [372,[.5,.6,-.62]],[405,[-.35,-.5,-.79]],[447,[-.5,-.4,-.76]],
];
export function authoredClubDirection(frame){
 let a=keys[0],b=keys.at(-1);for(let i=1;i<keys.length;i++)if(frame<=keys[i][0]){a=keys[i-1];b=keys[i];break;}
 const t=T.MathUtils.clamp((frame-a[0])/(b[0]-a[0]),0,1),s=t*t*(3-2*t);
 return v(...a[1]).normalize().lerp(v(...b[1]).normalize(),s).normalize();
}
// CMU supplies the body. Hands and club are explicitly authored illustrations.
export class Golfer{
 constructor(){
  this.group=new T.Group();this.parts={};this.joints={};
  this.mat={shirt:material('#eee9d9'),pants:material('#183f34'),skin:material('#b47e5e'),shoe:material('#e9e8df'),sole:material('#24362d'),cap:material('#eadbb4'),belt:material('#65523d')};
  const sphere=new T.SphereGeometry(1,18,12),capsule=new T.CapsuleGeometry(1,1,6,12);
  const part=(name,geo,mat)=>{const m=new T.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;this.group.add(m);this.parts[name]=m;return m;};
  for(const side of ['l','r']){
   for(const [name,mat] of [['thigh','pants'],['shin','pants'],['upper','shirt'],['fore','skin']])part(side+name,capsule,this.mat[mat]);
   part(side+'hand',sphere,this.mat.skin);part(side+'shoe',sphere,this.mat.shoe);part(side+'sole',sphere,this.mat.sole);
   part(side+'knee',sphere,this.mat.pants);part(side+'elbow',sphere,this.mat.skin);
   part(side+'ear',sphere,this.mat.skin);
  }
  part('hips',sphere,this.mat.pants);part('torso',sphere,this.mat.shirt);part('neck',capsule,this.mat.skin);part('head',sphere,this.mat.skin);
  part('cap',sphere,this.mat.cap);part('brim',sphere,this.mat.cap);part('nose',sphere,this.mat.skin);part('collar',sphere,this.mat.shirt);
  this.pose(MOTION.start);
 }
 segment(name,a,b,r,depth=1){const m=this.parts[name],d=b.clone().sub(a);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(Y,d.clone().normalize());m.scale.set(r,Math.max(.001,d.length()/3),r*depth);}
 ellipsoid(name,pos,scale,q){const m=this.parts[name];m.position.copy(pos);m.scale.set(...scale);if(q)m.quaternion.copy(q);}
 pose(frame){
  const lo=Math.max(0,Math.min(capture.frames.length-1,Math.floor(frame))),hi=Math.min(lo+1,capture.frames.length-1),t=frame-lo;
  capture.joints.forEach((name,i)=>{this.joints[name]=v(...capture.frames[lo][i]).lerp(v(...capture.frames[hi][i]),t);this.joints[name].y+=.045;});
  const j=this.joints,grip=j.lhand.clone().add(j.rhand).multiplyScalar(.5),dir=authoredClubDirection(frame);
  this.grip=grip;this.direction=dir;
  // Stable two-hand grip; preserves capture elbows and labels the authored edit.
  const hands={l:grip.clone().addScaledVector(dir,-.042),r:grip.clone().addScaledVector(dir,.042)};
  for(const s of ['l','r']){
   this.segment(s+'thigh',j[s+'hipjoint'],j[s+'femur'],.082);
   this.segment(s+'shin',j[s+'femur'],j[s+'tibia'],.06);
   this.ellipsoid(s+'knee',j[s+'femur'],[.059,.063,.059]);
   this.ellipsoid(s+'elbow',j[s+'humerus'],[.042,.045,.042]);
   this.segment(s+'upper',j[s+'clavicle'],j[s+'humerus'],.069);
   this.segment(s+'fore',j[s+'humerus'],hands[s],.044);
   this.ellipsoid(s+'hand',hands[s],[.037,.052,.035]);
   const foot=j[s+'tibia'].clone().lerp(j[s+'toes'],.45);foot.y=Math.max(.045,foot.y);
   const fq=new T.Quaternion().setFromAxisAngle(Y,Math.atan2(j[s+'toes'].x-j[s+'tibia'].x,j[s+'toes'].z-j[s+'tibia'].z));
   this.ellipsoid(s+'shoe',foot,[.075,.052,.14],fq);
   this.ellipsoid(s+'sole',foot.clone().add(v(0,-.035,0)),[.079,.022,.143],fq);
  }
  const shoulders=j.lclavicle.clone().add(j.rclavicle).multiplyScalar(.5),hips=j.lhipjoint.clone().add(j.rhipjoint).multiplyScalar(.5);
  const up=shoulders.clone().sub(hips).normalize(),right=j.lclavicle.clone().sub(j.rclavicle).normalize(),front=right.clone().cross(up).normalize();
  up.copy(front).cross(right).normalize();
  const basis=new T.Matrix4().makeBasis(right,up,front),q=new T.Quaternion().setFromRotationMatrix(basis);
  this.ellipsoid('hips',hips.clone().lerp(j.lowerback,.25),[.175,.145,.12],q);
  this.ellipsoid('torso',hips.clone().lerp(shoulders,.55),[.205,shoulders.distanceTo(hips)*.65,.13],q);
  this.segment('neck',j.upperneck,j.head,.055);
  const head=j.head.clone().addScaledVector(up,-.015);
  this.ellipsoid('head',head,[.088,.12,.09],q);
  this.ellipsoid('cap',head.clone().addScaledVector(up,.075),[.096,.064,.102],q);
  this.ellipsoid('brim',head.clone().addScaledVector(up,.05).addScaledVector(front,.105),[.09,.013,.074],q);
  this.ellipsoid('nose',head.clone().addScaledVector(front,.084),[.019,.027,.023],q);
  this.ellipsoid('lear',head.clone().addScaledVector(right,.085),[.018,.032,.024],q);
  this.ellipsoid('rear',head.clone().addScaledVector(right,-.085),[.018,.032,.024],q);
  this.ellipsoid('collar',j.upperneck,[.085,.026,.072],q);
 }
 placeHands(grip,dir){
  this.grip=grip;this.direction=dir;
  for(const s of ['l','r']){
   const hand=grip.clone().addScaledVector(dir,s==='l'?-.042:.042);
   this.segment(s+'fore',this.joints[s+'humerus'],hand,.044);
   this.ellipsoid(s+'hand',hand,[.037,.052,.035]);
  }
 }
}
