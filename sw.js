const CACHE_NAME = 'glory-translator-v2.0.0';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './assets/glory_logo.svg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.js'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[ServiceWorker] Cache failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network First strategy for API calls, Cache First for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API calls with Network First strategy
  if (url.hostname.includes('mymemory.translated.net') || 
      url.hostname.includes('translate.googleapis.com') ||
      url.hostname.includes('api.cognitive.microsofttranslator.com')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response
          const responseClone = response.clone();
          
          // Store in cache for offline fallback
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone);
            });
          
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request)
            .then((response) => {
              if (response) {
                return response;
              }
              // Return a custom offline response for translation APIs
              return new Response(
                JSON.stringify({
                  responseData: {
                    translatedText: '[Traducción offline no disponible]'
                  },
                  responseStatus: 200
                }),
                {
                  status: 200,
                  statusText: 'OK',
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }
              );
            });
        })
    );
    return;
  }

  // Handle app resources with Cache First strategy
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Fallback for essential files
            if (request.destination === 'document') {
              return caches.match('./index.html');
            }
          });
      })
  );
});

// Background sync for offline translations
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-translate') {
    console.log('[ServiceWorker] Background sync triggered');
    event.waitUntil(doBackgroundTranslation());
  }
});

async function doBackgroundTranslation() {
  // Handle offline translation queue
  try {
    const cache = await caches.open(CACHE_NAME);
    const offlineTranslations = await getOfflineTranslations();
    
    for (const translation of offlineTranslations) {
      try {
        await processOfflineTranslation(translation);
      } catch (error) {
        console.error('[ServiceWorker] Failed to process offline translation:', error);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Background sync failed:', error);
  }
}

async function getOfflineTranslations() {
  // This would retrieve queued translations from IndexedDB
  return [];
}

async function processOfflineTranslation(translation) {
  // This would process a queued translation
  console.log('[ServiceWorker] Processing offline translation:', translation);
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva funcionalidad disponible',
    icon: './assets/icon-192.png',
    badge: './assets/icon-72.png',
    vibrate: [200, 100, 200],
    tag: 'glory-translator',
    actions: [
      {
        action: 'open',
        title: 'Abrir App',
        icon: './assets/icon-72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Glory Translation Tool', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click received');
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});