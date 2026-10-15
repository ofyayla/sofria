/**
 * SDD §1.2: "Şema uyumsuz → 1 kez onarım turu (hata metni geri beslenir)".
 * Bu fonksiyon, bir önceki hatalı yanıtı ve Zod'un ürettiği hata mesajını
 * modele geri vererek "şunu düzelt" diyen ikinci bir prompt üretir.
 */
export function buildRepairPrompt(params: {
  originalUserPrompt: string;
  invalidResponseText: string;
  validationErrorMessage: string;
}): string {
  return [
    params.originalUserPrompt,
    "",
    "---",
    "ÖNEMLİ: Bir önceki yanıtın istenen JSON şemasına uymuyordu.",
    "",
    "Önceki (hatalı) yanıtın:",
    params.invalidResponseText,
    "",
    "Doğrulama hatası:",
    params.validationErrorMessage,
    "",
    "Lütfen YALNIZCA yukarıdaki hatayı düzelten, şemaya tam uyan geçerli bir JSON",
    "ile yeniden yanıt ver. Açıklama, markdown kod bloğu veya başka metin ekleme.",
  ].join("\n");
}

/**
 * SDD §1.2: "Kural ihlali → hedefli düzeltme turu". Bu, buildRepairPrompt'tan
 * FARKLI bir sorun sınıfını çözer: yanıt şemaya UYUYOR ama iş kuralını
 * (kaçınılan malzeme, ekipman, çeşit sayısı) ihlal ediyor.
 *
 * Basitleştirme notu: SDD ideal senaryoda yalnızca ihlal eden öğünü yeniden
 * üretmeyi tarif eder. Bu sürümde tüm planı, ihlallerin listesiyle birlikte
 * yeniden üretiyoruz — daha basit, hâlâ doğru, ama token açısından daha
 * maliyetli. Yalnızca-ihlal-eden-öğün optimizasyonu gelecek bir iyileştirme.
 */
export function buildCorrectivePrompt(params: {
  originalUserPrompt: string;
  violations: string[];
}): string {
  return [
    params.originalUserPrompt,
    "",
    "---",
    "ÖNEMLİ: Bir önceki planın bazı kuralları ihlal ediyordu. Aşağıdaki ihlalleri",
    "DÜZELTEREK, tüm planı (7 gün, tüm öğünler) yeniden üret:",
    "",
    ...params.violations.map((v) => `- ${v}`),
    "",
    "Diğer her şey (kısıtlar, format) yukarıdaki gibi geçerli. Yalnızca JSON döndür.",
  ].join("\n");
}
