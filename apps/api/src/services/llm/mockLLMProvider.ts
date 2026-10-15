import type { LLMGenerateParams, LLMGenerateResult, LLMProvider } from "./llmProvider.interface.js";

/**
 * Test amaçlı sahte sağlayıcı. Sıradaki yanıtları önceden tanımlarsın,
 * her `generate()` çağrısında sıradaki yanıtı döner veya sıradaki hatayı fırlatır.
 * Gerçek Gemini API'ye hiç istek atmaz — F4'ün retry/onarım mantığını
 * gerçek ağ bağlantısı olmadan test etmemizi sağlayan şey budur.
 */
export class MockLLMProvider implements LLMProvider {
  private readonly queue: Array<{ text: string } | { error: Error }>;
  callCount = 0;
  readonly receivedPrompts: LLMGenerateParams[] = [];

  constructor(queue: Array<{ text: string } | { error: Error }>) {
    this.queue = [...queue];
  }

  async generate(params: LLMGenerateParams): Promise<LLMGenerateResult> {
    this.callCount++;
    this.receivedPrompts.push(params);

    const next = this.queue.shift();
    if (!next) {
      throw new Error("MockLLMProvider: sırada başka yanıt yok — testte yetersiz sayıda yanıt tanımlanmış.");
    }
    if ("error" in next) throw next.error;
    return { text: next.text, modelId: "mock-model" };
  }
}
