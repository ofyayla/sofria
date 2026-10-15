import Image from "next/image";
import Link from "next/link";

const MODES = [
  { href: "/plan", title: "Haftalık Planla", hint: "Tercihlerine göre 7 günlük plan" },
  { href: "/tariflerim", title: "Tariflerim", hint: "Denediğin ve puanladığın tarifler" },
  { href: "/kurallarim", title: "Kurallarım", hint: "Diyet, alerji ve mutfak ekipmanı" },
] as const;

export default function HomePage() {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-16">
      <Image src="/sofria-logo-full.png" alt="Sofria" width={190} height={190} priority />
      <p className="text-[19px] text-ink-secondary max-w-sm">Ne yapmak istersin?</p>

      <div className="flex flex-col gap-3 mt-6 w-full max-w-md">
        {MODES.map((mode) => (
          <Link
            key={mode.href}
            href={mode.href}
            className="relative flex-1 bg-surface rounded-card p-5 text-left shadow-[0_6px_14px_-2px_rgba(62,107,78,0.10)]"
          >
            <p className="text-[17px] font-semibold text-ink">{mode.title}</p>
            <p className="text-[14px] text-ink-muted mt-1">{mode.hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
