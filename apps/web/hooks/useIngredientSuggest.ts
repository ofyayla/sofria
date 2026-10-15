import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export interface IngredientSuggestion {
  slug: string;
  displayName: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";
const DEBOUNCE_MS = 200;
const MIN_QUERY_LENGTH = 2;

/** SDD §4.4: PantryTagInput/AvoidedIngredientsInput'un debounce'lu autocomplete kaynağı. */
export function useIngredientSuggest(rawQuery: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(rawQuery);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(rawQuery), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [rawQuery]);

  return useQuery({
    queryKey: ["ingredient-suggest", debouncedQuery],
    queryFn: async (): Promise<IngredientSuggestion[]> => {
      const res = await fetch(`${API_BASE_URL}/ingredients/suggest?q=${encodeURIComponent(debouncedQuery)}`);
      const json = (await res.json()) as { ok: boolean; data: IngredientSuggestion[] };
      return json.ok ? json.data : [];
    },
    enabled: debouncedQuery.trim().length >= MIN_QUERY_LENGTH,
    staleTime: 5 * 60_000,
  });
}
