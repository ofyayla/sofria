/**
 * SDD §2.2 utils/logger.ts. Konsola düz metin yerine tek satırlık JSON basar —
 * üretimde log toplama araçları (Datadog, CloudWatch vb.) bunu ayrıştırabilir.
 */
export interface LogFields {
  requestId?: string;
  [key: string]: unknown;
}

function log(level: "info" | "warn" | "error", message: string, fields?: LogFields): void {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...fields,
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else console.warn(line); // console.log yerine console.warn — SDD'nin no-console kuralı console.warn/error'a izin veriyor
}

export const logger = {
  info: (message: string, fields?: LogFields) => log("info", message, fields),
  warn: (message: string, fields?: LogFields) => log("warn", message, fields),
  error: (message: string, fields?: LogFields) => log("error", message, fields),
};
