import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { loadDay, windowKey } from '@/lib/analytics-store';
import { buildMessage, buildPrompt, summarize } from '@/lib/daily-report';
import { generateText } from '@/lib/gemini';
import { sendToOwner } from '@/lib/telegram';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ─────────────────────────────────────────────────────────────────────────────
// Ежедневный ИИ-отчёт владельцу в Telegram (Vercel Cron, 21:00 по Ташкенту).
//
// 1. Берёт из Redis визиты и заявки квиза за «день» (21:00 → 21:00).
// 2. Считает статистику сам: посетители, источники, страны, устройства,
//    интерес к секциям, клики, самые вовлечённые визиты.
// 3. Gemini по этой сводке пишет выводы: что заинтересовало людей, кому из
//    заявок написать в первую очередь и что улучшить на сайте.
//
// Вызов только с секретом: Vercel Cron сам шлёт Authorization: Bearer
// $CRON_SECRET. Для ручной проверки: /api/report?day=YYYY-MM-DD с тем же
// заголовком.
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  // Сравнение за постоянное время: по задержке ответа нельзя подбирать секрет.
  const digest = (v: string) => createHash('sha256').update(v).digest();
  if (!timingSafeEqual(digest(req.headers.get('authorization') ?? ''), digest(`Bearer ${secret}`))) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  // Cron на бесплатном тарифе Vercel может сработать в течение часа после
  // 21:00, поэтому берём окно, которое было активно два часа назад, — это
  // всегда только что закончившийся «день».
  const requested = req.nextUrl.searchParams.get('day');
  const day = requested && /^\d{4}-\d{2}-\d{2}$/.test(requested) ? requested : windowKey(new Date(Date.now() - 2 * 3600_000));

  try {
    const { sessions, leads } = await loadDay(day);
    const stats = summarize(sessions, leads);
    const insights = stats.visits || stats.leads.length ? await generateText(buildPrompt(day, stats)) : null;
    const sent = await sendToOwner(buildMessage(day, stats, insights));
    return NextResponse.json({ ok: sent, day, visits: stats.visits, leads: stats.leads.length });
  } catch (error) {
    console.error('[report] не удалось собрать отчёт:', error);
    return NextResponse.json({ ok: false, error: 'failed' }, { status: 500 });
  }
}
