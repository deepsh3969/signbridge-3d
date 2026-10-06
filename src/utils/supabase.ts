import { useEffect, useState } from 'react';

export const supabaseConfigured = (): boolean =>
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

export interface RemoteProfile {
  id: string;
  display_name: string | null;
  locale: string;
  created_at: string;
}

/**
 * ---------------------------------------------------------------------------
 * Supabase adapter (OPTIONAL)
 * ---------------------------------------------------------------------------
 * The application runs fully offline in Demo Mode with no environment
 * variables. When you add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY this
 * module documents the tables your backend should expose so progress can be
 * synced across devices.
 *
 *   profiles          id, display_name, locale, created_at
 *   signs             id, word, category, difficulty, language, region, data
 *   lessons           id, level_id, title, sign_ids, required_xp
 *   user_progress     user_id, sign_id, learned_at, rating
 *   practice_sessions user_id, sign_id, seconds, created_at
 *   quiz_attempts     user_id, score, total, seconds, created_at
 *   achievements      id, title, description
 *   user_achievements user_id, achievement_id, unlocked_at
 *   user_settings     user_id, settings jsonb
 *
 * Only the PUBLIC anon key may be used in the browser. Never ship the
 * service_role key in a VITE_ variable.
 * ---------------------------------------------------------------------------
 */
export async function fetchProfile(_userId: string): Promise<RemoteProfile | null> {
  if (!supabaseConfigured()) return null;
  // Integration point — intentionally unimplemented in Demo Mode.
  return null;
}

export const SUPABASE_TABLES = [
  'profiles',
  'signs',
  'lessons',
  'user_progress',
  'practice_sessions',
  'quiz_attempts',
  'achievements',
  'user_achievements',
  'user_settings',
] as const;

export function useIsConfigured() {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(supabaseConfigured()), []);
  return ok;
}
