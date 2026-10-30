import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type StorageConfig = {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
};

export function storageConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): StorageConfig {
  const endpoint = env.S3_ENDPOINT_URL;
  const accessKeyId = env.S3_ACCESS_KEY;
  const secretAccessKey = env.S3_SECRET_KEY;
  const bucket = env.S3_BUCKET;
  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "S3_ENDPOINT_URL, S3_ACCESS_KEY, S3_SECRET_KEY and S3_BUCKET must be set in the root .env.",
    );
  }
  return {
    endpoint,
    accessKeyId,
    secretAccessKey,
    bucket,
    region: env.S3_REGION ?? "us-east-1",
  };
}

export function createStorage(config: StorageConfig) {
  const client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true,
  });

  async function ensureBucket() {
    try {
      await client.send(new HeadBucketCommand({ Bucket: config.bucket }));
    } catch {
      await client.send(new CreateBucketCommand({ Bucket: config.bucket }));
    }
  }

  async function putObject(key: string, body: Uint8Array, contentType: string) {
    await client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  async function getObjectBytes(key: string) {
    const response = await client.send(
      new GetObjectCommand({ Bucket: config.bucket, Key: key }),
    );
    if (!response.Body) throw new Error(`Object ${key} has no body.`);
    return response.Body.transformToByteArray();
  }

  // The bucket stays private; viewers get a URL that expires.
  function signedReadUrl(key: string, expiresInSeconds = 300) {
    return getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: config.bucket, Key: key }),
      {
        expiresIn: expiresInSeconds,
      },
    );
  }

  return {
    client,
    bucket: config.bucket,
    ensureBucket,
    putObject,
    getObjectBytes,
    signedReadUrl,
  };
}

export type Storage = ReturnType<typeof createStorage>;
