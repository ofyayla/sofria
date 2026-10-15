"use client";

import type { EquipmentConstraints } from "@sofria/shared";

export interface EquipmentToggleGroupProps {
  equipment: EquipmentConstraints;
  onChange: (partial: Partial<EquipmentConstraints>) => void;
}

const TOGGLES: { key: keyof Pick<EquipmentConstraints, "hasOven" | "hasAirFryer" | "hasPressureCooker" | "hasBlender">; label: string }[] = [
  { key: "hasOven", label: "Fırın var" },
  { key: "hasAirFryer", label: "Air fryer var" },
  { key: "hasPressureCooker", label: "Düdüklü tencere var" },
  { key: "hasBlender", label: "Blender var" },
];

function SelectionCard({ active, label, onClick, wide }: { active: boolean; label: string; onClick: () => void; wide?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        (active
          ? "relative flex items-center px-4 py-3.5 rounded-card bg-brand-soft border-[1.5px] border-brand text-[17px] font-semibold text-brand transition-all duration-100"
          : "relative flex items-center px-4 py-3.5 rounded-card bg-surface text-[17px] font-semibold text-ink transition-all duration-100") +
        (wide ? " col-span-2" : "")
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
}

export function EquipmentToggleGroup({ equipment, onChange }: EquipmentToggleGroupProps) {
  return (
    <div>
      <h3 className="font-sans font-medium text-[13px] text-ink-secondary mb-3">Mutfak ekipmanı</h3>
      <div className="grid grid-cols-2 gap-3">
        {TOGGLES.map(({ key, label }) => (
          <SelectionCard key={key} active={equipment[key]} label={label} onClick={() => onChange({ [key]: !equipment[key] })} />
        ))}
        <SelectionCard
          active={equipment.stovetopOnly}
          label="Sadece ocak (fırın kullanma)"
          onClick={() => onChange({ stovetopOnly: !equipment.stovetopOnly, ...(!equipment.stovetopOnly ? { hasOven: false } : {}) })}
          wide
        />
      </div>
    </div>
  );
}
