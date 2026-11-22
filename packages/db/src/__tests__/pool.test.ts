import { describe, expect, it } from "vitest"
import { createPool } from "../pool"

describe("createPool", () => {
  it("pins every session to UTC", async () => {
    const pool = createPool("postgres://user:pass@localhost:5432/db")

    expect(pool.options.options).toBe("-c TimeZone=UTC")
    await pool.end()
  })

  it("listens for errors from idle clients", async () => {
    const pool = createPool("postgres://user:pass@localhost:5432/db")

    expect(pool.listenerCount("error")).toBe(1)
    await pool.end()
  })
})
