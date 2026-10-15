"use client";

import type { DietaryConstraints } from "@sofria/shared";

export interface DietaryToggleGroupProps {
  dietary: DietaryConstraints;
  onChange: (partial: Partial<DietaryConstraints>) => void;
}

const TOGGLES: { key: keyof Pick<DietaryConstraints, "glutenFree" | "lactoseFree" | "vegetarian" | "vegan">; label: string }[] = [
  { key: "glutenFree", label: "Glutensiz" },
  { key: "lactoseFree", label: "Laktozsuz" },
  { key: "vegetarian", label: "Vejetaryen" },
  { key: "vegan", label: "Vegan" },
];

/** Doküman §5.3 SelectionCard: seçili = brandSoft zemin + brand 1.5pt kenarlık + tik rozeti. */
export function DietaryToggleGroup({ dietary, onChange }: DietaryToggleGroupProps) {
  return (
    <div>
      <h3 className="font-sans font-medium text-[13px] text-ink-secondary mb-3">Diyet</h3>
      <div className="grid grid-cols-2 gap-3">
        {TOGGLES.map(({ key, label }) => {
          const active = dietary[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ [key]: !active })}
              aria-pressed={active}
              className={
                active
                  ? "relative flex items-center px-4 py-3.5 rounded-card bg-brand-soft border-[1.5px] border-brand text-[17px] font-semibold text-brand transition-all duration-100"
                  : "relative flex items-center px-4 py-3.5 rounded-card bg-surface text-[17px] font-semibold text-ink transition-all duration-100"
              }
            >
              {label}
              {active && (
                <span className="absolute -top-2 -right-2 w-[26px] h-[26px] rounded-full bg-brand text-on-brand flex items-center justify-center text-[13px]">
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
