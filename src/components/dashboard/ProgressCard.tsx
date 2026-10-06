import type { ReactNode } from 'react';

export interface ProgressCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: string;
  children?: ReactNode;
  /** 0..100 */
  percent?: number;
}

export function ProgressCard({ label, value, sub, icon, percent, children }: ProgressCardProps) {
  return (
    <div className="sb-card p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-3 dark:text-slate-500">
          {label}
        </span>
        {icon && (
          <span aria-hidden className="text-lg">
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p>
      {sub && <p className="sb-muted mt-0.5 text-xs">{sub}</p>}

      {percent !== undefined && (
        <div
          className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
          role="progressbar"
          aria-valuenow={Math.round(percent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-500"
            style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
          />
        </div>
      )}
      {children}
    </div>
  );
}

export default ProgressCard;
