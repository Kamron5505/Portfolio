import { ImageResponse } from 'next/og';
import { SITE } from './data';
import { getDict, type Locale } from './i18n';

// ─────────────────────────────────────────────────────────────────────────────
// Генератор соцкартинки 1200×630. Живёт отдельно от маршрутов, потому что
// нужен дважды: app/opengraph-image.tsx отдаёт картинку для «/», а
// app/(intl)/[locale]/opengraph-image.tsx — для /uz и /ru. Без второго файла
// языковые страницы уходили в соцсети вообще без og:image, потому что группы
// маршрутов не наследуют метафайлы друг у друга.
// ─────────────────────────────────────────────────────────────────────────────

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

export const ogAlt = (locale: Locale) => `${SITE.name} — ${getDict(locale).role}`;

export function renderOgImage(locale: Locale) {
  const dict = getDict(locale);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: '#08080C',
          backgroundImage:
            'radial-gradient(900px 500px at 85% -10%, rgba(99,102,241,0.35), transparent 60%), radial-gradient(700px 400px at 0% 20%, rgba(34,211,238,0.18), transparent 55%)',
          color: '#E7E8EE',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              border: '2px solid #6366F1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 700,
              color: '#6366F1',
            }}
          >
            {SITE.initials}
          </div>
          <span style={{ fontSize: 24, color: '#8A8F9A' }}>{SITE.url.replace('https://', '')}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 82, fontWeight: 700, letterSpacing: '-0.03em' }}>{SITE.name}</div>
          <div style={{ display: 'flex', fontSize: 34, color: '#6366F1', marginTop: 8 }}>
            {`${dict.role} · ${dict.subRole}`}
          </div>
          <div style={{ fontSize: 26, color: '#8A8F9A', marginTop: 20, maxWidth: 900 }}>
            {dict.tagline}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
