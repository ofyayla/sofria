import { randomUUID } from "node:crypto";
import { AppError } from "../../errors/AppError.js";
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
import { DISH_IMAGE_SLUGS, MEAL_COMPLEXITY_SUBRECIPE_COUNT } from "@sofria/shared";
import { mentionsOven } from "../../domain/equipmentCheck.js";
import { findForbiddenKeyword } from "../../domain/forbiddenIngredients.js";
import { roundForRecipe } from "../../domain/units.converter.js";
import { RECIPE_CATALOG, type CatalogRecipe } from "../../domain/recipeCatalog.js";

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

/**
 * Gerçek kullanıcı talebi: fotoğrafı olmayan tarif de önerilebilir ama
 * öncelik fotoğraflı olanlarda. Tekrar aralığı vb. kurallarla elenmiş
 * adaylar arasında fotoğraflı olan varsa yalnızca onlardan seçilir.
 */
function preferWithPhoto(candidates: CatalogRecipe[]): CatalogRecipe[] {
  const withPhoto = candidates.filter((r) => DISH_IMAGE_SLUGS.has(r.imageSlug));
  return withPhoto.length > 0 ? withPhoto : candidates;
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
  return pick(preferWithPhoto(candidates));
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

/**
 * Gerçek kullanıcı testinde bulundu: "Tam menü" (3 çeşit) seçilince bazı
 * günler 2 çeşit geliyordu — o mutfakta uygun yan lezzet/çorba yoksa (örn.
 * Ortadoğu, İtalyan) ya da seçilen yemekle uyumsuzsa rol sessizce
 * atlanıyordu. Her çeşit yeri artık bir YEDEK ROL SIRASI taşır; ilk rol
 * bulunamazsa sıradaki denenir. Ana yemek yedeksizdir.
 */
const ROLE_FALLBACKS: Partial<Record<SubRecipe["role"], SubRecipe["role"][]>> = {
  corba: ["corba", "salata", "yan_lezzet"],
  yan_lezzet: ["yan_lezzet", "pilav_makarna", "salata"],
  pilav_makarna: ["pilav_makarna", "yan_lezzet", "salata"],
  salata: ["salata", "yan_lezzet", "pilav_makarna"],
};

/**
 * Yan yemek için son çare: seçilen mutfakta hiçbir yedek rol bulunamadıysa
 * mutfak şartı gevşetilir (pilav/salata mutfaklar arası ortaktır) — diyet,
 * ekipman ve süre kısıtları havuzda zaten uygulanmış durumda. Balık
 * öğünündeki süt ürünü yasağı korunur. Ana yemek her zaman mutfaktan gelir.
 */
function pickSideAnyCuisine(
  pool: CatalogRecipe[],
  role: SubRecipe["role"],
  cuisine: CuisineType,
  usedDays: Map<string, number[]>,
  dayIndex: number,
  alreadyChosenInMeal: CatalogRecipe[]
): CatalogRecipe | undefined {
  const candidates = pool.filter(
    (r) =>
      r.role === role &&
      !alreadyChosenInMeal.some((c) => c.slug === r.slug) &&
      !isIncompatible(r, alreadyChosenInMeal) &&
      !(cuisine === "balik_urunleri" && containsDairyExcludingButter(r))
  );
  if (candidates.length === 0) return undefined;
  const fresh = candidates.filter((r) => passesRepeatGap(r.slug, dayIndex, usedDays, minRepeatGapForRole(role)));
  return pick(preferWithPhoto(fresh.length > 0 ? fresh : leastRecentlyUsedCandidates(candidates, dayIndex, usedDays)));
}

/** Bir çeşit yeri için tarif: önce mutfakla eşleşen yedek roller, sonra (yan yemekse) mutfak dışı. */
function pickForSlot(
  pool: CatalogRecipe[],
  role: SubRecipe["role"],
  cuisine: CuisineType,
  usedDays: Map<string, number[]>,
  dayIndex: number,
  chosenInMeal: CatalogRecipe[],
  usedRoles: Set<SubRecipe["role"]>
): CatalogRecipe | undefined {
  const alternatives = (ROLE_FALLBACKS[role] ?? [role]).filter((r) => r === role || !usedRoles.has(r));
  for (const alt of alternatives) {
    const recipe = pickFromPool(pool, alt, cuisine, usedDays, dayIndex, chosenInMeal);
    if (recipe) return recipe;
  }
  if (role === "ana_yemek") return undefined;
  for (const alt of alternatives) {
    const recipe = pickSideAnyCuisine(pool, alt, cuisine, usedDays, dayIndex, chosenInMeal);
    if (recipe) return recipe;
  }
  return undefined;
}

export interface BuildCatalogPlanOptions {
  /** Kullanıcının "bir daha önerme" dediği tarifler — plana hiç girmez. */
  excludedSlugs?: ReadonlySet<string>;
}

export function buildCatalogPlan(payload: UserPreferencesPayload, options: BuildCatalogPlanOptions = {}): DayPlan[] {
  const targetServings = payload.householdSize;

  let pool = filterByDietary(RECIPE_CATALOG, payload.dietary);
  pool = filterByEquipment(pool, payload.equipment);
  pool = filterByTime(pool, payload.maxPrepMinutes);
  const excluded = options.excludedSlugs;
  if (excluded && excluded.size > 0) pool = pool.filter((r) => !excluded.has(r.slug));

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
      const recipe = pick(preferWithPhoto(options.length > 0 ? options : leastRecentlyUsedCandidates(breakfastPool, day.dayIndex, usedDays)));
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
    const usedRoles = new Set<SubRecipe["role"]>(roles);
    for (const role of roles) {
      // tek_cesit'te rol zaten havuz durumuna göre seçildi; yedek gerekmez.
      const recipe =
        complexity === "tek_cesit"
          ? pickFromPool(candidatePool, role, slot.cuisine, usedDays, slot.dayIndex, chosenInMeal)
          : pickForSlot(candidatePool, role, slot.cuisine, usedDays, slot.dayIndex, chosenInMeal, usedRoles);
      if (!recipe) continue;
      recordUsedDay(recipe.slug, slot.dayIndex, usedDays);
      chosenInMeal.push(recipe);
      usedRoles.add(recipe.role);
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

// ======================= YEMEK DEĞİŞTİRME (SWAP) =======================
// Gerçek kullanıcı talebi: haftalık planda beğenmediği bir yemeği kullanıcı
// değiştirebilmeli. Rastgele tek dokunuşlu değişim yerine 3 alternatif
// sunulur; alternatifler planı oluşturan kuralların AYNISINA uyar (diyet,
// alerji, ekipman, süre, tekrar aralığı, uyumsuz ikili, fotoğraf önceliği).

/** Plandaki bir yemeğin katalog kaydı — `imageSlug` katalogda `slug` ile birebir aynı. */
export function findCatalogRecipe(sub: { imageSlug?: string | undefined; name: string }): CatalogRecipe | undefined {
  return RECIPE_CATALOG.find((r) => (sub.imageSlug ? r.slug === sub.imageSlug : r.name === sub.name));
}

export interface SuggestReplacementsRequest {
  days: DayPlan[];
  mealId: string;
  subRecipeId: string;
  payload: UserPreferencesPayload;
  /** Önerilmeyecek tarifler ("bir daha önerme" listesi + bu oturumda zaten gösterilenler). */
  excludedSlugs?: ReadonlySet<string>;
  /** Seçilen mutfakta aday kalmazsa diğer mutfaklara da bakılsın mı. */
  allowOtherCuisines?: boolean;
  count?: number;
}

/**
 * Bir yemeğin yerine geçebilecek tarifler. Aynı rol (çorba yerine çorba),
 * aynı mutfak; kahvaltıda rol/mutfak yerine kahvaltı havuzu. Tekrar aralığını
 * tutan ve fotoğraflı olanlar önce gelir, kendi içlerinde karışık sıralanır.
 */
export function suggestReplacements(req: SuggestReplacementsRequest): SubRecipe[] {
  const count = req.count ?? 3;
  const day = req.days.find((d) => d.meals.some((m) => m.mealId === req.mealId));
  const meal = day?.meals.find((m) => m.mealId === req.mealId);
  const sub = meal?.subRecipes.find((s) => s.subRecipeId === req.subRecipeId);
  if (!day || !meal || !sub) return [];

  const isBreakfast = meal.type === "kahvalti";
  let pool = filterByDietary(RECIPE_CATALOG, req.payload.dietary);
  pool = filterByEquipment(pool, req.payload.equipment);
  pool = filterByTime(pool, req.payload.maxPrepMinutes);
  pool = pool.filter((r) => Boolean(r.isBreakfast) === isBreakfast);
  if (meal.type === "ogle") pool = filterEasyForLunch(pool);

  const current = findCatalogRecipe(sub);
  const others = meal.subRecipes
    .filter((s) => s.subRecipeId !== sub.subRecipeId)
    .map((s) => findCatalogRecipe(s))
    .filter((r): r is CatalogRecipe => Boolean(r));
  const blocked = new Set<string>([...(req.excludedSlugs ?? []), ...others.map((r) => r.slug)]);
  if (current) blocked.add(current.slug);

  // Bu yemek HARİÇ planın geri kalanındaki kullanımlar — tekrar aralığı için.
  const usedDays = new Map<string, number[]>();
  for (const d of req.days) {
    for (const m of d.meals) {
      for (const s of m.subRecipes) {
        if (s.subRecipeId === sub.subRecipeId) continue;
        const r = findCatalogRecipe(s);
        if (r) recordUsedDay(r.slug, d.dayIndex, usedDays);
      }
    }
  }

  const role = sub.role;
  const eligible = (r: CatalogRecipe) => !blocked.has(r.slug) && !isIncompatible(r, others) && (isBreakfast || r.role === role);
  let candidates = pool.filter((r) => eligible(r) && (isBreakfast || matchesCuisineForRole(r, role, meal.cuisineTag)));
  if (candidates.length === 0 && req.allowOtherCuisines && !isBreakfast) {
    candidates = pool.filter((r) => eligible(r) && !(meal.cuisineTag === "balik_urunleri" && containsDairyExcludingButter(r)));
  }

  const gap = minRepeatGapForRole(role);
  const ranked = candidates
    .map((r) => ({
      r,
      key: (passesRepeatGap(r.slug, day.dayIndex, usedDays, gap) ? 0 : 2) + (DISH_IMAGE_SLUGS.has(r.imageSlug) ? 0 : 1) + Math.random(),
    }))
    .sort((a, b) => a.key - b.key)
    .slice(0, count);

  return ranked.map(({ r }) => toSubRecipe(r, sub.servings));
}

/**
 * Planda tek bir yemeği değiştirir; öğün başlığını (ana yemek adı) ve süreyi
 * yeniden hesaplar. Öğünün çeşit sayısı ve diğer yemekler aynen kalır.
 */
export function replaceSubRecipe<D extends DayPlan>(days: D[], mealId: string, subRecipeId: string, replacement: SubRecipe): D[] {
  return days.map((day) => ({
    ...day,
    meals: day.meals.map((meal) => {
      if (meal.mealId !== mealId) return meal;
      const subRecipes = meal.subRecipes.map((s) => (s.subRecipeId === subRecipeId ? replacement : s));
      const mainDish = subRecipes.find((s) => s.role === "ana_yemek") ?? subRecipes[0]!;
      return {
        ...meal,
        title: mainDish.name,
        totalPrepMinutes: Math.max(...subRecipes.map((s) => s.prepMinutes + s.cookMinutes)),
        subRecipes,
      };
    }),
  }));
}
