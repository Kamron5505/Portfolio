'use client';

import { useActionState, useState } from 'react';
import { FiFileText } from 'react-icons/fi';
import { saveProfileAction, type ActionState } from '../actions';
import { Checkbox, Field, Input, StatusBanner, SubmitButton } from '@/components/admin/ui';
import type { SiteInfo } from '@/lib/content';

const initial: ActionState = {};

export default function ProfileForm({ site }: { site: SiteInfo }) {
  const [state, action] = useActionState(saveProfileAction, initial);
  // Предпросмотр выбранного файла до отправки — видно, что выбрали именно то фото.
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <form action={action} className="space-y-6">
      <section className="card space-y-4 p-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">Кто вы</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Имя и фамилия">
            <Input name="name" defaultValue={site.name} required />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" defaultValue={site.email} required />
          </Field>
          <Field label="Имя">
            <Input name="firstName" defaultValue={site.firstName} required />
          </Field>
          <Field label="Фамилия">
            <Input name="lastName" defaultValue={site.lastName} required />
          </Field>
          <Field label="Инициалы" hint="Показываются вместо фото, если его нет.">
            <Input name="initials" defaultValue={site.initials} maxLength={3} required />
          </Field>
          <Field label="Город">
            <Input name="location" defaultValue={site.location} />
          </Field>
          <Field label="Роль" hint="Например: Frontend Developer">
            <Input name="role" defaultValue={site.role} required />
          </Field>
          <Field label="Подзаголовок роли">
            <Input name="subRole" defaultValue={site.subRole} />
          </Field>
        </div>

        <Field label="Короткое описание (tagline)">
          <Input name="tagline" defaultValue={site.tagline} />
        </Field>

        <Field label="Домен сайта" hint="Используется в canonical, sitemap и schema.org. Без слэша в конце.">
          <Input name="url" type="url" defaultValue={site.url} required />
        </Field>
      </section>

      <section className="card space-y-5 p-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">Фото и резюме</h2>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <Field label="Фото" hint="Квадратное, примерно 800×800. JPG, PNG или WebP.">
              <Input
                name="avatarFile"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setPreview(f ? URL.createObjectURL(f) : null);
                }}
              />
            </Field>

            {(preview || site.avatar) && (
              <div className="flex items-center gap-3">
                {/* Обычный <img>: это временный blob-URL или уже загруженный файл,
                    оптимизация next/image здесь ни к чему. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview ?? site.avatar}
                  alt="Текущее фото"
                  className="h-16 w-16 rounded-lg border border-line object-cover"
                />
                {site.avatar && !preview && <Checkbox name="removeAvatar" label="Удалить фото" />}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Field label="Резюме (PDF)" hint="Появится кнопкой «Скачать CV» в шапке и контактах.">
              <Input name="cvFile" type="file" accept="application/pdf" />
            </Field>

            {site.cv && (
              <div className="flex items-center gap-3">
                <a
                  href={site.cv}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2/60 px-3 py-2 text-sm text-muted transition-colors hover:text-ink"
                >
                  <FiFileText aria-hidden="true" /> Текущее резюме
                </a>
                <Checkbox name="removeCv" label="Удалить" />
              </div>
            )}
          </div>
        </div>
      </section>

      <StatusBanner state={state} />

      <SubmitButton>Сохранить профиль</SubmitButton>
    </form>
  );
}
