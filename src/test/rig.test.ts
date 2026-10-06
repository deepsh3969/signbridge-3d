import { describe, it, expect } from 'vitest';
import {
  POSES,
  getPose,
  interpolatePose,
  clonePose,
  hasAnimation,
  getAnimation,
  resolveKeyframePose,
  FALLBACK_ANIMATION,
  f,
  thumb,
  pose,
} from '@/three/handRig';
import { ANIMATION_COUNT } from '@/three/animations';
import '@/three/animations';

describe('pose library', () => {
  it('defines every pose referenced by name', () => {
    expect(Object.keys(POSES).length).toBeGreaterThan(20);
    for (const name of ['neutral', 'open', 'flat', 'fist', 'wave', 'point', 'toSelf', 'chinTouch']) {
      expect(POSES[name], name).toBeDefined();
    }
  });

  it('falls back to neutral for unknown names', () => {
    expect(getPose('unknown-pose')).toBe(POSES.neutral);
    expect(getPose('neutral')).toBe(POSES.neutral);
  });

  it('keeps cloned poses independent of the source', () => {
    const original = POSES.open;
    const copy = clonePose(original);
    copy.index.c1 = 9;
    expect(original.index.c1).not.toBe(9);
    expect(clonePose(original).index.c1).toBe(original.index.c1);
  });

  it('supports compact pose helpers', () => {
    const curl = f(0.2, 0.5, 0.4, 0.3);
    expect(curl).toEqual({ spread: 0.2, c1: 0.5, c2: 0.4, c3: 0.3 });
    const t = thumb(0.1, 0.2, 0.3, 0.4, 0.5);
    expect(t.yaw).toBe(0.1);
    expect(t.c3).toBe(0.5);
    const p = pose({ lift: 0.4 });
    expect(p.lift).toBe(0.4);
    expect(p.index).toBeDefined();
  });
});

describe('interpolatePose', () => {
  it('returns the start pose at t=0 and the end pose at t=1', () => {
    const a = POSES.neutral;
    const b = POSES.fist;
    expect(interpolatePose(a, b, 0)).toEqual(a);
    expect(interpolatePose(a, b, 1).index.c1).toBeCloseTo(b.index.c1, 6);
  });

  it('blends linearly in the middle', () => {
    const mid = interpolatePose(POSES.neutral, POSES.open, 0.5);
    expect(mid.index.c1).toBeCloseTo((POSES.neutral.index.c1 + POSES.open.index.c1) / 2, 6);
    expect(mid.wrist[0]).toBeCloseTo((POSES.neutral.wrist[0] + POSES.open.wrist[0]) / 2, 6);
    expect(mid.lift).toBeCloseTo(((POSES.neutral.lift ?? 0) + (POSES.open.lift ?? 0)) / 2, 6);
  });

  it('always produces a fully populated pose', () => {
    const out = interpolatePose(POSES.fist, POSES.open, 0.37);
    expect(out.thumb).toBeDefined();
    for (const finger of ['index', 'middle', 'ring', 'little'] as const) {
      expect(out[finger].c1).toBeTypeOf('number');
      expect(out[finger].c3).toBeTypeOf('number');
    }
    expect(out.wrist).toHaveLength(3);
  });
});

describe('animation registry', () => {
  it('registers clips for the whole curriculum', () => {
    expect(ANIMATION_COUNT).toBeGreaterThan(50);
    expect(hasAnimation('hello')).toBe(true);
    expect(hasAnimation('letter-z')).toBe(true);
    expect(hasAnimation('n0')).toBe(true);
    expect(hasAnimation('not-a-clip')).toBe(false);
    expect(getAnimation('not-a-clip')).toBeUndefined();
  });

  it('reads keyframes with positive durations and resolvable poses', () => {
    const anim = getAnimation('hello')!;
    expect(anim.keyframes.length).toBeGreaterThan(1);
    let total = 0;
    for (const kf of anim.keyframes) {
      expect(kf.dur).toBeGreaterThan(0);
      total += kf.dur;
      expect(resolveKeyframePose(kf)).toBeDefined();
    }
    expect(total).toBeGreaterThan(0.5);
  });

  it('marks looping clips so waves repeat', () => {
    expect(getAnimation('hello')!.loop).toBe(true);
    expect(getAnimation('goodbye')!.loop).toBe(true);
  });

  it('keeps a safe fallback clip', () => {
    expect(FALLBACK_ANIMATION.keyframes.every((k) => typeof k.pose === 'string')).toBe(true);
    expect(FALLBACK_ANIMATION.loop).toBe(true);
    for (const kf of FALLBACK_ANIMATION.keyframes) expect(resolveKeyframePose(kf)).toBeDefined();
  });
});
