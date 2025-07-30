// Service Worker for TradiePro PWA
const CACHE_NAME = 'tradiepro-v1';
const STATIC_CACHE = 'tradiepro-static-v1';
const DYNAMIC_CACHE = 'tradiepro-dynamic-v1';
const JOBS_CACHE = 'tradiepro-jobs-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/auth',
  '/intake',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('Error caching static assets:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== JOBS_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle Supabase API requests (jobs data)
  if (url.hostname.includes('supabase.co') && url.pathname.includes('/rest/v1/jobs')) {
    event.respondWith(
      networkFirstWithCache(request, JOBS_CACHE)
    );
    return;
  }

  // Handle static assets
  if (STATIC_ASSETS.some(asset => url.pathname === asset) || 
      url.pathname.includes('/static/')) {
    event.respondWith(
      cacheFirstWithNetwork(request, STATIC_CACHE)
    );
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirstWithFallback(request)
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    networkFirstWithCache(request, DYNAMIC_CACHE)
  );
});

// Network first, fallback to cache
async function networkFirstWithCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/');
    }
    
    throw error;
  }
}

// Cache first, fallback to network
async function cacheFirstWithNetwork(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.error('Network and cache failed for:', request.url);
    throw error;
  }
}

// Network first with offline fallback
async function networkFirstWithFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache navigation responses
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed for navigation, trying cache...');
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return cached index page as fallback
    return caches.match('/');
  }
}

// Background sync for job updates (when online)
self.addEventListener('sync', (event) => {
  if (event.tag === 'job-updates') {
    event.waitUntil(syncJobUpdates());
  }
});

async function syncJobUpdates() {
  console.log('Syncing job updates...');
  // This would sync any pending job updates when back online
  try {
    // Implementation for syncing pending updates
    console.log('Job updates synced successfully');
  } catch (error) {
    console.error('Failed to sync job updates:', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard'
    },
    actions: [
      {
        action: 'view',
        title: 'View Job',
        icon: '/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-96x96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'TradiePro', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    const url = event.notification.data?.url || '/dashboard';
    
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});
