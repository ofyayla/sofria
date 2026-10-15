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

function buildTestApp(mockResponses: Array<{ text: string }>) {
  const provider = new MockLLMProvider(mockResponses);
  const deps = { cache: new NodeCacheProvider(), staleCache: new NodeCacheProvider(), inflight: new InflightRegistry(), cacheTtlSeconds: 60, staleCacheTtlSeconds: 604800, retry: { maxAttempts: 1, baseDelayMs: 5 } };
  const planService = new PlanService({ provider, ...deps });
  return createApp({ planService, cache: deps.cache });
}

describe("GET /api/v1/health", () => {
  it("200 ve status:ok döner", async () => {
    const app = buildTestApp([]);
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("POST /api/v1/plan", () => {
  it("geçerli payload ile 200 ve ok:true döner", async () => {
    const app = buildTestApp([{ text: JSON.stringify(minimalPlanJson()) }]);
    const res = await request(app).post("/api/v1/plan").send(validPayload());

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.days).toHaveLength(7);
    expect(res.body.meta.requestId).toBeDefined();
  });

  // SDD §1.5: eksik zorunlu alan → 422 VALIDATION_ERROR + fieldErrors
  it("eksik zorunlu alan ile 422 VALIDATION_ERROR döner", async () => {
    const app = buildTestApp([]);
    const invalidPayload = { ...validPayload(), cuisinePreferences: [] }; // min 1 zorunlu

    const res = await request(app).post("/api/v1/plan").send(invalidPayload);

    expect(res.status).toBe(422);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.fieldErrors).toBeDefined();
  });

  it("tanımsız bir alana istek atılırsa 404 NOT_FOUND döner", async () => {
    const app = buildTestApp([]);
    const res = await request(app).get("/api/v1/olmayan-endpoint");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  // Katalog tabanlı seçimde kısıtlar seçimden ÖNCE filtre olarak uygulanır —
  // hiçbir tarif kalmazsa BUSINESS_RULE_VIOLATION (eski "bozuk LLM JSON'ı"
  // senaryosunun yerini alan, artık gerçekleşebilecek TEK hata sınıfı).
  it("hiçbir tarif kısıtları karşılamıyorsa 422 BUSINESS_RULE_VIOLATION döner", async () => {
    const app = buildTestApp([]);
    const res = await request(app)
      .post("/api/v1/plan")
      .send({ ...validPayload(), maxPrepMinutes: 15 });

    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
