// Service Worker - disponible para instalación en navegador
// En Android Capacitor, los service workers tienen limitaciones

self.addEventListener('install', () => {
  console.log('Service Worker instalado');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Capacitor maneja los assets locales, SW opcional aquí
  console.log('Service Worker fetch:', event.request.url);
});
