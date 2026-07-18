'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FiMessageCircle, FiSend, FiX } from 'react-icons/fi';
import type { Locale } from '@/lib/i18n';

// Живой чат: плавающая кнопка в правом нижнем углу + мини-панель.
// Общий канал: посетители видят друг друга, администратор отвечает
// с того же виджета (сервер узнаёт его по cookie админки).
// Серверная часть — src/server/chat-server.ts (порт CHAT_WS_PORT, деф. 3001).

type ChatMessage = {
  id: string;
  name: string;
  text: string;
  isAdmin: boolean;
  ts: number;
};

// Строки виджета не входят в общий Dict: они нужны только здесь,
// и тащить их через админку текстов нет смысла.
const T: Record<
  Locale,
  {
    title: string;
    open: string;
    close: string;
    online: (n: number) => string;
    namePlaceholder: string;
    nameSubmit: string;
    nameHint: string;
    inputPlaceholder: string;
    send: string;
    connecting: string;
    offline: string;
    admin: string;
    empty: string;
    rateLimited: string;
  }
> = {
  en: {
    title: 'Live chat',
    open: 'Open chat',
    close: 'Close chat',
    online: (n) => `${n} online`,
    namePlaceholder: 'Your name',
    nameSubmit: 'Join chat',
    nameHint: 'Introduce yourself to start chatting.',
    inputPlaceholder: 'Write a message…',
    send: 'Send',
    connecting: 'Connecting…',
    offline: 'Connection lost. Reconnecting…',
    admin: 'Admin',
    empty: 'No messages yet — say hi!',
    rateLimited: 'Too fast — wait a few seconds.',
  },
  uz: {
    title: 'Jonli chat',
    open: 'Chatni ochish',
    close: 'Chatni yopish',
    online: (n) => `${n} onlayn`,
    namePlaceholder: 'Ismingiz',
    nameSubmit: 'Chatga kirish',
    nameHint: 'Suhbatni boshlash uchun ismingizni kiriting.',
    inputPlaceholder: 'Xabar yozing…',
    send: 'Yuborish',
    connecting: 'Ulanmoqda…',
    offline: 'Aloqa uzildi. Qayta ulanmoqda…',
    admin: 'Admin',
    empty: 'Hozircha xabar yoʻq — salom deng!',
    rateLimited: 'Juda tez — bir necha soniya kuting.',
  },
  ru: {
    title: 'Живой чат',
    open: 'Открыть чат',
    close: 'Закрыть чат',
    online: (n) => `онлайн: ${n}`,
    namePlaceholder: 'Ваше имя',
    nameSubmit: 'Войти в чат',
    nameHint: 'Представьтесь, чтобы начать общение.',
    inputPlaceholder: 'Напишите сообщение…',
    send: 'Отправить',
    connecting: 'Подключение…',
    offline: 'Связь потеряна. Переподключение…',
    admin: 'Админ',
    empty: 'Сообщений пока нет — поздоровайтесь!',
    rateLimited: 'Слишком часто — подождите пару секунд.',
  },
};

const NAME_KEY = 'chat:name';

function wsUrl(): string {
  if (process.env.NEXT_PUBLIC_CHAT_WS_URL) return process.env.NEXT_PUBLIC_CHAT_WS_URL;
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${location.hostname}:3001`;
}

export default function ChatWidget({ locale }: { locale: Locale }) {
  const t = T[locale];

  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [online, setOnline] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unread, setUnread] = useState(0);
  const [name, setName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const openRef = useRef(open);
  openRef.current = open;
  const nameRef = useRef(name);
  nameRef.current = name;

  // Одно подключение на всё время жизни страницы, с переподключением.
  useEffect(() => {
    let disposed = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    const connect = () => {
      if (disposed) return;
      const ws = new WebSocket(wsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        attempts = 0;
        setConnected(true);
        const saved = nameRef.current || localStorage.getItem(NAME_KEY) || '';
        if (saved) ws.send(JSON.stringify({ type: 'hello', name: saved }));
      };

      ws.onmessage = (event) => {
        let data: {
          type?: string;
          you?: { name: string; isAdmin: boolean };
          online?: number;
          messages?: ChatMessage[];
          message?: ChatMessage;
          code?: string;
        };
        try {
          data = JSON.parse(String(event.data));
        } catch {
          return;
        }

        if (data.type === 'welcome' && data.you) {
          if (data.you.isAdmin) {
            // Имя админа приходит из его сессии и не редактируется.
            setIsAdmin(true);
            setName(data.you.name);
          } else if (!nameRef.current) {
            setName(localStorage.getItem(NAME_KEY) ?? '');
          }
          if (typeof data.online === 'number') setOnline(data.online);
        } else if (data.type === 'history' && Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else if (data.type === 'message' && data.message) {
          const msg = data.message;
          setMessages((prev) => [...prev.slice(-299), msg]);
          if (!openRef.current) setUnread((n) => n + 1);
        } else if (data.type === 'presence' && typeof data.online === 'number') {
          setOnline(data.online);
        } else if (data.type === 'error' && data.code === 'rate_limited') {
          setNotice('rate_limited');
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (disposed) return;
        attempts += 1;
        timer = setTimeout(connect, Math.min(15000, 1500 * attempts));
      };
      ws.onerror = () => ws.close();
    };

    connect();
    return () => {
      disposed = true;
      clearTimeout(timer);
      wsRef.current?.close();
    };
  }, []);

  // Автоскролл к последнему сообщению, пока панель открыта.
  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  const toggle = useCallback(() => {
    setOpen((v) => {
      if (!v) setUnread(0);
      return !v;
    });
  }, []);

  const submitName = (e: React.FormEvent) => {
    e.preventDefault();
    const value = nameDraft.replace(/\s+/g, ' ').trim().slice(0, 32);
    if (!value) return;
    setName(value);
    localStorage.setItem(NAME_KEY, value);
    wsRef.current?.send(JSON.stringify({ type: 'hello', name: value }));
  };

  const submitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim().slice(0, 500);
    if (!text || !connected) return;
    wsRef.current?.send(JSON.stringify({ type: 'message', text }));
    setDraft('');
  };

  const time = (ts: number) =>
    new Date(ts).toLocaleTimeString(locale === 'en' ? 'en-GB' : locale, {
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <>
      {/* Мини-панель чата */}
      {open && (
        <div
          role="dialog"
          aria-label={t.title}
          className="fixed bottom-24 right-4 z-50 flex h-[min(30rem,calc(100dvh-8rem))] w-[min(23rem,calc(100vw-2rem))] animate-fade-up flex-col overflow-hidden rounded-2xl border border-line bg-surface/95 shadow-2xl shadow-black/50 backdrop-blur-md sm:right-6"
        >
          {/* Шапка */}
          <div className="flex items-center justify-between border-b border-line bg-surface-2/60 px-4 py-3">
            <div>
              <p className="font-display text-sm font-bold text-ink">{t.title}</p>
              <p className="font-mono text-[11px] text-muted">
                {connected ? (
                  <>
                    <span aria-hidden className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {t.online(online)}
                  </>
                ) : (
                  t.connecting
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={toggle}
              aria-label={t.close}
              className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface hover:text-ink"
            >
              <FiX size={18} aria-hidden="true" />
            </button>
          </div>

          {/* Сообщения */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <p className="pt-8 text-center font-mono text-xs text-faint">{t.empty}</p>
            )}
            {messages.map((m) => {
              // «Своим» считаем сообщение с тем же именем и той же ролью —
              // для выравнивания пузырей этого достаточно.
              const mine = Boolean(name) && m.name === name && m.isAdmin === isAdmin;
              return (
                <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                  <div className="mb-0.5 flex items-center gap-1.5 px-1">
                    <span
                      className={`font-mono text-[11px] ${m.isAdmin ? 'text-accent-2' : 'text-muted'}`}
                    >
                      {m.name}
                    </span>
                    {m.isAdmin && (
                      <span className="rounded border border-accent-2/40 bg-accent-2/10 px-1 py-px font-mono text-[9px] uppercase tracking-wider text-accent-2">
                        {t.admin}
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-faint">{time(m.ts)}</span>
                  </div>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap break-words rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      mine
                        ? 'rounded-br-sm bg-accent/25 text-ink'
                        : m.isAdmin
                          ? 'rounded-bl-sm border border-accent-2/20 bg-surface-2 text-ink'
                          : 'rounded-bl-sm bg-surface-2 text-ink'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          {notice === 'rate_limited' && (
            <p role="status" className="border-t border-line px-4 py-1.5 font-mono text-[11px] text-amber-400">
              {t.rateLimited}
            </p>
          )}
          {!connected && (
            <p role="status" className="border-t border-line px-4 py-1.5 font-mono text-[11px] text-amber-400">
              {t.offline}
            </p>
          )}

          {/* Ввод: сначала имя, потом сообщения */}
          {name ? (
            <form onSubmit={submitMessage} className="flex items-center gap-2 border-t border-line bg-surface-2/40 p-3">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t.inputPlaceholder}
                maxLength={500}
                className="min-w-0 flex-1 rounded-lg border border-line bg-bg/60 px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none"
              />
              <button
                type="submit"
                aria-label={t.send}
                disabled={!connected || !draft.trim()}
                className="rounded-lg bg-accent p-2.5 text-white transition-opacity disabled:opacity-40"
              >
                <FiSend size={16} aria-hidden="true" />
              </button>
            </form>
          ) : (
            <form onSubmit={submitName} className="border-t border-line bg-surface-2/40 p-3">
              <p className="mb-2 font-mono text-[11px] text-muted">{t.nameHint}</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder={t.namePlaceholder}
                  maxLength={32}
                  className="min-w-0 flex-1 rounded-lg border border-line bg-bg/60 px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!nameDraft.trim()}
                  className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40"
                >
                  {t.nameSubmit}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Плавающая кнопка */}
      <button
        type="button"
        onClick={toggle}
        aria-label={open ? t.close : t.open}
        className="fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30 transition-transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/40 sm:right-6"
      >
        {open ? <FiX size={24} aria-hidden="true" /> : <FiMessageCircle size={24} aria-hidden="true" />}
        {!open && unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-2 px-1 font-mono text-[11px] font-bold text-bg">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
    </>
  );
}
