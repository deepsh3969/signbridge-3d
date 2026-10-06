import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { useSettings } from '@/store/settings';
import { useAuth } from '@/store/auth';

const NAV = [
  { to: '/learn', label: 'Learn' },
  { to: '/signs', label: 'Signs' },
  { to: '/practice', label: 'Practice' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/communicate', label: 'Communicate' },
  { to: '/progress', label: 'Progress' },
];

export interface NavbarProps {
  onOpenSearch: () => void;
}

export function Navbar({ onOpenSearch }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const dark = useSettings((s) => s.darkMode);
  const patch = useSettings((s) => s.patch);
  const user = useAuth((s) => s.user);

  useEffect(() => setOpen(false), [location.pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? 'bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-accent-300'
        : 'text-ink-2 hover:bg-surface-3 dark:text-slate-300 dark:hover:bg-slate-800/70'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-md dark:border-slate-800 dark:bg-[#0e1626]/92">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="rounded-lg" aria-label="SignBridge 3D home">
          <Logo size={30} />
        </Link>

        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={linkClass}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSearch}
            className="hidden items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm text-ink-3 transition hover:border-brand-400 hover:text-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-200 md:inline-flex"
            aria-label="Open search and command palette"
            title="Search (Ctrl + K)"
          >
            <span aria-hidden>🔍</span>
            <span>Search…</span>
            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 text-[11px] font-semibold dark:border-slate-700 dark:bg-slate-800">
              Ctrl K
            </kbd>
          </button>

          <button
            type="button"
            onClick={onOpenSearch}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-base transition hover:bg-surface-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 md:hidden"
            aria-label="Open search and command palette"
          >
            <span aria-hidden>🔍</span>
          </button>

          <button
            type="button"
            onClick={() => patch({ darkMode: !dark })}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-base transition hover:bg-surface-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={dark}
            title={dark ? 'Light mode' : 'Dark mode'}
          >
            <span aria-hidden>{dark ? '☀️' : '🌙'}</span>
          </button>

          <Link
            to="/settings"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-base transition hover:bg-surface-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            aria-label="Accessibility and settings"
            title="Settings"
          >
            <span aria-hidden>⚙️</span>
          </Link>

          {user ? (
            <Link
              to="/progress"
              className="hidden h-10 items-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white transition hover:bg-brand-800 sm:inline-flex dark:bg-brand-500 dark:hover:bg-brand-400"
            >
              <span
                className="grid h-6 w-6 place-items-center rounded-full bg-white/20 text-xs font-bold"
                aria-hidden
              >
                {user.name.charAt(0).toUpperCase()}
              </span>
              {user.name.split(' ')[0]}
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden h-10 items-center rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white transition hover:bg-brand-800 sm:inline-flex dark:bg-brand-500 dark:hover:bg-brand-400"
            >
              Sign in
            </Link>
          )}

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface transition hover:bg-surface-3 lg:hidden dark:border-slate-700 dark:bg-slate-900"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span aria-hidden>{open ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-line px-4 pb-4 pt-2 lg:hidden dark:border-slate-800"
        >
          <ul className="grid gap-1">
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  className={({ isActive }) =>
                    `block rounded-xl px-4 py-3 text-base font-semibold ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-accent-300'
                        : 'text-ink hover:bg-surface-3 dark:text-slate-200 dark:hover:bg-slate-800/70'
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink
                to="/settings"
                className="block rounded-xl px-4 py-3 text-base font-semibold text-ink hover:bg-surface-3 dark:text-slate-200 dark:hover:bg-slate-800/70"
              >
                Settings
              </NavLink>
            </li>
            <li>
              <NavLink
                to={user ? '/progress' : '/login'}
                className="mt-1 block rounded-xl bg-brand-700 px-4 py-3 text-center text-base font-semibold text-white dark:bg-brand-500"
              >
                {user ? `Signed in as ${user.name}` : 'Sign in'}
              </NavLink>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

export default Navbar;
