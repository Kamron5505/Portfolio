import type { UiText } from '@/lib/content';
import type { Locale } from '@/lib/i18n';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import QuizCard from './QuizCard';

// Оболочка секции остаётся серверной: в клиентский бандл уезжает только
// QuizCard — то, что действительно интерактивно.
export default function Quiz({ ui, locale }: { ui: UiText; locale: Locale }) {
  return (
    <section id="quiz" className="scroll-mt-24 border-y border-line bg-surface-2/35 py-20 sm:py-28">
      <div className="wrap">
        <SectionHeading index="06" eyebrow={ui.quiz.eyebrow} title={ui.quiz.title} align="center" />

        <Reveal className="mx-auto mb-8 grid max-w-3xl gap-4 sm:grid-cols-3">
          {[
            ['Business context', 'Your niche, offer and current situation'],
            ['Conversion plan', 'The pages and paths that move people'],
            ['AI fit', 'Where automation can save time or create leverage'],
          ].map(([title, description]) => (
            <div key={title} className="border-t-2 border-accent pt-3">
              <h3 className="font-medium text-ink">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
            </div>
          ))}
        </Reveal>

        <Reveal>
          <QuizCard text={ui.quiz} locale={locale} contactHref="#contact" />
        </Reveal>
      </div>
    </section>
  );
}
