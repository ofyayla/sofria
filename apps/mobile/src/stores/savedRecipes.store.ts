import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CuisineType, RatedRecipeSnapshot } from "@sofria/shared";
import { asyncStorageAdapter } from "../lib/storage.adapter";

/**
 * Tarif defterine (Tariflerim) puan vermeden eklenen tarif. Puanlama kaydı
 * (ratings.store) yıldızı ZORUNLU tutuyor; "sonra denerim" diye saklamak
 * için ayrı kayıt. Puanlamadaki gibi tarifin tamamı gömülür — kaynak plan
 * değişse bile tarif açılabilir kalır.
 */
export interface SavedRecipe {
  /** `${sourceMealId}-${sourceSubRecipeId ?? "meal"}` — aynı tarif iki kez kaydedilmez. */
  key: string;
  sourceMealId: string;
  sourceSubRecipeId?: string;
  recipeName: string;
  cuisineTag: CuisineType;
  mealTitle?: string;
  savedAt: string;
  snapshot: RatedRecipeSnapshot;
}

export function recipeKey(sourceMealId: string, sourceSubRecipeId: string | undefined): string {
  return `${sourceMealId}-${sourceSubRecipeId ?? "meal"}`;
}

export interface SavedRecipesState {
  saved: SavedRecipe[];
  toggleSaved: (recipe: Omit<SavedRecipe, "key" | "savedAt">) => boolean;
  remove: (key: string) => void;
}

export const useSavedRecipesStore = create<SavedRecipesState>()(
  persist(
    (set, get) => ({
      saved: [],
      /** Kayıtlıysa çıkarır, değilse ekler. Dönüş: işlemden SONRA kayıtlı mı. */
      toggleSaved: (recipe) => {
        const key = recipeKey(recipe.sourceMealId, recipe.sourceSubRecipeId);
        if (get().saved.some((s) => s.key === key)) {
          set((state) => ({ saved: state.saved.filter((s) => s.key !== key) }));
          return false;
        }
        set((state) => ({ saved: [{ ...recipe, key, savedAt: new Date().toISOString() }, ...state.saved] }));
        return true;
      },
      remove: (key) => set((state) => ({ saved: state.saved.filter((s) => s.key !== key) })),
    }),
    { name: "sofria:v1:saved-recipes", version: 1, skipHydration: true, storage: asyncStorageAdapter }
  )
);
