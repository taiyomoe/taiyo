# @taiyomoe/db

This package contains the database schema and migrations for the project.

## Migrations

Migrations are created by PrismaORM by managed but a custom script.

To create a new migration or apply pending ones, run `infisical run -- pnpm -F @taiyomoe/db run db migrate dev --create-only` at the root of the project.

## Data Migrations

Data migrations are migrations that have to process data with real code. They are usually bound to a specific migration.

## Applying migrations

To apply migrations, run `infisical run -- pnpm -F @taiyomoe/db migrate`. We have a custom migrations handler that ensures migrations and data migrations are applied in the correct order.
