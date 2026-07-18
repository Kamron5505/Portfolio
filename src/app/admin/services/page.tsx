import { getServices } from '@/lib/admin-data';
import ServicesManager from './ServicesManager';

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Услуги</h1>
        <p className="mt-2 text-muted">Блок «Что я делаю» на главной. Каждая услуга — на трёх языках.</p>
      </div>

      <ServicesManager services={services} />
    </div>
  );
}
