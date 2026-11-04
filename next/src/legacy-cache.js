// Retire only the cache layer shipped by the previous Golf application.
// Game records live in localStorage and are deliberately untouched.
export const isLegacyGolfCache=name=>name==='gsg-v1'||/^gamesharp-golf-v\d+$/.test(name);
export async function retireLegacyGolfCache({serviceWorker,caches,origin}={}){
 try{
  if(serviceWorker){const registrations=await serviceWorker.getRegistrations();await Promise.all(registrations.map(async registration=>{
   const worker=registration.active||registration.waiting||registration.installing;if(!worker)return;
   let url;try{url=new URL(worker.scriptURL);}catch{return;}
   if(url.protocol==='blob:'&&url.origin===origin){await registration.unregister();return;}
   if(url.origin===origin&&url.pathname==='/sw.js'){
    // Fetch the retirement worker at the same URL. Its activation releases
    // existing tabs as well as the next navigation, without forcing a reload.
    try{await registration.update();}catch{await registration.unregister();}
   }
  }));}
  if(caches){const keys=await caches.keys();await Promise.all(keys.filter(isLegacyGolfCache).map(key=>caches.delete(key)));}
 }catch{/* Cache restrictions must never prevent the new app from opening. */}
}
