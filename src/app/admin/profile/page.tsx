import { getSiteSettings } from '@/lib/admin-data';
import ProfileForm from './ProfileForm';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const site = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Профиль</h1>
        <p className="mt-2 text-muted">
          Имя, контакты, фото и резюме. Эти данные попадают и в шапку сайта, и в разметку для поисковиков.
        </p>
      </div>

      <ProfileForm site={site} />
    </div>
  );
}
