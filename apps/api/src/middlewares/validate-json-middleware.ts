import { createMiddleware } from "hono/factory"
import type z from "zod"

type Env<TSchema extends z.ZodType> = {
  Variables: {
    json?: z.infer<TSchema>
  }
}

export const validateJson = <TSchema extends z.ZodType>(schema: TSchema) => {
  return createMiddleware<Env<TSchema>>(async (c, next) => {
    let raw: unknown

    try {
      raw = await c.req.json()
    } catch {
      raw = {}
    }

    const validation = schema.safeParse(raw)

    if (!validation.success) {
      return c.fail("VALIDATION_ERROR", validation.error.issues)
    }

    c.set("json", validation.data)

    await next()
  })
}
