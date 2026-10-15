/**
 * SDD §1.6: Model kimliği koda gömülmez. Bu arayüz sayesinde Gemini'den
 * başka bir sağlayıcıya geçiş, tek satırlık bir enjeksiyon değişikliğidir —
 * PlanService (F5) bu arayüzü çağırır, somut sağlayıcıyı bilmez.
 */
export interface LLMGenerateParams {
  systemPrompt: string;
  userPrompt: string;
}

export interface LLMGenerateResult {
  text: string;
  modelId: string;
}

export interface LLMProvider {
  generate(params: LLMGenerateParams): Promise<LLMGenerateResult>;
}
