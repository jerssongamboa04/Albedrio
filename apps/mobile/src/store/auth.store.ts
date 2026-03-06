import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";

type AuthState = {
  session: Session | null;
  user: User | null;
  initialized: boolean;

  recovery: boolean;
  setRecovery: (value: boolean) => void;

  setSession: (session: Session | null) => void;
  setInitialized: (value: boolean) => void;
  signOutLocal: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  initialized: false,

  recovery: false,
  setRecovery: (value) => set({ recovery: value }),

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
    }),

  setInitialized: (value) => set({ initialized: value }),

  signOutLocal: () => set({ session: null, user: null, recovery: false }),
}));