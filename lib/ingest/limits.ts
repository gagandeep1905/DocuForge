export const LIMITS = {
  maxUploadBytes: 50 * 1024 * 1024,       // compressed archive (Supabase Free bucket maximum)
  maxExtractedBytes: 400 * 1024 * 1024,   // declared uncompressed total (zip-bomb guard)
  maxEntries: 5000,                       // entries in the archive
  maxFileBytes: 200 * 1024,               // single file kept for analysis
  maxAnalyzed: 150,                       // top-ranked files flagged for AI summarization
  insertBatchBytes: 4 * 1024 * 1024,      // DB insert batch size
} as const;
