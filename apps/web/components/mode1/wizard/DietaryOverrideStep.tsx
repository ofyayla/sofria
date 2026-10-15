import type { DietaryConstraints } from "@sofria/shared";
import { AllergyInput } from "../../shared/RulesProfile/AllergyInput";
import { AvoidedIngredientsInput } from "../../shared/RulesProfile/AvoidedIngredientsInput";
import { DietaryToggleGroup } from "../../shared/RulesProfile/DietaryToggleGroup";

export interface DietaryOverrideStepProps {
  effectiveDietary: DietaryConstraints;
  onOverride: (partial: Partial<DietaryConstraints>) => void;
}

export function DietaryOverrideStep({ effectiveDietary, onOverride }: DietaryOverrideStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display font-bold text-[26px] tracking-[-0.4px] text-ink">Diyet & alerji</h2>
        <p className="text-[15px] text-ink-secondary mt-1">
          "Kurallarım"da kayıtlı tercihleriniz burada. Değişiklik yaparsanız yalnızca bu plan için geçerli olur,
          kalıcı ayarlarınız değişmez.
        </p>
      </div>
      <DietaryToggleGroup dietary={effectiveDietary} onChange={onOverride} />
      <AvoidedIngredientsInput
        avoidedIngredients={effectiveDietary.avoidedIngredients}
        onAdd={(raw) => onOverride({ avoidedIngredients: [...effectiveDietary.avoidedIngredients, raw] })}
        onRemove={(raw) =>
          onOverride({ avoidedIngredients: effectiveDietary.avoidedIngredients.filter((i) => i !== raw) })
        }
      />
      <AllergyInput
        allergies={effectiveDietary.allergies}
        onAdd={(raw) => onOverride({ allergies: [...effectiveDietary.allergies, raw] })}
        onRemove={(raw) => onOverride({ allergies: effectiveDietary.allergies.filter((i) => i !== raw) })}
      />
    </div>
  );
}
