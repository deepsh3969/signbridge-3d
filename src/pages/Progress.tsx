import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProgressCard from '@/components/dashboard/ProgressCard';
import ProgressChart from '@/components/dashboard/ProgressChart';
import SignCard from '@/components/learning/SignCard';
import { getSign } from '@/data/signs';
import { ACHIEVEMENTS } from '@/data/achievements';
import { TOTAL_LESSON_SIGNS, LEVELS } from '@/data/lessons';
import { selectNeedsPractice, toStats, useProgress } from '@/store/progress';
import type { Sign } from '@/types';

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h === 0 && m === 0) return `${totalSeconds}s`;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function Progress() {
  const progress = useProgress();
  const stats = toStats(progress);
  const [confirmReset, setConfirmReset] = useState(false);

  const accuracy = stats.quizAttempts
    ? Math.round((stats.quizCorrect / stats.quizAttempts) * 100)
    : 0;

  const needsPractice = useMemo(
    () => selectNeedsPractice(progress).map(getSign).filter(Boolean) as Sign[],
    [progress],
  );

  const learnedPercent = (stats.signsLearned / TOTAL_LESSON_SIGNS) * 100;

  const completedLessons = useMemo(() => {
    let done = 0;
    for (const level of LEVELS) {
      for (const node of level.nodes) {
        if (node.signIds.length > 0 && node.signIds.every((id) => progress.learnedAt[id])) done++;
      }
    }
    return done;
  }, [progress.learnedAt]);

  const totalLessons = LEVELS.reduce((a, l) => a + l.nodes.length, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-accent-400">
            Progress dashboard
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Your progress</h1>
          <p className="sb-muted mt-2 max-w-2xl">
            Everything here is stored on this device only. Nothing is uploaded, and no personal data
            leaves your browser.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/quiz" className="sb-btn-accent">
            Take a quiz
          </Link>
          <Link to="/practice" className="sb-btn-secondary">
            Practise now
          </Link>
        </div>
      </header>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <ProgressCard
          label="Signs learned"
          value={`${stats.signsLearned} / ${TOTAL_LESSON_SIGNS}`}
          sub="Beginner curriculum"
          icon="📚"
          percent={learnedPercent}
        />
        <ProgressCard
          label="Signs practised"
          value={`${stats.signsPracticed}`}
          sub="Distinct signs in practice sessions"
          icon="🎯"
        />
        <ProgressCard
          label="Quiz accuracy"
          value={stats.quizAttempts ? `${accuracy}%` : '—'}
          sub={stats.quizAttempts ? `${stats.quizCorrect} of ${stats.quizAttempts} correct` : 'No quizzes yet'}
          icon="✅"
          percent={stats.quizAttempts ? accuracy : undefined}
        />
        <ProgressCard
          label="Practice time"
          value={formatDuration(stats.practiceSeconds)}
          sub="Cumulative across sessions"
          icon="⏱"
        />
        <ProgressCard
          label="Current streak"
          value={`${stats.streakDays} ${stats.streakDays === 1 ? 'day' : 'days'}`}
          sub="Consecutive active days"
          icon="🔥"
        />
        <ProgressCard
          label="Lessons completed"
          value={`${completedLessons} / ${totalLessons}`}
          sub="Learning path nodes finished"
          icon="🏁"
          percent={(completedLessons / totalLessons) * 100}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <ProgressChart />

        <section className="sb-card p-5" aria-labelledby="xp-heading">
          <h3 id="xp-heading" className="font-extrabold uppercase tracking-wide">
            Experience & rank
          </h3>
          <p className="mt-4 text-5xl font-extrabold tracking-tight text-brand-700 dark:text-accent-400">
            {stats.xp}
          </p>
          <p className="sb-muted text-sm">total XP</p>

          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-500"
              style={{ width: `${Math.min(100, ((stats.xp % 800) / 800) * 100)}%` }}
            />
          </div>
          <p className="sb-muted mt-2 text-xs">
            {800 - (stats.xp % 800)} XP until the next milestone (800 XP per rank).
          </p>

          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between border-b border-line pb-2 dark:border-slate-800">
              <dt>Most viewed sign</dt>
              <dd className="font-bold">{mostViewed(progress.viewCounts)}</dd>
            </div>
            <div className="flex justify-between border-b border-line pb-2 dark:border-slate-800">
              <dt>Recent activity</dt>
              <dd className="font-bold">{progress.recent.length} signs</dd>
            </div>
            <div className="flex justify-between">
              <dt>Storage</dt>
              <dd className="font-bold">Local device only</dd>
            </div>
          </dl>
        </section>
      </div>

      {/* ------------------------------------------- signs to practice again */}
      <section className="mt-10" aria-labelledby="review-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="review-heading" className="sb-section-title">
              Signs you should practice again
            </h2>
            <p className="sb-muted mt-1 text-sm">
              Flagged because you rated them difficult or answered incorrectly in a quiz.
            </p>
          </div>
          <span className="sb-chip">{needsPractice.length} signs</span>
        </div>

        {needsPractice.length === 0 ? (
          <div className="sb-card mt-4 p-8 text-center">
            <p className="text-3xl" aria-hidden>
              ✨
            </p>
            <p className="mt-2 font-bold">Nothing flagged yet</p>
            <p className="sb-muted mt-1 text-sm">
              Complete a practice session or quiz and anything tricky will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {needsPractice.slice(0, 8).map((s, i) => (
              <SignCard key={s.id} sign={s} index={i} compact />
            ))}
          </div>
        )}
      </section>

      {/* -------------------------------------------------------- achievements */}
      <section className="mt-10" aria-labelledby="achievements-heading">
        <h2 id="achievements-heading" className="sb-section-title">
          Achievements
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = progress.unlocked.includes(a.id);
            return (
              <div
                key={a.id}
                className={`rounded-2xl border p-5 transition ${
                  unlocked
                    ? 'border-brand-400 bg-brand-50 dark:border-accent-600 dark:bg-slate-800'
                    : 'border-dashed border-line bg-surface-2 dark:border-slate-700 dark:bg-slate-900/40'
                }`}
                aria-label={`${a.title} — ${unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-2xl ${unlocked ? '' : 'opacity-35 grayscale'}`} aria-hidden>
                    🏆
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${
                      unlocked
                        ? 'bg-brand-700 text-white dark:bg-accent-600'
                        : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                    }`}
                  >
                    {unlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
                <p className="mt-3 font-bold">{a.title}</p>
                <p className="sb-muted mt-1 text-xs">{a.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- reset */}
      <section className="mt-12 rounded-2xl border border-line p-5 dark:border-slate-800" aria-labelledby="data-heading">
        <h2 id="data-heading" className="font-extrabold uppercase tracking-wide">
          Data & privacy
        </h2>
        <p className="sb-muted mt-1 text-sm">
          Progress, settings and quiz history are kept in your browser’s local storage. No analytics
          SDK, no tracking pixels, no personal data collection.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {!confirmReset ? (
            <button type="button" className="sb-btn-secondary" onClick={() => setConfirmReset(true)}>
              Reset all progress
            </button>
          ) : (
            <>
              <button
                type="button"
                className="sb-btn bg-rose-600 text-white hover:bg-rose-700"
                onClick={() => {
                  progress.reset();
                  setConfirmReset(false);
                }}
              >
                Yes, delete everything
              </button>
              <button type="button" className="sb-btn-ghost" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function mostViewed(counts: Record<string, number>): string {
  let best = '';
  let bestCount = 0;
  for (const [id, c] of Object.entries(counts)) {
    if (c > bestCount) {
      bestCount = c;
      best = id;
    }
  }
  return best ? `${getSign(best)?.word ?? best} (${bestCount})` : '—';
}

export default Progress;
