import { useEffect, useState } from 'react';
import { useSpeech } from '@/hooks/useSpeech';
import { useSettings } from '@/store/settings';

export interface TextToSpeechProps {
  text: string;
  /** Accessible name prefix, e.g. "Thank you" */
  label?: string;
  compact?: boolean;
  /** Show the expanded rate / pitch / volume / voice controls */
  showAdvanced?: boolean;
  className?: string;
  /** Render only the single play button */
  minimal?: boolean;
}

export function TextToSpeech({
  text,
  label,
  compact = false,
  showAdvanced = false,
  className = '',
  minimal = false,
}: TextToSpeechProps) {
  const speech = useSpeech();
  const settings = useSettings();
  const patch = useSettings((s) => s.patch);
  const [expanded, setExpanded] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const name = label ?? text;
  const disabled = !speech.supported || !settings.textToSpeech;

  useEffect(() => {
    if (speech.error) setNotice(speech.error);
  }, [speech.error]);

  const play = () => {
    setNotice(null);
    const ok = speech.speak(text);
    if (!ok && !speech.error) {
      setNotice('Speech is unavailable here — the written text is shown above.');
    }
  };

  const btn =
    'inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm font-semibold text-ink transition hover:bg-surface-3 disabled:opacity-50 disabled:hover:bg-surface dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800';

  if (minimal) {
    return (
      <button
        type="button"
        onClick={play}
        disabled={disabled}
        className={btn}
        aria-label={`Hear ${name} spoken aloud`}
        title={settings.textToSpeech ? 'Hear pronunciation' : 'Speech is off — enable it in Settings'}
      >
        <span aria-hidden>🔊</span>
        <span className="sr-only">Hear {name}</span>
      </button>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={play}
          disabled={disabled}
          className={`${btn} ${speech.speaking ? 'border-brand-600 bg-brand-50 dark:border-accent-500 dark:bg-slate-800' : ''}`}
          aria-label={`Hear ${name} spoken aloud`}
        >
          <span aria-hidden>🔊</span>
          <span>{speech.speaking ? 'Speaking…' : 'Hear word'}</span>
        </button>

        {speech.speaking && !minimal && (
          <button type="button" onClick={speech.pause} className={btn} aria-label="Pause speech">
            <span aria-hidden>⏸</span>
            <span>Pause</span>
          </button>
        )}
        {speech.paused && (
          <button type="button" onClick={speech.resume} className={btn} aria-label="Resume speech">
            <span aria-hidden>▶</span>
            <span>Resume</span>
          </button>
        )}

        {!minimal && (
          <button type="button" onClick={() => speech.replay(text)} className={btn} aria-label={`Replay ${name}`}>
            <span aria-hidden>🔁</span>
            <span className="hidden sm:inline">Replay</span>
          </button>
        )}

        {!minimal && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className={btn}
            aria-expanded={expanded}
            aria-label="More voice options"
          >
            <span aria-hidden>⋯</span>
          </button>
        )}

        {!minimal && (
          <label className="ml-1 inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={settings.textToSpeech}
              onChange={(e) => patch({ textToSpeech: e.target.checked })}
              className="h-4 w-4 rounded border-line accent-brand-600"
            />
            Speech on
          </label>
        )}
      </div>

      {notice && (
        <p className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-400" role="status">
          {notice}
        </p>
      )}
      {!speech.supported && (
        <p className="mt-2 text-sm text-ink-3 dark:text-slate-500">
          This browser does not support speech output. All instructions are available as text.
        </p>
      )}

      {expanded && !minimal && (
        <div className="mt-3 grid gap-4 rounded-2xl border border-line bg-surface-2 p-4 sm:grid-cols-2 dark:border-slate-700 dark:bg-slate-900/60">
          <label className="block">
            <span className="sb-label">Speech speed ({settings.speechRate.toFixed(2)}×)</span>
            <input
              type="range"
              min={0.5}
              max={1.6}
              step={0.05}
              value={settings.speechRate}
              onChange={(e) => patch({ speechRate: Number(e.target.value) })}
              className="w-full accent-brand-600"
            />
          </label>
          <label className="block">
            <span className="sb-label">Volume ({Math.round(settings.speechVolume * 100)}%)</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.speechVolume}
              onChange={(e) => patch({ speechVolume: Number(e.target.value) })}
              className="w-full accent-brand-600"
            />
          </label>
          <label className="block">
            <span className="sb-label">Pitch ({settings.speechPitch.toFixed(2)})</span>
            <input
              type="range"
              min={0.5}
              max={1.6}
              step={0.05}
              value={settings.speechPitch}
              onChange={(e) => patch({ speechPitch: Number(e.target.value) })}
              className="w-full accent-brand-600"
            />
          </label>
          <label className="block">
            <span className="sb-label">Voice</span>
            <select
              value={settings.speechVoiceURI ?? ''}
              onChange={(e) => patch({ speechVoiceURI: e.target.value || null })}
              className="sb-input"
              disabled={speech.voices.length === 0}
            >
              <option value="">System default</option>
              {speech.voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}

/** Reads a block of instructional text aloud — used on step lists. */
export function ReadAloud({ text, className = '' }: { text: string; className?: string }) {
  const speech = useSpeech();
  const enabled = useSettings((s) => s.textToSpeech);
  return (
    <button
      type="button"
      onClick={() => speech.replay(text)}
      disabled={!speech.supported || !enabled}
      className={`inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm font-semibold text-ink transition hover:bg-surface-3 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 ${className}`}
      aria-label="Read the instructions aloud"
    >
      <span aria-hidden>📖</span>
      Read instructions aloud
    </button>
  );
}

export default TextToSpeech;
