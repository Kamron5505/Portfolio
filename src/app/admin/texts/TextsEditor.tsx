'use client';

import { useActionState, useState } from 'react';
import { saveTextsAction, type ActionState } from '../actions';
import { Field, Input, StatusBanner, SubmitButton, Textarea } from '@/components/admin/ui';
import { LOCALES, type Locale } from '@/lib/i18n';
import type { UiText } from '@/lib/content';

const initial: ActionState = {};
const LOCALE_LABEL: Record<Locale, string> = { en: 'English', uz: "O'zbekcha", ru: 'Русский' };

function LocaleForm({ locale, ui }: { locale: Locale; ui: UiText }) {
  const [state, action] = useActionState(saveTextsAction, initial);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />

      <section className="card space-y-4 p-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">Поисковая выдача</h2>
        <Field label="Заголовок страницы (title)" hint="До ~60 символов — иначе Google обрежет.">
          <Input name="metaTitle" defaultValue={ui.meta.title} />
        </Field>
        <Field label="Описание (description)" hint="До ~155 символов.">
          <Textarea name="metaDescription" rows={2} defaultValue={ui.meta.description} />
        </Field>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">Шапка и первый экран</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Роль">
            <Input name="role" defaultValue={ui.role} />
          </Field>
          <Field label="Подзаголовок роли">
            <Input name="subRole" defaultValue={ui.subRole} />
          </Field>
          <Field label="Город">
            <Input name="location" defaultValue={ui.location} />
          </Field>
          <Field label="Статус доступности">
            <Input name="heroAvailable" defaultValue={ui.hero.available} />
          </Field>
        </div>

        <Field label="Слоган">
          <Input name="tagline" defaultValue={ui.tagline} />
        </Field>
        <Field label="Вступительный абзац">
          <Textarea name="heroIntro" rows={3} defaultValue={ui.hero.intro} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Кнопка «Связаться»">
            <Input name="heroGetInTouch" defaultValue={ui.hero.getInTouch} />
          </Field>
          <Field label="Кнопка «Проекты»">
            <Input name="heroViewWork" defaultValue={ui.hero.viewWork} />
          </Field>
          <Field label="Кнопка «Скачать CV»">
            <Input name="heroDownloadCv" defaultValue={ui.hero.downloadCv} />
          </Field>
        </div>

        <Field label="Пункты меню" hint="По одному в строке, в том же порядке, что и на сайте.">
          <Textarea name="navLabels" rows={5} defaultValue={ui.nav.map((n) => n.label).join('\n')} />
        </Field>

        <Field label="Ссылка «Перейти к содержимому»" hint="Видна только при навигации с клавиатуры.">
          <Input name="skipToContent" defaultValue={ui.skipToContent} />
        </Field>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">Обо мне</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Надзаголовок">
            <Input name="aboutEyebrow" defaultValue={ui.about.eyebrow} />
          </Field>
          <Field label="Заголовок">
            <Input name="aboutTitle" defaultValue={ui.about.title} />
          </Field>
        </div>
        <Field label="Текст" hint="Абзацы разделяются пустой строкой.">
          <Textarea name="aboutParagraphs" rows={10} defaultValue={ui.about.paragraphs.join('\n\n')} />
        </Field>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">Заголовки секций</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Услуги — надзаголовок">
            <Input name="servicesEyebrow" defaultValue={ui.services.eyebrow} />
          </Field>
          <Field label="Услуги — заголовок">
            <Input name="servicesTitle" defaultValue={ui.services.title} />
          </Field>
          <Field label="Навыки — надзаголовок">
            <Input name="skillsEyebrow" defaultValue={ui.skills.eyebrow} />
          </Field>
          <Field label="Навыки — заголовок">
            <Input name="skillsTitle" defaultValue={ui.skills.title} />
          </Field>
          <Field label="Проекты — надзаголовок">
            <Input name="projectsEyebrow" defaultValue={ui.projects.eyebrow} />
          </Field>
          <Field label="Проекты — заголовок">
            <Input name="projectsTitle" defaultValue={ui.projects.title} />
          </Field>
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">Контакты и подвал</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Контакты — надзаголовок">
            <Input name="contactEyebrow" defaultValue={ui.contact.eyebrow} />
          </Field>
          <Field label="Контакты — заголовок">
            <Input name="contactTitle" defaultValue={ui.contact.title} />
          </Field>
        </div>
        <Field label="Текст в блоке контактов">
          <Textarea name="contactBlurb" rows={3} defaultValue={ui.contact.blurb} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Кнопка «Написать в Telegram»">
            <Input name="contactWriteTelegram" defaultValue={ui.contact.writeTelegram} />
          </Field>
          <Field label="Кнопка «Скачать CV» (контакты)">
            <Input name="contactDownloadCv" defaultValue={ui.contact.downloadCv} />
          </Field>
          <Field label="Подвал — левая надпись">
            <Input name="footerBuilt" defaultValue={ui.footer.built} />
          </Field>
          <Field label="Подвал — правая надпись">
            <Input name="footerCredit" defaultValue={ui.footer.credit} />
          </Field>
        </div>
      </section>

      <StatusBanner state={state} />

      <SubmitButton>Сохранить — {LOCALE_LABEL[locale]}</SubmitButton>
    </form>
  );
}

export default function TextsEditor({ texts }: { texts: Record<Locale, UiText> }) {
  const [locale, setLocale] = useState<Locale>('ru');

  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b border-line pb-3">
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            className={`rounded-md px-4 py-2 font-mono text-sm transition-colors ${
              l === locale ? 'bg-accent/15 text-accent' : 'text-faint hover:text-ink'
            }`}
          >
            {LOCALE_LABEL[l]}
          </button>
        ))}
      </div>

      {/* Форма пересоздаётся при смене языка (key), иначе defaultValue полей
          останется от предыдущего языка. */}
      <LocaleForm key={locale} locale={locale} ui={texts[locale]} />
    </div>
  );
}
