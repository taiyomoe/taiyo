import { sql } from "@taiyomoe/db"
import { afterEach, beforeEach, describe, expect } from "vitest"
import { test } from "./setup"

describe("timestamp columns", () => {
  const processZone = process.env.TZ

  beforeEach(() => {
    process.env.TZ = "Europe/Paris"
  })

  afterEach(() => {
    process.env.TZ = processZone
  })

  test("are read and written as UTC whatever the process zone", async ({ services }) => {
    const written = new Date("2026-01-02T03:04:05.678Z")
    const { rows } = await sql<{ now: Date; written: Date; text: string }>`
      select
        (CURRENT_TIMESTAMP at time zone 'UTC')::timestamp(3) as "now",
        ${written}::timestamp(3) as "written",
        ${written}::timestamp(3)::text as "text"
    `.execute(services.db)
    const [row] = rows

    expect(Math.abs((row?.now.getTime() ?? 0) - Date.now())).toBeLessThan(60_000)
    expect(row?.written.toISOString()).toBe(written.toISOString())
    expect(row?.text).toBe("2026-01-02 03:04:05.678")
  })
})
