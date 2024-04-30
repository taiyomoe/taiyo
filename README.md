# Taiyō

![Taiyō's banner](https://cdn.taiyo.moe/assets/banner-red.png)

## git-flow

Este projeto usa [git-flow](https://git-flow.readthedocs.io/en/latest/presentation.html).

## Installation

### Prerequisites

- [Docker](https://docs.docker.com/install)
- [Node.js v20.12.2](https://nodejs.org/dist/v20.12.2)
- [pnpm v9.0.6](https://pnpm.io/installation)
- [bun](https://bun.sh)

### Initialisation

```bash
# Install the dependencies
pnpm i

# Populate the .env file
# A `.env.example` file has been provided at the root of the project
cp .env.example .env
```

## Development

### Start the Docker containers

```bash
docker compose up
```

### Initialize the database

```bash
# Execute the migrations
npm run db migration:up
```

### Initialize the S3 bucket

```bash
# Open a new shell in the Docker container
docker compose exec minio bash

# Create a new host
mc alias set local http://localhost:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD

# Create the bucket
mc mb local/$MINIO_DEFAULT_BUCKET

# Set the bucket policy
mc anonymous set download local/$MINIO_DEFAULT_BUCKET
```

After creating the bucket, you can access the MinIO dashboard at [http://localhost:9001](http://localhost:9001) (if you didn't change the port).

The username and password are the same as the ones in the `.env` file (`MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD`).

Once you've logged in, you will have to upload the default bucket, which includes 100 chapters of different medias. Here is the link to download the bucket: [https://cdn.taiyo.moe/assets/default-bucket.zip](https://cdn.taiyo.moe/assets/default-bucket.zip).

### Run the project

You are now ready to run the project.

```bash
pnpm run dev
```
