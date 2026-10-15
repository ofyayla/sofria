export interface HouseholdBudgetStepProps {
  householdAdults: number;
  householdChildren: number;
  childAges: (number | undefined)[];
  onHouseholdAdultsChange: (value: number) => void;
  onHouseholdChildrenChange: (value: number) => void;
  onChildAgeChange: (index: number, age: number) => void;
}

function NumberStepper({
  value,
  min,
  max,
  onChange,
  width = "w-28",
  emptyLabel,
}: {
  value: number | undefined;
  min: number;
  max: number;
  onChange: (value: number) => void;
  width?: string;
  emptyLabel?: string;
}) {
  const isEmpty = value === undefined;
  return (
    <div className={`flex items-center justify-between h-11 ${width} rounded-input bg-surface-muted border border-divider`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, (value ?? min) - 1))}
        disabled={isEmpty}
        className="w-9 h-full flex items-center justify-center text-ink-secondary text-[18px] font-medium disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Azalt"
      >
        −
      </button>
      <span className="text-[16px] tabular-nums font-medium text-ink">{isEmpty ? emptyLabel ?? "–" : value}</span>
      <button
        type="button"
        onClick={() => onChange(isEmpty ? min : Math.min(max, value + 1))}
        disabled={!isEmpty && value >= max}
        className="w-9 h-full flex items-center justify-center text-ink-secondary text-[18px] font-medium disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Artır"
      >
        +
      </button>
    </div>
  );
}

/**
 * Gerçek kullanıcı talebi: pişirme becerisi ve öğün başına hazırlık süresi
 * artık burada SORULMUYOR — beceri her zaman "orta", hazırlık süresi genelde
 * ~1 saatte hazırlanabilecek tarifleri hedefleyecek şekilde sabit gönderiliyor
 * (bkz. PreferenceWizard.tsx FIXED_COOKING_SKILL/FIXED_MAX_PREP_MINUTES).
 * "Hangi öğünler dahil olsun?" seçimi de ComplexityStep'e taşındı — bu adım
 * artık yalnızca hane büyüklüğünü soruyor.
 */
export function HouseholdBudgetStep(props: HouseholdBudgetStepProps) {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="font-display font-bold text-[26px] tracking-[-0.4px] text-ink">Hane</h2>

      <div className="flex flex-wrap gap-6">
        <label className="flex flex-col gap-2">
          <span className="font-sans font-medium text-[13px] text-ink-secondary">Yetişkin sayısı</span>
          <NumberStepper
            value={props.householdAdults}
            min={1}
            max={12}
            onChange={props.onHouseholdAdultsChange}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-sans font-medium text-[13px] text-ink-secondary">Çocuk sayısı</span>
          <NumberStepper
            value={props.householdChildren}
            min={0}
            max={12}
            onChange={props.onHouseholdChildrenChange}
          />
        </label>
      </div>

      {props.householdChildren > 0 && (
        <div>
          <p className="font-sans font-medium text-[13px] text-ink-secondary mb-2.5">
            Çocukların yaşları — porsiyonlar buna göre küçültülür
          </p>
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: props.householdChildren }).map((_, index) => (
              <label key={index} className="flex flex-col gap-1.5">
                <span className="text-[12px] text-ink-muted">{index + 1}. çocuk</span>
                <NumberStepper
                  value={props.childAges[index]}
                  min={0}
                  max={17}
                  width="w-24"
                  emptyLabel="yaş"
                  onChange={(age) => props.onChildAgeChange(index, age)}
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
