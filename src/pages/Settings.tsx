import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AccessibilityPanel from '@/components/accessibility/AccessibilityPanel';
import { SIGN_LANGUAGES } from '@/data/signs';
import { useSettings } from '@/store/settings';
import { useAuth } from '@/store/auth';
import { useProgress } from '@/store/progress';
import type { SignLanguageId } from '@/types';

export function Settings() {
  const patch = useSettings((s) => s.patch);
  const signLanguage = useSettings((s) => s.signLanguage);
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);
  const progress = useProgress();
  const navigate = useNavigate();
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-accent-400">
          Accessibility & settings
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Settings</h1>
        <p className="sb-muted mt-2 max-w-2xl">
          Every option here is a preference, not a requirement — the app works with all of them
          switched either way. Changes save instantly on this device.
        </p>
      </header>

      <div className="mt-7">
        <AccessibilityPanel />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="sb-card p-5" aria-labelledby="lang-heading">
          <h2 id="lang-heading" className="text-lg font-extrabold uppercase tracking-wide">
            Sign language
          </h2>
          <p className="sb-muted mt-1 text-sm">
            Sign languages are not interchangeable. We only enable a language once real content
            exists for it.
          </p>

          <ul className="mt-4 space-y-2.5">
            {SIGN_LANGUAGES.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  disabled={!l.available}
                  onClick={() => patch({ signLanguage: l.id as SignLanguageId })}
                  aria-pressed={signLanguage === l.id}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition ${
                    signLanguage === l.id
                      ? 'border-brand-600 bg-brand-50 dark:border-accent-600 dark:bg-slate-800'
                      : 'border-line hover:border-brand-400 dark:border-slate-700'
                  } ${l.available ? '' : 'opacity-70'}`}
                >
                  <span>
                    <span className="block font-bold">
                      {l.name} <span className="text-xs font-semibold text-ink-3">({l.id})</span>
                    </span>
                    <span className="sb-muted block text-xs">{l.region}</span>
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                      l.available
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                    }`}
                  >
                    {l.available ? 'Available' : 'Coming soon'}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-4 rounded-xl bg-surface-2 px-3 py-2.5 text-xs leading-relaxed dark:bg-slate-900/60">
            Current content is illustrative ASL handshape data. ISL and BSL entries will be added
            only after community review — the schema already supports language, region and variant
            per sign.
          </p>
        </section>

        <section className="sb-card p-5" aria-labelledby="shortcuts-heading">
          <h2 id="shortcuts-heading" className="text-lg font-extrabold uppercase tracking-wide">
            Keyboard shortcuts
          </h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {[
              ['Ctrl + K', 'Search & command palette'],
              ['/', 'Open search'],
              ['Space', 'Play / pause 3D animation'],
              ['R', 'Reset the 3D view'],
              ['M', 'Toggle spoken audio'],
              ['C', 'Open camera practice'],
              ['← →', 'Previous / next sign'],
              ['Esc', 'Close any dialog'],
            ].map(([k, d]) => (
              <div key={k} className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2 dark:border-slate-700">
                <dt className="font-bold">{k}</dt>
                <dd className="text-right text-ink-2 dark:text-slate-400">{d}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 rounded-2xl border border-line p-4 dark:border-slate-700">
            <h3 className="font-bold">Onboarding</h3>
            <p className="sb-muted mt-1 text-sm">Replay the first-run guide to pick your goal again.</p>
            <button
              type="button"
              className="sb-btn-secondary mt-3"
              onClick={() => patch({ onboarded: false })}
            >
              Replay welcome guide
            </button>
          </div>
        </section>
      </div>

      <section className="sb-card mt-6 p-5" aria-labelledby="account-heading">
        <h2 id="account-heading" className="text-lg font-extrabold uppercase tracking-wide">
          Account & data
        </h2>
        <p className="sb-muted mt-1 max-w-3xl text-sm">
          Guests get the complete learning experience with no account. Signing in is only needed if
          you later want progress synced across devices (optional Supabase backend).
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {user ? (
            <>
              <span className="sb-chip">Signed in as {user.email}</span>
              <button
                type="button"
                className="sb-btn-secondary"
                onClick={() => {
                  signOut();
                  navigate('/');
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="sb-btn-primary">
                Sign in
              </Link>
              <Link to="/register" className="sb-btn-secondary">
                Create account
              </Link>
              <span className="sb-chip">Guest mode active</span>
            </>
          )}

          {!confirmClear ? (
            <button type="button" className="sb-btn-ghost ml-auto" onClick={() => setConfirmClear(true)}>
              Clear local data
            </button>
          ) : (
            <>
              <button
                type="button"
                className="sb-btn bg-rose-600 text-white hover:bg-rose-700"
                onClick={() => {
                  progress.reset();
                  patch({ onboarded: false });
                  setConfirmClear(false);
                }}
              >
                Delete everything
              </button>
              <button type="button" className="sb-btn-ghost" onClick={() => setConfirmClear(false)}>
                Cancel
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Settings;
