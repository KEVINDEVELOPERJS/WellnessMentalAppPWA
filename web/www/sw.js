// Service Worker for Wellness Mental Web App
// Handles background notifications and offline support
// Modified to avoid CORS issues with Google Apps Script

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
    '/js/push-notifications.js',
    '/js/email-service.js',
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

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip Google Apps Script URLs to avoid CORS errors
    if (event.request.url.includes('script.google.com') || 
        event.request.url.includes('corsproxy.io') ||
        event.request.url.includes('allorigins.win')) {
        return;
    }
    
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
                    // Network error, return cached version if available
                    return caches.match(event.request);
                });
            })
    );
});

// Push notification event
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');
    
    let data = {
        title: '🚨 Alerta de Riesgo',
        body: 'Nueva alerta de riesgo en Wellness Mental',
        icon: '/images/app-icon.jpeg',
        badge: '/images/app-icon.jpeg',
        tag: 'alerta-riesgo',
        requireInteraction: true,
        urgency: 'high',
        data: {
            url: '/alerts.html',
            alertId: null,
            timestamp: new Date().toISOString()
        }
    };
    
    if (event.data) {
        try {
            const payload = event.data.json();
            console.log('[SW] Push payload:', payload);
            
            // Parse alert data from payload
            if (payload.alerta) {
                const alerta = payload.alerta;
                data.title = `🚨 Alerta ${alerta.nivelRiesgo?.toUpperCase() || 'RIESGO'}`;
                data.body = `${alerta.nombreEstudiante || 'Estudiante'} - ${alerta.extracto || 'Nueva alerta'}`;
                data.tag = `alerta-${alerta.remoteId || alerta.id || Date.now()}`;
                data.data.alertId = alerta.remoteId || alerta.id;
                data.data.nivelRiesgo = alerta.nivelRiesgo;
                
                // Set urgency based on risk level
                if (alerta.nivelRiesgo?.toLowerCase() === 'alto') {
                    data.urgency = 'critical';
                    data.requireInteraction = true;
                }
            } else if (payload.title) {
                // Custom notification
                data.title = payload.title;
                data.body = payload.body || data.body;
                data.tag = payload.tag || data.tag;
                data.data.url = payload.url || data.data.url;
            }
        } catch (e) {
            console.error('[SW] Error parsing push payload:', e);
        }
    }
    
    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        tag: data.tag,
        requireInteraction: data.requireInteraction,
        urgency: data.urgency,
        data: data.data,
        actions: [
            {
                action: 'view',
                title: 'Ver Alerta',
                icon: '/images/app-icon.jpeg'
            },
            {
                action: 'dismiss',
                title: 'Descartar'
            }
        ],
        vibrate: [200, 100, 200],
        sound: 'default'
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'dismiss') {
        return;
    }
    
    // Default action or 'view' action - open alerts page
    const urlToOpen = event.notification.data?.url || '/alerts.html';
    
    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((clientList) => {
            // Check if a window is already open
            for (const client of clientList) {
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Open new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Background sync for alerts
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);
    
    if (event.tag === 'sync-alerts') {
        event.waitUntil(syncAlerts());
    }
});

async function syncAlerts() {
    try {
        // This would sync with the hub - implementation depends on your hub client
        console.log('[SW] Syncing alerts in background...');
        // Implementation would go here
    } catch (error) {
        console.error('[SW] Background sync error:', error);
    }
}

// Handle periodic background sync for real-time alerts
self.addEventListener('periodicsync', (event) => {
    console.log('[SW] Periodic sync:', event.tag);
    
    if (event.tag === 'check-alerts') {
        event.waitUntil(checkForNewAlerts());
    }
});

async function checkForNewAlerts() {
    try {
        // Periodically check for new alerts from hub
        console.log('[SW] Checking for new alerts...');
        // Implementation would go here
    } catch (error) {
        console.error('[SW] Periodic sync error:', error);
    }
}