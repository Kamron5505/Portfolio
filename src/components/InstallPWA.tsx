'use client';

import { useEffect, useState } from 'react';
import { FiDownload } from 'react-icons/fi';

// Chrome/Edge/Android дают это событие до показа нативного диалога установки;
// в типах DOM его нет, потому что стандартом оно так и не стало.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

/**
 * Кнопка «Установить приложение». Показывается только там, где установка
 * реально возможна и ещё не сделана:
 *  - Chrome/Edge (десктоп и Android) — ловим beforeinstallprompt и по клику
 *    открываем нативный диалог;
 *  - iOS/iPadOS Safari — события нет, по клику показываем подсказку
 *    «Поделиться → На экран Домой»;
 *  - уже установленное приложение (standalone) — кнопки нет вовсе.
 *
 * variant="nav" — компактная кнопка в строке навбара, variant="menu" —
 * пункт мобильного меню на всю ширину.
 */
export default function InstallPWA({
  label,
  iosHint,
  variant = 'nav',
}: {
  label: string;
  iosHint: string;
  variant?: 'nav' | 'menu';
}) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);

  useEffect(() => {
    // Открыто как установленное приложение — предлагать нечего.
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    // iPadOS 13+ маскируется под Mac, выдаёт себя только тачскрином.
    setIos(
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    );

    const onPrompt = (e: Event) => {
      // Забираем событие себе: без preventDefault Chrome на Android показал
      // бы собственную мини-плашку в произвольный момент.
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setPromptEvent(null);
      setIos(false);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!promptEvent && !ios) return null;

  const onClick = async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      // Диалог одноразовый: после ответа событие использовать нельзя.
      if (outcome === 'accepted') setPromptEvent(null);
    } else {
      setHintOpen((v) => !v);
    }
  };

  if (variant === 'menu') {
    return (
      <>
        <button
          type="button"
          onClick={onClick}
          className="flex w-full items-center gap-2 rounded-md px-2 py-2.5 font-mono text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <FiDownload size={15} aria-hidden="true" />
          {label}
        </button>
        {hintOpen && (
          <p role="status" className="px-2 pb-2 font-mono text-xs text-faint">
            {iosHint}
          </p>
        )}
      </>
    );
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 font-mono text-[13px] text-muted transition-colors hover:text-ink"
      >
        <FiDownload size={14} aria-hidden="true" />
        {label}
      </button>
      {hintOpen && (
        <span
          role="status"
          className="absolute right-0 top-full z-50 mt-3 w-60 rounded-lg border border-line bg-surface p-3 font-mono text-xs text-muted shadow-xl"
        >
          {iosHint}
        </span>
      )}
    </span>
  );
}
