import { describe, expect, it } from "vitest";
import { buildCacheKey, canonicalize, hashPayload } from "../../src/cache/cacheKey.builder.js";

describe("cacheKey.builder", () => {
  it("aynı payload aynı hash'i üretir", () => {
    const payload = { householdSize: 3, budgetLevel: "orta" };
    expect(hashPayload(payload)).toBe(hashPayload({ householdSize: 3, budgetLevel: "orta" }));
  });

  // SDD §1: "aynı tercihin farklı yazımı farklı cacheKey üretirse önbellek çöker"
  it("obje anahtar sırası farklı olsa da aynı hash üretilir", () => {
    const a = hashPayload({ a: 1, b: 2, c: 3 });
    const b = hashPayload({ c: 3, a: 1, b: 2 });
    expect(a).toBe(b);
  });

  it("farklı payload farklı hash üretir", () => {
    const a = hashPayload({ householdSize: 3 });
    const b = hashPayload({ householdSize: 4 });
    expect(a).not.toBe(b);
  });

  it("iç içe objelerde de anahtar sırası fark etmez", () => {
    const a = hashPayload({ dietary: { glutenFree: true, vegan: false } });
    const b = hashPayload({ dietary: { vegan: false, glutenFree: true } });
    expect(a).toBe(b);
  });

  it("dizi SIRASI hash'i etkiler (normalizasyon burada yapılmaz, üst katmanın sorumluluğu)", () => {
    const a = hashPayload({ cuisinePreferences: ["balik_urunleri", "italyan_mutfagi"] });
    const b = hashPayload({ cuisinePreferences: ["italyan_mutfagi", "balik_urunleri"] });
    expect(a).not.toBe(b);
  });

  it("buildCacheKey doğru formatı üretir: v{schema}:p{prompt}:{mode}:{hash16}", () => {
    const key = buildCacheKey({
      schemaVersion: 1,
      promptVersion: "1.0.0",
      mode: "weekly_plan",
      payload: { a: 1 },
    });
    expect(key).toMatch(/^v1:p1\.0\.0:weekly_plan:[a-f0-9]{16}$/);
  });

  // SDD §1.2: promptVersion arttığında eski kayıtlar otomatik "farklı anahtar" sayılmalı.
  it("promptVersion değişince aynı payload için farklı key üretilir", () => {
    const base = { schemaVersion: 1, mode: "weekly_plan" as const, payload: { a: 1 } };
    const keyV1 = buildCacheKey({ ...base, promptVersion: "1.0.0" });
    const keyV2 = buildCacheKey({ ...base, promptVersion: "1.1.0" });
    expect(keyV1).not.toBe(keyV2);
  });

  it("mode değişince aynı payload için farklı key üretilir", () => {
    const base = { schemaVersion: 1, promptVersion: "1.0.0", payload: { a: 1 } };
    const planKey = buildCacheKey({ ...base, mode: "weekly_plan" });
    const quickKey = buildCacheKey({ ...base, mode: "quick_meal" });
    expect(planKey).not.toBe(quickKey);
  });

  it("canonicalize deterministik bir string üretir", () => {
    expect(canonicalize({ b: 2, a: 1 })).toBe('{"a":1,"b":2}');
  });
});
