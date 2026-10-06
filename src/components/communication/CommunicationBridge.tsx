import { useMemo, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SIGNS, SIGN_MAP, getSign } from '@/data/signs';
import type { Sign } from '@/types';

const SignHandViewer = lazy(() => import('@/components/3d/SignHandViewer'));

/** Words the dictionary does not hold verbatim but map cleanly onto a sign. */
const SYNONYMS: Record<string, string> = {
  i: 'i-pronoun',
  me: 'me',
  im: 'i-pronoun',
  "i'm": 'i-pronoun',
  mine: 'i-pronoun',
  my: 'i-pronoun',
  you: 'you',
  your: 'you',
  u: 'you',
  we: 'we',
  us: 'we',
  our: 'we',
  thanks: 'thank-you',
  thank: 'thank-you',
  thankyou: 'thank-you',
  thx: 'thank-you',
  bye: 'goodbye',
  hi: 'hi',
  hey: 'hello',
  yeah: 'yes',
  yup: 'yes',
  nope: 'no',
  ok: 'yes',
  okay: 'maybe',
  mum: 'mother',
  mom: 'mother',
  dad: 'father',
  parents: 'family',
  house: 'home',
  eat: 'food',
  drink: 'water',
  work: 'work',
  good: 'good',
  bad: 'bad',
  welcome: 'welcome',
};

export interface TokenMatch {
  raw: string;
  normalised: string;
  sign?: Sign;
}

export function matchToken(token: string): TokenMatch {
  const normalised = token.toLowerCase().replace(/[^a-z0-9']/g, '');
  if (!normalised) return { raw: token, normalised: '' };

  const direct =
    (SYNONYMS[normalised] ? getSign(SYNONYMS[normalised]) : undefined) ??
    SIGNS.find((s) => s.word.toLowerCase() === normalised) ??
    SIGNS.find((s) => (s.keywords ?? []).includes(normalised)) ??
    SIGN_MAP[normalised];

  return { raw: token, normalised, sign: direct };
}

export function tokenize(sentence: string): TokenMatch[] {
  return sentence
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => matchToken(t));
}

export interface CommunicationBridgeProps {
  sentence: string;
}

export function CommunicationBridge({ sentence }: CommunicationBridgeProps) {
  const tokens = useMemo(() => tokenize(sentence), [sentence]);
  const firstMatched = tokens.findIndex((t) => Boolean(t.sign));
  const [activeToken, setActiveToken] = useState(firstMatched);

  const matchedIndexes = tokens.map((t, i) => (t.sign ? i : -1)).filter((i) => i >= 0);
  const activeIndex = matchedIndexes.includes(activeToken)
    ? activeToken
    : (matchedIndexes[0] ?? -1);
  const activeSign = activeIndex >= 0 ? tokens[activeIndex]?.sign : undefined;

  const unmatched = tokens.filter((t) => !t.sign && t.normalised.length > 0);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    if (matchedIndexes.length === 0) return;
    setPlaying(true);
    let step = 0;
    setActiveToken(matchedIndexes[0]);
    const tick = () => {
      step += 1;
      if (step >= matchedIndexes.length) {
        setPlaying(false);
        return;
      }
      setActiveToken(matchedIndexes[step]);
      window.setTimeout(tick, 2200);
    };
    window.setTimeout(tick, 2200);
  };

  return (
    <div className="sb-card p-5" aria-labelledby="bridge-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-3 dark:text-slate-500">
            Right side
          </p>
          <h2 id="bridge-title" className="text-lg font-extrabold uppercase tracking-wide">
            🤟 Sign language
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="sb-btn-secondary"
            onClick={play}
            disabled={matchedIndexes.length === 0 || playing}
          >
            {playing ? 'Playing…' : '▶ Play sequence'}
          </button>
          <Link to="/signs" className="sb-btn-ghost">
            Dictionary
          </Link>
        </div>
      </div>

      {tokens.length === 0 ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-line p-10 text-center dark:border-slate-700">
          <p className="text-3xl" aria-hidden>
            🌉
          </p>
          <p className="mt-2 font-bold">Your signs will appear here</p>
          <p className="sb-muted mt-1 text-sm">
            Type or speak a sentence on the left and every word that exists in the dictionary becomes
            a clickable sign.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap gap-2" aria-label="Matched sign sequence">
            {tokens.map((t, i) =>
              t.sign ? (
                <button
                  key={`${t.raw}-${i}`}
                  type="button"
                  onClick={() => setActiveToken(i)}
                  aria-pressed={i === activeIndex}
                  className={`rounded-full border px-4 py-1.5 text-sm font-extrabold uppercase transition ${
                    i === activeIndex
                      ? 'border-brand-700 bg-brand-700 text-white dark:border-accent-600 dark:bg-accent-600'
                      : 'border-brand-300 bg-brand-50 text-brand-800 hover:border-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-accent-300'
                  }`}
                >
                  {t.sign.word}
                </button>
              ) : (
                <span
                  key={`${t.raw}-${i}`}
                  className="rounded-full border border-dashed border-line px-3 py-1.5 text-sm font-semibold text-ink-3 dark:border-slate-700 dark:text-slate-500"
                  title={`No sign for “${t.raw}” in the beginner dictionary`}
                >
                  {t.raw} <span className="text-xs">(no sign)</span>
                </span>
              ),
            )}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div>
              <Suspense
                fallback={
                  <div
                    className="grid h-[300px] place-items-center rounded-2xl bg-slate-100 text-sm dark:bg-slate-900"
                    role="status"
                  >
                    Loading hand…
                  </div>
                }
              >
                {activeSign && (
                  <SignHandViewer
                    key={activeSign.id}
                    animationId={activeSign.animationId}
                    hands={activeSign.hands}
                    offHandPose={activeSign.offHand}
                    handedness={activeSign.handedness}
                    height={300}
                    compact
                    autoPlay
                    label={`Sign sequence step: ${activeSign.word}`}
                  />
                )}
              </Suspense>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-ink-3 dark:text-slate-400">
                Sequence
              </h3>
              <ol className="mt-2 space-y-2">
                {matchedIndexes.map((ti, i) => {
                  const s = tokens[ti].sign!;
                  return (
                    <li key={`${s.id}-${ti}`}>
                      <div
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 ${
                          ti === activeIndex
                            ? 'border-brand-600 bg-brand-50 dark:border-accent-600 dark:bg-slate-800'
                            : 'border-line dark:border-slate-700'
                        }`}
                        aria-current={ti === activeIndex ? 'step' : undefined}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveToken(ti)}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-brand-700 text-xs font-bold text-white dark:bg-brand-500">
                            {i + 1}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-bold uppercase">{s.word}</span>
                            <span className="sb-muted block truncate text-xs">{s.category}</span>
                          </span>
                        </button>
                        <Link
                          to={`/sign/${s.id}`}
                          className="shrink-0 text-sm font-bold text-brand-700 hover:underline dark:text-accent-400"
                        >
                          Open
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ol>

              {unmatched.length > 0 && (
                <div className="mt-4 rounded-xl bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
                  <strong>Not in the dictionary yet:</strong>{' '}
                  {unmatched.map((u) => u.raw).join(', ')}. The beginner curriculum is intentionally
                  focused — this gap list shows exactly what to add next.
                </div>
              )}

              <p className="mt-4 text-xs leading-relaxed text-ink-3 dark:text-slate-500">
                Pipeline: speech → text → sign sequence → 3D animation. Each step is independent, so
                a better translator or a richer dictionary can be plugged in without rebuilding this
                screen.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {matchedIndexes.slice(0, 3).map((ti, i) => {
              const s = tokens[ti].sign!;
              return (
                <motion.div key={`preview-${s.id}-${i}`} whileHover={{ y: -3 }}>
                  <Link
                    to={`/sign/${s.id}`}
                    className="block rounded-2xl border border-line p-3 transition hover:border-brand-400 dark:border-slate-700"
                  >
                    <span className="block font-extrabold uppercase">{s.word}</span>
                    <span className="sb-muted block text-xs">
                      {s.description.slice(0, 70)}
                      {s.description.length > 70 ? '…' : ''}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default CommunicationBridge;
