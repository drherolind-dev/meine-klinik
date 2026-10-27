const CACHE = "meine-klinik-v2";
const APP = "./index.html";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(["./", APP]))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys =>
        Promise.all(
          keys.filter(key => key !== CACHE)
            .map(key => caches.delete(key))
        )
      ),
      self.clients.claim()
    ])
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if(request.method !== "GET") return;
  if(new URL(request.url).origin !== self.location.origin) return;

  if(request.mode === "navigate") {
    event.respondWith(
      fetch(request).then(response => {
        if(response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache =>
            cache.put(request, copy)
          );
        }
        return response;
      }).catch(async () =>
        (await caches.match(request)) ||
        (await caches.match(APP))
      )
    );
  }
});
