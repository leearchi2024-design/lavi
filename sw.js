// ============================================================
// 離線功能（Service Worker）
// 有網路時：抓最新的檔案，同時存一份備用
// 沒網路時：用之前存的檔案，App 照樣能打開
// 更新 App 時，把下面的版本號加 1（例如 v2），舊的備用檔就會被清掉
// ============================================================
const CACHE = "bookkeeping-v1";
const FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];

// 安裝：先把 App 的檔案存起來
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
  self.skipWaiting();
});

// 啟用：刪掉舊版本的備用檔
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// 讀取檔案：先試網路，失敗再用備用檔
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(r => r || caches.match("./index.html")))
  );
});
