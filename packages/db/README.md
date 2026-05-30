# `@taiyomoe/db2`

This package contains the database schema, migrations, seeds, and a typed Kysely client for the project.

## Usage

```ts
import { db } from "@taiyomoe/db2";

// Query database
const user = await db
  .selectFrom("users")
  .selectAll()
  .where("id", "=", userId)
  .executeTakeFirst();

const users = await db.selectFrom("users").selectAll().limit(10).execute();

// Insert
await db
  .insertInto("medias")
  .values({
    /* ... */
  })
  .execute();
```

Per-table types, JSON column types, enum constants, and the Kysely query builder are all re-exported from the package root:

```ts
import type { Users, NewUsers, UserSettings, Role } from "@taiyomoe/db2";
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

The `medias` seed delegates to one file per media (`src/seeds/medias/media-N.ts`), each exporting an `execute(db)` function that performs the inserts for a single media and its children (titles, covers, chapters, staff, groups).
