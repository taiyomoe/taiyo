import type { Context } from "hono"
import type { HelpersMiddleware } from "~/types"

export const formatError =
  (id: Parameters<HelpersMiddleware["Variables"]["t"]>[0]) =>
  (c: Context<HelpersMiddleware>) => {
    const payload = {
      code: id,
      message: c.var.t(id),
    }

    return c.json(payload)
  }
