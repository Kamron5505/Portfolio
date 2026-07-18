import LoginForm from './LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-mono text-sm text-accent">~/admin</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink">Вход в панель</h1>
        </div>

        <div className="card p-6">
          <LoginForm next={next ?? '/admin'} />
        </div>
      </div>
    </div>
  );
}
