import { describe, expect, it } from "vitest";
import type { UserPreferencesPayload } from "@sofria/shared";
import { InflightRegistry } from "../../src/cache/inflight.registry.js";
import { NodeCacheProvider } from "../../src/cache/nodeCache.provider.js";
import { MockLLMProvider } from "../../src/services/llm/mockLLMProvider.js";
import { PlanService } from "../../src/services/plan/plan.service.js";

/**
 * Gerçek kullanıcı talebi: haftalık plan artık LLM'in serbestçe uydurduğu
 * tariflerden değil, sabit RECIPE_CATALOG'dan deterministik seçimle oluşuyor
 * (bkz. catalogPlanBuilder.ts) — bu testler artık bir MockLLMProvider yanıtı
 * KURGULAMAZ (kullanılmıyor), doğrudan gerçek katalog seçim mantığını dener.
 * `provider` alanı PlanServiceDeps'te hâlâ zorunlu olduğu için boş bir
 * MockLLMProvider veriliyor, ama hiç çağrılmaz.
 */
function basePayload(overrides: Partial<UserPreferencesPayload> = {}): UserPreferencesPayload {
  return {
    schemaVersion: 1,
    householdSize: 2,
    cookingSkill: "orta",
    maxPrepMinutes: 45,
    dietary: { glutenFree: false, lactoseFree: false, vegetarian: false, vegan: false, avoidedIngredients: [], allergies: [] },
    equipment: { hasOven: true, hasAirFryer: false, hasPressureCooker: false, hasBlender: false, stovetopOnly: false },
    mealComplexity: { lunch: "tek_cesit", dinner: "tek_cesit" },
    includedMeals: ["aksam"],
    cuisinePreferences: ["kirmizi_et"],
    daysCount: 7,
    ...overrides,
  };
}

function makeService() {
  return new PlanService({
    provider: new MockLLMProvider([]), // artık kullanılmıyor — bkz. PlanServiceDeps.provider dokümantasyonu
    cache: new NodeCacheProvider(),
    staleCache: new NodeCacheProvider(),
    inflight: new InflightRegistry(),
    cacheTtlSeconds: 60,
    staleCacheTtlSeconds: 604800,
  });
}

describe("PlanService.generatePlan (katalog tabanlı)", () => {
  it("geçerli bir istekten temiz bir plan üretir, shoppingList/summary sunucuda hesaplanır", async () => {
    const service = makeService();

    const result = await service.generatePlan(basePayload(), "req-1");

    expect(result.meta.source).toBe("ai");
    expect(result.data.days).toHaveLength(7);
    expect(result.data.shoppingList.itemCount).toBeGreaterThan(0);
    expect(result.data.summary.totalMeals).toBe(7);
    // Her gün en az bir akşam yemeği içermeli (includedMeals: ["aksam"]).
    for (const day of result.data.days) {
      expect(day.meals.length).toBeGreaterThan(0);
      expect(day.meals.every((m) => m.type === "aksam")).toBe(true);
    }
  });

  it("aynı payload ikinci kez istenince cache-hit olur", async () => {
    const service = makeService();

    const first = await service.generatePlan(basePayload(), "req-1");
    const second = await service.generatePlan(basePayload(), "req-2");

    expect(second.meta.source).toBe("cache");
    expect(second.data.planId).toBe(first.data.planId);
  });

  it("kaçınılan malzeme içeren tarifler kataloğa hiç seçilmez (seçim ÖNCESİ filtrelenir)", async () => {
    const service = makeService();

    // "sogan" (soğan) neredeyse tüm tariflerde geçer — kaçınılınca kataloğun
    // büyük kısmı elenir ama hâlâ soğansız tarifler (örn. hamsi_tava, kısır vb.) kalmalı.
    const result = await service.generatePlan(
      basePayload({ dietary: { glutenFree: false, lactoseFree: false, vegetarian: false, vegan: false, avoidedIngredients: ["sogan"], allergies: [] } }),
      "req-1"
    );

    const allIngredientSlugs = result.data.days.flatMap((d) => d.meals.flatMap((m) => m.subRecipes.flatMap((s) => s.ingredients.map((i) => i.slug))));
    expect(allIngredientSlugs).not.toContain("sogan");
  });

  // Kısıtlar seçimden ÖNCE filtre olarak uygulandığı için "ihlal" artık üretilemez
  // (eski LLM sisteminin düzeltme turu/BUSINESS_RULE_VIOLATION senaryosu) — ancak
  // kısıtlar kataloğun TAMAMINI eleyecek kadar aşırıysa hâlâ net bir hata döner.
  it("hiçbir tarif kısıtları karşılamıyorsa BUSINESS_RULE_VIOLATION fırlatır", async () => {
    const service = makeService();

    await expect(
      service.generatePlan(basePayload({ maxPrepMinutes: 1 }), "req-1") // katalogdaki en hızlı tarif bile 1 dakikadan uzun
    ).rejects.toMatchObject({ code: "BUSINESS_RULE_VIOLATION" });
  });

  it("5 eşzamanlı aynı istek yalnızca 1 üretim tetikler (inflight dedup)", async () => {
    const service = makeService();

    const results = await Promise.all(Array.from({ length: 5 }, (_, i) => service.generatePlan(basePayload(), `req-${i}`)));

    for (const r of results) {
      expect(r.data.planId).toBe(results[0]!.data.planId); // hepsi aynı üretimin sonucunu aldı
    }
  });
});
