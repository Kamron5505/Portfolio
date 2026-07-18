'use client';

import { useActionState, useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { deleteSocialAction, saveSocialAction, type ActionState } from '../actions';
import { Field, Input, StatusBanner, SubmitButton } from '@/components/admin/ui';
import SocialIcon, { ICON_NAMES } from '@/components/SocialIcon';
import type { SocialRow } from '@/lib/admin-data';

const initial: ActionState = {};

const selectClass =
  'w-full rounded-lg border border-line bg-surface-2/60 px-3 py-2.5 text-sm text-ink outline-none focus:border-accent/60';

function SocialForm({ social, onDone }: { social: SocialRow; onDone?: () => void }) {
  const [state, action] = useActionState(saveSocialAction, initial);
  const [icon, setIcon] = useState(social.icon || 'github');

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={social.id} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Название">
          <Input name="label" defaultValue={social.label} placeholder="GitHub" required />
        </Field>

        <Field label="Иконка">
          <div className="flex items-center gap-3">
            <select name="icon" value={icon} onChange={(e) => setIcon(e.target.value)} className={selectClass}>
              {ICON_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <span className="shrink-0 text-muted">
              <SocialIcon name={icon} size={22} />
            </span>
          </div>
        </Field>

        <Field label="Ник / хэндл" hint="Показывается только в подписи.">
          <Input name="handle" defaultValue={social.handle} placeholder="@kamron.devx" />
        </Field>

        <Field label="Сортировка">
          <Input name="sort" type="number" defaultValue={social.sort} className="w-24" />
        </Field>
      </div>

      <Field label="Ссылка">
        <Input name="url" type="url" defaultValue={social.url} placeholder="https://github.com/..." required />
      </Field>

      <StatusBanner state={state} />

      <div className="flex items-center gap-3">
        <SubmitButton>{social.id ? 'Сохранить' : 'Добавить'}</SubmitButton>
        {onDone && (
          <button type="button" onClick={onDone} className="text-sm text-faint hover:text-ink">
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}

function DeleteSocial({ id, label }: { id: number; label: string }) {
  const [, action] = useActionState(deleteSocialAction, initial);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Удалить «${label}»?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label={`Удалить ${label}`}
        className="rounded-md p-2 text-faint transition-colors hover:bg-red-500/10 hover:text-red-400"
      >
        <FiTrash2 size={16} />
      </button>
    </form>
  );
}

export default function SocialsManager({ socials }: { socials: SocialRow[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      {adding ? (
        <div className="card space-y-4 p-6">
          <h2 className="font-mono text-xs uppercase tracking-widest text-accent">Новая соцсеть</h2>
          <SocialForm
            social={{ id: 0, label: '', handle: '', url: '', icon: 'github', sort: socials.length }}
            onDone={() => setAdding(false)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
        >
          <FiPlus aria-hidden="true" /> Добавить соцсеть
        </button>
      )}

      <ul className="space-y-3">
        {socials.map((social) => (
          <li key={social.id} className="card p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-accent">
                <SocialIcon name={social.icon} size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{social.label}</p>
                <p className="truncate font-mono text-xs text-faint">{social.url}</p>
              </div>
              <DeleteSocial id={social.id} label={social.label} />
            </div>

            <SocialForm social={social} />
          </li>
        ))}
      </ul>
    </div>
  );
}
