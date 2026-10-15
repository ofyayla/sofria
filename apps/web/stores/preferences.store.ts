import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CuisineType, DietaryConstraints, EquipmentConstraints, MealComplexity } from "@sofria/shared";
import { createMigrate, type MigrationMap } from "../lib/persist.migrations";

export type MealType = "kahvalti" | "ogle" | "aksam";

export interface PreferencesDraftState {
  householdAdults: number;
  /**
   * Gerçek kullanıcı talebi: çocukların porsiyonu yetişkinlerden küçük
   * olmalı. Yetişkin sayısı için yaş istenmez (portion mantığına etkisi
   * yok) — yalnızca çocuk sayısı kadar yaş girişi açılır (bkz. setChildCount).
   * Dizinin uzunluğu her zaman householdChildren ile eşleşir.
   */
  householdChildren: number;
  childAges: (number | undefined)[];
  mealComplexity: { lunch: MealComplexity | undefined; dinner: MealComplexity | undefined };
  includedMeals: MealType[];
  cuisinePreferences: CuisineType[];
  /**
   * SDD §4.2: "bu seferlik mantar olsun" gibi TEK SEFERLİK geçersiz kılmalar.
   * `rulesProfile.store`'a ASLA yazılmaz — yalnızca bir sonraki plan
   * isteğinde `mergeConstraints` ile birleştirilir (bkz. lib/mergeConstraints.ts).
   */
  sessionDietaryOverrides: Partial<DietaryConstraints>;
  sessionEquipmentOverrides: Partial<EquipmentConstraints>;

  setHouseholdAdults: (count: number) => void;
  setHouseholdChildren: (count: number) => void;
  setChildAge: (index: number, age: number) => void;
  setMealComplexity: (part: Partial<{ lunch: MealComplexity | undefined; dinner: MealComplexity | undefined }>) => void;
  toggleIncludedMeal: (meal: MealType) => void;
  toggleCuisine: (cuisine: CuisineType) => void;
  setSessionDietaryOverride: (partial: Partial<DietaryConstraints>) => void;
  setSessionEquipmentOverride: (partial: Partial<EquipmentConstraints>) => void;
  clearSessionOverrides: () => void;
}

const DEFAULTS = {
  householdAdults: 2,
  householdChildren: 0,
  childAges: [] as (number | undefined)[],
  mealComplexity: { lunch: undefined as MealComplexity | undefined, dinner: undefined as MealComplexity | undefined },
  includedMeals: [] as MealType[],
  cuisinePreferences: [] as CuisineType[],
};

interface PreferencesPersistedShape {
  householdAdults: number;
  householdChildren: number;
  childAges: (number | undefined)[];
}

const PERSISTED_DEFAULTS: PreferencesPersistedShape = {
  householdAdults: DEFAULTS.householdAdults,
  householdChildren: DEFAULTS.householdChildren,
  childAges: DEFAULTS.childAges,
};

// v1 (eski tek-alanlı householdSize/householdAges tasarımı) → v2 (yetişkin/çocuk
// ayrımı): eski kayıt formu artık uyuşmuyor, sessizce temiz varsayılana dönülür.
const migrations: MigrationMap = {
  1: (): PreferencesPersistedShape => PERSISTED_DEFAULTS,
};

export const usePreferencesStore = create<PreferencesDraftState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      sessionDietaryOverrides: {},
      sessionEquipmentOverrides: {},

      setHouseholdAdults: (count) => set({ householdAdults: count }),
      setHouseholdChildren: (count) =>
        set((state) => {
          const ages = state.childAges.slice(0, count);
          while (ages.length < count) ages.push(undefined);
          return { householdChildren: count, childAges: ages };
        }),
      setChildAge: (index, age) =>
        set((state) => {
          const ages = [...state.childAges];
          ages[index] = age;
          return { childAges: ages };
        }),
      setMealComplexity: (part) => set((state) => ({ mealComplexity: { ...state.mealComplexity, ...part } })),
      toggleIncludedMeal: (meal) =>
        set((state) => ({
          includedMeals: state.includedMeals.includes(meal)
            ? state.includedMeals.filter((m) => m !== meal)
            : [...state.includedMeals, meal],
        })),
      toggleCuisine: (cuisine) =>
        set((state) => ({
          cuisinePreferences: state.cuisinePreferences.includes(cuisine)
            ? state.cuisinePreferences.filter((c) => c !== cuisine)
            : [...state.cuisinePreferences, cuisine],
        })),
      setSessionDietaryOverride: (partial) =>
        set((state) => ({ sessionDietaryOverrides: { ...state.sessionDietaryOverrides, ...partial } })),
      setSessionEquipmentOverride: (partial) =>
        set((state) => ({ sessionEquipmentOverrides: { ...state.sessionEquipmentOverrides, ...partial } })),
      clearSessionOverrides: () => set({ sessionDietaryOverrides: {}, sessionEquipmentOverrides: {} }),
    }),
    {
      name: "sofria:v1:preferences",
      version: 2,
      skipHydration: true,
      /**
       * Gerçek kullanıcı testinde bulundu: budgetLevel/mealComplexity/
       * includedMeals/cuisinePreferences LocalStorage'a yazılıp geri yüklenirse,
       * kullanıcı yeni bir sihirbaz oturumuna başladığında önceki oturumdan kalan
       * seçimlerle "zaten seçilmiş" görünüyordu — tam olarak istenmeyen davranış.
       * Yalnızca gerçekten kalıcı olması istenen (hane büyüklüğü) alanlar
       * persist edilir; geri kalan her sihirbaz açılışında boş başlar.
       */
      partialize: (state): PreferencesPersistedShape => ({
        householdAdults: state.householdAdults,
        householdChildren: state.householdChildren,
        childAges: state.childAges,
      }),
      migrate: createMigrate(migrations, PERSISTED_DEFAULTS),
    }
  )
);
