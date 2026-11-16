import "./setup-env"
import { env as dbEnv } from "@taiyomoe/db/env"
import { getMeiliClient } from "@taiyomoe/search"
import { execSync } from "node:child_process"
import pg from "pg"

const TEMPLATE_DB = "taiyo_test_template"
const getDbUrl = (name: string) => {
  const url = new URL(dbEnv.DATABASE_URL)

  url.pathname = `/${name}`

  return url.toString()
}
// Tests clean up after themselves; this removes what an interrupted run left behind.
const dropTestLeftovers = async () => {
  const pool = new pg.Pool({ connectionString: getDbUrl("postgres"), max: 8 })
  const { rows } = await pool.query<{ name: string }>(
    `SELECT datname AS name FROM pg_database WHERE datname = $1 OR datname LIKE 'integration\\_%'`,
    [TEMPLATE_DB],
  )
  const meili = getMeiliClient()
  const { results: indexes } = await meili.getIndexes({ limit: 10_000 })

  await Promise.all([
    ...rows.map(({ name }) => pool.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`)),
    ...indexes
      .filter(({ uid }) => uid.startsWith("medias_"))
      .map(({ uid }) => meili.deleteIndex(uid)),
  ])
  await pool.end()
}

export default async () => {
  await dropTestLeftovers()

  const adminClient = new pg.Client({ connectionString: getDbUrl("postgres") })

  await adminClient.connect()
  await adminClient.query(`CREATE DATABASE "${TEMPLATE_DB}"`)
  await adminClient.end()

  const childEnv = { ...process.env, DATABASE_URL: getDbUrl(TEMPLATE_DB) }

  execSync("pnpm -F db kysely migrate latest", { stdio: "pipe", env: childEnv })
  execSync("pnpm -F db kysely seed run --environment test", { stdio: "pipe", env: childEnv })

  // Tests that read the index index the seed themselves, so nothing waits in the outbox.
  const templateClient = new pg.Client({ connectionString: getDbUrl(TEMPLATE_DB) })

  await templateClient.connect()
  await templateClient.query(`DELETE FROM "searchOutbox"`)
  await templateClient.end()

  return dropTestLeftovers
}
