import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WeeklyPlanResponse } from "@sofria/shared";

export interface PlanState {
  currentPlan: WeeklyPlanResponse | null;
  setPlan: (plan: WeeklyPlanResponse) => void;
  clearPlan: () => void;
}

/** SDD §4.2: yalnızca SON planı tutar — geçmiş için bkz. ratings.store (ayrı, kendi ömrü var). */
export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      currentPlan: null,
      setPlan: (plan) => set({ currentPlan: plan }),
      clearPlan: () => set({ currentPlan: null }),
    }),
    { name: "sofria:v1:plan", version: 1, skipHydration: true }
  )
);
