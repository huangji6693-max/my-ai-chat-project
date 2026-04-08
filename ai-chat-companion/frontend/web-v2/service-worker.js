/* Service Worker — AI 陪聊 PWA 第二版
   策略：Cache-First 处理静态资源，Network-Only 处理 API 请求
*/

const CACHE_NAME = "ai-chat-companion-v2";

/* 需要预缓存的静态资源（应用壳） */
const PRECACHE_URLS = [
  "/v2",
  "/static-v2/styles.css",
  "/static-v2/app.js",
  "/static-v2/manifest.webmanifest",
  "/static-v2/icons/icon-192.png",
  "/static-v2/icons/icon-512.png"
];

/* 安装阶段：预缓存所有静态资源 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

/* 激活阶段：清理旧版本缓存 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* 请求拦截 */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  /* API 请求（/chat、/health）始终走网络，不缓存 */
  if (url.pathname.startsWith("/chat") || url.pathname.startsWith("/health")) {
    event.respondWith(fetch(event.request));
    return;
  }

  /* 静态资源：Cache-First */
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          /* 缓存新拉取的静态资源 */
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
      );
    })
  );
});
