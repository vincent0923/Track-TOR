// Service Worker for 推拉机 track-TOR PWA
const CACHE_NAME = "tracktor-pwa-v11";
const ASSETS = [
  "./",
  "./index.html",
  "./css/p1.css",
  "./js/hant.js",
  "./js/core.js",
  "./js/diet.js",
  "./js/confetti.js",
  "./js/sheetcore.js",
  "./js/backupcore.js",
  "./js/p1data.js",
  "./js/p1fx.js",
  "./js/p1stack.js",
  "./js/coros.js",
  "./js/engine.js",
  "./js/p1.js",
  "./js/p1settings.js",
  "./js/p1day.js",
  "./js/p1weather.js",
  "./js/p1music.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon.svg",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png",
  "./fonts/geist-wght.woff2",
  "./img/tex-0.webp",
  "./img/tex-1.webp",
  "./img/tex-2.webp",
  "./img/tex-3.webp",
  "./img/tex-4.webp",
  "./img/tex-5.webp",
  "./img/tex-6.webp"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;   // COROS and other sites go straight to the network
  // Network first for the page and its code; the cached copy
  // is used only when offline. Scripts and styles carry a ?v= stamp from tools/stamp.py, so a new page can't
  // pick up old ones; when a newly stamped copy is stored, the copies with older stamps are dropped.
  if (e.request.mode === "navigate" || /\.(html|js|css)$/.test(url.pathname) || url.pathname.endsWith("/")) {
    e.respondWith(
      fetch(e.request).then((resp) => {
        if (resp && resp.status === 200) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy).then(() => {
            if (!url.search) return;
            return cache.keys().then((keys) => Promise.all(keys.filter((k) => { const u = new URL(k.url); return u.pathname === url.pathname && u.search !== url.search; }).map((k) => cache.delete(k))));
          }));
        }
        return resp;
      }).catch(() => caches.match(e.request, { ignoreSearch: false }).then(cached => cached || caches.match(e.request, { ignoreSearch: true })).then(cached => cached || (e.request.mode === "navigate" ? caches.match("./index.html") : Response.error())))
    );
    return;
  }
  // Cache first for files that never change in place (app icons, fonts, manifest)
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).then((resp) => {
      if (resp && resp.status === 200) {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
      }
      return resp;
    }))
  );
});
