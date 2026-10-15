import type { EquipmentConstraints } from "@sofria/shared";

export function buildEquipmentFragment(equipment: EquipmentConstraints): string {
  const lines: string[] = [];

  if (equipment.stovetopOnly || !equipment.hasOven) {
    lines.push(
      "- FIRIN YOK: Fırında pişen hiçbir tarif önerme (fırın kebabı, fırın makarna, " +
        "fırın sebze vb.). Yalnızca ocak/tencere/tava ile hazırlanan tarifler kullan."
    );
  }
  if (!equipment.hasBlender) {
    lines.push("- Blender yok: Blender gerektiren çorba/sos tarifleri önerme (veya el ile ezme alternatifi ver).");
  }
  if (equipment.hasPressureCooker) {
    lines.push("- Düdüklü tencere mevcut: uygun tariflerde pişirme süresini kısaltmak için kullanılabilir.");
  }
  if (equipment.hasAirFryer) {
    lines.push("- Air fryer mevcut: uygun tariflerde alternatif olarak önerilebilir.");
  }

  return lines.length > 0 ? lines.join("\n") : "- Mutfak ekipmanı kısıtı yok.";
}
