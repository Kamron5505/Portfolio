import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/data';

// Auto-generated 1200×630 social preview — no binary asset needed. Next.js wires
// this into og:image (and twitter:image) automatically and caches it on the CDN.
export const alt = `${SITE.name} — ${SITE.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
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
            {`${SITE.role} · ${SITE.subRole}`}
          </div>
          <div style={{ fontSize: 26, color: '#8A8F9A', marginTop: 20, maxWidth: 900 }}>
            {SITE.tagline}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
