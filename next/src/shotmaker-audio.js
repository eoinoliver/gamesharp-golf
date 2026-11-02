import {GolfAudio} from './audio.js';

/** Quiet synthesised coastal ambience; starts only after the sound button. */
export class ShotmakerAudio extends GolfAudio {
 toggle(){this.enabled=!this.enabled;this.unlock();if(!this.context)return this.enabled;
  const c=this.context;
  if(!this.ambient){
   const buffer=c.createBuffer(1,c.sampleRate*6,c.sampleRate),data=buffer.getChannelData(0);let last=0;
   for(let i=0;i<data.length;i++){last=.985*last+.015*(Math.random()*2-1);data[i]=last*3;}
   this.ambient=c.createBufferSource();this.ambient.buffer=buffer;this.ambient.loop=true;
   const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=850;this.ambientGain=c.createGain();this.ambientGain.gain.value=0;
   this.ambient.connect(filter).connect(this.ambientGain).connect(c.destination);this.ambient.start();
   this.birdTimer=setInterval(()=>{if(this.enabled&&!document.hidden)this.bird();},9700);
  }
  this.ambientGain.gain.setTargetAtTime(this.enabled?.12:0,c.currentTime,.6);return this.enabled;
 }
 bird(){const c=this.context,t=c.currentTime;for(let i=0;i<2;i++){const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(1100+i*140,t+i*.23);o.frequency.exponentialRampToValueAtTime(1800,t+i*.23+.06);o.frequency.exponentialRampToValueAtTime(950,t+i*.23+.17);g.gain.setValueAtTime(0,t+i*.23);g.gain.linearRampToValueAtTime(.008,t+i*.23+.025);g.gain.exponentialRampToValueAtTime(.0001,t+i*.23+.2);o.connect(g).connect(c.destination);o.start(t+i*.23);o.stop(t+i*.23+.21);}}
 close(){clearInterval(this.birdTimer);this.ambient?.stop();this.context?.close();}
}
