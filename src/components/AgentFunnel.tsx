'use client';

import { FunnelChart } from './charts/funnel-chart';

// Воронка Bklit UI: как ИИ-агент доводит посетителя до заявки в Telegram.
// Цифры условные — подпись note прямо говорит, что это пример.
const VALUES = [1000, 420, 180, 180];

export default function AgentFunnel({ title, note, stages }: { title: string; note: string; stages: string[] }) {
  return (
    <figure className="mt-10 rounded-2xl border border-line bg-bg/40 p-5 sm:p-8">
      <figcaption className="flex flex-wrap items-end justify-between gap-2">
        <span className="font-condensed text-xl uppercase tracking-[0.04em] text-ink">{title}</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">{note}</span>
      </figcaption>
      <div className="mt-6 h-[260px] sm:h-[300px]">
        <FunnelChart
          data={stages.map((label, i) => ({ label, value: VALUES[i] ?? 0 }))}
          color="#c8102e"
          className="h-full w-full"
        />
      </div>
    </figure>
  );
}
