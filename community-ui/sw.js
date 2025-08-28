/**
 * SkillPort Community Service Worker
 * Provides offline support, caching, and performance optimization
 */

const CACHE_NAME = 'skillport-v1.0.0';
const STATIC_CACHE = 'skillport-static-v1.0.0';
const DYNAMIC_CACHE = 'skillport-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/js/core.js',
  '/js/api.js',
  '/js/app.js',
  '/js/auth.js',
  '/js/profile.js',
  '/js/tasks.js',
  '/js/portfolio.js',
  '/js/notifications.js',
  '/js/navigation.js',
  '/js/breadcrumbs.js',
  '/js/analytics-demo.js',
  '/js/production-optimizer.js',
  '/pages/auth/register.html',
  '/pages/auth/login.html',
  '/pages/admin/admin-dashboard.html',
  '/pages/admin/admin-users.html',
  '/pages/admin/admin-contests.html',
  '/pages/admin/admin-analytics.html',
  '/pages/admin/admin-leaderboard.html',
  '/pages/admin/admin-settings.html',
  '/pages/communities/create.html',
  '/pages/terms.html',
  '/pages/privacy.html',
  '/offline.html'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('🚀 SkillPort Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static files...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.warn('⚠️ Some static files failed to cache (this is normal for development):', error);
        // Continue with installation even if some files fail to cache
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 SkillPort Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle different types of requests
  if (request.destination === 'document') {
    // HTML pages - cache first, then network
    event.respondWith(handleDocumentRequest(request));
  } else if (request.destination === 'script' || request.destination === 'style') {
    // CSS/JS files - cache first, then network
    event.respondWith(handleStaticRequest(request));
  } else if (request.destination === 'image') {
    // Images - network first, then cache
    event.respondWith(handleImageRequest(request));
  } else {
    // Other requests - network first, then cache
    event.respondWith(handleDynamicRequest(request));
  }
});

// Handle HTML document requests
async function handleDocumentRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Update cache in background
      updateCacheInBackground(request);
      return cachedResponse;
    }

    // Fetch from network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return offline page if available
    const offlineResponse = await caches.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Return basic offline message
    return new Response(
      '<html><body><h1>Offline</h1><p>Please check your internet connection.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// Handle static file requests (CSS, JS)
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fetch from network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached version if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Handle image requests
async function handleImageRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached version if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Handle dynamic requests (API calls, etc.)
async function handleDynamicRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached version if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Update cache in background
async function updateCacheInBackground(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    // Silently fail - user already has cached version
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync triggered');
    event.waitUntil(performBackgroundSync());
  }
});

// Perform background sync
async function performBackgroundSync() {
  try {
    // Sync any pending data
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'BACKGROUND_SYNC',
        message: 'Syncing data in background...'
      });
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New notification from SkillPort',
      icon: '/images/icon-192x192.png',
      badge: '/images/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'SkillPort Community', options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
  );
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

// Unhandled rejection handling
self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('🚀 SkillPort Service Worker loaded successfully!');
