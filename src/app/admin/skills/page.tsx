import { getSkillGroups } from '@/lib/admin-data';
import SkillsManager from './SkillsManager';

export const dynamic = 'force-dynamic';

export default async function SkillsPage() {
  const groups = await getSkillGroups();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Навыки</h1>
        <p className="mt-2 text-muted">
          Группы технологий: например «Frontend» со списком React, Next.js и так далее. Название
          группы переводится, сами технологии — нет.
        </p>
      </div>

      <SkillsManager groups={groups} />
    </div>
  );
}
