import { describe, expect, it } from 'vitest';
import { isAllowedZipUploadSize, LIMITS } from '../lib/ingest/limits';

describe('ZIP upload limits', () => {
  it('uses the 50 MiB Supabase Storage bucket limit', () => {
    expect(LIMITS.maxUploadBytes).toBe(50 * 1024 * 1024);
  });

  it('accepts positive integer uploads at or below the limit', () => {
    expect(isAllowedZipUploadSize(1)).toBe(true);
    expect(isAllowedZipUploadSize(LIMITS.maxUploadBytes)).toBe(true);
    expect(isAllowedZipUploadSize(25 * 1024 * 1024)).toBe(true);
  });

  it('rejects empty, fractional, non-finite, and oversized uploads', () => {
    expect(isAllowedZipUploadSize(0)).toBe(false);
    expect(isAllowedZipUploadSize(-1)).toBe(false);
    expect(isAllowedZipUploadSize(1.5)).toBe(false);
    expect(isAllowedZipUploadSize(Number.NaN)).toBe(false);
    expect(isAllowedZipUploadSize(LIMITS.maxUploadBytes + 1)).toBe(false);
  });
});
