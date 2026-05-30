import { type DB, db } from "@taiyomoe/db"
import { env } from "@taiyomoe/db/env"
import { Kysely, PostgresDialect, sql } from "kysely"
import { execSync } from "node:child_process"
import pg from "pg"
import { test as baseTest } from "vitest"

type Fixtures = {
  db: Kysely<DB>
}

const getTestDbName = (taskId: string) => `test_integration_${taskId}`
const dropTestDatabase = async (taskId: string) => {
  await sql.raw(`DROP DATABASE IF EXISTS "${getTestDbName(taskId)}"`).execute(db)
}
const buildTestDatabaseUrl = (dbName: string): string => {
  const url = new URL(env.DATABASE_URL)

  url.pathname = `/${dbName}`

  return url.toString()
}
const createTestDatabase = async (taskId: string): Promise<string> => {
  const dbName = getTestDbName(taskId)

  await dropTestDatabase(taskId)
  await sql.raw(`CREATE DATABASE "${dbName}"`).execute(db)

  const childEnv = { ...process.env, DATABASE_URL: buildTestDatabaseUrl(dbName) }

  execSync("pnpm -F db kysely migrate latest", { env: childEnv })
  execSync("pnpm -F db kysely seed run", { env: childEnv })

  return dbName
}

export const test = baseTest.extend<Fixtures>({
  db: async ({ task }, use) => {
    await createTestDatabase(task.id)

    const testDb = new Kysely<DB>({
      dialect: new PostgresDialect({
        pool: new pg.Pool({ connectionString: buildTestDatabaseUrl(task.id) }),
      }),
    })

    await use(testDb)

    await testDb.destroy()
    await dropTestDatabase(task.id)
  },
})
