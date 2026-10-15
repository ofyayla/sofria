import type { ReactNode } from "react";

/** Doküman §12 Yasaklılar: gri kenarlıklı kart yasak. Yerine yeşile çalan gölge (shadow.card). */
export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      className={[
        "bg-surface rounded-card p-5 shadow-[0_6px_14px_-2px_rgba(62,107,78,0.10)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
