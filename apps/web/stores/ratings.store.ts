import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CuisineType, RecipeRating } from "@sofria/shared";

export interface RatingsState {
  ratings: RecipeRating[];
  addRating: (rating: RecipeRating) => void;
  removeRating: (ratingId: string) => void;
  getByCuisine: (cuisine: CuisineType) => RecipeRating[];
}

/** SDD §3.7: kaynak plan silinse bile bu kayıt kendi başına anlamlı kalır (denormalize). */
export const useRatingsStore = create<RatingsState>()(
  persist(
    (set, get) => ({
      ratings: [],
      addRating: (rating) => set((state) => ({ ratings: [rating, ...state.ratings] })),
      removeRating: (ratingId) => set((state) => ({ ratings: state.ratings.filter((r) => r.ratingId !== ratingId) })),
      getByCuisine: (cuisine) => get().ratings.filter((r) => r.cuisineTag === cuisine),
    }),
    { name: "sofria:v1:ratings", version: 1, skipHydration: true }
  )
);
