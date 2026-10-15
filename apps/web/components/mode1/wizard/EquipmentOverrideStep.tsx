import type { EquipmentConstraints } from "@sofria/shared";
import { EquipmentToggleGroup } from "../../shared/RulesProfile/EquipmentToggleGroup";

export interface EquipmentOverrideStepProps {
  effectiveEquipment: EquipmentConstraints;
  onOverride: (partial: Partial<EquipmentConstraints>) => void;
}

export function EquipmentOverrideStep({ effectiveEquipment, onOverride }: EquipmentOverrideStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display font-bold text-[26px] tracking-[-0.4px] text-ink">Mutfak ekipmanı</h2>
        <p className="text-[15px] text-ink-secondary mt-1">Bu da "Kurallarım"dan geliyor, yalnızca bu plan için değiştirebilirsiniz.</p>
      </div>
      <EquipmentToggleGroup equipment={effectiveEquipment} onChange={onOverride} />
    </div>
  );
}
