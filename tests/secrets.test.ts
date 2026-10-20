import { describe, it, expect } from 'vitest';
import { redactSecrets, isSecretFile } from '../lib/ingest/secrets';

describe('redactSecrets', () => {
  it('redacts keys, tokens and credentials in connection strings', () => {
    const src = [
      'const aws = "AKIAABCDEFGHIJKLMNOP";',
      'password = "hunter2hunter2"',
      'DB=postgres://admin:s3cretpass@db.example.com:5432/app',
      'const gh = "ghp_' + 'a'.repeat(36) + '";',
    ].join('\n');
    const { text, count } = redactSecrets(src);
    expect(count).toBeGreaterThanOrEqual(4);
    expect(text).not.toContain('AKIAABCDEFGHIJKLMNOP');
    expect(text).not.toContain('hunter2hunter2');
    expect(text).not.toContain('s3cretpass');
    expect(text).toContain('postgres://admin:[REDACTED]@db.example.com');
  });
  it('leaves ordinary code alone', () => {
    const { text, count } = redactSecrets('function add(a, b) { return a + b; }');
    expect(count).toBe(0);
    expect(text).toBe('function add(a, b) { return a + b; }');
  });
});

describe('isSecretFile', () => {
  it('flags env files and keys but allows templates', () => {
    expect(isSecretFile('.env')).toBe(true);
    expect(isSecretFile('server/.env.production')).toBe(true);
    expect(isSecretFile('certs/server.pem')).toBe(true);
    expect(isSecretFile('.env.example')).toBe(false);
  });
});
