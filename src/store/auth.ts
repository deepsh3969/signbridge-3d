import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  provider: 'demo' | 'supabase';
}

interface AuthState {
  user: AuthUser | null;
  /** true until the visitor explicitly chooses guest or signs in */
  pending: boolean;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
  continueAsGuest: () => void;
}

/**
 * Local demo authentication. The core experience never requires an account —
 * guests can learn, practise and take quizzes. When VITE_SUPABASE_URL and
 * VITE_SUPABASE_ANON_KEY are configured the same interface is backed by
 * Supabase Auth instead (see src/utils/supabase.ts).
 */
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      pending: false,
      signIn: (user) => set({ user, pending: false }),
      signOut: () => set({ user: null }),
      continueAsGuest: () => set({ pending: false }),
    }),
    { name: 'signbridge.auth', version: 1 },
  ),
);
