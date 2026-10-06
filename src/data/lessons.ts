import type { LearningLevel, SignCategory } from '@/types';
import { signsByCategory } from './signs';

const idsFor = (...categories: SignCategory[]): string[] =>
  categories.flatMap((c) => signsByCategory(c).map((s) => s.id));

/**
 * Structured beginner progression. Nodes unlock as XP is earned so the
 * learner always has a clear "what next" without being overwhelmed.
 */
export const LEVELS: LearningLevel[] = [
  {
    id: 'level-1',
    index: 1,
    title: 'Foundations',
    subtitle: 'The building blocks: letters, numbers and your first greetings.',
    nodes: [
      {
        id: 'l1-alphabet',
        title: 'Alphabet',
        subtitle: 'Finger-spell A to Z',
        category: 'Alphabet',
        signIds: idsFor('Alphabet'),
        requiredXp: 0,
      },
      {
        id: 'l1-numbers',
        title: 'Numbers',
        subtitle: 'Count from 0 to 10',
        category: 'Numbers',
        signIds: idsFor('Numbers'),
        requiredXp: 0,
      },
      {
        id: 'l1-greetings',
        title: 'Greetings',
        subtitle: 'Say hello, thank you and goodbye',
        category: 'Greetings',
        signIds: idsFor('Greetings'),
        requiredXp: 40,
      },
    ],
  },
  {
    id: 'level-2',
    index: 2,
    title: 'Everyday Communication',
    subtitle: 'Words you will use in daily life.',
    nodes: [
      {
        id: 'l2-family',
        title: 'Family',
        subtitle: 'Talk about the people around you',
        category: 'People',
        signIds: idsFor('People'),
        requiredXp: 140,
      },
      {
        id: 'l2-food',
        title: 'Food & Water',
        subtitle: 'Ask for what you need',
        category: 'Everyday Words',
        signIds: ['food', 'water', 'help', 'sleep', 'home'],
        requiredXp: 200,
      },
      {
        id: 'l2-school',
        title: 'School & Work',
        subtitle: 'Where you spend your day',
        category: 'Everyday Words',
        signIds: ['school', 'college', 'book', 'work'],
        requiredXp: 260,
      },
    ],
  },
  {
    id: 'level-3',
    index: 3,
    title: 'Conversations',
    subtitle: 'Ask questions and respond with confidence.',
    nodes: [
      {
        id: 'l3-questions',
        title: 'Questions',
        subtitle: 'What, where, when, why, who, how',
        category: 'Questions',
        signIds: idsFor('Questions'),
        requiredXp: 340,
      },
      {
        id: 'l3-responses',
        title: 'Responses',
        subtitle: 'Yes, no, maybe, good, bad',
        category: 'Useful Communication',
        signIds: ['yes', 'no', 'maybe', 'good', 'bad'],
        requiredXp: 420,
      },
      {
        id: 'l3-phrases',
        title: 'Common phrases',
        subtitle: 'Stop, wait, come, go and more',
        category: 'Useful Communication',
        signIds: ['stop', 'wait', 'come', 'go'],
        requiredXp: 480,
      },
    ],
  },
  {
    id: 'level-4',
    index: 4,
    title: 'Communication Practice',
    subtitle: 'Put everything together under real conditions.',
    nodes: [
      {
        id: 'l4-sentences',
        title: 'Sentence building',
        subtitle: 'Combine signs into meaning',
        category: 'Useful Communication',
        signIds: ['i-pronoun', 'you', 'water', 'help', 'please', 'thank-you', 'come', 'go'],
        requiredXp: 560,
      },
      {
        id: 'l4-timed',
        title: 'Timed practice',
        subtitle: 'Identify signs against the clock',
        category: 'Questions',
        signIds: idsFor('Questions'),
        requiredXp: 660,
      },
      {
        id: 'l4-conversation',
        title: 'Conversation simulation',
        subtitle: 'Hold a short exchange end to end',
        category: 'Greetings',
        signIds: ['hello', 'how', 'you', 'good', 'thank-you', 'goodbye'],
        requiredXp: 760,
      },
    ],
  },
];

export const ALL_LESSON_SIGN_IDS: string[] = LEVELS.flatMap((l) =>
  l.nodes.flatMap((n) => n.signIds),
);

export const TOTAL_LESSON_SIGNS = new Set(ALL_LESSON_SIGN_IDS).size;
