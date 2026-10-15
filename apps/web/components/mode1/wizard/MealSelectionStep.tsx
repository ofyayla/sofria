import type { MealType } from "../../../stores/preferences.store";

const MEAL_LABELS: Record<MealType, string> = { kahvalti: "Kahvaltı", ogle: "Öğle", aksam: "Akşam" };

export interface MealSelectionStepProps {
  includedMeals: MealType[];
  onToggleMeal: (meal: MealType) => void;
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "h-11 px-[18px] rounded-chip text-[16px] font-medium bg-brand text-on-brand transition-all duration-100"
          : "h-11 px-[18px] rounded-chip text-[16px] font-medium bg-surface-muted border border-divider text-ink-secondary transition-all duration-100"
      }
    >
      {children}
    </button>
  );
}

/**
 * Gerçek kullanıcı talebi: "hangi öğünler dahil olsun?" seçimi kendi
 * BAĞIMSIZ sayfası olsun — hane seçiminden hemen sonra, Çeşit adımına
 * karıştırılmadan (bkz. ComplexityStep.tsx, artık yalnızca seçilen
 * öğünlerin çeşidini soruyor).
 */
export function MealSelectionStep({ includedMeals, onToggleMeal }: MealSelectionStepProps) {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="font-display font-bold text-[26px] tracking-[-0.4px] text-ink">Öğünler</h2>
      <div>
        <p className="font-sans font-medium text-[13px] text-ink-secondary mb-2.5">Hangi öğünler dahil olsun?</p>
        <div className="flex flex-wrap gap-2.5">
          {(Object.keys(MEAL_LABELS) as MealType[]).map((meal) => (
            <Pill key={meal} active={includedMeals.includes(meal)} onClick={() => onToggleMeal(meal)}>
              {MEAL_LABELS[meal]}
            </Pill>
          ))}
        </div>
      </div>
    </div>
  );
}
