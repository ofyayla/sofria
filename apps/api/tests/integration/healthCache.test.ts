import { describe, expect, it } from "vitest";
import request from "supertest";
import type { UserPreferencesPayload } from "@sofria/shared";
import { createApp } from "../../src/app.js";
import { InflightRegistry } from "../../src/cache/inflight.registry.js";
import { NodeCacheProvider } from "../../src/cache/nodeCache.provider.js";
import { MockLLMProvider } from "../../src/services/llm/mockLLMProvider.js";
import { PlanService } from "../../src/services/plan/plan.service.js";

function validPayload(): UserPreferencesPayload {
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
  };
}

function minimalPlanJson() {
  const day = (i: number) => ({
    dayIndex: i,
    dayName: "Gün",
    meals: [
      {
        mealId: `m${i}`,
        type: "aksam",
        title: "Test",
        complexity: "tek_cesit",
        cuisineTag: "kirmizi_et",
        totalPrepMinutes: 20,
        subRecipes: [
          {
            subRecipeId: `s${i}`,
            name: "Test",
            role: "ana_yemek",
            servings: 2,
            prepMinutes: 10,
            cookMinutes: 10,
            difficulty: "kolay",
            ingredients: [{ slug: "sogan", displayName: "Kuru soğan", amount: 1, unit: "adet", isPantryStaple: true }],
            instructions: [{ order: 1, text: "Pişir." }],
            requiredEquipment: ["tencere"],
          },
        ],
      },
    ],
  });
  return { days: Array.from({ length: 7 }, (_, i) => day(i)) };
}

describe("GET /api/v1/health/cache", () => {
  it("boş bir cache ile keyCount:0, hitRate:0 döner", async () => {
    const cache = new NodeCacheProvider();
    const deps = { cache, staleCache: new NodeCacheProvider(), inflight: new InflightRegistry(), cacheTtlSeconds: 60, staleCacheTtlSeconds: 604800, retry: { maxAttempts: 1, baseDelayMs: 5 } };
    const provider = new MockLLMProvider([]);
    const app = createApp({
      planService: new PlanService({ provider, ...deps }),
      cache,
    });

    const res = await request(app).get("/api/v1/health/cache");

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.keyCount).toBe(0);
    expect(res.body.data.hitRate).toBe(0);
  });

  it("bir plan cache'lendikten sonra keyCount ve hitRate gerçekten güncellenir", async () => {
    const cache = new NodeCacheProvider();
    const deps = { cache, staleCache: new NodeCacheProvider(), inflight: new InflightRegistry(), cacheTtlSeconds: 60, staleCacheTtlSeconds: 604800, retry: { maxAttempts: 1, baseDelayMs: 5 } };
    const provider = new MockLLMProvider([{ text: JSON.stringify(minimalPlanJson()) }]);
    const planService = new PlanService({ provider, ...deps });
    const app = createApp({ planService, cache });

    // İlk istek: cache-miss, LLM'e gider, sonucu cache'e yazar.
    await request(app).post("/api/v1/plan").send(validPayload());
    // İkinci istek: aynı payload → cache-hit.
    await request(app).post("/api/v1/plan").send(validPayload());

    const res = await request(app).get("/api/v1/health/cache");

    expect(res.body.data.keyCount).toBe(1);
    expect(res.body.data.hitRate).toBeGreaterThan(0); // en az 1 hit var
    expect(res.body.data.avgGenerationMs).toBeGreaterThanOrEqual(0);
  });
});
