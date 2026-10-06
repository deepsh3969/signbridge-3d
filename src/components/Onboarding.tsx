import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/store/settings';
import { SIGN_LANGUAGES } from '@/data/signs';
import type { SignLanguageId } from '@/types';

const GOALS = [
  { id: 'beginner', title: 'I am a beginner', desc: 'Start from the absolute basics.', to: '/learn' },
  { id: 'basics', title: 'I know the basics', desc: 'Jump straight into the dictionary.', to: '/signs' },
  { id: 'practice', title: 'I want to practice', desc: 'Train signs you already know.', to: '/practice' },
  { id: 'communicate', title: 'I want to communicate', desc: 'Turn sentences into signs.', to: '/communicate' },
];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string | null>(null);
  const navigate = useNavigate();
  const signLanguage = useSettings((s) => s.signLanguage);
  const patch = useSettings((s) => s.patch);

  const finish = (to?: string) => {
    onDone();
    if (to) navigate(to);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-8 backdrop-blur-sm"
      role="presentation"
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-3xl border border-line bg-surface p-6 shadow-pop sm:p-8 dark:border-slate-700 dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-accent-400">
                Welcome to SignBridge 3D
              </p>
              <h1 id="onboarding-title" className="mt-2 text-2xl font-extrabold sm:text-3xl">
                What would you like to learn?
              </h1>
              <p className="sb-muted mt-2 text-sm">
                You can change this at any time — nothing is locked in, and no account is needed.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setGoal(g.id);
                      setStep(1);
                    }}
                    className={`rounded-2xl border p-4 text-left transition hover:border-brand-500 hover:shadow-card ${
                      goal === g.id ? 'border-brand-600 bg-brand-50 dark:border-accent-500 dark:bg-slate-800' : 'border-line dark:border-slate-700'
                    }`}
                    aria-pressed={goal === g.id}
                  >
                    <span className="block font-bold">{g.title}</span>
                    <span className="sb-muted mt-1 block text-sm">{g.desc}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <button type="button" className="sb-btn-ghost" onClick={() => finish()}>
                  Skip — explore as guest
                </button>
                <button
                  type="button"
                  className="sb-btn-primary"
                  disabled={!goal}
                  onClick={() => setStep(1)}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="lang" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-accent-400">
                Step 2 of 2
              </p>
              <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">Which sign language?</h1>
              <p className="sb-muted mt-2 text-sm">
                Sign languages differ by country. We only enable a language once real content exists
                for it — we never pretend to support something we do not.
              </p>

              <div className="mt-6 space-y-3">
                {SIGN_LANGUAGES.map((l) => {
                  const selected = signLanguage === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      disabled={!l.available}
                      onClick={() => patch({ signLanguage: l.id as SignLanguageId })}
                      className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${
                        selected
                          ? 'border-brand-600 bg-brand-50 dark:border-accent-500 dark:bg-slate-800'
                          : 'border-line dark:border-slate-700'
                      } ${l.available ? 'hover:border-brand-500' : 'opacity-70'}`}
                      aria-pressed={selected}
                    >
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                          selected ? 'border-brand-600 bg-brand-600' : 'border-slate-400'
                        }`}
                        aria-hidden
                      >
                        {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                      </span>
                      <span className="flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-bold">{l.name}</span>
                          <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">
                            {l.id}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${
                              l.available
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                            }`}
                          >
                            {l.available ? `${l.count} signs` : 'Coming soon'}
                          </span>
                        </span>
                        <span className="sb-muted mt-1 block text-sm">{l.note}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <button type="button" className="sb-btn-ghost" onClick={() => setStep(0)}>
                  ← Back
                </button>
                <button type="button" className="sb-btn-primary" onClick={() => finish(GOALS.find((g) => g.id === goal)?.to)}>
                  Start learning
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default Onboarding;
