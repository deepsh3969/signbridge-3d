import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AccessibilitySettings, AnimSpeed, FontSize, SignLanguageId } from '@/types';

export interface SettingsState extends AccessibilitySettings {
  /** Sound effects / UI chimes (never required for comprehension) */
  soundEffects: boolean;
  /** Preferred sign language being learned */
  signLanguage: SignLanguageId;
  /** Onboarding has been completed */
  onboarded: boolean;
  /** User is browsing as a guest (no account) */
  guest: boolean;
  speechRate: number;
  speechPitch: number;
  speechVolume: number;
  speechVoiceURI: string | null;

  set: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  patch: (partial: Partial<SettingsState>) => void;
}

const defaults: Omit<SettingsState, 'set' | 'patch'> = {
  fontSize: 'md',
  highContrast: false,
  reducedMotion: false,
  textToSpeech: true,
  captions: true,
  animationSpeed: 'normal' as AnimSpeed,
  keyboardNavigation: true,
  darkMode: false,
  soundEffects: false,
  signLanguage: 'ASL' as SignLanguageId,
  onboarded: false,
  guest: true,
  speechRate: 0.95,
  speechPitch: 1,
  speechVolume: 1,
  speechVoiceURI: null,
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      set: (key, value) => set({ [key]: value } as Partial<SettingsState>),
      patch: (partial) => set(partial),
    }),
    { name: 'signbridge.settings', version: 2 },
  ),
);

export const FONT_SIZES: { id: FontSize; label: string }[] = [
  { id: 'sm', label: 'Small' },
  { id: 'md', label: 'Medium' },
  { id: 'lg', label: 'Large' },
  { id: 'xl', label: 'Extra Large' },
];

export const ANIM_SPEEDS: { id: AnimSpeed; label: string; value: number }[] = [
  { id: 'slow', label: 'Slow', value: 0.55 },
  { id: 'normal', label: 'Normal', value: 1 },
  { id: 'fast', label: 'Fast', value: 1.7 },
];

export const speedValue = (s: AnimSpeed) => ANIM_SPEEDS.find((a) => a.id === s)?.value ?? 1;
