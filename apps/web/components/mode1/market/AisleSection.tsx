import { useEffect, useState } from "react";
import type { AisleGroup } from "@sofria/shared";
import { ShoppingItemRow } from "./ShoppingItemRow";

export function AisleSection({
  group,
  isItemChecked,
  onToggleItem,
}: {
  group: AisleGroup;
  isItemChecked: (slug: string) => boolean;
  onToggleItem: (slug: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const checkedCount = group.items.filter((item) => isItemChecked(item.slug)).length;
  const allChecked = checkedCount === group.items.length;

  useEffect(() => {
    if (allChecked) setCollapsed(true);
  }, [allChecked]);

  return (
    <section className="bg-surface rounded-card mb-3 overflow-hidden shadow-[0_6px_14px_-2px_rgba(62,107,78,0.10)]">
      <button onClick={() => setCollapsed((c) => !c)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <span className="font-sans font-semibold text-[15px] text-ink">{group.displayName}</span>
        <div className="flex items-center gap-3">
          <span className="tabular-nums text-[13px] text-ink-muted">
            {checkedCount}/{group.items.length}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            className={collapsed ? "text-ink-muted transition-transform duration-200 -rotate-90" : "text-ink-muted transition-transform duration-200"}
          >
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>
      {!collapsed && (
        <div className="px-5 pb-2">
          {group.items.map((item) => (
            <ShoppingItemRow key={`${item.slug}-${item.unit}`} item={item} checked={isItemChecked(item.slug)} onToggle={() => onToggleItem(item.slug)} />
          ))}
        </div>
      )}
    </section>
  );
}
