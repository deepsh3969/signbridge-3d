import { registerAnimation, type AnimationKeyframe, type SignAnimation } from './handRig';

const kf = (pose: string, dur = 0.55): AnimationKeyframe => ({ pose, dur });

const define = (
  id: string,
  keyframes: AnimationKeyframe[],
  opts: { loop?: boolean; hold?: boolean; offHand?: string } = {},
) => {
  registerAnimation({ id, keyframes, ...opts });
};

/* ---------------------------------------------------------------------------
   Greetings
--------------------------------------------------------------------------- */
define('hello', [kf('wave', 0.5), kf('neutral', 0.35), kf('wave', 0.5), kf('neutral', 0.35), kf('wave', 0.5)], { loop: true });
define('hi', [kf('wave', 0.45), kf('neutral', 0.4), kf('wave', 0.45)], { loop: true });
define('goodbye', [kf('wave', 0.5), kf('push', 0.6), kf('wave', 0.5)], { loop: true });
define('good-morning', [kf('chinTouch', 0.5), kf('palmOut', 0.65), kf('open', 0.5)]);
define('good-night', [kf('chinTouch', 0.5), kf('flat', 0.6), kf('palmUp', 0.6)]);
define('thank-you', [kf('chinTouch', 0.5), kf('flat', 0.65), kf('palmOut', 0.6)]);
define('please', [kf('palmUp', 0.45), kf('cup', 0.55), kf('palmUp', 0.5)], { loop: true });
define('sorry', [kf('fist', 0.45), kf('aHand', 0.55), kf('fist', 0.5)], { loop: true, offHand: 'palmUp' });
define('welcome', [kf('push', 0.5), kf('beckon', 0.5), kf('palmUp', 0.55)], { loop: true });

/* ---------------------------------------------------------------------------
   People
--------------------------------------------------------------------------- */
define('i', [kf('point', 0.5), kf('toSelf', 0.6)]);
define('me', [kf('point', 0.45), kf('toSelf', 0.6)]);
define('you', [kf('point', 0.5), kf('push', 0.55)]);
define('we', [kf('point', 0.45), kf('gun', 0.5), kf('point', 0.5)]);
define('friend', [kf('hook', 0.5), kf('crossed', 0.6), kf('hook', 0.5)]);
define('family', [kf('ok', 0.5), kf('open', 0.6), kf('ok', 0.5)]);
define('mother', [kf('open', 0.5), kf('chinTouch', 0.6)]);
define('father', [kf('open', 0.5), kf('aHand', 0.6)]);
define('brother', [kf('lHand', 0.45), kf('point', 0.6)]);
define('sister', [kf('lHand', 0.45), kf('point', 0.6)]);

/* ---------------------------------------------------------------------------
   Everyday words
--------------------------------------------------------------------------- */
define('food', [kf('flatThumbIn', 0.5), kf('pinch', 0.55), kf('flatThumbIn', 0.5)], { loop: true });
define('water', [kf('threeUp', 0.5), kf('cShape', 0.6)]);
define('home', [kf('cShape', 0.5), kf('cup', 0.6)]);
define('school', [kf('flat', 0.5), kf('palmUp', 0.55)], { loop: true, offHand: 'palmUp' });
define('college', [kf('cShape', 0.5), kf('cup', 0.55), kf('cShape', 0.5)], { loop: true });
define('book', [kf('flat', 0.5), kf('open', 0.6)], { loop: false, offHand: 'flat' });
define('help', [kf('thumbsUp', 0.5), kf('lHand', 0.6)], { offHand: 'palmUp' });
define('work', [kf('fist', 0.5), kf('aHand', 0.55), kf('fist', 0.5)], { loop: true, offHand: 'aHand' });
define('sleep', [kf('open', 0.5), kf('flat', 0.6), kf('cShape', 0.6)]);

/* ---------------------------------------------------------------------------
   Questions
--------------------------------------------------------------------------- */
define('what', [kf('open', 0.5), kf('palmUp', 0.55), kf('open', 0.5)], { loop: true });
define('where', [kf('point', 0.45), kf('hook', 0.5), kf('point', 0.45)], { loop: true });
define('when', [kf('point', 0.5), kf('oShape', 0.6), kf('point', 0.5)], { loop: true });
define('why', [kf('point', 0.45), kf('oShape', 0.55), kf('open', 0.6)]);
define('who', [kf('point', 0.45), kf('hook', 0.55), kf('palmUp', 0.5)]);
define('how', [kf('flatThumbIn', 0.5), kf('open', 0.6), kf('cup', 0.5)]);

/* ---------------------------------------------------------------------------
   Useful communication
--------------------------------------------------------------------------- */
define('yes', [kf('fist', 0.4), kf('thumbsUp', 0.45), kf('fist', 0.4)], { loop: true });
define('no', [kf('twoTogether', 0.4), kf('peace', 0.45), kf('twoTogether', 0.4)], { loop: true });
define('maybe', [kf('palmUp', 0.5), kf('flat', 0.55), kf('palmUp', 0.5)], { loop: true });
define('good', [kf('chinTouch', 0.5), kf('flat', 0.6), kf('palmUp', 0.55)]);
define('bad', [kf('chinTouch', 0.5), kf('flat', 0.5), kf('thumbsDown', 0.6)]);
define('stop', [kf('palmUp', 0.4), kf('flat', 0.55)], { hold: true, offHand: 'palmUp' });
define('wait', [kf('open', 0.45), kf('cup', 0.5), kf('open', 0.45)], { loop: true });
define('come', [kf('push', 0.5), kf('beckon', 0.55), kf('push', 0.5)], { loop: true });
define('go', [kf('point', 0.45), kf('gun', 0.55), kf('point', 0.5)], { loop: true });

/* ---------------------------------------------------------------------------
   Numbers 0-10
--------------------------------------------------------------------------- */
define('n0', [kf('neutral', 0.4), kf('oShape', 0.55)]);
define('n1', [kf('neutral', 0.4), kf('point', 0.55)]);
define('n2', [kf('neutral', 0.4), kf('peace', 0.55)]);
define('n3', [kf('neutral', 0.4), kf('threeUp', 0.55)]);
define('n4', [kf('neutral', 0.4), kf('four', 0.55)]);
define('n5', [kf('neutral', 0.4), kf('open', 0.55)]);
define('n6', [kf('neutral', 0.4), kf('ok', 0.55)]);
define('n7', [kf('neutral', 0.4), kf('pinch', 0.55)]);
define('n8', [kf('neutral', 0.4), kf('cShape', 0.55)]);
define('n9', [kf('neutral', 0.4), kf('oShape', 0.55), kf('ok', 0.5)]);
define('n10', [kf('aHand', 0.4), kf('thumbsUp', 0.55), kf('aHand', 0.45)], { loop: true });

/* ---------------------------------------------------------------------------
   Alphabet A-Z
--------------------------------------------------------------------------- */
const letterShape: Record<string, string> = {
  a: 'aHand',
  b: 'flatThumbIn',
  c: 'cShape',
  d: 'point',
  e: 'eHand',
  f: 'ok',
  g: 'gun',
  h: 'twoGun',
  i: 'pinkyUp',
  j: 'pinkyUp',
  k: 'peace',
  l: 'lHand',
  m: 'thumbUnderThree',
  n: 'thumbBetween',
  o: 'oShape',
  p: 'gun',
  q: 'gun',
  r: 'crossed',
  s: 'fist',
  t: 'thumbBetween',
  u: 'twoTogether',
  v: 'peace',
  w: 'threeUp',
  x: 'hook',
  y: 'callMe',
  z: 'point',
};

for (const [letter, shape] of Object.entries(letterShape)) {
  define(`letter-${letter}`, [kf('neutral', 0.35), kf(shape, 0.55)]);
}

/** Landing-page showcase loop: cycles through the most recognisable signs. */
define('showcase', [kf('open', 0.6), kf('thumbsUp', 0.6), kf('peace', 0.6), kf('lHand', 0.6), kf('point', 0.6), kf('fist', 0.6)], { loop: true });

export const ANIMATION_COUNT = Object.keys(letterShape).length + 50;
