# @taiyomoe/s3

S3 client configuration for the Taiyo monorepo.

## Environment Variables

| Variable               | Description                          | Required |
| ---------------------- | ------------------------------------ | -------- |
| `S3_ENDPOINT`          | S3-compatible endpoint URL           | Yes      |
| `S3_ACCESS_KEY_ID`     | Access key ID for authentication     | Yes      |
| `S3_SECRET_ACCESS_KEY` | Secret access key for authentication | Yes      |
| `S3_BUCKET_NAME`       | Default bucket name                  | Yes      |

## Development

After starting MinIO via Docker Compose, run these commands to configure the MinIO client and create the default bucket:

```bash
# Configure the local alias
source .env && docker exec -it taiyo-minio-1 mc alias set local http://localhost:$MINIO_PORT $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD

# Create the "default" bucket
docker exec -it taiyo-minio-1 mc mb -p local/default
```

## Usage

```typescript
import { s3Client } from "@taiyomoe/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

await s3Client.send(
  new PutObjectCommand({
    Bucket: "my-bucket",
    Key: "path/to/file.txt",
    Body: "Hello, World!",
  })
);
```
