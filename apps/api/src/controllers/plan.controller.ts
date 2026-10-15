import type { NextFunction, Request, Response } from "express";
import type { UserPreferencesPayload } from "@sofria/shared";
import type { PlanService } from "../services/plan/plan.service.js";

export function createPlanController(planService: PlanService) {
  return async function generatePlanHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as UserPreferencesPayload;
      const result = await planService.generatePlan(payload, req.requestId);
      res.status(200).json({ ok: true, data: result.data, meta: result.meta });
    } catch (err) {
      next(err);
    }
  };
}
