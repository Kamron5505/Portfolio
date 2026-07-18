'use client';

import { useActionState, useState } from 'react';
import { FiChevronDown, FiFilm, FiImage, FiPlus, FiTrash2 } from 'react-icons/fi';
import { deleteHighlightAction, saveHighlightAction, type ActionState } from '../actions';
import { Field, Input, StatusBanner, SubmitButton, Textarea } from '@/components/admin/ui';
import { LOCALES, type Locale } from '@/lib/i18n';
import type { HighlightRow } from '@/lib/admin-data';

const initial: ActionState = {};
const LOCALE_LABEL: Record<Locale, string> = { en: 'English', uz: "O'zbekcha", ru: 'Русский' };

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(url);
}

function HighlightForm({ item, onDone }: { item: HighlightRow; onDone?: () => void }) {
  const [state, action] = useActionState(saveHighlightAction, initial);
  const [preview, setPreview] = useState<{ url: string; video: boolean } | null>(null);

  const current = preview ?? (item.src ? { url: item.src, video: item.kind === 'video' } : null);

  return (
    <form action={action} className="space-y-5 border-t border-line p-6">
      <input type="hidden" name="id" value={item.id} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Файл" hint="Фото (JPG, PNG, WebP) или видео (MP4, WebM, MOV).">
          <Input
            name="mediaFile"
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setPreview(f ? { url: URL.createObjectURL(f), video: f.type.startsWith('video/') } : null);
            }}
          />
        </Field>

        <Field label="или ссылка на медиа" hint="Прямой URL на фото/видео. Для тяжёлых роликов.">
          <Input
            name="externalUrl"
            type="url"
            defaultValue={item.src.startsWith('http') ? item.src : ''}
            placeholder="https://..."
          />
        </Field>
      </div>

      {current && (
        <div className="overflow-hidden rounded-lg border border-line">
          {current.video ? (
            <video src={current.url} controls preload="metadata" className="max-h-64 w-full bg-black" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.url} alt="Превью" className="max-h-64 w-full object-contain bg-surface-2" />
          )}
        </div>
      )}

      <Field label="Сортировка">
        <Input name="sort" type="number" defaultValue={item.sort} className="w-24" />
      </Field>

      <div>
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-faint">
          Подпись (необязательно)
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {LOCALES.map((l) => (
            <Field key={l} label={LOCALE_LABEL[l]}>
              <Textarea name={`caption_${l}`} rows={2} defaultValue={item.translations[l]?.caption ?? ''} />
            </Field>
          ))}
        </div>
      </div>

      <StatusBanner state={state} />

      <div className="flex items-center gap-3">
        <SubmitButton>{item.id ? 'Сохранить' : 'Добавить'}</SubmitButton>
        {onDone && (
          <button type="button" onClick={onDone} className="text-sm text-faint hover:text-ink">
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}

function DeleteHighlight({ id }: { id: number }) {
  const [, action] = useActionState(deleteHighlightAction, initial);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('Удалить этот элемент?')) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label="Удалить"
        className="rounded-md p-2 text-faint transition-colors hover:bg-red-500/10 hover:text-red-400"
      >
        <FiTrash2 size={16} />
      </button>
    </form>
  );
}

export default function HighlightsManager({ highlights }: { highlights: HighlightRow[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      {adding ? (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 font-mono text-xs uppercase tracking-widest text-accent">Новый элемент</div>
          <HighlightForm
            item={{ id: 0, kind: 'image', src: '', sort: highlights.length, translations: {} }}
            onDone={() => setAdding(false)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
        >
          <FiPlus aria-hidden="true" /> Добавить фото / видео
        </button>
      )}

      {highlights.length === 0 && !adding && (
        <p className="card p-6 text-sm text-muted">
          Пока пусто. Добавьте первый элемент — и секция «Хайлайты» появится на сайте.
        </p>
      )}

      <ul className="space-y-3">
        {highlights.map((item) => {
          const video = item.kind === 'video' || isVideoUrl(item.src);
          return (
            <li key={item.id} className="card overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                <div className="grid h-12 w-20 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-surface-2/60 text-faint">
                  {video ? (
                    <FiFilm size={18} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.src} alt="" className="h-full w-full object-cover" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-medium text-ink">
                    {video ? <FiFilm size={13} /> : <FiImage size={13} />}
                    {video ? 'Видео' : 'Фото'}
                  </p>
                  <p className="truncate font-mono text-xs text-faint">
                    {item.translations.ru?.caption || item.translations.en?.caption || item.src}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenId(openId === item.id ? null : item.id)}
                  className="rounded-md p-2 text-faint transition-colors hover:text-ink"
                  aria-expanded={openId === item.id}
                  aria-label="Редактировать"
                >
                  <FiChevronDown
                    size={18}
                    className={`transition-transform ${openId === item.id ? 'rotate-180' : ''}`}
                  />
                </button>

                <DeleteHighlight id={item.id} />
              </div>

              {openId === item.id && <HighlightForm item={item} onDone={() => setOpenId(null)} />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
