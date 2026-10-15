export function buildOutputFormatFragment(): string {
  return [
    "ÇIKTI FORMATI:",
    "- SADECE geçerli JSON döndür. Markdown kod bloğu (```), açıklama metni,",
    "  giriş/kapanış cümlesi EKLEME.",
    "- Yanıtın ilk karakteri `{` , son karakteri `}` olmalı.",
  ].join("\n");
}
