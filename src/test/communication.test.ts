import { describe, it, expect } from 'vitest';
import { matchToken, tokenize } from '@/components/communication/CommunicationBridge';
import { getSign, SIGN_MAP } from '@/data/signs';

describe('matchToken', () => {
  it('matches a word straight from the dictionary', () => {
    expect(matchToken('hello').sign?.id).toBe('hello');
    expect(matchToken('water').sign?.id).toBe('water');
    expect(matchToken('Hello!').sign?.id).toBe('hello');
  });

  it('normalises punctuation and casing', () => {
    const t = matchToken('"water"');
    expect(t.normalised).toBe('water');
    expect(t.sign?.id).toBe('water');
    expect(matchToken('?!').normalised).toBe('');
    expect(matchToken('').normalised).toBe('');
  });

  it('routes the pronoun I to the pronoun sign, not the letter I', () => {
    expect(matchToken('i').sign?.id).toBe('i-pronoun');
    expect(matchToken('I').sign?.id).toBe('i-pronoun');
    expect(SIGN_MAP['i'].category).toBe('Alphabet');
  });

  it('understands common spoken shortcuts', () => {
    expect(matchToken('thanks').sign?.id).toBe('thank-you');
    expect(matchToken("i'm").sign?.id).toBe('i-pronoun');
    expect(matchToken('my').sign?.id).toBe('i-pronoun');
    expect(matchToken('bye').sign?.id).toBe('goodbye');
    expect(matchToken('drink').sign?.id).toBe('water');
  });

  it('falls back to search keywords', () => {
    const token = matchToken('pages');
    expect(token.sign?.id).toBe('book');
  });

  it('leaves unknown words unmatched instead of guessing', () => {
    expect(matchToken('xylophone').sign).toBeUndefined();
    expect(matchToken('xylophone').normalised).toBe('xylophone');
  });
});

describe('tokenize', () => {
  it('splits a sentence and keeps every token', () => {
    const tokens = tokenize('I need water');
    expect(tokens).toHaveLength(3);
    expect(tokens.map((t) => t.raw)).toEqual(['I', 'need', 'water']);
    expect(tokens[0].sign?.id).toBe('i-pronoun');
    expect(tokens[2].sign?.id).toBe('water');
  });

  it('ignores empty input', () => {
    expect(tokenize('')).toEqual([]);
    expect(tokenize('   ')).toEqual([]);
  });

  it('marks unmatched words so the UI can offer them as fingerspelling', () => {
    const tokens = tokenize('hello zzz');
    expect(tokens).toHaveLength(2);
    expect(tokens[0].sign).toBeDefined();
    expect(tokens[1].sign).toBeUndefined();
  });

  it('keeps raw text intact for the caption panel', () => {
    const tokens = tokenize('Thank you!');
    expect(tokens[0].raw).toBe('Thank');
    expect(tokens[1].raw).toBe('you!');
    expect(tokens[1].sign?.id).toBe(getSign('you')?.id);
  });
});
