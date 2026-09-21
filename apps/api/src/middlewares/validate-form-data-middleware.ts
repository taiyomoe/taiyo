import { coerceFormDataValue } from "@taiyomoe/utils"
import { createMiddleware } from "hono/factory"
import { construct } from "radashi"
import type z from "zod"

type Env<TSchema extends z.ZodType> = {
  Variables: {
    formData?: z.infer<TSchema>
  }
}

export const validateFormData = <TSchema extends z.ZodType>(schema: TSchema) => {
  return createMiddleware<Env<TSchema>>(async (c, next) => {
    const contentType = c.req.header("content-type") || ""
    let json: Record<string, unknown> = {}

    if (contentType.includes("multipart/form-data")) {
      const formData = await c.req.formData()

      formData.forEach((value, key) => {
        json[key] = coerceFormDataValue(value)
      })

      json = construct(json) as Record<string, unknown>
    }

    const validation = schema.safeParse(json)

    if (!validation.success) {
      return c.fail("VALIDATION_ERROR", validation.error.issues)
    }

    c.set("formData", validation.data)

    await next()
  })
}
