import pg from "pg"

// Timestamp columns hold UTC without a zone.
const SESSION_OPTIONS = "-c TimeZone=UTC"

export const createPool = (connectionString: string) => {
  const pool = new pg.Pool({ connectionString, options: SESSION_OPTIONS })

  pool.on("error", (err) => {
    // oxlint-disable-next-line no-console
    console.error("idle Postgres client error:", err.message)
  })

  return pool
}
