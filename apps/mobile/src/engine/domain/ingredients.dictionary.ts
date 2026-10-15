import type { Aisle } from "@sofria/shared";
import { normalizeForLookup } from "../utils/trLocale";

export interface IngredientDictionaryEntry {
  slug: string;
  displayName: string;
  aisle: Aisle;
  /** SDD §3.2: pantry.staple olarak işaretli malzemeler Mod 2'de "elinizde var" varsayılır. */
  isPantryStaple: boolean;
  /** Normalize edilmemiş, insan tarafından yazılan varyasyonlar. */
  synonyms: string[];
  /**
   * Gerçek kullanıcı testinde bulundu: LLM tereyağı/un/salça/baharat gibi
   * katı malzemeleri "yemek kaşığı" ile ölçünce, bu birim varsayılan olarak
   * hacim (ml) ailesine düştüğü için alışveriş listesinde "210 ml Tereyağı"
   * gibi anlamsız satırlar oluşuyordu. Bu malzemeler ("weight") kaşık/bardak
   * birimleri kullansa bile alışveriş listesinde HER ZAMAN gram/kg olarak
   * gösterilir (bkz. units.converter.ts WEIGHT_PREFERRED_FACTOR). Belirtilmezse
   * birimin kendi doğal ailesi kullanılır (süt/yağ gibi gerçek sıvılar için doğru).
   */
  unitClass?: "weight" | "volume";
}

/**
 * SDD §1.3 / §2.2 ingredients.dictionary.ts.
 * PantryTagInput ve AvoidedIngredientsInput chip'e dönüştürürken bu sözlükten
 * geçer — "tavuk göğsü", "tavuk gögsü", "göğüs eti" hepsi `tavuk_gogsu` olur.
 */
export const INGREDIENT_DICTIONARY: IngredientDictionaryEntry[] = [
  // — Manav —
  { slug: "sogan", displayName: "Kuru soğan", aisle: "sebze", isPantryStaple: true, synonyms: ["soğan", "sogan", "kuru soğan", "kuru sogan"] },
  { slug: "sarimsak", displayName: "Sarımsak", aisle: "sebze", isPantryStaple: true, synonyms: ["sarımsak", "sarimsak"] },
  { slug: "domates", displayName: "Domates", aisle: "sebze", isPantryStaple: false, synonyms: ["domates", "domatez"] },
  { slug: "salatalik", displayName: "Salatalık", aisle: "sebze", isPantryStaple: false, synonyms: ["salatalık", "salatalik", "hıyar", "hiyar"] },
  { slug: "biber_yesil", displayName: "Yeşil biber", aisle: "sebze", isPantryStaple: false, synonyms: ["yeşil biber", "yesil biber", "sivri biber"] },
  { slug: "biber_kirmizi", displayName: "Kırmızı biber", aisle: "sebze", isPantryStaple: false, synonyms: ["kırmızı biber", "kirmizi biber"] },
  { slug: "patates", displayName: "Patates", aisle: "sebze", isPantryStaple: false, synonyms: ["patates"] },
  { slug: "havuc", displayName: "Havuç", aisle: "sebze", isPantryStaple: false, synonyms: ["havuç", "havuc"] },
  { slug: "maydanoz", displayName: "Maydanoz", aisle: "sebze", isPantryStaple: false, synonyms: ["maydanoz"] },
  { slug: "dereotu", displayName: "Dereotu", aisle: "sebze", isPantryStaple: false, synonyms: ["dereotu", "dere otu"] },
  { slug: "limon", displayName: "Limon", aisle: "meyve", isPantryStaple: false, synonyms: ["limon"] },
  { slug: "patlican", displayName: "Patlıcan", aisle: "sebze", isPantryStaple: false, synonyms: ["patlıcan", "patlican"] },
  { slug: "kabak", displayName: "Kabak", aisle: "sebze", isPantryStaple: false, synonyms: ["kabak"] },
  { slug: "ispanak", displayName: "Ispanak", aisle: "sebze", isPantryStaple: false, synonyms: ["ıspanak", "ispanak"] },
  { slug: "mantar", displayName: "Mantar", aisle: "sebze", isPantryStaple: false, synonyms: ["mantar", "champignon"] },
  { slug: "elma", displayName: "Elma", aisle: "meyve", isPantryStaple: false, synonyms: ["elma"] },
  { slug: "muz", displayName: "Muz", aisle: "meyve", isPantryStaple: false, synonyms: ["muz"] },

  // — Kasap & Şarküteri —
  { slug: "tavuk_gogsu", displayName: "Tavuk göğsü", aisle: "beyaz_et", isPantryStaple: false, synonyms: ["tavuk göğsü", "tavuk gögsü", "tavuk gogsu", "göğüs eti", "gogus eti"] },
  { slug: "tavuk_but", displayName: "Tavuk but", aisle: "beyaz_et", isPantryStaple: false, synonyms: ["tavuk but", "but eti"] },
  { slug: "kiyma", displayName: "Kıyma", aisle: "kirmizi_et", isPantryStaple: false, synonyms: ["kıyma", "kiyma", "dana kıyma", "kuzu kıyma"] },
  { slug: "kusbasi", displayName: "Kuşbaşı et", aisle: "kirmizi_et", isPantryStaple: false, synonyms: ["kuşbaşı", "kusbasi", "kuşbaşı et"] },
  { slug: "sucuk", displayName: "Sucuk", aisle: "kirmizi_et", isPantryStaple: false, synonyms: ["sucuk"] },
  { slug: "sosis", displayName: "Sosis", aisle: "kirmizi_et", isPantryStaple: false, synonyms: ["sosis"] },
  { slug: "pastirma", displayName: "Pastırma", aisle: "kirmizi_et", isPantryStaple: false, synonyms: ["pastırma", "pastirma"] },
  { slug: "balik_levrek", displayName: "Levrek", aisle: "balik", isPantryStaple: false, synonyms: ["levrek", "levrek balığı"] },

  // — Süt & Kahvaltılık —
  { slug: "yogurt", displayName: "Yoğurt", aisle: "sut_urunleri", isPantryStaple: false, synonyms: ["yoğurt", "yogurt", "yougurt"], unitClass: "weight" },
  { slug: "yumurta", displayName: "Yumurta", aisle: "yumurta", isPantryStaple: true, synonyms: ["yumurta"] },
  { slug: "sut", displayName: "Süt", aisle: "sut_urunleri", isPantryStaple: false, synonyms: ["süt", "sut"] },
  { slug: "beyaz_peynir", displayName: "Beyaz peynir", aisle: "sut_urunleri", isPantryStaple: false, synonyms: ["beyaz peynir"], unitClass: "weight" },
  { slug: "kasar", displayName: "Kaşar peyniri", aisle: "sut_urunleri", isPantryStaple: false, synonyms: ["kaşar", "kasar", "kaşar peyniri"], unitClass: "weight" },
  { slug: "tereyagi", displayName: "Tereyağı", aisle: "sut_urunleri", isPantryStaple: true, synonyms: ["tereyağı", "tereyagi", "tereyağ"], unitClass: "weight" },
  { slug: "krema", displayName: "Krema", aisle: "sut_urunleri", isPantryStaple: false, synonyms: ["krema", "kaymak"] },
  { slug: "lor_peyniri", displayName: "Lor peyniri", aisle: "sut_urunleri", isPantryStaple: false, synonyms: ["lor", "lor peyniri"], unitClass: "weight" },

  // — Bakliyat & Pirinç —
  { slug: "pirinc", displayName: "Pirinç", aisle: "bakliyat", isPantryStaple: true, synonyms: ["pirinç", "pirinc"], unitClass: "weight" },
  { slug: "bulgur", displayName: "Bulgur", aisle: "bakliyat", isPantryStaple: true, synonyms: ["bulgur"], unitClass: "weight" },
  { slug: "nohut", displayName: "Nohut", aisle: "bakliyat", isPantryStaple: false, synonyms: ["nohut"], unitClass: "weight" },
  { slug: "kirmizi_mercimek", displayName: "Kırmızı mercimek", aisle: "bakliyat", isPantryStaple: false, synonyms: ["kırmızı mercimek", "kirmizi mercimek"], unitClass: "weight" },
  { slug: "yesil_mercimek", displayName: "Yeşil mercimek", aisle: "bakliyat", isPantryStaple: false, synonyms: ["yeşil mercimek", "yesil mercimek"], unitClass: "weight" },
  { slug: "kuru_fasulye", displayName: "Kuru fasulye", aisle: "bakliyat", isPantryStaple: false, synonyms: ["kuru fasulye", "fasulye"], unitClass: "weight" },

  // — Un / Makarna —
  { slug: "un", displayName: "Buğday unu", aisle: "unlu_mamuller", isPantryStaple: true, synonyms: ["un", "buğday unu", "bugday unu"], unitClass: "weight" },
  { slug: "misir_nisastasi", displayName: "Mısır nişastası", aisle: "unlu_mamuller", isPantryStaple: true, synonyms: ["mısır nişastası", "misir nisastasi", "nişasta"], unitClass: "weight" },
  { slug: "makarna", displayName: "Makarna", aisle: "unlu_mamuller", isPantryStaple: true, synonyms: ["makarna", "spagetti"], unitClass: "weight" },
  { slug: "glutensiz_un", displayName: "Glutensiz un karışımı", aisle: "unlu_mamuller", isPantryStaple: false, synonyms: ["glutensiz un", "gluten free un"], unitClass: "weight" },

  // — Konserve / Salça —
  { slug: "domates_salcasi", displayName: "Domates salçası", aisle: "konserve_salca", isPantryStaple: true, synonyms: ["domates salçası", "domates salcasi", "salça", "salca"], unitClass: "weight" },
  { slug: "biber_salcasi", displayName: "Biber salçası", aisle: "konserve_salca", isPantryStaple: false, synonyms: ["biber salçası", "biber salcasi"], unitClass: "weight" },
  { slug: "konserve_domates", displayName: "Konserve domates", aisle: "konserve_salca", isPantryStaple: false, synonyms: ["konserve domates"], unitClass: "weight" },

  // — Yağ / Sirke / Sos —
  { slug: "zeytinyagi", displayName: "Zeytinyağı", aisle: "yag_sirke_sos", isPantryStaple: true, synonyms: ["zeytinyağı", "zeytinyagi"] },
  { slug: "ayciceki_yagi", displayName: "Ayçiçek yağı", aisle: "yag_sirke_sos", isPantryStaple: true, synonyms: ["ayçiçek yağı", "aycicek yagi", "sıvı yağ", "sivi yag"] },
  { slug: "sirke", displayName: "Sirke", aisle: "yag_sirke_sos", isPantryStaple: true, synonyms: ["sirke"] },
  { slug: "soya_sosu", displayName: "Soya sosu", aisle: "yag_sirke_sos", isPantryStaple: false, synonyms: ["soya sosu"] },

  // — Baharat —
  { slug: "tuz", displayName: "Tuz", aisle: "baharat", isPantryStaple: true, synonyms: ["tuz"], unitClass: "weight" },
  { slug: "karabiber", displayName: "Karabiber", aisle: "baharat", isPantryStaple: true, synonyms: ["karabiber", "kara biber"], unitClass: "weight" },
  { slug: "pul_biber", displayName: "Pul biber", aisle: "baharat", isPantryStaple: true, synonyms: ["pul biber"], unitClass: "weight" },
  { slug: "kimyon", displayName: "Kimyon", aisle: "baharat", isPantryStaple: true, synonyms: ["kimyon"], unitClass: "weight" },
  { slug: "nane", displayName: "Kuru nane", aisle: "baharat", isPantryStaple: true, synonyms: ["nane", "kuru nane"], unitClass: "weight" },

  // — Ekmek & Fırın —
  { slug: "ekmek", displayName: "Ekmek", aisle: "unlu_mamuller", isPantryStaple: false, synonyms: ["ekmek"] },
  { slug: "lavas", displayName: "Lavaş", aisle: "unlu_mamuller", isPantryStaple: false, synonyms: ["lavaş", "lavas"] },

  // — Dondurulmuş —
  { slug: "dondurulmus_bezelye", displayName: "Dondurulmuş bezelye", aisle: "dondurulmus", isPantryStaple: false, synonyms: ["dondurulmuş bezelye", "bezelye"] },
  { slug: "dondurulmus_karisik_sebze", displayName: "Dondurulmuş karışık sebze", aisle: "dondurulmus", isPantryStaple: false, synonyms: ["dondurulmuş karışık sebze", "karışık sebze"] },

  // — İçecek —
  { slug: "su", displayName: "Su", aisle: "icecek", isPantryStaple: true, synonyms: ["su"] },

  // — Temel Gıda —
  { slug: "seker", displayName: "Toz şeker", aisle: "temel_gida", isPantryStaple: true, synonyms: ["şeker", "seker", "toz şeker"], unitClass: "weight" },
  { slug: "kabartma_tozu", displayName: "Kabartma tozu", aisle: "temel_gida", isPantryStaple: true, synonyms: ["kabartma tozu"], unitClass: "weight" },
  { slug: "yumurta_tozu", displayName: "Vanilya", aisle: "temel_gida", isPantryStaple: false, synonyms: ["vanilya", "vanilin"], unitClass: "weight" },
];

const LOOKUP_INDEX: Map<string, IngredientDictionaryEntry> = new Map();
for (const entry of INGREDIENT_DICTIONARY) {
  for (const synonym of entry.synonyms) {
    LOOKUP_INDEX.set(normalizeForLookup(synonym), entry);
  }
}

const BY_SLUG: Map<string, IngredientDictionaryEntry> = new Map(INGREDIENT_DICTIONARY.map((e) => [e.slug, e]));

/** shoppingList.builder.ts'in kaşık/bardak birimlerini gram karşılığına çevirip çevirmeyeceğine karar vermek için kullandığı bakış. */
export function getPreferredUnitFamily(slug: string): "weight" | "volume" | undefined {
  return BY_SLUG.get(slug)?.unitClass;
}

export interface ResolvedIngredient {
  slug: string;
  displayName: string;
  aisle: Aisle;
  isPantryStaple: boolean;
  /** false ise sözlükte bulunamadı — rawInput'tan üretilmiş "en iyi tahmin" slug döner. */
  resolved: boolean;
}

/**
 * SDD §4.4: PantryTagInput/AvoidedIngredientsInput'un çip'e dönüştürdüğü her
 * girdi buradan geçer. Çözülemeyen girdi UI'da sarı chip olur ("tanımadım
 * ama deneyeceğim") — burada `resolved: false` ile işaretlenir, sistemi
 * durdurmaz.
 */
export function resolveIngredient(rawInput: string): ResolvedIngredient {
  const normalized = normalizeForLookup(rawInput);
  const entry = LOOKUP_INDEX.get(normalized);

  if (entry) {
    return {
      slug: entry.slug,
      displayName: entry.displayName,
      aisle: entry.aisle,
      isPantryStaple: entry.isPantryStaple,
      resolved: true,
    };
  }

  return {
    slug: normalized.replace(/\s+/g, "_"),
    displayName: rawInput.trim(),
    aisle: "diger",
    isPantryStaple: false,
    resolved: false,
  };
}
