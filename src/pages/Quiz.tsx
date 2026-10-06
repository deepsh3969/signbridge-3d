import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import QuizCard from '@/components/quiz/QuizCard';
import { buildQuiz, optionWord, type Question } from '@/components/quiz/QuizEngine';
import { SIGN_CATEGORIES, getSign } from '@/data/signs';
import { useProgress } from '@/store/progress';
import type { QuizResult } from '@/types';
import { motion } from 'framer-motion';

type Mode = 'standard' | 'timed';
type Phase = 'setup' | 'running' | 'results';

const QUESTION_COUNT = 10;
const TIME_LIMIT = 60;

export function Quiz() {
  const [mode, setMode] = useState<Mode>('standard');
  const [categories, setCategories] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>('setup');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<{ signId: string; correct: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [remaining, setRemaining] = useState(TIME_LIMIT);
  const recordQuiz = useProgress((s) => s.recordQuiz);
  const finishedRef = useRef(false);

  const question = questions[index];

  const start = useCallback(() => {
    const qs = buildQuiz({ count: QUESTION_COUNT, categories });
    setQuestions(qs);
    setIndex(0);
    setAnswers([]);
    setScore(0);
    setRemaining(TIME_LIMIT);
    finishedRef.current = false;
    setStartedAt(Date.now());
    setPhase('running');
  }, [categories]);

  const finish = useCallback(
    (finalAnswers: { signId: string; correct: boolean }[], finalScore: number, elapsed: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const total = finalAnswers.length;
      const result: QuizResult = {
        score: finalScore,
        total,
        accuracy: total ? Math.round((finalScore / total) * 100) : 0,
        seconds: Math.round(elapsed),
        mistakes: total - finalScore,
        answered: finalAnswers,
      };
      recordQuiz(result);
      setPhase('results');
    },
    [recordQuiz],
  );

  // countdown for timed mode
  useEffect(() => {
    if (phase !== 'running' || mode !== 'timed') return;
    const t = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(t);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [phase, mode]);

  useEffect(() => {
    if (phase === 'running' && mode === 'timed' && remaining === 0) {
      finish(answers, score, TIME_LIMIT);
    }
  }, [remaining, phase, mode, answers, score, finish]);

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (!question) return;
      const signId = Array.isArray(question.answer) ? question.answer[0] : question.answer;
      const nextAnswers = [...answers, { signId, correct }];
      const nextScore = score + (correct ? 1 : 0);
      setAnswers(nextAnswers);
      setScore(nextScore);
      if (mode === 'timed' && index + 1 >= questions.length) {
        finish(nextAnswers, nextScore, TIME_LIMIT - remaining);
      }
    },
    [question, answers, score, mode, index, questions.length, remaining, finish],
  );

  const handleNext = useCallback(() => {
    if (index + 1 >= questions.length) {
      finish(answers, score, (Date.now() - startedAt) / 1000);
    } else {
      setIndex((i) => i + 1);
    }
  }, [index, questions.length, answers, score, startedAt, finish]);

  const resultAccuracy = useMemo(() => {
    if (!answers.length) return 0;
    return Math.round((score / answers.length) * 100);
  }, [score, answers.length]);

  const toggleCategory = (c: string) =>
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  /* ------------------------------------------------------------- SETUP */
  if (phase === 'setup') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
        <header>
          <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-accent-400">
            Quiz mode
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Test what you know</h1>
          <p className="sb-muted mt-2 max-w-2xl">
            Three question types in every round: identify the sign, match the word to a handshape and
            order a sequence. Ten questions, instant feedback.
          </p>
        </header>

        <section className="sb-card mt-7 p-6" aria-labelledby="mode-title">
          <h2 id="mode-title" className="text-lg font-extrabold uppercase tracking-wide">
            Choose a mode
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(
              [
                {
                  id: 'standard' as Mode,
                  title: 'Standard quiz',
                  desc: '10 questions, no time limit. Learn from the feedback after each answer.',
                  icon: '📝',
                },
                {
                  id: 'timed' as Mode,
                  title: 'Timed challenge',
                  desc: `Identify ${QUESTION_COUNT} signs in ${TIME_LIMIT} seconds. Score, accuracy, time and mistakes are tracked.`,
                  icon: '⏱',
                },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                aria-pressed={mode === m.id}
                className={`rounded-2xl border-2 p-5 text-left transition ${
                  mode === m.id
                    ? 'border-brand-600 bg-brand-50 dark:border-accent-500 dark:bg-slate-800'
                    : 'border-line bg-surface hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900'
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {m.icon}
                </span>
                <span className="mt-2 block font-extrabold">{m.title}</span>
                <span className="sb-muted mt-1 block text-sm">{m.desc}</span>
              </button>
            ))}
          </div>

          <fieldset className="mt-6">
            <legend className="sb-label">Focus on categories (optional)</legend>
            <div className="flex flex-wrap gap-2">
              {SIGN_CATEGORIES.map((c) => {
                const active = categories.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCategory(c)}
                    aria-pressed={active}
                    className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                      active
                        ? 'border-brand-700 bg-brand-700 text-white dark:border-accent-600 dark:bg-accent-600'
                        : 'border-line bg-surface text-ink-2 hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            <p className="sb-muted mt-2 text-xs">
              {categories.length === 0 ? 'All categories included.' : `${categories.length} selected.`}
            </p>
          </fieldset>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="sb-btn-primary px-7 py-3.5" onClick={start}>
              Start quiz
            </button>
            <Link to="/learn" className="sb-btn-secondary">
              Review lessons first
            </Link>
          </div>
        </section>
      </div>
    );
  }

  /* ------------------------------------------------------------ RESULTS */
  if (phase === 'results') {
    const elapsed = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const wrong = answers.filter((a) => !a.correct);
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="sb-card p-7">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-accent-400">
            Quiz complete
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
            {resultAccuracy >= 80 ? 'Excellent work' : resultAccuracy >= 50 ? 'Good effort' : 'Keep practising'}
          </h1>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {[
              { label: 'Score', value: `${score}/${answers.length}` },
              { label: 'Accuracy', value: `${resultAccuracy}%` },
              { label: 'Time', value: `${elapsed}s` },
              { label: 'Mistakes', value: `${answers.length - score}` },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-line p-4 text-center dark:border-slate-700">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-3 dark:text-slate-500">
                  {s.label}
                </p>
                <p className="mt-1 text-2xl font-extrabold">{s.value}</p>
              </div>
            ))}
          </div>

          <p className="mt-5 rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800 dark:bg-slate-800 dark:text-accent-300">
            +{score * 10} XP earned
          </p>

          {wrong.length > 0 && (
            <section className="mt-6" aria-labelledby="review-title">
              <h2 id="review-title" className="font-extrabold uppercase tracking-wide">
                Review these signs
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {wrong.map((w, i) => {
                  const s = getSign(w.signId);
                  if (!s) return null;
                  return (
                    <li key={`${w.signId}-${i}`}>
                      <Link to={`/sign/${s.id}`} className="sb-chip border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/30">
                        {s.word}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" className="sb-btn-primary" onClick={start}>
              Try another quiz
            </button>
            <Link to="/practice" className="sb-btn-accent">
              Practise the weak ones
            </Link>
            <Link to="/progress" className="sb-btn-secondary">
              See progress
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ------------------------------------------------------------ RUNNING */
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to="/quiz" className="text-sm font-bold text-ink-3 hover:text-brand-700 dark:text-slate-400">
          ← Quit quiz
        </Link>
        <div className="flex items-center gap-3">
          <span className="sb-chip">Score {score}</span>
          {mode === 'timed' && (
            <span
              className={`sb-chip ${remaining <= 10 ? 'border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' : ''}`}
              role="timer"
              aria-live="polite"
            >
              ⏱ {remaining}s
            </span>
          )}
        </div>
      </div>

      {question ? (
        <QuizCard
          question={question}
          index={index}
          total={questions.length}
          onAnswer={handleAnswer}
          onNext={handleNext}
          isLast={index + 1 >= questions.length}
        />
      ) : (
        <div className="sb-card p-8 text-center" role="status">
          Preparing questions…
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {question ? `Question ${index + 1}. ${question.prompt}` : ''}
      </p>
      <p className="mt-4 text-center text-xs text-ink-3 dark:text-slate-500">
        {question
          ? question.type === 'sequence'
            ? 'Type 3 — arrange the signs in order'
            : question.type === 'identify-sign'
              ? 'Type 1 — identify what the sign means'
              : 'Type 2 — match the word to a handshape'
          : ''}
      </p>
    </div>
  );
}

export default Quiz;
