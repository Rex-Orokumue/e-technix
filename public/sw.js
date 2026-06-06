self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  let data = {};
  try { data = event.data?.json() ?? {}; } catch { data = { title: event.data?.text() ?? 'e-technix' }; }

  // Build absolute URL from the SW scope (handles both prod and dev correctly)
  const scope = self.registration.scope.replace(/\/$/, ''); // e.g. "https://e-technix.com"
  const rawUrl = data.url ?? '/hub';
  const fullUrl = rawUrl.startsWith('http') ? rawUrl : `${scope}${rawUrl}`;

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'e-technix', {
      body: data.body ?? '',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: { url: fullUrl },
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url ?? self.registration.scope;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
