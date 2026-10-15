import Constants from "expo-constants";
import { Platform } from "react-native";
import {
  apiResponseSchema,
  weeklyPlanResponseSchema,
  type ApiResponse,
  type UserPreferencesPayload,
  type WeeklyPlanResponse,
} from "@sofria/shared";
import type { z } from "zod";

/**
 * Web'in aksine tek bir localhost yeterli değil: Android emülatörü kendi
 * loopback'ini 10.0.2.2 üzerinden host makineye yönlendirir, iOS simülatörü
 * doğrudan localhost'u görür, gerçek cihazlarda (LAN veya tunnel) ise Expo Go'nun
 * bundle'ı indirdiği host kullanılmalı — metro.config.js bu host üzerinden gelen
 * /api/v1 isteklerini zaten yerel API'ye (4000) proxy'liyor, bu yüzden ayrı bir
 * IP/port hesabına gerek yok (bkz. EXPO_PUBLIC_API_BASE_URL ile elle geçersiz kılma).
 */
export function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (fromEnv) return fromEnv;

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const isTunnel = hostUri.includes(".exp.direct") || hostUri.includes(".ngrok");
    return `${isTunnel ? "https" : "http"}://${hostUri}/api/v1`;
  }

  const host = Platform.OS === "android" ? "10.0.2.2" : "localhost";
  return `http://${host}:4000/api/v1`;
}

const API_BASE_URL = resolveApiBaseUrl();

/**
 * Yanıt yalnızca backend'in Zod şemasına değil, İSTEMCİNİN de aynı
 * `@sofria/shared` şemasına karşı doğrulanır — SDD §2.2'nin "tek doğruluk
 * kaynağı" ilkesinin üçüncü kullanım yeri (backend doğrulama, LLM şeması,
 * istemci doğrulama). Web'deki apiClient.ts ile birebir aynı mantık.
 */
async function postJson<TReq, TRes>(
  path: string,
  body: TReq,
  responseSchema: z.ZodType<TRes>
): Promise<ApiResponse<TRes>> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // Sunucu (veya araya giren bir proxy) JSON olmayan bir gövde döndürebilir
  // (ör. sunucu tamamen erişilemezken ham bir hata metni) — bu durumda ham
  // JSON.parse hatasını kullanıcıya sızdırmak yerine anlaşılır bir mesaj ver.
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new Error("Sunucudan geçerli bir yanıt alınamadı. Lütfen tekrar deneyin.");
  }
  const parsed = apiResponseSchema(responseSchema).safeParse(json);

  if (!parsed.success) {
    throw new Error(`API yanıtı beklenen şemaya uymuyor: ${parsed.error.message}`);
  }

  const data = parsed.data as ApiResponse<TRes>;

  if (!data.ok) {
    throw new Error(data.error.message);
  }

  return data;
}

export function generatePlan(payload: UserPreferencesPayload): Promise<ApiResponse<WeeklyPlanResponse>> {
  return postJson("/plan", payload, weeklyPlanResponseSchema);
}
