import { describe, it, expect, beforeEach } from 'vitest';
import { useSettings, FONT_SIZES, ANIM_SPEEDS, speedValue } from '@/store/settings';
import type { AnimSpeed } from '@/types';
import {
  useProgress,
  toStats,
  selectNeedsPractice,
  selectWeeklyActivity,
  selectLearnedIds,
  type Rating,
} from '@/store/progress';

describe('settings store', () => {
  beforeEach(() => {
    useSettings.setState({
      fontSize: 'md',
      highContrast: false,
      reducedMotion: false,
      textToSpeech: true,
      captions: true,
      animationSpeed: 'normal',
      keyboardNavigation: true,
      darkMode: false,
      soundEffects: false,
      signLanguage: 'ASL',
      onboarded: true,
      guest: true,
      speechRate: 0.95,
      speechPitch: 1,
      speechVolume: 1,
      speechVoiceURI: null,
    });
  });

  it('exposes the accessibility option lists', () => {
    expect(FONT_SIZES.map((f) => f.id)).toEqual(['sm', 'md', 'lg', 'xl']);
    expect(ANIM_SPEEDS.map((a) => a.id)).toEqual(['slow', 'normal', 'fast']);
    expect(speedValue('slow')).toBeLessThan(speedValue('normal'));
    expect(speedValue('fast')).toBeGreaterThan(speedValue('normal'));
    expect(speedValue('nonsense' as unknown as AnimSpeed)).toBe(1);
  });

  it('updates a single key with set()', () => {
    useSettings.getState().set('darkMode', true);
    expect(useSettings.getState().darkMode).toBe(true);
    useSettings.getState().set('fontSize', 'xl');
    expect(useSettings.getState().fontSize).toBe('xl');
  });

  it('updates several keys with patch()', () => {
    useSettings.getState().patch({ highContrast: true, reducedMotion: true, captions: false });
    const s = useSettings.getState();
    expect(s.highContrast).toBe(true);
    expect(s.reducedMotion).toBe(true);
    expect(s.captions).toBe(false);
  });

  it('starts with a guest session and TTS enabled', () => {
    const s = useSettings.getState();
    expect(s.guest).toBe(true);
    expect(s.textToSpeech).toBe(true);
    expect(s.signLanguage).toBe('ASL');
  });
});

describe('progress store', () => {
  beforeEach(() => {
    useProgress.getState().reset();
  });

  it('awards XP and a streak on the first learned sign', () => {
    expect(useProgress.getState().learn('hello')).toBe(true);
    const s = useProgress.getState();
    expect(s.xp).toBe(25);
    expect(s.streakDays).toBe(1);
    expect(s.learnedAt.hello).toBeTypeOf('number');
    expect(s.unlocked).toContain('first-sign');
    expect(s.recent[0]).toBe('hello');
  });

  it('does not double count a sign that is already learned', () => {
    useProgress.getState().learn('hello');
    expect(useProgress.getState().learn('hello')).toBe(false);
    expect(useProgress.getState().xp).toBe(25);
    expect(Object.keys(useProgress.getState().learnedAt)).toHaveLength(1);
  });

  it('tracks practice sessions and time', () => {
    useProgress.getState().practice('hello', 42);
    useProgress.getState().practice('hello', 18);
    const s = useProgress.getState();
    expect(s.practiceCount.hello).toBe(2);
    expect(s.practiceSeconds).toBe(60);
    expect(s.xp).toBe(10);
    expect(s.activity).toBeDefined();
  });

  it('records ratings and view counts', () => {
    useProgress.getState().rate('water', 'difficult' as Rating);
    useProgress.getState().view('water');
    useProgress.getState().view('water');
    expect(useProgress.getState().ratings.water).toBe('difficult');
    expect(useProgress.getState().viewCounts.water).toBe(2);
  });

  it('accumulates quiz results', () => {
    useProgress.getState().recordQuiz({
      score: 7,
      total: 10,
      accuracy: 70,
      seconds: 45,
      mistakes: 3,
      answered: [
        { signId: 'hello', correct: false },
        { signId: 'water', correct: true },
      ],
    });
    const s = useProgress.getState();
    expect(s.quizAttempts).toBe(10);
    expect(s.quizCorrect).toBe(7);
    expect(s.xp).toBe(70);
    expect(s.quizHistory).toHaveLength(1);
  });

  it('flags difficult signs for the needs-practice selector', () => {
    useProgress.getState().learn('water');
    useProgress.getState().rate('water', 'difficult');
    expect(selectNeedsPractice(useProgress.getState())).toEqual(['water']);
    useProgress.getState().rate('book', 'difficult');
    expect(selectNeedsPractice(useProgress.getState())).not.toContain('book');
  });

  it('summarises state for the dashboard', () => {
    useProgress.getState().learn('hello');
    useProgress.getState().practice('hello', 30);
    const stats = toStats(useProgress.getState());
    expect(stats.signsLearned).toBe(1);
    expect(stats.signsPracticed).toBe(1);
    expect(stats.xp).toBe(30);
    expect(selectLearnedIds(useProgress.getState())).toEqual(['hello']);
  });

  it('returns seven days of activity for the chart', () => {
    const week = selectWeeklyActivity(useProgress.getState());
    expect(week).toHaveLength(7);
    for (const d of week) {
      expect(d.day).toBeTruthy();
      expect(d.seconds).toBeGreaterThanOrEqual(0);
    }
    useProgress.getState().practice('hello', 120);
    expect(selectWeeklyActivity(useProgress.getState()).reduce((n, d) => n + d.seconds, 0)).toBe(120);
  });

  it('resets everything back to the initial state', () => {
    useProgress.getState().learn('hello');
    useProgress.getState().reset();
    expect(useProgress.getState().xp).toBe(0);
    expect(useProgress.getState().learnedAt).toEqual({});
    expect(useProgress.getState().unlocked).toEqual([]);
  });
});
