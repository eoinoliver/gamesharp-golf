import * as T from 'three';
const v=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const addressDir=v(.08,-.89,.45).normalize(),addressX=v(1,0,0).addScaledVector(addressDir,-addressDir.x).normalize();
const addressQ=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(addressX,addressDir,addressX.clone().cross(addressDir)));
const headRotation=addressQ.clone().invert(),loftRotation=new T.Quaternion().setFromAxisAngle(v(0,0,1),.38);
export const FACE_NORMAL_LOCAL=v(1,0,0).applyQuaternion(loftRotation).applyQuaternion(headRotation);
export const FACE_CENTER_LOCAL=v(.001,-.012,0).applyQuaternion(loftRotation).add(v(-.004,.028,.040)).applyQuaternion(headRotation).add(v(0,1,0));
export const BALL_CONTACT_LOCAL=FACE_CENTER_LOCAL.clone().addScaledVector(FACE_NORMAL_LOCAL,.027);
const mat=(color,roughness=.3,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
/** One rigid object. Local +Y runs from the grip towards the hosel. */
export function createClub(){
 const club=new T.Group();club.name='Rigid iron and grip';
 const chrome=mat('#b8c5cc',.21,.92),steel=mat('#8c9da6',.32,.84),faceMat=mat('#d2d9d9',.34,.78),rubber=mat('#182723',.92),edge=mat('#85928b',.75);
 const add=(geo,m,pos)=>{const mesh=new T.Mesh(geo,m);if(pos)mesh.position.copy(pos);mesh.castShadow=true;mesh.receiveShadow=true;club.add(mesh);return mesh;};
 add(new T.CylinderGeometry(.007,.0048,.91,20),chrome,v(0,.46,0));
 add(new T.CylinderGeometry(.0142,.0116,.255,24),rubber,v(0,.025,0));
 add(new T.CylinderGeometry(.0148,.0148,.005,24),edge,v(0,-.105,0));
 // Fine recessed-looking diagonal grip pattern and two alignment bands.
 for(let i=0;i<28;i++){
  const ring=add(new T.TorusGeometry(.01355-i*.00007,.00065,4,24),edge,v(0,-.089+i*.008,0));ring.rotation.x=Math.PI/2+.16;
 }
 for(const y of [-.07,.115]){const r=add(new T.TorusGeometry(y<0?.014:.012,.0009,6,24),mat('#c9b47f',.66),v(0,y,0));r.rotation.x=Math.PI/2;}
 const ferrule=add(new T.CylinderGeometry(.010,.009,.036,16),rubber,v(0,.926,0));
 add(new T.CylinderGeometry(.0105,.0105,.055,18),chrome,v(0,.963,0));
 // Head is modelled in address space, then baked into the shaft's local frame.
 const addressDir=v(.08,-.89,.45).normalize(),ax=v(1,0,0).addScaledVector(addressDir,-addressDir.x).normalize(),az=ax.clone().cross(addressDir).normalize();
 const addressQ=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(ax,addressDir,az)),inverse=addressQ.clone().invert();
 const head=new T.Group();head.position.set(0,1,0);head.quaternion.copy(inverse);club.add(head);
 const core=new T.Group();core.position.set(-.004,.028,.040);core.rotation.z=.38;head.add(core);
 const outline=()=>{const s=new T.Shape();s.moveTo(-.043,-.025);s.quadraticCurveTo(-.052,-.022,-.051,-.011);s.lineTo(-.050,.005);s.quadraticCurveTo(-.049,.012,-.039,.015);s.lineTo(.031,.031);s.quadraticCurveTo(.050,.034,.053,.018);s.lineTo(.053,-.012);s.quadraticCurveTo(.052,-.027,.037,-.027);s.closePath();return s;};
 const geo=new T.ExtrudeGeometry(outline(),{depth:.018,bevelEnabled:true,bevelThickness:.0025,bevelSize:.0025,bevelSegments:4,steps:1,curveSegments:12});
 // Extrusion points towards the target; outline x becomes heel-to-toe z.
 geo.applyMatrix4(new T.Matrix4().set(0,0,1,-.020,0,1,0,0,1,0,0,0,0,0,0,1));
 core.add(new T.Mesh(geo,chrome));
 const faceGeo=new T.ShapeGeometry(outline(),12);faceGeo.scale(.93,.89,1);faceGeo.applyMatrix4(new T.Matrix4().set(0,0,1,.001,0,1,0,0,1,0,0,0,0,0,0,1));
 const face=new T.Mesh(faceGeo,faceMat);face.name='Striking face';face.material.side=T.DoubleSide;core.add(face);
 for(let i=0;i<7;i++){
  const groove=new T.Mesh(new T.BoxGeometry(.0012,.00075,.073-i*.004),mat('#667880',.45,.5));groove.position.set(.0018,-.016+i*.005,i*.002);core.add(groove);
 }
 const cavity=new T.Mesh(new T.BoxGeometry(.004,.024,.065),mat('#244139',.5,.6));cavity.position.set(-.024,.001,.004);core.add(cavity);
 const badge=new T.Mesh(new T.BoxGeometry(.002,.004,.019),mat('#d1b87c',.45,.6));badge.position.set(-.027,.001,.004);core.add(badge);
 head.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 return club;
}
export function clubQuaternion(direction,faceDegrees=0){
 const angle=faceDegrees*Math.PI/180,face=v(Math.cos(angle),0,Math.sin(angle));
 const x=face.clone().addScaledVector(direction,-face.dot(direction)).normalize(),z=x.clone().cross(direction).normalize();
 const base=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(x,direction,z));
 const blend=T.MathUtils.smoothstep(-direction.y,.35,.70);if(!blend)return base;
 // Solve face loft around the shaft while preserving the iron's rigid lie angle.
 // At address/impact its horizontal face bearing exactly matches the lesson.
 const k=FACE_NORMAL_LOCAL.y,a=direction.dot(face),b=direction.y,r=Math.hypot(a,b);
 if(r<Math.abs(k))return base;
 const loft=Math.atan2(b,a)+Math.acos(T.MathUtils.clamp(k/r,-1,1));
 const normal=face.multiplyScalar(Math.cos(loft)).add(v(0,Math.sin(loft),0));
 const localX=FACE_NORMAL_LOCAL.clone().add(v(0,-k,0)).normalize(),worldX=normal.addScaledVector(direction,-k).normalize();
 const local=new T.Matrix4().makeBasis(localX,v(0,1,0),localX.clone().cross(v(0,1,0)));
 const world=new T.Matrix4().makeBasis(worldX,direction,worldX.clone().cross(direction));
 const exact=new T.Quaternion().setFromRotationMatrix(world.multiply(local.invert()));return base.slerp(exact,blend);
}
