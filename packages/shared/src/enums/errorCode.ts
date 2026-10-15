/**
 * SDD §1.5 Hata Yönetimi Matrisi ile birebir eşleşir.
 * Yeni bir hata kodu eklerken SDD'deki tabloyu da güncelle.
 */
export const ERROR_CODES = [
  "VALIDATION_ERROR",
  "RATE_LIMITED",
  "UPSTREAM_TIMEOUT",
  "UPSTREAM_UNAVAILABLE",
  "MALFORMED_AI_RESPONSE",
  "BUSINESS_RULE_VIOLATION",
  "NOT_FOUND",
  "INTERNAL_ERROR",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];
