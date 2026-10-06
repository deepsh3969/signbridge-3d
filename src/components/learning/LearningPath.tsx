import { Link } from 'react-router-dom';
import { LEVELS } from '@/data/lessons';
import { useProgress, toStats } from '@/store/progress';
import type { LearningLevel, LessonNode } from '@/types';

function NodeRow({ node, locked, learnedCount }: { node: LessonNode; locked: boolean; learnedCount: number }) {
  const total = node.signIds.length;
  const done = Math.min(learnedCount, total);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const complete = total > 0 && done >= total;
  const firstId = node.signIds[0];

  return (
    <li>
      <Link
        to={locked ? '/learn' : `/signs?category=${encodeURIComponent(node.category)}`}
        aria-disabled={locked}
        onClick={(e) => locked && e.preventDefault()}
        className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
          locked
            ? 'cursor-not-allowed border-dashed border-line bg-surface-2 opacity-70 dark:border-slate-700 dark:bg-slate-900/40'
            : 'border-line bg-surface hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-card dark:border-slate-800 dark:bg-slate-900'
        }`}
      >
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-bold ${
            locked
              ? 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
              : complete
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-700 text-white dark:bg-brand-500'
          }`}
          aria-hidden
        >
          {locked ? '🔒' : complete ? '✓' : '▶'}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-bold">{node.title}</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-3 dark:text-slate-500">
              {node.category}
            </span>
          </span>
          <span className="sb-muted block truncate text-sm">{node.subtitle}</span>
          <span className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </span>
        </span>

        <span className="shrink-0 text-right">
          <span className="block text-sm font-bold">{locked ? 'Locked' : `${done}/${total}`}</span>
          <span className="sb-muted block text-xs">
            {locked ? `${node.requiredXp} XP` : complete ? 'Complete' : `${pct}%`}
          </span>
        </span>
      </Link>
      {firstId === undefined && null}
    </li>
  );
}

export function LearningPath() {
  const progress = useProgress();
  const stats = toStats(progress);

  return (
    <div className="space-y-8">
      {LEVELS.map((level: LearningLevel) => {
        const levelLocked = stats.xp < (level.nodes[0]?.requiredXp ?? 0);

        return (
          <section key={level.id} aria-labelledby={`level-${level.id}`}>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`grid h-11 w-11 place-items-center rounded-2xl text-sm font-extrabold ${
                  levelLocked
                    ? 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                    : 'bg-gradient-to-br from-brand-600 to-accent-600 text-white'
                }`}
                aria-hidden
              >
                {levelLocked ? '🔒' : level.index}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-ink-3 dark:text-slate-500">
                  Level {level.index}
                </p>
                <h3 id={`level-${level.id}`} className="text-xl font-extrabold">
                  {level.title}
                </h3>
                <p className="sb-muted text-sm">{level.subtitle}</p>
              </div>
            </div>

            <ul className="mt-4 grid gap-3">
              {level.nodes.map((node) => (
                <NodeRow
                  key={node.id}
                  node={node}
                  learnedCount={node.signIds.filter((id) => progress.learnedAt[id]).length}
                  locked={stats.xp < node.requiredXp}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export default LearningPath;
