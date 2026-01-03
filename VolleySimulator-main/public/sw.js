const CACHE_NAME = 'volleysim-v2';
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/logo.png',
];

const API_CACHE = 'volleysim-api-v1';
const IMAGE_CACHE = 'volleysim-images-v1';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting()) // Activate immediately
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    const { pathname } = url;

    // API Requests: Stale-While-Revalidate
    if (pathname.startsWith('/api/')) {
        event.respondWith(
            caches.open(API_CACHE).then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    const fetchPromise = fetch(event.request)
                        .then((networkResponse) => {
                            // Only cache successful responses
                            if (networkResponse && networkResponse.status === 200) {
                                cache.put(event.request, networkResponse.clone());
                            }
                            return networkResponse;
                        })
                        .catch(() => {
                            // Return cached version on network error
                            return cachedResponse || new Response(
                                JSON.stringify({ error: 'Offline - Unable to fetch data' }),
                                { status: 503, statusText: 'Service Unavailable' }
                            );
                        });
                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    // Image assets: Cache first, network fallback
    if (pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) {
        event.respondWith(
            caches.open(IMAGE_CACHE).then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    return cachedResponse || fetch(event.request)
                        .then((response) => {
                            if (response && response.status === 200) {
                                cache.put(event.request, response.clone());
                            }
                            return response;
                        })
                        .catch(() => {
                            // Return a placeholder or cached version
                            return cachedResponse;
                        });
                });
            })
        );
        return;
    }

    // HTML pages and static assets: Network first, cache fallback
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response && response.status === 200) {
                    const clonedResponse = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clonedResponse);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request)
                    .then((response) => response || new Response(
                        'You are offline and this page is not cached',
                        { status: 503, statusText: 'Service Unavailable' }
                    ));
            })
    );
});

// Activate and clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME && name !== API_CACHE && name !== IMAGE_CACHE)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim()) // Take control of all clients
    );
});

// Push notification handler
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Yeni bir bildirim aldınız',
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'volleyball-notification',
        requireInteraction: false,
    };

    event.waitUntil(
        self.registration.showNotification('VolleySimulator', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if window is already open
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].url === '/' && 'focus' in clientList[i]) {
                        return clientList[i].focus();
                    }
                }
                // Open new window if not open
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});
            );
        })
    );
});
