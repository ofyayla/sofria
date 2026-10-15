/**
 * SDD §1.2/§1.4: Prompt fragment'larından herhangi biri değiştiğinde bu
 * sürüm ARTIRILMALIDIR. cacheKey bu sürümü içerdiği için (bkz.
 * cache/cacheKey.builder.ts), eski formatlı cache kayıtları otomatik olarak
 * "farklı anahtar" sayılır — 24 saat boyunca eski formatlı bir plan
 * yanlışlıkla servis edilmez.
 */
export const PROMPT_VERSION = "1.0.0";
