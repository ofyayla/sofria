/** Doküman §7 hareket tablosu: dönen spinner YASAK — yerine sakin nefes animasyonu. */
export function GeneratingIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-6" role="status" aria-live="polite">
      <span className="w-3 h-3 rounded-full bg-brand" style={{ animation: "breathe 1400ms ease-in-out infinite" }} />
      <span className="text-[15px] font-medium text-ink-secondary">{label}</span>
    </div>
  );
}
