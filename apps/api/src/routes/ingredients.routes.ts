import { Router, type Request, type Response } from "express";
import { suggestIngredients } from "../domain/ingredientSuggest.js";

export function createIngredientsRouter(): Router {
  const router = Router();

  router.get("/ingredients/suggest", (req: Request, res: Response) => {
    const query = typeof req.query.q === "string" ? req.query.q : "";
    const suggestions = suggestIngredients(query);
    res.json({
      ok: true,
      data: suggestions,
      meta: { requestId: req.requestId, latencyMs: Date.now() - req.startTime },
    });
  });

  return router;
}
