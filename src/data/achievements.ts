import type { Achievement } from '@/types';
import { TOTAL_LESSON_SIGNS } from './lessons';

/** Subtle, professional achievements — no cartoon badges, no confetti spam. */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-sign',
    title: 'First sign',
    description: 'Learn your very first sign.',
    check: (s) => s.signsLearned >= 1,
  },
  {
    id: 'ten-signs',
    title: '10 signs learned',
    description: 'Reach ten signs in your learned set.',
    check: (s) => s.signsLearned >= 10,
  },
  {
    id: 'alphabet-master',
    title: 'Alphabet master',
    description: 'Learn every letter from A to Z.',
    check: (s) => s.learnedAt['a'] !== undefined && s.learnedAt['z'] !== undefined && s.signsLearned >= 26,
  },
  {
    id: 'streak-7',
    title: '7 day streak',
    description: 'Keep learning for seven days in a row.',
    check: (s) => s.streakDays >= 7,
  },
  {
    id: 'fifty-signs',
    title: '50 signs learned',
    description: 'Half a hundred signs in the bag.',
    check: (s) => s.signsLearned >= 50,
  },
  {
    id: 'quiz-master',
    title: 'Quiz master',
    description: 'Answer 50 quiz questions correctly.',
    check: (s) => s.quizCorrect >= 50,
  },
  {
    id: 'practice-regular',
    title: 'Practice regular',
    description: 'Complete ten practice sessions.',
    check: (s) => s.signsPracticed >= 10,
  },
  {
    id: 'century',
    title: 'Full curriculum',
    description: 'Learn every sign in the beginner curriculum.',
    check: (s) => s.signsLearned >= TOTAL_LESSON_SIGNS,
  },
];

export const findAchievement = (id: string) => ACHIEVEMENTS.find((a) => a.id === id);
