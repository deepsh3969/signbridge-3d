/**
 * ---------------------------------------------------------------------------
 * SignBridge 3D — Hand rig abstraction layer
 * ---------------------------------------------------------------------------
 * This module is deliberately decoupled from any specific 3D asset.
 *
 *   HandModel     -> how a hand is drawn (procedural today, GLB/GLTF later)
 *   SignPose      -> a static description of every joint angle
 *   SignAnimation -> an ordered list of keyframes (poses + durations)
 *   SignSequence  -> an animation bound to a sign, with playback options
 *
 * Swapping the procedural hand for a motion-captured GLB model only requires
 * a new <HandModel/> implementation that understands the same SignPose shape.
 * ---------------------------------------------------------------------------
 */

export type FingerName = 'thumb' | 'index' | 'middle' | 'ring' | 'little';

/** Finger joints: spread (abduction) + 3 successive curl joints. */
export interface FingerCurl {
  spread: number;
  c1: number;
  c2: number;
  c3: number;
}

/** The thumb has an extra saddle joint, so it gets yaw + roll. */
export interface ThumbPose {
  yaw: number;
  roll: number;
  c1: number;
  c2: number;
  c3: number;
}

export interface HandPose {
  thumb: ThumbPose;
  index: FingerCurl;
  middle: FingerCurl;
  ring: FingerCurl;
  little: FingerCurl;
  /** Wrist rotation [x, y, z] in radians */
  wrist: [number, number, number];
  /** Optional whole-hand vertical offset (metres) for expressive motion */
  lift?: number;
  /** Optional whole-hand horizontal offset (metres) */
  shift?: number;
}

export const f = (spread = 0, c1 = 0, c2 = 0, c3 = 0): FingerCurl => ({ spread, c1, c2, c3 });

export const thumb = (yaw = 0, roll = 0, c1 = 0, c2 = 0, c3 = 0): ThumbPose => ({
  yaw,
  roll,
  c1,
  c2,
  c3,
});

export const pose = (p: Partial<HandPose>): HandPose => ({
  thumb: p.thumb ?? thumb(),
  index: p.index ?? f(),
  middle: p.middle ?? f(),
  ring: p.ring ?? f(),
  little: p.little ?? f(),
  wrist: p.wrist ?? [0, 0, 0],
  lift: p.lift ?? 0,
  shift: p.shift ?? 0,
});

export const clonePose = (p: HandPose): HandPose => ({
  thumb: { ...p.thumb },
  index: { ...p.index },
  middle: { ...p.middle },
  ring: { ...p.ring },
  little: { ...p.little },
  wrist: [...p.wrist] as [number, number, number],
  lift: p.lift ?? 0,
  shift: p.shift ?? 0,
});

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function interpolatePose(a: HandPose, b: HandPose, t: number): HandPose {
  return {
    thumb: {
      yaw: lerp(a.thumb.yaw, b.thumb.yaw, t),
      roll: lerp(a.thumb.roll, b.thumb.roll, t),
      c1: lerp(a.thumb.c1, b.thumb.c1, t),
      c2: lerp(a.thumb.c2, b.thumb.c2, t),
      c3: lerp(a.thumb.c3, b.thumb.c3, t),
    },
    index: lerpFinger(a.index, b.index, t),
    middle: lerpFinger(a.middle, b.middle, t),
    ring: lerpFinger(a.ring, b.ring, t),
    little: lerpFinger(a.little, b.little, t),
    wrist: [
      lerp(a.wrist[0], b.wrist[0], t),
      lerp(a.wrist[1], b.wrist[1], t),
      lerp(a.wrist[2], b.wrist[2], t),
    ],
    lift: lerp(a.lift ?? 0, b.lift ?? 0, t),
    shift: lerp(a.shift ?? 0, b.shift ?? 0, t),
  };
}

function lerpFinger(a: FingerCurl, b: FingerCurl, t: number): FingerCurl {
  return {
    spread: lerp(a.spread, b.spread, t),
    c1: lerp(a.c1, b.c1, t),
    c2: lerp(a.c2, b.c2, t),
    c3: lerp(a.c3, b.c3, t),
  };
}

/* -------------------------------------------------------------------------
   Pose library — hand shapes shared by every sign
   ---------------------------------------------------------------------- */

const R = Math.PI;

export const POSES: Record<string, HandPose> = {
  /** Relaxed, fingers gently apart */
  neutral: pose({
    thumb: thumb(-0.3, 0.1, 0.15, 0.1, 0.05),
    index: f(0.1, 0.12, 0.1, 0.08),
    middle: f(0.03, 0.1, 0.1, 0.08),
    ring: f(-0.04, 0.12, 0.12, 0.1),
    little: f(-0.1, 0.15, 0.15, 0.12),
  }),

  /** All fingers extended and slightly spread — "5" */
  open: pose({
    thumb: thumb(-0.45, 0.15, 0.1, 0.05, 0.05),
    index: f(0.16, 0.02, 0.02, 0.02),
    middle: f(0.05, 0.02, 0.02, 0.02),
    ring: f(-0.06, 0.03, 0.03, 0.03),
    little: f(-0.16, 0.04, 0.04, 0.04),
  }),

  /** Fingers extended, held tightly together — "B" */
  flat: pose({
    thumb: thumb(-0.5, -0.55, 0.85, 0.7, 0.4),
    index: f(0.0, 0.02, 0.02, 0.02),
    middle: f(0.0, 0.02, 0.02, 0.02),
    ring: f(-0.01, 0.03, 0.03, 0.03),
    little: f(-0.02, 0.04, 0.04, 0.04),
  }),

  /** Flat fingers, thumb tucked across palm — "B" with thumb across */
  flatThumbIn: pose({
    thumb: thumb(-0.4, -0.75, 1.1, 1.0, 0.5),
    index: f(0.0, 0.03, 0.02, 0.02),
    middle: f(0.0, 0.03, 0.02, 0.02),
    ring: f(-0.01, 0.04, 0.03, 0.03),
    little: f(-0.02, 0.05, 0.04, 0.04),
  }),

  /** Full fist — "S" / "A" */
  fist: pose({
    thumb: thumb(-0.35, -0.5, 1.05, 0.95, 0.55),
    index: f(0.0, R * 0.5, R * 0.5, R * 0.35),
    middle: f(0.0, R * 0.52, R * 0.52, R * 0.35),
    ring: f(-0.02, R * 0.5, R * 0.5, R * 0.33),
    little: f(-0.04, R * 0.48, R * 0.48, R * 0.32),
  }),

  /** Fist with thumb resting alongside index — "A" */
  aHand: pose({
    thumb: thumb(-0.15, -0.15, 0.35, 0.3, 0.2),
    index: f(0.0, R * 0.5, R * 0.5, R * 0.35),
    middle: f(0.0, R * 0.52, R * 0.52, R * 0.35),
    ring: f(-0.02, R * 0.5, R * 0.5, R * 0.33),
    little: f(-0.04, R * 0.48, R * 0.48, R * 0.32),
  }),

  /** Index extended — "1" / "D" */
  point: pose({
    thumb: thumb(-0.3, -0.45, 0.95, 0.85, 0.45),
    index: f(0.06, 0.02, 0.02, 0.02),
    middle: f(0.0, R * 0.5, R * 0.5, R * 0.35),
    ring: f(-0.02, R * 0.5, R * 0.5, R * 0.33),
    little: f(-0.04, R * 0.48, R * 0.48, R * 0.32),
  }),

  /** Index hooked — "X" */
  hook: pose({
    thumb: thumb(-0.3, -0.45, 0.95, 0.85, 0.45),
    index: f(0.06, R * 0.3, R * 0.75, R * 0.55),
    middle: f(0.0, R * 0.5, R * 0.5, R * 0.35),
    ring: f(-0.02, R * 0.5, R * 0.5, R * 0.33),
    little: f(-0.04, R * 0.48, R * 0.48, R * 0.32),
  }),

  /** Index + middle extended, spread — "V" / "2" */
  peace: pose({
    thumb: thumb(-0.3, -0.5, 1.0, 0.9, 0.5),
    index: f(0.14, 0.03, 0.03, 0.03),
    middle: f(-0.12, 0.03, 0.03, 0.03),
    ring: f(-0.04, R * 0.5, R * 0.5, R * 0.33),
    little: f(-0.06, R * 0.48, R * 0.48, R * 0.32),
  }),

  /** Index + middle extended, together — "U" / "H" */
  twoTogether: pose({
    thumb: thumb(-0.3, -0.5, 1.0, 0.9, 0.5),
    index: f(0.0, 0.03, 0.03, 0.03),
    middle: f(0.0, 0.03, 0.03, 0.03),
    ring: f(-0.03, R * 0.5, R * 0.5, R * 0.33),
    little: f(-0.05, R * 0.48, R * 0.48, R * 0.32),
  }),

  /** Index + middle + ring extended — "W" / "3" variant */
  threeUp: pose({
    thumb: thumb(-0.3, -0.5, 1.0, 0.9, 0.5),
    index: f(0.1, 0.03, 0.03, 0.03),
    middle: f(0.0, 0.03, 0.03, 0.03),
    ring: f(-0.1, 0.04, 0.04, 0.04),
    little: f(-0.06, R * 0.48, R * 0.48, R * 0.32),
  }),

  /** Four fingers up, thumb tucked — "4" */
  four: pose({
    thumb: thumb(-0.3, -0.7, 1.1, 1.0, 0.5),
    index: f(0.08, 0.03, 0.03, 0.03),
    middle: f(0.03, 0.03, 0.03, 0.03),
    ring: f(-0.03, 0.04, 0.04, 0.04),
    little: f(-0.1, 0.05, 0.05, 0.05),
  }),

  /** Thumb + index extended at a right angle — "L" */
  lHand: pose({
    thumb: thumb(-0.5, 0.0, 0.05, 0.05, 0.05),
    index: f(0.1, 0.02, 0.02, 0.02),
    middle: f(0.0, R * 0.5, R * 0.5, R * 0.35),
    ring: f(-0.02, R * 0.5, R * 0.5, R * 0.33),
    little: f(-0.04, R * 0.48, R * 0.48, R * 0.32),
  }),

  /** Thumb + pinky extended — "Y" */
  callMe: pose({
    thumb: thumb(-0.5, 0.05, 0.05, 0.05, 0.05),
    index: f(0.05, R * 0.5, R * 0.5, R * 0.35),
    middle: f(0.0, R * 0.52, R * 0.52, R * 0.35),
    ring: f(-0.02, R * 0.5, R * 0.5, R * 0.33),
    little: f(-0.2, 0.03, 0.03, 0.03),
  }),

  /** Thumb up — classic approval / "yes" reinforcement */
  thumbsUp: pose({
    thumb: thumb(-0.45, 0.1, 0.0, 0.0, 0.0),
    index: f(0.0, R * 0.5, R * 0.5, R * 0.35),
    middle: f(0.0, R * 0.52, R * 0.52, R * 0.35),
    ring: f(-0.02, R * 0.5, R * 0.5, R * 0.33),
    little: f(-0.04, R * 0.48, R * 0.48, R * 0.32),
    wrist: [-0.1, 0, -0.25],
  }),

  /** Thumb pointing down */
  thumbsDown: pose({
    thumb: thumb(-0.45, 0.1, 0.0, 0.0, 0.0),
    index: f(0.0, R * 0.5, R * 0.5, R * 0.35),
    middle: f(0.0, R * 0.52, R * 0.52, R * 0.35),
    ring: f(-0.02, R * 0.5, R * 0.5, R * 0.33),
    little: f(-0.04, R * 0.48, R * 0.48, R * 0.32),
    wrist: [0.1, 0, R - 0.25],
  }),

  /** Thumb tip touching index tip, other fingers up — "F" / OK */
  ok: pose({
    thumb: thumb(-0.35, -0.3, 0.75, 0.75, 0.45),
    index: f(0.1, R * 0.32, R * 0.4, R * 0.4),
    middle: f(0.02, 0.03, 0.03, 0.03),
    ring: f(-0.06, 0.04, 0.04, 0.04),
    little: f(-0.14, 0.05, 0.05, 0.05),
  }),

  /** Thumb + index form a circle — "O" */
  oShape: pose({
    thumb: thumb(-0.3, -0.35, 0.9, 0.9, 0.5),
    index: f(0.05, R * 0.34, R * 0.4, R * 0.42),
    middle: f(0.0, R * 0.5, R * 0.5, R * 0.35),
    ring: f(-0.02, R * 0.5, R * 0.5, R * 0.33),
    little: f(-0.04, R * 0.48, R * 0.48, R * 0.32),
  }),

  /** Curved "C" hand */
  cShape: pose({
    thumb: thumb(-0.35, -0.05, 0.7, 0.6, 0.3),
    index: f(0.06, 0.72, 0.6, 0.3),
    middle: f(0.03, 0.75, 0.6, 0.3),
    ring: f(-0.03, 0.75, 0.6, 0.3),
    little: f(-0.08, 0.72, 0.58, 0.3),
  }),

  /** Flattened "C" / cupped hand for receiving */
  cup: pose({
    thumb: thumb(-0.35, -0.05, 0.55, 0.45, 0.25),
    index: f(0.06, 0.5, 0.45, 0.25),
    middle: f(0.03, 0.52, 0.45, 0.25),
    ring: f(-0.03, 0.52, 0.45, 0.25),
    little: f(-0.08, 0.5, 0.42, 0.25),
  }),

  /** Index + middle crossed over one another — "R" */
  crossed: pose({
    thumb: thumb(-0.3, -0.5, 1.0, 0.9, 0.5),
    index: f(0.24, 0.03, 0.03, 0.03),
    middle: f(-0.24, 0.05, 0.05, 0.05),
    ring: f(-0.03, R * 0.5, R * 0.5, R * 0.33),
    little: f(-0.05, R * 0.48, R * 0.48, R * 0.32),
  }),

  /** Pinky extended — "I" */
  pinkyUp: pose({
    thumb: thumb(-0.3, -0.5, 1.0, 0.9, 0.5),
    index: f(0.05, R * 0.5, R * 0.5, R * 0.35),
    middle: f(0.0, R * 0.52, R * 0.52, R * 0.35),
    ring: f(-0.02, R * 0.5, R * 0.5, R * 0.33),
    little: f(-0.18, 0.03, 0.03, 0.03),
  }),

  /** Thumb resting between index and middle — "T" / "N" */
  thumbBetween: pose({
    thumb: thumb(-0.1, -0.55, 1.15, 0.9, 0.35),
    index: f(0.03, R * 0.4, R * 0.5, R * 0.35),
    middle: f(0.0, R * 0.52, R * 0.52, R * 0.35),
    ring: f(-0.02, R * 0.5, R * 0.5, R * 0.33),
    little: f(-0.04, R * 0.48, R * 0.48, R * 0.32),
  }),

  /** Three fingers curled over the thumb — "M" */
  thumbUnderThree: pose({
    thumb: thumb(-0.12, -0.6, 1.2, 0.95, 0.35),
    index: f(0.02, R * 0.44, R * 0.5, R * 0.35),
    middle: f(0.0, R * 0.46, R * 0.5, R * 0.35),
    ring: f(-0.02, R * 0.46, R * 0.5, R * 0.33),
    little: f(-0.05, R * 0.48, R * 0.48, R * 0.32),
  }),

  /** Fingers curled toward thumb — "E" */
  eHand: pose({
    thumb: thumb(-0.3, -0.5, 1.05, 1.0, 0.55),
    index: f(0.03, R * 0.42, R * 0.5, R * 0.3),
    middle: f(0.0, R * 0.44, R * 0.5, R * 0.3),
    ring: f(-0.02, R * 0.44, R * 0.5, R * 0.3),
    little: f(-0.05, R * 0.42, R * 0.48, R * 0.3),
  }),

  /** Index + thumb pointing sideways — "G" / "H" */
  gun: pose({
    thumb: thumb(-0.42, 0.02, 0.08, 0.05, 0.05),
    index: f(0.06, 0.02, 0.02, 0.02),
    middle: f(0.0, R * 0.5, R * 0.5, R * 0.35),
    ring: f(-0.02, R * 0.5, R * 0.5, R * 0.33),
    little: f(-0.04, R * 0.48, R * 0.48, R * 0.32),
    wrist: [0, 0, R * 0.5],
  }),

  /** Two fingers pointing sideways — "H" */
  twoGun: pose({
    thumb: thumb(-0.4, -0.45, 0.9, 0.8, 0.4),
    index: f(0.0, 0.03, 0.03, 0.03),
    middle: f(0.0, 0.03, 0.03, 0.03),
    ring: f(-0.03, R * 0.5, R * 0.5, R * 0.33),
    little: f(-0.05, R * 0.48, R * 0.48, R * 0.32),
    wrist: [0, 0, R * 0.5],
  }),

  /** Palm facing outward, arm forward — "stop" / "hello" base */
  palmOut: pose({
    thumb: thumb(-0.5, 0.1, 0.1, 0.05, 0.05),
    index: f(0.14, 0.02, 0.02, 0.02),
    middle: f(0.04, 0.02, 0.02, 0.02),
    ring: f(-0.05, 0.03, 0.03, 0.03),
    little: f(-0.14, 0.04, 0.04, 0.04),
    wrist: [0.15, 0, 0],
  }),

  /** Open hand tilted for a wave */
  wave: pose({
    thumb: thumb(-0.45, 0.15, 0.08, 0.05, 0.05),
    index: f(0.18, 0.02, 0.02, 0.02),
    middle: f(0.06, 0.02, 0.02, 0.02),
    ring: f(-0.06, 0.03, 0.03, 0.03),
    little: f(-0.18, 0.04, 0.04, 0.04),
    wrist: [0, 0, 0.45],
  }),

  /** Flat hand moving toward the signer (used for "me", "mine") */
  toSelf: pose({
    thumb: thumb(-0.4, -0.4, 0.7, 0.6, 0.3),
    index: f(0.1, 0.2, 0.15, 0.1),
    middle: f(0.03, 0.2, 0.15, 0.1),
    ring: f(-0.04, 0.22, 0.16, 0.1),
    little: f(-0.1, 0.24, 0.18, 0.12),
    wrist: [-0.3, 0, 0],
  }),

  /** Flat hand pushed forward */
  push: pose({
    thumb: thumb(-0.5, 0.1, 0.1, 0.05, 0.05),
    index: f(0.1, 0.06, 0.05, 0.04),
    middle: f(0.03, 0.06, 0.05, 0.04),
    ring: f(-0.04, 0.07, 0.06, 0.05),
    little: f(-0.12, 0.08, 0.07, 0.06),
    wrist: [0.5, 0, 0],
    shift: 0.15,
  }),

  /** Index finger curled forward — "come here" */
  beckon: pose({
    thumb: thumb(-0.3, -0.5, 1.0, 0.9, 0.5),
    index: f(0.06, R * 0.28, R * 0.5, R * 0.3),
    middle: f(0.0, R * 0.5, R * 0.5, R * 0.35),
    ring: f(-0.02, R * 0.5, R * 0.5, R * 0.33),
    little: f(-0.04, R * 0.48, R * 0.48, R * 0.32),
  }),

  /** Fingertips gathered — "small", "precision" */
  pinch: pose({
    thumb: thumb(-0.3, -0.3, 0.8, 0.75, 0.45),
    index: f(0.06, R * 0.3, R * 0.4, R * 0.4),
    middle: f(0.04, R * 0.3, R * 0.4, R * 0.4),
    ring: f(-0.02, R * 0.34, R * 0.42, R * 0.42),
    little: f(-0.08, R * 0.38, R * 0.44, R * 0.44),
  }),

  /** Flat hand resting horizontally — base for a support hand */
  palmUp: pose({
    thumb: thumb(-0.5, 0.1, 0.1, 0.05, 0.05),
    index: f(0.12, 0.03, 0.03, 0.03),
    middle: f(0.04, 0.03, 0.03, 0.03),
    ring: f(-0.05, 0.04, 0.04, 0.04),
    little: f(-0.14, 0.05, 0.05, 0.05),
    wrist: [-0.2, 0, 0],
  }),

  /** Index + pinky up, thumb holding middle+ring — "rock" / "I love you" */
  iloveyou: pose({
    thumb: thumb(-0.35, -0.4, 0.9, 0.8, 0.4),
    index: f(0.14, 0.03, 0.03, 0.03),
    middle: f(-0.02, R * 0.5, R * 0.5, R * 0.35),
    ring: f(-0.04, R * 0.5, R * 0.5, R * 0.33),
    little: f(-0.2, 0.03, 0.03, 0.03),
  }),

  /** Wrist tilted inward, hand near the chin */
  chinTouch: pose({
    thumb: thumb(-0.4, -0.3, 0.6, 0.5, 0.3),
    index: f(0.1, 0.35, 0.3, 0.2),
    middle: f(0.04, 0.35, 0.3, 0.2),
    ring: f(-0.04, 0.38, 0.32, 0.2),
    little: f(-0.1, 0.4, 0.34, 0.22),
    wrist: [-0.5, 0, -0.2],
    lift: -0.1,
  }),
};

export const getPose = (name: string): HandPose => POSES[name] ?? POSES.neutral;

/* -------------------------------------------------------------------------
   Animation registry
   ---------------------------------------------------------------------- */

export interface AnimationKeyframe {
  pose: string | HandPose;
  /** duration in seconds */
  dur: number;
}

export interface SignAnimation {
  id: string;
  keyframes: AnimationKeyframe[];
  /** loop the clip (waves, repeated motions) */
  loop?: boolean;
  /** freeze on the final keyframe when not looping */
  hold?: boolean;
  /** a second, non-dominant hand pose used for two-handed signs */
  offHand?: string | HandPose;
}

export interface SignSequence {
  animationId: string;
  speed?: number;
  steps?: number;
}

const registry = new Map<string, SignAnimation>();

export function registerAnimation(anim: SignAnimation): void {
  registry.set(anim.id, anim);
}

export function getAnimation(id: string): SignAnimation | undefined {
  return registry.get(id);
}

export function hasAnimation(id: string): boolean {
  return registry.has(id);
}

export function resolveKeyframePose(kf: AnimationKeyframe): HandPose {
  return typeof kf.pose === 'string' ? getPose(kf.pose) : kf.pose;
}

/** Fallback so a missing animation never breaks a page. */
export const FALLBACK_ANIMATION: SignAnimation = {
  id: 'fallback',
  keyframes: [
    { pose: 'neutral', dur: 0.6 },
    { pose: 'open', dur: 0.6 },
  ],
  loop: true,
};
