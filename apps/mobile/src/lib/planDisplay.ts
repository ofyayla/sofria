import type { CuisineType, DayPlanWithDate, Meal, MealComplexity, SubRecipe, WeeklyPlanResponse } from "@sofria/shared";
import type { ImageSourcePropType } from "react-native";
import { getDishImage } from "../assets/dishImages";

// Ekranlar arasında tekrar eden görüntüleme etiketleri ve tarih yardımcıları
// tek yerde — önceden 4 dosyada ayrı ayrı kopyalanıyordu.

export const MEAL_TYPE_LABELS: Record<Meal["type"], string> = { kahvalti: "Kahvaltı", ogle: "Öğle", aksam: "Akşam" };

/** "Bu sabah / Bu öğlen / Bu akşam" — ana sayfa başlığının soluk satırı. */
export const MEAL_TYPE_MOMENT: Record<Meal["type"], string> = { kahvalti: "Bu sabah", ogle: "Bu öğlen", aksam: "Bu akşam" };

export const COMPLEXITY_LABELS: Record<MealComplexity, string> = {
  tek_cesit: "Tek çeşit",
  iki_cesit: "İki çeşit",
  tam_menu: "Tam menü",
};

export const ROLE_LABELS: Record<SubRecipe["role"], string> = {
  corba: "Çorba",
  ana_yemek: "Ana yemek",
  yan_lezzet: "Yan lezzet",
  salata: "Salata",
  pilav_makarna: "Pilav / makarna",
  tatli: "Tatlı",
};

export const DIFFICULTY_LABELS: Record<SubRecipe["difficulty"], string> = { kolay: "Kolay", orta: "Orta", zor: "Zor" };

export const CUISINE_INFO: Record<CuisineType, { label: string; longLabel: string; subtitle: string; imageSlug: string }> = {
  kirmizi_et: { label: "Kırmızı et", longLabel: "Kırmızı Et", subtitle: "Dana, kuzu", imageSlug: "izmir_kofte" },
  beyaz_et: { label: "Beyaz et", longLabel: "Beyaz Et (Tavuk ve Hindi)", subtitle: "Tavuk, hindi", imageSlug: "tavuk_sis" },
  balik_urunleri: { label: "Balık", longLabel: "Balık Ürünleri", subtitle: "Balık, deniz ürünü", imageSlug: "firinda_levrek" },
  sebze_yemekleri: { label: "Sebze", longLabel: "Sebze Yemekleri", subtitle: "Etsiz, sebze ağırlıklı", imageSlug: "imam_bayildi" },
  ortadogu_mutfagi: { label: "Ortadoğu", longLabel: "Ortadoğu Mutfağı", subtitle: "Humus, kebap", imageSlug: "humus_falafel_tabagi" },
  italyan_mutfagi: { label: "İtalyan", longLabel: "İtalyan Mutfağı", subtitle: "Makarna, risotto", imageSlug: "risotto" },
};

const DAY_SHORT: Record<string, string> = {
  Pazartesi: "Pzt",
  Salı: "Sal",
  Çarşamba: "Çar",
  Perşembe: "Per",
  Cuma: "Cum",
  Cumartesi: "Cmt",
  Pazar: "Paz",
};
const WEEKDAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

export function shortDayName(dayName: string): string {
  return DAY_SHORT[dayName] ?? dayName.slice(0, 3);
}

/** "YYYY-MM-DD" → gün numarası ("16"). `iso` eski kayıtlarda olmayabilir. */
export function dayOfMonth(iso: string | undefined): string {
  if (!iso) return "";
  return String(Number(iso.split("-")[2]));
}

/** Cihazın yerel tarihi, "YYYY-MM-DD". (toISOString UTC'ye çevirir — gece yarısı kayar.) */
export function localISODate(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** "Cuma, 16 Ekim" — Intl'e güvenmeden (Hermes'te tr yerelleştirmesi garanti değil). */
export function formatLongDate(d: Date = new Date()): string {
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** "13 – 19 Ekim" ya da ay değişiyorsa "28 Eki – 3 Kas". */
export function formatPlanRange(days: DayPlanWithDate[]): string {
  const first = days[0]?.date;
  const last = days[days.length - 1]?.date;
  if (!first || !last) return "";
  const [, m1, d1] = first.split("-").map(Number) as [number, number, number];
  const [, m2, d2] = last.split("-").map(Number) as [number, number, number];
  if (m1 === m2) return `${d1} – ${d2} ${MONTHS[m2 - 1]}`;
  return `${d1} ${MONTHS[m1 - 1]!.slice(0, 3)} – ${d2} ${MONTHS[m2 - 1]!.slice(0, 3)}`;
}

export function greeting(d: Date = new Date()): string {
  const h = d.getHours();
  if (h < 11) return "Günaydın";
  if (h < 18) return "İyi günler";
  return "İyi akşamlar";
}

export type DayRelation = "today" | "upcoming" | "past";

/**
 * Plan oluşturulduğu günün ERTESİ gününden başlar — bu yüzden "bugün"
 * planda olmayabilir. Bugün varsa onu; plan henüz başlamadıysa ilk günü;
 * plan bittiyse son günü döner.
 */
export function findFocusDay(plan: WeeklyPlanResponse, today: string = localISODate()): { index: number; relation: DayRelation } {
  const idx = plan.days.findIndex((d) => d.date === today);
  if (idx >= 0) return { index: idx, relation: "today" };
  const first = plan.days[0]?.date;
  if (first && today < first) return { index: 0, relation: "upcoming" };
  return { index: plan.days.length - 1, relation: "past" };
}

/** Saate göre öne çıkacak öğün — o öğün planda yoksa sıradaki/ilk öğün. */
export function pickMealForNow(meals: Meal[], d: Date = new Date()): Meal | undefined {
  const h = d.getHours();
  const preferred: Meal["type"][] = h < 11 ? ["kahvalti", "ogle", "aksam"] : h < 16 ? ["ogle", "aksam", "kahvalti"] : ["aksam", "ogle", "kahvalti"];
  for (const t of preferred) {
    const m = meals.find((meal) => meal.type === t);
    if (m) return m;
  }
  return meals[0];
}

/** Öğünün vitrin yemeği: ana yemek, yoksa ilk alt tarif. */
export function featuredDish(meal: Meal): SubRecipe {
  return meal.subRecipes.find((s) => s.role === "ana_yemek") ?? meal.subRecipes[0]!;
}

/** Öğünün fotoğrafı olan ilk yemeği — vitrin yemeğinin görseli yoksa yedek. */
export function mealImage(meal: Meal): ImageSourcePropType | undefined {
  const featured = getDishImage(featuredDish(meal).imageSlug);
  if (featured) return featured;
  for (const s of meal.subRecipes) {
    const img = getDishImage(s.imageSlug);
    if (img) return img;
  }
  return undefined;
}

export function totalMinutes(sub: SubRecipe): number {
  return sub.prepMinutes + sub.cookMinutes;
}
