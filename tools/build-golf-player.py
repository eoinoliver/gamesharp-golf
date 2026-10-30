"""Convert the CC0 Quaternius base into the self-contained Golf study character."""
import bpy, math, bmesh, argparse, sys
from mathutils import Vector, Matrix, Quaternion, kdtree
from pathlib import Path
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source-dir',required=True,help='Extracted Universal Base Characters[Standard] directory')
parser.add_argument('--output',default='next/src/motion/assets/golf-player.glb')
parser.add_argument('--blend-output',help='Optional editable Blender project')
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
source=Path(args.source_dir);output=Path(args.output).resolve();output.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(source/'Base Characters/Godot - UE/Superhero_Male_FullBody.gltf'))
rig=bpy.data.objects['Armature']; body=bpy.data.objects['SuperHero_Male']
for o in list(bpy.context.scene.objects):
 if o.name not in ['Armature','SuperHero_Male','Eyes','Eyebrows']: bpy.data.objects.remove(o,do_unlink=True)
def mat(name,color,rough=.7,metal=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal;return m
skin=mat('Skin',(.57,.33,.20));polo=mat('Ivory cotton polo',(.86,.84,.73),.94);pants=mat('Deep navy trousers',(.032,.064,.076),.85);shoe=mat('Ivory leather shoes',(.79,.79,.71),.54);sole=mat('Shoe outsole',(.13,.18,.17),.78);glove=mat('Left leather glove',(.90,.91,.84),.65);gold=mat('Champagne embroidery',(.55,.41,.18),.64);trim=mat('Forest trim',(.035,.115,.088));black=mat('Belt leather',(.06,.065,.05));hair=mat('Dark brows',(.055,.032,.021))
# Flat skin removes the baked superhero muscle normal map. The base topology is retained.
body.data.materials.clear()
for m in [skin,polo,pants,shoe,sole,glove]:body.data.materials.append(m)
# Geometric cuts put cuffs, neck and hems on real edges.
bm=bmesh.new();bm.from_mesh(body.data)
for axis,value in [(2,.14),(2,1.035),(2,1.50),(0,.075),(0,-.075),(0,.355),(0,-.355)]:
 co=[0,0,0];co[axis]=value;normal=[0,0,0];normal[axis]=1
 bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.00001,plane_co=co,plane_no=normal)
bm.to_mesh(body.data);bm.free();body.data.update()
for p in body.data.polygons:
 pts=[body.data.vertices[i].co for i in p.vertices];x,y,z=sum(pts,Vector())/len(pts)
 if z<.14:p.material_index=3
 elif z<1.035:p.material_index=2
 elif abs(x)<.355 and (z<1.54 or (abs(x)>.070 and z<1.60)):p.material_index=1
 elif x>.708:p.material_index=5
 else:p.material_index=0
 p.use_smooth=True
# Relax clothing and bring the abdominal contour out into a hanging polo silhouette.
cloth=body.vertex_groups.new(name='Cloth smoothing')
clothids=set()
for p in body.data.polygons:
 if p.material_index in [1,2,3,4]:clothids.update(p.vertices)
cloth.add(list(clothids),1,'REPLACE')
sm=body.modifiers.new('Tailored cloth surface','SMOOTH');sm.factor=.35;sm.iterations=4;sm.vertex_group=cloth.name
bpy.context.view_layer.objects.active=body;bpy.ops.object.modifier_apply(modifier=sm.name)
for v in body.data.vertices:
 x,y,z=v.co
 if 1.04<z<1.37 and abs(x)<.23:
  # Fill the waist; maintain a smooth side silhouette rather than painted-on muscles.
  widen=1+.11*math.sin((z-1.04)/.33*math.pi)
  v.co.x*=widen
  v.co.y=.015+(y-.015)*1.09
 if .17<z<.9:
  cx=.1143 if x>0 else -.1143
  v.co.x=cx+(x-cx)*1.08;v.co.y=.045+(y-.045)*1.06
# Slim the body consistently without breaking weights.
for o in [body,bpy.data.objects['Eyes'],bpy.data.objects['Eyebrows']]:
 for v in o.data.vertices:v.co.x*=.93
bpy.context.view_layer.objects.active=rig;bpy.ops.object.mode_set(mode='EDIT')
for b in rig.data.edit_bones:b.head.x*=.93;b.tail.x*=.93
bpy.ops.object.mode_set(mode='OBJECT')
# Match the bind mesh to the retarget rig's arm lengths. Moving a wrist without
# changing the source arm proportions stretches a tiny skinning transition.
shoulder=.212*.93;elbow=.463*.93;wrist=.706487*.93
def arm_x(x):
 sign=1 if x>=0 else -1;a=abs(x)
 if a<=shoulder:return x
 if a<=elbow:return sign*(shoulder+(a-shoulder)*.3/(elbow-shoulder))
 if a<=wrist:return sign*(shoulder+.3+(a-elbow)*.3/(wrist-elbow))
 return sign*(shoulder+.6+a-wrist)
for vertex in body.data.vertices:vertex.co.x=arm_x(vertex.co.x)
bpy.context.view_layer.objects.active=rig;bpy.ops.object.mode_set(mode='EDIT')
for bone in rig.data.edit_bones:bone.head.x=arm_x(bone.head.x);bone.tail.x=arm_x(bone.tail.x)
bpy.ops.object.mode_set(mode='OBJECT')
# Remove broken image nodes in the original eyebrows; keep the small eye texture.
bpy.data.objects['Eyebrows'].data.materials.clear();bpy.data.objects['Eyebrows'].data.materials.append(hair)
for m in bpy.data.objects['Eyes'].data.materials:
 for n in list(m.node_tree.nodes):
  if n.type=='TEX_IMAGE' and (not n.image or n.image.name.startswith('T_Eye_Normal')):m.node_tree.nodes.remove(n)
# Cloth details inherit the weights of the nearby fabric.
bodytree=kdtree.KDTree(len(body.data.vertices))
for i,v in enumerate(body.data.vertices):bodytree.insert(v.co,i)
bodytree.balance()
bodyweights=[[(body.vertex_groups[g.group].name,g.weight) for g in v.groups if body.vertex_groups[g.group].name in rig.data.bones] for v in body.data.vertices]
def cloth_weights(obj):
 obj.vertex_groups.clear()
 for v in obj.data.vertices:
  co,index,d=bodytree.find(v.co)
  for name,weight in bodyweights[index]:
   group=obj.vertex_groups.get(name) or obj.vertex_groups.new(name=name);group.add([v.index],weight,'REPLACE')
# Custom details follow the same armature, using explicit single-bone weights.
def bind(obj,bone,material):
 obj.data.materials.clear();obj.data.materials.append(material)
 for p in obj.data.polygons:p.use_smooth=True
 g=obj.vertex_groups.new(name=bone);g.add(list(range(len(obj.data.vertices))),1,'REPLACE');mod=obj.modifiers.new('Golfer skeleton','ARMATURE');mod.object=rig
 obj.parent=rig
 return obj
def mesh(name,verts,faces,bone,material):
 me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);return bind(o,bone,material)
def cube(name,pos,scale,bone,material,bevel=.002):
 bpy.ops.mesh.primitive_cube_add(size=1,location=pos);o=bpy.context.object;o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  b=o.modifiers.new('Soft tailoring','BEVEL');b.width=bevel;b.segments=3;bpy.ops.object.modifier_apply(modifier=b.name)
 # Convert vertices to armature space.
 for v in o.data.vertices:v.co=o.matrix_world@v.co
 o.matrix_world=Matrix.Identity(4);return bind(o,bone,material)
# Tailor the existing continuous leg mesh into trousers; retain its original
# weights across the hip rather than attaching separate open cylinders.
profile=[(.14,.046,.052),(.19,.049,.055),(.30,.053,.059),(.43,.058,.064),(.53,.060,.065),(.61,.069,.077),(.77,.082,.087),(.89,.086,.092)]
for vert in body.data.vertices:
 x,y,z=vert.co
 if .14<z<.89:
  sgn=1 if x>0 else -1;angle=math.atan2((y-.045),x-sgn*.1063)
  n=next((i for i in range(1,len(profile)) if z<profile[i][0]),len(profile)-1);aa=profile[n-1];bb=profile[n];t=(z-aa[0])/(bb[0]-aa[0]);rx=aa[1]*(1-t)+bb[1]*t;ry=aa[2]*(1-t)+bb[2]*t
  blend=min(1,(.89-z)/.065);vert.co.x=x*(1-blend)+(sgn*.1063+rx*math.cos(angle))*blend;vert.co.y=y*(1-blend)+(.045+ry*math.sin(angle))*blend
for side,sgn in [('l',1),('r',-1)]:
 # Golf shoes with a shaped toe, heel, and contrasting rubber welt.
 for label,z,rx,ry,rz,ma in [('Leather upper',.068,.065,.145,.060,shoe),('Rubber welt',.025,.069,.148,.023,sole),('White midsole',.038,.069,.147,.013,polo)]:
  bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=16);o=bpy.context.object;o.name=label+' '+side
  for vv0 in o.data.vertices:
   u=vv0.co.copy();vv0.co=(sgn*.1063+u.x*rx*(1-.12*max(0,u.y)),.012+u.y*ry,max(.007,z+u.z*rz))
  bind(o,'foot_'+side,ma)
# Remove the covered bare feet, and the lower legs hidden by trousers.
bm=bmesh.new();bm.from_mesh(body.data)
bmesh.ops.delete(bm,geom=[f for f in bm.faces if f.calc_center_median().z<.14],context='FACES')
bm.to_mesh(body.data);bm.free()
# Folded collar two actual fabric pieces.
for s in [-1,1]:
 vv=[(s*.015,-.063,1.52),(s*.069,-.041,1.528),(s*.114,-.075,1.465),(s*.052,-.129,1.444)]
 o=mesh('Polo collar',vv,[(0,1,2,3)],'spine_03',polo);cloth_weights(o);so=o.modifiers.new('Fabric thickness','SOLIDIFY');so.thickness=.003
# Belt with curved waistband.
verts=[];faces=[]
for i in range(65):
 a=i/64*2*math.pi
 for z in [1.022,1.052]:verts.append((.167*math.cos(a),.016+.113*math.sin(a),z))
for i in range(64):faces.append((2*i,2*i+1,2*i+3,2*i+2))
mesh('Leather belt',verts,faces,'pelvis',black);cube('Brushed buckle',(0,-.101,1.038),(.035,.008,.026),'pelvis',gold)
# Six-panel cap: continuous crown and stitched brim.
verts=[];faces=[]
for j in range(13):
 a=.02+(math.pi/2-.02)*j/12
 for i in range(49):
  t=2*math.pi*i/48;verts.append((.104*math.sin(a)*math.cos(t),.017+.112*math.sin(a)*math.sin(t),1.746+.087*math.cos(a)))
for j in range(12):
 for i in range(48):a=j*49+i;faces.append((a,a+1,a+50,a+49))
mesh('Forest cap crown',verts,faces,'Head',trim)
verts=[]
for j in range(2):
 for i in range(33):
  a=math.pi*i/32;verts.append((.095*math.cos(a),-.022-(.16 if j else .065)*math.sin(a),1.745-.012*math.sin(a)*(j+1)))
mesh('Curved cap peak',verts,[(i,i+1,i+34,i+33) for i in range(32)],'Head',trim)
cube('Cap badge',(0,-.091,1.775),(.032,.004,.012),'Head',gold,.002)
# Shoe uppers cover toes; small lace strips make the silhouette intentional.
for s in [-1,1]:
 for y in [-.018,-.039,-.060]:cube('Shoe laces',(s*.106,y,.105),(.066,.006,.005),'foot_'+('l' if s>0 else 'r'),polo,.002)
# Pose all finger phalanges around one 28 mm grip. Directions are in the armature
# rest frame; this pose is then rigidly carried by the hand during retargeting.
bpy.context.view_layer.update()
for side,sgn in [('l',1),('r',-1)]:
 wrist=rig.pose.bones['hand_'+side].head.copy()
 center=wrist+Vector((sgn*.095,.005,-.035));axis=Vector((sgn*.8,-.6,0));radius=.023
 for finger in ['index','middle','ring','pinky']:
  root=rig.pose.bones[f'{finger}_01_{side}'].head.copy()
  centerline=center+axis*(root-center).dot(axis);radial=root-centerline
  for k in range(1,4):
   bone=rig.pose.bones[f'{finger}_{k:02}_{side}'];rest=rig.data.bones[bone.name].matrix_local;length=bone.length
   radius0=radial.length;cosine=max(-.999,min(.999,(radius0*radius0+radius*radius-length*length)/(2*radius0*radius)))
   radial=Quaternion(axis,-sgn*math.acos(cosine))@radial.normalized()*radius
   targetpoint=centerline+radial
   direction=(targetpoint-bone.head).normalized();delta=(rest.to_3x3()@Vector((0,1,0))).rotation_difference(direction)
   target=delta.to_matrix().to_4x4()@rest;target.translation=bone.head.copy();bone.matrix=target;bpy.context.view_layer.update()
 # Fit the thumb to the front of the same shaft with fixed phalanx lengths.
 thumb=[rig.pose.bones[f'thumb_{k:02}_{side}'] for k in range(1,4)];start=thumb[0].head.copy();goal=center+axis*.035+Vector((0,0,.021));lengths=[b.length for b in thumb]
 points=[start]+[start.lerp(goal,t)+Vector((0,-.009,.004))*math.sin(math.pi*t) for t in [.35,.68,1]]
 for iteration in range(25):
  points[3]=goal.copy()
  for k in range(2,-1,-1):points[k]=points[k+1]+(points[k]-points[k+1]).normalized()*lengths[k]
  points[0]=start.copy()
  for k in range(3):points[k+1]=points[k]+(points[k+1]-points[k]).normalized()*lengths[k]
 for k,bone in enumerate(thumb):
  rest=rig.data.bones[bone.name].matrix_local;direction=(points[k+1]-bone.head).normalized();delta=(rest.to_3x3()@Vector((0,1,0))).rotation_difference(direction);target=delta.to_matrix().to_4x4()@rest;target.translation=bone.head.copy();bone.matrix=target;bpy.context.view_layer.update()
# Bake the closed hands into both the rest mesh and bind skeleton. glTF's
# no-animation exporter otherwise writes the original open-hand rest pose.
for o in list(bpy.context.scene.objects):
 if o.type=='MESH':
  bpy.context.view_layer.objects.active=o
  for mod in list(o.modifiers):
   if mod.type=='ARMATURE':bpy.ops.object.modifier_apply(modifier=mod.name)
bpy.context.view_layer.objects.active=rig;bpy.ops.object.mode_set(mode='POSE');bpy.ops.pose.armature_apply(selected=False);bpy.ops.object.mode_set(mode='OBJECT')
for o in bpy.context.scene.objects:
 if o.type=='MESH':mod=o.modifiers.new('Golfer skeleton','ARMATURE');mod.object=rig
# Imported split normals describe the unclothed source. Recompute after tailoring.
for o in bpy.context.scene.objects:
 if o.type=='MESH':
  bpy.context.view_layer.objects.active=o
  try:bpy.ops.mesh.customdata_custom_splitnormals_clear()
  except:pass
  for p in o.data.polygons:p.use_smooth=True
  for edge in o.data.edges:edge.use_edge_sharp=False
# One subdivision pass gives the fingers and fabric continuous highlights.
bpy.context.view_layer.objects.active=body
sub=body.modifiers.new('Presentation surface','SUBSURF');sub.levels=1;sub.render_levels=1
bpy.ops.object.modifier_move_up(modifier=sub.name)
bpy.ops.object.modifier_apply(modifier=sub.name)
# Export only the approved character. No original asset pack enters the app.
for o in bpy.context.scene.objects:o.select_set(o.type in ['MESH','ARMATURE'])
bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.gltf(filepath=str(output),export_format='GLB',use_selection=True,export_animations=False,export_apply=False,export_image_format='WEBP',export_image_quality=85,export_extras=True)
if args.blend_output:bpy.ops.wm.save_as_mainfile(filepath=str(Path(args.blend_output).resolve()))
print('EXPORTED',output)
