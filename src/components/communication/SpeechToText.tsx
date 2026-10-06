import { useEffect, useState } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeech';

export interface SpeechToTextProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  label?: string;
}

export function SpeechToText({
  value,
  onChange,
  onSubmit,
  placeholder = 'Type a sentence, for example “I need water”…',
  label = 'Your sentence',
}: SpeechToTextProps) {
  const rec = useSpeechRecognition();
  const [localNotice, setLocalNotice] = useState<string | null>(null);

  useEffect(() => {
    if (rec.transcript) onChange(rec.transcript);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rec.transcript]);

  const listening = rec.status === 'listening';

  const toggleMic = () => {
    setLocalNotice(null);
    if (listening) rec.stop();
    else rec.start();
  };

  return (
    <div>
      <label htmlFor="comm-input" className="sb-label">
        {label}
      </label>
      <textarea
        id="comm-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit?.();
          }
        }}
        placeholder={placeholder}
        rows={4}
        className="sb-input resize-y"
        aria-describedby="comm-input-help"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleMic}
          disabled={!rec.supported}
          aria-pressed={listening}
          className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            listening
              ? 'bg-rose-600 text-white hover:bg-rose-700'
              : 'bg-brand-700 text-white hover:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400'
          }`}
          title={rec.supported ? 'Speak your sentence' : 'Speech recognition is unavailable in this browser'}
        >
          <span aria-hidden>{listening ? '⏹' : '🎤'}</span>
          {listening ? 'Stop listening' : 'Speak'}
        </button>

        {value && (
          <button type="button" className="sb-btn-ghost" onClick={() => { onChange(''); rec.reset(); }}>
            Clear
          </button>
        )}

        {onSubmit && (
          <button type="button" className="sb-btn-secondary" onClick={onSubmit}>
            Convert to signs
          </button>
        )}

        {listening && (
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-400" role="status">
            <span className="h-2.5 w-2.5 animate-ping rounded-full bg-rose-500" aria-hidden />
            Listening…
          </span>
        )}
      </div>

      {rec.interim && (
        <p className="mt-2 text-sm italic text-ink-3 dark:text-slate-500" aria-live="polite">
          {rec.interim}…
        </p>
      )}

      <p id="comm-input-help" className="mt-2 text-xs leading-relaxed text-ink-3 dark:text-slate-500">
        {rec.supported
          ? 'Speech recognition works best in Chrome and Edge. Typing always works as a fallback.'
          : 'Speech recognition is not available in this browser — please type instead. Your sentence still converts to signs the same way.'}
      </p>

      {rec.error && (
        <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-200" role="alert">
          {rec.error}
        </p>
      )}
      {localNotice && (
        <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-200" role="alert">
          {localNotice}
        </p>
      )}
    </div>
  );
}

export default SpeechToText;
