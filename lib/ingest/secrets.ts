// Secrets must never reach the database, the model, or an exported document.

const SECRET_FILE_PATTERNS: RegExp[] = [
  /^\.env(\..+)?$/i,
  /\.(pem|key|p12|pfx|jks|keystore)$/i,
  /^id_(rsa|dsa|ecdsa|ed25519)$/i,
  /^(credentials|secrets?)\.(json|ya?ml)$/i,
  /service[-_]?account.*\.json$/i,
  /firebase.*adminsdk.*\.json$/i,
  /^\.(npmrc|pypirc|netrc)$/i,
];
const SAFE_ENV_TEMPLATE = /^\.env\.(example|sample|template)$/i;

export function isSecretFile(path: string): boolean {
  const name = path.split('/').pop() ?? '';
  if (SAFE_ENV_TEMPLATE.test(name)) return false;
  return SECRET_FILE_PATTERNS.some((re) => re.test(name));
}

const REDACTIONS: Array<[RegExp, string]> = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, '[REDACTED_PRIVATE_KEY]'],
  [/\bAKIA[0-9A-Z]{16}\b/g, '[REDACTED_AWS_KEY]'],
  [/\bgh[pousr]_[A-Za-z0-9]{36,}\b/g, '[REDACTED_GITHUB_TOKEN]'],
  [/\bsk-ant-[A-Za-z0-9_-]{20,}\b/g, '[REDACTED_API_KEY]'],
  [/\bsk-[A-Za-z0-9]{32,}\b/g, '[REDACTED_API_KEY]'],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g, '[REDACTED_SLACK_TOKEN]'],
  [/\bAIza[0-9A-Za-z_-]{35}\b/g, '[REDACTED_GOOGLE_KEY]'],
  [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '[REDACTED_JWT]'],
  // password = "hunter2", apiKey: 'abc123...', SECRET_TOKEN="..."
  [/(\b(?:password|passwd|pwd|secret|api[_-]?key|token|auth)[A-Za-z0-9_]*\s*[:=]\s*)(["'])([^"'\s]{6,})\2/gi, '$1$2[REDACTED]$2'],
  // postgres://user:pass@host
  [/\b(mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis):\/\/([^:\s/]+):([^@\s]+)@/gi, '$1://$2:[REDACTED]@'],
];

export function redactSecrets(text: string): { text: string; count: number } {
  let out = text;
  let count = 0;
  for (const [re, replacement] of REDACTIONS) {
    const hits = out.match(re);
    if (hits) {
      count += hits.length;
      out = out.replace(re, replacement);
    }
  }
  return { text: out, count };
}
