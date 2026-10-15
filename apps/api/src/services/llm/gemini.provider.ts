import { GoogleGenAI } from "@google/genai";
import { AppError } from "../../errors/AppError.js";
import { logger } from "../../utils/logger.js";
import type { LLMGenerateParams, LLMGenerateResult, LLMProvider } from "./llmProvider.interface.js";

export interface GeminiProviderOptions {
  apiKey: string;
  /** SDD §1.6: model kimliği env'den gelir, koda gömülmez. */
  modelId: string;
  timeoutMs?: number;
}

export class GeminiProvider implements LLMProvider {
  private readonly client: GoogleGenAI;
  private readonly modelId: string;
  private readonly timeoutMs: number;

  constructor(options: GeminiProviderOptions) {
    this.client = new GoogleGenAI({ apiKey: options.apiKey });
    this.modelId = options.modelId;
    this.timeoutMs = options.timeoutMs ?? 60_000;
  }

  async generate({ systemPrompt, userPrompt }: LLMGenerateParams): Promise<LLMGenerateResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.client.models.generateContent({
        model: this.modelId,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          // SDD §1.6: temperature/top_p/top_k Gemini 3.x'te kullanımdan kaldırıldı —
          // determinizm burada değil, şema + post-check + cache katmanında sağlanıyor.
        },
      });

      const text = response.text;
      if (!text) {
        throw new AppError("MALFORMED_AI_RESPONSE", "Gemini boş yanıt döndü.", { retryable: true });
      }

      return { text, modelId: this.modelId };
    } catch (err) {
      if (err instanceof AppError) throw err;

      if (controller.signal.aborted) {
        throw new AppError("UPSTREAM_TIMEOUT", `Gemini isteği ${this.timeoutMs}ms içinde yanıtlamadı.`, {
          retryable: true,
        });
      }

      // Ham sağlayıcı hatası (ör. Gemini'nin kota/limit mesajları) kullanıcıya
      // hiçbir zaman gösterilmemeli — yalnızca sunucu loguna yazılır, istemciye
      // jenerik bir mesaj gider (bkz. errorHandler.middleware.ts).
      logger.error("gemini_request_failed", { detail: (err as Error).message });
      throw new AppError("UPSTREAM_UNAVAILABLE", "Yapay zeka servisine şu anda ulaşılamıyor.", {
        retryable: true,
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}
