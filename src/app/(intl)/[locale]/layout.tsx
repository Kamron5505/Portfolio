import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import RootDocument from '@/components/RootDocument';
import { isLocale } from '@/lib/i18n';
import { buildMetadata } from '@/lib/seo';

// Only /uz and /ru are prerendered; anything else under this segment 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: 'uz' }, { locale: 'ru' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return buildMetadata(locale);
}

export const viewport: Viewport = {
  themeColor: '#0b0f12',
  width: 'device-width',
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <RootDocument locale={locale}>{children}</RootDocument>;
}
