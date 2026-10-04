import Reveal from './Reveal';

export default function SectionHeading({
  index,
  eyebrow,
  title,
  align = 'left',
}: {
  index: string;
  eyebrow: string;
  title: string;
  align?: 'left' | 'center';
}) {
  const centered = align === 'center';

  return (
    <Reveal>
      <div className={`mb-10 ${centered ? 'text-center' : ''}`}>
        <h2 className={`section-title ${centered ? 'mx-auto max-w-3xl text-balance text-3xl! sm:text-5xl!' : ''}`}>{title}</h2>
        <p className="eyebrow mt-3">
          <span className="text-faint">{index}</span> · {eyebrow}
        </p>
      </div>
    </Reveal>
  );
}
