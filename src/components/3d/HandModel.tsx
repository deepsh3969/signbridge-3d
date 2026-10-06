import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import {
  getPose,
  interpolatePose,
  resolveKeyframePose,
  type FingerName,
  type HandPose,
  type SignAnimation,
} from '@/three/handRig';

/* --------------------------------------------------------------------------
   Procedural HandModel — the SignBridge 3D hand rig
   --------------------------------------------------------------------------
   Joint layout (flat ref array):

     0  wrist                1  thumb base   2,3,4  thumb joints
     5  index spread         6,7,8   index joints
     9  middle spread       10,11,12 middle joints
    13  ring spread         14,15,16 ring joints
    17  little spread       18,19,20 little joints

   The animation timeline is evaluated entirely inside useFrame so playback
   never triggers a React re-render. Swapping this for a GLB/GLTF rig only
   requires a component that understands the same 21 joint slots.
   ------------------------------------------------------------------------ */

const JOINT_COUNT = 21;
const THUMB_BASE_ROLL = 0.6;

interface FingerSpec {
  name: Exclude<FingerName, 'thumb'>;
  baseIndex: number;
  jointIndex: number;
  x: number;
  y: number;
  z: number;
  lens: [number, number, number];
  radius: number;
}

const FINGERS: FingerSpec[] = [
  { name: 'index', baseIndex: 5, jointIndex: 6, x: -0.3, y: 0.44, z: 0.02, lens: [0.3, 0.24, 0.2], radius: 0.075 },
  { name: 'middle', baseIndex: 9, jointIndex: 10, x: -0.07, y: 0.48, z: 0.02, lens: [0.33, 0.26, 0.21], radius: 0.077 },
  { name: 'ring', baseIndex: 13, jointIndex: 14, x: 0.16, y: 0.45, z: 0.02, lens: [0.3, 0.24, 0.19], radius: 0.072 },
  { name: 'little', baseIndex: 17, jointIndex: 18, x: 0.37, y: 0.37, z: 0.02, lens: [0.24, 0.19, 0.16], radius: 0.062 },
];

const THUMB = {
  x: -0.42,
  y: -0.02,
  z: 0.05,
  lens: [0.3, 0.25, 0.2] as [number, number, number],
  radius: 0.088,
};

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

interface TimelineSegment {
  from: HandPose;
  to: HandPose;
  start: number;
  end: number;
}

function buildTimeline(anim: SignAnimation): { segments: TimelineSegment[]; total: number } {
  const raw = anim.keyframes.map(resolveKeyframePose);
  if (raw.length === 0) return { segments: [], total: 0 };
  const durs = anim.keyframes.map((k) => Math.max(k.dur, 0.05));

  const poses = [...raw];
  const durs2 = [...durs];

  if (anim.loop) {
    const firstId = anim.keyframes[0].pose;
    const lastId = anim.keyframes[anim.keyframes.length - 1].pose;
    const same = typeof firstId === 'string' && typeof lastId === 'string' && firstId === lastId;
    if (!same) {
      poses.push(raw[0]);
      durs2.push(durs[durs.length - 1]);
    }
  }

  const segments: TimelineSegment[] = [];
  let cursor = 0;
  for (let i = 0; i < poses.length - 1; i++) {
    const start = cursor;
    cursor += durs2[i];
    segments.push({ from: poses[i], to: poses[i + 1], start, end: cursor });
  }
  return { segments, total: cursor };
}

export interface HandModelProps {
  /** Static target pose (used when no animation is supplied) */
  pose?: HandPose | null;
  /** Animation clip to play */
  animation?: SignAnimation | null;
  playing?: boolean;
  /** Playback rate multiplier */
  speed?: number;
  /** When set, freezes the rig on that keyframe (step-by-step mode) */
  step?: number | null;
  mirror?: boolean;
  skin?: string;
  showLabels?: boolean;
  damping?: number;
  /** Fires when the active keyframe index changes */
  onSegment?: (index: number) => void;
}

export function HandModel({
  pose,
  animation,
  playing = false,
  speed = 1,
  step = null,
  mirror = false,
  skin = '#e7b590',
  showLabels = false,
  damping = 20,
  onSegment,
}: HandModelProps) {
  const joints = useRef<(THREE.Object3D | null)[]>(new Array(JOINT_COUNT).fill(null));
  const callbacks = useRef<((el: THREE.Object3D | null) => void)[]>(null as never);
  const current = useRef<HandPose>(pose ?? getPose('neutral'));
  const timeRef = useRef(0);
  const segmentRef = useRef(-1);
  const root = useRef<THREE.Group>(null);
  const onSegmentRef = useRef(onSegment);
  onSegmentRef.current = onSegment;

  if (!callbacks.current) {
    callbacks.current = Array.from({ length: JOINT_COUNT }, (_, i) => (el: THREE.Object3D | null) => {
      joints.current[i] = el;
    });
  }

  const timeline = useMemo(() => (animation ? buildTimeline(animation) : null), [animation]);

  const stepIndexRef = useRef<number | null>(step);
  stepIndexRef.current = step;

  const playingRef = useRef(playing);
  playingRef.current = playing;
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    let target: HandPose;
    let activeSegment = -1;

    if (stepIndexRef.current !== null && timeline && animation) {
      const idx = Math.min(Math.max(stepIndexRef.current, 0), timeline.segments.length);
      target =
        idx === 0
          ? resolveKeyframePose(animation.keyframes[0])
          : timeline.segments[Math.min(idx, timeline.segments.length) - 1].to;
      activeSegment = idx;
    } else if (timeline && timeline.segments.length > 0) {
      if (playingRef.current) {
        timeRef.current += dt * speedRef.current;
        if (animation?.loop) {
          timeRef.current %= timeline.total;
        } else if (timeRef.current > timeline.total) {
          timeRef.current = timeline.total;
        }
      }
      const t = timeRef.current;
      let seg = timeline.segments[timeline.segments.length - 1];
      let idx = timeline.segments.length - 1;
      for (let i = 0; i < timeline.segments.length; i++) {
        if (t < timeline.segments[i].end || i === timeline.segments.length - 1) {
          seg = timeline.segments[i];
          idx = i;
          break;
        }
      }
      const span = seg.end - seg.start;
      const raw = span > 0 ? (t - seg.start) / span : 1;
      const u = easeInOut(Math.min(Math.max(raw, 0), 1));
      target = interpolatePose(seg.from, seg.to, u);
      activeSegment = idx;
    } else {
      target = pose ?? getPose('neutral');
    }

    if (activeSegment !== segmentRef.current) {
      segmentRef.current = activeSegment;
      onSegmentRef.current?.(activeSegment);
    }

    const k = damping === 0 ? 1 : 1 - Math.exp(-damping * dt);
    const next = interpolatePose(current.current, target, k);
    current.current = next;

    const set = (i: number, x: number, y: number, z: number) => {
      const o = joints.current[i];
      if (!o) return;
      o.rotation.x = x;
      o.rotation.y = y;
      o.rotation.z = z;
    };

    set(0, next.wrist[0], next.wrist[1], next.wrist[2]);
    set(1, 0, -next.thumb.yaw, THUMB_BASE_ROLL + next.thumb.roll);
    set(2, next.thumb.c1, 0, 0);
    set(3, next.thumb.c2, 0, 0);
    set(4, next.thumb.c3, 0, 0);

    for (const spec of FINGERS) {
      const f = next[spec.name];
      set(spec.baseIndex, 0, 0, f.spread);
      set(spec.jointIndex, f.c1, 0, 0);
      set(spec.jointIndex + 1, f.c2, 0, 0);
      set(spec.jointIndex + 2, f.c3, 0, 0);
    }

    if (root.current) {
      root.current.position.y = next.lift ?? 0;
      root.current.position.x = next.shift ?? 0;
    }
  });

  const labelPositions = useMemo(
    () => FINGERS.map((f) => ({ name: f.name, pos: [f.x, f.y + 0.2, f.z] as [number, number, number] })),
    [],
  );

  return (
    <group ref={root} scale={mirror ? [-1, 1, 1] : [1, 1, 1]}>
      <group ref={callbacks.current[0]} position={[0, -0.42, 0]}>
        <mesh position={[0, -0.5, 0]} castShadow>
          <capsuleGeometry args={[0.17, 0.62, 4, 14]} />
          <meshStandardMaterial color={skin} roughness={0.66} side={THREE.DoubleSide} />
        </mesh>

        <RoundedBox
          args={[0.88, 0.86, 0.22]}
          radius={0.1}
          smoothness={5}
          position={[0, 0.06, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={skin} roughness={0.6} side={THREE.DoubleSide} />
        </RoundedBox>

        <mesh position={[-0.36, -0.1, 0.05]} rotation={[0, 0, 0.5]} castShadow>
          <capsuleGeometry args={[0.13, 0.24, 4, 12]} />
          <meshStandardMaterial color={skin} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>

        <group ref={callbacks.current[1]} position={[THUMB.x, THUMB.y, THUMB.z]}>
          <FingerChain setRef={callbacks.current} startIndex={2} lens={THUMB.lens} radius={THUMB.radius} skin={skin} />
        </group>

        {FINGERS.map((f) => (
          <group key={f.name} ref={callbacks.current[f.baseIndex]} position={[f.x, f.y, f.z]}>
            <FingerChain
              setRef={callbacks.current}
              startIndex={f.jointIndex}
              lens={f.lens}
              radius={f.radius}
              skin={skin}
            />
          </group>
        ))}
      </group>

      {showLabels &&
        labelPositions.map((l) => (
          <Html key={l.name} position={l.pos} center distanceFactor={6} zIndexRange={[10, 0]}>
            <span className="pointer-events-none select-none whitespace-nowrap rounded-full bg-slate-900/85 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
              {l.name}
            </span>
          </Html>
        ))}
    </group>
  );
}

interface FingerChainProps {
  setRef: ((el: THREE.Object3D | null) => void)[];
  startIndex: number;
  lens: [number, number, number];
  radius: number;
  skin: string;
}

function FingerChain({ setRef, startIndex, lens, radius, skin }: FingerChainProps) {
  const segs = useMemo(
    () => [
      { len: lens[0], r: radius },
      { len: lens[1], r: radius * 0.93 },
      { len: lens[2], r: radius * 0.84 },
    ],
    [lens, radius],
  );

  let y = 0;
  const nodes = segs.map((s, i) => {
    const start = y;
    y += s.len;
    return { ...s, start, i };
  });

  return (
    <group>
      {nodes.map((n) => (
        <group key={n.i} ref={setRef[startIndex + n.i]} position={[0, n.start, 0]}>
          <mesh position={[0, n.len / 2, 0]} castShadow>
            <capsuleGeometry args={[n.r, Math.max(n.len - n.r * 1.4, 0.02), 4, 14]} />
            <meshStandardMaterial color={skin} roughness={0.62} side={THREE.DoubleSide} />
          </mesh>
          <mesh castShadow>
            <sphereGeometry args={[n.r * 1.03, 14, 12]} />
            <meshStandardMaterial color={skin} roughness={0.6} side={THREE.DoubleSide} />
          </mesh>
          {n.i === 2 && (
            <mesh position={[0, n.len - n.r * 0.35, -n.r * 0.7]} rotation={[0.25, 0, 0]}>
              <sphereGeometry args={[n.r * 0.5, 10, 8]} />
              <meshStandardMaterial color="#f9dcc8" roughness={0.35} side={THREE.DoubleSide} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

export default HandModel;
