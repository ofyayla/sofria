import { describe, expect, it } from "vitest";
import { AppError } from "../../src/errors/AppError.js";
import { withRetry } from "../../src/services/llm/retry.policy.js";

describe("retry.policy", () => {
  it("ilk denemede başarılı olursa hiç bekleme yapmadan döner", async () => {
    let calls = 0;
    const result = await withRetry(
      async () => {
        calls++;
        return "başarılı";
      },
      { maxAttempts: 3, baseDelayMs: 10 }
    );
    expect(result).toBe("başarılı");
    expect(calls).toBe(1);
  });

  it("retryable hata ile 2 kez başarısız olup 3. denemede başarılı olur", async () => {
    let calls = 0;
    const result = await withRetry(
      async () => {
        calls++;
        if (calls < 3) {
          throw new AppError("UPSTREAM_TIMEOUT", "zaman aşımı", { retryable: true });
        }
        return "sonunda başarılı";
      },
      { maxAttempts: 3, baseDelayMs: 5 }
    );
    expect(result).toBe("sonunda başarılı");
    expect(calls).toBe(3);
  });

  it("maxAttempts aşılınca son hatayı fırlatır", async () => {
    let calls = 0;
    await expect(
      withRetry(
        async () => {
          calls++;
          throw new AppError("UPSTREAM_UNAVAILABLE", "sürekli başarısız", { retryable: true });
        },
        { maxAttempts: 2, baseDelayMs: 5 }
      )
    ).rejects.toThrow("sürekli başarısız");
    expect(calls).toBe(2);
  });

  // SDD §1.5: VALIDATION_ERROR gibi kalıcı hatalar retryable=false olmalı, hemen fırlatılmalı.
  it("retryable:false olan hatada hiç yeniden denemez", async () => {
    let calls = 0;
    await expect(
      withRetry(
        async () => {
          calls++;
          throw new AppError("VALIDATION_ERROR", "kalıcı hata", { retryable: false });
        },
        { maxAttempts: 3, baseDelayMs: 5 }
      )
    ).rejects.toThrow("kalıcı hata");
    expect(calls).toBe(1);
  });

  it("bekleme süreleri exponential olarak artar (base * 2^(n-1))", async () => {
    const delays: number[] = [];
    let lastTime = Date.now();
    let calls = 0;

    await expect(
      withRetry(
        async () => {
          const now = Date.now();
          if (calls > 0) delays.push(now - lastTime);
          lastTime = now;
          calls++;
          throw new AppError("UPSTREAM_TIMEOUT", "test", { retryable: true });
        },
        { maxAttempts: 3, baseDelayMs: 30 }
      )
    ).rejects.toThrow();

    // 1. bekleme ~30ms, 2. bekleme ~60ms olmalı — gevşek tolerans (zamanlayıcı sapması için)
    expect(delays[0]).toBeGreaterThanOrEqual(25);
    expect(delays[1]).toBeGreaterThanOrEqual(delays[0]!);
  });
});
