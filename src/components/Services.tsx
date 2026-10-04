import type { ServiceItem, UiText } from '@/lib/content';
import AgentFunnel from './AgentFunnel';
import Reveal from './Reveal';
import ServiceCards from './ServiceCards';
import Slide from './Slide';

export default function Services({ ui, services }: { ui: UiText; services: ServiceItem[] }) {
  return (
    <Slide id="services">
      <div className="slide-body">
        <Reveal className="text-center">
          <h2 className="section-title">{ui.services.title}</h2>
          <p className="eyebrow mt-3">{ui.services.eyebrow}</p>
        </Reveal>

        <Reveal className="mt-12">
          <ServiceCards services={services} />
        </Reveal>

        <Reveal>
          <AgentFunnel {...ui.services.funnel} />
        </Reveal>
      </div>
    </Slide>
  );
}
