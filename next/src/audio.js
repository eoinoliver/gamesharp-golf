export class GolfAudio {
 constructor(enabled=false){this.enabled=enabled;this.context=null;}
 unlock(){if(!this.enabled)return;try{this.context||=new (window.AudioContext||window.webkitAudioContext)();this.context.resume().catch(()=>{});}catch{}}
 play(kind){if(!this.enabled)return;this.unlock();const c=this.context;if(!c)return;const t=c.currentTime;
 if(kind==='strike'){const length=.12,b=c.createBuffer(1,c.sampleRate*length,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(c.sampleRate*.018));const n=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();n.buffer=b;f.type='highpass';f.frequency.value=1200;g.gain.value=.14;n.connect(f).connect(g).connect(c.destination);n.start(t);}
 else {const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(kind==='land'?120:520,t);o.frequency.exponentialRampToValueAtTime(kind==='land'?55:780,t+.12);g.gain.setValueAtTime(.045,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);o.connect(g).connect(c.destination);o.start(t);o.stop(t+.22);}}
}
