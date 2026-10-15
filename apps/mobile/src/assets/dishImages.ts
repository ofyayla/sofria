import type { ImageSourcePropType } from "react-native";

/**
 * React Native/Metro statik require() yolları derleme zamanında bilinmeli —
 * dinamik bir require() yolu CALISMAZ. Bu yüzden katalogdaki (bkz.
 * apps/api/src/domain/recipeCatalog.ts) her görsel için burada AÇIK bir
 * eşleme tutulur. Bu liste web tarafındaki public/dish-images/ klasörüyle
 * birebir aynı dosya adlarını kullanır.
 *
 * Kahvaltı tariflerinin bir kısmı (menemen, sucuklu_yumurta vb.) burada YOK
 * — henüz gerçek görselleri üretilmedi. getDishImage() bulamazsa undefined
 * döner, çağıran taraf role ikonuna düşer.
 */
export const DISH_IMAGES: Record<string, ImageSourcePropType> = {
  baharatli_mercimek_corbasi: require("../../assets/images/dishes/baharatli_mercimek_corbasi.jpg"),
  balik_corbasi: require("../../assets/images/dishes/balik_corbasi.jpg"),
  balik_koftesi: require("../../assets/images/dishes/balik_koftesi.jpg"),
  brokoli_corbasi: require("../../assets/images/dishes/brokoli_corbasi.jpg"),
  bulgur_pilavi: require("../../assets/images/dishes/bulgur_pilavi.jpg"),
  cacik: require("../../assets/images/dishes/cacik.jpg"),
  caprese_salata: require("../../assets/images/dishes/caprese_salata.jpg"),
  caprese_tavuk: require("../../assets/images/dishes/caprese_tavuk.jpg"),
  coban_salata: require("../../assets/images/dishes/coban_salata.jpg"),
  dana_rosto: require("../../assets/images/dishes/dana_rosto.jpg"),
  dana_sote: require("../../assets/images/dishes/dana_sote.jpg"),
  domates_corbasi: require("../../assets/images/dishes/domates_corbasi.jpg"),
  etli_biber_dolmasi: require("../../assets/images/dishes/etli_biber_dolmasi.jpg"),
  etli_kuru_fasulye: require("../../assets/images/dishes/etli_kuru_fasulye.jpg"),
  etli_nohut: require("../../assets/images/dishes/etli_nohut.jpg"),
  etsiz_bamya: require("../../assets/images/dishes/etsiz_bamya.jpg"),
  etsiz_musakka: require("../../assets/images/dishes/etsiz_musakka.jpg"),
  ezogelin_corbasi: require("../../assets/images/dishes/ezogelin_corbasi.jpg"),
  firin_kebap: require("../../assets/images/dishes/firin_kebap.jpg"),
  firinda_levrek: require("../../assets/images/dishes/firinda_levrek.jpg"),
  firinda_makarna: require("../../assets/images/dishes/firinda_makarna.jpg"),
  firinda_tavuk_but: require("../../assets/images/dishes/firinda_tavuk_but.jpg"),
  hamsi_tava: require("../../assets/images/dishes/hamsi_tava.jpg"),
  hindi_kavurma: require("../../assets/images/dishes/hindi_kavurma.jpg"),
  hindi_sinitzel: require("../../assets/images/dishes/hindi_sinitzel.jpg"),
  humus_falafel_tabagi: require("../../assets/images/dishes/humus_falafel_tabagi.jpg"),
  humuslu_salata: require("../../assets/images/dishes/humuslu_salata.jpg"),
  imam_bayildi: require("../../assets/images/dishes/imam_bayildi.jpg"),
  ispanak_kavurma: require("../../assets/images/dishes/ispanak_kavurma.jpg"),
  izgara_somon: require("../../assets/images/dishes/izgara_somon.jpg"),
  izgara_tavuk_kanat: require("../../assets/images/dishes/izgara_tavuk_kanat.jpg"),
  izmir_kofte: require("../../assets/images/dishes/izmir_kofte.jpg"),
  kabak_mucver: require("../../assets/images/dishes/kabak_mucver.jpg"),
  karniyarik: require("../../assets/images/dishes/karniyarik.jpg"),
  kisir: require("../../assets/images/dishes/kisir.jpg"),
  kozlenmis_sebze: require("../../assets/images/dishes/kozlenmis_sebze.jpg"),
  kuzu_guvec: require("../../assets/images/dishes/kuzu_guvec.jpg"),
  kuzu_tandir: require("../../assets/images/dishes/kuzu_tandir.jpg"),
  kuzulu_bamya_yahnisi: require("../../assets/images/dishes/kuzulu_bamya_yahnisi.jpg"),
  mantarli_kremali_tavuk: require("../../assets/images/dishes/mantarli_kremali_tavuk.jpg"),
  mercimek_corbasi: require("../../assets/images/dishes/mercimek_corbasi.jpg"),
  mercimek_koftesi: require("../../assets/images/dishes/mercimek_koftesi.jpg"),
  mercimekli_bulgur_pilavi: require("../../assets/images/dishes/mercimekli_bulgur_pilavi.jpg"),
  mevsim_salata: require("../../assets/images/dishes/mevsim_salata.jpg"),
  minestrone: require("../../assets/images/dishes/minestrone.jpg"),
  nohutlu_pilav: require("../../assets/images/dishes/nohutlu_pilav.jpg"),
  osso_buco: require("../../assets/images/dishes/osso_buco.jpg"),
  patates_kizartmasi: require("../../assets/images/dishes/patates_kizartmasi.jpg"),
  patlican_parmigiana: require("../../assets/images/dishes/patlican_parmigiana.jpg"),
  penne_arrabbiata: require("../../assets/images/dishes/penne_arrabbiata.jpg"),
  risotto: require("../../assets/images/dishes/risotto.jpg"),
  roka_salata: require("../../assets/images/dishes/roka_salata.jpg"),
  saksuka: require("../../assets/images/dishes/saksuka.jpg"),
  sarimsakli_yogurt: require("../../assets/images/dishes/sarimsakli_yogurt.jpg"),
  sehriye_corbasi: require("../../assets/images/dishes/sehriye_corbasi.jpg"),
  sehriyeli_pirinc_pilavi: require("../../assets/images/dishes/sehriyeli_pirinc_pilavi.jpg"),
  spagetti_bolonez: require("../../assets/images/dishes/spagetti_bolonez.jpg"),
  tarhana_corbasi: require("../../assets/images/dishes/tarhana_corbasi.jpg"),
  tavuk_parmigiana: require("../../assets/images/dishes/tavuk_parmigiana.jpg"),
  tavuk_savarma: require("../../assets/images/dishes/tavuk_savarma.jpg"),
  tavuk_sis: require("../../assets/images/dishes/tavuk_sis.jpg"),
  tavuk_sote: require("../../assets/images/dishes/tavuk_sote.jpg"),
  tavuklu_guvec: require("../../assets/images/dishes/tavuklu_guvec.jpg"),
  tavuklu_piccata: require("../../assets/images/dishes/tavuklu_piccata.jpg"),
  ton_balikli_salata: require("../../assets/images/dishes/ton_balikli_salata.jpg"),
  turlu: require("../../assets/images/dishes/turlu.jpg"),
  yayla_corbasi: require("../../assets/images/dishes/yayla_corbasi.jpg"),
  zeytinyagli_enginar: require("../../assets/images/dishes/zeytinyagli_enginar.jpg"),
  zeytinyagli_taze_fasulye: require("../../assets/images/dishes/zeytinyagli_taze_fasulye.jpg"),
  zeytinyagli_yaprak_sarma: require("../../assets/images/dishes/zeytinyagli_yaprak_sarma.jpg"),
};

export function getDishImage(imageSlug: string | undefined): ImageSourcePropType | undefined {
  if (!imageSlug) return undefined;
  return DISH_IMAGES[imageSlug];
}
