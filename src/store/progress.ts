import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProgressStats, QuizResult } from '@/types';
import { ACHIEVEMENTS } from '@/data/achievements';

export type Rating = 'easy' | 'okay' | 'difficult';

export interface ActivityDay {
  date: string;
  seconds: number;
  actions: number;
}

export interface ProgressState {
  learnedAt: Record<string, number>;
  recent: string[];
  practiceCount: Record<string, number>;
  ratings: Record<string, Rating>;
  viewCounts: Record<string, number>;
  practiceSeconds: number;
  xp: number;
  quizAttempts: number;
  quizCorrect: number;
  quizHistory: { date: number; result: QuizResult }[];
  streakDays: number;
  lastActiveDate: string | null;
  activity: Record<string, ActivityDay>;
  unlocked: string[];
  sessionsStarted: number;

  learn: (id: string) => boolean;
  practice: (id: string, seconds: number) => void;
  rate: (id: string, rating: Rating) => void;
  view: (id: string) => void;
  recordQuiz: (result: QuizResult) => void;
  addXp: (amount: number) => void;
  reset: () => void;
}

const todayKey = () => new Date().toISOString().slice(0, 10);
const yesterdayKey = () => new Date(Date.now() - 86400000).toISOString().slice(0, 10);

const initial = {
  learnedAt: {} as Record<string, number>,
  recent: [] as string[],
  practiceCount: {} as Record<string, number>,
  ratings: {} as Record<string, Rating>,
  viewCounts: {} as Record<string, number>,
  practiceSeconds: 0,
  xp: 0,
  quizAttempts: 0,
  quizCorrect: 0,
  quizHistory: [] as ProgressState['quizHistory'],
  streakDays: 0,
  lastActiveDate: null as string | null,
  activity: {} as Record<string, ActivityDay>,
  unlocked: [] as string[],
  sessionsStarted: 0,
};

function bumpStreak(state: ProgressState): Pick<ProgressState, 'streakDays' | 'lastActiveDate'> {
  const today = todayKey();
  if (state.lastActiveDate === today) return { streakDays: state.streakDays, lastActiveDate: today };
  if (state.lastActiveDate === yesterdayKey()) {
    return { streakDays: state.streakDays + 1, lastActiveDate: today };
  }
  return { streakDays: 1, lastActiveDate: today };
}

function logActivity(
  state: ProgressState,
  seconds: number,
): Record<string, ActivityDay> {
  const key = todayKey();
  const existing = state.activity[key] ?? { date: key, seconds: 0, actions: 0 };
  return {
    ...state.activity,
    [key]: { date: key, seconds: existing.seconds + seconds, actions: existing.actions + 1 },
  };
}

function evaluateAchievements(next: ProgressState): string[] {
  const stats = toStats(next);
  const unlocked = new Set(next.unlocked);
  for (const a of ACHIEVEMENTS) {
    if (!unlocked.has(a.id) && a.check(stats)) unlocked.add(a.id);
  }
  return [...unlocked];
}

export function toStats(s: ProgressState): ProgressStats {
  return {
    signsLearned: Object.keys(s.learnedAt).length,
    signsPracticed: Object.keys(s.practiceCount).length,
    quizAttempts: s.quizAttempts,
    quizCorrect: s.quizCorrect,
    practiceSeconds: s.practiceSeconds,
    streakDays: s.streakDays,
    xp: s.xp,
    difficultyRatings: s.ratings,
    learnedAt: s.learnedAt,
  };
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initial,

      learn: (id) => {
        const state = get();
        if (state.learnedAt[id]) return false;
        const streak = bumpStreak(state);
        const next: ProgressState = {
          ...state,
          ...streak,
          learnedAt: { ...state.learnedAt, [id]: Date.now() },
          recent: [id, ...state.recent.filter((r) => r !== id)].slice(0, 12),
          xp: state.xp + 25,
          activity: logActivity(state, 0),
        };
        next.unlocked = evaluateAchievements(next);
        set(next);
        return true;
      },

      practice: (id, seconds) => {
        const state = get();
        const streak = bumpStreak(state);
        const next: ProgressState = {
          ...state,
          ...streak,
          practiceCount: { ...state.practiceCount, [id]: (state.practiceCount[id] ?? 0) + 1 },
          practiceSeconds: state.practiceSeconds + Math.round(seconds),
          xp: state.xp + 5,
          activity: logActivity(state, seconds),
        };
        next.unlocked = evaluateAchievements(next);
        set(next);
      },

      rate: (id, rating) => {
        set((s) => ({ ratings: { ...s.ratings, [id]: rating } }));
      },

      view: (id) => {
        set((s) => ({ viewCounts: { ...s.viewCounts, [id]: (s.viewCounts[id] ?? 0) + 1 } }));
      },

      recordQuiz: (result) => {
        const state = get();
        const streak = bumpStreak(state);
        const gained = result.score * 10;
        const next: ProgressState = {
          ...state,
          ...streak,
          quizAttempts: state.quizAttempts + result.total,
          quizCorrect: state.quizCorrect + result.score,
          quizHistory: [{ date: Date.now(), result }, ...state.quizHistory].slice(0, 30),
          xp: state.xp + gained,
          activity: logActivity(state, Math.round(result.seconds)),
        };
        next.unlocked = evaluateAchievements(next);
        set(next);
      },

      addXp: (amount) => {
        set((s) => {
          const next = { ...s, xp: s.xp + amount };
          next.unlocked = evaluateAchievements(next);
          return next;
        });
      },

      reset: () => set({ ...initial }),
    }),
    { name: 'signbridge.progress', version: 2 },
  ),
);

/* ---------------------------------- selectors --------------------------------- */

export const useStats = () => {
  const s = useProgress();
  return toStats(s);
};

export const selectLearnedIds = (s: ProgressState) => Object.keys(s.learnedAt);

/** Signs the learner rated difficult or answered incorrectly — worth revisiting. */
export const selectNeedsPractice = (s: ProgressState): string[] => {
  const flagged = new Set<string>();
  for (const [id, r] of Object.entries(s.ratings)) if (r === 'difficult') flagged.add(id);
  for (const attempt of s.quizHistory.slice(0, 8)) {
    for (const a of attempt.result.answered) if (!a.correct) flagged.add(a.signId);
  }
  return [...flagged].filter((id) => s.learnedAt[id] !== undefined || s.practiceCount[id] !== undefined);
};

export const selectWeeklyActivity = (s: ProgressState): { day: string; seconds: number }[] => {
  const out: { day: string; seconds: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    out.push({
      day: d.toLocaleDateString(undefined, { weekday: 'short' }),
      seconds: s.activity[key]?.seconds ?? 0,
    });
  }
  return out;
};
