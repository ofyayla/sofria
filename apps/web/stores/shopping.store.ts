import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ShoppingState {
  /** SDD §4.2: `{ planId: { itemSlug: boolean } }` — markette internet kopsa da işaretler kaybolmaz. */
  checkedByPlan: Record<string, Record<string, boolean>>;
  toggleItem: (planId: string, itemSlug: string) => void;
  isChecked: (planId: string, itemSlug: string) => boolean;
  resetForPlan: (planId: string) => void;
}

export const useShoppingStore = create<ShoppingState>()(
  persist(
    (set, get) => ({
      checkedByPlan: {},

      toggleItem: (planId, itemSlug) =>
        set((state) => {
          const planChecks = state.checkedByPlan[planId] ?? {};
          return {
            checkedByPlan: {
              ...state.checkedByPlan,
              [planId]: { ...planChecks, [itemSlug]: !planChecks[itemSlug] },
            },
          };
        }),

      isChecked: (planId, itemSlug) => Boolean(get().checkedByPlan[planId]?.[itemSlug]),

      resetForPlan: (planId) =>
        set((state) => {
          const { [planId]: _removed, ...rest } = state.checkedByPlan;
          return { checkedByPlan: rest };
        }),
    }),
    { name: "sofria:v1:shopping", version: 1, skipHydration: true }
  )
);
