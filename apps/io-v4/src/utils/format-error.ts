import type { Context } from "hono"
import type { CustomContext } from "../types"

export const formatError =
  (id: Parameters<CustomContext["Variables"]["t"]>[0]) =>
  (c: Context<CustomContext>) => {
    const payload = {
      code: id,
      message: c.var.t(id),
    }

    return c.json(payload)
  }
