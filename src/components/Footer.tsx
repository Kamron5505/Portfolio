import type { SiteInfo, UiText } from '@/lib/content';

export default function Footer({ site, ui }: { site: SiteInfo; ui: UiText }) {
  return (
    <footer className="py-10">
      <div className="wrap flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="font-mono text-xs text-faint">
          © {new Date().getFullYear()} {site.name}. {ui.footer.built}
        </p>
        <p className="font-mono text-xs text-faint">
          {ui.footer.credit} {site.firstName}
        </p>
      </div>
    </footer>
  );
}
