import { createHash } from "node:crypto";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/**
 * Obje anahtarlarını alfabetik sıraya sokar ki `{a:1,b:2}` ile `{b:2,a:1}`
 * aynı hash'i üretsin — SDD §1: "aynı tercihin farklı yazımı farklı cacheKey
 * üretirse önbellek çöker" riskinin bir parçası.
 *
 * NOT: Dizi SIRASI korunur, sıralanmaz. Örn. cuisinePreferences'ın tutarlı
 * sırada gelmesi Normalizer'ın (F5) sorumluluğudur — burada değil.
 */
function sortKeysDeep(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value !== null && typeof value === "object") {
    const sorted: Record<string, JsonValue> = {};
    for (const key of Object.keys(value).sort((a, b) => a.localeCompare(b))) {
      sorted[key] = sortKeysDeep(value[key] as JsonValue);
    }
    return sorted;
  }
  return value;
}

export function canonicalize(payload: JsonValue): string {
  return JSON.stringify(sortKeysDeep(payload));
}

export function hashPayload(payload: JsonValue): string {
  return createHash("sha256").update(canonicalize(payload)).digest("hex").slice(0, 16);
}

export interface CacheKeyParams {
  schemaVersion: number;
  promptVersion: string;
  mode: "weekly_plan" | "quick_meal";
  payload: JsonValue;
}

/**
 * SDD §1.4 format: v{schemaVersion}:p{promptVersion}:{mode}:{hash16}
 * promptVersion arttığında (prompt değiştiğinde) eski formatlı kayıtlar
 * otomatik olarak "farklı anahtar" sayılır — hayalet bug riski budur (SDD §1.2).
 */
export function buildCacheKey(params: CacheKeyParams): string {
  return `v${params.schemaVersion}:p${params.promptVersion}:${params.mode}:${hashPayload(params.payload)}`;
}
