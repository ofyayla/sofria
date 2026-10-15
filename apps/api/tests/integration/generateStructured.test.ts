import { describe, expect, it } from "vitest";
import { z } from "zod";
import { unitSchema } from "@sofria/shared";
import { AppError } from "../../src/errors/AppError.js";
import { generateStructured } from "../../src/services/llm/generateStructured.js";
import { MockLLMProvider } from "../../src/services/llm/mockLLMProvider.js";

const toySchema = z.object({
  planId: z.string(),
  days: z.number().int().min(1).max(7),
});

describe("generateStructured", () => {
  it("ilk denemede şemaya uyarsa onarım turu ATILMAZ (repairAttempts=0)", async () => {
    const provider = new MockLLMProvider([{ text: JSON.stringify({ planId: "p1", days: 7 }) }]);

    const result = await generateStructured({
      provider,
      systemPrompt: "sys",
      userPrompt: "user",
      schema: toySchema,
    });

    expect(result.data).toEqual({ planId: "p1", days: 7 });
    expect(result.repairAttempts).toBe(0);
    expect(provider.callCount).toBe(1);
  });

  // SDD §1.2: "Şema uyumsuz → 1 kez onarım turu (hata metni geri beslenir)"
  it("ilk yanıt geçersiz JSON, onarım turunda düzelirse başarılı döner (repairAttempts=1)", async () => {
    const provider = new MockLLMProvider([
      { text: "bu geçerli bir JSON değil {{{" },
      { text: JSON.stringify({ planId: "p2", days: 5 }) },
    ]);

    const result = await generateStructured({
      provider,
      systemPrompt: "sys",
      userPrompt: "user",
      schema: toySchema,
    });

    expect(result.data).toEqual({ planId: "p2", days: 5 });
    expect(result.repairAttempts).toBe(1);
    expect(provider.callCount).toBe(2);

    // Onarım prompt'u hata mesajını gerçekten içeriyor mu?
    const repairCallPrompt = provider.receivedPrompts[1]!.userPrompt;
    expect(repairCallPrompt).toContain("Önceki (hatalı) yanıtın");
    expect(repairCallPrompt).toContain("bu geçerli bir JSON değil");
  });

  it("ilk yanıt şemaya uymuyor (days:10, max 7), onarımda düzelirse başarılı döner", async () => {
    const provider = new MockLLMProvider([
      { text: JSON.stringify({ planId: "p3", days: 10 }) }, // şema dışı: max 7
      { text: JSON.stringify({ planId: "p3", days: 7 }) },
    ]);

    const result = await generateStructured({
      provider,
      systemPrompt: "sys",
      userPrompt: "user",
      schema: toySchema,
    });

    expect(result.data.days).toBe(7);
    expect(result.repairAttempts).toBe(1);
  });

  // SDD §1.2: onarım turu da başarısız olursa MALFORMED_AI_RESPONSE fırlatılmalı
  it("hem ilk deneme hem onarım turu başarısız olursa MALFORMED_AI_RESPONSE fırlatır", async () => {
    const provider = new MockLLMProvider([
      { text: "geçersiz {{{" },
      { text: "bu da geçersiz {{{" },
    ]);

    await expect(
      generateStructured({ provider, systemPrompt: "sys", userPrompt: "user", schema: toySchema })
    ).rejects.toMatchObject({ code: "MALFORMED_AI_RESPONSE" });

    expect(provider.callCount).toBe(2); // yalnızca 1 onarım turu — sonsuz döngü yok
  });

  // Gerçek üretim hatası: LLM diğer çok-kelimeli birimlerin (yemek_kasigi vb.)
  // ASCII-katlanmış olmasından ötürü "diş" birimini "dis" yazıyordu — hem ilk
  // denemede hem onarım turunda, MALFORMED_AI_RESPONSE'a kadar gidiyordu.
  it("LLM 'unit':'dis' yazarsa onarım turuna hiç gerek kalmadan sessizce 'diş'e düzeltilir", async () => {
    const unitSchemaForTest = z.object({ unit: unitSchema });
    const provider = new MockLLMProvider([{ text: '{"unit":"dis"}' }]);

    const result = await generateStructured({
      provider,
      systemPrompt: "sys",
      userPrompt: "user",
      schema: unitSchemaForTest,
    });

    expect(result.data).toEqual({ unit: "diş" });
    expect(result.repairAttempts).toBe(0);
  });

  // SDD §1.2: "Timeout / 5xx / 429 → yeniden dene (exponential backoff, max 2)"
  it("transient hata (UPSTREAM_TIMEOUT) retry ile kurtarılır, şema onarım turuna hiç gerek kalmaz", async () => {
    const provider = new MockLLMProvider([
      { error: new AppError("UPSTREAM_TIMEOUT", "zaman aşımı", { retryable: true }) },
      { text: JSON.stringify({ planId: "p4", days: 3 }) },
    ]);

    const result = await generateStructured({
      provider,
      systemPrompt: "sys",
      userPrompt: "user",
      schema: toySchema,
      retry: { maxAttempts: 3, baseDelayMs: 5 },
    });

    expect(result.data).toEqual({ planId: "p4", days: 3 });
    expect(result.repairAttempts).toBe(0); // bu bir transient hata retry'ıydı, şema onarımı değil
  });

  it("transient hata retry limitini de aşarsa hata yukarı fırlatılır", async () => {
    const provider = new MockLLMProvider([
      { error: new AppError("UPSTREAM_UNAVAILABLE", "sürekli çöküyor", { retryable: true }) },
      { error: new AppError("UPSTREAM_UNAVAILABLE", "sürekli çöküyor", { retryable: true }) },
    ]);

    await expect(
      generateStructured({
        provider,
        systemPrompt: "sys",
        userPrompt: "user",
        schema: toySchema,
        retry: { maxAttempts: 2, baseDelayMs: 5 },
      })
    ).rejects.toMatchObject({ code: "UPSTREAM_UNAVAILABLE" });
  });
});
