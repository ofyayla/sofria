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

function buildTestApp(maxRequests: number) {
  const deps = {
    cache: new NodeCacheProvider(),
    staleCache: new NodeCacheProvider(),
    inflight: new InflightRegistry(),
    cacheTtlSeconds: 60,
    staleCacheTtlSeconds: 604800,
    retry: { maxAttempts: 1, baseDelayMs: 5 },
  };
  // Provider'a hiç istek gitmeyecek — rate limit istekleri validate.middleware'e
  // ulaşmadan (isteğe göre) veya validate'ten hemen sonra keser, önemli değil.
  const provider = new MockLLMProvider([]);
  const planService = new PlanService({ provider, ...deps });
  return createApp({ planService, cache: deps.cache, rateLimit: { windowMs: 60_000, max: maxRequests } });
}

describe("Rate limiting (SDD §1.5 RATE_LIMITED)", () => {
  it("izin verilen istek sayısı aşılınca 429 RATE_LIMITED döner", async () => {
    const app = buildTestApp(2); // pencere başına yalnızca 2 istek

    // İlk 2 istek limit içinde — ama bunlar VALIDATION_ERROR ile 422 dönecek
    // (geçersiz payload), önemli olan rate limiter'a takılmamaları.
    const res1 = await request(app).post("/api/v1/plan").send({});
    const res2 = await request(app).post("/api/v1/plan").send({});
    expect(res1.status).not.toBe(429);
    expect(res2.status).not.toBe(429);

    // 3. istek limiti aşmalı.
    const res3 = await request(app).post("/api/v1/plan").send({});
    expect(res3.status).toBe(429);
    expect(res3.body.ok).toBe(false);
    expect(res3.body.error.code).toBe("RATE_LIMITED");
    expect(res3.body.error.retryAfterSec).toBeGreaterThan(0);
  });

  it("limit farklı endpoint'ler (plan ve quick-meal) arasında PAYLAŞILIR (aynı IP, aynı pencere)", async () => {
    const app = buildTestApp(2);

    await request(app).post("/api/v1/plan").send({});
    await request(app).post("/api/v1/quick-meal").send({});

    // İki farklı endpoint'e gitse de toplamda 2 istek — 3.'sü hangi endpoint olursa olsun kesilmeli.
    const res3 = await request(app).post("/api/v1/plan").send({});
    expect(res3.status).toBe(429);
  });

  it("health endpoint rate limit'e tabi DEĞİL", async () => {
    const app = buildTestApp(1);
    await request(app).post("/api/v1/plan").send(validPayload()); // limiti tüket

    // health hâlâ 200 dönmeli
    const health = await request(app).get("/api/v1/health");
    expect(health.status).toBe(200);
  });
});
