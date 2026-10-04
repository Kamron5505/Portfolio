import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Highlights from '@/components/Highlights';
import Quiz from '@/components/Quiz';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { getContent } from '@/lib/content';
import type { Locale } from '@/lib/i18n';

// Контент читается из базы ровно один раз за рендер страницы и передаётся
// секциям пропсами — так секции остаются презентационными, а запрос не
// дублируется в каждой из них.
export default async function HomeSections({ locale }: { locale: Locale }) {
  const { site, ui, socials, projects, skills, services, highlights } = await getContent(locale);

  // Пункт меню для хайлайтов добавляем только когда секция непустая — иначе
  // ссылка вела бы на несуществующий якорь.
  const nav =
    highlights.length > 0
      ? (() => {
          const items = [...ui.nav];
          const at = items.findIndex((n) => n.href === '#contact');
          const entry = { label: ui.highlights.title, href: '#highlights' };
          items.splice(at === -1 ? items.length : at, 0, entry);
          return items;
        })()
      : ui.nav;

  return (
    <>
      <Navbar locale={locale} nav={nav} cta={ui.hero.getInTouch} install={ui.install} />
      <main id="main">
        <Hero site={site} ui={ui} socials={socials} services={services} />
        <About site={site} ui={ui} />
        <Services ui={ui} services={services} />
        <Skills ui={ui} skills={skills} />
        <Projects ui={ui} projects={projects} />
        <Highlights ui={ui} highlights={highlights} />
        <Quiz ui={ui} locale={locale} />
        <Contact site={site} ui={ui} socials={socials} />
      </main>
      <Footer site={site} ui={ui} />
    </>
  );
}
