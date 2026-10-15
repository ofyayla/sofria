export function DayTabs({ dayNames, activeIndex, onSelect }: { dayNames: string[]; activeIndex: number; onSelect: (index: number) => void }) {
  return (
    <div className="flex gap-1 bg-surface-muted p-1 rounded-full overflow-x-auto mb-6" role="tablist" aria-label="Haftanın günleri">
      {dayNames.map((name, i) => (
        <button
          key={name + i}
          role="tab"
          aria-selected={i === activeIndex}
          onClick={() => onSelect(i)}
          className={
            i === activeIndex
              ? "px-3.5 py-1.5 rounded-full text-[13px] font-medium text-ink bg-surface shadow-[0_2px_6px_-2px_rgba(62,107,78,0.15)] whitespace-nowrap shrink-0 transition-all duration-200"
              : "px-3.5 py-1.5 rounded-full text-[13px] text-ink-muted whitespace-nowrap shrink-0 transition-all duration-200"
          }
        >
          {name}
        </button>
      ))}
    </div>
  );
}
