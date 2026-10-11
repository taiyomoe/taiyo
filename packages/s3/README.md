# @taiyomoe/s3

S3 client configuration for the Taiyō monorepo.

## Environment Variables

| Variable               | Description                             | Required |
| ---------------------- | --------------------------------------- | -------- |
| `S3_ENDPOINT`          | S3-compatible endpoint URL              | Yes      |
| `S3_ACCESS_KEY_ID`     | Access key ID for authentication        | Yes      |
| `S3_SECRET_ACCESS_KEY` | Secret access key for authentication    | Yes      |
| `S3_BUCKET_NAME`       | Default bucket name                     | Yes      |
| `S3_PUBLIC_URL`        | Public base URL objects are served from | Yes      |

## Development

After starting RustFS via Docker Compose, create the default bucket:

```bash
pnpm -F scripts cli init-s3
```

It reads `S3_*` from `apps/api/.env`, is idempotent, and needs no container
name — so it works regardless of what Compose named the RustFS container.

Integration tests do not need this: each test creates and drops its own bucket.

## Usage

```typescript
import { PutObjectCommand, getS3Bucket, getS3Client } from "@taiyomoe/s3"

const s3 = getS3Client()

await s3.send(
  new PutObjectCommand({
    Bucket: getS3Bucket(),
    Key: "path/to/file.txt",
    Body: "Hello, World!",
  }),
)
```
