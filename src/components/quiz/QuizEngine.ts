import { SIGNS, getSign } from '@/data/signs';
import type { Sign } from '@/types';

export type Question =
  | {
      id: string;
      type: 'identify-sign';
      prompt: string;
      signId: string;
      options: string[];
      answer: string;
    }
  | {
      id: string;
      type: 'identify-handshape';
      prompt: string;
      answer: string;
      options: string[];
      targetWord: string;
    }
  | {
      id: string;
      type: 'sequence';
      prompt: string;
      answer: string[];
      shuffled: string[];
    };

export interface QuizConfig {
  count: number;
  categories?: string[];
  pool?: Sign[];
  seed?: number;
}

/** Small deterministic PRNG so quizzes are reproducible when a seed is given. */
function rng(seed = Date.now()) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sample<T>(arr: T[], n: number, rand: () => number): T[] {
  return shuffle(arr, rand).slice(0, n);
}

const pickDistractors = (answer: Sign, count: number, rand: () => number, pool: Sign[]): Sign[] => {
  const sameCategory = pool.filter((s) => s.id !== answer.id && s.category === answer.category);
  const others = pool.filter((s) => s.id !== answer.id && s.category !== answer.category);
  const chosen = [...sample(sameCategory, Math.min(count, sameCategory.length), rand)];
  if (chosen.length < count) chosen.push(...sample(others, count - chosen.length, rand));
  return chosen.slice(0, count);
};

export function buildQuiz(config: QuizConfig): Question[] {
  const rand = rng(config.seed);
  const pool = (config.pool ?? SIGNS).filter(
    (s) => s.category !== 'Alphabet' && (!config.categories?.length || config.categories!.includes(s.category)),
  );
  const source = pool.length >= 6 ? pool : SIGNS.filter((s) => s.category !== 'Alphabet');
  const chosen = sample(source, config.count, rand);
  const questions: Question[] = [];

  chosen.forEach((sign, i) => {
    const mode = i % 3;
    const id = `q-${i}-${sign.id}`;

    if (mode === 2 && source.length >= 8) {
      // Sequence — arrange 3 signs into a sentence-like order
      const others = sample(source.filter((s) => s.id !== sign.id), 2, rand);
      const ordered = [sign, ...others].map((s) => s.id);
      questions.push({
        id,
        type: 'sequence',
        prompt: 'Arrange these signs to form a sensible order.',
        answer: ordered,
        shuffled: shuffle(ordered, rand),
      });
      return;
    }

    if (mode === 1) {
      // Show a WORD, pick the matching handshape
      const distractors = pickDistractors(sign, 3, rand, source);
      questions.push({
        id,
        type: 'identify-handshape',
        prompt: `Which sign represents “${sign.word}”?`,
        answer: sign.id,
        options: shuffle([sign.id, ...distractors.map((d) => d.id)], rand),
        targetWord: sign.word,
      });
      return;
    }

    // Show the 3D SIGN, pick its meaning
    const distractors = pickDistractors(sign, 3, rand, source);
    questions.push({
      id,
      type: 'identify-sign',
      prompt: 'What does this sign mean?',
      signId: sign.id,
      answer: sign.id,
      options: shuffle([sign.id, ...distractors.map((d) => d.id)], rand),
    });
  });

  return questions;
}

export function buildTimedSet(count = 10): Sign[] {
  const rand = rng();
  const pool = SIGNS.filter((s) => s.category !== 'Alphabet' && s.category !== 'Numbers');
  return sample(pool, count, rand);
}

export const optionWord = (id: string) => getSign(id)?.word ?? id;
export const optionCategory = (id: string) => getSign(id)?.category ?? '';
