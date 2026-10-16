import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserPreferencesPayload, WeeklyPlanResponse } from "@sofria/shared";
import { asyncStorageAdapter } from "../lib/storage.adapter";

export interface PlanState {
  currentPlan: WeeklyPlanResponse | null;
  /**
   * Planı üreten tercihler — yemek değiştirirken alternatifler AYNI diyet,
   * ekipman ve süre kurallarına uysun diye saklanır. Bu alan eklenmeden önce
   * üretilmiş planlarda yoktur (bkz. usePlanSwap: Kurallarım'a düşülür).
   */
  currentPayload: UserPreferencesPayload | null;
  setPlan: (plan: WeeklyPlanResponse, payload?: UserPreferencesPayload) => void;
  /** Aynı planın güncellenmiş hâli (yemek değişimi / geri al) — tercihler korunur. */
  updatePlan: (plan: WeeklyPlanResponse) => void;
  clearPlan: () => void;
}

/** SDD §4.2: yalnızca SON planı tutar — geçmiş için bkz. ratings.store (ayrı, kendi ömrü var). */
export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      currentPlan: null,
      currentPayload: null,
      setPlan: (plan, payload) => set({ currentPlan: plan, currentPayload: payload ?? null }),
      updatePlan: (plan) => set({ currentPlan: plan }),
      clearPlan: () => set({ currentPlan: null, currentPayload: null }),
    }),
    { name: "sofria:v1:plan", version: 1, skipHydration: true, storage: asyncStorageAdapter }
  )
);
