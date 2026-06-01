# @taiyomoe/s3

S3 client configuration for the Taiyō monorepo.

## Environment Variables

| Variable               | Description                          | Required |
| ---------------------- | ------------------------------------ | -------- |
| `S3_ENDPOINT`          | S3-compatible endpoint URL           | Yes      |
| `S3_ACCESS_KEY_ID`     | Access key ID for authentication     | Yes      |
| `S3_SECRET_ACCESS_KEY` | Secret access key for authentication | Yes      |
| `S3_BUCKET_NAME`       | Default bucket name                  | Yes      |

## Development

After starting RustFS via Docker Compose, run these commands to configure the MinIO client (RustFS is S3-compatible and works with `mc`) and create the default bucket:

```bash
source .env && docker exec -it taiyo-rustfs-1 sh -lc '
  cd /home/rustfs &&
  wget https://github.com/rustfs/cli/releases/download/v0.1.11/rustfs-cli-linux-amd64-v0.1.11.tar.gz &&
  tar -zxvf rustfs-cli-linux-amd64-v0.1.11.tar.gz &&
  chmod +x rc &&
  ./rc alias set '"$S3_BUCKET_NAME"' http://localhost:9000 '"$RUSTFS_ACCESS_KEY"' '"$RUSTFS_SECRET_KEY"' &&
  ./rc mb -p '"$S3_BUCKET_NAME"'/default
'
```

## Usage

```typescript
import { s3Client } from "@taiyomoe/s3"
import { PutObjectCommand } from "@aws-sdk/client-s3"

await s3Client.send(
  new PutObjectCommand({
    Bucket: "my-bucket",
    Key: "path/to/file.txt",
    Body: "Hello, World!",
  }),
)
```
