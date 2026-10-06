import type { Sign, SignCategory, SignLanguageId } from '@/types';

/**
 * ---------------------------------------------------------------------------
 * Sign content
 * ---------------------------------------------------------------------------
 * Every sign is data — no page contains sign-specific UI logic, so the
 * curriculum can grow to hundreds of entries without touching components.
 *
 * IMPORTANT — responsible content:
 * Sign languages differ by country and community. All entries below are
 * clearly flagged `sample: true` because they are illustrative hand shapes
 * used to demonstrate the platform, NOT a verified, community-reviewed
 * lexicon. Language / region / variant metadata is stored per sign so a
 * reviewed ASL, ISL or BSL dataset can be dropped in later without any
 * structural change.
 * ---------------------------------------------------------------------------
 */

interface SignSeed extends Partial<Sign> {
  id: string;
  word: string;
  category: SignCategory;
  description: string;
  steps: string[];
  animationId: string;
  offHand?: string;
}

const sign = (seed: SignSeed): Sign => ({
  pronunciation: seed.word,
  difficulty: 'Beginner',
  handedness: 'Right',
  hands: 1,
  relatedSigns: [],
  language: 'ASL' as SignLanguageId,
  region: 'United States',
  variant: 'Illustrative prototype handshape',
  sample: true,
  locale: 'en-US',
  popularity: 50,
  addedAt: '2025-01-01',
  ...seed,
} as Sign);

const cat = (category: SignCategory, ids: string[]) => ids;

/* ------------------------------------------------------------------ */
/* Greetings                                                           */
/* ------------------------------------------------------------------ */
const greetings: Sign[] = [
  sign({
    id: 'hello',
    word: 'Hello',
    category: 'Greetings',
    hands: 1,
    description:
      'A friendly open-hand salute. Raise your hand beside your head and sweep it outward, the way you would wave to someone across a room.',
    steps: [
      'Hold your open hand up beside your forehead, palm facing forward.',
      'Keep your fingers together and your thumb relaxed.',
      'Sweep the hand outward and away from your head in a small saluting arc.',
    ],
    animationId: 'hello',
    relatedSigns: ['hi', 'goodbye', 'welcome'],
    keywords: ['hi', 'greeting', 'wave', 'hey'],
    popularity: 98,
  }),
  sign({
    id: 'hi',
    word: 'Hi',
    category: 'Greetings',
    description:
      'A shorter, more casual version of Hello — a small open-hand wave near the side of your head.',
    steps: [
      'Open your hand beside your head, palm forward.',
      'Wave gently once or twice from the wrist.',
      'Keep the movement small and relaxed.',
    ],
    animationId: 'hi',
    relatedSigns: ['hello', 'goodbye'],
    keywords: ['hello', 'hey', 'greeting'],
    popularity: 88,
  }),
  sign({
    id: 'goodbye',
    word: 'Goodbye',
    category: 'Greetings',
    description:
      'An open hand raised and then swept away from you — the classic farewell wave.',
    steps: [
      'Raise an open hand beside your head, palm forward.',
      'Move the hand outward in an arc away from your body.',
      'Let the hand drift away as the wave finishes.',
    ],
    animationId: 'goodbye',
    relatedSigns: ['hello', 'welcome'],
    keywords: ['bye', 'farewell', 'see you'],
    popularity: 92,
  }),
  sign({
    id: 'good-morning',
    word: 'Good morning',
    category: 'Greetings',
    description:
      'Combine the sign for GOOD with a rising motion that suggests the sun coming up.',
    steps: [
      'Hold a flat hand in front of your chin, palm inward.',
      'Bring the hand forward and down into your other open palm.',
      'Lift the flat hand upward and outward, like a sunrise.',
    ],
    animationId: 'good-morning',
    hands: 2,
    offHand: 'palmUp',
    relatedSigns: ['good', 'good-night', 'hello'],
    keywords: ['morning', 'greeting'],
    popularity: 74,
  }),
  sign({
    id: 'good-night',
    word: 'Good night',
    category: 'Greetings',
    description:
      'GOOD followed by a hand moving downward across the horizon, as if the light is setting.',
    steps: [
      'Place a flat hand at your chin, palm inward.',
      'Move it forward into your other open palm.',
      'Sweep the dominant hand down and across, as though closing out the day.',
    ],
    animationId: 'good-night',
    hands: 2,
    offHand: 'palmUp',
    relatedSigns: ['good', 'sleep', 'good-morning'],
    keywords: ['night', 'evening', 'goodnight'],
    popularity: 71,
  }),
  sign({
    id: 'thank-you',
    word: 'Thank you',
    category: 'Greetings',
    description:
      'Touch your fingertips to your chin and move the flat hand forward toward the person you are thanking.',
    steps: [
      'Hold a flat hand with fingers together, fingertips near your chin.',
      'Keep your palm facing slightly inward.',
      'Move the hand forward and down toward the other person.',
    ],
    animationId: 'thank-you',
    relatedSigns: ['please', 'sorry', 'hello'],
    keywords: ['thanks', 'gratitude', 'appreciate'],
    popularity: 96,
  }),
  sign({
    id: 'please',
    word: 'Please',
    category: 'Greetings',
    description:
      'A flat hand moving in a circle over the centre of your chest — a calm, polite request.',
    steps: [
      'Place a flat hand on the centre of your chest, palm in.',
      'Move it in a smooth clockwise circle.',
      'Repeat the circle once or twice while keeping a relaxed expression.',
    ],
    animationId: 'please',
    relatedSigns: ['thank-you', 'sorry', 'help'],
    keywords: ['request', 'polite'],
    popularity: 80,
  }),
  sign({
    id: 'sorry',
    word: 'Sorry',
    category: 'Greetings',
    description:
      'A closed fist rubbed in a circle over the chest — the universal gesture of apology.',
    steps: [
      'Make a loose fist and place it on the centre of your chest.',
      'Move the fist in a small circle.',
      'Repeat two or three times with an apologetic expression.',
    ],
    animationId: 'sorry',
    hands: 2,
    offHand: 'palmUp',
    relatedSigns: ['please', 'thank-you', 'help'],
    keywords: ['apology', 'apologise', 'regret'],
    popularity: 77,
  }),
  sign({
    id: 'welcome',
    word: 'Welcome',
    category: 'Greetings',
    description:
      'An open hand reaching out and drawing inward — inviting someone into your space.',
    steps: [
      'Extend your open hand forward, palm up and angled outward.',
      'Sweep the hand back toward your body in a welcoming arc.',
      'Finish with the hand near your waist, palm up.',
    ],
    animationId: 'welcome',
    relatedSigns: ['hello', 'come', 'goodbye'],
    keywords: ['invite', 'greeting'],
    popularity: 69,
  }),
];

/* ------------------------------------------------------------------ */
/* People                                                              */
/* ------------------------------------------------------------------ */
const people: Sign[] = [
  sign({
    id: 'i-pronoun',
    word: 'I',
    category: 'People',
    description: 'Point your index finger toward the centre of your chest to mean “me” or “I”.',
    steps: [
      'Extend your index finger, keeping the other fingers curled.',
      'Turn the hand so the fingertip faces your chest.',
      'Touch or move the finger gently toward the centre of your chest.',
    ],
    animationId: 'i',
    relatedSigns: ['me', 'you', 'we'],
    keywords: ['me', 'myself', 'my'],
    popularity: 95,
  }),
  sign({
    id: 'me',
    word: 'Me',
    category: 'People',
    description: 'The same chest point used for I — this sign points back at yourself.',
    steps: [
      'Extend your index finger.',
      'Aim it at the centre of your chest.',
      'Tap once lightly.',
    ],
    animationId: 'me',
    relatedSigns: ['i-pronoun', 'you'],
    keywords: ['i', 'myself'],
    popularity: 70,
  }),
  sign({
    id: 'you',
    word: 'You',
    category: 'People',
    description: 'Point your index finger directly at the person you are speaking to.',
    steps: [
      'Extend your index finger with the rest of the hand closed.',
      'Point straight at the other person.',
      'Hold the point briefly — keep it friendly, not accusatory.',
    ],
    animationId: 'you',
    relatedSigns: ['i-pronoun', 'we', 'who'],
    keywords: ['your', 'them', 'point'],
    popularity: 94,
  }),
  sign({
    id: 'we',
    word: 'We',
    category: 'People',
    description: 'Sweep an index finger across your chest from one shoulder to the other to include a group.',
    steps: [
      'Point your index finger toward your chest.',
      'Sweep it sideways across your body to the other shoulder.',
      'The arc should include yourself and the people you mean.',
    ],
    animationId: 'we',
    relatedSigns: ['i-pronoun', 'you', 'family'],
    keywords: ['us', 'our', 'group'],
    popularity: 66,
  }),
  sign({
    id: 'friend',
    word: 'Friend',
    category: 'People',
    hands: 2,
    description: 'Two index fingers hook together and then swap, symbolising a bond that holds.',
    steps: [
      'Hook your right index finger over your left index finger.',
      'Unhook and repeat the other way round.',
      'The two hooked fingers represent two people connected.',
    ],
    animationId: 'friend',
    offHand: 'hook',
    relatedSigns: ['family', 'brother', 'sister'],
    keywords: ['buddy', 'pal', 'companion'],
    popularity: 73,
  }),
  sign({
    id: 'family',
    word: 'Family',
    category: 'People',
    hands: 2,
    description: 'Two F-hands start together, circle outward and meet again — the family circle.',
    steps: [
      'Form an F-handshape with both hands (thumb and index touching).',
      'Touch the hands together, then circle them outward and apart.',
      'Bring the little-finger sides back together to close the circle.',
    ],
    animationId: 'family',
    offHand: 'ok',
    relatedSigns: ['mother', 'father', 'brother', 'sister'],
    keywords: ['relatives', 'household'],
    popularity: 68,
  }),
  sign({
    id: 'mother',
    word: 'Mother',
    category: 'People',
    description: 'An open hand tapping the chin with the thumb — the location associated with female signs.',
    steps: [
      'Open your hand with the thumb extended.',
      'Tap the tip of your thumb against your chin once or twice.',
      'Keep the fingers spread and relaxed.',
    ],
    animationId: 'mother',
    relatedSigns: ['father', 'family', 'sister'],
    keywords: ['mom', 'mum', 'parent'],
    popularity: 76,
  }),
  sign({
    id: 'father',
    word: 'Father',
    category: 'People',
    description: 'An open hand tapping the forehead with the thumb — the location associated with male signs.',
    steps: [
      'Open your hand with the thumb extended.',
      'Tap the tip of your thumb against your forehead once or twice.',
      'Keep the fingers spread and relaxed.',
    ],
    animationId: 'father',
    relatedSigns: ['mother', 'family', 'brother'],
    keywords: ['dad', 'papa', 'parent'],
    popularity: 75,
  }),
  sign({
    id: 'brother',
    word: 'Brother',
    category: 'People',
    description: 'An L-handshape starting at the forehead and moving forward — the male sign combined with “same”.',
    steps: [
      'Make an L-handshape (index up, thumb out) at your forehead.',
      'Move the hand forward and slightly down in front of you.',
      'Repeat with a small, confident motion.',
    ],
    animationId: 'brother',
    relatedSigns: ['sister', 'father', 'family'],
    keywords: ['sibling', 'bro'],
    popularity: 62,
  }),
  sign({
    id: 'sister',
    word: 'Sister',
    category: 'People',
    description: 'An L-handshape starting near the jaw and moving forward — the female sign combined with “same”.',
    steps: [
      'Make an L-handshape near the side of your jaw.',
      'Move the hand forward and slightly down in front of you.',
      'Keep the motion smooth and level.',
    ],
    animationId: 'sister',
    relatedSigns: ['brother', 'mother', 'family'],
    keywords: ['sibling', 'sis'],
    popularity: 61,
  }),
];

/* ------------------------------------------------------------------ */
/* Everyday words                                                      */
/* ------------------------------------------------------------------ */
const everyday: Sign[] = [
  sign({
    id: 'food',
    word: 'Food',
    category: 'Everyday Words',
    difficulty: 'Beginner',
    description: 'Bring a flattened O-hand to your mouth several times, as if placing food inside.',
    steps: [
      'Bring the fingertips of your flat hand together with your thumb.',
      'Move the hand toward your mouth.',
      'Tap the lips lightly two or three times.',
    ],
    animationId: 'food',
    relatedSigns: ['water', 'sleep', 'good'],
    keywords: ['eat', 'meal', 'hungry'],
    popularity: 85,
  }),
  sign({
    id: 'water',
    word: 'Water',
    category: 'Everyday Words',
    description: 'A W-handshape tapped against your chin — the standard sign for water.',
    steps: [
      'Extend your index, middle and ring fingers into a W.',
      'Tuck the thumb and little finger in.',
      'Tap the side of your index finger against your chin twice.',
    ],
    animationId: 'water',
    relatedSigns: ['food', 'help', 'good'],
    keywords: ['drink', 'thirsty', 'w'],
    popularity: 87,
  }),
  sign({
    id: 'home',
    word: 'Home',
    category: 'Everyday Words',
    description: 'A flat O-hand touching the cheek and then moving to the ear — from mouth to where you sleep.',
    steps: [
      'Form a flat O-handshape near your mouth.',
      'Touch your cheek lightly.',
      'Move the hand up to a point near your ear.',
    ],
    animationId: 'home',
    relatedSigns: ['school', 'sleep', 'family'],
    keywords: ['house', 'house', 'residence'],
    popularity: 79,
  }),
  sign({
    id: 'school',
    word: 'School',
    category: 'Everyday Words',
    hands: 2,
    description: 'Clap one flat hand onto the other twice — the familiar school clap.',
    steps: [
      'Hold your non-dominant hand flat, palm up.',
      'Bring the dominant flat hand down onto it twice.',
      'Keep the motion crisp and at waist height.',
    ],
    animationId: 'school',
    offHand: 'palmUp',
    relatedSigns: ['college', 'book', 'work'],
    keywords: ['education', 'class', 'learn'],
    popularity: 82,
  }),
  sign({
    id: 'college',
    word: 'College',
    category: 'Everyday Words',
    difficulty: 'Intermediate',
    hands: 2,
    description: 'A C-hand circling above a flat palm — a step up from the sign for school.',
    steps: [
      'Hold your non-dominant hand flat, palm up.',
      'Make a C-shape with your dominant hand above it.',
      'Circle the C-hand counter-clockwise and lift slightly.',
    ],
    animationId: 'college',
    offHand: 'palmUp',
    relatedSigns: ['school', 'book', 'work'],
    keywords: ['university', 'higher education'],
    popularity: 58,
  }),
  sign({
    id: 'book',
    word: 'Book',
    category: 'Everyday Words',
    hands: 2,
    description: 'Two flat palms together that open outward like the pages of a book.',
    steps: [
      'Press your palms together in front of you, fingers straight.',
      'Keeping the little-finger edges together, open both hands outward.',
      'Repeat once so the “book” opens and closes.',
    ],
    animationId: 'book',
    offHand: 'flat',
    relatedSigns: ['school', 'college', 'work'],
    keywords: ['read', 'pages', 'study'],
    popularity: 78,
  }),
  sign({
    id: 'help',
    word: 'Help',
    category: 'Everyday Words',
    hands: 2,
    description: 'A fist with the thumb up resting on a flat palm — one hand supporting the other.',
    steps: [
      'Hold your non-dominant hand flat, palm up.',
      'Make a fist with your dominant hand and point the thumb up.',
      'Rest the fist on the flat palm and lift both together.',
    ],
    animationId: 'help',
    offHand: 'palmUp',
    relatedSigns: ['please', 'stop', 'wait'],
    keywords: ['assist', 'support', 'aid'],
    popularity: 90,
  }),
  sign({
    id: 'work',
    word: 'Work',
    category: 'Everyday Words',
    difficulty: 'Intermediate',
    hands: 2,
    description: 'Tap one wrist against the back of the other hand — like a tool striking an anvil.',
    steps: [
      'Make a loose fist with your non-dominant hand, knuckles up.',
      'Tap the heel of your dominant fist onto the back of it twice.',
      'Keep both hands at waist height.',
    ],
    animationId: 'work',
    offHand: 'aHand',
    relatedSigns: ['school', 'college', 'help'],
    keywords: ['job', 'employment', 'career'],
    popularity: 72,
  }),
  sign({
    id: 'sleep',
    word: 'Sleep',
    category: 'Everyday Words',
    description: 'Draw a flat hand down over your face as your fingers close — eyes closing for sleep.',
    steps: [
      'Hold an open hand in front of your face, palm in.',
      'Draw it downward past your eyes.',
      'Close the fingers into a flattened O as the hand passes your face.',
    ],
    animationId: 'sleep',
    relatedSigns: ['good-night', 'home', 'food'],
    keywords: ['rest', 'tired', 'bed'],
    popularity: 70,
  }),
];

/* ------------------------------------------------------------------ */
/* Questions                                                           */
/* ------------------------------------------------------------------ */
const questions: Sign[] = [
  sign({
    id: 'what',
    word: 'What?',
    category: 'Questions',
    description: 'Open both hands palms-up and shake them slightly — the universal “what?” gesture.',
    steps: [
      'Hold both hands out in front of you, palms up.',
      'Spread the fingers slightly.',
      'Shake both hands side to side a couple of times.',
    ],
    animationId: 'what',
    hands: 2,
    offHand: 'palmUp',
    relatedSigns: ['where', 'when', 'why'],
    keywords: ['which', 'what is'],
    popularity: 89,
  }),
  sign({
    id: 'where',
    word: 'Where?',
    category: 'Questions',
    description: 'Point your index finger and move it side to side, as if searching for a location.',
    steps: [
      'Extend your index finger.',
      'Hold the hand out at chest height.',
      'Move it side to side twice while questioning.',
    ],
    animationId: 'where',
    relatedSigns: ['what', 'when', 'how'],
    keywords: ['which place', 'location'],
    popularity: 84,
  }),
  sign({
    id: 'when',
    word: 'When?',
    category: 'Questions',
    description: 'Circle your index finger around the other hand and land it on the back of the wrist — a clock.',
    steps: [
      'Hold your non-dominant hand out flat, palm down.',
      'Circle your dominant index finger around it.',
      'Land the fingertip on the back of the wrist.',
    ],
    animationId: 'when',
    hands: 2,
    offHand: 'flat',
    relatedSigns: ['where', 'what', 'why'],
    keywords: ['time', 'what time'],
    popularity: 67,
  }),
  sign({
    id: 'why',
    word: 'Why?',
    category: 'Questions',
    difficulty: 'Intermediate',
    description: 'Touch your forehead with your index finger and pull it away into a Y-handshape.',
    steps: [
      'Touch your forehead with your index finger.',
      'Pull the hand down and away from your head.',
      'Open into a Y-handshape (thumb and little finger out) as you pull away.',
    ],
    animationId: 'why',
    relatedSigns: ['what', 'who', 'how'],
    keywords: ['reason', 'cause'],
    popularity: 76,
  }),
  sign({
    id: 'who',
    word: 'Who?',
    category: 'Questions',
    description: 'Circle your index finger in front of your face and finish with an L-handshape at the lips.',
    steps: [
      'Hold your index finger up in front of your face.',
      'Circle it once while asking.',
      'Finish by forming an L-shape with the thumb at your lips.',
    ],
    animationId: 'who',
    relatedSigns: ['what', 'where', 'why'],
    keywords: ['which person'],
    popularity: 74,
  }),
  sign({
    id: 'how',
    word: 'How?',
    category: 'Questions',
    difficulty: 'Intermediate',
    hands: 2,
    description: 'Curved hands start together, then roll outward and open — “how does this work?”',
    steps: [
      'Hold both hands with fingers curved, knuckles touching.',
      'Roll them outward so the palms turn up.',
      'Finish with the hands open and slightly apart.',
    ],
    animationId: 'how',
    offHand: 'cShape',
    relatedSigns: ['what', 'where', 'why'],
    keywords: ['method', 'in what way'],
    popularity: 71,
  }),
];

/* ------------------------------------------------------------------ */
/* Useful communication                                                */
/* ------------------------------------------------------------------ */
const useful: Sign[] = [
  sign({
    id: 'yes',
    word: 'Yes',
    category: 'Useful Communication',
    description: 'Your fist nods like a head saying yes — the simplest affirmative sign.',
    steps: [
      'Make a relaxed fist with your dominant hand.',
      'Bend it up and down at the wrist twice.',
      'Keep the motion small, like a nodding head.',
    ],
    animationId: 'yes',
    relatedSigns: ['no', 'maybe', 'good'],
    keywords: ['yeah', 'agree', 'correct'],
    popularity: 93,
  }),
  sign({
    id: 'no',
    word: 'No',
    category: 'Useful Communication',
    description: 'Your index and middle finger snap closed onto your thumb — a quick, clear refusal.',
    steps: [
      'Hold up your index and middle finger with the thumb beneath.',
      'Snap both fingers down onto the thumb.',
      'Repeat twice for emphasis.',
    ],
    animationId: 'no',
    relatedSigns: ['yes', 'stop', 'bad'],
    keywords: ['negative', 'refuse', 'nah'],
    popularity: 91,
  }),
  sign({
    id: 'maybe',
    word: 'Maybe',
    category: 'Useful Communication',
    hands: 2,
    description: 'Both flat hands rock like a balance scale — one side, then the other.',
    steps: [
      'Hold both hands flat, palms up, in front of you.',
      'Lower one hand while raising the other.',
      'Swap repeatedly, like a scale weighing two options.',
    ],
    animationId: 'maybe',
    offHand: 'palmUp',
    relatedSigns: ['yes', 'no', 'good'],
    keywords: ['perhaps', 'possibly', 'unsure'],
    popularity: 65,
  }),
  sign({
    id: 'good',
    word: 'Good',
    category: 'Useful Communication',
    description: 'Touch your chin with a flat hand and bring it down into your other palm.',
    steps: [
      'Place the fingertips of your flat hand at your chin.',
      'Move the hand forward and down.',
      'Land it palm-up in your other open hand.',
    ],
    animationId: 'good',
    hands: 2,
    offHand: 'palmUp',
    relatedSigns: ['bad', 'yes', 'thank-you'],
    keywords: ['fine', 'nice', 'ok'],
    popularity: 88,
  }),
  sign({
    id: 'bad',
    word: 'Bad',
    category: 'Useful Communication',
    description: 'Start at the chin like GOOD, then flip the hand palm-down as you bring it away.',
    steps: [
      'Place the fingertips of your flat hand at your chin.',
      'Move the hand forward and down.',
      'Flip the palm to face the floor at the end of the motion.',
    ],
    animationId: 'bad',
    relatedSigns: ['good', 'no', 'stop'],
    keywords: ['poor', 'wrong', 'not good'],
    popularity: 64,
  }),
  sign({
    id: 'stop',
    word: 'Stop',
    category: 'Useful Communication',
    hands: 2,
    description: 'Bring the edge of a flat hand sharply down onto an open palm — an unambiguous halt.',
    steps: [
      'Hold your non-dominant hand flat, palm up.',
      'Bring the side of your dominant flat hand down onto it.',
      'Stop firmly on contact.',
    ],
    animationId: 'stop',
    offHand: 'palmUp',
    relatedSigns: ['wait', 'no', 'help'],
    keywords: ['halt', 'freeze', 'enough'],
    popularity: 86,
  }),
  sign({
    id: 'wait',
    word: 'Wait',
    category: 'Useful Communication',
    description: 'Both hands held out with wiggling fingers — hold on, I am not ready yet.',
    steps: [
      'Hold both hands out, palms angled up.',
      'Wiggle the fingers gently.',
      'Keep the hands in place until you are ready.',
    ],
    animationId: 'wait',
    hands: 2,
    offHand: 'palmUp',
    relatedSigns: ['stop', 'come', 'go'],
    keywords: ['hold on', 'pause', 'moment'],
    popularity: 68,
  }),
  sign({
    id: 'come',
    word: 'Come',
    category: 'Useful Communication',
    description: 'Reach out with an index finger and curl it toward yourself, beckoning someone in.',
    steps: [
      'Extend your index finger with the palm facing up.',
      'Curl the finger toward you twice.',
      'Keep the rest of the hand relaxed.',
    ],
    animationId: 'come',
    relatedSigns: ['go', 'welcome', 'wait'],
    keywords: ['approach', 'beckon', 'invite'],
    popularity: 70,
  }),
  sign({
    id: 'go',
    word: 'Go',
    category: 'Useful Communication',
    description: 'Point both index fingers forward and push them away from you.',
    steps: [
      'Point your index fingers out in front of you.',
      'Push both hands forward and away.',
      'Let the hands travel in the direction you mean.',
    ],
    animationId: 'go',
    hands: 2,
    offHand: 'point',
    relatedSigns: ['come', 'stop', 'wait'],
    keywords: ['leave', 'depart', 'move'],
    popularity: 69,
  }),
];

/* ------------------------------------------------------------------ */
/* Numbers 0–10                                                        */
/* ------------------------------------------------------------------ */
const numberSeed: { id: string; word: string; say: string; kw: string[] }[] = [
  { id: 'n0', word: '0', say: 'zero', kw: ['zero', 'nil', 'nought'] },
  { id: 'n1', word: '1', say: 'one', kw: ['one', 'first', 'single'] },
  { id: 'n2', word: '2', say: 'two', kw: ['two', 'second', 'pair'] },
  { id: 'n3', word: '3', say: 'three', kw: ['three', 'third', 'trio'] },
  { id: 'n4', word: '4', say: 'four', kw: ['four', 'fourth', 'quartet'] },
  { id: 'n5', word: '5', say: 'five', kw: ['five', 'fifth', 'pentad'] },
  { id: 'n6', word: '6', say: 'six', kw: ['six', 'sixth', 'half dozen'] },
  { id: 'n7', word: '7', say: 'seven', kw: ['seven', 'seventh'] },
  { id: 'n8', word: '8', say: 'eight', kw: ['eight', 'eighth'] },
  { id: 'n9', word: '9', say: 'nine', kw: ['nine', 'ninth'] },
  { id: 'n10', word: '10', say: 'ten', kw: ['ten', 'tenth', 'decade'] },
];

const numberSteps = (word: string): string[] => [
  `Hold your dominant hand up at shoulder height for the number ${word}.`,
  'Keep your palm facing forward so the shape is easy to read.',
  'Hold the shape for a moment before relaxing.',
];

const numbers: Sign[] = numberSeed.map((n, i) =>
  sign({
    id: n.id,
    word: n.word,
    category: 'Numbers',
    description: `Hand shape used to count the number ${n.say}. Numbers are signed with one hand and held steady so they can be read clearly.`,
    steps: numberSteps(n.say),
    animationId: n.id,
    relatedSigns: [numberSeed[Math.max(0, i - 1)].id, numberSeed[Math.min(10, i + 1)].id],
    keywords: [...n.kw, 'number', 'count', 'counting'],
    popularity: 60 - Math.abs(5 - i),
  }),
);

/* ------------------------------------------------------------------ */
/* Alphabet A–Z                                                        */
/* ------------------------------------------------------------------ */
const letterSteps = (letter: string): string[] => [
  `Form the handshape for the letter ${letter} with your dominant hand.`,
  'Keep the fingers clearly separated or clearly joined so the shape is unambiguous.',
  'Hold the letter steady at shoulder height, palm facing forward.',
];

const letterDescription = (letter: string): string =>
  `Fingerspelling handshape for the letter ${letter}. Letters are produced with one hand and held still so the reader can follow them.`;

const letters: Sign[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((L, i) => {
  const lower = L.toLowerCase();
  const prev = i === 0 ? 'z' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i - 1].toLowerCase();
  const next = i === 25 ? 'a' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i + 1].toLowerCase();
  return sign({
    id: lower,
    word: L,
    category: 'Alphabet',
    description: letterDescription(L),
    steps: letterSteps(L),
    animationId: `letter-${lower}`,
    relatedSigns: [prev, next],
    keywords: [lower, 'letter', 'alphabet', 'fingerspelling', 'abc'],
    popularity: 55,
  });
});

/* ------------------------------------------------------------------ */

export const SIGNS: Sign[] = [
  ...greetings,
  ...people,
  ...everyday,
  ...questions,
  ...useful,
  ...numbers,
  ...letters,
];

export const SIGN_MAP: Record<string, Sign> = Object.fromEntries(SIGNS.map((s) => [s.id, s]));

export const getSign = (id?: string): Sign | undefined => (id ? SIGN_MAP[id] : undefined);

export const SIGN_CATEGORIES: SignCategory[] = [
  'Greetings',
  'People',
  'Everyday Words',
  'Questions',
  'Useful Communication',
  'Numbers',
  'Alphabet',
];

export const signsByCategory = (category: SignCategory): Sign[] =>
  SIGNS.filter((s) => s.category === category);

export const relatedSigns = (sign: Sign): Sign[] =>
  sign.relatedSigns.map((id) => SIGN_MAP[id]).filter(Boolean).slice(0, 4);

/** Ordered list used for previous / next navigation on a sign page. */
export const SIGN_ORDER: string[] = SIGNS.map((s) => s.id);

export const adjacentSigns = (id: string): { prev?: Sign; next?: Sign } => {
  const i = SIGN_ORDER.indexOf(id);
  if (i < 0) return {};
  return {
    prev: i > 0 ? SIGN_MAP[SIGN_ORDER[i - 1]] : undefined,
    next: i < SIGN_ORDER.length - 1 ? SIGN_MAP[SIGN_ORDER[i + 1]] : undefined,
  };
};

export interface SignLanguageOption extends SignLanguageIdMeta {
  available: boolean;
  count: number;
}

interface SignLanguageIdMeta {
  id: SignLanguageId;
  name: string;
  region: string;
  note: string;
}

export const SIGN_LANGUAGES: SignLanguageOption[] = [
  {
    id: 'ASL',
    name: 'American Sign Language',
    region: 'United States & Canada',
    note: 'Prototype handshapes are available while we work with the Deaf community on verified content.',
    available: true,
    count: SIGNS.length,
  },
  {
    id: 'ISL',
    name: 'Indian Sign Language',
    region: 'India',
    note: 'ISL support is coming. The data model is ready — no ISL signs are published until they are verified.',
    available: false,
    count: 0,
  },
  {
    id: 'BSL',
    name: 'British Sign Language',
    region: 'United Kingdom',
    note: 'BSL support is coming. Two-handed alphabet and regional variants will be modelled separately.',
    available: false,
    count: 0,
  },
];

void cat;
