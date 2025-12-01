import { execSync } from "node:child_process"
import { db, PrismaClient, PrismaPg } from "@taiyomoe/db"
import { env } from "@taiyomoe/db/env"
import { test as baseTest } from "vitest"

type Fixtures = {
  db: PrismaClient
}

const getTestDbName = (taskId: string) => `test_integration_${taskId}`

const dropTestDatabase = async (taskId: string) => {
  await db.$executeRawUnsafe(
    `DROP DATABASE IF EXISTS "${getTestDbName(taskId)}"`,
  )
}

const createTestDatabase = async (taskId: string): Promise<string> => {
  const dbName = getTestDbName(taskId)

  await dropTestDatabase(taskId)
  await db.$executeRawUnsafe(`CREATE DATABASE "${dbName}"`)

  execSync(`pnpm -F scripts start migrate --db ${dbName}`)

  execSync(`pnpm -F scripts start seed --db ${dbName}`)

  return dbName
}

export const test = baseTest.extend<Fixtures>({
  db: async ({ task }, use) => {
    await createTestDatabase(task.id)

    const adapter = new PrismaPg({
      connectionString: env.DATABASE_URL,
      database: task.id,
    })
    const db = new PrismaClient({ adapter })
    await db.$connect()

    await use(db)

    await dropTestDatabase(task.id)
    await db.$disconnect()
  },
})
