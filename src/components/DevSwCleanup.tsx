'use client';

import { useEffect } from 'react';

/**
 * Подключается только в dev (см. RootDocument / admin layout). Снимает
 * service worker, оставшийся после локального production-запуска: иначе он
 * продолжает обслуживать localhost:3000 старым прекешем, и dev-сервер
 * получает загадочные no-response вместо свежих файлов.
 */
export default function DevSwCleanup() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.getRegistrations().then(async (regs) => {
      if (!regs.length) return;
      await Promise.all(regs.map((reg) => reg.unregister()));
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      // Страница уже могла загрузиться через старый воркер — после чистки
      // перезагружаемся, чтобы всё пришло напрямую с dev-сервера.
      window.location.reload();
    });
  }, []);

  return null;
}
