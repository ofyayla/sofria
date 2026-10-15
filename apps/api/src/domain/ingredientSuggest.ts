import { INGREDIENT_DICTIONARY } from "./ingredients.dictionary.js";
import { normalizeForLookup } from "../utils/trLocale.js";

export interface IngredientSuggestion {
  slug: string;
  displayName: string;
}

/** SDD §4.4: PantryTagInput/AvoidedIngredientsInput'un debounce'lu autocomplete'i buradan beslenir. */
export function suggestIngredients(query: string, limit = 8): IngredientSuggestion[] {
  const q = normalizeForLookup(query);
  if (q.length === 0) return [];

  const seen = new Set<string>();
  const results: IngredientSuggestion[] = [];

  for (const entry of INGREDIENT_DICTIONARY) {
    if (seen.has(entry.slug)) continue;
    const matches =
      normalizeForLookup(entry.displayName).includes(q) || entry.synonyms.some((s) => normalizeForLookup(s).includes(q));
    if (matches) {
      results.push({ slug: entry.slug, displayName: entry.displayName });
      seen.add(entry.slug);
      if (results.length >= limit) break;
    }
  }

  return results;
}
