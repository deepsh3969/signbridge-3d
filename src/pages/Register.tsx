import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '@/components/layout/Logo';
import { useAuth } from '@/store/auth';
import { useSettings } from '@/store/settings';
import { supabaseConfigured } from '@/utils/supabase';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const signIn = useAuth((s) => s.signIn);
  const patch = useSettings((s) => s.patch);
  const navigate = useNavigate();

  const strength = Math.min(4, Math.floor(password.length / 4) + (/[A-Z]/.test(password) ? 1 : 0));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (name.trim().length < 2) {
      setError('Please enter your name so we can greet you properly.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Use at least 8 characters for your password.');
      return;
    }

    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      if (supabaseConfigured()) setInfo('Cloud registration is configured on this deployment.');
      signIn({ id: `local-${email}`, email, name: name.trim(), provider: 'demo' });
      patch({ guest: false, onboarded: true });
      navigate('/learn');
    }, 500);
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-16">
      <div className="hidden lg:block">
        <Logo size={44} />
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
          Save your progress across devices.
        </h1>
        <p className="sb-muted mt-3 max-w-md leading-relaxed">
          Optional. The entire course works without an account — create one only if you want streaks,
          XP and quiz history to follow you.
        </p>
        <div className="mt-6 rounded-2xl border border-line p-5 dark:border-slate-700">
          <p className="text-sm font-bold uppercase tracking-wide text-ink-3 dark:text-slate-400">
            We never store
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            <li>Camera or microphone recordings</li>
            <li>Contacts, location or device identifiers</li>
            <li>Anything you would not want shared</li>
          </ul>
        </div>
      </div>

      <div className="sb-card p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold">Create your account</h2>
        <p className="sb-muted mt-1 text-sm">Takes less than a minute — or skip it entirely.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="sb-label">
              Your name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="sb-input"
              placeholder="Aarav"
              required
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="sb-label">
              Email address
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sb-input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="sb-label">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="sb-input"
              placeholder="At least 8 characters"
              required
              aria-describedby="pw-help"
            />
            <div className="mt-2 flex gap-1.5" id="pw-help" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    password.length === 0
                      ? 'bg-slate-200 dark:bg-slate-800'
                      : i < strength
                        ? 'bg-brand-600'
                        : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-ink-3 dark:text-slate-500">
              {password.length === 0
                ? 'Use 8+ characters with a capital letter for a strong password.'
                : strength >= 3
                  ? 'Strong password.'
                  : 'Getting there — add more characters.'}
            </p>
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
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="mt-4 space-y-2.5">
          <Link to="/learn" className="sb-btn-secondary w-full">
            Skip — continue as guest
          </Link>
          <Link to="/login" className="sb-btn-ghost w-full">
            I already have an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
