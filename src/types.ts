export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type SignCategory =
  | 'Greetings'
  | 'People'
  | 'Everyday Words'
  | 'Questions'
  | 'Useful Communication'
  | 'Numbers'
  | 'Alphabet';

export type Handedness = 'Right' | 'Left' | 'Both';

export type SignLanguageId = 'ISL' | 'ASL' | 'BSL';

export interface SignLanguageMeta {
  id: SignLanguageId;
  name: string;
  region: string;
  /** How much verified content currently exists for this language */
  status: 'demo' | 'available' | 'planned';
  note: string;
}

export interface Sign {
  id: string;
  word: string;
  category: SignCategory;
  difficulty: Difficulty;
  handedness: Handedness;
  /** 1 = single handed, 2 = two handed sign */
  hands: 1 | 2;
  description: string;
  steps: string[];
  /** Text spoken by the TTS engine */
  pronunciation: string;
  /** Key into the animation registry */
  animationId: string;
  /** Pose held by the non-dominant hand for two-handed signs */
  offHand?: string;
  relatedSigns: string[];
  language: SignLanguageId;
  region: string;
  variant?: string;
  /**
   * true when the sign is illustrative sample content rather than a
   * verified, community-checked sign. We never claim universality.
   */
  sample: boolean;
  /** Optional alternate spellings / search keywords */
  keywords?: string[];
  /** BCP-47 tag used for pronunciation lookup */
  locale?: string;
  popularity?: number;
  addedAt?: string;
}

export interface LessonNode {
  id: string;
  title: string;
  subtitle: string;
  category: SignCategory;
  signIds: string[];
  requiredXp: number;
}

export interface LearningLevel {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  nodes: LessonNode[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  /** returns true when unlocked */
  check: (stats: ProgressStats) => boolean;
}

export interface ProgressStats {
  signsLearned: number;
  signsPracticed: number;
  quizAttempts: number;
  quizCorrect: number;
  practiceSeconds: number;
  streakDays: number;
  xp: number;
  difficultyRatings: Record<string, 'easy' | 'okay' | 'difficult'>;
  learnedAt: Record<string, number>;
}

export type FontSize = 'sm' | 'md' | 'lg' | 'xl';
export type AnimSpeed = 'slow' | 'normal' | 'fast';

export interface AccessibilitySettings {
  fontSize: FontSize;
  highContrast: boolean;
  reducedMotion: boolean;
  textToSpeech: boolean;
  captions: boolean;
  animationSpeed: AnimSpeed;
  keyboardNavigation: boolean;
  darkMode: boolean;
}

export interface QuizResult {
  score: number;
  total: number;
  accuracy: number;
  seconds: number;
  mistakes: number;
  answered: { signId: string; correct: boolean }[];
}
