'use client';

import Image from 'next/image';
import { useState } from 'react';

// Renders the portrait when a real photo exists at `src`; if that asset is
// missing (404) or fails to load, it silently falls back to the initials
// instead of showing a broken-image icon. This keeps the layout intact whether
// or not a photo has been uploaded through the admin panel yet.
export default function Avatar({
  src,
  alt,
  initials,
}: {
  src: string;
  alt: string;
  initials: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gradient-to-br from-surface-2 to-surface">
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center font-display text-7xl font-bold text-white/10"
      >
        {initials}
      </span>
      {src && !failed && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="320px"
          className="object-cover object-top"
          priority
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
