# `@taiyomoe/db2`

This package contains the database schema, migrations, seeds, and a typed Kysely client for the project.

## Usage

```ts
import { db } from "@taiyomoe/db2"

// Query database
const user = await db.selectFrom("users").selectAll().where("id", "=", userId).executeTakeFirst()

const users = await db.selectFrom("users").selectAll().limit(10).execute()

// Insert
await db.insertInto("medias").values({/* ... */}).execute()
```

Per-table types, JSON column types, enum constants, and the Kysely query builder are all re-exported from the package root:

```ts
import type { Users, NewUsers, UserSettings, Role } from "@taiyomoe/db2"
```

## Migrations

Migrations live in `src/migrations` and are managed with [`kysely-ctl`](https://github.com/kysely-org/kysely-ctl). Each file exports `up`/`down`.

```bash
# Create a new migration file
pnpm -F db2 kysely migrate make <name>

# Run all pending migrations
pnpm -F db2 kysely migrate latest

# Roll back the last applied migration
pnpm -F db2 kysely migrate down

# Show migration status
pnpm -F db2 kysely migrate list
```

## Seeds

Seeds live in `src/seeds`. Each file exports a `seed(db)` function and is run in filename order.

```bash
# Create a new seed file
pnpm -F db2 kysely seed make <name>

# Run all seeds
pnpm -F db2 kysely seed run
```

The `sample` seed loads `src/seeds/sample/<table>.jsonl.gz`, a sample of production: a share of the medias (5% by default) with everything attached to them (titles, covers, banners, staff, every chapter and its groups, the reading history and library entries), plus the users those rows reference. Users are anonymized: new IDs, fake names, usernames and emails, randomized profiles, and no accounts or sessions. The `featured-medias` seed reads `featuredMedias.jsonl.gz` from the same folder.

The sample is generated from a pre-rewrite production dump, which the script restores into a scratch database, prunes, migrates with `src/migrations`, anonymizes and exports:

```bash
pnpm -F @taiyomoe/scripts cli extract-sample <dump> [--percent 5] [--seed 1]
```

The matching images live in the production bucket under the same keys, and local dev reads them through the image proxy's production fallback. To refresh the offline copy, `download-sample-images` reads the production S3 credentials from `packages/scripts/.env.prod` and mirrors every cover, banner and chapter page into `output/sample-images`, laid out like the bucket (rerunning it resumes). Zip that folder and upload it as `dev/sample-images.zip`. `upload-sample-images` pushes an unzipped folder into the local bucket.

```bash
pnpm -F @taiyomoe/scripts cli download-sample-images
pnpm -F @taiyomoe/scripts cli upload-sample-images
```

Integration tests seed from `src/fixtures` instead (`kysely seed run --environment test`), a small hand-written set they reference by ID.
