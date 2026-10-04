import type { UiText } from '@/lib/content';
import type { Locale } from '@/lib/i18n';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import QuizCard from './QuizCard';
import Slide from './Slide';

// Оболочка секции остаётся серверной: в клиентский бандл уезжает только
// QuizCard — то, что действительно интерактивно.
export default function Quiz({ ui, locale }: { ui: UiText; locale: Locale }) {
  return (
    <Slide id="quiz">
      <div className="slide-body">
        <SectionHeading index="06" eyebrow={ui.quiz.eyebrow} title={ui.quiz.title} align="center" />

        <Reveal className="mx-auto mb-8 grid max-w-3xl gap-4 sm:grid-cols-3">
          {ui.quizCards.map(([title, description]) => (
            <div key={title} className="rounded-lg border border-line bg-bg/40 p-4">
              <h3 className="font-condensed text-base font-medium uppercase tracking-[0.04em] text-ink">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
            </div>
          ))}
        </Reveal>

        <Reveal>
          <QuizCard text={ui.quiz} locale={locale} contactHref="#contact" />
        </Reveal>
      </div>
    </Slide>
  );
}
