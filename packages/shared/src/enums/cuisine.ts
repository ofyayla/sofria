/**
 * SDD §3.3: Mod 1'de kullanıcı birden fazla mutfak seçebilir; hafta bu
 * mutfaklar arasında dengeli dağıtılır (bkz. prompts/fragments/cuisine.fragment.ts — F4).
 * Bu bir KISIT değil TERCİHTİR — post-check ile sıkı denetlenmez (bkz. SDD §1.2 notu).
 */
export const CUISINE_TYPES = [
  "kirmizi_et",
  "beyaz_et",
  "balik_urunleri",
  "sebze_yemekleri",
  "ortadogu_mutfagi",
  "italyan_mutfagi",
] as const;

export type CuisineType = (typeof CUISINE_TYPES)[number];
