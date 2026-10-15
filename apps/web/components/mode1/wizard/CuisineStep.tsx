import type { CuisineType } from "@sofria/shared";

const CUISINE_LABELS: Record<CuisineType, string> = {
  kirmizi_et: "Kırmızı Et",
  beyaz_et: "Beyaz Et (Tavuk ve Hindi)",
  balik_urunleri: "Balık Ürünleri",
  sebze_yemekleri: "Sebze Yemekleri",
  ortadogu_mutfagi: "Ortadoğu Mutfağı",
  italyan_mutfagi: "İtalyan Mutfağı",
};

export interface CuisineStepProps {
  selected: CuisineType[];
  onToggle: (cuisine: CuisineType) => void;
}

export function CuisineStep({ selected, onToggle }: CuisineStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-[26px] tracking-[-0.4px] text-ink">Mutfak seçimi</h2>
          <span className="tabular-nums text-[14px] font-medium text-brand">{selected.length} seçili</span>
        </div>
        <p className="text-[15px] text-ink-secondary mt-1">
          Birden fazla seçebilirsiniz — hafta seçtiğiniz mutfaklar arasında dengeli dağıtılır.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(CUISINE_LABELS) as CuisineType[]).map((cuisine) => {
          const isActive = selected.includes(cuisine);
          return (
            <button
              key={cuisine}
              type="button"
              onClick={() => onToggle(cuisine)}
              aria-pressed={isActive}
              className={
                isActive
                  ? "relative flex items-center justify-center text-center px-4 py-6 rounded-card bg-brand-soft border-[1.5px] border-brand text-[17px] font-semibold text-brand transition-all duration-100"
                  : "relative flex items-center justify-center text-center px-4 py-6 rounded-card bg-surface text-[17px] font-semibold text-ink transition-all duration-100"
              }
            >
              {CUISINE_LABELS[cuisine]}
              {isActive && (
                <span className="absolute top-2 right-2 w-[26px] h-[26px] rounded-full bg-brand text-on-brand flex items-center justify-center text-[13px]">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
      {selected.length === 0 && <p className="text-[14px] text-warning">En az bir mutfak seçmelisiniz.</p>}
    </div>
  );
}
