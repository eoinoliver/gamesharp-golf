import {preferences,setPreference} from './preferences.js';
const assets=import.meta.glob('./audio-assets/golf-*.mp3',{eager:true,query:'?url',import:'default'});
const names={strike:['iron'],wedge:['wedge-1','wedge-2'],bunker:['wedge-1','wedge-2'],putt:['putt-1','putt-2','putt-3'],land:['grass'],sand:['sand'],cup:['cup']};
/** Real recorded contact and ambience. Audio is optional; diagrams carry every teaching cue. */
export class GolfAudio {
 constructor(){this.enabled=preferences().sound;this.context=null;this.buffers=new Map();this.pending=new Map();this.sources=new Set();this.counts={};this.coastal=false;this.epoch=0;}
 async load(name){
  if(this.buffers.has(name))return this.buffers.get(name);if(this.pending.has(name))return this.pending.get(name);
  const promise=(async()=>{try{const response=await fetch(assets[`./audio-assets/golf-${name}.mp3`]);if(!response.ok)throw new Error('Audio unavailable');const buffer=await this.context.decodeAudioData(await response.arrayBuffer());this.buffers.set(name,buffer);return buffer;}catch{return null;}finally{this.pending.delete(name);}})();this.pending.set(name,promise);return promise;
 }
 unlock(){
  if(!this.enabled)return;try{this.context||=new (window.AudioContext||window.webkitAudioContext)();if(!this.master){this.master=this.context.createGain();this.master.gain.value=.85;this.master.connect(this.context.destination);}void this.context.resume().then(()=>this.ambience()).catch(()=>{});Object.values(names).flat().forEach(name=>void this.load(name));}catch{}
 }
 toggle(){this.setEnabled(!this.enabled);return this.enabled;}
 setEnabled(value){this.enabled=!!value;setPreference('sound',this.enabled);if(this.enabled)this.unlock();else{this.stop();this.stopAmbience();}}
 setScene(coastal){this.coastal=coastal;this.coastal?void this.ambience():this.stopAmbience();}
 async ambience(){
  if(!this.coastal||!this.enabled||!this.context||this.context.state!=='running'||document.hidden||this.ambient||this.ambientPending)return;
  this.ambientPending=true;const buffer=await this.load('sea');this.ambientPending=false;
  if(!buffer||!this.coastal||!this.enabled||document.hidden||this.ambient)return;
  const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=buffer;source.loop=true;gain.gain.value=.055;source.connect(gain).connect(this.master);source.start();this.ambient=source;
 }
 stopAmbience(){try{this.ambient?.stop();}catch{}this.ambient=null;}
 async play(kind,{gain=1}={}){
  if(!this.enabled||!names[kind]||document.hidden)return;
  if(['strike','wedge','bunker','putt'].includes(kind))this.stop();
  this.unlock();if(!this.context)return;
  const variants=names[kind],index=this.counts[kind]||0;this.counts[kind]=index+1;const requested=performance.now(),epoch=this.epoch,buffer=await this.load(variants[index%variants.length]);
  // An uncached file must never produce a late strike on top of a different shot.
  if(!buffer||!this.enabled||epoch!==this.epoch||performance.now()-requested>220||document.hidden)return;
  const source=this.context.createBufferSource(),volume=this.context.createGain();source.buffer=buffer;volume.gain.value=gain*(kind==='land'?.35:kind==='cup'?.6:.7);source.connect(volume).connect(this.master);this.sources.add(source);source.onended=()=>{this.sources.delete(source);source.disconnect();volume.disconnect();};source.start();
 }
 stop(){this.epoch++;for(const source of this.sources){try{source.stop();}catch{}}this.sources.clear();}
 close(){this.stop();this.stopAmbience();void this.context?.close();}
}
export const golfAudio=new GolfAudio();
if(typeof document!=='undefined'){
 document.addEventListener('pointerdown',()=>golfAudio.unlock(),{passive:true,capture:true});
 document.addEventListener('keydown',()=>golfAudio.unlock(),{capture:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){golfAudio.stop();golfAudio.stopAmbience();void golfAudio.context?.suspend();}else if(golfAudio.enabled)golfAudio.unlock();});
 window.addEventListener('golf-preference',event=>{golfAudio.enabled=event.detail.sound;if(!golfAudio.enabled){golfAudio.stop();golfAudio.stopAmbience();}});
 window.addEventListener('pagehide',()=>{golfAudio.stop();golfAudio.stopAmbience();void golfAudio.context?.suspend();});
}
