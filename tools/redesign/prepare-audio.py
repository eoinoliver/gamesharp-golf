from pathlib import Path
import subprocess
base=Path('next/src/audio-assets')
# Recorded sources only. Trims are contact-aligned; no generated impact or pitch substitution.
clips=[('iron','21877',.995,.7,1),('putt-1','408260',1.18,.38,.9),('putt-2','408260',3.83,.38,1.4),('putt-3','408260',6.10,.38,1),('cup','21878',.38,1.3,12),('wedge-1','349323',2.43,.65,36),('wedge-2','349323',11.56,.6,36),('sand','349323',13.24,.65,25),('grass','650976',.87,.75,.6),('sea','sea',0,40,.7)]
for name,source,start,duration,gain in clips:
 filters=f'atrim=start={start}:duration={duration},asetpts=PTS-STARTPTS,highpass=f=65,volume={gain},alimiter=limit=0.9:level=0,afade=t=out:st={duration-.08}:d=0.08'
 if name=='sea':filters='atrim=start=0:duration=40,asetpts=PTS-STARTPTS,highpass=f=80,lowpass=f=6500,volume=0.7,afade=t=in:d=1,afade=t=out:st=38.5:d=1.5'
 subprocess.run(['ffmpeg','-y','-v','error','-i',str(base/f'source-{source}.mp3'),'-af',filters,'-ar','44100','-ac','2','-c:a','libmp3lame','-b:a','128k',str(base/f'golf-{name}.mp3')],check=True)
