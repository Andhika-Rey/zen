const CACHE_NAME = 'zenotika-cache-v3';
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './icon.svg',
  './manifest.json',
  './materials/program-dasar.html',
  './materials/asd.html',
  './materials/basis-data.html',
  './materials/web.html',
  './community.html'
];

const DYNAMIC_CACHE = 'zenotika-dynamic-v3';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => 
          (k !== CACHE_NAME && k !== DYNAMIC_CACHE) ? caches.delete(k) : Promise.resolve()
        )
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  
  const url = new URL(request.url);
  
  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;
  
  // Network-first strategy for JSON data (always fresh)
  if (request.url.includes('/data/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const respClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, respClone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }
  
  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(request).then((cached) =>
      cached || fetch(request).then((response) => {
        if (response.status === 200) {
          const respClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, respClone));
        }
        return response;
      }).catch(() => cached)
    )
  );
});
