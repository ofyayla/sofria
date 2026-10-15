import { isAppError } from "../../errors/AppError.js";

export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  /** Varsayılan: AppError.retryable alanına bakar. */
  isRetryable?: (err: unknown) => boolean;
}

function defaultIsRetryable(err: unknown): boolean {
  return isAppError(err) ? err.retryable : true;
}

/**
 * SDD §1.2: "Timeout / 5xx / 429 → yeniden dene (exponential backoff, max 2)".
 * `isRetryable` false dönerse (örn. VALIDATION_ERROR gibi kalıcı bir hata)
 * beklemeden hemen fırlatılır — gereksiz yere 2 kez daha aynı hatayı almayız.
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  const isRetryable = options.isRetryable ?? defaultIsRetryable;
  let lastError: unknown;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isRetryable(err) || attempt === options.maxAttempts) {
        throw err;
      }
      const delay = options.baseDelayMs * 2 ** (attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
