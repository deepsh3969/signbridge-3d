import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adjacentSigns, getSign, relatedSigns } from '@/data/signs';
import SignCard from '@/components/learning/SignCard';
import TextToSpeech, { ReadAloud } from '@/components/accessibility/TextToSpeech';
import { useProgress } from '@/store/progress';
import { useSettings } from '@/store/settings';
import { cancelSpeech } from '@/utils/audio';

const SignHandViewer = lazy(() => import('@/components/3d/SignHandViewer'));

export function SignDetails() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const sign = getSign(id);
  const view = useProgress((s) => s.view);
  const learned = useProgress((s) => Boolean(s.learnedAt[id]));
  const learn = useProgress((s) => s.learn);
  const captions = useSettings((s) => s.captions);
  const [justLearned, setJustLearned] = useState(false);
  const [viewerKey, setViewerKey] = useState(0);

  const { prev, next } = useMemo(() => adjacentSigns(id), [id]);
  const related = useMemo(() => (sign ? relatedSigns(sign) : []), [sign]);

  useEffect(() => {
    if (sign) view(sign.id);
    return () => cancelSpeech();
  }, [sign, view]);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === 'INPUT' ||
          t.tagName === 'TEXTAREA' ||
          t.isContentEditable ||
          t.getAttribute('role') === 'combobox')
      )
        return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (e.key === ' ' || k === 'r' || k === 'c' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (e.key === 'ArrowLeft' && prev) {
          e.preventDefault();
          navigate(`/sign/${prev.id}`);
        } else if (e.key === 'ArrowRight' && next) {
          e.preventDefault();
          navigate(`/sign/${next.id}`);
        } else if (k === 'c') {
          e.preventDefault();
          navigate(`/practice/${id}?mode=camera`);
        } else if (k === 'r') {
          e.preventDefault();
          setViewerKey((v) => v + 1);
        } else if (e.key === ' ') {
          // let the viewer handle it through a synthetic toggle
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('signbridge:toggle-play'));
        }
      }
    },
    [id, prev, next, navigate],
  );

  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  if (!sign) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="sb-card p-10">
          <p className="text-4xl" aria-hidden>
            🔎
          </p>
          <h1 className="mt-4 text-2xl font-bold">We could not find that sign</h1>
          <p className="sb-muted mt-2">
            The sign “{id}” is not in the beginner dictionary yet. Browse the full list to find what
            you were looking for.
          </p>
          <Link to="/signs" className="sb-btn-primary mt-6 inline-flex">
            Open the dictionary
          </Link>
        </div>
      </div>
    );
  }

  const stepText = sign.steps.map((s, i) => `Step ${i + 1}. ${s}`).join(' ');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <nav aria-label="Breadcrumb" className="mb-5 text-sm">
        <ol className="flex flex-wrap items-center gap-2 text-ink-3 dark:text-slate-500">
          <li>
            <Link to="/" className="hover:text-brand-700 dark:hover:text-accent-400">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link to="/signs" className="hover:text-brand-700 dark:hover:text-accent-400">
              Signs
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="font-semibold text-ink dark:text-slate-200">
            {sign.word}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* ---------------------------------------------------------- viewer */}
        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-accent-400">
                {sign.category}
              </p>
              <h1 className="mt-1 text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
                {sign.word}
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="sb-chip">Difficulty: {sign.difficulty}</span>
              <span className="sb-chip">Category: {sign.category}</span>
              <span className="sb-chip">Hand: {sign.handedness}</span>
              {sign.hands === 2 && <span className="sb-chip">Two-handed</span>}
            </div>
          </div>

          <div className="mt-5" key={viewerKey}>
            <Suspense
              fallback={
                <div
                  className="sb-card grid place-items-center bg-slate-100 dark:bg-slate-900"
                  style={{ height: 460 }}
                  role="status"
                >
                  <span className="text-sm text-ink-3">Preparing the 3D hand…</span>
                </div>
              }
            >
              <SignHandViewer
                signId={sign.animationId}
                hands={sign.hands}
                offHandPose={sign.offHand}
                handedness={sign.handedness}
                height={460}
                autoPlay
                label={`3D demonstration of the sign ${sign.word}`}
              />
            </Suspense>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <TextToSpeech text={sign.pronunciation} label={sign.word} />
            <Link to={`/practice/${sign.id}`} className="sb-btn-accent">
              🎯 Practice this sign
            </Link>
            <button
              type="button"
              onClick={() => {
                const isNew = learn(sign.id);
                if (isNew) setJustLearned(true);
              }}
              disabled={learned}
              className="sb-btn-secondary"
              aria-pressed={learned}
            >
              {learned ? '✓ Learned' : 'Mark as learned'}
            </button>
            <Link to={`/practice/${sign.id}?mode=camera`} className="sb-btn-ghost" title="Shortcut: C">
              📷 Camera practice
            </Link>
          </div>

          {justLearned && (
            <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" role="status">
              +25 XP — {sign.word} added to your learned signs.{' '}
              <Link to="/progress" className="underline">
                See progress
              </Link>
            </p>
          )}

          <div className="sr-only" aria-live="polite">
            {captions ? `Now showing the sign ${sign.word}` : ''}
          </div>
        </div>

        {/* -------------------------------------------------------- instructions */}
        <aside className="space-y-5">
          <section className="sb-card p-5" aria-labelledby="how-to-sign">
            <div className="flex items-center justify-between gap-3">
              <h2 id="how-to-sign" className="text-lg font-extrabold uppercase tracking-wide">
                How to sign
              </h2>
              <ReadAloud text={`${sign.word}. ${stepText}`} />
            </div>
            <ol className="mt-4 space-y-4">
              {sign.steps.map((step, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-3"
                >
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-700 text-sm font-bold text-white dark:bg-brand-500"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed">{step}</p>
                </motion.li>
              ))}
            </ol>

            <div className="mt-5 rounded-xl bg-surface-2 p-4 dark:bg-slate-800/60">
              <h3 className="text-sm font-bold uppercase tracking-wide text-ink-3 dark:text-slate-400">
                What it means
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed">{sign.description}</p>
            </div>
          </section>

          <section className="sb-card p-5" aria-labelledby="content-note">
            <h2 id="content-note" className="text-sm font-bold uppercase tracking-wide text-ink-3 dark:text-slate-400">
              Content note
            </h2>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li>
                <strong>Sign language:</strong> {sign.language} ({sign.region})
              </li>
              <li>
                <strong>Variant:</strong> {sign.variant}
              </li>
              <li>
                <strong>Status:</strong>{' '}
                {sign.sample ? 'Illustrative prototype handshape — not a verified lexical entry.' : 'Verified'}
              </li>
            </ul>
            <p className="mt-2 text-xs leading-relaxed text-ink-3 dark:text-slate-500">
              Sign languages differ by region and community. Always confirm with a native signer or
              an accredited course before using a sign in formal settings.
            </p>
          </section>

          <section className="sb-card p-5" aria-labelledby="shortcuts">
            <h2 id="shortcuts" className="text-sm font-bold uppercase tracking-wide text-ink-3 dark:text-slate-400">
              Keyboard shortcuts
            </h2>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <dt className="font-semibold">Space</dt>
              <dd className="text-ink-2 dark:text-slate-400">Play / pause</dd>
              <dt className="font-semibold">R</dt>
              <dd className="text-ink-2 dark:text-slate-400">Reset view</dd>
              <dt className="font-semibold">M</dt>
              <dd className="text-ink-2 dark:text-slate-400">Toggle speech</dd>
              <dt className="font-semibold">C</dt>
              <dd className="text-ink-2 dark:text-slate-400">Camera practice</dd>
              <dt className="font-semibold">← / →</dt>
              <dd className="text-ink-2 dark:text-slate-400">Previous / next sign</dd>
            </dl>
          </section>
        </aside>
      </div>

      {/* ------------------------------------------------------- related signs */}
      {related.length > 0 && (
        <section className="mt-12" aria-labelledby="related-title">
          <h2 id="related-title" className="sb-section-title">
            Related signs
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r, i) => (
              <SignCard key={r.id} sign={r} index={i} compact />
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- paging */}
      <nav className="mt-12 flex items-stretch justify-between gap-4 border-t border-line pt-6 dark:border-slate-800" aria-label="Sign navigation">
        {prev ? (
          <Link
            to={`/sign/${prev.id}`}
            className="group flex max-w-[45%] flex-col rounded-2xl border border-line px-5 py-4 transition hover:border-brand-400 dark:border-slate-700"
          >
            <span className="text-xs font-bold uppercase tracking-wide text-ink-3 dark:text-slate-500">
              ← Previous sign
            </span>
            <span className="mt-1 truncate font-extrabold group-hover:text-brand-700 dark:group-hover:text-accent-400">
              {prev.word}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/sign/${next.id}`}
            className="group flex max-w-[45%] flex-col items-end rounded-2xl border border-line px-5 py-4 text-right transition hover:border-brand-400 dark:border-slate-700"
          >
            <span className="text-xs font-bold uppercase tracking-wide text-ink-3 dark:text-slate-500">
              Next sign →
            </span>
            <span className="mt-1 truncate font-extrabold group-hover:text-brand-700 dark:group-hover:text-accent-400">
              {next.word}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}

export default SignDetails;
