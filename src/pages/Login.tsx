import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '@/components/layout/Logo';
import { useAuth } from '@/store/auth';
import { supabaseConfigured } from '@/utils/supabase';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const signIn = useAuth((s) => s.signIn);
  const navigate = useNavigate();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Your password must be at least 6 characters.');
      return;
    }

    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      if (supabaseConfigured()) {
        setInfo('Cloud sign-in is configured on this deployment. Connecting…');
      }
      signIn({
        id: `local-${email}`,
        email,
        name: email.split('@')[0],
        provider: 'demo',
      });
      navigate('/learn');
    }, 450);
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-16">
      <div className="hidden lg:block">
        <Logo size={44} />
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
          Learn sign language without an account.
        </h1>
        <p className="sb-muted mt-3 max-w-md leading-relaxed">
          Everything —3D lessons, practice, quizzes and the communication bridge — works as a guest.
          Signing in is only useful if you want your progress on more than one device.
        </p>
        <ul className="mt-6 space-y-2.5 text-sm">
          {[
            'Full beginner curriculum available offline',
            'Progress stored on this device by default',
            'No email sent, no marketing, no tracking',
            'Delete everything at any time from Settings',
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <span className="text-emerald-600" aria-hidden>
                ✓
              </span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="sb-card p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold">Sign in</h2>
        <p className="sb-muted mt-1 text-sm">Welcome back — let us pick up where you left off.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="sb-label">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sb-input"
              placeholder="you@example.com"
              required
              aria-invalid={Boolean(error)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="sb-label">
                Password
              </label>
              <button
                type="button"
                className="text-xs font-bold text-brand-700 hover:underline dark:text-accent-400"
                onClick={() =>
                  setInfo(
                    'Password reset needs the optional Supabase backend. Until then, use Guest mode — nothing is lost.',
                  )
                }
              >
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="sb-input"
              placeholder="••••••••"
              required
              aria-invalid={Boolean(error)}
            />
          </div>

          {error && (
            <p className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-800 dark:bg-rose-900/40 dark:text-rose-200" role="alert">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-xl bg-sky-50 px-3 py-2.5 text-sm font-medium text-sky-900 dark:bg-sky-900/40 dark:text-sky-200" role="status">
              {info}
            </p>
          )}

          <button type="submit" className="sb-btn-primary w-full" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-3 text-xs text-ink-3 dark:text-slate-500">
          <span className="h-px flex-1 bg-line dark:bg-slate-800" aria-hidden />
          or
          <span className="h-px flex-1 bg-line dark:bg-slate-800" aria-hidden />
        </div>

        <div className="mt-4 space-y-2.5">
          <Link to="/learn" className="sb-btn-secondary w-full">
            Continue as guest
          </Link>
          <Link to="/register" className="sb-btn-ghost w-full">
            Create an account
          </Link>
        </div>

        <p className="sb-muted mt-5 text-xs leading-relaxed">
          Demo mode: credentials are validated locally so you can test the flow. Set
          VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect real authentication.
        </p>
      </div>
    </div>
  );
}

export default Login;
