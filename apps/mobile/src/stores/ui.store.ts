import { create } from "zustand";

export interface UiState {
  activeDayIndex: number;
  openRecipeModalId: string | null;
  setActiveDayIndex: (index: number) => void;
  openRecipeModal: (subRecipeId: string) => void;
  closeRecipeModal: () => void;
}

/** SDD §4.2: `ui.store` BİLEREK kalıcı değil — geçici; kalıcılık kafa karıştırır. */
export const useUiStore = create<UiState>()((set) => ({
  activeDayIndex: 0,
  openRecipeModalId: null,
  setActiveDayIndex: (index) => set({ activeDayIndex: index }),
  openRecipeModal: (subRecipeId) => set({ openRecipeModalId: subRecipeId }),
  closeRecipeModal: () => set({ openRecipeModalId: null }),
}));
