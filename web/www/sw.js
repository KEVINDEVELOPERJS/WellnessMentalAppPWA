// Service Worker for Wellness Mental Web App
// Handles background notifications and offline support

const CACHE_NAME = 'wellness-mental-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/alerts.html',
    '/alerts-low-medium.html',
    '/questionnaire-editor.html',
    '/css/styles.css',
    '/css/alerts.css',
    '/js/app.js',
    '/js/alerts.js',
    '/js/alerts-low-medium.js',
    '/js/questionnaire-editor.js',
    '/js/evaluation.js',
    '/js/hub-client.js',
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
            .catch(error => {
                console.error('[SW] Cache installation failed:', error);
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip manifest.json and other non-essential files
    if (event.request.url.includes('manifest.json') || 
        event.request.url.includes('vercel.com/sso-api')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).catch(() => {
                    // Return a basic offline response if network fails
                    return new Response('Offline', { status: 503 });
                });
            })
            .catch(error => {
                console.error('[SW] Fetch error:', error);
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
