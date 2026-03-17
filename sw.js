const CACHE_NAME = 'pjk-prof-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon192.png',
  './icon512.png'
];

// 설치: 핵심 파일 캐시
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 활성화: 오래된 캐시 삭제
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// 요청 가로채기: 캐시 우선, 없으면 네트워크
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(response) {
        // 성공한 응답은 캐시에 저장
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      });
    }).catch(function() {
      // 오프라인 시 캐시된 index.html 반환
      return caches.match('./index.html');
    })
  );
});
