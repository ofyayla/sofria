import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { DISH_IMAGE_SLUGS } from "@sofria/shared";
import { RECIPE_CATALOG } from "../../src/domain/recipeCatalog.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");

function slugsIn(dir: string): string[] {
  return fs
    .readdirSync(path.join(ROOT, dir))
    .filter((f) => f.endsWith(".jpg"))
    .map((f) => f.slice(0, -4))
    .sort();
}

/**
 * Plan oluşturucu fotoğraflı tarifleri öncelikli seçiyor (DISH_IMAGE_SLUGS).
 * Liste, gerçek görsel klasörleriyle birebir aynı kalmalı — yoksa fotoğrafı
 * olan tarif "fotoğrafsız" sayılır ya da tersi.
 */
describe("DISH_IMAGE_SLUGS", () => {
  it("mobil ve web görsel klasörleriyle aynı", () => {
    const listed = [...DISH_IMAGE_SLUGS].sort();
    expect(slugsIn("apps/mobile/assets/images/dishes")).toEqual(listed);
    expect(slugsIn("apps/web/public/dish-images")).toEqual(listed);
  });

  it("yalnızca katalogdaki tariflere ait", () => {
    const catalogSlugs = new Set(RECIPE_CATALOG.map((r) => r.imageSlug));
    const extra = [...DISH_IMAGE_SLUGS].filter((s) => !catalogSlugs.has(s));
    expect(extra).toEqual([]);
  });
});
