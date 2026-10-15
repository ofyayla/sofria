"use client";

import { TagInput } from "../../ui/TagInput";

export interface AllergyInputProps {
  allergies: string[];
  onAdd: (raw: string) => void;
  onRemove: (raw: string) => void;
}

/**
 * SDD §3.2: allergies, avoidedIngredients'tan AYRI tutulur — biri tercih
 * (ihlalde yumuşak düzeltme), diğeri güvenlik (ihlalde sert red). Bu ayrım
 * arayüzde de görsel olarak (ayrı, uyarı renkli alan) korunmalı — F8'de
 * tasarım turunda netleştirilecek, şimdilik işlevsel ayrım yeterli.
 */
export function AllergyInput({ allergies, onAdd, onRemove }: AllergyInputProps) {
  return (
    <TagInput
      label="Alerjiler (kritik — hiçbir tarifte hiç bulunmaz)"
      placeholder="Alerjen yazın, Enter veya virgülle ekleyin (örn. fıstık)"
      tags={allergies}
      onAdd={onAdd}
      onRemove={onRemove}
      tone="danger"
    />
  );
}
