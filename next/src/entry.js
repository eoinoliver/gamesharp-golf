import {retireLegacyGolfCache} from './legacy-cache.js';
try { void retireLegacyGolfCache({serviceWorker:navigator.serviceWorker,caches:window.caches,origin:location.origin}); } catch {}

let leaving=false;
window.addEventListener('pagehide',()=>{leaving=true;});
async function mount(module){
 try{await module;}catch{
  // Rapid navigation may cancel a lazy module. A real loading failure should
  // offer a way back instead of leaving the golfer with an empty screen.
  if(leaving)return;
  const app=document.querySelector('#app');if(!app)return;
  app.innerHTML='<main style="max-width:560px;margin:15vh auto;padding:28px;color:#e8e8d7;background:#14251b;border-radius:18px;font:17px/1.6 system-ui"><p style="color:#dec580;letter-spacing:2px">GAMESHARP GOLF</p><h1>This view did not finish loading.</h1><p>Your saved progress is still in this browser. Reload to try again.</p><button id="reload-view" style="padding:14px 22px;border:0;border-radius:8px;background:#ddc17c;color:#172017;font:inherit;cursor:pointer">Reload this view</button></main>';
  document.querySelector('#reload-view').onclick=()=>location.reload();
 }
}
const query=new URLSearchParams(location.search);
if (query.has('play') || query.has('practice')) {
  void mount(import('./round.js'));
} else if (query.get('lesson') === 'shot-lab') {
  void mount(import('./shot-lab.js'));
} else if (query.get('view') === 'library') {
  void mount(import('./main.js'));
} else if (['shotmaker','memory','range','daily','book'].includes(query.get('mode'))) {
  void mount(import('./shotmaker.js'));
} else {
  void mount(import('./academy.js'));
}
