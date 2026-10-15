import type { MealComplexity } from "@sofria/shared";
import type { MealType } from "../../../stores/preferences.store";

const COMPLEXITY_INFO: Record<MealComplexity, { title: string; desc: string }> = {
  tek_cesit: { title: "Tek çeşit", desc: "Tek kap pratik yemek veya çorba" },
  iki_cesit: { title: "İki çeşit", desc: "Ana yemek + yan lezzet/pilav/salata" },
  tam_menu: { title: "Tam menü", desc: "Çorba + ana yemek + yan lezzet" },
};

export interface ComplexityStepProps {
  lunch: MealComplexity | undefined;
  dinner: MealComplexity | undefined;
  includedMeals: MealType[];
  onChange: (part: Partial<{ lunch: MealComplexity; dinner: MealComplexity }>) => void;
}

function ComplexityPicker({
  label,
  value,
  onSelect,
}: {
  label: string;
  value: MealComplexity | undefined;
  onSelect: (v: MealComplexity) => void;
}) {
  return (
    <div>
      <p className="font-sans font-medium text-[13px] text-ink-secondary mb-2.5">{label}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(Object.keys(COMPLEXITY_INFO) as MealComplexity[]).map((complexity) => {
          const info = COMPLEXITY_INFO[complexity];
          const isActive = value === complexity;
          return (
            <button
              key={complexity}
              type="button"
              onClick={() => onSelect(complexity)}
              aria-pressed={isActive}
              className={
                isActive
                  ? "relative flex flex-col gap-1 px-4 py-4 rounded-card bg-brand-soft border-[1.5px] border-brand text-left transition-all duration-100"
                  : "relative flex flex-col gap-1 px-4 py-4 rounded-card bg-surface text-left transition-all duration-100"
              }
            >
              <span className={isActive ? "text-[17px] font-semibold text-brand" : "text-[17px] font-semibold text-ink"}>{info.title}</span>
              <span className="text-[14px] text-ink-muted">{info.desc}</span>
              {isActive && (
                <span className="absolute top-2 right-2 w-[26px] h-[26px] rounded-full bg-brand text-on-brand flex items-center justify-center text-[13px]">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ComplexityStep({ lunch, dinner, includedMeals, onChange }: ComplexityStepProps) {
  const showLunch = includedMeals.includes("ogle");
  const showDinner = includedMeals.includes("aksam");

  return (
    <div className="flex flex-col gap-8">
      <h2 className="font-display font-bold text-[26px] tracking-[-0.4px] text-ink">Öğün çeşidi</h2>
      {showLunch && <ComplexityPicker label="Öğle yemeği" value={lunch} onSelect={(v) => onChange({ lunch: v })} />}
      {showDinner && <ComplexityPicker label="Akşam yemeği" value={dinner} onSelect={(v) => onChange({ dinner: v })} />}
      {!showLunch && !showDinner && (
        <p className="text-[15px] text-ink-secondary">
          Sadece kahvaltı seçtiğiniz için bu adımda ayarlanacak bir şey yok — kahvaltı öğünü tek çeşit hazırlanır.
        </p>
      )}
    </div>
  );
}
