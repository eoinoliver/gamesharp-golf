import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import capture from './cmu-64-01.json';
import playerURL from './assets/golf-player.glb?url';
import {clubQuaternion} from './club.js';
import {MOTION} from '../shot-lab-model.js';
const v=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),Y=v(0,1,0);
const keys=[
 [135,[.10,-.89,.45]],[170,[-.72,-.58,.37]],[203,[-.60,.77,.21]],
 [240,[.63,.43,-.65]],[275,[.82,.15,-.55]],[306,[-.29,.91,.3]],
 [321,[-.94,.19,.27]],[334,[.08,-.89,.45]],[348,[.90,.36,.24]],
 [372,[.51,.6,-.62]],[405,[-.35,-.5,-.79]],[447,[-.5,-.4,-.76]],
];
export function authoredClubDirection(frame){
 let i=1;while(i<keys.length-1&&frame>keys[i][0])i++;
 const a=keys[i-1],b=keys[i],prev=keys[Math.max(0,i-2)],next=keys[Math.min(keys.length-1,i+1)];
 const t=T.MathUtils.clamp((frame-a[0])/(b[0]-a[0]),0,1),h=b[0]-a[0];
 return v(...a[1].map((value,j)=>(2*t**3-3*t*t+1)*value+(t**3-2*t*t+t)*h*(b[1][j]-prev[1][j])/(b[0]-prev[0]) +(-2*t**3+3*t*t)*b[1][j]+(t**3-t*t)*h*(next[1][j]-a[1][j])/(next[0]-a[0]))).normalize();
}
const rotationCache=new Map();
export function authoredClubRotation(frame,face){
 if(!rotationCache.has(face)){
  const transported=[];let previousDirection=authoredClubDirection(MOTION.start),q=clubQuaternion(previousDirection,face);
  for(let f=MOTION.start;f<=MOTION.end;f++){
   const direction=authoredClubDirection(f);q=new T.Quaternion().setFromUnitVectors(previousDirection,direction).multiply(q).normalize();transported.push(q.clone());previousDirection=direction;
  }
  const impactDirection=authoredClubDirection(MOTION.impact),wanted=clubQuaternion(impactDirection,face);
  const correction=wanted.multiply(transported[MOTION.impact-MOTION.start].clone().invert());
  let twist=2*Math.atan2(v(correction.x,correction.y,correction.z).dot(impactDirection),correction.w);if(twist>Math.PI)twist-=2*Math.PI;if(twist< -Math.PI)twist+=2*Math.PI;
  rotationCache.set(face,transported.map((rotation,i)=>{const t=T.MathUtils.clamp(i/(MOTION.impact-MOTION.start),0,1),ease=t*t*(3-2*t);return new T.Quaternion().setFromAxisAngle(authoredClubDirection(i+MOTION.start),twist*ease).multiply(rotation);}));
 }
 const rotations=rotationCache.get(face),f=T.MathUtils.clamp(frame-MOTION.start,0,rotations.length-1),a=Math.floor(f),b=Math.min(a+1,rotations.length-1);return rotations[a].clone().slerp(rotations[b],f-a);
}
export const loadGolfer=()=>new GLTFLoader().loadAsync(playerURL);
/** The club frame owns both grip anchors. Two-bone IK preserves the upper arm
 * and forearm lengths; capture elbows determine the bend plane, never a stretch. */
export function solveElbow(shoulder,wrist,pole,a=.30,b=.30){
 const axis=wrist.clone().sub(shoulder),distance=axis.length();axis.normalize();
 const d=T.MathUtils.clamp(distance,.025,a+b-.0001),along=(a*a-b*b+d*d)/(2*d),height=Math.sqrt(Math.max(0,a*a-along*along));
 const bend=pole.clone().sub(shoulder);bend.addScaledVector(axis,-bend.dot(axis));
 if(bend.lengthSq()<1e-8)bend.copy(v(0,0,-1)).addScaledVector(axis,axis.z);
 return shoulder.clone().addScaledVector(axis,along).addScaledVector(bend.normalize(),height);
}
export class Golfer{
 constructor(asset){
  this.group=asset.scene;this.bones={};this.rest={};this.joints={};this.group.updateMatrixWorld(true);
  this.group.traverse(o=>{
   if(o.isMesh){o.castShadow=true;o.receiveShadow=false;o.frustumCulled=false;}
   if(o.isBone){this.bones[o.name]=o;this.rest[o.name]={position:o.getWorldPosition(v()),q:o.getWorldQuaternion(new T.Quaternion())};}
  });
  this.pose(MOTION.start);
 }
 world(name,position,q){
  const bone=this.bones[name];if(!bone)return;
  bone.parent.updateWorldMatrix(true,false);
  if(position)bone.position.copy(bone.parent.worldToLocal(position.clone()));
  bone.quaternion.copy(bone.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(q));bone.updateWorldMatrix(false,true);
 }
 segment(name,child,from,to,normal){
  const rest=this.rest[name],base=this.rest[child].position.clone().sub(rest.position).normalize();
  const axis=to.clone().sub(from).normalize();let delta=new T.Quaternion().setFromUnitVectors(base,axis);
  if(normal){const restUp=Y.clone().addScaledVector(base,-Y.dot(base)).normalize(),up=normal.clone().addScaledVector(axis,-normal.dot(axis)).normalize();const r=new T.Matrix4().makeBasis(base,restUp,base.clone().cross(restUp));const goal=new T.Matrix4().makeBasis(axis,up,axis.clone().cross(up));delta.setFromRotationMatrix(goal.multiply(r.invert()));}
  this.world(name,from,delta.multiply(rest.q));
 }
 pose(frame){
  const lo=T.MathUtils.clamp(Math.floor(frame),0,capture.frames.length-1),hi=Math.min(lo+1,capture.frames.length-1),t=frame-lo;
  capture.joints.forEach((name,i)=>{this.joints[name]=v(...capture.frames[lo][i]).lerp(v(...capture.frames[hi][i]),t).add(v(0,.025,0));});
  const j=this.joints;this.grip=j.lhand.clone().add(j.rhand).multiplyScalar(.5);this.direction=authoredClubDirection(frame);
  const right=j.lclavicle.clone().sub(j.rclavicle).normalize(),up=j.lowerneck.clone().sub(j.root).normalize(),front=right.clone().cross(up).normalize();up.copy(front).cross(right).normalize();
  const torsoQ=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(right,up,front));
  const hipRight=j.lhipjoint.clone().sub(j.rhipjoint).normalize(),hipFront=hipRight.clone().cross(v(0,1,0)).normalize(),hipUp=hipFront.clone().cross(hipRight);
  const hipQ=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(hipRight,hipUp,hipFront));
  const hips=j.lhipjoint.clone().add(j.rhipjoint).multiplyScalar(.5).addScaledVector(up,.035);
  this.world('pelvis',hips,hipQ.clone().multiply(this.rest.pelvis.q));
  for(const [name,joint]of [['spine_01','lowerback'],['spine_02','upperback'],['spine_03','thorax']])this.world(name,null,torsoQ.clone().multiply(this.rest[name].q));
  const neckQ=new T.Quaternion().setFromAxisAngle(v(1,0,0),.12);
  this.world('neck_01',j.upperneck.clone().add(v(0,-.055,-.015)),neckQ.clone().multiply(this.rest.neck_01.q));
  this.world('Head',j.head.clone().add(v(0,-.065,-.035)),neckQ.clone().multiply(this.rest.Head.q));
  for(const s of ['l','r']){
   const ankle=j[s+'tibia'].clone();ankle.y=Math.max(.080,ankle.y);
   const toe=j[s+'toes'].clone();toe.y=Math.max(.025,toe.y);
   this.segment('thigh_'+s,'calf_'+s,j[s+'hipjoint'],j[s+'femur']);
   this.segment('calf_'+s,'foot_'+s,j[s+'femur'],ankle);
   this.segment('foot_'+s,'ball_'+s,ankle,toe);
   this.world('clavicle_'+s,j.lowerneck.clone().lerp(j[s+'clavicle'],.2),torsoQ.clone().multiply(this.rest['clavicle_'+s].q));
  }
 }
 placeHands(grip,dir,clubQ){
  grip=grip.clone();this.direction.copy(dir);
  const x=v(1,0,0).applyQuaternion(clubQ),z=v(0,0,1).applyQuaternion(clubQ);
  this.handAnchors={};this.wrists={};this.elbows={};const poses={};
  for(const s of ['l','r']){
   // Palm directions oppose around the handle; both wrists stay on the body side.
   const palm=x.clone().multiplyScalar(-.8).addScaledVector(z,s==='l'?-.6:.6).normalize();
   const sign=s==='l'?1:-1;const handX=palm.clone().multiplyScalar(.6).addScaledVector(dir,sign*.8);const handZ=dir.clone().multiplyScalar(.6).addScaledVector(palm,-sign*.8);const back=handZ.clone().cross(handX).normalize();
   const rotation=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(handX,back,handZ));
   const anchor=grip.clone().addScaledVector(dir,s==='l'?-.046:.046);
   const offset=v(sign*.095,-.035,-.005).applyQuaternion(rotation);
   poses[s]={rotation,back,offset,wristOffset:dir.clone().multiplyScalar(s==='l'?-.046:.046).sub(offset)};
  }
  // Project the shared grip into both arms' reachable volumes. The club and both
  // hands move together; we never lengthen a forearm to reach an authored shaft.
  for(let iteration=0;iteration<12;iteration++)for(const s of ['l','r']){
   const wrist=grip.clone().add(poses[s].wristOffset),shoulder=this.joints[s+'clavicle'],reach=wrist.clone().sub(shoulder),length=reach.length();
   if(length>.599)grip.addScaledVector(reach,(.599-length)/length);
  }
  this.grip.copy(grip);
  for(const s of ['l','r']){
   const {rotation,back,wristOffset}=poses[s],wrist=grip.clone().add(wristOffset),shoulder=this.joints[s+'clavicle'];
   const anchor=grip.clone().addScaledVector(dir,s==='l'?-.046:.046);
   const elbow=solveElbow(shoulder,wrist,this.joints[s+'humerus']);
   this.segment('upperarm_'+s,'lowerarm_'+s,shoulder,elbow,back);
   this.segment('lowerarm_'+s,'hand_'+s,elbow,wrist,back);
   this.world('hand_'+s,wrist,rotation.clone().multiply(this.rest['hand_'+s].q));
   this.handAnchors[s]=anchor;this.wrists[s]=wrist;this.elbows[s]=elbow;
  }
  this.group.updateMatrixWorld(true);
 }
}
