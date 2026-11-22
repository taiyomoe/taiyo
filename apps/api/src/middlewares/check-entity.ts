import type { DB } from "@taiyomoe/db"
import type { Kysely } from "kysely"
import { createMiddleware } from "hono/factory"
import z from "zod"
import type { ErrorCode } from "../utils/errors"
import { withRequestSpec } from "../utils/openapi-helper"

// C reaches the middleware's inferred response type, which apps/web's RPC client reads.
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters
export const checkEntity = <K extends string, Row, C extends ErrorCode>({
  key,
  description,
  notFound,
  load,
  logRow = true,
}: {
  key: K
  description: string
  notFound: C
  load: (db: Kysely<DB>, id: string) => Promise<Row | undefined>
  logRow?: boolean
}) => {
  const paramSchema = z.object({ id: z.uuid().meta({ description }) })

  return withRequestSpec(
    createMiddleware<{ Variables: Record<K, Row> }>(async (c, next) => {
      const parsed = paramSchema.safeParse({ id: c.req.param("id") })

      if (!parsed.success) {
        return c.fail("VALIDATION_ERROR", parsed.error.issues)
      }

      const { id } = parsed.data
      const db = c.get("db")
      const log = c.get("log")

      log.set({ [key]: { id } })

      const row = await load(db, id)

      if (row === undefined) {
        return c.fail(notFound)
      }

      if (logRow) {
        log.set({ [key]: row })
      }

      c.set(key, row)

      return next()
    }),
    "param",
    paramSchema,
  )
}
