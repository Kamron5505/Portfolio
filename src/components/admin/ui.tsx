'use client';

import { useFormStatus } from 'react-dom';
import { FiAlertCircle, FiCheck, FiLoader } from 'react-icons/fi';
import type { ActionState } from '@/app/admin/actions';

const inputClass =
  'w-full rounded-lg border border-line bg-surface-2/60 px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-accent/60';

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-faint">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-faint">{hint}</span>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} resize-y leading-relaxed ${props.className ?? ''}`} />;
}

export function Checkbox({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted">
      <input type="checkbox" {...props} className="h-4 w-4 rounded border-line bg-surface-2 accent-accent" />
      {label}
    </label>
  );
}

/** Кнопка сама показывает, что запрос в полёте, — форма не отправится дважды. */
export function SubmitButton({
  children,
  variant = 'primary',
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost' | 'danger';
}) {
  const { pending } = useFormStatus();

  const styles = {
    primary: 'bg-accent text-white hover:shadow-lg hover:shadow-accent/30',
    ghost: 'border border-line bg-surface-2/60 text-ink hover:border-accent/40',
    danger: 'border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20',
  }[variant];

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60 ${styles}`}
    >
      {pending && <FiLoader className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function StatusBanner({ state }: { state: ActionState }) {
  if (!state?.ok && !state?.error) return null;

  return state.error ? (
    <p
      role="alert"
      className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
    >
      <FiAlertCircle aria-hidden="true" className="shrink-0" /> {state.error}
    </p>
  ) : (
    <p
      role="status"
      className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
    >
      <FiCheck aria-hidden="true" className="shrink-0" /> {state.ok}
    </p>
  );
}
