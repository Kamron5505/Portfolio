'use client';

import { useEffect, useRef, useState } from 'react';
import { FiArrowUpRight, FiRotateCcw } from 'react-icons/fi';
import type { QuizText } from '@/lib/i18n';
import { plural, type Locale } from '@/lib/i18n';
import { getVisitorSessionId } from './VisitTracker';

// ─────────────────────────────────────────────────────────────────────────────
// Карточка квиза-консультации: диалог, быстрые варианты и поле ввода.
//
// Состояние — один массив ответов. Индекс текущего вопроса это его длина,
// история диалога тоже выводится из него, поэтому рассинхронизировать
// прогресс, ленту сообщений и счётчик в шапке нечем.
//
// Тексты приходят пропсом из i18n: компонент клиентский, но переводы остаются
// в общем словаре и не дублируются.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_ANSWER_LEN = 200;

/** Кольцевой индикатор прогресса в шапке карточки. */
function ProgressRing({ done, total, label }: { done: number; total: number; label: string }) {
  const size = 38;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? done / total : 0;

  return (
    <span
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-label={label}
      className="relative inline-flex shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke="currentColor"
          className="text-line"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke="currentColor"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          className="text-accent transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <span aria-hidden="true" className="absolute inset-0 grid place-items-center font-mono text-[10px] text-muted">
        {done}/{total}
      </span>
    </span>
  );
}

/** Бейдж «AI агент» над репликами ассистента. */
function AgentBadge({ label }: { label: string }) {
  return (
    <p className="mb-3 inline-flex items-center gap-2 rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-2 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-2" />
      </span>
      {label}
    </p>
  );
}

export default function QuizCard({
  text,
  locale,
  contactHref,
}: {
  text: QuizText;
  locale: Locale;
  contactHref: string;
}) {
  const [answers, setAnswers] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  // Разбор от модели: null — ещё не запрашивали, '' вместе с loading — в пути.
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const total = text.questions.length;
  const index = answers.length;
  const finished = index >= total;
  const current = finished ? null : text.questions[index];

  const logRef = useRef<HTMLDivElement>(null);
  // Прокручиваем ленту только после первого ответа: автоскролл на маунте
  // дёргал бы карточку у любого, кто просто пролистывает страницу мимо.
  const interacted = useRef(false);

  useEffect(() => {
    if (!interacted.current) return;
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [answers.length, result, loading]);

  const consult = async (collected: string[]) => {
    setLoading(true);
    setFailed(false);
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          locale,
          // Склейка заявки с визитом для вечернего отчёта (что человек смотрел).
          sid: getVisitorSessionId(),
          answers: collected.map((value, i) => ({ question: text.questions[i].title, answer: value })),
        }),
      });
      const data = (await response.json()) as { ok?: boolean; text?: string };
      if (!response.ok || !data.ok || !data.text) throw new Error('quiz request failed');
      setResult(data.text);
    } catch {
      // Причина наружу не важна: ответы никуда не делись, пользователю нужна
      // только кнопка «попробовать снова» и запасной путь в Telegram.
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const answer = (value: string) => {
    const clean = value.trim().slice(0, MAX_ANSWER_LEN);
    if (!clean || finished) return;
    interacted.current = true;
    const next = [...answers, clean];
    setAnswers(next);
    setDraft('');
    // Последний ответ сразу уходит на разбор — лишнего клика тут не нужно.
    if (next.length >= total) void consult(next);
  };

  const restart = () => {
    interacted.current = false;
    setAnswers([]);
    setDraft('');
    setResult(null);
    setFailed(false);
    const el = logRef.current;
    if (el) el.scrollTop = 0;
  };

  const remainingLabel = finished ? text.done.badge : plural(locale, total - index, text.remaining);

  return (
    <div className="card mx-auto max-w-3xl overflow-hidden">
      {/* ── Шапка: прогресс ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-line px-5 py-4 sm:px-6">
        <ProgressRing done={index} total={total} label={remainingLabel} />
        <p className="font-mono text-xs text-muted sm:text-[13px]">{remainingLabel}</p>
      </div>

      {/* ── Диалог ──────────────────────────────────────────────────────── */}
      <div
        ref={logRef}
        aria-live="polite"
        className="max-h-80 space-y-6 overflow-y-auto px-5 py-6 sm:max-h-104 sm:px-6"
      >
        <div>
          <AgentBadge label={text.badge} />
          <p className="max-w-xl leading-relaxed text-muted">{text.intro}</p>
        </div>

        {/* Отвеченные вопросы: компактной парой «вопрос — ответ». */}
        {answers.map((value, i) => (
          <div key={i} className="space-y-3">
            <p className="max-w-xl text-sm leading-relaxed text-faint">{text.questions[i].title}</p>
            <p className="ml-auto w-fit max-w-[85%] rounded-lg rounded-br-sm border border-accent/25 bg-accent/10 px-4 py-2.5 text-sm text-ink">
              {value}
            </p>
          </div>
        ))}

        {/* Активный вопрос — крупный акцентный блок. */}
        {current && (
          <div>
            {answers.length > 0 && <AgentBadge label={text.badge} />}
            <h3 className="display-type text-xl font-bold leading-snug tracking-tight text-ink sm:text-2xl">
              {current.title}
            </h3>
            <p className="mt-2 max-w-xl leading-relaxed text-muted">{current.hint}</p>
          </div>
        )}

        {/* Финал: разбор от модели, а под ним переход к контактам. */}
        {finished && (
          <div>
            <AgentBadge label={text.badge} />

            {loading && (
              <p className="flex items-center gap-2 leading-relaxed text-muted">
                <span className="flex gap-1" aria-hidden="true">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:300ms]" />
                </span>
                {text.result.loading}
              </p>
            )}

            {!loading && result && (
              <>
                <h3 className="display-type text-xl font-bold leading-snug tracking-tight text-ink sm:text-2xl">
                  {text.result.title}
                </h3>
                {/* Модель отвечает обычным текстом; абзацы разделены пустой
                    строкой — отрисовываем их как есть, без markdown. */}
                <div className="mt-3 max-w-xl space-y-3">
                  {result
                    .split(/\n{2,}/)
                    .map((para) => para.trim())
                    .filter(Boolean)
                    .map((para, i) => (
                      <p key={i} className="leading-relaxed text-muted">
                        {para}
                      </p>
                    ))}
                </div>
                <p className="mt-4 max-w-xl leading-relaxed text-muted">{text.done.text}</p>
              </>
            )}

            {!loading && failed && (
              <>
                <h3 className="display-type text-xl font-bold leading-snug tracking-tight text-ink sm:text-2xl">
                  {text.done.title}
                </h3>
                <p className="mt-2 max-w-xl leading-relaxed text-muted">{text.result.error}</p>
                <button
                  type="button"
                  onClick={() => void consult(answers)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2/60 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent/40 hover:bg-surface-2"
                >
                  <FiRotateCcw size={14} aria-hidden="true" /> {text.result.retry}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Подвал: ввод или итог ───────────────────────────────────────── */}
      <div className="border-t border-line px-5 py-5 sm:px-6">
        {current ? (
          <>
            {current.options.length > 0 && (
              <div className="mb-4">
                <p className="eyebrow mb-3 text-faint">{text.quickLabel}</p>
                {/* На мобильных — одна строка с горизонтальным скроллом,
                    от sm — обычный перенос. Отрицательные отступы дают чипсам
                    уехать под край карточки, а не обрезаться по паддингу. */}
                <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:overflow-visible sm:px-0">
                  <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
                    {current.options.map((option) => (
                      <li key={option}>
                        <button
                          type="button"
                          onClick={() => answer(option)}
                          // Крупнее базового .chip: это зона нажатия пальцем,
                          // а не подпись к карточке.
                          className="chip whitespace-nowrap px-3 py-2.5 text-xs hover:border-accent/40 hover:bg-surface-2 hover:text-ink"
                        >
                          {option}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                answer(draft);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={MAX_ANSWER_LEN}
                placeholder={text.placeholder}
                aria-label={current.title}
                className="min-w-0 flex-1 rounded-lg border border-line bg-surface-2/60 px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-accent/50"
              />
              <button
                type="submit"
                disabled={draft.trim().length === 0}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-bg transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30 disabled:pointer-events-none disabled:opacity-40 sm:px-5"
              >
                {text.send}
                <FiArrowUpRight size={16} aria-hidden="true" />
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="eyebrow mb-3 text-faint">{text.done.recapLabel}</p>
              <ul className="flex flex-wrap gap-2">
                {answers.map((value, i) => (
                  // whitespace-normal: свободный ответ может быть длинным,
                  // пусть переносится, а не растягивает строку.
                  <li key={i} className="chip whitespace-normal px-3 py-1.5 text-xs">
                    {value}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={contactHref}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30"
              >
                {text.done.cta} <FiArrowUpRight size={16} aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2/60 px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-accent/40 hover:bg-surface-2"
              >
                <FiRotateCcw size={15} aria-hidden="true" /> {text.done.restart}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
