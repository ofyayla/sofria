/**
 * Gerçek kullanıcı talebi: domuz eti/ürünü ve alkol, kullanıcının kendi
 * tercihinden (dietary alanı) BAĞIMSIZ olarak HİÇBİR tarifte olmamalı.
 * Bu yüzden `buildDietaryFragment` gibi koşullu değil, HER İSTEKTE
 * (kullanıcı ne seçerse seçsin) değişmeden eklenir. Deterministik güvenlik
 * ağı için bkz. domain/forbiddenIngredients.ts + planPostCheck.ts.
 */
export function buildMandatoryRestrictionsFragment(): string {
  return [
    "ZORUNLU KISIT (kullanıcı tercihinden bağımsız, HER ZAMAN geçerli, İSTİSNASIZ):",
    "- Hiçbir tarifte domuz eti veya domuz ürünü (domuz pastırması, domuz sucuğu, domuz jambonu, bacon vb.) KULLANMA.",
    "- Hiçbir tarifte alkol veya alkollü içerik (şarap, bira, rakı, votka, viski, likör vb.) KULLANMA — pişirirken alkolün buharlaştığı gerekçesiyle bile ekleme.",
  ].join("\n");
}
