// GameSharp Golf: retirement worker for the previous offline application.
// No fetch handler: all future requests use the normal network path.
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => {
 event.waitUntil((async () => {
  const names = await caches.keys();
  await Promise.all(names.filter(name => name === 'gsg-v1' || /^gamesharp-golf-v\d+$/.test(name)).map(name => caches.delete(name)));
  await self.clients.claim();
  await self.registration.unregister();
 })());
});
