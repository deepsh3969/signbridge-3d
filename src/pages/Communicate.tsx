import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SpeechToText from '@/components/communication/SpeechToText';
import CommunicationBridge from '@/components/communication/CommunicationBridge';
import { speechRecognitionSupported } from '@/utils/audio';
import TextToSpeech from '@/components/accessibility/TextToSpeech';

const EXAMPLES = ['I need water', 'Hello, how are you?', 'Thank you, please help me', 'Good morning friend'];

export function Communicate() {
  const [sentence, setSentence] = useState('');
  const [recognised, setRecognised] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => setSupported(speechRecognitionSupported()), []);

  const toUpper = () => setSentence((s) => s.toUpperCase());

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-accent-400">
            Communication mode
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
            The communication bridge
          </h1>
          <p className="sb-muted mt-2 max-w-2xl">
            Speak or type on the left. On the right you get the sentence in capitals, every word that
            exists as a sign, and a 3D hand you can open for each one.
          </p>
        </div>
        <Link to="/signs" className="sb-btn-secondary">
          Browse dictionary
        </Link>
      </header>

      {!supported && (
        <div className="mt-5 rounded-2xl border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
          <strong>Speech recognition works best in supported browsers.</strong> Chrome and Edge give
          the most reliable results — in other browsers, type your sentence instead. Everything else
          on this page still works.
        </div>
      )}

      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        {/* ------------------------------------------------------------ LEFT */}
        <section className="sb-card p-5" aria-labelledby="speak-title">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ink-3 dark:text-slate-500">
                Left side
              </p>
              <h2 id="speak-title" className="text-lg font-extrabold uppercase tracking-wide">
                🗣 Speak / type
              </h2>
            </div>
            <button type="button" className="sb-btn-ghost h-9 px-3 text-sm" onClick={toUpper}>
              Aa → AA
            </button>
          </div>

          <div className="mt-4">
            <SpeechToText
              value={sentence}
              onChange={setSentence}
              onSubmit={() => setRecognised((r) => !r)}
              label="Sentence to translate"
            />
          </div>

          <div className="mt-5 rounded-2xl border border-line bg-surface-2 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-3 dark:text-slate-500">
              Recognised text
            </p>
            <p
              className="mt-2 min-h-14 break-words text-2xl font-extrabold uppercase tracking-wide"
              aria-live="polite"
            >
              {sentence.trim() ? sentence.trim() : '—'}
            </p>
            {sentence.trim() && (
              <div className="mt-3">
                <TextToSpeech text={sentence.trim()} label="your sentence" />
              </div>
            )}
          </div>

          <div className="mt-5">
            <p className="sb-label">Try an example</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setSentence(ex)}
                  className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold transition hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                >
                  “{ex}”
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-surface-2 p-4 dark:bg-slate-900/60">
            <h3 className="text-sm font-bold uppercase tracking-wide text-ink-3 dark:text-slate-400">
              How this works
            </h3>
            <ol className="mt-2 space-y-1.5 text-sm">
              {[
                'Your speech is converted to text in the browser.',
                'Each word is matched against the beginner dictionary.',
                'Matches become clickable signs with a 3D demonstration.',
                'Future: a translation layer will reorder words into sign grammar.',
              ].map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-bold text-brand-700 dark:text-accent-400">{i + 1}.</span>
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-4">
            <button
              type="button"
              className="sb-btn-primary"
              onClick={() => setRecognised((r) => !r)}
              disabled={!sentence.trim()}
            >
              Convert to signs →
            </button>
          </div>
          <span className="sr-only">{recognised ? 'Converted' : ''}</span>
        </section>

        {/* ----------------------------------------------------------- RIGHT */}
        <CommunicationBridge key={sentence} sentence={sentence} />
      </div>
    </div>
  );
}

export default Communicate;
