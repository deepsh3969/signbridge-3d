import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import PracticeSession from '@/components/practice/PracticeSession';
import CameraPractice from '@/components/practice/CameraPractice';
import { SIGNS, SIGN_CATEGORIES, getSign } from '@/data/signs';
import { selectNeedsPractice, useProgress } from '@/store/progress';
import type { Sign } from '@/types';

type Mode = 'observe' | 'camera';

export function Practice() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const singleSign = id ? getSign(id) : undefined;
  const mode: Mode = params.get('mode') === 'camera' ? 'camera' : 'observe';

  const [category, setCategory] = useState<string>('Recommended');
  const [sessionKey, setSessionKey] = useState(0);
  const [started, setStarted] = useState(Boolean(singleSign));
  const progress = useProgress();

  const pool: Sign[] = useMemo(() => {
    if (singleSign) return [singleSign];
    if (category === 'Recommended') {
      const flagged = selectNeedsPractice(progress)
        .map(getSign)
        .filter(Boolean) as Sign[];
      if (flagged.length >= 4) return flagged.slice(0, 8);
      const fresh = SIGNS.filter((s) => !progress.learnedAt[s.id]).slice(0, 8);
      return [...flagged, ...fresh].slice(0, 8);
    }
    if (category === 'All') return SIGNS.slice(0, 20);
    return SIGNS.filter((s) => s.category === category).slice(0, 20);
  }, [singleSign, category, progress]);

  const setMode = (m: Mode) => {
    const next = new URLSearchParams(params);
    if (m === 'camera') next.set('mode', 'camera');
    else next.delete('mode');
    setParams(next, { replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-accent-400">
            Practice mode
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {singleSign ? `Practise “${singleSign.word}”` : 'Practice your signs'}
          </h1>
          <p className="sb-muted mt-2 max-w-2xl">
            Observe the sign, copy it yourself, then rate how it felt. Your ratings decide what the
            dashboard recommends next.
          </p>
        </div>

        <div className="flex rounded-xl border border-line p-1 dark:border-slate-700" role="group" aria-label="Practice mode">
          <button
            type="button"
            onClick={() => setMode('observe')}
            aria-pressed={mode === 'observe'}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              mode === 'observe' ? 'bg-brand-700 text-white dark:bg-brand-500' : 'text-ink-2 dark:text-slate-300'
            }`}
          >
            👀 Observe
          </button>
          <button
            type="button"
            onClick={() => setMode('camera')}
            aria-pressed={mode === 'camera'}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              mode === 'camera' ? 'bg-brand-700 text-white dark:bg-brand-500' : 'text-ink-2 dark:text-slate-300'
            }`}
          >
            📷 Camera
          </button>
        </div>
      </header>

      {mode === 'camera' ? (
        <div className="mt-7">
          {singleSign ? (
            <CameraPractice sign={singleSign} onClose={() => setMode('observe')} />
          ) : (
            <div className="sb-card p-8 text-center">
              <p className="text-3xl" aria-hidden>
                📷
              </p>
              <h2 className="mt-3 text-xl font-bold">Choose a sign first</h2>
              <p className="sb-muted mx-auto mt-2 max-w-md text-sm">
                Camera practice needs a specific sign to compare against. Pick one below or open it
                from the dictionary.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {['thank-you', 'hello', 'help'].map((sid) => {
                  const s = getSign(sid);
                  if (!s) return null;
                  return (
                    <Link key={sid} to={`/sign/${sid}?mode=camera`} className="sb-btn-secondary">
                      {s.word}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : !started ? (
        <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="sb-card p-6" aria-labelledby="setup-title">
            <h2 id="setup-title" className="text-lg font-extrabold uppercase tracking-wide">
              Build your session
            </h2>
            <p className="sb-muted mt-1 text-sm">
              Sessions are short on purpose — 8 signs at a time keeps practice focused.
            </p>

            <fieldset className="mt-5">
              <legend className="sb-label">What should we practise?</legend>
              <div className="flex flex-wrap gap-2">
                {['Recommended', 'All', ...SIGN_CATEGORIES].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    aria-pressed={category === c}
                    className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                      category === c
                        ? 'border-brand-700 bg-brand-700 text-white dark:border-accent-600 dark:bg-accent-600'
                        : 'border-line bg-surface text-ink-2 hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-6 rounded-2xl border border-line bg-surface-2 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-3 dark:text-slate-500">
                Session preview
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {pool.slice(0, 8).map((s) => (
                  <li key={s.id} className="sb-chip">
                    {s.word}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="sb-btn-primary px-7 py-3.5"
                onClick={() => {
                  setSessionKey((k) => k + 1);
                  setStarted(true);
                }}
              >
                Start practice
              </button>
              <Link to="/signs" className="sb-btn-secondary">
                Browse all signs
              </Link>
            </div>
          </section>

          <aside className="sb-card p-6">
            <h2 className="text-lg font-extrabold uppercase tracking-wide">How it works</h2>
            <ol className="mt-3 space-y-3 text-sm">
              {[
                'Watch the 3D animation — slow it down or step through it.',
                'Copy the sign yourself, out loud or in silence.',
                'Rate it 😊 easy, 😐 okay or 😓 difficult.',
                'Difficult signs are queued again on your dashboard.',
              ].map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-brand-700 text-xs font-bold text-white dark:bg-brand-500">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
              Camera practice is available as a preview. It shows your live feed next to the expected
              sign — recognition itself is not switched on until a validated model exists.
            </div>
          </aside>
        </div>
      ) : (
        <div className="mt-7">
          <PracticeSession
            key={`${singleSign?.id ?? category}-${sessionKey}`}
            signs={pool}
            onFinish={() => setStarted(false)}
          />
          {!singleSign && (
            <div className="mt-5 text-center">
              <button type="button" className="sb-btn-ghost" onClick={() => setStarted(false)}>
                ← Change session
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Practice;
