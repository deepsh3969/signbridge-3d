import { useMemo, useState } from 'react';
import { SIGNS, SIGN_CATEGORIES } from '@/data/signs';
import SignCard from '@/components/learning/SignCard';
import { useProgress } from '@/store/progress';

type SortId = 'az' | 'added' | 'popular' | 'difficulty';
type FilterId = 'all' | 'learned' | 'difficult';

const SORTS: { id: SortId; label: string }[] = [
  { id: 'az', label: 'A–Z' },
  { id: 'popular', label: 'Most popular' },
  { id: 'added', label: 'Recently added' },
  { id: 'difficulty', label: 'Difficulty' },
];

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All signs' },
  { id: 'learned', label: 'Recently learned' },
  { id: 'difficult', label: 'Needs practice' },
];

const difficultyRank = { Beginner: 0, Intermediate: 1, Advanced: 2 } as const;

export function Signs() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [difficulty, setDifficulty] = useState<string>('All');
  const [handedness, setHandedness] = useState<string>('All');
  const [onlyAlphabet, setOnlyAlphabet] = useState(false);
  const [filter, setFilter] = useState<FilterId>('all');
  const [sort, setSort] = useState<SortId>('az');

  const learnedAt = useProgress((s) => s.learnedAt);
  const ratings = useProgress((s) => s.ratings);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = SIGNS.filter((s) => {
      if (q) {
        const hay = `${s.word} ${s.id} ${s.category} ${(s.keywords ?? []).join(' ')} ${s.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (category !== 'All' && s.category !== category) return false;
      if (difficulty !== 'All' && s.difficulty !== difficulty) return false;
      if (handedness !== 'All' && s.handedness !== handedness && s.hands !== 2) return false;
      if (onlyAlphabet && s.category !== 'Alphabet') return false;
      if (filter === 'learned' && !learnedAt[s.id]) return false;
      if (filter === 'difficult') {
        const flagged = ratings[s.id] === 'difficult' || !learnedAt[s.id];
        if (!flagged) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === 'az') return a.word.localeCompare(b.word, undefined, { numeric: true });
      if (sort === 'popular') return (b.popularity ?? 0) - (a.popularity ?? 0);
      if (sort === 'added') return (b.addedAt ?? '').localeCompare(a.addedAt ?? '');
      return difficultyRank[a.difficulty] - difficultyRank[b.difficulty] || a.word.localeCompare(b.word);
    });

    return list;
  }, [query, category, difficulty, handedness, onlyAlphabet, filter, sort, learnedAt, ratings]);

  const resetFilters = () => {
    setQuery('');
    setCategory('All');
    setDifficulty('All');
    setHandedness('All');
    setOnlyAlphabet(false);
    setFilter('all');
    setSort('az');
  };

  const learnedCount = Object.keys(learnedAt).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-accent-400">
            Dictionary
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Sign dictionary</h1>
          <p className="sb-muted mt-2 max-w-2xl">
            Search {SIGNS.length} beginner signs by word, meaning or category. You have learned{' '}
            <strong className="text-ink dark:text-slate-100">{learnedCount}</strong> so far.
          </p>
        </div>
        <div className="sb-chip px-4 py-2">{results.length} results</div>
      </header>

      {/* -------------------------------------------------------------- search */}
      <div className="mt-7 sb-card p-4 sm:p-5">
        <label htmlFor="sign-search" className="sb-label">
          Search signs
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" aria-hidden>
            🔍
          </span>
          <input
            id="sign-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try “hello”, “water” or “thank you”…'
            className="sb-input pl-11"
            autoComplete="off"
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <fieldset className="min-w-0">
            <legend className="sb-label">Category</legend>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="sb-input"
              aria-label="Filter by category"
            >
              <option>All</option>
              {SIGN_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </fieldset>

          <fieldset className="min-w-0">
            <legend className="sb-label">Difficulty</legend>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="sb-input"
              aria-label="Filter by difficulty"
            >
              <option>All</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </fieldset>

          <fieldset className="min-w-0">
            <legend className="sb-label">Hand</legend>
            <select
              value={handedness}
              onChange={(e) => setHandedness(e.target.value)}
              className="sb-input"
              aria-label="Filter by hand"
            >
              <option>All</option>
              <option>Right</option>
              <option>Left</option>
              <option>Both</option>
            </select>
          </fieldset>

          <fieldset className="min-w-0">
            <legend className="sb-label">Sort by</legend>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortId)}
              className="sb-input"
              aria-label="Sort results"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </fieldset>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Quick filters">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                  filter === f.id
                    ? 'border-brand-700 bg-brand-700 text-white dark:border-accent-600 dark:bg-accent-600'
                    : 'border-line bg-surface text-ink-2 hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOnlyAlphabet((v) => !v)}
            aria-pressed={onlyAlphabet}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              onlyAlphabet
                ? 'border-brand-700 bg-brand-700 text-white dark:border-accent-600 dark:bg-accent-600'
                : 'border-line bg-surface text-ink-2 hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            Alphabet only
          </button>

          <button type="button" onClick={resetFilters} className="sb-btn-ghost ml-auto h-9 px-3 text-sm">
            Reset filters
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------- results */}
      {results.length === 0 ? (
        <div className="sb-card mt-8 p-10 text-center">
          <p className="text-3xl" aria-hidden>
            🕵️
          </p>
          <h2 className="mt-3 text-xl font-bold">No signs matched</h2>
          <p className="sb-muted mt-2 text-sm">
            Try a shorter search, or clear the filters to see all {SIGNS.length} signs.
          </p>
          <button type="button" onClick={resetFilters} className="sb-btn-primary mt-5">
            Clear everything
          </button>
        </div>
      ) : (
        <>
          <h2 className="sr-only">Search results</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((s, i) => (
              <SignCard key={s.id} sign={s} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Signs;
