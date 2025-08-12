const CACHE_NAME = 'pretrip-v1';
const APP_SHELL = [
  './',          // GitHub Pages 루트가 하위 경로일 수도 있어서 상대경로 사용
  './index.html',
  './icon.png',
  // 필요시 폰트/이미지 추가
];

// 설치: 앱 쉘 캐시
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

// 활성화: 오래된 캐시 정리
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
});

// 요청 가로채기: 캐시 우선, 없으면 네트워크
self.addEventListener('fetch', (e) => {
  const req = e.request;
  // Firebase 등 외부 CDN은 네트워크 우선 + 런타임 캐시 (선택)
  if (/^https?:\\/\\//.test(req.url)) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      }).catch(() => caches.match('./index.html')))
    );
  } else {
    // 로컬 자원: 캐시 우선
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).catch(() => caches.match('./index.html')))
    );
  }
});
