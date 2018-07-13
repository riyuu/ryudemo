var cacheName = 'helloWorld-v32';
self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== cacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('install', event => {
    event.waitUntil(self.skipWaiting());
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => cache.addAll([
                'style/img/hello.png'
            ]))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                if (response) {
                    return response;
                }
                var requestToCache = event.request.clone();
                return fetch(requestToCache).then(
                    function (response) {
                        if (!response || response.status !== 200) {
                            return response;
                        }
                        var responseToCache = response.clone();
                        console.log(cacheName);
                        caches.open(cacheName)
                            .then(function (cache) {
                                if(event.request.method === "GET"){
                                    cache.put(requestToCache, responseToCache);
                                }
                            });
                        return response;
                    }
                );
            })
    );
});
