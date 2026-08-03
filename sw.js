// GameSharp Golf — service worker
// Makes the app open offline once visited (critical: golf courses have poor signal).
const CACHE = 'gamesharp-golf-v22';
const SHELL = ['./', './index.html', './manifest.json', './icon.svg', './laytown-hero.jpg', './baltray-hero.jpg', './play-a-hole-hero.jpg', './play-a-course-hero.jpg', './gamesharp-one-hole-v1.webp', './gamesharp-one-hole-v1.jpg'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const accept = req.headers.get('accept') || '';
  // HTML: network-first so deploys land, fall back to cached shell when offline.
  if (req.mode === 'navigate' || accept.includes('text/html')) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          // Only cache a genuinely good page — never store a 404/error as the shell.
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put('./index.html', copy));
            return res;
          }
          return caches.match('./index.html').then((cached) => cached || res);
        })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // Everything else (fonts, etc.): cache-first, runtime-cache on first fetch.
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});
