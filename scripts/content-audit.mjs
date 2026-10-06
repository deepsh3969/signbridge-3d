import { build } from 'esbuild';
import { writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

mkdirSync('node_modules/.cache', { recursive: true });
const entry = 'node_modules/.cache/audit-entry.ts';
const out = 'node_modules/.cache/audit-out.mjs';
writeFileSync(
  entry,
  [
    "export { SIGNS, SIGN_MAP, SIGN_ORDER } from '@/data/signs';",
    "export { LEVELS, ALL_LESSON_SIGN_IDS, TOTAL_LESSON_SIGNS } from '@/data/lessons';",
    "export { hasAnimation } from '@/three/handRig';",
    "import '@/three/animations';",
  ].join('\n'),
);

await build({
  entryPoints: [entry],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: out,
  alias: { '@': './src' },
  logLevel: 'error',
});
const m = await import(pathToFileURL(out).href + `?t=${Date.now()}`);
const { SIGNS, SIGN_MAP, SIGN_ORDER, LEVELS, TOTAL_LESSON_SIGNS, ALL_LESSON_SIGN_IDS, hasAnimation } = m;

const ids = SIGNS.map((s) => s.id);
console.log('SIGNS.length:', SIGNS.length, '| unique ids:', new Set(ids).size);
console.log('SIGN_MAP keys:', Object.keys(SIGN_MAP).length, '| SIGN_ORDER:', SIGN_ORDER.length);
console.log('duplicates:', ids.filter((v, i) => ids.indexOf(v) !== i));

const cat = {};
for (const s of SIGNS) cat[s.category] = (cat[s.category] || 0) + 1;
console.log('by category:', cat);

console.log('TOTAL_LESSON_SIGNS:', TOTAL_LESSON_SIGNS, '| lesson id occurrences:', ALL_LESSON_SIGN_IDS.length);
console.log('lesson ids missing from dictionary:', [...new Set(ALL_LESSON_SIGN_IDS)].filter((id) => !SIGN_MAP[id]));
const covered = new Set(ALL_LESSON_SIGN_IDS);
console.log('dictionary signs not in any lesson:', ids.filter((id) => !covered.has(id)));

console.log('relatedSigns missing targets:', [...new Set(SIGNS.flatMap((s) => s.relatedSigns))].filter((r) => !SIGN_MAP[r]));
console.log('signs without animation clip:', SIGNS.filter((s) => !hasAnimation(s.animationId)).map((s) => `${s.id}(${s.animationId})`));
console.log('nodes:', LEVELS.reduce((n, l) => n + l.nodes.length, 0), '| levels:', LEVELS.length);

const seen = new Set();
const badCategory = SIGNS.filter((s) => !s.category).map((s) => s.id);
void seen;
console.log('signs without category:', badCategory);
const noSample = SIGNS.filter((s) => s.sample === false).map((s) => s.id);
console.log('signs flagged as non-sample:', noSample);

unlinkSync(entry);
unlinkSync(out);
