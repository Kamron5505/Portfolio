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
  // Секции сайта выровнены влево. center нужен там, где заголовок работает
  // подводкой к одному центральному блоку (квиз), а не меткой колонки текста.
  align?: 'left' | 'center';
}) {
  const centered = align === 'center';

  return (
    <Reveal>
      <div className={`mb-10 ${centered ? 'text-center' : ''}`}>
        <p className="eyebrow mb-3">
          {index} <span className="text-faint">{'//'}</span> {eyebrow}
        </p>
        <h2 className={`section-title ${centered ? 'mx-auto max-w-3xl text-balance' : ''}`}>{title}</h2>
      </div>
    </Reveal>
  );
}
