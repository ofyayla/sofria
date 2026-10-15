import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

export function requestContextMiddleware(req: Request, _res: Response, next: NextFunction): void {
  req.requestId = randomUUID();
  req.startTime = Date.now();
  next();
}
