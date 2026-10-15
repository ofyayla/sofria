"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useHydrateStores } from "../../lib/hydrateStores";
import { queryClient } from "../../lib/queryClient";

export function Providers({ children }: { children: ReactNode }) {
  useHydrateStores();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
