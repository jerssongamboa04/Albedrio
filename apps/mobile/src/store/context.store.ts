import { create } from "zustand";

export type AvailableTime = 5 | 15 | 30 | 60;
export type UserEnergyLevel = "low" | "medium" | "high";

export type RecommendationContext = {
  availableTime: AvailableTime | null;
  energyLevel: UserEnergyLevel | null;
  createdAt: string | null;
  expiresAt: string | null;
};

type ContextStore = RecommendationContext & {
  setContext: (payload: {
    availableTime: AvailableTime;
    energyLevel: UserEnergyLevel;
  }) => void;
  hasValidContext: () => boolean;
  clearExpiredContext: () => void;
  resetContext: () => void;
};

export const CONTEXT_TTL_MS = 60 * 60 * 1000;

function buildExpirationDate(now = new Date()) {
  return new Date(now.getTime() + CONTEXT_TTL_MS).toISOString();
}

function isFutureDate(dateIso: string | null) {
  if (!dateIso) return false;
  return new Date(dateIso).getTime() > Date.now();
}

const initialState: RecommendationContext = {
  availableTime: null,
  energyLevel: null,
  createdAt: null,
  expiresAt: null,
};

export const useContextStore = create<ContextStore>((set, get) => ({
  ...initialState,

  setContext: ({ availableTime, energyLevel }) => {
    const now = new Date();

    set({
      availableTime,
      energyLevel,
      createdAt: now.toISOString(),
      expiresAt: buildExpirationDate(now),
    });
  },

  hasValidContext: () => {
    const { availableTime, energyLevel, expiresAt } = get();

    if (!availableTime || !energyLevel || !expiresAt) {
      return false;
    }

    return isFutureDate(expiresAt);
  },

  clearExpiredContext: () => {
    const { expiresAt } = get();

    if (!expiresAt) return;
    if (isFutureDate(expiresAt)) return;

    set({ ...initialState });
  },

  resetContext: () => {
    set({ ...initialState });
  },
}));