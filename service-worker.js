const CACHE_NAME = "welderskit-v5";
const CORE_ASSETS = [
  "./",
  "index.html",
  "style.css",
  "redirect.css",
  "script.js",
  "geo-search.js",
  "gsap.js",
  "gsap2.js",
  "login.html",
  "page.html",
  "customer.html",
  "calculator.html",
  "invoice.html",
  "invoice.css",
  "invoice.js",
  "kit.html",
  "kit.js",
  "ruler.html",
  "ruler.css",
  "ruler.js",
  "defector.html",
  "defector.css",
  "defector.js",
  "safety.html",
  "safety.css",
  "support.html",
  "article.html",
  "article.css",
  "article2.html",
  "article3.html",
  "article4.html",
  "article5.html",
  "articles_v2.css",
  "blog.html",
  "blog.css",
  "blog-article.html",
  "blog-article2.html",
  "blog-article3.html",
  "customer-blog.html",
  "switcher.js",
  "map.html",
  "pwa.js",
  "manifest.json",
  "img/icon-192.png",
  "img/icon-512.png"
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
