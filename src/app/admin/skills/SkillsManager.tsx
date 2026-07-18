'use client';

import { useActionState, useState } from 'react';
import { FiChevronDown, FiPlus, FiTrash2 } from 'react-icons/fi';
import { deleteSkillGroupAction, saveSkillGroupAction, type ActionState } from '../actions';
import { Field, Input, StatusBanner, SubmitButton, Textarea } from '@/components/admin/ui';
import { LOCALES, type Locale } from '@/lib/i18n';
import type { SkillGroupRow } from '@/lib/admin-data';

const initial: ActionState = {};
const LOCALE_LABEL: Record<Locale, string> = { en: 'English', uz: "O'zbekcha", ru: 'Русский' };

function SkillForm({ group, onDone }: { group: SkillGroupRow; onDone?: () => void }) {
  const [state, action] = useActionState(saveSkillGroupAction, initial);

  return (
    <form action={action} className="space-y-5 border-t border-line p-6">
      <input type="hidden" name="id" value={group.id} />

      <div className="grid gap-4 sm:grid-cols-3">
        {LOCALES.map((l) => (
          <Field key={l} label={`Название — ${LOCALE_LABEL[l]}`}>
            <Input name={`title_${l}`} defaultValue={group.titles[l] ?? ''} />
          </Field>
        ))}
      </div>

      <Field label="Технологии" hint="Через запятую: React, Next.js, TypeScript">
        <Textarea name="items" rows={3} defaultValue={group.items.join(', ')} />
      </Field>

      <Field label="Сортировка">
        <Input name="sort" type="number" defaultValue={group.sort} className="w-24" />
      </Field>

      <StatusBanner state={state} />

      <div className="flex items-center gap-3">
        <SubmitButton>{group.id ? 'Сохранить' : 'Добавить группу'}</SubmitButton>
        {onDone && (
          <button type="button" onClick={onDone} className="text-sm text-faint hover:text-ink">
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}

function DeleteGroup({ id, title }: { id: number; title: string }) {
  const [, action] = useActionState(deleteSkillGroupAction, initial);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Удалить группу «${title}»?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label={`Удалить ${title}`}
        className="rounded-md p-2 text-faint transition-colors hover:bg-red-500/10 hover:text-red-400"
      >
        <FiTrash2 size={16} />
      </button>
    </form>
  );
}

export default function SkillsManager({ groups }: { groups: SkillGroupRow[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const titleOf = (g: SkillGroupRow) => g.titles.ru || g.titles.en || 'Без названия';

  return (
    <div className="space-y-4">
      {adding ? (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 font-mono text-xs uppercase tracking-widest text-accent">Новая группа</div>
          <SkillForm
            group={{ id: 0, sort: groups.length, items: [], titles: {} }}
            onDone={() => setAdding(false)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
        >
          <FiPlus aria-hidden="true" /> Добавить группу
        </button>
      )}

      <ul className="space-y-3">
        {groups.map((group) => (
          <li key={group.id} className="card overflow-hidden">
            <div className="flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{titleOf(group)}</p>
                <p className="mt-1 truncate font-mono text-xs text-faint">{group.items.join(' · ') || '—'}</p>
              </div>

              <button
                type="button"
                onClick={() => setOpenId(openId === group.id ? null : group.id)}
                className="rounded-md p-2 text-faint transition-colors hover:text-ink"
                aria-expanded={openId === group.id}
                aria-label="Редактировать"
              >
                <FiChevronDown
                  size={18}
                  className={`transition-transform ${openId === group.id ? 'rotate-180' : ''}`}
                />
              </button>

              <DeleteGroup id={group.id} title={titleOf(group)} />
            </div>

            {openId === group.id && <SkillForm group={group} onDone={() => setOpenId(null)} />}
          </li>
        ))}
      </ul>
    </div>
  );
}
