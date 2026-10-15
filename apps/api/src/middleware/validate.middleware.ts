import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

export function validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      const flatErrors = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      for (const [field, messages] of Object.entries(flatErrors)) {
        if (messages && messages.length > 0) fieldErrors[field] = messages.join(", ");
      }

      res.status(422).json({
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "İstek gövdesi geçersiz.",
          retryable: false,
          fieldErrors,
        },
        meta: { requestId: req.requestId, latencyMs: Date.now() - req.startTime },
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
