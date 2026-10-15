"use client";

import { useState } from "react";

export interface RatingStarsProps {
  value: number;
  onChange?: (value: 1 | 2 | 3 | 4 | 5) => void;
  size?: "sm" | "md";
}

/** Hem yazılabilir (RecipeDetailModal) hem salt-okunur (Tariflerim) modda kullanılır. */
export function RatingStars({ value, onChange, size = "md" }: RatingStarsProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const readOnly = !onChange;
  const displayValue = hovered ?? value;
  const starSize = size === "sm" ? "text-[16px]" : "text-[22px]";

  return (
    <div className="flex items-center gap-1" role={readOnly ? "img" : "radiogroup"} aria-label={`Puan: ${value}/5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star as 1 | 2 | 3 | 4 | 5)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(null)}
          className={`${starSize} leading-none ${readOnly ? "cursor-default" : "cursor-pointer"} ${star <= displayValue ? "text-brand" : "text-divider"}`}
          aria-label={`${star} yıldız`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
