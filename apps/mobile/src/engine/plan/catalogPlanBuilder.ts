import { randomUUID } from "../utils/uuid";
import { AppError } from "../utils/AppError";
import type {
  CuisineType,
  DayPlan,
  DietaryConstraints,
  EquipmentConstraints,
  Ingredient,
  Meal,
  MealComplexity,
  MealType,
  SubRecipe,
  UserPreferencesPayload,
} from "@sofria/shared";
import { MEAL_COMPLEXITY_SUBRECIPE_COUNT } from "@sofria/shared";
import { mentionsOven } from "../domain/equipmentCheck";
import { findForbiddenKeyword } from "../domain/forbiddenIngredients";
import { roundForRecipe } from "../domain/units.converter";
import { RECIPE_CATALOG, type CatalogRecipe } from "../domain/recipeCatalog";

/**
 * Gerçek kullanıcı talebi: haftalık plan artık LLM'in serbestçe uydurduğu
 * tariflerden değil, sabit `RECIPE_CATALOG`'un içinden DETERMİNİSTİK seçimle
 * oluşuyor. Bu, tüm F5 LLM güvenilmezlik sınıfını (kota, bozuk JSON, kural
 * ihlali, düzeltme turu) ortadan kaldırır — kısıtlar (diyet/ekipman/süre)
 * seçimden ÖNCE filtre olarak uygulanır, yani ihlal MÜMKÜN DEĞİLDİR
 * (post-check'e gerek kalmaz). Mutfak/gün adı/tarih bilgilendiricidir
 * (bkz. weekDates.ts) — burada üretilen `dayName` bir yer tutucudur,
 * plan.service.ts bunu gerçek tarihle birlikte GÜNCEL olarak damgalar.
 */

const LUNCH_ROLE_POOL: SubRecipe["role"][] = ["yan_lezzet", "pilav_makarna", "salata"];

/**
 * Gerçek kullanıcı talebi: menüde öğünler GÜNLÜK KRONOLOJİK sırayla
 * gösterilsin (örn. öğle+akşam seçildiyse ekranda önce öğle görünsün) —
 * kullanıcının sihirbazda öğünleri hangi SIRAYLA işaretlediği (includedMeals
 * dizisinin sırası) bunu etkilememeli. Kahvaltı zaten ayrı bir döngüde en
 * başta ekleniyor (bkz. buildCatalogPlan); bu sabit yalnızca öğle/akşam
 * arasındaki sırayı garantiler.
 */
const CHRONOLOGICAL_MEAL_ORDER: MealType[] = ["ogle", "aksam"];
const MEAL_TYPE_SORT_INDEX: Record<MealType, number> = { kahvalti: 0, ogle: 1, aksam: 2 };

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function filterByDietary(recipes: CatalogRecipe[], dietary: DietaryConstraints): CatalogRecipe[] {
  const avoided = new Set(dietary.avoidedIngredients);
  const allergies = new Set(dietary.allergies);
  return recipes.filter((r) => {
    if (dietary.vegetarian && !r.dietary.vegetarian) return false;
    if (dietary.vegan && !r.dietary.vegan) return false;
    if (dietary.glutenFree && !r.dietary.glutenFree) return false;
    if (dietary.lactoseFree && !r.dietary.lactoseFree) return false;
    return r.ingredients.every((ing) => {
      if (findForbiddenKeyword(ing.displayName)) return false;
      if (allergies.has(ing.slug)) return false;
      if (avoided.has(ing.slug)) return false;
      return true;
    });
  });
}

function filterByEquipment(recipes: CatalogRecipe[], equipment: EquipmentConstraints): CatalogRecipe[] {
  const ovenBanned = equipment.stovetopOnly || !equipment.hasOven;
  return recipes.filter((r) => !(ovenBanned && mentionsOven(r.requiredEquipment)));
}

function filterByTime(recipes: CatalogRecipe[], maxPrepMinutes: number): CatalogRecipe[] {
  return recipes.filter((r) => r.prepMinutes + r.cookMinutes <= maxPrepMinutes);
}

/**
 * Gerçek kullanıcı talebi: öğle yemeği tek/iki çeşitte PRATİK olmalı —
 * zor zorluk seviyesindeki tarifler öğleye atanmaz (havuz boşalırsa güvenlik
 * ağı olarak izin verilir, boş plan üretmektense).
 */
function filterEasyForLunch(recipes: CatalogRecipe[]): CatalogRecipe[] {
  const easy = recipes.filter((r) => r.difficulty !== "zor");
  return easy.length > 0 ? easy : recipes;
}

interface SlotPlan {
  dayIndex: number;
  mealType: MealType;
  cuisine: CuisineType;
}

/**
 * Öğle+akşam için gün×öğün sırasını dolaştırıp mutfak ataması yapar.
 * Gerçek kullanıcı talebi: dağıtım GÜN değil ÖĞÜN bazında, aynı mutfak art
 * arda 3 öğünden fazla tekrarlanmaz, öğleye Balık Ürünleri atanmaz (o
 * kullanıcının TEK seçimiyse istisna — boş plan üretmektense kabul edilir).
 */
function assignCuisines(daysCount: number, includedMeals: MealType[], cuisinePreferences: CuisineType[]): SlotPlan[] {
  const slots: { dayIndex: number; mealType: MealType }[] = [];
  for (let d = 0; d < daysCount; d++) {
    // CHRONOLOGICAL_MEAL_ORDER'a göre gezilir — includedMeals'in kendi sırası
    // (kullanıcının sihirbazda tıklama sırası) burada KASITLI olarak göz
    // ardı edilir, aksi halde "önce akşam sonra öğle seçtim" durumunda akşam
    // günün planında öğleden önce görünürdü.
    for (const mealType of CHRONOLOGICAL_MEAL_ORDER) {
      if (includedMeals.includes(mealType)) slots.push({ dayIndex: d, mealType });
    }
  }

  const rotation = shuffle(cuisinePreferences);
  let rotationIndex = 0;
  const result: SlotPlan[] = [];
  let streak = { cuisine: null as CuisineType | null, count: 0 };

  for (const slot of slots) {
    const lunchSafe = rotation.filter((c) => c !== "balik_urunleri" || slot.mealType !== "ogle");
    const pool = lunchSafe.length > 0 ? lunchSafe : rotation;

    let candidate = pool[rotationIndex % pool.length]!;
    // Art arda 3'ten fazla aynı mutfak olmasın — mümkünse bir sonrakine geç.
    if (streak.cuisine === candidate && streak.count >= 3 && pool.length > 1) {
      candidate = pool[(rotationIndex + 1) % pool.length]!;
    }
    rotationIndex++;

    streak = candidate === streak.cuisine ? { cuisine: candidate, count: streak.count + 1 } : { cuisine: candidate, count: 1 };
    result.push({ dayIndex: slot.dayIndex, mealType: slot.mealType, cuisine: candidate });
  }

  return result;
}

function scaleIngredients(ingredients: Ingredient[], baseServings: number, targetServings: number): Ingredient[] {
  const ratio = targetServings / baseServings;
  return ingredients.map((ing) => ({
    ...ing,
    amount: ing.isPantryStaple || ratio === 1 ? ing.amount : roundForRecipe(ing.amount * ratio, ing.unit),
  }));
}

function toSubRecipe(catalogRecipe: CatalogRecipe, targetServings: number): SubRecipe {
  return {
    subRecipeId: randomUUID(),
    name: catalogRecipe.name,
    role: catalogRecipe.role,
    servings: targetServings,
    prepMinutes: catalogRecipe.prepMinutes,
    cookMinutes: catalogRecipe.cookMinutes,
    difficulty: catalogRecipe.difficulty,
    ingredients: scaleIngredients(catalogRecipe.ingredients, catalogRecipe.servings, targetServings),
    instructions: catalogRecipe.instructions,
    requiredEquipment: catalogRecipe.requiredEquipment,
    estimatedKcalPerServing: catalogRecipe.estimatedKcalPerServing,
    // Bkz. weeklyPlan.ts subRecipeSchema.imageSlug dokümantasyonu — kahvaltı
    // tariflerinin (isBreakfast) 7'si için gerçek dosya YOK, istemci bunu
    // bulamayınca zaten role ikonuna düşüyor, bu yüzden burada özel durum
    // gerekmez.
    imageSlug: catalogRecipe.imageSlug,
  };
}

/**
 * Gerçek kullanıcı talebi: balık ürünleriyle SÜT VE SÜT ÜRÜNLERİ (süt,
 * yoğurt, peynir çeşitleri, krema) aynı menüde olmasın — ama TEREYAĞI bu
 * yasağın DIŞINDA ("tereyağlı şeyler yasak değil, süt ve süt ürünleri
 * yasak tereyağ hariç"). `dietary.lactoseFree` bayrağı tereyağ içeren
 * tarifleri de false işaretlediği için (örn. Mercimek/Ezogelin Çorbası)
 * burada ona değil, doğrudan malzeme listesine bakılır.
 */
const DAIRY_EXCLUDING_BUTTER_SLUGS = new Set(["sut", "yogurt", "kasar_rendesi", "mozzarella", "parmesan", "beyaz_peynir", "kremasi"]);

function containsDairyExcludingButter(recipe: CatalogRecipe): boolean {
  return recipe.ingredients.some((ing) => DAIRY_EXCLUDING_BUTTER_SLUGS.has(ing.slug));
}

/**
 * Balık mutfağı öğününde: yukarıdaki süt ürünü yasağı UYGULANIR; ayrıca
 * münhasıran balık mutfağına ait (tek etiketli, örn. "Balık Çorbası")
 * çorbalar ÇORBA rolü için eşleşme sayılmaz — yalnızca ana yemek balık
 * olsun, genel (ALL_TR_STYLE etiketli) çorbalar hâlâ seçilebilir.
 */
function matchesCuisineForRole(recipe: CatalogRecipe, role: SubRecipe["role"], cuisine: CuisineType): boolean {
  if (!recipe.cuisineTags.includes(cuisine)) return false;
  if (cuisine === "balik_urunleri") {
    if (containsDairyExcludingButter(recipe)) return false;
    if (role === "corba" && recipe.cuisineTags.length === 1) return false;
  }
  return true;
}

/**
 * Gerçek kullanıcı talebi: bazı tarif çiftleri aynı öğünde anlamsız/gereksiz
 * tekrar oluşturuyor (örn. İzmir Köfte + Patates Kızartması — ikisi de
 * patates). `CatalogRecipe.incompatibleWith` İKİ YÖNLÜ kontrol edilir,
 * yalnızca bir tarafın listesine yazmak yeterlidir.
 */
function isIncompatible(candidate: CatalogRecipe, alreadyChosen: CatalogRecipe[]): boolean {
  return alreadyChosen.some(
    (chosen) => candidate.incompatibleWith?.includes(chosen.slug) || chosen.incompatibleWith?.includes(candidate.slug)
  );
}

/**
 * Gerçek kullanıcı talebi: bir yemek hafta içinde tekrar edecekse, iki
 * kullanımı arasında EN AZ 5 gün olsun (örn. pazartesi konduysa 2 gün sonra
 * -çarşamba- tekrar konmasın). ÇORBA bu kuralın DIŞINDA — çorba için ayrı
 * ve daha kısa bir boşluk (3 gün) yeterli ("çorbayı bu kurala koyma, çorbanın
 * aralığı 3 gün olsun"). `usedDays` her tarifin bu hafta HANGİ gün(ler)de
 * kullanıldığını tutar; slot'lar gün sırasına göre işlendiği için (bkz.
 * assignCuisines/buildCatalogPlan) bir günü değerlendirirken ondan önceki
 * tüm kullanımlar zaten kayıtlıdır.
 */
const MIN_REPEAT_GAP_DAYS = 5;
const CORBA_REPEAT_GAP_DAYS = 3;

function minRepeatGapForRole(role: SubRecipe["role"]): number {
  return role === "corba" ? CORBA_REPEAT_GAP_DAYS : MIN_REPEAT_GAP_DAYS;
}

function passesRepeatGap(slug: string, dayIndex: number, usedDays: Map<string, number[]>, minGapDays: number): boolean {
  const days = usedDays.get(slug);
  if (!days) return true;
  return days.every((d) => Math.abs(dayIndex - d) >= minGapDays);
}

function recordUsedDay(slug: string, dayIndex: number, usedDays: Map<string, number[]>): void {
  const days = usedDays.get(slug);
  if (days) days.push(dayIndex);
  else usedDays.set(slug, [dayIndex]);
}

/**
 * Havuz o kadar dar ki (örn. tek mutfak seçimiyle sadece 1 çorba seçeneği
 * varsa) 5 günlük boşluk kuralını karşılayan HİÇBİR aday yoksa — boş hücre
 * üretmektense en az kötü seçeneğe düşülür: bu haftaki en son kullanım
 * gününe EN UZAK (yani ihlali en küçük) aday(lar) arasından rastgele
 * seçilir. Bu, aynı günün öğle VE akşamına aynı tarifin gelme riskini de
 * (mesafe 0, mümkün olan en kötü durum) mümkün olduğunca azaltır.
 */
function leastRecentlyUsedCandidates(pool: CatalogRecipe[], dayIndex: number, usedDays: Map<string, number[]>): CatalogRecipe[] {
  let bestDistance = -Infinity;
  let best: CatalogRecipe[] = [];
  for (const r of pool) {
    const days = usedDays.get(r.slug);
    const minDistance = !days || days.length === 0 ? Infinity : Math.min(...days.map((d) => Math.abs(dayIndex - d)));
    if (minDistance > bestDistance) {
      bestDistance = minDistance;
      best = [r];
    } else if (minDistance === bestDistance) {
      best.push(r);
    }
  }
  return best;
}

function pickFromPool(
  pool: CatalogRecipe[],
  role: SubRecipe["role"],
  cuisine: CuisineType,
  usedDays: Map<string, number[]>,
  dayIndex: number,
  alreadyChosenInMeal: CatalogRecipe[]
): CatalogRecipe | undefined {
  const roleAndCuisine = pool.filter(
    (r) => r.role === role && matchesCuisineForRole(r, role, cuisine) && !isIncompatible(r, alreadyChosenInMeal)
  );
  if (roleAndCuisine.length === 0) return undefined;
  const minGapDays = minRepeatGapForRole(role);
  const fresh = roleAndCuisine.filter((r) => passesRepeatGap(r.slug, dayIndex, usedDays, minGapDays));
  const candidates = fresh.length > 0 ? fresh : leastRecentlyUsedCandidates(roleAndCuisine, dayIndex, usedDays);
  return pick(candidates);
}

function hasCandidate(pool: CatalogRecipe[], role: SubRecipe["role"], cuisine: CuisineType): boolean {
  return pool.some((r) => r.role === role && matchesCuisineForRole(r, role, cuisine));
}

/**
 * Gerçek kullanıcı testinde bulundu: tek_cesit için corba/ana_yemek arasında
 * kısıtlardan (süre/ekipman/diyet) BAĞIMSIZ rastgele seçim yapmak, o mutfak
 * için havuzu boş olan role'ü seçip hücreyi boşa düşürebiliyordu (örn. bir
 * kısıt tüm "ana_yemek" seçeneklerini elerken "corba" seçenekleri hâlâ
 * doluysa bile). Rol seçimi artık HAVUZ DURUMUNA göre yapılır — ikisi de
 * doluysa rastgele, yalnızca biri doluysa o seçilir.
 */
function rolesForComplexity(complexity: MealComplexity, pool: CatalogRecipe[], cuisine: CuisineType): SubRecipe["role"][] {
  if (complexity === "tek_cesit") {
    const corbaOk = hasCandidate(pool, "corba", cuisine);
    const anaOk = hasCandidate(pool, "ana_yemek", cuisine);
    if (corbaOk && anaOk) return [pick<SubRecipe["role"]>(["corba", "ana_yemek"])];
    if (corbaOk) return ["corba"];
    return ["ana_yemek"];
  }
  if (complexity === "iki_cesit") {
    const available = LUNCH_ROLE_POOL.filter((role) => hasCandidate(pool, role, cuisine));
    return ["ana_yemek", available.length > 0 ? pick(available) : pick(LUNCH_ROLE_POOL)];
  }
  return ["corba", "ana_yemek", "yan_lezzet"];
}

export function buildCatalogPlan(payload: UserPreferencesPayload): DayPlan[] {
  const targetServings = payload.householdSize;

  let pool = filterByDietary(RECIPE_CATALOG, payload.dietary);
  pool = filterByEquipment(pool, payload.equipment);
  pool = filterByTime(pool, payload.maxPrepMinutes);

  const breakfastPool = pool.filter((r) => r.isBreakfast);
  const mainPool = pool.filter((r) => !r.isBreakfast);
  const lunchMainPool = filterEasyForLunch(mainPool);

  const slots = assignCuisines(payload.daysCount, payload.includedMeals, payload.cuisinePreferences);
  // Kahvaltı ile öğle/akşam farklı havuzlardan geldiği (isBreakfast ayrımı)
  // için slug çakışması mümkün değil — tek bir paylaşılan harita yeterli.
  const usedDays = new Map<string, number[]>();

  const days: DayPlan[] = Array.from({ length: payload.daysCount }, (_, dayIndex) => ({
    dayIndex,
    dayName: "", // plan.service.ts içinde withPlanDates ile gerçek değere damgalanır
    meals: [] as Meal[],
  }));

  if (payload.includedMeals.includes("kahvalti")) {
    for (const day of days) {
      const options = breakfastPool.filter((r) => passesRepeatGap(r.slug, day.dayIndex, usedDays, MIN_REPEAT_GAP_DAYS));
      const recipe = pick(options.length > 0 ? options : leastRecentlyUsedCandidates(breakfastPool, day.dayIndex, usedDays));
      if (!recipe) continue;
      recordUsedDay(recipe.slug, day.dayIndex, usedDays);
      const sub = toSubRecipe(recipe, targetServings);
      day.meals.push({
        mealId: randomUUID(),
        type: "kahvalti",
        title: recipe.name,
        complexity: "tek_cesit",
        cuisineTag: "sebze_yemekleri",
        totalPrepMinutes: recipe.prepMinutes + recipe.cookMinutes,
        subRecipes: [sub],
      });
    }
  }

  for (const slot of slots) {
    const complexity = slot.mealType === "ogle" ? payload.mealComplexity.lunch : payload.mealComplexity.dinner;
    const candidatePool = slot.mealType === "ogle" ? lunchMainPool : mainPool;
    const roles = rolesForComplexity(complexity, candidatePool, slot.cuisine);

    const subRecipes: SubRecipe[] = [];
    const chosenInMeal: CatalogRecipe[] = [];
    for (const role of roles) {
      const recipe = pickFromPool(candidatePool, role, slot.cuisine, usedDays, slot.dayIndex, chosenInMeal);
      if (!recipe) continue;
      recordUsedDay(recipe.slug, slot.dayIndex, usedDays);
      chosenInMeal.push(recipe);
      subRecipes.push(toSubRecipe(recipe, targetServings));
    }

    if (subRecipes.length === 0) continue; // kısıtlar bu hücre için hiçbir tarifi karşılamadı — hücre boş bırakılır

    const mainDish = subRecipes.find((s) => s.role === "ana_yemek") ?? subRecipes[0]!;
    const expectedCount = MEAL_COMPLEXITY_SUBRECIPE_COUNT[complexity];

    days[slot.dayIndex]!.meals.push({
      mealId: randomUUID(),
      type: slot.mealType,
      title: mainDish.name,
      // Kısıtlar yüzünden beklenen sayıya ulaşılamadıysa (nadir), gerçek
      // sayıya uyan bir complexity etiketiyle işaretle — şema tutarlılığı için.
      complexity: subRecipes.length === expectedCount ? complexity : (Object.keys(MEAL_COMPLEXITY_SUBRECIPE_COUNT) as MealComplexity[]).find(
        (c) => MEAL_COMPLEXITY_SUBRECIPE_COUNT[c] === subRecipes.length
      ) ?? "tek_cesit",
      cuisineTag: slot.cuisine,
      totalPrepMinutes: Math.max(...subRecipes.map((s) => s.prepMinutes + s.cookMinutes)),
      subRecipes,
    });
  }

  // Savunmacı ek garanti: kahvaltı ayrı döngüde, öğle/akşam CHRONOLOGICAL_MEAL_ORDER
  // ile ekleniyor olsa da, her günün meals dizisi son bir kez daha kronolojik
  // sıraya (kahvaltı < öğle < akşam) göre sıralanır — ekranda gösterim sırası
  // hiçbir zaman kullanıcının seçim SIRASINA bağlı olmasın.
  for (const day of days) {
    day.meals.sort((a, b) => MEAL_TYPE_SORT_INDEX[a.type] - MEAL_TYPE_SORT_INDEX[b.type]);
  }

  const emptyDays = days.filter((d) => d.meals.length === 0);
  if (emptyDays.length > 0) {
    // SDD şeması her günün EN AZ 1 öğün içermesini ve dizinin tam
    // `daysCount` uzunlukta olmasını zorunlu kılar — bu yüzden boş günü
    // ATLAMAK yerine (şemayı bozar) net bir iş kuralı hatası fırlatılır.
    // Gerçekleşmesi beklenmez (katalog geniş) ama çok kısıtlayıcı bir
    // diyet+ekipman+süre kombinasyonunda teorik olarak mümkündür.
    throw new AppError(
      "BUSINESS_RULE_VIOLATION",
      "Seçilen kısıtlarla (diyet, ekipman, süre) kataloğumuzdaki tariflerden bazı günler için uygun bir yemek bulunamadı. Lütfen kısıtları biraz gevşetip tekrar deneyin.",
      { retryable: false }
    );
  }

  return days;
}
