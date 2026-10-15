import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { suggestIngredients } from "../engine";

export interface IngredientSuggestion {
  slug: string;
  displayName: string;
}

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
      return suggestIngredients(debouncedQuery);
    },
    enabled: debouncedQuery.trim().length >= MIN_QUERY_LENGTH,
    staleTime: 5 * 60_000,
  });
}
