import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

const BASE =
  "inline-flex items-center justify-center gap-1.5 font-display font-bold rounded-button px-5 py-3 text-[18px] transition-all duration-200 active:scale-[0.96] disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100";

// "Sıcak vurgu" kararı: birincil buton artık pastel yeşil gradyan değil, düz
// sıcak turuncu-kızıl (accent). Yeşil, seçim/durum göstergeleri için ayrılmış
// durumda kalıyor — bkz. DietaryToggleGroup/CuisineStep/ProgressBar vb.
const VARIANTS = {
  primary: "bg-accent hover:bg-accent-hover text-on-accent shadow-[0_8px_20px_-4px_rgba(194,65,12,0.26)]",
  secondary: "bg-surface text-ink-secondary shadow-[0_6px_14px_-4px_rgba(62,107,78,0.10)]",
  ghost: "text-ink-secondary hover:bg-surface-muted",
};

export function Button({ variant = "secondary", className, ...rest }: ButtonProps) {
  return <button className={[BASE, VARIANTS[variant], className].filter(Boolean).join(" ")} {...rest} />;
}
