import { Redirect } from "expo-router";

/** Eski adres (/plan/<id>/market) — bkz. plan/[planId]/index.tsx. */
export default function LegacyMarketRedirect() {
  return <Redirect href="/market" />;
}
