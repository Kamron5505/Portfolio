'use client';

import { useActionState } from 'react';
import { loginAction, type ActionState } from '../actions';
import { Field, Input, StatusBanner, SubmitButton } from '@/components/admin/ui';

const initial: ActionState = {};

export default function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(loginAction, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <Field label="Логин">
        <Input name="username" autoComplete="username" autoFocus required />
      </Field>

      <Field label="Пароль">
        <Input name="password" type="password" autoComplete="current-password" required />
      </Field>

      <StatusBanner state={state} />

      <div className="pt-1">
        <SubmitButton>Войти</SubmitButton>
      </div>
    </form>
  );
}
