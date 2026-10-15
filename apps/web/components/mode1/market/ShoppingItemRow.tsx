import { UNIT_LABELS, type ShoppingItem } from "@sofria/shared";

export function ShoppingItemRow({ item, checked, onToggle }: { item: ShoppingItem; checked: boolean; onToggle: () => void }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} onClick={onToggle} className="w-full flex items-center gap-3 py-3.5 text-left">
      <span
        className={
          checked
            ? "w-6 h-6 rounded-full bg-brand flex items-center justify-center shrink-0 transition-all duration-200"
            : "w-6 h-6 rounded-full bg-surface-muted shrink-0 transition-all duration-200"
        }
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6.5L4.75 8.75L9.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className={checked ? "flex-1 text-[15px] text-ink-muted line-through transition-all duration-200" : "flex-1 text-[15px] text-ink transition-all duration-200"}>
        {item.displayName}
      </span>
      <span className="tabular-nums text-[13px] text-ink-muted">
        {item.totalAmount} {UNIT_LABELS[item.unit]}
      </span>
    </button>
  );
}
