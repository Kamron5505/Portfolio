import type { UiText } from '@/lib/content';
import type { Locale } from '@/lib/i18n';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import QuizCard from './QuizCard';

// Оболочка секции остаётся серверной: в клиентский бандл уезжает только
// QuizCard — то, что действительно интерактивно.
export default function Quiz({ ui, locale }: { ui: UiText; locale: Locale }) {
  return (
    <section id="quiz" className="scroll-mt-24 py-24">
      <div className="wrap">
        <SectionHeading index="06" eyebrow={ui.quiz.eyebrow} title={ui.quiz.title} align="center" />

        <Reveal>
          <QuizCard text={ui.quiz} locale={locale} contactHref="#contact" />
        </Reveal>
      </div>
    </section>
  );
}
