const CACHE_NAME = 'film-asset-max-v1';

// 需要強制鎖定在手機快取中的資源
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js' // 強制快取 Chart.js 確保離線可繪製圖表
];

// 安裝 Service Worker 並寫入快取
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('專案核心資源已成功寫入銀鹽快取層！');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 激活並清除舊版本快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('正在清理舊版暗房快取...', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 攔截網路請求：優先使用離線快取（Cache First 策略）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 如果快取庫裡有，直接秒回（完全免網路）；沒有才走網路下載
      return cachedResponse || fetch(event.request);
    })
  );
});