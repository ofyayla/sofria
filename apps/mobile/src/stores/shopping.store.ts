import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ShoppingList } from "@sofria/shared";
import { asyncStorageAdapter } from "../lib/storage.adapter";

/**
 * Sepete atılmış ama yemek değişikliği yüzünden artık listede olmayan ürün.
 * Sessizce kaybolmaz — market ekranında "Artık gerekmiyor" diye gösterilir.
 */
export interface OrphanedItem {
  key: string;
  displayName: string;
  amountLabel: string;
}

export interface ShoppingState {
  /** SDD §4.2: `{ planId: { itemSlug: boolean } }` — markette internet kopsa da işaretler kaybolmaz. */
  checkedByPlan: Record<string, Record<string, boolean>>;
  orphansByPlan: Record<string, OrphanedItem[]>;
  toggleItem: (planId: string, itemSlug: string) => void;
  isChecked: (planId: string, itemSlug: string) => boolean;
  resetForPlan: (planId: string) => void;
  /**
   * Plan değişince (yemek değişimi / geri al) çağrılır: sepetteki ama yeni
   * listede olmayan ürünler "artık gerekmiyor"a taşınır, listeye geri dönenler
   * oradan çıkar. Sepetteki bir ürünün miktarı ARTTIYSA işareti kaldırılır —
   * alınan miktar artık yetmez, ürün yeniden "alınacak" olur.
   */
  syncOrphans: (planId: string, previous: ShoppingList, next: ShoppingList, keyOf: (i: { slug: string; unit: string }) => string, labelOf: (i: ShoppingList["aisles"][number]["items"][number]) => string) => void;
  dismissOrphan: (planId: string, key: string) => void;
  /** "Geri al" için: değişimden önceki işaretleri ve "artık gerekmiyor" listesini aynen geri yükler. */
  restore: (planId: string, checks: Record<string, boolean>, orphans: OrphanedItem[]) => void;
}

export const useShoppingStore = create<ShoppingState>()(
  persist(
    (set, get) => ({
      checkedByPlan: {},
      orphansByPlan: {},

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
          const { [planId]: _orphans, ...restOrphans } = state.orphansByPlan;
          return { checkedByPlan: rest, orphansByPlan: restOrphans };
        }),

      syncOrphans: (planId, previous, next, keyOf, labelOf) =>
        set((state) => {
          const checks = { ...(state.checkedByPlan[planId] ?? {}) };
          const nextItems = new Map(next.aisles.flatMap((a) => a.items).map((i) => [keyOf(i), i]));
          const nextKeys = new Set(nextItems.keys());
          for (const item of previous.aisles.flatMap((a) => a.items)) {
            const key = keyOf(item);
            const after = nextItems.get(key);
            if (checks[key] && after && after.totalAmount > item.totalAmount) delete checks[key];
          }
          const kept = (state.orphansByPlan[planId] ?? []).filter((o) => !nextKeys.has(o.key));
          const known = new Set(kept.map((o) => o.key));
          for (const item of previous.aisles.flatMap((a) => a.items)) {
            const key = keyOf(item);
            if (checks[key] && !nextKeys.has(key) && !known.has(key)) {
              kept.push({ key, displayName: item.displayName, amountLabel: labelOf(item) });
              known.add(key);
            }
          }
          return {
            checkedByPlan: { ...state.checkedByPlan, [planId]: checks },
            orphansByPlan: { ...state.orphansByPlan, [planId]: kept },
          };
        }),

      restore: (planId, checks, orphans) =>
        set((state) => ({
          checkedByPlan: { ...state.checkedByPlan, [planId]: checks },
          orphansByPlan: { ...state.orphansByPlan, [planId]: orphans },
        })),

      dismissOrphan: (planId, key) =>
        set((state) => {
          const planChecks = { ...(state.checkedByPlan[planId] ?? {}) };
          delete planChecks[key];
          return {
            checkedByPlan: { ...state.checkedByPlan, [planId]: planChecks },
            orphansByPlan: { ...state.orphansByPlan, [planId]: (state.orphansByPlan[planId] ?? []).filter((o) => o.key !== key) },
          };
        }),
    }),
    { name: "sofria:v1:shopping", version: 1, skipHydration: true, storage: asyncStorageAdapter }
  )
);
