"use client";

import { TagInput } from "../../ui/TagInput";

export interface AvoidedIngredientsInputProps {
  avoidedIngredients: string[];
  onAdd: (raw: string) => void;
  onRemove: (raw: string) => void;
}

/** PRD §5: "kullanıcı bir kez 'mantar istemiyorum' dedikten sonra..." — bu ekranın karşılığı. */
export function AvoidedIngredientsInput({ avoidedIngredients, onAdd, onRemove }: AvoidedIngredientsInputProps) {
  return (
    <TagInput
      label="Kaçınılan Malzemeler"
      placeholder="Malzeme yazın, Enter veya virgülle ekleyin (örn. mantar)"
      tags={avoidedIngredients}
      onAdd={onAdd}
      onRemove={onRemove}
    />
  );
}
