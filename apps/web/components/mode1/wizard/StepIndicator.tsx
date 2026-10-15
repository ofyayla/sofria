/** Doküman §4: segment ilerleme çubuğu — "▬▬▬ ▬▬▬ ▬▬░ ░░░..." */
export function StepIndicator({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  return (
    <div className="mb-8">
      <div className="flex gap-1.5 mb-3" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total}>
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={i < current ? "flex-1 h-1 rounded-chip bg-brand transition-all duration-300" : "flex-1 h-1 rounded-chip bg-divider transition-all duration-300"}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="font-sans font-medium text-[13px] text-ink-secondary">{labels[current - 1]}</span>
        <span className="font-sans text-[13px] text-ink-muted tabular-nums">
          {current} / {total}
        </span>
      </div>
    </div>
  );
}
