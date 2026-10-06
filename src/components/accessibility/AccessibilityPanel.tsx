import { FONT_SIZES, ANIM_SPEEDS, useSettings } from '@/store/settings';
import type { AnimSpeed, FontSize } from '@/types';
import { loadVoices } from '@/utils/audio';
import { useEffect, useState } from 'react';

function Row({
  title,
  desc,
  children,
  htmlFor,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line py-4 last:border-0 dark:border-slate-800">
      <div className="min-w-0 flex-1">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="font-bold">
            {title}
          </label>
        ) : (
          <span className="font-bold">{title}</span>
        )}
        <p className="sb-muted mt-0.5 text-sm">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  id,
  checked,
  onChange,
  onLabel = 'On',
  offLabel = 'Off',
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  onLabel?: string;
  offLabel?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold uppercase text-ink-3 dark:text-slate-500" aria-hidden>
        {checked ? onLabel : offLabel}
      </span>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-16 rounded-full transition ${
          checked ? 'bg-brand-700 dark:bg-accent-600' : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
            checked ? 'left-9' : 'left-1'
          }`}
          aria-hidden
        />
      </button>
    </div>
  );
}

export function AccessibilityPanel() {
  const s = useSettings();
  const set = useSettings((st) => st.set);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    loadVoices().then(setVoices);
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="sb-card p-5" aria-labelledby="visual-heading">
        <h2 id="visual-heading" className="text-lg font-extrabold uppercase tracking-wide">
          Visual & reading
        </h2>

        <Row title="Font size" desc="Applies everywhere, immediately.">
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Font size">
            {FONT_SIZES.map((f) => (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={s.fontSize === f.id}
                onClick={() => set('fontSize', f.id as FontSize)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                  s.fontSize === f.id
                    ? 'border-brand-700 bg-brand-700 text-white dark:border-accent-600 dark:bg-accent-600'
                    : 'border-line bg-surface hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Row>

        <Row title="High contrast" desc="Stronger borders and darker text for low-vision readers." htmlFor="high-contrast">
          <Toggle id="high-contrast" checked={s.highContrast} onChange={(v) => set('highContrast', v)} />
        </Row>

        <Row title="Dark mode" desc="Easier on the eyes in low light; great for the 3D viewer." htmlFor="dark-mode">
          <Toggle id="dark-mode" checked={s.darkMode} onChange={(v) => set('darkMode', v)} />
        </Row>

        <Row title="Captions" desc="Shows contextual captions alongside animations and steps." htmlFor="captions">
          <Toggle id="captions" checked={s.captions} onChange={(v) => set('captions', v)} />
        </Row>

        <Row title="Reduced motion" desc="Turns off page transitions and auto-rotation." htmlFor="reduced-motion">
          <Toggle id="reduced-motion" checked={s.reducedMotion} onChange={(v) => set('reducedMotion', v)} />
        </Row>
      </section>

      <section className="sb-card p-5" aria-labelledby="audio-heading">
        <h2 id="audio-heading" className="text-lg font-extrabold uppercase tracking-wide">
          Audio & motion
        </h2>

        <Row title="Text-to-speech" desc="The 🔊 buttons read words and instructions aloud." htmlFor="tts">
          <Toggle id="tts" checked={s.textToSpeech} onChange={(v) => set('textToSpeech', v)} />
        </Row>

        <Row title="Speech speed" desc="How fast spoken words are read.">
          <div className="flex gap-1.5" role="radiogroup" aria-label="Speech speed">
            {[0.7, 0.95, 1.25].map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={s.speechRate === r}
                onClick={() => set('speechRate', r)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                  s.speechRate === r
                    ? 'border-brand-700 bg-brand-700 text-white dark:border-accent-600 dark:bg-accent-600'
                    : 'border-line bg-surface dark:border-slate-700 dark:bg-slate-900'
                }`}
              >
                {r === 0.7 ? '🐢' : r === 0.95 ? '▶' : '⚡'}
              </button>
            ))}
          </div>
        </Row>

        <Row title="Animation speed" desc="Default playback rate for every 3D demonstration.">
          <div className="flex gap-1.5" role="radiogroup" aria-label="Animation speed">
            {ANIM_SPEEDS.map((a) => (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={s.animationSpeed === a.id}
                onClick={() => set('animationSpeed', a.id as AnimSpeed)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                  s.animationSpeed === a.id
                    ? 'border-brand-700 bg-brand-700 text-white dark:border-accent-600 dark:bg-accent-600'
                    : 'border-line bg-surface dark:border-slate-700 dark:bg-slate-900'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </Row>

        <Row title="Sound effects" desc="Optional chimes for correct answers. Never required to learn." htmlFor="sound">
          <Toggle id="sound" checked={s.soundEffects} onChange={(v) => set('soundEffects', v)} />
        </Row>

        <Row title="Keyboard shortcuts" desc="Space, R, M, C, arrows and Ctrl+K across the app." htmlFor="kbd">
          <Toggle id="kbd" checked={s.keyboardNavigation} onChange={(v) => set('keyboardNavigation', v)} />
        </Row>

        <Row title="Preferred voice" desc="Uses your browser's installed voices.">
          <select
            className="sb-input max-w-56"
            aria-label="Preferred speech voice"
            value={s.speechVoiceURI ?? ''}
            onChange={(e) => set('speechVoiceURI', e.target.value || null)}
            disabled={voices.length === 0}
          >
            <option value="">System default</option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </Row>
      </section>
    </div>
  );
}

export default AccessibilityPanel;
