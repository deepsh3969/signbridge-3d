import { selectWeeklyActivity, useProgress } from '@/store/progress';

export function ProgressChart() {
  const progress = useProgress();
  const days = selectWeeklyActivity(progress);
  const max = Math.max(60, ...days.map((d) => d.seconds));
  const total = days.reduce((a, b) => a + b.seconds, 0);

  return (
    <div className="sb-card p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-extrabold uppercase tracking-wide">Weekly activity</h3>
          <p className="sb-muted text-sm">Practice and quiz time over the last 7 days</p>
        </div>
        <span className="sb-chip">{format(total)} total</span>
      </div>

      <div className="mt-6 flex h-48 items-end gap-2 sm:gap-3" role="img" aria-label={`Bar chart of the last seven days. Total ${format(total)}.`}>
        {days.map((d) => {
          const pct = Math.max(3, (d.seconds / max) * 100);
          return (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[11px] font-semibold text-ink-3 dark:text-slate-500">
                {d.seconds > 0 ? format(d.seconds) : ''}
              </span>
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-accent-500 transition-all"
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-bold uppercase text-ink-2 dark:text-slate-400">{d.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function format(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export default ProgressChart;
