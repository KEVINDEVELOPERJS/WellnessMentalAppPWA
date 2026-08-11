// Web Push Notifications Module
// Wellness Mental App - Push Notification System

const PushNotifications = {
    registration: null,
    subscription: null,
    isSupported: false,
    permission: 'default',
    vapidPublicKey: null, // Would be configured with real VAPID keys in production

    async init() {
        console.log('[PUSH] Initializing push notifications');
        
        // Check for support
        this.isSupported = this.checkSupport();
        
        if (!this.isSupported) {
            console.warn('[PUSH] Push notifications not supported in this browser');
            return false;
        }
        
        // Check current permission
        this.permission = Notification.permission;
        console.log('[PUSH] Current notification permission:', this.permission);
        
        // Register service worker
        await this.registerServiceWorker();
        
        // Check for existing subscription
        await this.checkExistingSubscription();
        
        // Set up message listener for incoming pushes
        this.setupMessageListener();
        
        console.log('[PUSH] Push notifications initialized');
        return true;
    },

    checkSupport() {
        return 'serviceWorker' in navigator && 
               'PushManager' in navigator && 
               'Notification' in window;
    },

    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            
            this.registration = registration;
            console.log('[PUSH] Service Worker registered:', registration.scope);
            
            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;
            console.log('[PUSH] Service Worker ready');
            
            return true;
        } catch (error) {
            console.error('[PUSH] Service Worker registration failed:', error);
            return false;
        }
    },

    async requestPermission() {
        if (!this.isSupported) {
            console.warn('[PUSH] Push notifications not supported');
            return false;
        }
        
        if (this.permission === 'granted') {
            console.log('[PUSH] Permission already granted');
            return true;
        }
        
        try {
            this.permission = await Notification.requestPermission();
            console.log('[PUSH] Permission request result:', this.permission);
            
            if (this.permission === 'granted') {
                // Subscribe to push after permission granted
                await this.subscribeToPush();
                return true;
            } else {
                console.warn('[PUSH] Permission denied');
                return false;
            }
        } catch (error) {
            console.error('[PUSH] Error requesting permission:', error);
            return false;
        }
    },

    async subscribeToPush() {
        if (!this.registration) {
            console.error('[PUSH] Service Worker not registered');
            return false;
        }
        
        try {
            // In production, you would use real VAPID keys here
            // For demo purposes, we'll create a subscription without VAPID
            const subscribeOptions = {
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey || '')
            };
            
            // Try to subscribe with VAPID, fallback to without
            let subscription;
            try {
                subscription = await this.registration.pushManager.subscribe(subscribeOptions);
            } catch (e) {
                console.log('[PUSH] Subscribing without VAPID (demo mode)');
                subscription = await this.registration.pushManager.subscribe({
                    userVisibleOnly: true
                });
            }
            
            this.subscription = subscription;
            console.log('[PUSH] Push subscription successful:', subscription);
            
            // Send subscription to server/hub
            await this.sendSubscriptionToServer(subscription);
            
            return true;
        } catch (error) {
            console.error('[PUSH] Push subscription failed:', error);
            return false;
        }
    },

    async checkExistingSubscription() {
        if (!this.registration) return;
        
        try {
            const subscription = await this.registration.pushManager.getSubscription();
            
            if (subscription) {
                this.subscription = subscription;
                console.log('[PUSH] Existing subscription found:', subscription);
                return true;
            } else {
                console.log('[PUSH] No existing subscription');
                return false;
            }
        } catch (error) {
            console.error('[PUSH] Error checking subscription:', error);
            return false;
        }
    },

    async unsubscribe() {
        if (!this.subscription) {
            console.log('[PUSH] No subscription to unsubscribe');
            return true;
        }
        
        try {
            await this.subscription.unsubscribe();
            this.subscription = null;
            console.log('[PUSH] Successfully unsubscribed');
            
            // Remove from server
            await this.removeSubscriptionFromServer();
            
            return true;
        } catch (error) {
            console.error('[PUSH] Unsubscribe failed:', error);
            return false;
        }
    },

    async sendSubscriptionToServer(subscription) {
        try {
            const subscriptionData = {
                endpoint: subscription.endpoint,
                keys: subscription.getKey ? {
                    p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
                    auth: this.arrayBufferToBase64(subscription.getKey('auth'))
                } : null,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            };
            
            // Store in localStorage for demo purposes
            // In production, send to your server/hub
            localStorage.setItem('push_subscription', JSON.stringify(subscriptionData));
            console.log('[PUSH] Subscription stored locally:', subscriptionData);
            
            // In production, you would send this to your hub/server:
            // await fetch('/api/push/subscribe', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(subscriptionData)
            // });
            
            return true;
        } catch (error) {
            console.error('[PUSH] Error sending subscription to server:', error);
            return false;
        }
    },

    async removeSubscriptionFromServer() {
        try {
            localStorage.removeItem('push_subscription');
            console.log('[PUSH] Subscription removed from local storage');
            
            // In production, call your server endpoint:
            // await fetch('/api/push/unsubscribe', { method: 'POST' });
            
            return true;
        } catch (error) {
            console.error('[PUSH] Error removing subscription from server:', error);
            return false;
        }
    },

    setupMessageListener() {
        if (!this.registration) return;
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('[PUSH] Message from service worker:', event.data);
            
            if (event.data.type === 'NEW_ALERT') {
                this.handleNewAlert(event.data.alert);
            }
        });
    },

    handleNewAlert(alert) {
        console.log('[PUSH] New alert received:', alert);
        
        // Show local notification if permission granted
        if (this.permission === 'granted') {
            this.showLocalNotification(alert);
        }
        
        // Dispatch custom event for app to handle
        const event = new CustomEvent('newAlert', { detail: alert });
        window.dispatchEvent(event);
    },

    showLocalNotification(alert) {
        const options = {
            body: `${alert.nombreEstudiante || 'Estudiante'} - ${alert.extracto || 'Nueva alerta'}`,
            icon: '/images/app-icon.jpeg',
            badge: '/images/app-icon.jpeg',
            tag: `alerta-${alert.remoteId || alert.id}`,
            requireInteraction: alert.nivelRiesgo?.toLowerCase() === 'alto',
            data: {
                url: '/alerts.html',
                alertId: alert.remoteId || alert.id
            }
        };
        
        const title = `🚨 Alerta ${alert.nivelRiesgo?.toUpperCase() || 'RIESGO'}`;
        new Notification(title, options);
    },

    // Utility functions
    urlBase64ToUint8Array(base64String) {
        if (!base64String) return new Uint8Array(0);
        
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        
        return outputArray;
    },

    arrayBufferToBase64(buffer) {
        if (!buffer) return null;
        
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        
        return window.btoa(binary);
    },

    // Test notification (for development)
    async testNotification() {
        if (this.permission !== 'granted') {
            const granted = await this.requestPermission();
            if (!granted) {
                console.warn('[PUSH] Permission not granted for test');
                return false;
            }
        }
        
        const testAlert = {
            remoteId: 'test-' + Date.now(),
            nombreEstudiante: 'Estudiante de Prueba',
            extracto: 'Esta es una notificación de prueba del sistema de alertas.',
            nivelRiesgo: 'alto',
            timestamp: new Date().toISOString()
        };
        
        this.showLocalNotification(testAlert);
        return true;
    },

    // Get current status
    getStatus() {
        return {
            isSupported: this.isSupported,
            permission: this.permission,
            isSubscribed: !!this.subscription,
            hasServiceWorker: !!this.registration
        };
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PushNotifications.init());
} else {
    PushNotifications.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PushNotifications;
}