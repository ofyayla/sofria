export function ProgressBar({ checked, total }: { checked: number; total: number }) {
  const percent = total === 0 ? 0 : Math.round((checked / total) * 100);
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex-1 h-1.5 bg-divider rounded-chip overflow-hidden">
        <div className="h-full bg-brand rounded-chip transition-all duration-300" style={{ width: `${percent}%` }} />
      </div>
      <span className="tabular-nums text-[13px] text-ink-muted min-w-[3rem] text-right">
        {checked}/{total}
      </span>
    </div>
  );
}
