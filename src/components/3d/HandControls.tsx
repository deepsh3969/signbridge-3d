import type { AnimSpeed } from '@/types';
import { ANIM_SPEEDS } from '@/store/settings';

export type ViewId = 'front' | 'palm' | 'side' | 'back';

const VIEWS: { id: ViewId; label: string; hint: string }[] = [
  { id: 'front', label: 'Front', hint: 'Front view of the hand' },
  { id: 'palm', label: 'Palm', hint: 'Palm facing you' },
  { id: 'side', label: 'Side', hint: 'Side view' },
  { id: 'back', label: 'Back', hint: 'Back of the hand' },
];

export interface HandControlsProps {
  playing: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  speed: AnimSpeed;
  onSpeedChange: (s: AnimSpeed) => void;
  view: ViewId;
  onViewChange: (v: ViewId) => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  onZoom: (dir: 1 | -1) => void;
  step: number | null;
  stepCount: number;
  onStepChange: (step: number | null) => void;
  compact?: boolean;
}

const btn =
  'inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-line bg-surface px-3 text-sm font-semibold text-ink transition hover:bg-surface-3 active:translate-y-px disabled:opacity-40 disabled:hover:bg-surface';
const darkBtn =
  'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700';
const activeBtn = 'bg-brand-700 text-white border-brand-700 hover:bg-brand-800 dark:bg-brand-500 dark:border-brand-500 dark:hover:bg-brand-400';

export function HandControls({
  playing,
  onTogglePlay,
  onReset,
  speed,
  onSpeedChange,
  view,
  onViewChange,
  autoRotate,
  onToggleAutoRotate,
  showLabels,
  onToggleLabels,
  onZoom,
  step,
  stepCount,
  onStepChange,
  compact = false,
}: HandControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="3D hand viewer controls">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onTogglePlay}
          className={`${btn} ${darkBtn} ${playing ? activeBtn : ''} w-24`}
          aria-pressed={playing}
          title={playing ? 'Pause animation (Space)' : 'Play animation (Space)'}
        >
          <span aria-hidden>{playing ? '⏸' : '▶'}</span>
          <span>{playing ? 'Pause' : 'Play'}</span>
        </button>
        <button
          type="button"
          onClick={onReset}
          className={`${btn} ${darkBtn}`}
          title="Reset animation and camera (R)"
          aria-label="Reset animation and camera"
        >
          <span aria-hidden>↻</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5" role="group" aria-label="Animation speed">
        <span className="sr-only">Animation speed</span>
        {ANIM_SPEEDS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSpeedChange(s.id)}
            className={`${btn} ${darkBtn} ${speed === s.id ? activeBtn : ''}`}
            aria-pressed={speed === s.id}
            title={`${s.label} speed`}
          >
            {s.id === 'slow' ? '🐢' : s.id === 'fast' ? '⚡' : '▶'}{' '}
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5" role="group" aria-label="Zoom">
        <button type="button" onClick={() => onZoom(-1)} className={`${btn} ${darkBtn}`} title="Zoom in" aria-label="Zoom in">
          +
        </button>
        <button type="button" onClick={() => onZoom(1)} className={`${btn} ${darkBtn}`} title="Zoom out" aria-label="Zoom out">
          −
        </button>
      </div>

      {!compact && (
        <div className="flex items-center gap-1.5" role="group" aria-label="Camera view">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onViewChange(v.id)}
              className={`${btn} ${darkBtn} ${view === v.id ? activeBtn : ''}`}
              aria-pressed={view === v.id}
              title={v.hint}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleAutoRotate}
          className={`${btn} ${darkBtn} ${autoRotate ? activeBtn : ''}`}
          aria-pressed={autoRotate}
          title="Toggle auto rotation"
        >
          <span aria-hidden>⟳</span>
          <span className="hidden sm:inline">Auto</span>
        </button>
        <button
          type="button"
          onClick={onToggleLabels}
          className={`${btn} ${darkBtn} ${showLabels ? activeBtn : ''}`}
          aria-pressed={showLabels}
          title="Show finger names"
        >
          <span aria-hidden>🏷</span>
          <span className="hidden md:inline">Finger names</span>
        </button>
      </div>

      {stepCount > 1 && (
        <div className="flex items-center gap-1.5" role="group" aria-label="Step through animation">
          <button
            type="button"
            onClick={() => onStepChange(step === null ? 0 : Math.max(step - 1, 0))}
            className={`${btn} ${darkBtn}`}
            title="Previous step"
            aria-label="Previous animation step"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => onStepChange(step === null ? 1 : null)}
            className={`${btn} ${darkBtn} min-w-28`}
            title="Toggle step-by-step mode"
            aria-pressed={step !== null}
          >
            {step === null ? 'Steps' : `Step ${step}/${stepCount - 1}`}
          </button>
          <button
            type="button"
            onClick={() => onStepChange(Math.min((step ?? 0) + 1, stepCount - 1))}
            className={`${btn} ${darkBtn}`}
            title="Next step"
            aria-label="Next animation step"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

export default HandControls;
