import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
const Bucket = process.env.R2_BUCKET!;

/** Presigned PUT. ContentLength is part of the signature, so the browser can't upload a different size. */
export function presignUpload(key: string, size: number) {
  return getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket, Key: key, ContentType: 'application/zip', ContentLength: size }),
    { expiresIn: 600 },
  );
}

export async function objectSize(key: string): Promise<number | null> {
  try {
    const r = await s3.send(new HeadObjectCommand({ Bucket, Key: key }));
    return r.ContentLength ?? null;
  } catch {
    return null;
  }
}

export async function getObjectBytes(key: string): Promise<Uint8Array> {
  const r = await s3.send(new GetObjectCommand({ Bucket, Key: key }));
  return r.Body!.transformToByteArray();
}
