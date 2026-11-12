// Service Worker for 推拉机 track-TOR PWA
const CACHE_NAME = "tracktor-pwa-v6";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon.svg",
  "./img/wooly/vine-light.svg",
  "./img/wooly/vine-dark.svg",
  "./img/wooly/floor-light.svg",
  "./img/wooly/floor-dark.svg",
  "./img/wooly/girl.png",
  "./img/wooly/ball.png",
  "./rings/index.html",
  "./proto/index.html",
  "./proto/data.js",
  "./proto/proto.js",
  "./proto2/index.html",
  "./proto2/p2.js",
  "./css/app.css",
  "./js/core.js",
  "./js/zzfx.js",
  "./js/sfxr.js",
  "./js/confetti.js",
  "./js/icons.js",
  "./js/ui.js",
  "./js/train.js",
  "./js/progress.js",
  "./js/backup.js",
  "./js/coros.js",
  "./js/welcome.js",
  "./js/diet.js",
  "./js/sheet.js",
  "./js/main.js",
  "./fonts/barlow-condensed-500.woff2",
  "./fonts/barlow-condensed-600.woff2",
  "./fonts/barlow-condensed-700.woff2",
  "./fonts/archivo-wdth.woff2",
  "./fonts/vt323.woff2",
  "./fonts/bricolage-wght.woff2",
  "./fonts/geist-wght.woff2",
  "./fonts/geist-mono-wght.woff2",
  "./fonts/share-tech-mono.woff2"
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
  // Network first for the page, its code and the theme pictures (img/ can be redrawn in place); the cached copy
  // is used only when offline. Scripts and styles carry a ?v= stamp from tools/stamp.py, so a new page can't
  // pick up old ones; when a newly stamped copy is stored, the copies with older stamps are dropped.
  if (e.request.mode === "navigate" || /\.(html|js|css)$/.test(url.pathname) || url.pathname.includes("/img/") || url.pathname.endsWith("/")) {
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
