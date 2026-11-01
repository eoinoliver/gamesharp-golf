import {retireLegacyGolfCache} from './legacy-cache.js';
try { void retireLegacyGolfCache({serviceWorker:navigator.serviceWorker,caches:window.caches,origin:location.origin}); } catch {}

if (new URLSearchParams(location.search).get('lesson') === 'shot-lab') {
  import('./shot-lab.js');
} else if (new URLSearchParams(location.search).get('view') === 'library') {
  import('./main.js');
} else {
  import('./shotmaker.js');
}
