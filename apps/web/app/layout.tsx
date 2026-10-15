import { Figtree, Inter } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "../components/shared/Providers";
import { ModeSwitcher } from "../components/shared/ModeSwitcher";
import { ErrorBoundary } from "../components/shared/ErrorBoundary";
import "./globals.css";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", weight: ["700", "800"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Sofria",
  description: "AI destekli mutfak ve alışveriş asistanı",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" className={`${figtree.variable} ${inter.variable}`}>
      <body>
        <ErrorBoundary>
          <Providers>
            <ModeSwitcher />
            <main>{children}</main>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
