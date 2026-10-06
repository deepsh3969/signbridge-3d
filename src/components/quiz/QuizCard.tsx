import { lazy, Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Question } from './QuizEngine';
import { optionWord } from './QuizEngine';
import { getSign } from '@/data/signs';
import { playTone } from '@/utils/audio';
import { useSettings } from '@/store/settings';

const SignHandViewer = lazy(() => import('@/components/3d/SignHandViewer'));

export interface QuizCardProps {
  question: Question;
  index: number;
  total: number;
  onAnswer: (correct: boolean, selected: string | string[]) => void;
  onNext: () => void;
  isLast: boolean;
}

function ViewerFallback() {
  return (
    <div className="grid h-[300px] place-items-center rounded-2xl bg-slate-100 text-sm text-ink-3 dark:bg-slate-900" role="status">
      Loading hand…
    </div>
  );
}

export function QuizCard({ question, index, total, onAnswer, onNext, isLast }: QuizCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const sound = useSettings((s) => s.soundEffects);

  useEffect(() => {
    setSelected(null);
    setOrder([]);
    setAnswered(false);
    setCorrect(false);
  }, [question.id]);

  const submitOption = (id: string) => {
    if (answered) return;
    const ok = id === question.answer;
    setSelected(id);
    setCorrect(ok);
    setAnswered(true);
    if (sound) playTone(ok ? 'correct' : 'wrong');
    onAnswer(ok, id);
  };

  const toggleSequence = (id: string) => {
    if (answered) return;
    setOrder((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  };

  const submitSequence = () => {
    if (answered) return;
    const answer = question.type === 'sequence' ? question.answer : [];
    const ok = order.length === answer.length && answer.every((v, i) => v === order[i]);
    setCorrect(ok);
    setAnswered(true);
    if (sound) playTone(ok ? 'correct' : 'wrong');
    onAnswer(ok, order);
  };

  const optionBtn = (id: string) => {
    const isSelected = selected === id;
    const isAnswer = question.answer === id;
    let tone = 'border-line bg-surface hover:border-brand-400 hover:shadow-card dark:border-slate-700 dark:bg-slate-900';
    if (answered) {
      if (isAnswer) tone = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/40';
      else if (isSelected) tone = 'border-rose-500 bg-rose-50 dark:bg-rose-900/40';
      else tone = 'border-line opacity-60 dark:border-slate-700';
    }
    return tone;
  };

  return (
    <motion.article
      key={question.id}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="sb-card overflow-hidden"
      aria-labelledby="quiz-prompt"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3 dark:border-slate-800">
        <span className="text-sm font-bold uppercase tracking-wide text-ink-3 dark:text-slate-500">
          Question {index + 1} of {total}
        </span>
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-500 transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-2">
        <div>
          <h2 id="quiz-prompt" className="text-xl font-extrabold">
            {question.prompt}
          </h2>

          {question.type === 'identify-sign' && (
            <div className="mt-4">
              <Suspense fallback={<ViewerFallback />}>
                <SignHandViewer
                  signId={getSign(question.signId)?.animationId ?? question.signId}
                  hands={getSign(question.signId)?.hands ?? 1}
                  offHandPose={getSign(question.signId)?.offHand}
                  height={300}
                  label="3D sign to identify"
                />
              </Suspense>
            </div>
          )}

          {question.type === 'identify-handshape' && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="col-span-2 rounded-2xl border-2 border-dashed border-brand-400 bg-brand-50 px-6 py-8 text-center dark:border-brand-600 dark:bg-slate-900">
                <p className="text-4xl font-extrabold uppercase tracking-wide">{question.targetWord}</p>
                <p className="sb-muted mt-1 text-sm">Pick the handshape that represents it</p>
              </div>
            </div>
          )}

          {question.type === 'sequence' && (
            <div className="mt-4">
              <p className="sb-muted text-sm">
                Tap the signs in the order you would sign them. Tap again to remove.
              </p>
              <div className="mt-3 flex min-h-16 flex-wrap gap-2 rounded-2xl border border-line bg-surface-2 p-3 dark:border-slate-700 dark:bg-slate-900/60">
                {order.length === 0 && (
                  <span className="text-sm text-ink-3 dark:text-slate-500">Your sequence appears here…</span>
                )}
                {order.map((id, i) => (
                  <span key={id} className="sb-chip border-brand-400 bg-brand-50 dark:bg-slate-800">
                    {i + 1}. {optionWord(id)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {question.type !== 'sequence' ? (
            <div className="grid gap-3">
              {question.options.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => submitOption(id)}
                  disabled={answered}
                  className={`flex items-center justify-between gap-3 rounded-2xl border-2 px-5 py-4 text-left transition ${optionBtn(id)}`}
                  aria-pressed={selected === id}
                >
                  <span>
                    <span className="block text-lg font-extrabold uppercase">{optionWord(id)}</span>
                    <span className="sb-muted block text-xs">{getSign(id)?.category}</span>
                  </span>
                  {answered && question.answer === id && (
                    <span className="text-emerald-600 dark:text-emerald-400" aria-label="Correct answer">
                      ✓
                    </span>
                  )}
                  {answered && selected === id && question.answer !== id && (
                    <span className="text-rose-600 dark:text-rose-400" aria-label="Your answer">
                      ✕
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid gap-2.5">
              {question.shuffled.map((id) => {
                const chosen = order.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleSequence(id)}
                    disabled={answered}
                    className={`rounded-2xl border-2 px-5 py-3.5 text-left transition ${
                      chosen
                        ? 'border-brand-600 bg-brand-50 dark:border-accent-500 dark:bg-slate-800'
                        : 'border-line bg-surface hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900'
                    }`}
                    aria-pressed={chosen}
                  >
                    <span className="font-extrabold uppercase">{optionWord(id)}</span>
                    <span className="sb-muted ml-2 text-xs">{getSign(id)?.category}</span>
                  </button>
                );
              })}
              {!answered ? (
                <button
                  type="button"
                  className="sb-btn-primary mt-1"
                  disabled={order.length !== question.answer.length}
                  onClick={submitSequence}
                >
                  Check order
                </button>
              ) : (
                <div className="rounded-2xl border-2 border-line bg-surface-2 p-3 text-sm dark:border-slate-700 dark:bg-slate-900/60">
                  <p className="font-bold">Correct order</p>
                  <p className="mt-1">{question.answer.map(optionWord).join(' → ')}</p>
                </div>
              )}
            </div>
          )}

          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border-2 p-4 ${
                correct
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200'
                  : 'border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-900/40 dark:text-rose-200'
              }`}
              role="status"
            >
              <p className="font-extrabold">{correct ? 'Correct! +10 XP' : 'Not quite'}</p>
              <p className="mt-1 text-sm">
                {correct
                  ? 'Nice work — keep the momentum going.'
                  : `The correct answer is ${
                    Array.isArray(question.answer)
                      ? question.answer.map(optionWord).join(' → ')
                      : optionWord(question.answer)
                  }.`}
              </p>
            </motion.div>
          )}

          {answered && (
            <button type="button" className="sb-btn-primary w-full" onClick={onNext}>
              {isLast ? 'See results →' : 'Next question →'}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default QuizCard;
