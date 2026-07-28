import { notFound } from 'next/navigation';
import { OG_CONTENT_TYPE, OG_SIZE, ogAlt, renderOgImage } from '@/lib/og';
import { isLocale } from '@/lib/i18n';

// Соцкартинка для /uz и /ru. Группы маршрутов не наследуют метафайлы друг у
// друга: без этого файла у языковых страниц не было бы ни og:image, ни
// twitter:image, и ссылка на них разворачивалась бы в соцсетях пустой карточкой.
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return [{ locale: 'uz' }, { locale: 'ru' }];
}

export async function generateImageMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return [{ id: locale, size: OG_SIZE, alt: ogAlt(locale), contentType: OG_CONTENT_TYPE }];
}

export default async function LocaleOGImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return renderOgImage(locale);
}
