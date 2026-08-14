const CACHE_NAME = 'weboworos-v1';
const STATIC_ASSETS = [
  '/',
  '/menu',
  '/bag',
  '/checkout',
  '/globals.css',
  '/manifest.json',
];

const API_CACHE_PATTERNS = [
  /\/v1\/menu/,
  /\/v1\/products/,
  /\/v1\/categories/,
];

const IMAGE_CACHE_PATTERNS = [
  /\.(png|jpg|jpeg|svg|webp|gif)$/,
];

// Install — cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).catch((err) => {
      console.warn('[SW] Failed to cache static assets:', err);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch — cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s)
  if (!url.protocol.startsWith('http')) return;

  // API calls — Network First with cache fallback
  if (API_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return new Response(JSON.stringify({ error: 'Offline' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            });
          });
        })
    );
    return;
  }

  // Images — Cache First
  if (IMAGE_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Static assets — Cache First
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      }).catch(() => {
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/').catch(() => {
            return new Response(
              `<!DOCTYPE html>
              <html><head><meta charset="utf-8"><title>Offline</title>
              <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#111;color:#fff;text-align:center;}</style>
              </head><body><div><h1>🍕 WebowoROS</h1><p>Brak połączenia z internetem.</p><p>Spróbuj ponownie później.</p></div></body></html>`,
              { headers: { 'Content-Type': 'text/html' } }
            );
          });
        }
        throw new Error('Network error');
      });
    })
  );
});

// Background Sync — queue orders when offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    console.log('[SW] Background sync: sync-orders');
    event.waitUntil(syncOrders());
  }
});

async function syncOrders() {
  // TODO: Implement order queue sync from IndexedDB
  console.log('[SW] Order sync triggered — implement IndexedDB queue');
}

// Push notifications (placeholder)
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'WebowoROS', {
      body: data.body || 'Nowe zamówienie!',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: data.tag || 'order',
    })
  );
});
