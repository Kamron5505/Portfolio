import type { IconType } from 'react-icons';
import { RiOpenaiFill } from 'react-icons/ri';
import {
  SiClaude,
  SiDeepseek,
  SiGooglegemini,
  SiNextdotjs,
  SiNodedotjs,
  SiOllama,
  SiPostgresql,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTelegram,
  SiTypescript,
  SiVercel,
} from 'react-icons/si';
import { AI_TOOLS } from '@/lib/ai-tools';
import HermesIcon from './HermesIcon';
import type { SkillGroupItem, UiText } from '@/lib/content';
import Marquee from './Marquee';
import Reveal from './Reveal';
import Slide from './Slide';

// Иконки для строк в колонках групп; без совпадения — точка.
const ITEM_ICONS: Record<string, IconType> = {
  Claude: SiClaude,
  'Claude Code': SiClaude,
  'OpenAI Codex': RiOpenaiFill,
  GPT: RiOpenaiFill,
  Gemini: SiGooglegemini,
  DeepSeek: SiDeepseek,
  Ollama: SiOllama,
  'Hermes Agent': HermesIcon as IconType,
  'Telegram Bot API': SiTelegram,
  'Node.js': SiNodedotjs,
  Python: SiPython,
  PostgreSQL: SiPostgresql,
  React: SiReact,
  'Next.js': SiNextdotjs,
  TypeScript: SiTypescript,
  'Tailwind CSS': SiTailwindcss,
  Vercel: SiVercel,
};

export default function Skills({ ui, skills }: { ui: UiText; skills: SkillGroupItem[] }) {
  return (
    <Slide id="skills" variant="left">
      <div className="slide-body">
        <Reveal>
          <h2 className="section-title">{ui.skills.title}</h2>
          <p className="eyebrow mt-3">{ui.skills.eyebrow}</p>
        </Reveal>

        {/* Лента «иконок приложений», как блок Software Skills в референсе,
            сама плавно едет вправо. */}
        <Reveal className="mt-10 mr-[calc(50%-50vw)] ml-[calc(50%-50vw)]">
          <Marquee speed={35}>
            {AI_TOOLS.map(({ label, Icon, color }) => (
              <div key={label} className="mr-5 flex w-20 flex-col items-center gap-2 py-2">
                <span
                  className="app-tile h-16! w-16! text-[30px]!"
                  style={{
                    color,
                    borderColor: `${color}55`,
                    background: `linear-gradient(160deg, ${color}26, #050a14 70%)`,
                  }}
                >
                  <Icon aria-hidden="true" />
                </span>
                <span className="text-center text-[10px] font-semibold uppercase leading-tight tracking-[0.08em] text-muted">
                  {label}
                </span>
              </div>
            ))}
          </Marquee>
        </Reveal>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {skills.map((group, i) => (
            <Reveal key={group.id} delay={i * 0.07}>
              <h3 className="font-condensed text-lg font-medium uppercase tracking-[0.06em] text-ink">{group.title}</h3>
              <ul className="mt-3 space-y-1.5">
                {group.items.map((item) => {
                  const Icon = ITEM_ICONS[item];
                  return (
                    <li key={item} className="flex items-center gap-2 text-xs uppercase tracking-[0.06em] text-muted">
                      {Icon ? (
                        <Icon className="text-accent" size={12} aria-hidden="true" />
                      ) : (
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
                      )}
                      {item}
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </Slide>
  );
}
