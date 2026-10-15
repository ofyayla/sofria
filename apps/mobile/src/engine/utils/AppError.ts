import type { ErrorCode } from "@sofria/shared";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly retryable: boolean;
  readonly retryAfterSec?: number;

  constructor(code: ErrorCode, message: string, options?: { retryable?: boolean; retryAfterSec?: number }) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.retryable = options?.retryable ?? false;
    if (options?.retryAfterSec !== undefined) {
      this.retryAfterSec = options.retryAfterSec;
    }
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
