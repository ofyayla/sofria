import type { UserPreferencesPayload } from "@sofria/shared";
import { buildComplexityFragment } from "./fragments/complexity.fragment.js";
import { buildCuisineFragment } from "./fragments/cuisine.fragment.js";
import { buildDietaryFragment } from "./fragments/dietary.fragment.js";
import { buildEquipmentFragment } from "./fragments/equipment.fragment.js";
import { buildMandatoryRestrictionsFragment } from "./fragments/mandatoryRestrictions.fragment.js";
import { buildOutputFormatFragment } from "./fragments/outputFormat.fragment.js";
import { buildRecipeCompletenessFragment } from "./fragments/recipeCompleteness.fragment.js";
import { buildUnitsFragment } from "./fragments/units.fragment.js";

const JSON_SHAPE_HINT = `{
  "days": [
    {
      "dayIndex": 0,
      "dayName": "Pazartesi",
      "meals": [
        {
          "mealId": "string",
          "type": "kahvalti|ogle|aksam",
          "title": "string",
          "complexity": "tek_cesit|iki_cesit|tam_menu",
          "cuisineTag": "kirmizi_et|beyaz_et|balik_urunleri|sebze_yemekleri|ortadogu_mutfagi|italyan_mutfagi",
          "totalPrepMinutes": 30,
          "subRecipes": [
            {
              "subRecipeId": "string",
              "name": "string",
              "role": "corba|ana_yemek|yan_lezzet|salata|pilav_makarna|tatli",
              "servings": 4,
              "prepMinutes": 10,
              "cookMinutes": 20,
              "difficulty": "kolay|orta|zor",
              "ingredients": [
                { "slug": "string", "displayName": "string", "amount": 200, "unit": "gr", "isPantryStaple": false }
              ],
              "instructions": [{ "order": 1, "text": "string" }],
              "requiredEquipment": ["tencere"],
              "estimatedKcalPerServing": 450
            }
          ]
        }
      ]
    }
  ]
}`;

const CHILD_AGE_THRESHOLD = 12;

/**
 * Gerçek kullanıcı talebi: çocukların porsiyonu yetişkinlerden küçük olmalı.
 * `householdAges` opsiyonel (eski istemciler/testler göndermeyebilir) —
 * yoksa veya boşsa hiçbir satır eklenmez.
 */
function buildHouseholdAgesLine(householdAges: number[] | undefined): string {
  if (!householdAges || householdAges.length === 0) return "";
  const childAges = householdAges.filter((age) => age < CHILD_AGE_THRESHOLD);
  if (childAges.length === 0) return `Hane üyelerinin yaşları: ${householdAges.join(", ")}.`;
  return [
    `Hane üyelerinin yaşları: ${householdAges.join(", ")}.`,
    `Bunlardan ${childAges.join(", ")} yaşındaki çocuklar için porsiyon miktarlarını (servings ve ingredient miktarlarını)`,
    "yetişkin porsiyonuna göre belirgin şekilde küçük tut (kabaca bir yetişkin porsiyonunun yarısı ile üçte ikisi arası).",
  ].join(" ");
}

export function buildWeeklyPlanPrompt(payload: UserPreferencesPayload): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = [
    "Sen Türkiye pazarına özel, Türk mutfağı ve dünya mutfakları konusunda uzman bir yemek planlama asistanısın.",
    "Kullanıcının verdiği kısıtlara harfiyen uyarsın.",
    "Yalnızca istenen JSON şemasına uygun, geçerli JSON döndürürsün.",
  ].join(" ");

  const userPrompt = [
    `${payload.daysCount} günlük bir yemek planı oluştur.`,
    `Hane büyüklüğü: ${payload.householdSize} kişi. Pişirme becerisi: ${payload.cookingSkill}.`,
    buildHouseholdAgesLine(payload.householdAges),
    `Öğün başına maksimum hazırlık süresi: ${payload.maxPrepMinutes} dakika.`,
    "Her subRecipe için, o tarifin YAZDIĞIN `servings` değeri kadar porsiyona bölündüğünde bir porsiyonun yaklaşık kalorisini (`estimatedKcalPerServing`, tam sayı, kcal) tahmin et. Bu tahmin bir diyetisyen onayı değil, kaba bir tahmindir — yine de malzemelerle (özellikle yağ, şeker, un, et miktarlarıyla) tutarlı olmalı.",
    `Dahil edilecek öğünler: SADECE ${payload.includedMeals.join(", ")}. Başka öğün türü ÜRETME — bu listede olmayan bir öğün türü (örn. listede yoksa öğle yemeği) için tek bir meal bile oluşturma.`,
    "",
    "KISITLAR:",
    buildMandatoryRestrictionsFragment(),
    buildDietaryFragment(payload.dietary),
    buildEquipmentFragment(payload.equipment),
    buildComplexityFragment({ ...payload.mealComplexity, includedMeals: payload.includedMeals }),
    buildCuisineFragment(payload.cuisinePreferences),
    buildUnitsFragment(),
    "",
    buildRecipeCompletenessFragment(),
    "",
    buildOutputFormatFragment(),
    "",
    "JSON ŞEMASI (örnek şekil, değerler örnektir):",
    JSON_SHAPE_HINT,
    "",
    `"days" dizisi tam olarak ${payload.daysCount} eleman içermeli, dayIndex 0'dan başlamalı.`,
  ].join("\n");

  return { systemPrompt, userPrompt };
}
