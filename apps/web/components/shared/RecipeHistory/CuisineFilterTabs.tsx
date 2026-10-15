"use client";

import type { CuisineType } from "@sofria/shared";

const CUISINE_LABELS: Record<CuisineType, string> = {
  kirmizi_et: "Kırmızı Et",
  beyaz_et: "Beyaz Et (Tavuk ve Hindi)",
  balik_urunleri: "Balık Ürünleri",
  sebze_yemekleri: "Sebze Yemekleri",
  ortadogu_mutfagi: "Ortadoğu Mutfağı",
  italyan_mutfagi: "İtalyan Mutfağı",
};

export function CuisineFilterTabs({
  active,
  onSelect,
  presentCuisines,
}: {
  active: CuisineType | "hepsi";
  onSelect: (value: CuisineType | "hepsi") => void;
  presentCuisines: Set<CuisineType>;
}) {
  const cuisines = (Object.keys(CUISINE_LABELS) as CuisineType[]).filter((c) => presentCuisines.has(c));

  return (
    <div className="flex gap-1 bg-surface-muted p-1 rounded-full overflow-x-auto mb-6 w-fit">
      <button
        onClick={() => onSelect("hepsi")}
        className={
          active === "hepsi"
            ? "px-3.5 py-1.5 rounded-full text-[13px] font-medium text-ink bg-surface shadow-[0_2px_6px_-2px_rgba(62,107,78,0.15)] whitespace-nowrap shrink-0 transition-all duration-200"
            : "px-3.5 py-1.5 rounded-full text-[13px] text-ink-muted whitespace-nowrap shrink-0 transition-all duration-200"
        }
      >
        Hepsi
      </button>
      {cuisines.map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className={
            active === c
              ? "px-3.5 py-1.5 rounded-full text-[13px] font-medium text-ink bg-surface shadow-[0_2px_6px_-2px_rgba(62,107,78,0.15)] whitespace-nowrap shrink-0 transition-all duration-200"
              : "px-3.5 py-1.5 rounded-full text-[13px] text-ink-muted whitespace-nowrap shrink-0 transition-all duration-200"
          }
        >
          {CUISINE_LABELS[c]}
        </button>
      ))}
    </div>
  );
}
