const version = "v0.0.1";
const staticCacheName = `${version}-staticFiles`;

// Install and pre-caching
addEventListener("install", installEvent => {
    skipWaiting();

    installEvent.waitUntil(
        caches.open(staticCacheName)
            .then(staticCacheName => {

                // Pre-cache nice to haves
                staticCacheName.addAll([
                    "/fonts/Open-Sans-Bold.woff2",
                    "/fonts/Open-Sans-Regular.woff2",
                ]);

                // Pre-cache must have
                return staticCacheName.addAll([
                    "/offline.html",
                    "/css/style.css",
                    "/favicon.ico",
                    "/img/developer.webp",
                    "/img/seo.webp",
                ]);
            })
    );
});

// Activate and cleanup
addEventListener("activate", activateEvent => {
    activateEvent.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if(cacheName != staticCacheName) {
                            return caches.delete(cacheName);
                        }
                    })
                )
            })
            .then(() => {
                return clients.claim();
            })
    );
});

// Handle fetch events
addEventListener("fetch", fetchEvent => {
    const { request } = fetchEvent;

    fetchEvent.respondWith(
        caches.match(request)
            .then(responeFromCache => {
                if(responeFromCache) {
                    return responeFromCache;
                }

                return fetch(request)
                    .catch(error => {
                        return caches.match("/offline.html");
                    })
            })            
    );
});