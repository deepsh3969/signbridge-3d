import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { createRecognitionEngine, type FrameResult } from './SignRecognitionEngine';
import SignHandViewer from '@/components/3d/SignHandViewer';
import { cameraSupported } from '@/utils/audio';
import type { Sign } from '@/types';

type CamState = 'idle' | 'starting' | 'live' | 'denied' | 'unsupported' | 'error';

export interface CameraPracticeProps {
  sign: Sign;
  onClose?: () => void;
}

export function CameraPractice({ sign, onClose }: CameraPracticeProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const engineRef = useRef(createRecognitionEngine());
  const [state, setState] = useState<CamState>('idle');
  const [result, setResult] = useState<FrameResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    engineRef.current.stop();
  }, []);

  const tick = useCallback(async () => {
    const video = videoRef.current;
    if (video && video.readyState >= 2) {
      try {
        const r = await engineRef.current.analyzeFrame(video, performance.now());
        setResult(r);
      } catch {
        setResult({
          detected: false,
          modelStatus: 'error',
          message: 'The recognition step failed. You can still compare your hand with the 3D model.',
        });
      }
    }
    rafRef.current = requestAnimationFrame(() => void tick());
  }, []);

  const startCamera = useCallback(async () => {
    if (!cameraSupported()) {
      setState('unsupported');
      setError(
        'This browser does not expose camera access. You can still practise using the 3D model and the written steps.',
      );
      return;
    }
    setState('starting');
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      await engineRef.current.start(videoRef.current!);
      setState('live');
      rafRef.current = requestAnimationFrame(() => void tick());
    } catch (err: any) {
      const name = err?.name ?? '';
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setState('denied');
        setError(
          'Camera permission was declined. Allow camera access in your browser settings, or continue with observe-only practice.',
        );
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setState('error');
        setError('No camera was found on this device. Observe-only practice still works.');
      } else {
        setState('error');
        setError('The camera could not start. Observe-only practice still works.');
      }
    }
  }, [tick]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const statusTone =
    result?.modelStatus === 'ready'
      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
      : 'border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200';

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* -------------------------------------------------------- webcam side */}
      <section className="sb-card overflow-hidden" aria-labelledby="camera-title">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 dark:border-slate-800">
          <h3 id="camera-title" className="font-bold">
            Live camera
          </h3>
          <span className="sb-chip">{state === 'live' ? '● On' : '○ Off'}</span>
        </div>

        <div className="relative aspect-video w-full bg-slate-950">
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full -scale-x-100 object-cover"
            aria-label="Live webcam preview"
          />

          {state !== 'live' && (
            <div className="absolute inset-0 grid place-items-center p-6 text-center">
              <div className="max-w-sm">
                <p className="text-3xl" aria-hidden>
                  📷
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-200">
                  {state === 'starting' ? 'Starting camera…' : 'Camera is off'}
                </p>
                {error && <p className="mt-2 text-xs leading-relaxed text-slate-400">{error}</p>}
              </div>
            </div>
          )}

          {/* guide frame */}
          {state === 'live' && (
            <div
              className="pointer-events-none absolute inset-[12%] rounded-3xl border-2 border-dashed border-white/50"
              aria-hidden
            />
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-line p-4 dark:border-slate-800">
          {state !== 'live' ? (
            <button type="button" className="sb-btn-primary" onClick={() => void startCamera()}>
              Start camera
            </button>
          ) : (
            <button
              type="button"
              className="sb-btn-secondary"
              onClick={() => {
                stopCamera();
                setState('idle');
                setResult(null);
              }}
            >
              Stop camera
            </button>
          )}
          {onClose && (
            <button type="button" className="sb-btn-ghost" onClick={onClose}>
              Back to observe mode
            </button>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------ expected sign */}
      <section className="space-y-4" aria-labelledby="expected-title">
        <div className="sb-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ink-3 dark:text-slate-500">
                Expected sign
              </p>
              <h3 id="expected-title" className="text-2xl font-extrabold uppercase">
                {sign.word}
              </h3>
            </div>
            <Link to={`/sign/${sign.id}`} className="text-sm font-bold text-brand-700 hover:underline dark:text-accent-400">
              Open lesson →
            </Link>
          </div>
          <div className="mt-3">
            <SignHandViewer
              signId={sign.animationId}
              hands={sign.hands}
              offHandPose={sign.offHand}
              handedness={sign.handedness}
              height={260}
              compact
              label={`Expected sign ${sign.word}`}
            />
          </div>
        </div>

        <div className={`sb-card border-2 p-4 ${statusTone}`}>
          <p className="text-xs font-bold uppercase tracking-wide">Recognition status</p>
          <p className="mt-1.5 text-3xl font-extrabold">Not enabled</p>
          <p className="mt-2 text-sm leading-relaxed">
            {result?.message ??
              'Sign recognition requires a trained model. Camera preview and the expected-sign comparison are ready so the feature can be switched on the moment a validated model exists.'}
          </p>

          <dl className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between gap-3 border-b border-current/20 pb-1.5">
              <dt>Engine</dt>
              <dd className="font-semibold">{engineRef.current.name}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-current/20 pb-1.5">
              <dt>Landmarks expected</dt>
              <dd className="font-semibold">21 keypoints</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Pipeline</dt>
              <dd className="font-semibold">Camera → MediaPipe → Classifier → Feedback</dd>
            </div>
          </dl>

          <p className="mt-4 rounded-xl bg-white/70 px-3 py-2 text-xs leading-relaxed dark:bg-black/25">
            We do not display fake confidence scores. When the model ships you will see the detected
            sign, a confidence percentage and specific coaching such as “move your hand slightly
            upward”.
          </p>
        </div>

        <div className="sb-card p-4">
          <p className="text-sm font-bold uppercase tracking-wide text-ink-3 dark:text-slate-400">
            While you wait
          </p>
          <ol className="mt-2 space-y-1.5 text-sm">
            {sign.steps.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-bold text-brand-700 dark:text-accent-400">{i + 1}.</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

export default CameraPractice;
