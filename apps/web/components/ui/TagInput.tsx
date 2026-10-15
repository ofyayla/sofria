"use client";

import { useState, type KeyboardEvent } from "react";

export interface TagInputProps {
  label: string;
  placeholder?: string;
  tags: string[];
  onAdd: (raw: string) => void;
  onRemove: (tag: string) => void;
  tone?: "neutral" | "danger";
}

/** Doküman §5.4 Chip: seçili = brand zemin + onBrand metin. Pasif çip kenarlıksız. */
export function TagInput({ label, placeholder, tags, onAdd, onRemove, tone = "neutral" }: TagInputProps) {
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const trimmed = draft.trim();
    if (trimmed.length > 0) onAdd(trimmed);
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      if (draft.trim().length > 0) {
        e.preventDefault();
        commitDraft();
      }
    } else if (e.key === "Backspace" && draft.length === 0 && tags.length > 0) {
      onRemove(tags[tags.length - 1]!);
    }
  }

  const chipClass =
    tone === "danger" ? "bg-danger text-on-brand" : "bg-brand text-on-brand";

  return (
    <div className="flex flex-col gap-2">
      <label className="font-sans font-medium text-[13px] text-ink-secondary">{label}</label>
      <div className="flex flex-wrap items-center gap-2.5 min-h-14 px-4 py-2.5 rounded-input bg-surface-muted focus-within:bg-surface transition-colors">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`inline-flex items-center gap-1.5 h-11 px-[18px] rounded-chip text-[16px] font-medium ${chipClass}`}
          >
            {tag}
            <button type="button" className="opacity-80 hover:opacity-100" onClick={() => onRemove(tag)} aria-label={`${tag} etiketini kaldır`}>
              ✕
            </button>
          </span>
        ))}
        <input
          className="flex-1 min-w-[140px] border-none outline-none text-[16px] bg-transparent placeholder:text-ink-muted font-sans"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
