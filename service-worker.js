const CACHE_NAME = "welderskit-v1";
const CORE_ASSETS = [
  "/",                  // root page
  "/index.html",
  "/style.css",          
  "/script.js",          
  "/kit.html",           
  "/kit.js",             
  "/style.css",          
  "/style.css",          
  
];

// Install event: cache core assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS);
    })
    .then(() => self.skipWaiting())
  );
});

// Activate event: cleanup old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Fetch event: serve from cache first, then network fallback, and optionally cache new requests
self.addEventListener("fetch", event => {
  const request = event.request;
  // Only handle GET requests for our origin
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }
  
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then(networkResponse => {
        // Optionally cache the fetched response for dynamic assets
        return caches.open(CACHE_NAME).then(cache => {
          // You might want to exclude certain URLs (e.g., APIs) from being cached
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});
