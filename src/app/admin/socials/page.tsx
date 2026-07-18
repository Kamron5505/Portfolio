import { getSocials } from '@/lib/admin-data';
import SocialsManager from './SocialsManager';

export const dynamic = 'force-dynamic';

export default async function SocialsPage() {
  const socials = await getSocials();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Соцсети</h1>
        <p className="mt-2 text-muted">
          Ссылки показываются в шапке и в контактах. Они же уходят в разметку schema.org (sameAs) —
          так поисковики понимают, что все эти профили принадлежат вам.
        </p>
      </div>

      <SocialsManager socials={socials} />
    </div>
  );
}
