'use client';

import { useActionState, useState } from 'react';
import { FiChevronDown, FiPlus, FiTrash2 } from 'react-icons/fi';
import { deleteServiceAction, saveServiceAction, type ActionState } from '../actions';
import { Field, Input, StatusBanner, SubmitButton, Textarea } from '@/components/admin/ui';
import { LOCALES, type Locale } from '@/lib/i18n';
import type { ServiceRow } from '@/lib/admin-data';

const initial: ActionState = {};
const LOCALE_LABEL: Record<Locale, string> = { en: 'English', uz: "O'zbekcha", ru: 'Русский' };

function ServiceForm({ service, onDone }: { service: ServiceRow; onDone?: () => void }) {
  const [state, action] = useActionState(saveServiceAction, initial);
  const [locale, setLocale] = useState<Locale>('ru');

  return (
    <form action={action} className="space-y-5 border-t border-line p-6">
      <input type="hidden" name="id" value={service.id} />

      <Field label="Сортировка">
        <Input name="sort" type="number" defaultValue={service.sort} className="w-24" />
      </Field>

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

        {LOCALES.map((l) => (
          <div key={l} className={l === locale ? 'space-y-4' : 'hidden'}>
            <Field label={`Название — ${LOCALE_LABEL[l]}`}>
              <Input name={`title_${l}`} defaultValue={service.translations[l]?.title ?? ''} />
            </Field>
            <Field label={`Описание — ${LOCALE_LABEL[l]}`}>
              <Textarea name={`description_${l}`} rows={3} defaultValue={service.translations[l]?.description ?? ''} />
            </Field>
          </div>
        ))}
      </div>

      <StatusBanner state={state} />

      <div className="flex items-center gap-3">
        <SubmitButton>{service.id ? 'Сохранить' : 'Добавить услугу'}</SubmitButton>
        {onDone && (
          <button type="button" onClick={onDone} className="text-sm text-faint hover:text-ink">
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}

function DeleteService({ id, title }: { id: number; title: string }) {
  const [, action] = useActionState(deleteServiceAction, initial);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Удалить услугу «${title}»?`)) e.preventDefault();
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

export default function ServicesManager({ services }: { services: ServiceRow[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const titleOf = (s: ServiceRow) => s.translations.ru?.title || s.translations.en?.title || 'Без названия';

  return (
    <div className="space-y-4">
      {adding ? (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 font-mono text-xs uppercase tracking-widest text-accent">Новая услуга</div>
          <ServiceForm
            service={{ id: 0, sort: services.length, translations: {} }}
            onDone={() => setAdding(false)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
        >
          <FiPlus aria-hidden="true" /> Добавить услугу
        </button>
      )}

      <ul className="space-y-3">
        {services.map((service) => (
          <li key={service.id} className="card overflow-hidden">
            <div className="flex items-center gap-4 p-4">
              <span className="font-mono text-xs text-faint">{String(service.sort + 1).padStart(2, '0')}</span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{titleOf(service)}</p>
                <p className="truncate text-xs text-faint">
                  {service.translations.ru?.description || service.translations.en?.description || '—'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpenId(openId === service.id ? null : service.id)}
                className="rounded-md p-2 text-faint transition-colors hover:text-ink"
                aria-expanded={openId === service.id}
                aria-label="Редактировать"
              >
                <FiChevronDown
                  size={18}
                  className={`transition-transform ${openId === service.id ? 'rotate-180' : ''}`}
                />
              </button>

              <DeleteService id={service.id} title={titleOf(service)} />
            </div>

            {openId === service.id && <ServiceForm service={service} onDone={() => setOpenId(null)} />}
          </li>
        ))}
      </ul>
    </div>
  );
}
