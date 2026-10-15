import type { DietaryConstraints, EquipmentConstraints } from "@sofria/shared";

/**
 * SDD §4.2: "effectiveConstraints = merge(rulesProfile.store,
 * preferences.store.sessionOverrides)". Sunucuya giden payload HER ZAMAN
 * bu fonksiyondan geçer — kalıcı profil varsayılan, oturum geçersiz
 * kılmaları yalnızca bu tek istek için üzerine yazar.
 */
export function mergeDietary(base: DietaryConstraints, overrides: Partial<DietaryConstraints>): DietaryConstraints {
  return { ...base, ...overrides };
}

export function mergeEquipment(base: EquipmentConstraints, overrides: Partial<EquipmentConstraints>): EquipmentConstraints {
  return { ...base, ...overrides };
}
