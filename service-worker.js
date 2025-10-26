const CACHE_NAME = "welderskit-v1";
const CORE_ASSETS = [
  "/",                  // root page
  "/index.html",
  "/style.css",          // main stylesheet
  "/script.js",          // main script (assuming you renamed `app.js` to script.js or adjust accordingly)
  "/kit.html",           // a key page (if this is critical)
  "/kit.js",             // script for kit page
  "/style.css",          // already included, adjust duplicates
  "/style.css",          // remove duplicates
  // add any other immediately-visible assets like logo, hero-image, font files, etc
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
