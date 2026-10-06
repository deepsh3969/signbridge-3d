import { useEffect, useState, type ReactNode } from 'react';
import Navbar from './Navbar';
import CommandPalette from '@/components/CommandPalette';
import Onboarding from '@/components/Onboarding';
import { useSettings } from '@/store/settings';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export function AppShell({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const onboarded = useSettings((s) => s.onboarded);
  const patch = useSettings((s) => s.patch);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'combobox');

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (typing || e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        patch({ textToSpeech: !useSettings.getState().textToSpeech });
      }
      if (e.key === '/') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [patch]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onOpenSearch={() => setSearchOpen(true)} />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>

      <footer className="border-t border-line bg-surface dark:border-slate-800 dark:bg-[#0e1626]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
          <div>
            <Logo size={28} />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-2 dark:text-slate-400">
              Learn. Sign. Speak. Connect. An accessible way to begin learning sign language with 3D
              demonstrations, text and voice.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-3 dark:text-slate-500">
              Learn
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="text-ink-2 hover:text-brand-700 dark:text-slate-400" to="/learn">Dashboard</Link></li>
              <li><Link className="text-ink-2 hover:text-brand-700 dark:text-slate-400" to="/signs">Sign dictionary</Link></li>
              <li><Link className="text-ink-2 hover:text-brand-700 dark:text-slate-400" to="/practice">Practice</Link></li>
              <li><Link className="text-ink-2 hover:text-brand-700 dark:text-slate-400" to="/quiz">Quiz</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-3 dark:text-slate-500">
              Tools
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="text-ink-2 hover:text-brand-700 dark:text-slate-400" to="/communicate">Communication bridge</Link></li>
              <li><Link className="text-ink-2 hover:text-brand-700 dark:text-slate-400" to="/progress">Progress</Link></li>
              <li><Link className="text-ink-2 hover:text-brand-700 dark:text-slate-400" to="/settings">Accessibility</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-3 dark:text-slate-500">
              About content
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-2 dark:text-slate-400">
              Sign languages vary by country and community. This prototype ships clearly-labelled
              illustrative handshapes and does not claim to be a verified lexicon.
            </p>
          </div>
        </div>
        <div className="border-t border-line px-4 py-4 text-center text-xs text-ink-3 dark:border-slate-800 dark:text-slate-500">
          © {new Date().getFullYear()} SignBridge 3D — built for accessibility first.
        </div>
      </footer>

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      {!onboarded && (
        <Onboarding onDone={() => patch({ onboarded: true, guest: true })} />
      )}
    </div>
  );
}

export default AppShell;
