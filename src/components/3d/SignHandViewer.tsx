import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { HandModel } from './HandModel';
import { HandControls, type ViewId } from './HandControls';
import { getAnimation, getPose, type SignAnimation } from '@/three/handRig';
import { useSettings, speedValue } from '@/store/settings';
import type { AnimSpeed, Handedness } from '@/types';

export interface SignHandViewerProps {
  /** Sign id — resolves the animation from the sign's metadata */
  signId?: string;
  /** Explicit animation id (falls back to signId) */
  animationId?: string;
  /** Static pose when no animation applies */
  poseName?: string;
  /** 1 or 2 hands — two-handed signs render a supporting hand */
  hands?: 1 | 2;
  /** Pose held by the supporting (non-dominant) hand */
  offHandPose?: string;
  /** Dominant hand to render */
  handedness?: Handedness;
  height?: number;
  showControls?: boolean;
  compact?: boolean;
  autoPlay?: boolean;
  className?: string;
  /** Accessible label announced with the canvas */
  label?: string;
  onPlayingChange?: (playing: boolean) => void;
}

const VIEW_TARGETS: Record<ViewId, { pos: [number, number, number]; target: [number, number, number] }> = {
  front: { pos: [0.9, 0.6, 3.7], target: [0, 0.05, 0] },
  palm: { pos: [0, 0.25, 2.9], target: [0, 0.05, 0] },
  side: { pos: [3.5, 0.4, 0.3], target: [0, 0.05, 0] },
  back: { pos: [0.4, 0.5, -3.6], target: [0, 0.05, 0] },
};

interface PendingView {
  pos: THREE.Vector3;
  target: THREE.Vector3;
}

function ViewTween({
  pending,
  controlsRef,
}: {
  pending: React.MutableRefObject<PendingView | null>;
  controlsRef: React.MutableRefObject<any>;
}) {
  const camera = useThree((s) => s.camera);
  useFrame((_, delta) => {
    const p = pending.current;
    if (!p) return;
    const k = 1 - Math.exp(-8 * Math.min(delta, 0.05) * 2);
    camera.position.lerp(p.pos, k);
    const controls = controlsRef.current;
    if (controls) {
      controls.target.lerp(p.target, k);
      controls.update?.();
    }
    if (camera.position.distanceTo(p.pos) < 0.03) pending.current = null;
  });
  return null;
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.75} />
      <hemisphereLight intensity={0.55} color="#ffffff" groundColor="#8899bb" />
      <directionalLight
        position={[3.5, 5.5, 4]}
        intensity={1.35}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#cfe0ff" />
    </>
  );
}

function Scene({
  animation,
  staticPose,
  playing,
  speed,
  step,
  hands,
  offHandPose,
  handedness,
  mirror,
  showLabels,
  autoRotate,
  pending,
  controlsRef,
  onSegment,
}: {
  animation: SignAnimation | null;
  staticPose: ReturnType<typeof getPose> | null;
  playing: boolean;
  speed: number;
  step: number | null;
  hands: 1 | 2;
  offHandPose?: string;
  handedness: Handedness;
  mirror: boolean;
  showLabels: boolean;
  autoRotate: boolean;
  pending: React.MutableRefObject<PendingView | null>;
  controlsRef: React.MutableRefObject<any>;
  onSegment?: (i: number) => void;
}) {
  return (
    <>
      <Lights />
      <PerspectiveCamera makeDefault position={VIEW_TARGETS.front.pos} fov={42} near={0.1} far={60} />
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.08}
        enablePan
        minDistance={1.5}
        maxDistance={9}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI - 0.15}
        autoRotate={autoRotate}
        autoRotateSpeed={1.1}
      />
      <ViewTween pending={pending} controlsRef={controlsRef} />

      <group position={hands === 2 ? [0.72, 0, 0] : [0, 0, 0]}>
        <HandModel
          animation={animation}
          pose={animation ? null : (staticPose ?? getPose('neutral'))}
          playing={playing && step === null}
          speed={speed}
          step={step}
          mirror={mirror}
          showLabels={showLabels}
          onSegment={onSegment}
        />
      </group>

      {hands === 2 && (
        <group position={[-0.95, -0.18, 0.12]} rotation={[0, 0.2, 0]}>
          <HandModel pose={getPose(offHandPose ?? 'palmUp')} mirror={!mirror} damping={10} />
        </group>
      )}

      <ContactShadows position={[0, -1.35, 0]} opacity={0.34} scale={7} blur={2.6} far={3} />
    </>
  );
}

function webglSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

export function SignHandViewer({
  signId,
  animationId,
  poseName,
  hands = 1,
  offHandPose,
  handedness = 'Right',
  height = 420,
  showControls = true,
  compact = false,
  autoPlay = true,
  className = '',
  label,
  onPlayingChange,
}: SignHandViewerProps) {
  const settings = useSettings();
  const reducedMotion = settings.reducedMotion;
  const speed = speedValue(settings.animationSpeed);

  const animId = animationId ?? signId ?? undefined;
  const animation = useMemo(() => (animId ? (getAnimation(animId) ?? null) : null), [animId]);
  const staticPose = useMemo(() => (poseName ? getPose(poseName) : null), [poseName]);

  const [playing, setPlaying] = useState(autoPlay && !reducedMotion);
  const [view, setView] = useState<ViewId>('front');
  const [autoRotate, setAutoRotate] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [step, setStep] = useState<number | null>(null);
  const [speedState, setSpeedState] = useState<AnimSpeed>(settings.animationSpeed);
  const [glOk, setGlOk] = useState(true);

  const pending = useRef<PendingView | null>(null);
  const controlsRef = useRef<any>(null);
  const distanceRef = useRef(3.8);

  useEffect(() => {
    setGlOk(webglSupported());
  }, []);

  useEffect(() => {
    setSpeedState(settings.animationSpeed);
  }, [settings.animationSpeed]);

  useEffect(() => {
    setPlaying(autoPlay && !reducedMotion);
    onPlayingChange?.(autoPlay && !reducedMotion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animId]);

  const goView = useCallback((v: ViewId) => {
    setView(v);
    const t = VIEW_TARGETS[v];
    pending.current = {
      pos: new THREE.Vector3(...t.pos),
      target: new THREE.Vector3(...t.target),
    };
    const d = new THREE.Vector3(...t.pos).distanceTo(new THREE.Vector3(...t.target));
    distanceRef.current = d;
  }, []);

  const zoom = useCallback(
    (dir: 1 | -1) => {
      const controls = controlsRef.current;
      if (!controls) return;
      const target = controls.target.clone();
      const dirVec = controls.object.position.clone().sub(target);
      const len = dirVec.length();
      const next = Math.min(Math.max(len + dir * 0.6, 1.6), 8.5);
      dirVec.setLength(next);
      pending.current = { pos: target.clone().add(dirVec), target };
      distanceRef.current = next;
    },
    [],
  );

  const reset = useCallback(() => {
    setStep(null);
    setView('front');
    setAutoRotate(false);
    setPlaying(true);
    onPlayingChange?.(true);
    const t = VIEW_TARGETS.front;
    pending.current = { pos: new THREE.Vector3(...t.pos), target: new THREE.Vector3(...t.target) };
    distanceRef.current = new THREE.Vector3(...t.pos).length();
    if (controlsRef.current) controlsRef.current.reset?.();
  }, [onPlayingChange]);

  const togglePlay = useCallback(() => {
    setPlaying((p) => {
      onPlayingChange?.(!p);
      return !p;
    });
  }, [onPlayingChange]);

  // Global shortcuts (Space / R) dispatched by the page shell
  useEffect(() => {
    const onToggle = () => togglePlay();
    const onReset = () => reset();
    window.addEventListener('signbridge:toggle-play', onToggle);
    window.addEventListener('signbridge:reset-view', onReset);
    return () => {
      window.removeEventListener('signbridge:toggle-play', onToggle);
      window.removeEventListener('signbridge:reset-view', onReset);
    };
  }, [togglePlay, reset]);

  const stepCount = animation ? animation.keyframes.length : 0;
  const mirror = handedness === 'Left';

  if (!glOk) {
    return (
      <div
        className={`sb-card flex flex-col items-center justify-center gap-3 p-8 text-center ${className}`}
        style={{ minHeight: height }}
        role="img"
        aria-label={label ?? '3D hand viewer'}
      >
        <span className="text-4xl" aria-hidden>
          🤲
        </span>
        <p className="font-semibold">3D view is unavailable in this browser.</p>
        <p className="sb-muted max-w-sm text-sm">
          Your browser reported that WebGL is disabled. Every sign still includes step-by-step written
          instructions, spoken audio and images so you can keep learning.
        </p>
      </div>
    );
  }

  return (
    <div className={`sb-card overflow-hidden ${className}`}>
      <div
        className="relative bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950"
        role="img"
        aria-label={label ?? 'Interactive 3D hand demonstrating the sign'}
      >
        <div style={{ height }} className="w-full">
          <Canvas
            shadows
            dpr={[1, 1.8]}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          >
            <Suspense fallback={null}>
              <Scene
                animation={animation}
                staticPose={staticPose}
                playing={playing}
                speed={speed}
                step={step}
                hands={hands}
                offHandPose={offHandPose}
                handedness={handedness}
                mirror={mirror}
                showLabels={showLabels}
                autoRotate={autoRotate}
                pending={pending}
                controlsRef={controlsRef}
              />
            </Suspense>
          </Canvas>
        </div>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800/90 dark:text-slate-200">
            {handedness} hand
          </span>
          {hands === 2 && (
            <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800/90 dark:text-slate-200">
              Two-handed
            </span>
          )}
          {!animation && (
            <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800/90 dark:text-slate-200">
              Static pose
            </span>
          )}
        </div>

        <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800/90 dark:text-slate-300">
          Drag to rotate · Scroll to zoom
        </div>
      </div>

      {showControls && (
        <div className="border-t border-line p-3 dark:border-slate-800">
          <HandControls
            playing={playing}
            onTogglePlay={togglePlay}
            onReset={reset}
            speed={speedState}
            onSpeedChange={(s) => {
              setSpeedState(s);
              useSettings.getState().set('animationSpeed', s);
            }}
            view={view}
            onViewChange={goView}
            autoRotate={autoRotate}
            onToggleAutoRotate={() => setAutoRotate((a) => !a)}
            showLabels={showLabels}
            onToggleLabels={() => setShowLabels((s) => !s)}
            onZoom={zoom}
            step={step}
            stepCount={stepCount}
            onStepChange={(s) => {
              setStep(s);
              if (s !== null) setPlaying(false);
            }}
            compact={compact}
          />
        </div>
      )}
    </div>
  );
}

export default SignHandViewer;