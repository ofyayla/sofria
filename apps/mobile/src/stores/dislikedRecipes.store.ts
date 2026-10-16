import { create } from "zustand";
import { persist } from "zustand/middleware";
import { asyncStorageAdapter } from "../lib/storage.adapter";

export interface DislikedRecipe {
  /** Katalog slug'ı (= imageSlug). */
  slug: string;
  name: string;
  at: string;
}

/**
 * "Bu tarifi bir daha önerme" listesi — sonraki planlarda ve yemek
 * değiştirme önerilerinde bu tarifler hiç seçilmez. Kurallarım'dan geri alınır.
 */
export interface DislikedRecipesState {
  items: DislikedRecipe[];
  add: (slug: string, name: string) => void;
  remove: (slug: string) => void;
}

export const useDislikedRecipesStore = create<DislikedRecipesState>()(
  persist(
    (set) => ({
      items: [],
      add: (slug, name) =>
        set((state) =>
          state.items.some((i) => i.slug === slug) ? state : { items: [{ slug, name, at: new Date().toISOString() }, ...state.items] }
        ),
      remove: (slug) => set((state) => ({ items: state.items.filter((i) => i.slug !== slug) })),
    }),
    { name: "sofria:v1:disliked-recipes", version: 1, skipHydration: true, storage: asyncStorageAdapter }
  )
);

export function dislikedSlugSet(items: DislikedRecipe[]): Set<string> {
  return new Set(items.map((i) => i.slug));
}
