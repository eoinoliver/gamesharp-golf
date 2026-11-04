"""Convert CMU ASF/AMC body motion to the Shot Lab's metre-scale joint positions.
Run with Blender's Python (mathutils), for example:
blender --background --python tools/build-golf-motion.py -- --source-dir /path/to/cmu --output next/src/motion/cmu-64-01.json

Inputs are CMU subject 64, take 01. Download them from mocap.cs.cmu.edu.
Do not infer a club or finger grip from this body-only dataset.
"""
import argparse
import hashlib
import json
import math
import sys
from pathlib import Path
from mathutils import Vector, Euler

parser = argparse.ArgumentParser()
parser.add_argument('--source-dir', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
asf = args.source_dir / '64.asf'
amc = args.source_dir / '64_01.amc'
# CMU length units are 1/0.45 inches: 0.0254/0.45 metres.
# Keep the rounded factor used for this motion study reproducible.
scale = .056444
bones = {}
text = asf.read_text()
for chunk in text.split(':bonedata')[1].split(':hierarchy')[0].split('begin')[1:]:
    data = {}
    for line in chunk.splitlines():
        parts = line.split()
        if parts and parts[0] in ('name', 'direction', 'length', 'axis', 'dof'):
            data[parts[0]] = parts[1:]
    bones[data['name'][0]] = {
        'direction': Vector(map(float, data['direction'])) * float(data['length'][0]) * scale,
        'axis': Euler([math.radians(float(v)) for v in data['axis'][:3]], 'XYZ').to_matrix(),
        'dof': data.get('dof', []),
    }
children = {}
for line in text.split(':hierarchy')[1].splitlines():
    parts = line.split()
    if len(parts) > 1:
        children[parts[0]] = parts[1:]
frames = []
frame = None
for line in amc.read_text().splitlines():
    parts = line.split()
    if not parts:
        continue
    if parts[0].isdigit():
        if frame is not None:
            frames.append(frame)
        frame = {}
    elif frame is not None:
        frame[parts[0]] = list(map(float, parts[1:]))
if frame:
    frames.append(frame)
out = []
for frame in frames:
    pos = {'root': Vector(frame['root'][:3]) * scale}
    rot = {'root': Euler([math.radians(x) for x in frame['root'][3:]], 'XYZ').to_matrix()}
    def visit(parent):
        for name in children.get(parent, []):
            bone = bones[name]
            angles = [0., 0., 0.]
            for channel, value in zip(bone['dof'], frame.get(name, [])):
                angles['xyz'.index(channel[1])] = math.radians(value)
            rot[name] = rot[parent] @ bone['axis'] @ Euler(angles, 'XYZ').to_matrix() @ bone['axis'].transposed()
            pos[name] = pos[parent] + rot[name] @ bone['direction']
            visit(name)
    visit('root')
    out.append(pos)
first = out[0]
origin = (first['ltibia'] + first['rtibia']) / 2
origin.y = min(first['ltoes'].y, first['rtoes'].y)
front = (first['lwrist'] + first['rwrist']) / 2 - origin
front.y = 0
front.normalize()
side = Vector((0, 1, 0)).cross(front)
def convert(value):
    point = value - origin
    return [round(point.dot(side), 5), round(point.y, 5), round(point.dot(front), 5)]
result = {'fps': 120, 'joints': list(first.keys()), 'frames': [[convert(p[name]) for name in first] for p in out]}
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(json.dumps(result, separators=(',', ':')))
print(f'Wrote {len(frames)} frames, {len(bones) + 1} joints to {args.output}')
for source in (asf, amc):
    print(f'{source.name} SHA256 {hashlib.sha256(source.read_bytes()).hexdigest()}')
