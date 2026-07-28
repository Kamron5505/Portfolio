import { NextRequest, NextResponse } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';

// ─────────────────────────────────────────────────────────────────────────────
// Консультация по итогам квиза. Ответы уходят в Gemini, обратно приходит
// разбор: воронка, состав работ и вилка стоимости.
//
// Ключ читается только на сервере (GEMINI_API_KEY, без префикса NEXT_PUBLIC_),
// поэтому в браузер он не попадает. Клиент видит лишь текст ответа.
// ─────────────────────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic';

// Модель закреплена явно, а не алиасом вида *-latest: у алиаса содержимое
// меняется без предупреждения. Сменить можно переменной окружения.
//
// Вторая модель — запасная. На бесплатном тарифе Gemini регулярно отдаёт 503
// («high demand») и 429 по квоте; без отката одна такая минута превращалась бы
// у посетителя в ошибку вместо консультации.
const MODELS = [process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest'];
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
/** Коды, при которых имеет смысл пробовать другую модель. */
const RETRYABLE = new Set([429, 500, 502, 503, 504]);

const MAX_ITEMS = 20;
const MAX_LEN = 300;
// Запрос к модели стоит денег, а роут открыт всему интернету: ограничиваем
// частоту. Счётчик живёт в памяти инстанса — на serverless это лишь заслон от
// случайного залипания кнопки, а не полноценная защита (см. README).
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 6;

type Answer = { question: string; answer: string };

const g = globalThis as { __quizRate?: Map<string, number[]> };
const rateState = () => (g.__quizRate ??= new Map<string, number[]>());

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateState().get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  rateState().set(ip, hits);

  // Заодно подчищаем чужие протухшие записи, чтобы карта не росла вечно.
  if (rateState().size > 500) {
    for (const [key, times] of rateState()) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) rateState().delete(key);
    }
  }

  return hits.length > RATE_MAX;
}

const LANGUAGE: Record<Locale, string> = {
  en: 'English',
  uz: 'Uzbek (latin script)',
  ru: 'Russian',
};

function buildPrompt(locale: Locale, answers: Answer[]): string {
  const transcript = answers.map((a, i) => `${i + 1}. ${a.question}\n   → ${a.answer}`).join('\n');

  return [
    `You are a senior web developer advising a prospective client. Reply in ${LANGUAGE[locale]} only.`,
    '',
    'The client answered an intake questionnaire:',
    '',
    transcript,
    '',
    'Write a short consultation of exactly four paragraphs, 1–3 sentences each, covering in order:',
    '',
    '- what kind of site fits and why, grounded in their answers;',
    '- the funnel: the path from first visit to enquiry for this niche and goal;',
    '- the scope: concrete blocks and integrations worth building first;',
    '- the estimate: a rough price range and timeline, stated plainly as preliminary and',
    '  firming up after a conversation. If their budget is unrealistic for what they asked',
    '  for, say so directly and suggest what to cut for a first release.',
    '',
    'Start each paragraph with a two-or-three word label of your own wording, written',
    `in ${LANGUAGE[locale]}, followed by a colon. Never write the labels in English unless`,
    `${LANGUAGE[locale]} is English. Do not number the paragraphs.`,
    '',
    'Rules: plain text only, no markdown, no bold, no bullet symbols, no headings. Separate',
    'paragraphs with a blank line. Be concrete and honest, never flattering. Do not invent',
    'facts the client did not give you. Under 220 words total.',
  ].join('\n');
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[quiz] GEMINI_API_KEY не задан — консультация недоступна.');
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { locale?: unknown; answers?: unknown };

    const locale: Locale = typeof body.locale === 'string' && isLocale(body.locale) ? body.locale : 'en';

    const answers: Answer[] = Array.isArray(body.answers)
      ? body.answers
          .slice(0, MAX_ITEMS)
          .map((item) => {
            const row = item as { question?: unknown; answer?: unknown };
            return {
              question: typeof row.question === 'string' ? row.question.slice(0, MAX_LEN) : '',
              answer: typeof row.answer === 'string' ? row.answer.slice(0, MAX_LEN) : '',
            };
          })
          .filter((a) => a.question && a.answer)
      : [];

    if (answers.length === 0) {
      return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
    }

    const payload = JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: buildPrompt(locale, answers) }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 800 },
    });

    for (const model of MODELS) {
      const response = await fetch(`${ENDPOINT}/${model}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
        body: payload,
      });

      if (!response.ok) {
        // Тело ошибки Google пишем в лог сервера, наружу не отдаём: там бывают
        // детали проекта и квоты.
        const detail = await response.text().catch(() => '');
        console.error(`[quiz] ${model} ответил`, response.status, detail.slice(0, 300));
        if (RETRYABLE.has(response.status)) continue;
        return NextResponse.json({ ok: false, error: 'upstream' }, { status: 502 });
      }

      const data = (await response.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };

      const text = (data.candidates?.[0]?.content?.parts ?? [])
        .map((p) => p.text ?? '')
        .join('')
        .trim();

      if (text) return NextResponse.json({ ok: true, text });
      console.error(`[quiz] ${model} вернул пустой ответ`);
    }

    return NextResponse.json({ ok: false, error: 'upstream' }, { status: 502 });
  } catch (error) {
    console.error('[quiz] запрос не выполнен:', error);
    return NextResponse.json({ ok: false, error: 'failed' }, { status: 500 });
  }
}
