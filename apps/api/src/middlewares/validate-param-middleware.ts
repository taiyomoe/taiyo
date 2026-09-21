import { createMiddleware } from "hono/factory"
import type z from "zod"

type Env<TSchema extends z.ZodType> = {
  Variables: {
    param: z.infer<TSchema>
  }
}

export const validateParam = <TSchema extends z.ZodType>(schema: TSchema) => {
  return createMiddleware<Env<TSchema>>(async (c, next) => {
    const validation = schema.safeParse(c.req.param())

    if (!validation.success) {
      return c.fail("VALIDATION_ERROR", validation.error.issues)
    }

    c.set("param", validation.data)

    await next()
  })
}
