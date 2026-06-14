const CACHE_VERSION = "animatic-v1";

const PRECACHE_ASSETS = ["/img/logo-animatic.png", "/img/logo-privi.jpg"];

function isAnimaticAsset(pathname) {
  return (
    pathname.startsWith("/animatic/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/img/") ||
    pathname.startsWith("/fonts/")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      Promise.allSettled(PRECACHE_ASSETS.map((url) => cache.add(url))),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("animatic-") && key !== CACHE_VERSION)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const { pathname } = new URL(event.request.url);
  if (!isAnimaticAsset(pathname)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
    }),
  );
});
