import { normalizeForLookup } from "../utils/trLocale.js";

/** requiredEquipment listesinde fırın geçip geçmediğini denetler (post-check için). */
export function mentionsOven(equipmentList: string[]): boolean {
  return equipmentList.some((e) => {
    const n = normalizeForLookup(e);
    return n.includes("fırın") || n.includes("firin") || n.includes("oven");
  });
}
