/**
 * JS'in standart `.toLowerCase()`'i Türkçe İ/I çiftini yanlış çevirir
 * ("İstanbul".toLowerCase() → "i̇stanbul", noktalı gizli karakterle).
 * Malzeme eşlemesinde bu, "Isırgan" ile "ısırgan"ın farklı slug'a
 * düşmesine yol açar. Bu yüzden normalizasyon HER YERDE bu fonksiyondan geçer.
 */
export function trLower(input: string): string {
  return input
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLowerCase();
}

/**
 * Malzeme/sözlük eşlemesi için giriş normalizasyonu:
 * TR-lower + trim + iç boşlukları teke indirme + noktalama temizliği.
 * Slug üretiminin TEK giriş noktası budur — cacheKey stabilitesi buna bağlıdır (SDD §1).
 */
export function normalizeForLookup(input: string): string {
  return trLower(input)
    .trim()
    .replace(/[.,;:!?'"()]/g, "")
    .replace(/\s+/g, " ");
}

/** Görüntü metni → slug: boşlukları alt çizgiye çevirir. */
export function toSlug(input: string): string {
  return normalizeForLookup(input).replace(/\s+/g, "_");
}
