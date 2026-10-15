"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/plan", label: "Haftalık Planla" },
  { href: "/tariflerim", label: "Tariflerim" },
  { href: "/kurallarim", label: "Kurallarım" },
];

export function ModeSwitcher() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-bg-top/85 backdrop-blur-md">
      <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="shrink-0" aria-label="Sofria">
          <Image src="/sofria-logo-icon.png" alt="Sofria" width={32} height={32} priority />
        </Link>

        <nav className="flex items-center gap-0.5 bg-surface-muted p-1 rounded-full overflow-x-auto" aria-label="Ana gezinme">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "px-3.5 py-1.5 rounded-full text-[13px] font-medium text-ink bg-surface shadow-[0_2px_6px_-2px_rgba(62,107,78,0.15)] whitespace-nowrap transition-all duration-200"
                    : "px-3.5 py-1.5 rounded-full text-[13px] font-medium text-ink-muted hover:text-ink-secondary whitespace-nowrap transition-all duration-200"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
