self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Pass-through for now, just enough to make PWA installable.
  // In a full implementation, you would cache static assets and API requests here.
  e.respondWith(fetch(e.request).catch(() => {
    // If network fails, return offline page or ignore
    return new Response('Offline');
  }));
});
