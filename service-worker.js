const CACHE_NAME = "v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js"
];

// Install SW & cache files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

// Serve files from cache
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
