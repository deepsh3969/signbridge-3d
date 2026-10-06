/**
 * ---------------------------------------------------------------------------
 * Browser audio helpers
 * ---------------------------------------------------------------------------
 * Web Speech API wrapper with graceful degradation. Every failure path falls
 * back to a friendly, non-technical message — users never see raw errors.
 * ---------------------------------------------------------------------------
 */

let voicesCache: SpeechSynthesisVoice[] = [];
let currentUtterance: SpeechSynthesisUtterance | null = null;

export const speechSupported = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!speechSupported()) return Promise.resolve([]);
  return new Promise((resolve) => {
    const list = window.speechSynthesis.getVoices();
    if (list.length) {
      voicesCache = list;
      resolve(list);
      return;
    }
    const onVoices = () => {
      voicesCache = window.speechSynthesis.getVoices();
      window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
      resolve(voicesCache);
    };
    window.speechSynthesis.addEventListener('voiceschanged', onVoices);
    // some browsers never fire it — resolve with whatever we have
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
      voicesCache = window.speechSynthesis.getVoices();
      resolve(voicesCache);
    }, 1200);
  });
}

export const getCachedVoices = (): SpeechSynthesisVoice[] => {
  if (voicesCache.length === 0 && speechSupported()) voicesCache = window.speechSynthesis.getVoices();
  return voicesCache;
};

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceURI?: string | null;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (reason: 'unsupported' | 'failed') => void;
}

export function speak(text: string, options: SpeakOptions = {}): boolean {
  if (!speechSupported()) {
    options.onError?.('unsupported');
    return false;
  }
  if (!text.trim()) return false;

  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = options.rate ?? 0.95;
    utter.pitch = options.pitch ?? 1;
    utter.volume = options.volume ?? 1;
    utter.lang = options.lang ?? 'en-US';

    const voices = getCachedVoices();
    const exact = options.voiceURI ? voices.find((v) => v.voiceURI === options.voiceURI) : undefined;
    const preferred =
      exact ??
      voices.find((v) => v.lang.replace('_', '-').startsWith('en') && v.default) ??
      voices.find((v) => v.lang.replace('_', '-').startsWith('en'));
    if (preferred) utter.voice = preferred;

    utter.onstart = () => options.onStart?.();
    utter.onend = () => {
      currentUtterance = null;
      options.onEnd?.();
    };
    utter.onerror = () => {
      currentUtterance = null;
      options.onError?.('failed');
    };

    currentUtterance = utter;
    window.speechSynthesis.speak(utter);
    return true;
  } catch {
    options.onError?.('failed');
    return false;
  }
}

export function pauseSpeech(): void {
  if (!speechSupported()) return;
  try {
    window.speechSynthesis.pause();
  } catch {
    /* ignore */
  }
}

export function resumeSpeech(): void {
  if (!speechSupported()) return;
  try {
    window.speechSynthesis.resume();
  } catch {
    /* ignore */
  }
}

export function cancelSpeech(): void {
  if (!speechSupported()) return;
  try {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  } catch {
    /* ignore */
  }
}

export const isSpeaking = (): boolean => speechSupported() && window.speechSynthesis.speaking;
export const isPaused = (): boolean => speechSupported() && window.speechSynthesis.paused;
export const getCurrentUtterance = () => currentUtterance;

/* ---------------------------------------------------------------------- */
/* Optional UI chimes — never required to understand the app               */
/* ---------------------------------------------------------------------- */

let audioCtx: AudioContext | null = null;

export function playTone(kind: 'correct' | 'wrong' | 'unlock' = 'correct'): void {
  try {
    const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!Ctor) return;
    audioCtx = audioCtx ?? new Ctor();
    if (audioCtx.state === 'suspended') void audioCtx.resume();
    const ctx = audioCtx;
    const now = ctx.currentTime;
    const notes = kind === 'correct' ? [660, 880] : kind === 'unlock' ? [523, 659, 784] : [330, 262];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + i * 0.11);
      gain.gain.exponentialRampToValueAtTime(0.12, now + i * 0.11 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.11 + 0.22);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.11);
      osc.stop(now + i * 0.11 + 0.25);
    });
  } catch {
    /* audio is a nice-to-have */
  }
}

/* ---------------------------------------------------------------------- */
/* Browser support probes used by friendly error messages                  */
/* ---------------------------------------------------------------------- */

export function speechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function cameraSupported(): boolean {
  return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);
}
