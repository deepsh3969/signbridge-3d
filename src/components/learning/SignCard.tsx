import { Link } from 'react-router-dom';
import type { Sign } from '@/types';
import { useProgress } from '@/store/progress';
import TextToSpeech from '@/components/accessibility/TextToSpeech';

export interface SignCardProps {
  sign: Sign;
  index?: number;
  showLearned?: boolean;
  className?: string;
  /** Compact layout for related-sign rails */
  compact?: boolean;
}

const difficultyTone: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
  Intermediate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  Advanced: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
};

export function SignCard({ sign, index = 0, showLearned = true, className = '', compact = false }: SignCardProps) {
  const learned = useProgress((s) => Boolean(s.learnedAt[sign.id]));
  const rating = useProgress((s) => s.ratings[sign.id]);

  return (
    <article
      className={`group relative flex h-full flex-col rounded-2xl border border-line bg-surface shadow-card transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-pop dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-600 ${className}`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <Link
        to={`/sign/${sign.id}`}
        className="flex flex-1 flex-col p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 sm:p-5"
        aria-label={`Open the lesson for ${sign.word}`}
      >
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`font-extrabold uppercase tracking-tight ${compact ? 'text-base' : 'text-lg'}`}
          >
            {sign.word}
          </h3>
          {learned && showLearned && (
            <span
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
              title="Learned"
            >
              ✓
            </span>
          )}
        </div>

        {!compact && (
          <p className="sb-muted mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed">{sign.description}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-700 dark:bg-slate-800 dark:text-accent-300">
            {sign.category}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${difficultyTone[sign.difficulty]}`}>
            {sign.difficulty}
          </span>
          {sign.hands === 2 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              2 hands
            </span>
          )}
          {rating === 'difficult' && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
              Review
            </span>
          )}
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-2.5 dark:border-slate-800">
        <Link
          to={`/sign/${sign.id}`}
          className="text-sm font-bold text-brand-700 hover:underline dark:text-accent-400"
          tabIndex={-1}
          aria-hidden
        >
          View sign →
        </Link>
        <TextToSpeech text={sign.pronunciation} label={sign.word} minimal />
      </div>
    </article>
  );
}

export default SignCard;
