import { getUiTexts } from '@/lib/admin-data';
import TextsEditor from './TextsEditor';

export const dynamic = 'force-dynamic';

export default async function TextsPage() {
  const texts = await getUiTexts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Тексты сайта</h1>
        <p className="mt-2 text-muted">
          Все надписи: заголовки секций, кнопки, блок «Обо мне», подвал и SEO-описание. Каждый язык
          сохраняется отдельно.
        </p>
      </div>

      <TextsEditor texts={texts} />
    </div>
  );
}
