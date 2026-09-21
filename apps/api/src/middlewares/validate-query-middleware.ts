import { createMiddleware } from "hono/factory"
import type z from "zod"

type Env<TSchema extends z.ZodType> = {
  Variables: {
    query: z.infer<TSchema>
  }
}

export const validateQuery = <TSchema extends z.ZodType>(schema: TSchema) => {
  return createMiddleware<Env<TSchema>>(async (c, next) => {
    const validation = schema.safeParse(c.req.query())

    if (!validation.success) {
      return c.fail("VALIDATION_ERROR", validation.error.issues)
    }

    c.set("query", validation.data)

    await next()
  })
}
