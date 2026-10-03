import "./setup-env"

import { env as dbEnv } from "@taiyomoe/db/env"
import { execSync } from "node:child_process"
import pg from "pg"

// Runs ONCE per `vitest` invocation — not once per worker. Provisions the
// template database the per-test fixture in `setup.ts` clones from. Without
// this every worker would race on DROP/CREATE of the same template DB.

const TEMPLATE_DB = "taiyo_test_template"
const getDbUrl = (name: string) => {
  const url = new URL(dbEnv.DATABASE_URL)

  url.pathname = `/${name}`

  return url.toString()
}

export default async () => {
  const adminClient = new pg.Client({ connectionString: getDbUrl("postgres") })

  await adminClient.connect()
  await adminClient.query(`DROP DATABASE IF EXISTS "${TEMPLATE_DB}"`)
  await adminClient.query(`CREATE DATABASE "${TEMPLATE_DB}"`)
  await adminClient.end()

  const childEnv = { ...process.env, DATABASE_URL: getDbUrl(TEMPLATE_DB) }

  execSync("pnpm -F db kysely migrate latest", { stdio: "pipe", env: childEnv })
  execSync("pnpm -F db kysely seed run", { stdio: "pipe", env: childEnv })

  return async () => {
    const cleanupClient = new pg.Client({ connectionString: getDbUrl("postgres") })

    await cleanupClient.connect()
    await cleanupClient.query(`DROP DATABASE IF EXISTS "${TEMPLATE_DB}"`)
    await cleanupClient.end()
  }
}
