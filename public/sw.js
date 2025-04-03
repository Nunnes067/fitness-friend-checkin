
// Service Worker para PWA e aplicativo móvel

const CACHE_NAME = 'checkmate-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim any clients immediately
  self.clients.claim();
});

// Estratégia Cache First, depois Network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Store the fetched response in the cache
                if (event.request.method === 'GET') {
                  cache.put(event.request, responseToCache);
                }
              });
              
            return response;
          });
      })
  );
});

// Sincronização em segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-checkins') {
    event.waitUntil(syncCheckins());
  }
});

// Função para sincronizar check-ins offline
async function syncCheckins() {
  try {
    const offlineCheckins = await getOfflineCheckins();
    if (offlineCheckins.length > 0) {
      // Aqui implementaríamos a lógica para enviar os check-ins
      // armazenados localmente para o servidor
      console.log('Sincronizando check-ins offline:', offlineCheckins);
    }
  } catch (error) {
    console.error('Erro ao sincronizar check-ins:', error);
  }
}

// Função mock para obter check-ins offline (implementação real usaria IndexedDB)
function getOfflineCheckins() {
  return Promise.resolve([]);
}
