'use client';

import { useActionState, useState } from 'react';
import { FiChevronDown, FiPlus, FiStar, FiTrash2 } from 'react-icons/fi';
import { deleteProjectAction, saveProjectAction, type ActionState } from '../actions';
import { Checkbox, Field, Input, StatusBanner, SubmitButton, Textarea } from '@/components/admin/ui';
import { LOCALES, type Locale } from '@/lib/i18n';
import type { ProjectRow } from '@/lib/admin-data';

const initial: ActionState = {};

const LOCALE_LABEL: Record<Locale, string> = { en: 'English', uz: "O'zbekcha", ru: 'Русский' };

const empty: ProjectRow = {
  id: 0,
  name: '',
  href: '',
  cover: null,
  tags: [],
  featured: false,
  sort: 0,
  translations: {},
};

function ProjectForm({ project, onDone }: { project: ProjectRow; onDone?: () => void }) {
  const [state, action] = useActionState(saveProjectAction, initial);
  const [locale, setLocale] = useState<Locale>('en');
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <form action={action} className="space-y-5 border-t border-line p-6">
      <input type="hidden" name="id" value={project.id} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Название">
          <Input name="name" defaultValue={project.name} required />
        </Field>
        <Field label="Ссылка" hint="GitHub или живой сайт.">
          <Input name="href" type="url" defaultValue={project.href} placeholder="https://" />
        </Field>
      </div>

      <Field label="Теги" hint="Через запятую: React, TypeScript, PostgreSQL">
        <Input name="tags" defaultValue={project.tags.join(', ')} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <Field label="Обложка" hint="Соотношение 16:9. Без неё карточка просто без картинки.">
          <Input
            name="coverFile"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setPreview(f ? URL.createObjectURL(f) : null);
            }}
          />
        </Field>
        <Field label="Сортировка">
          <Input name="sort" type="number" defaultValue={project.sort} className="w-24" />
        </Field>
        <div className="pb-2.5">
          <Checkbox name="featured" label="Избранный" defaultChecked={project.featured} />
        </div>
      </div>

      {(preview || project.cover) && (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview ?? project.cover!}
            alt="Обложка"
            className="h-20 w-36 rounded-lg border border-line object-cover"
          />
          {project.cover && !preview && <Checkbox name="removeCover" label="Удалить обложку" />}
        </div>
      )}

      {/* Описание хранится на трёх языках. Вкладки просто переключают видимость:
          все поля остаются в DOM, поэтому форма отправляет их разом. */}
      <div>
        <div className="mb-3 flex gap-1">
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              className={`rounded-md px-3 py-1.5 font-mono text-xs transition-colors ${
                l === locale ? 'bg-accent/15 text-accent' : 'text-faint hover:text-ink'
              }`}
            >
              {LOCALE_LABEL[l]}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {LOCALES.map((l) => (
            <div key={l} className={l === locale ? 'space-y-4' : 'hidden'}>
              <Field label={`Описание — ${LOCALE_LABEL[l]}`}>
                <Textarea
                  name={`description_${l}`}
                  rows={3}
                  defaultValue={project.translations[l]?.description ?? ''}
                />
              </Field>
              <Field label={`Подпись — ${LOCALE_LABEL[l]}`} hint="Например: Коммерция · 2025">
                <Input name={`meta_${l}`} defaultValue={project.translations[l]?.meta ?? ''} />
              </Field>
            </div>
          ))}
        </div>
      </div>

      <StatusBanner state={state} />

      <div className="flex items-center gap-3">
        <SubmitButton>{project.id ? 'Сохранить' : 'Добавить проект'}</SubmitButton>
        {onDone && (
          <button type="button" onClick={onDone} className="text-sm text-faint hover:text-ink">
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}

function DeleteProject({ id, name }: { id: number; name: string }) {
  const [state, action] = useActionState(deleteProjectAction, initial);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        // Подтверждение: удаление проекта необратимо и уносит с собой обложку.
        if (!confirm(`Удалить проект «${name}»? Это действие необратимо.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label={`Удалить ${name}`}
        title={state.error ?? 'Удалить'}
        className="rounded-md p-2 text-faint transition-colors hover:bg-red-500/10 hover:text-red-400"
      >
        <FiTrash2 size={16} />
      </button>
    </form>
  );
}

export default function ProjectsManager({ projects }: { projects: ProjectRow[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      {adding ? (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 font-mono text-xs uppercase tracking-widest text-accent">Новый проект</div>
          <ProjectForm project={{ ...empty, sort: projects.length }} onDone={() => setAdding(false)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
        >
          <FiPlus aria-hidden="true" /> Добавить проект
        </button>
      )}

      {projects.length === 0 && !adding && (
        <p className="card p-6 text-sm text-muted">
          Проектов пока нет. Пока таблица пуста, сайт показывает список из кода — добавьте первый
          проект, и он полностью заменит его.
        </p>
      )}

      <ul className="space-y-3">
        {projects.map((project) => (
          <li key={project.id} className="card overflow-hidden">
            <div className="flex items-center gap-4 p-4">
              {project.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.cover}
                  alt=""
                  className="h-12 w-20 shrink-0 rounded-md border border-line object-cover"
                />
              ) : (
                <div className="grid h-12 w-20 shrink-0 place-items-center rounded-md border border-line bg-surface-2/60 font-mono text-[10px] text-faint">
                  нет фото
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate font-medium text-ink">
                  {project.name}
                  {project.featured && <FiStar size={13} className="shrink-0 text-accent-2" aria-label="Избранный" />}
                </p>
                <p className="truncate font-mono text-xs text-faint">
                  {project.tags.join(' · ') || 'без тегов'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpenId(openId === project.id ? null : project.id)}
                className="rounded-md p-2 text-faint transition-colors hover:text-ink"
                aria-expanded={openId === project.id}
                aria-label="Редактировать"
              >
                <FiChevronDown
                  size={18}
                  className={`transition-transform ${openId === project.id ? 'rotate-180' : ''}`}
                />
              </button>

              <DeleteProject id={project.id} name={project.name} />
            </div>

            {openId === project.id && <ProjectForm project={project} onDone={() => setOpenId(null)} />}
          </li>
        ))}
      </ul>
    </div>
  );
}
