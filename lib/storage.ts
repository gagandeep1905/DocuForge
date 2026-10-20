import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { LIMITS } from './ingest/limits';

let cachedClient: S3Client | null = null;

function getStorageConfig() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    throw new Error('Cloudflare R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET.');
  }
  return { endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, bucket: R2_BUCKET };
}

function getS3Client(): S3Client {
  if (cachedClient) return cachedClient;
  const { endpoint } = getStorageConfig();
  cachedClient = new S3Client({
    region: 'auto', endpoint,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
  });
  return cachedClient;
}

export async function presignUpload(key: string, size: number): Promise<string> {
  const { bucket } = getStorageConfig();
  return getSignedUrl(getS3Client(), new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: 'application/zip', ContentLength: size }), { expiresIn: 600 });
}

export async function objectSize(key: string): Promise<number | null> {
  const { bucket } = getStorageConfig();
  try {
    const r = await getS3Client().send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return r.ContentLength ?? null;
  } catch {
    return null;
  }
}

/** Read with a hard cap so a replaced or unexpectedly large object cannot exhaust memory. */
export async function getObjectBytes(key: string): Promise<Uint8Array> {
  const { bucket } = getStorageConfig();
  const r = await getS3Client().send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  if (!r.Body) throw new Error('The uploaded object has no readable body.');
  const body = r.Body as AsyncIterable<Uint8Array | string> & { destroy?: () => void };
  if (r.ContentLength != null && r.ContentLength > LIMITS.maxUploadBytes) {
    body.destroy?.();
    throw new Error('The uploaded archive is larger than the 100 MB limit.');
  }

  const chunks: Uint8Array[] = [];
  let total = 0;
  for await (const part of body) {
    const chunk = typeof part === 'string' ? new TextEncoder().encode(part) : part;
    total += chunk.byteLength;
    if (total > LIMITS.maxUploadBytes) {
      body.destroy?.();
      throw new Error('The uploaded archive is larger than the 100 MB limit.');
    }
    chunks.push(chunk);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { out.set(chunk, offset); offset += chunk.byteLength; }
  return out;
}
