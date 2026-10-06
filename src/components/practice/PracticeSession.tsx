import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SignHandViewer from '@/components/3d/SignHandViewer';
import TextToSpeech, { ReadAloud } from '@/components/accessibility/TextToSpeech';
import { useProgress, type Rating } from '@/store/progress';
import type { Sign } from '@/types';
import { useSettings } from '@/store/settings';

export interface PracticeSessionProps {
  signs: Sign[];
  onFinish?: () => void;
}

const RATING_META: { id: Rating; emoji: string; label: string; tone: string; hint: string }[] = [
  {
    id: 'easy',
    emoji: '😊',
    label: 'Easy',
    tone: 'border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300',
    hint: 'You would sign this without thinking.',
  },
  {
    id: 'okay',
    emoji: '😐',
    label: 'Okay',
    tone: 'border-amber-500 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-200',
    hint: 'Almost — needs a little more repetition.',
  },
  {
    id: 'difficult',
    emoji: '😓',
    label: 'Difficult',
    tone: 'border-rose-500 bg-rose-50 text-rose-900 hover:bg-rose-100 dark:bg-rose-900/40 dark:text-rose-200',
    hint: 'We will show you this sign more often.',
  },
];

export function PracticeSession({ signs, onFinish }: PracticeSessionProps) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'observe' | 'turn' | 'done'>('observe');
  const [rated, setRated] = useState<{ id: string; rating: Rating }[]>([]);
  const [seconds, setSeconds] = useState(0);
  const rate = useProgress((s) => s.rate);
  const practice = useProgress((s) => s.practice);
  const learn = useProgress((s) => s.learn);
  const captions = useSettings((s) => s.captions);
  const startedAt = useRef(Date.now());

  const current = signs[index];

  useEffect(() => {
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  const next = useCallback(() => {
    setPhase('observe');
    setIndex((i) => {
      if (i + 1 >= signs.length) {
        setPhase('done');
        return i;
      }
      return i + 1;
    });
  }, [signs.length]);

  const submitRating = useCallback(
    (rating: Rating) => {
      if (!current) return;
      rate(current.id, rating);
      practice(current.id, Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)));
      if (rating !== 'difficult') learn(current.id);
      setRated((r) => [...r, { id: current.id, rating }]);
      startedAt.current = Date.now();
      next();
    },
    [current, rate, practice, learn, next],
  );

  const summary = useMemo(() => {
    const counts = { easy: 0, okay: 0, difficult: 0 } as Record<Rating, number>;
    rated.forEach((r) => (counts[r.rating] += 1));
    return counts;
  }, [rated]);

  if (signs.length === 0) {
    return (
      <div className="sb-card p-10 text-center">
        <p className="text-3xl" aria-hidden>
          🎯
        </p>
        <h2 className="mt-3 text-xl font-bold">No signs in this session</h2>
        <p className="sb-muted mt-2 text-sm">Pick a category or start from the full dictionary.</p>
        <Link to="/signs" className="sb-btn-primary mt-5 inline-flex">
          Browse signs
        </Link>
      </div>
    );
  }

  if (phase === 'done' || !current) {
    const minutes = Math.max(1, Math.round(seconds / 60));
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="sb-card mx-auto max-w-2xl p-8 text-center"
        role="status"
      >
        <p className="text-4xl" aria-hidden>
          🏁
        </p>
        <h2 className="mt-3 text-2xl font-extrabold">Session complete</h2>
        <p className="sb-muted mt-1">
          {rated.length} signs practised in {minutes} {minutes === 1 ? 'minute' : 'minutes'}.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {RATING_META.map((r) => (
            <div key={r.id} className="rounded-2xl border border-line p-4 dark:border-slate-700">
              <p className="text-2xl" aria-hidden>
                {r.emoji}
              </p>
              <p className="mt-1 text-xl font-extrabold">{summary[r.id]}</p>
              <p className="sb-muted text-xs">{r.label}</p>
            </div>
          ))}
        </div>

        <p className="mt-5 rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800 dark:bg-slate-800 dark:text-accent-300">
          {summary.difficult > 0
            ? `${summary.difficult} sign${summary.difficult > 1 ? 's' : ''} marked difficult — they will appear again in “Signs you should practice again”.`
            : 'Nothing flagged as difficult. Try a quiz to test recall.'}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="sb-btn-primary"
            onClick={() => {
              setIndex(0);
              setPhase('observe');
              setRated([]);
              setSeconds(0);
              startedAt.current = Date.now();
            }}
          >
            Practise again
          </button>
          <Link to="/quiz" className="sb-btn-accent">
            Take a quiz
          </Link>
          <button type="button" className="sb-btn-secondary" onClick={onFinish}>
            Finish
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="sb-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 dark:border-slate-800">
          <div className="flex items-baseline gap-3">
            <span className="text-sm font-bold uppercase tracking-wide text-ink-3 dark:text-slate-500">
              Sign {index + 1} of {signs.length}
            </span>
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-500 transition-all"
                style={{ width: `${((index + 1) / signs.length) * 100}%` }}
              />
            </div>
          </div>
          <span className="sb-chip">⏱ {seconds}s</span>
        </div>

        <div className="p-4">
          <SignHandViewer
            signId={current.animationId}
            hands={current.hands}
            offHandPose={current.offHand}
            handedness={current.handedness}
            height={340}
            label={`Practice animation for ${current.word}`}
          />
        </div>
      </div>

      <aside className="sb-card p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-3 dark:text-slate-500">
          Look closely
        </p>
        <h2 className="mt-1 text-3xl font-extrabold uppercase">{current.word}</h2>

        <div className="mt-3">
          <TextToSpeech text={current.pronunciation} label={current.word} />
        </div>

        <h3 className="mt-5 text-sm font-bold uppercase tracking-wide text-ink-3 dark:text-slate-400">
          Steps
        </h3>
        <ol className="mt-2 space-y-2">
          {current.steps.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed">
              <span className="font-bold text-brand-700 dark:text-accent-400">{i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        <div className="mt-3">
          <ReadAloud
            text={`${current.word}. ${current.steps.map((s, i) => `Step ${i + 1}. ${s}`).join(' ')}`}
          />
        </div>

        <AnimatePresence mode="wait">
          {phase === 'observe' ? (
            <motion.div key="observe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mt-6 rounded-2xl bg-surface-2 p-4 text-center dark:bg-slate-900/60">
                <p className="text-lg font-extrabold">Your turn</p>
                <p className="sb-muted mt-1 text-sm">
                  Watch the animation, then sign it yourself and tell us how it felt.
                </p>
              </div>
              <button type="button" className="sb-btn-primary mt-4 w-full" onClick={() => setPhase('turn')}>
                I have tried it
              </button>
            </motion.div>
          ) : (
            <motion.div key="rate" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mt-6">
                <p className="text-lg font-extrabold">How did that feel?</p>
                <p className="sb-muted mb-3 text-sm">Be honest — this changes what we recommend next.</p>
                <div className="grid gap-2.5">
                  {RATING_META.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => submitRating(r.id)}
                      className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition ${r.tone}`}
                      aria-label={`${r.label}. ${r.hint}`}
                    >
                      <span className="text-2xl" aria-hidden>
                        {r.emoji}
                      </span>
                      <span>
                        <span className="block font-bold">{r.label}</span>
                        <span className="block text-xs opacity-80">{r.hint}</span>
                      </span>
                    </button>
                  ))}
                </div>
                <button type="button" className="sb-btn-ghost mt-3 w-full" onClick={next}>
                  Skip this sign
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {captions && (
          <p className="mt-4 text-xs text-ink-3 dark:text-slate-500">
            Practising “{current.word}” — {current.category}
          </p>
        )}
      </aside>
    </div>
  );
}

export default PracticeSession;
