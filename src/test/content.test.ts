import { describe, it, expect } from 'vitest';
import { SIGNS, SIGN_MAP, SIGN_ORDER, getSign, adjacentSigns, relatedSigns, SIGN_CATEGORIES, SIGN_LANGUAGES } from '@/data/signs';
import { LEVELS, ALL_LESSON_SIGN_IDS, TOTAL_LESSON_SIGNS } from '@/data/lessons';
import { ACHIEVEMENTS, findAchievement } from '@/data/achievements';
import { POSES, getPose, getAnimation, hasAnimation } from '@/three/handRig';
import '@/three/animations';

describe('dictionary integrity', () => {
  it('exposes a dictionary with unique ids', () => {
    expect(SIGNS.length).toBe(80);
    const ids = SIGNS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.keys(SIGN_MAP).length).toBe(SIGNS.length);
    expect(SIGN_ORDER.length).toBe(SIGNS.length);
  });

  it('resolves every sign by id', () => {
    for (const s of SIGNS) expect(getSign(s.id)).toBe(s);
    expect(getSign('does-not-exist')).toBeUndefined();
    expect(getSign()).toBeUndefined();
  });

  it('keeps every relatedSigns link inside the dictionary', () => {
    for (const s of SIGNS) {
      for (const id of s.relatedSigns) {
        expect(SIGN_MAP[id], `${s.id} -> ${id}`).toBeDefined();
      }
      expect(relatedSigns(s).length).toBeLessThanOrEqual(4);
    }
  });

  it('labels every sign as an illustrative sample for ASL', () => {
    for (const s of SIGNS) {
      expect(s.sample).toBe(true);
      expect(s.language).toBe('ASL');
      expect(s.category).toBeTruthy();
      expect(s.steps.length).toBeGreaterThan(0);
      expect(s.description.length).toBeGreaterThan(20);
    }
  });

  it('covers every category exactly once', () => {
    const seen = new Set(SIGNS.map((s) => s.category));
    expect([...seen].sort()).toEqual([...SIGN_CATEGORIES].sort());
  });

  it('offers prev / next navigation across the whole dictionary', () => {
    const first = adjacentSigns(SIGNS[0].id);
    expect(first.prev).toBeUndefined();
    expect(first.next).toBeDefined();
    const last = adjacentSigns(SIGNS[SIGNS.length - 1].id);
    expect(last.next).toBeUndefined();
    expect(last.prev).toBeDefined();
  });

  it('ships only ASL as available, with the other languages unpublished', () => {
    const available = SIGN_LANGUAGES.filter((l) => l.available).map((l) => l.id);
    expect(available).toEqual(['ASL']);
    for (const l of SIGN_LANGUAGES.filter((l) => !l.available)) {
      expect(l.count).toBe(0);
      expect(l.note.toLowerCase()).toContain('coming');
    }
    expect(SIGN_LANGUAGES.find((l) => l.id === 'ASL')?.count).toBe(SIGNS.length);
  });
});

describe('learning path', () => {
  it('has 4 levels and 12 nodes', () => {
    expect(LEVELS).toHaveLength(4);
    expect(LEVELS.flatMap((l) => l.nodes)).toHaveLength(12);
  });

  it('teaches every sign in the dictionary and nothing extra', () => {
    const covered = new Set(ALL_LESSON_SIGN_IDS);
    const missing = SIGNS.filter((s) => !covered.has(s.id)).map((s) => s.id);
    expect(missing).toEqual([]);
    expect(TOTAL_LESSON_SIGNS).toBe(SIGNS.length);
    for (const id of new Set(ALL_LESSON_SIGN_IDS)) {
      expect(SIGN_MAP[id], `lesson id ${id}`).toBeDefined();
    }
  });

  it('raises the XP requirement along the path', () => {
    const nodes = LEVELS.flatMap((l) => l.nodes);
    for (let i = 1; i < nodes.length; i++) {
      expect(nodes[i].requiredXp).toBeGreaterThanOrEqual(nodes[i - 1].requiredXp);
    }
    expect(nodes[0].requiredXp).toBe(0);
  });
});

describe('3d content', () => {
  it('has a usable pose library', () => {
    expect(Object.keys(POSES).length).toBeGreaterThan(20);
    expect(getPose('neutral')).toBe(POSES.neutral);
    expect(getPose('this-pose-does-not-exist')).toBe(POSES.neutral);
  });

  it('registers an animation for every sign', () => {
    for (const s of SIGNS) {
      expect(hasAnimation(s.animationId), `${s.id} -> ${s.animationId}`).toBe(true);
    }
    expect(hasAnimation('letter-a')).toBe(true);
    expect(hasAnimation('n10')).toBe(true);
    expect(getAnimation('missing-clip')).toBeUndefined();
  });

  it('only references poses that exist in the pose library', () => {
    for (const s of SIGNS) {
      const anim = getAnimation(s.animationId)!;
      expect(anim.keyframes.length).toBeGreaterThan(0);
      for (const kf of anim.keyframes) {
        if (typeof kf.pose === 'string') {
          expect(POSES[kf.pose], `${s.animationId} -> ${kf.pose}`).toBeDefined();
        }
        expect(kf.dur).toBeGreaterThan(0);
      }
    }
  });
});

describe('achievements', () => {
  it('defines unique ids', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(findAchievement(ids[0])?.id).toBe(ids[0]);
    expect(findAchievement('nope')).toBeUndefined();
  });

  it('requires the full curriculum for the completion achievement', () => {
    const century = findAchievement('century')!;
    expect(century.check({ signsLearned: TOTAL_LESSON_SIGNS } as never)).toBe(true);
    expect(century.check({ signsLearned: TOTAL_LESSON_SIGNS - 1 } as never)).toBe(false);
  });
});
