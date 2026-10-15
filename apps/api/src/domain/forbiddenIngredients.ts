/**
 * Gerçek kullanıcı talebi: hiçbir tarifte domuz eti/ürünü veya alkol
 * ASLA bulunmamalı — bu, kullanıcının kendi "Kurallarım" tercihinden
 * (avoidedIngredients/allergies) BAĞIMSIZ, uygulama genelinde her zaman
 * aktif bir kural. Sabit bir slug listesi yerine anahtar kelime taraması
 * kullanılır çünkü LLM aynı malzemeyi onlarca farklı isimle üretebilir
 * (domuz pastırması, domuz sucuğu, domuz pirzolası, beyaz şarap, kırmızı
 * şarap sosu vb.) — hepsini önceden bir sözlükte listelemek pratik değil.
 */
const FORBIDDEN_KEYWORDS = [
  // Domuz eti/ürünleri — "domuz" kökü tüm türevleri (pastırma, sucuk,
  // pirzola, jambon, but vb.) yakalar.
  "domuz",
  "bacon",
  "beykın",
  "beykin",
  // Alkol
  "şarap",
  "bira",
  "rakı",
  "votka",
  "viski",
  "konyak",
  "likör",
  "alkol",
] as const;

/** Eşleşen anahtar kelimeyi döner, yoksa null — post-check mesajında kullanılır. */
export function findForbiddenKeyword(displayName: string): string | null {
  const normalized = displayName.toLocaleLowerCase("tr-TR");
  return FORBIDDEN_KEYWORDS.find((keyword) => normalized.includes(keyword)) ?? null;
}
