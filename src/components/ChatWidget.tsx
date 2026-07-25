'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FiMessageCircle, FiSend, FiX } from 'react-icons/fi';
import type { Locale } from '@/lib/i18n';

// Живой чат: плавающая кнопка в правом нижнем углу + мини-панель.
// Общий канал: посетители видят друг друга, администратор отвечает с того же
// виджета (сервер узнаёт его по cookie админки). Транспорт — опрос
// /api/chat раз в несколько секунд: WebSocket на Vercel (serverless) не
// живёт, а для чата на портфолио задержка в пару секунд незаметна.
//
// Кнопка видна всегда. Недоступность сервера — это состояние «Подключение…»,
// а не исчезновение виджета: раньше один ответ 503 (база не настроена) гасил
// чат до перезагрузки страницы, и со стороны это выглядело как пропавшая
// кнопка.

type ChatMessage = {
  id: string;
  seq: number;
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
    offline: 'Connection lost. Retrying…',
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
    offline: 'Aloqa uzildi. Qayta urinilmoqda…',
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
    offline: 'Связь потеряна. Повторная попытка…',
    admin: 'Админ',
    empty: 'Сообщений пока нет — поздоровайтесь!',
    rateLimited: 'Слишком часто — подождите пару секунд.',
  },
};

const NAME_KEY = 'chat:name';
const CID_KEY = 'chat:cid';
// Пока чат открыт, опрашиваем часто; закрытый — изредка (для счётчика
// непрочитанных), чтобы не жечь serverless-вызовы впустую.
const POLL_OPEN_MS = 3000;
const POLL_CLOSED_MS = 25000;

// localStorage бросает исключение, если хранилище заблокировано (приватный
// режим, запрет сторонних данных). Для чата это не повод падать: без него
// имя и id просто не переживут перезагрузку страницы.
function readStorage(key: string): string {
  try {
    return localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* хранилище недоступно — работаем в пределах текущей страницы */
  }
}

// crypto.randomUUID() существует только в secure context: https или localhost.
// При заходе по http на IP в локальной сети (телефон, соседний ноутбук) его
// нет, и прямой вызов ронял весь опрос чата.
function randomId(): string {
  const webCrypto = typeof crypto !== 'undefined' ? crypto : undefined;
  if (typeof webCrypto?.randomUUID === 'function') return webCrypto.randomUUID();

  const bytes = new Uint8Array(16);
  if (typeof webCrypto?.getRandomValues === 'function') {
    webCrypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// Идентификатор держим ещё и в памяти модуля: при недоступном localStorage
// иначе на каждый запрос выдавался бы новый клиент и счётчик «онлайн» врал.
let cachedCid = '';

function clientId(): string {
  if (cachedCid) return cachedCid;
  cachedCid = readStorage(CID_KEY);
  if (!cachedCid) {
    cachedCid = randomId();
    writeStorage(CID_KEY, cachedCid);
  }
  return cachedCid;
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
  const [sending, setSending] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const openRef = useRef(open);
  openRef.current = open;
  // Курсор «последний увиденный seq» — чтобы забирать только новое.
  const cursorRef = useRef(0);
  const pollingRef = useRef(false);

  const appendMessages = useCallback((incoming: ChatMessage[]) => {
    if (incoming.length === 0) return;
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => m.id));
      const fresh = incoming.filter((m) => !seen.has(m.id));
      if (fresh.length === 0) return prev;
      if (!openRef.current) setUnread((n) => n + fresh.length);
      return [...prev, ...fresh].slice(-300);
    });
    const maxSeq = Math.max(...incoming.map((m) => m.seq));
    if (maxSeq > cursorRef.current) cursorRef.current = maxSeq;
  }, []);

  const poll = useCallback(async () => {
    if (pollingRef.current) return;
    pollingRef.current = true;
    try {
      const res = await fetch(`/api/chat?cid=${clientId()}&after=${cursorRef.current}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as {
        ok: boolean;
        you?: { isAdmin: boolean; name: string | null };
        online?: number;
        messages?: ChatMessage[];
      };
      if (!data.ok) throw new Error('not ok');

      if (data.you?.isAdmin) {
        // Имя админа приходит из его сессии и не редактируется.
        setIsAdmin(true);
        setName(data.you.name ?? 'admin');
      }
      if (typeof data.online === 'number') setOnline(data.online);
      if (Array.isArray(data.messages)) appendMessages(data.messages);
      setConnected(true);
    } catch {
      setConnected(false);
    } finally {
      pollingRef.current = false;
    }
  }, [appendMessages]);

  // Цикл опроса: интервал зависит от того, открыта ли панель; в фоновой
  // вкладке не опрашиваем вовсе.
  useEffect(() => {
    setName((v) => v || readStorage(NAME_KEY));

    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;

    const tick = async () => {
      if (stopped) return;
      if (document.visibilityState === 'visible') await poll();
      if (stopped) return;
      timer = setTimeout(tick, openRef.current ? POLL_OPEN_MS : POLL_CLOSED_MS);
    };
    tick();

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(timer);
        tick();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [poll]);

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
      if (!v) {
        setUnread(0);
        // Свежие сообщения сразу при открытии, не дожидаясь таймера.
        void poll();
      }
      return !v;
    });
  }, [poll]);

  const submitName = (e: React.FormEvent) => {
    e.preventDefault();
    const value = nameDraft.replace(/\s+/g, ' ').trim().slice(0, 32);
    if (!value) return;
    setName(value);
    writeStorage(NAME_KEY, value);
  };

  const submitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim().slice(0, 500);
    if (!text || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cid: clientId(), name, text }),
      });
      if (res.status === 429) {
        setNotice('rate_limited');
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { ok: boolean; message?: ChatMessage | null };
      if (data.ok && data.message) appendMessages([data.message]);
      setDraft('');
      setConnected(true);
    } catch {
      // Сообщение не ушло — текст остаётся в поле, можно повторить.
      setConnected(false);
    } finally {
      setSending(false);
    }
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
          {!connected && messages.length > 0 && (
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
                disabled={sending || !draft.trim()}
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
