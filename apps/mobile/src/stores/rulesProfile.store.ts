import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DietaryConstraints, EquipmentConstraints } from "@sofria/shared";
import { asyncStorageAdapter } from "../lib/storage.adapter";
import { createMigrate } from "../lib/persist.migrations";

const DEFAULT_DIETARY: DietaryConstraints = {
  glutenFree: false,
  lactoseFree: false,
  vegetarian: false,
  vegan: false,
  avoidedIngredients: [],
  allergies: [],
};

// Gerçek kullanıcı testinde bulundu: hasOven=true varsayılanı, sihirbazın
// ekipman adımında kullanıcı hiçbir şey seçmeden "Fırın var" seçili
// gösteriyordu. Hiçbir alan artık varsayılan olarak seçili gelmiyor —
// kullanıcı "Kurallarım"da veya sihirbazda açıkça seçmek zorunda.
const DEFAULT_EQUIPMENT: EquipmentConstraints = {
  hasOven: false,
  hasAirFryer: false,
  hasPressureCooker: false,
  hasBlender: false,
  stovetopOnly: false,
};

export interface RulesProfileState {
  dietary: DietaryConstraints;
  equipment: EquipmentConstraints;
  /**
   * PRD §5.1: değişiklik anında kaydedilir, ayrı "Kaydet" butonu yok.
   * Her set* çağrısı doğrudan AsyncStorage'a yazılır (persist middleware).
   */
  setDietary: (dietary: Partial<DietaryConstraints>) => void;
  setEquipment: (equipment: Partial<EquipmentConstraints>) => void;
  addAvoidedIngredient: (slug: string) => void;
  removeAvoidedIngredient: (slug: string) => void;
  addAllergy: (slug: string) => void;
  removeAllergy: (slug: string) => void;
}

interface RulesProfilePersistedShape {
  dietary: DietaryConstraints;
  equipment: EquipmentConstraints;
}

const migrations = {
  0: (old: unknown): RulesProfilePersistedShape => {
    const legacy = old as { glutenFree?: boolean; avoidedIngredients?: string[]; hasOven?: boolean };
    return {
      dietary: { ...DEFAULT_DIETARY, glutenFree: legacy.glutenFree ?? false, avoidedIngredients: legacy.avoidedIngredients ?? [] },
      equipment: { ...DEFAULT_EQUIPMENT, hasOven: legacy.hasOven ?? true, stovetopOnly: legacy.hasOven === false },
    };
  },
};

export const useRulesProfileStore = create<RulesProfileState>()(
  persist(
    (set) => ({
      dietary: DEFAULT_DIETARY,
      equipment: DEFAULT_EQUIPMENT,

      setDietary: (partial) => set((state) => ({ dietary: { ...state.dietary, ...partial } })),
      setEquipment: (partial) => set((state) => ({ equipment: { ...state.equipment, ...partial } })),

      addAvoidedIngredient: (slug) =>
        set((state) => ({
          dietary: {
            ...state.dietary,
            avoidedIngredients: state.dietary.avoidedIngredients.includes(slug)
              ? state.dietary.avoidedIngredients
              : [...state.dietary.avoidedIngredients, slug],
          },
        })),
      removeAvoidedIngredient: (slug) =>
        set((state) => ({
          dietary: { ...state.dietary, avoidedIngredients: state.dietary.avoidedIngredients.filter((s) => s !== slug) },
        })),

      addAllergy: (slug) =>
        set((state) => ({
          dietary: {
            ...state.dietary,
            allergies: state.dietary.allergies.includes(slug) ? state.dietary.allergies : [...state.dietary.allergies, slug],
          },
        })),
      removeAllergy: (slug) =>
        set((state) => ({ dietary: { ...state.dietary, allergies: state.dietary.allergies.filter((s) => s !== slug) } })),
    }),
    {
      name: "sofria:v1:rulesProfile",
      version: 1,
      skipHydration: true,
      storage: asyncStorageAdapter,
      migrate: createMigrate(migrations, { dietary: DEFAULT_DIETARY, equipment: DEFAULT_EQUIPMENT }),
    }
  )
);
