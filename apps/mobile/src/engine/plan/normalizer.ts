import type { UserPreferencesPayload } from "@sofria/shared";
import { dedupeSort, normalizeSlugSet } from "../utils/normalizeHelpers";

/**
 * SDD §1.2: "küçük harf · trim · TR-locale sıralama · malzeme slug'lama ·
 * alan sırası sabitleme". Aynı tercihin farklı yazımı/sırası farklı bir
 * cacheKey üretmesin diye bu fonksiyon LLM'e gitmeden ÖNCE çalışır.
 */
export function normalizePreferences(payload: UserPreferencesPayload): UserPreferencesPayload {
  return {
    ...payload,
    dietary: {
      ...payload.dietary,
      avoidedIngredients: normalizeSlugSet(payload.dietary.avoidedIngredients),
      allergies: normalizeSlugSet(payload.dietary.allergies),
    },
    includedMeals: dedupeSort(payload.includedMeals),
    cuisinePreferences: dedupeSort(payload.cuisinePreferences),
  };
}
