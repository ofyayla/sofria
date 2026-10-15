import { resolveIngredient } from "../domain/ingredients.dictionary.js";

/** Serbest metin malzeme listesini (chip'lerden gelen) canonical slug'lara çevirir, dedupe+sıralar. */
export function normalizeSlugSet(list: string[]): string[] {
  const slugs = list.map((raw) => resolveIngredient(raw).slug);
  return dedupeSort(slugs);
}

export function dedupeSort<T extends string>(list: T[]): T[] {
  return Array.from(new Set(list)).sort() as T[];
}
