import pg from "pg"

// Timestamps are stored as UTC in zone-less columns: CURRENT_TIMESTAMP and date_trunc must run in
// UTC whatever the server's default zone.
const SESSION_OPTIONS = "-c TimeZone=UTC"

export const createPool = (connectionString: string) => {
  const pool = new pg.Pool({ connectionString, options: SESSION_OPTIONS })

  // An idle client whose connection drops emits on the pool: unhandled, it would crash the process.
  pool.on("error", (err) => {
    // oxlint-disable-next-line no-console
    console.error("idle Postgres client error:", err.message)
  })

  return pool
}
