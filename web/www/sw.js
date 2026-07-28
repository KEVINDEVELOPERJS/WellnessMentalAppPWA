// Service Worker for Wellness Mental Web App
// Handles background notifications and offline support

const CACHE_NAME = 'wellness-mental-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/alerts.html',
    '/css/styles.css',
    '/css/alerts.css',
    '/js/app.js',
    '/js/alerts.js',
    '/js/evaluation.js',
    '/images/app-icon.jpeg'
];

// Install event - cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching app shell');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

// Handle push notifications (for future integration with push service)
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Nueva alerta de riesgo',
        icon: '/images/app-icon.jpeg',
        badge: '/images/app-icon.jpeg',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver Alertas',
                icon: '/images/app-icon.jpeg'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: '/images/app-icon.jpeg'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('🚨 Alerta de Riesgo - Wellness Mental', options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/alerts.html')
        );
    } else if (event.action === 'close') {
        // Just close the notification
    } else {
        // Default action - open alerts page
        event.waitUntil(
            clients.openWindow('/alerts.html')
        );
    }
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
