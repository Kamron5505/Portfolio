import type { Metadata, Viewport } from 'next';
import RootDocument from '@/components/RootDocument';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('en');
}

export const viewport: Viewport = {
  themeColor: '#08080C',
  width: 'device-width',
  initialScale: 1,
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument locale="en">{children}</RootDocument>;
}
