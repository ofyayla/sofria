"use client";

import { AllergyInput } from "../../components/shared/RulesProfile/AllergyInput";
import { AvoidedIngredientsInput } from "../../components/shared/RulesProfile/AvoidedIngredientsInput";
import { DietaryToggleGroup } from "../../components/shared/RulesProfile/DietaryToggleGroup";
import { EquipmentToggleGroup } from "../../components/shared/RulesProfile/EquipmentToggleGroup";
import { useRulesProfileStore } from "../../stores/rulesProfile.store";

export default function KurallarimPage() {
  const dietary = useRulesProfileStore((s) => s.dietary);
  const equipment = useRulesProfileStore((s) => s.equipment);
  const setDietary = useRulesProfileStore((s) => s.setDietary);
  const setEquipment = useRulesProfileStore((s) => s.setEquipment);
  const addAvoidedIngredient = useRulesProfileStore((s) => s.addAvoidedIngredient);
  const removeAvoidedIngredient = useRulesProfileStore((s) => s.removeAvoidedIngredient);
  const addAllergy = useRulesProfileStore((s) => s.addAllergy);
  const removeAllergy = useRulesProfileStore((s) => s.removeAllergy);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display font-bold text-[26px] tracking-[-0.4px] text-ink">Mutfak kurallarım</h1>
        <p className="text-[15px] text-ink-secondary mt-1.5">
          Buradaki kurallar kaydedildiği an geçerli olur ve Haftalık Planla tariflerine otomatik uygulanır.
        </p>
      </div>

      <div className="bg-surface rounded-panel p-6 md:p-8 shadow-[0_6px_14px_-2px_rgba(62,107,78,0.10)] flex flex-col gap-8">
        <DietaryToggleGroup dietary={dietary} onChange={setDietary} />
        <EquipmentToggleGroup equipment={equipment} onChange={setEquipment} />
        <AvoidedIngredientsInput
          avoidedIngredients={dietary.avoidedIngredients}
          onAdd={addAvoidedIngredient}
          onRemove={removeAvoidedIngredient}
        />
        <AllergyInput allergies={dietary.allergies} onAdd={addAllergy} onRemove={removeAllergy} />
      </div>
    </div>
  );
}
