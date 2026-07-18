import { getProjects } from '@/lib/admin-data';
import ProjectsManager from './ProjectsManager';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Проекты</h1>
        <p className="mt-2 text-muted">
          Порядок задаётся числом в поле «Сортировка»: чем меньше, тем выше. Крупные проекты можно
          отметить как избранные — они занимают всю ширину.
        </p>
      </div>

      <ProjectsManager projects={projects} />
    </div>
  );
}
