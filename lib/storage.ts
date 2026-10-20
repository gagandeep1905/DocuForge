import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class StorageConfigurationError extends Error {
  constructor() {
    super('Cloudflare R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET.');
    this.name = 'StorageConfigurationError';
  }
}

function isR2Configured(): boolean {
  return Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET);
}

let client: S3Client | null = null;
function getClient(): S3Client {
  if (!isR2Configured()) throw new StorageConfigurationError();
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return client;
}

function bucket(): string {
  if (!isR2Configured()) throw new StorageConfigurationError();
  return process.env.R2_BUCKET!;
}

/** Presigned PUT. ContentLength is part of the signature, so the browser can't upload a different size. */
export function presignUpload(key: string, size: number) {
  return getSignedUrl(
    getClient(),
    new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: 'application/zip', ContentLength: size }),
    { expiresIn: 600 },
  );
}

export async function objectSize(key: string): Promise<number | null> {
  try {
    const r = await getClient().send(new HeadObjectCommand({ Bucket: bucket(), Key: key }));
    return r.ContentLength ?? null;
  } catch (e) {
    if (e instanceof StorageConfigurationError) throw e;
    return null;
  }
}

export async function getObjectBytes(key: string): Promise<Uint8Array> {
  const r = await getClient().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
  if (!r.Body) throw new Error('The stored upload was empty.');
  return r.Body.transformToByteArray();
}
