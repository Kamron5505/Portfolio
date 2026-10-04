'use client';

import { Bot, Globe, Send } from 'lucide-react';
import type { ServiceItem } from '@/lib/content';
import SpotlightCards from './kokonutui/spotlight-cards';

// Иконки — компоненты-функции, их нельзя передать из серверного компонента,
// поэтому сопоставление «услуга → иконка» живёт здесь, на клиенте.
// Порядок совпадает с services.items в i18n: сайты, боты, ИИ-агент в боте.
const STYLE = [
  { icon: Globe, color: '#a9d4ff' },
  { icon: Send, color: '#29a9eb' },
  { icon: Bot, color: '#ff3b5c' },
];

export default function ServiceCards({ services }: { services: ServiceItem[] }) {
  return (
    <SpotlightCards
      heading=""
      className="rounded-none bg-transparent px-0 pt-0 pb-0 dark:bg-transparent"
      gridClassName="grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-3"
      items={services.map((s, i) => ({
        ...(STYLE[i] ?? STYLE[STYLE.length - 1]),
        title: s.title,
        description: s.description,
        badge: i === services.length - 1 ? 'Telegram · AI' : undefined,
      }))}
    />
  );
}
