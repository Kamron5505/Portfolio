import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/data';

// Generated 180×180 Apple touch icon — Next.js wires this into
// <link rel="apple-touch-icon"> automatically. No binary asset needed.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#08080C',
          color: '#6366F1',
          fontSize: 96,
          fontWeight: 700,
          fontFamily: 'sans-serif',
          borderRadius: 40,
        }}
      >
        {SITE.initials}
      </div>
    ),
    { ...size },
  );
}
