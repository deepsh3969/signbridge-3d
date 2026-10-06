import { useCallback, useEffect, useRef, useState } from 'react';
import {
  cancelSpeech,
  loadVoices,
  pauseSpeech,
  resumeSpeech,
  speak,
  speechRecognitionSupported,
  speechSupported,
} from '@/utils/audio';
import { useSettings } from '@/store/settings';

/* -------------------------------------------------------------------------- */
/* Text-to-speech                                                             */
/* -------------------------------------------------------------------------- */

export interface UseSpeech {
  supported: boolean;
  speaking: boolean;
  paused: boolean;
  voices: SpeechSynthesisVoice[];
  voicesReady: boolean;
  speak: (text: string, opts?: { rate?: number; pitch?: number; volume?: number }) => boolean;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  replay: (text: string) => void;
  lastText: string;
  /** Set when speech could not be produced so the UI can explain why */
  error: string | null;
}

export function useSpeech(): UseSpeech {
  const settings = useSettings();
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voicesReady, setVoicesReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastText = useRef('');

  const supported = speechSupported();

  useEffect(() => {
    let cancelled = false;
    loadVoices().then((v) => {
      if (!cancelled) {
        setVoices(v);
        setVoicesReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => cancelSpeech();
  }, []);

  const doSpeak = useCallback(
    (text: string, opts: { rate?: number; pitch?: number; volume?: number } = {}) => {
      if (!settings.textToSpeech) {
        setError('Speech is turned off in Settings.');
        return false;
      }
      lastText.current = text;
      setError(null);
      const ok = speak(text, {
        rate: opts.rate ?? settings.speechRate,
        pitch: opts.pitch ?? settings.speechPitch,
        volume: opts.volume ?? settings.speechVolume,
        voiceURI: settings.speechVoiceURI,
        onStart: () => {
          setSpeaking(true);
          setPaused(false);
        },
        onEnd: () => {
          setSpeaking(false);
          setPaused(false);
        },
        onError: (reason) => {
          setSpeaking(false);
          setError(
            reason === 'unsupported'
              ? 'This browser does not support speech output. The written text is always available.'
              : 'Speech could not be played. Try again or check your volume settings.',
          );
        },
      });
      if (!ok && !error) {
        setError(
          supported
            ? 'Speech could not be played. Try again.'
            : 'This browser does not support speech output. The written text is always available.',
        );
      }
      return ok;
    },
    [settings, supported, error],
  );

  const cancel = useCallback(() => {
    cancelSpeech();
    setSpeaking(false);
    setPaused(false);
  }, []);

  const pause = useCallback(() => {
    pauseSpeech();
    setPaused(true);
    setSpeaking(false);
  }, []);

  const resume = useCallback(() => {
    resumeSpeech();
    setPaused(false);
    setSpeaking(true);
  }, []);

  const replay = useCallback(
    (text: string) => {
      cancelSpeech();
      window.setTimeout(() => doSpeak(text), 60);
    },
    [doSpeak],
  );

  return {
    supported,
    speaking,
    paused,
    voices,
    voicesReady,
    speak: doSpeak,
    pause,
    resume,
    cancel,
    replay,
    lastText: lastText.current,
    error,
  };
}

/* -------------------------------------------------------------------------- */
/* Speech-to-text                                                             */
/* -------------------------------------------------------------------------- */

export type RecognitionStatus = 'idle' | 'listening' | 'processing' | 'unsupported' | 'denied' | 'error';

export interface UseSpeechRecognition {
  supported: boolean;
  status: RecognitionStatus;
  transcript: string;
  interim: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognition {
  const [status, setStatus] = useState<RecognitionStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<any>(null);
  const supported = speechRecognitionSupported();

  const stop = useCallback(() => {
    try {
      recRef.current?.stop?.();
    } catch {
      /* already stopped */
    }
    setStatus((s) => (s === 'listening' ? 'idle' : s));
  }, []);

  const start = useCallback(() => {
    if (!supported) {
      setStatus('unsupported');
      setError('Speech recognition is not available in this browser.');
      return;
    }
    try {
      const w = window as any;
      const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
      const rec = new Ctor();
      rec.lang = 'en-US';
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setStatus('listening');
        setError(null);
        setInterim('');
      };
      rec.onresult = (event: any) => {
        let live = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const r = event.results[i];
          if (r.isFinal) final += r[0].transcript;
          else live += r[0].transcript;
        }
        setInterim(live);
        if (final) {
          setTranscript((t) => (t ? `${t} ${final.trim()}` : final.trim()));
          setInterim('');
        }
      };
      rec.onerror = (event: any) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setStatus('denied');
          setError('Microphone access was blocked. Allow the microphone, or type your sentence instead.');
        } else if (event.error === 'no-speech') {
          setStatus('idle');
          setError('No speech was detected. Try again and speak clearly.');
        } else if (event.error === 'aborted') {
          setStatus('idle');
        } else {
          setStatus('error');
          setError('Speech recognition stopped unexpectedly. You can type instead.');
        }
      };
      rec.onend = () => setStatus((s) => (s === 'listening' ? 'idle' : s));

      recRef.current = rec;
      rec.start();
    } catch {
      setStatus('error');
      setError('Could not start speech recognition. You can type your sentence instead.');
    }
  }, [supported]);

  const reset = useCallback(() => {
    setTranscript('');
    setInterim('');
    setError(null);
    setStatus('idle');
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { supported, status, transcript, interim, error, start, stop, reset };
}
