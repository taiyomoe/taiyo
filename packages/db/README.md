# `@taiyomoe/db`

This package contains the database schema and migrations for the project.

## Usage

```ts
import { db } from "@taiyomoe/db";

// Query database
const user = await db.user.findUnique({ where: { id: userId } });
const users = await db.user.findMany({ take: 10 });
```

## Migrations

Migrations are created manually as we cannot use the PrismaORM built-in migrator command. To create a new migration, run:

```bash
infisical run -- pnpm -F scripts start create-migration --name <name>

# Then run it
infisical run -- pnpm -F scripts start migrate
```

After migrating, generate the Prisma client with:

```bash
pnpm -F @taiyomoe/db prisma generate
infisical run -- pnpm -F db prisma generate --sql
```
