import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LearningPath from '@/components/learning/LearningPath';
import SignCard from '@/components/learning/SignCard';
import { getSign, SIGNS } from '@/data/signs';
import { TOTAL_LESSON_SIGNS } from '@/data/lessons';
import { toStats, useProgress, selectNeedsPractice } from '@/store/progress';
import { useAuth } from '@/store/auth';
import ButtonLink from '@/components/ui/ButtonLink';

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h === 0 && m === 0) return `${totalSeconds}s`;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function StatCard({
  label,
  value,
  sub,
  icon,
  progress,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: string;
  progress?: number;
}) {
  return (
    <div className="sb-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-3 dark:text-slate-500">
          {label}
        </span>
        <span aria-hidden className="text-lg">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-extrabold tracking-tight">{value}</p>
      {sub && <p className="sb-muted mt-0.5 text-xs">{sub}</p>}
      {progress !== undefined && (
        <>
          <div
            className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={label}
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="mt-1.5 text-xs font-semibold text-ink-3 dark:text-slate-500">
            {Math.round(progress)}% complete
          </p>
        </>
      )}
    </div>
  );
}

export function Learn() {
  const progress = useProgress();
  const stats = toStats(progress);
  const user = useAuth((s) => s.user);

  const learnedPct = (stats.signsLearned / TOTAL_LESSON_SIGNS) * 100;

  const continueSign = useMemo(() => {
    for (const s of SIGNS) {
      if (!progress.learnedAt[s.id]) return s;
    }
    return SIGNS[0];
  }, [progress.learnedAt]);

  const recommended = useMemo(() => {
    const need = selectNeedsPractice(progress);
    const picked: string[] = [...need.slice(0, 2)];
    for (const s of SIGNS) {
      if (picked.length >= 3) break;
      if (!progress.learnedAt[s.id] && s.id !== continueSign.id && !picked.includes(s.id)) {
        picked.push(s.id);
      }
    }
    return picked.map(getSign).filter(Boolean).slice(0, 3);
  }, [progress, continueSign.id]);

  const quizScore =
    stats.quizAttempts > 0 ? Math.round((stats.quizCorrect / stats.quizAttempts) * 100) : null;

  const firstName = user?.name.split(' ')[0] ?? 'there';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-accent-400">
            Learning dashboard
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Welcome back 👋
          </h1>
          <p className="sb-muted mt-2">
            {firstName}, here is exactly where you are — and what to do next.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink to="/practice" variant="secondary">
            Practice
          </ButtonLink>
          <ButtonLink to="/quiz" variant="accent">
            Take a quiz
          </ButtonLink>
        </div>
      </header>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Learning progress"
          value={`${stats.signsLearned} / ${TOTAL_LESSON_SIGNS}`}
          sub="Signs in the beginner curriculum"
          icon="📚"
          progress={learnedPct}
        />
        <StatCard
          label="Current streak"
          value={`${stats.streakDays} ${stats.streakDays === 1 ? 'day' : 'days'}`}
          sub={stats.streakDays > 0 ? 'Keep it going' : 'Learn one sign to start'}
          icon="🔥"
        />
        <StatCard
          label="Practice time"
          value={formatDuration(stats.practiceSeconds)}
          sub={`${stats.signsPracticed} signs practised`}
          icon="⏱"
        />
        <StatCard
          label="Quiz score"
          value={quizScore === null ? '—' : `${quizScore}%`}
          sub={stats.quizAttempts === 0 ? 'No quizzes yet' : `${stats.quizCorrect} of ${stats.quizAttempts} correct`}
          icon="🎯"
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* continue */}
        <section className="sb-card p-6 lg:col-span-2" aria-labelledby="continue-title">
          <div className="flex items-center justify-between gap-3">
            <h2 id="continue-title" className="text-lg font-extrabold uppercase tracking-wide">
              Continue learning
            </h2>
            <span className="sb-chip">+25 XP per sign</span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-5 rounded-2xl border border-line bg-surface-2 p-5 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-accent-600 text-2xl text-white" aria-hidden>
              {continueSign.word.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-3 dark:text-slate-500">
                Up next
              </p>
              <p className="truncate text-2xl font-extrabold uppercase">{continueSign.word}</p>
              <p className="sb-muted text-sm">
                {continueSign.category} · {continueSign.difficulty}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={`/sign/${continueSign.id}`} className="sb-btn-primary">
                Open lesson
              </Link>
              <Link to={`/practice/${continueSign.id}`} className="sb-btn-secondary">
                Practice
              </Link>
            </div>
          </div>

          <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-ink-3 dark:text-slate-500">
            Recommended for you
          </h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {recommended.map((s, i) => (s ? <SignCard key={s.id} sign={s} index={i} compact /> : null))}
          </div>
        </section>

        {/* xp panel */}
        <aside className="sb-card p-6" aria-labelledby="xp-title">
          <h2 id="xp-title" className="text-lg font-extrabold uppercase tracking-wide">
            Experience
          </h2>
          <p className="mt-3 text-5xl font-extrabold tracking-tight text-brand-700 dark:text-accent-400">
            {stats.xp}
          </p>
          <p className="sb-muted text-sm">XP earned</p>

          <dl className="mt-5 space-y-2.5 text-sm">
            {[
              ['Correct answer', '+10 XP'],
              ['Lesson completion', '+25 XP'],
              ['Practice session', '+5 XP'],
              ['Daily streak', 'Bonus XP'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-line pb-2 dark:border-slate-800">
                <dt>{k}</dt>
                <dd className="font-bold text-brand-700 dark:text-accent-400">{v}</dd>
              </div>
            ))}
          </dl>

          <Link to="/progress" className="sb-btn-secondary mt-5 w-full">
            See full progress
          </Link>
        </aside>
      </div>

      <section className="mt-12" aria-labelledby="path-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-accent-400">
              Learning path
            </p>
            <h2 id="path-title" className="sb-section-title mt-1">
              Four levels, one clear route
            </h2>
          </div>
          <Link to="/signs" className="text-sm font-bold text-brand-700 hover:underline dark:text-accent-400">
            Browse everything →
          </Link>
        </div>
        <div className="mt-6">
          <LearningPath />
        </div>
      </section>
    </div>
  );
}

export default Learn;
