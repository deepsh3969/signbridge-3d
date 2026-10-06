import { describe, it, expect } from 'vitest';
import { buildQuiz, buildTimedSet, optionWord, optionCategory, type Question } from '@/components/quiz/QuizEngine';
import { SIGNS, getSign } from '@/data/signs';

const withoutAlphabet = SIGNS.filter((s) => s.category !== 'Alphabet');

const isChoice = (q: Question): q is Extract<Question, { options: string[] }> =>
  q.type === 'identify-sign' || q.type === 'identify-handshape';

describe('buildQuiz', () => {
  it('builds the requested number of questions', () => {
    expect(buildQuiz({ count: 10, seed: 7 })).toHaveLength(10);
    expect(buildQuiz({ count: 3, seed: 7 })).toHaveLength(3);
  });

  it('is deterministic for a given seed and different for another seed', () => {
    const a = buildQuiz({ count: 10, seed: 42 });
    const b = buildQuiz({ count: 10, seed: 42 });
    const c = buildQuiz({ count: 10, seed: 99 });
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
    expect(a.map((q) => q.id)).not.toEqual(c.map((q) => q.id));
  });

  it('rotates through all three question types', () => {
    const qs = buildQuiz({ count: 9, seed: 3 });
    const types = new Set(qs.map((q) => q.type));
    expect([...types].sort()).toEqual(['identify-handshape', 'identify-sign', 'sequence']);
  });

  it('never leaks the alphabet into the pool', () => {
    const qs = buildQuiz({ count: 10, seed: 11 });
    for (const q of qs) {
      const ids = isChoice(q) ? q.options : q.answer;
      for (const id of ids) expect(getSign(id)?.category).not.toBe('Alphabet');
    }
  });

  it('offers exactly four unique options with the answer included once', () => {
    const qs = buildQuiz({ count: 12, seed: 5 });
    for (const q of qs) {
      if (!isChoice(q)) continue;
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options).toContain(q.answer);
      expect(q.options.filter((o) => o === q.answer)).toHaveLength(1);
      for (const o of q.options) expect(getSign(o)).toBeDefined();
    }
  });

  it('reuses the same answer for both choice formats', () => {
    for (const q of buildQuiz({ count: 6, seed: 2 })) {
      if (q.type === 'identify-sign') expect(q.signId).toBe(q.answer);
      if (q.type === 'identify-handshape') expect(q.targetWord).toBe(getSign(q.answer)?.word);
    }
  });

  it('ships sequences as a permutation of three distinct signs', () => {
    const sequences = buildQuiz({ count: 9, seed: 13 }).filter(
      (q): q is Extract<Question, { type: 'sequence' }> => q.type === 'sequence',
    );
    expect(sequences.length).toBeGreaterThan(0);
    for (const q of sequences) {
      expect(q.answer).toHaveLength(3);
      expect(new Set(q.answer).size).toBe(3);
      expect([...q.shuffled].sort()).toEqual([...q.answer].sort());
      expect(q.shuffled).not.toEqual(q.answer);
      for (const id of q.answer) expect(getSign(id)).toBeDefined();
    }
  });

  it('restricts the pool to the chosen categories', () => {
    const qs = buildQuiz({ count: 6, seed: 8, categories: ['Numbers'] });
    for (const q of qs) {
      const ids = isChoice(q) ? q.options : q.answer;
      for (const id of ids) expect(getSign(id)?.category).toBe('Numbers');
    }
  });

  it('limits the question count to what the category can support', () => {
    const qs = buildQuiz({ count: 10, seed: 4, categories: ['Questions'] });
    const pool = SIGNS.filter((s) => s.category === 'Questions');
    expect(qs).toHaveLength(pool.length);
  });

  it('falls back to a wider pool when the provided pool is tiny', () => {
    const tiny = SIGNS.filter((s) => s.category === 'Questions').slice(0, 3);
    const qs = buildQuiz({ count: 10, seed: 4, pool: tiny });
    expect(qs).toHaveLength(10);
    expect(qs.some((q) => q.type === 'sequence')).toBe(true);
  });

  it('labels questions with human readable prompts', () => {
    for (const q of buildQuiz({ count: 9, seed: 6 })) {
      expect(q.prompt.length).toBeGreaterThan(5);
      expect(q.id).toContain('q-');
    }
  });
});

describe('buildTimedSet', () => {
  it('returns distinct signs outside the alphabet and numbers', () => {
    const set = buildTimedSet(10);
    expect(set).toHaveLength(10);
    expect(new Set(set.map((s) => s.id)).size).toBe(10);
    for (const s of set) {
      expect(s.category).not.toBe('Alphabet');
      expect(s.category).not.toBe('Numbers');
    }
  });

  it('is large enough for a 60 second challenge', () => {
    expect(buildTimedSet().length).toBe(10);
    expect(withoutAlphabet.length).toBeGreaterThan(10);
  });
});

describe('option helpers', () => {
  it('resolve to display words and categories', () => {
    const hello = SIGNS.find((s) => s.word === 'Hello')!;
    expect(optionWord(hello.id)).toBe('Hello');
    expect(optionCategory(hello.id)).toBe('Greetings');
    expect(optionWord('not-a-real-id')).toBe('not-a-real-id');
    expect(optionCategory('not-a-real-id')).toBe('');
  });
});
