import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SIGNS } from '@/data/signs';

interface Command {
  id: string;
  label: string;
  hint: string;
  group: string;
  run: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const commands = useMemo<Command[]>(() => {
    const go = (to: string) => () => {
      navigate(to);
      onClose();
    };

    const nav: Command[] = [
      { id: 'nav-learn', label: 'Open learning dashboard', hint: '/learn', group: 'Navigate', run: go('/learn') },
      { id: 'nav-signs', label: 'Browse sign dictionary', hint: '/signs', group: 'Navigate', run: go('/signs') },
      { id: 'nav-practice', label: 'Start practice', hint: '/practice', group: 'Navigate', run: go('/practice') },
      { id: 'nav-quiz', label: 'Take a quiz', hint: '/quiz', group: 'Navigate', run: go('/quiz') },
      { id: 'nav-comm', label: 'Open communication mode', hint: '/communicate', group: 'Navigate', run: go('/communicate') },
      { id: 'nav-progress', label: 'View progress', hint: '/progress', group: 'Navigate', run: go('/progress') },
      { id: 'nav-settings', label: 'Open accessibility settings', hint: '/settings', group: 'Navigate', run: go('/settings') },
      { id: 'nav-home', label: 'Go to home page', hint: '/', group: 'Navigate', run: go('/') },
    ];

    const signCommands: Command[] = SIGNS.map((s) => ({
      id: `sign-${s.id}`,
      label: s.word,
      hint: `${s.category} · ${s.difficulty}`,
      group: 'Signs',
      run: go(`/sign/${s.id}`),
    }));

    return [...nav, ...signCommands];
  }, [navigate, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands.slice(0, 12);
    const scored = commands
      .map((c) => {
        const hay = `${c.label} ${c.hint} ${c.group}`.toLowerCase();
        const idx = hay.indexOf(q);
        if (idx === -1) return null;
        const score = c.label.toLowerCase().startsWith(q) ? 0 : idx + 1;
        return { c, score };
      })
      .filter(Boolean) as { c: Command; score: number }[];
    scored.sort((a, b) => a.score - b.score);
    return scored.slice(0, 14).map((s) => s.c);
  }, [commands, query]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        results[active]?.run();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, results, active, onClose]);

  useEffect(() => {
    const el = listRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/55 px-4 pt-[12vh] backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-surface shadow-pop dark:border-slate-700 dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-label="Search and commands"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-4 dark:border-slate-800">
          <span aria-hidden className="text-lg">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search signs or type a command…"
            className="h-14 w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-3 dark:text-slate-100"
            aria-label="Search signs and commands"
            aria-controls="command-results"
            aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
          />
          <kbd className="hidden rounded border border-line px-2 py-1 text-[11px] font-semibold text-ink-3 sm:block dark:border-slate-700">
            Esc
          </kbd>
        </div>

        <ul
          id="command-results"
          role="listbox"
          aria-label="Results"
          ref={listRef}
          className="max-h-[52vh] overflow-y-auto p-2"
        >
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-ink-3">
              No matches. Try “hello”, “practice” or “settings”.
            </li>
          )}
          {results.map((c, i) => (
            <li key={c.id} id={`cmd-${c.id}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={c.run}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                  i === active ? 'bg-brand-600 text-white' : 'text-ink hover:bg-surface-3 dark:text-slate-200'
                }`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wide opacity-70">
                  {c.group === 'Signs' ? 'Sign' : c.group}
                </span>
                <span className="flex-1 truncate text-sm font-semibold">{c.label}</span>
                <span className={`text-xs ${i === active ? 'text-white/80' : 'text-ink-3'}`}>{c.hint}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-4 border-t border-line px-4 py-2.5 text-[11px] text-ink-3 dark:border-slate-800">
          <span>↑↓ Navigate</span>
          <span>Enter Open</span>
          <span>Esc Close</span>
          <span className="ml-auto">SignBridge 3D</span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
