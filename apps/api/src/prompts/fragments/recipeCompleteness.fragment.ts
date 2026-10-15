/**
 * Gerçek kullanıcı talebi: "kıymalı Karadeniz pidesi" tarifinde malzemelerde
 * un ve maya var ama su miktarı YOK; talimatta da "un ve maya ile yumuşak
 * bir hamur yoğurup 20 dk dinlendirin" deniyor, su miktarı hiç belirtilmiyor.
 * Tarif, malzeme listesi + talimatları okuyan birinin başka hiçbir kaynağa
 * bakmadan uygulayabileceği kadar TAM olmalı — miktarı belirsiz bırakılan
 * malzemeler (özellikle su/sıvı) tarifi kullanılamaz hale getiriyor.
 */
export function buildRecipeCompletenessFragment(): string {
  return [
    "TARİF TAMLIĞI (ÇOK ÖNEMLİ):",
    "- Talimatlarda (instructions) adı geçen HER malzeme — SU DAHİL — 'ingredients' listesinde somut bir miktar (amount) ve birimle (unit) yer almalı. 'Yumuşak bir hamur yoğurun' gibi miktar belirtmeyen ifadeler YETERSİZDİR; suyun/sıvının yaklaşık miktarını (örn. '150 ml su') hem ingredients listesine hem ilgili talimat adımına yaz.",
    "- Bir malzemenin kesin miktarı pişirenin kıvamına göre değişebiliyorsa bile (örn. hamur için su), yine de başlangıç için somut bir miktar ver ve gerekirse 'gerekirse azar azar ekleyin' gibi bir not düş — miktarı tamamen ATLAMA.",
    "- Talimatlar; malzeme listesi ve talimatlar dışında hiçbir bilgiye ihtiyaç duymadan uygulanabilecek kadar SOMUT olmalı: net süre, sıcaklık, miktar ve teknik adım içermeli, muğlak ifadelerden kaçınmalı.",
  ].join("\n");
}
