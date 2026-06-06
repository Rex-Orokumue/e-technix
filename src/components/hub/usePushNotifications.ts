'use client';

import { useState, useEffect, useCallback } from 'react';

export function usePushNotifications(studentId: string | null) {
  const [needsPrompt, setNeedsPrompt] = useState(false);

  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (!studentId || typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    const perm = Notification.permission;
    setPermission(perm);
    // Show banner whenever permission hasn't been decided yet
    if (perm === 'default') {
      setNeedsPrompt(true);
    }
  }, [studentId]);

  const subscribe = useCallback(async () => {
    setNeedsPrompt(false);
    setPermission(Notification.permission);
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Unsubscribe stale subscription with wrong VAPID key
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        const currentKey = urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!);
        const existingKey = existing.options.applicationServerKey
          ? new Uint8Array(existing.options.applicationServerKey as ArrayBuffer)
          : null;
        const keysMatch = existingKey && currentKey.length === existingKey.length &&
          currentKey.every((b, i) => b === existingKey[i]);
        if (!keysMatch) await existing.unsubscribe();
        else return; // already subscribed with correct key
      }

      const permission = await Notification.requestPermission();
      setPermission(permission);
      if (permission !== 'granted') return;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });
    } catch (err) {
      console.warn('[push] subscription failed', err);
    }
  }, []);

  return { needsPrompt, subscribe, permission };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}
