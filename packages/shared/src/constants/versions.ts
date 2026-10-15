/**
 * SDD §1: cacheKey formatı `v{schemaVersion}:p{promptVersion}:...` şeklinde
 * bu sabitleri kullanır. Prompt değiştiğinde PROMPT_VERSION artırılır —
 * eski formatlı cache kayıtları otomatik "yeni anahtar" sayılır (bkz. SDD §1.3).
 */
export const SCHEMA_VERSION = 1 as const;

// F4'te prompts/PROMPT_VERSION.ts buradan içe aktarılacak.
export const PROMPT_VERSION = "1.0.0" as const;
