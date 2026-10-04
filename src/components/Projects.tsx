import type { ProjectItem, UiText } from '@/lib/content';
import ProjectCarousel from './ProjectCarousel';
import Reveal from './Reveal';
import Slide from './Slide';

const YEAR = new Date().getFullYear();

// Слайд «Recap Project»: заголовок с годом и карусель обложек.
export default function Projects({ ui, projects }: { ui: UiText; projects: ProjectItem[] }) {
  return (
    <Slide id="projects" variant="left">
      <div className="slide-body">
        <Reveal>
          <h2 className="section-title inline-flex items-end gap-3">
            {ui.projects.title} <span className="font-condensed text-2xl font-light sm:text-3xl">{YEAR}</span>
          </h2>
          <p className="eyebrow mt-3">{ui.projects.eyebrow}</p>
        </Reveal>
        <div className="-mt-12">
          <ProjectCarousel projects={projects} prev={ui.carousel.prev} next={ui.carousel.next} />
        </div>
      </div>
    </Slide>
  );
}
