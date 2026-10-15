import type { z } from "zod";
import { AppError } from "../../errors/AppError.js";
import { buildRepairPrompt } from "../../prompts/repair.prompt.js";
import type { LLMProvider } from "./llmProvider.interface.js";
import { withRetry } from "./retry.policy.js";

export interface GenerateStructuredParams<T> {
  provider: LLMProvider;
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
  retry?: { maxAttempts: number; baseDelayMs: number } | undefined;
}

export interface GenerateStructuredResult<T> {
  data: T;
  modelId: string;
  /** Kaç onarım turu gerekti — 0 ise ilk denemede şemaya uydu (prompt kalite metriği). */
  repairAttempts: number;
}

interface ParseOutcome<T> {
  success: boolean;
  data?: T;
  errorMessage?: string;
}

/**
 * Gerçek üretim hatası: diğer çok-kelimeli birimler (yemek_kasigi,
 * cay_bardagi vb.) ASCII-katlanmış olduğu için LLM "diş" birimini de aynı
 * desene uydurup "dis" yazıyor — hem ilk denemede hem onarım turunda (aynı
 * hatayı, hatayı gösteren onarım promptundan SONRA bile tekrarlıyor). Birimi
 * kullanıcıya ham olarak gösterdiğimiz için (bkz. ShoppingItemRow.tsx) Zod
 * şemasındaki değeri "dis" yapmak yanlış görünür; bunun yerine JSON'a
 * ayrıştırılmadan ÖNCE bilinen hatayı düzeltiyoruz. Yalnızca `"unit":"dis"`
 * deseni hedeflenir — metnin başka bir yerindeki "dis" alt dizisine dokunmaz.
 */
function normalizeKnownLlmMistakes(rawText: string): string {
  return rawText.replace(/"unit"(\s*:\s*)"dis"/g, '"unit"$1"diş"');
}

function tryParseAndValidate<T>(rawText: string, schema: z.ZodType<T>): ParseOutcome<T> {
  let json: unknown;
  try {
    json = JSON.parse(normalizeKnownLlmMistakes(rawText));
  } catch (err) {
    return { success: false, errorMessage: `Geçersiz JSON: ${(err as Error).message}` };
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    return { success: false, errorMessage: JSON.stringify(result.error.flatten()) };
  }
  return { success: true, data: result.data };
}

/**
 * SDD §1.2 sekans diyagramının "LLM üretimi" dalını uçtan uca uygular:
 * transient hatalarda (timeout/5xx) exponential backoff ile yeniden dener,
 * şema uyumsuzluğunda TEK bir onarım turu atar, o da başarısız olursa
 * MALFORMED_AI_RESPONSE fırlatır. PlanService (F5)
 * bu fonksiyonu çağırır, retry/repair detaylarını bilmesine gerek kalmaz.
 */
export async function generateStructured<T>(
  params: GenerateStructuredParams<T>
): Promise<GenerateStructuredResult<T>> {
  const retryOptions = params.retry ?? { maxAttempts: 3, baseDelayMs: 500 };

  const firstAttempt = await withRetry(
    () => params.provider.generate({ systemPrompt: params.systemPrompt, userPrompt: params.userPrompt }),
    retryOptions
  );

  const firstOutcome = tryParseAndValidate(firstAttempt.text, params.schema);
  if (firstOutcome.success) {
    return { data: firstOutcome.data as T, modelId: firstAttempt.modelId, repairAttempts: 0 };
  }

  // SDD §1.2: "1 kez onarım turu (hata metni geri beslenir)"
  const repairPrompt = buildRepairPrompt({
    originalUserPrompt: params.userPrompt,
    invalidResponseText: firstAttempt.text,
    validationErrorMessage: firstOutcome.errorMessage ?? "Bilinmeyen doğrulama hatası",
  });

  const repairAttempt = await withRetry(
    () => params.provider.generate({ systemPrompt: params.systemPrompt, userPrompt: repairPrompt }),
    retryOptions
  );

  const repairOutcome = tryParseAndValidate(repairAttempt.text, params.schema);
  if (repairOutcome.success) {
    return { data: repairOutcome.data as T, modelId: repairAttempt.modelId, repairAttempts: 1 };
  }

  throw new AppError(
    "MALFORMED_AI_RESPONSE",
    `LLM yanıtı onarım turundan sonra da şemaya uymadı: ${repairOutcome.errorMessage}`,
    { retryable: false }
  );
}
