import type z from "zod"
import { config } from "@taiyomoe/config"
import { buildFormDataObject, coerceFormDataValue } from "@taiyomoe/utils"
import { createMiddleware } from "hono/factory"

type Env<TSchema extends z.ZodType> = {
  Variables: {
    formData: z.infer<TSchema>
  }
}

export const validateFormData = <TSchema extends z.ZodType>(schema: TSchema) =>
  createMiddleware<Env<TSchema>>(async (c, next) => {
    const contentType = c.req.header("content-type") ?? ""
    let json: unknown = {}

    if (contentType.includes("multipart/form-data")) {
      const formData = await c.req.formData()

      json = buildFormDataObject(
        [...formData.entries()].map(([key, value]) => [key, coerceFormDataValue(value)]),
      )
    }

    const validation = schema.safeParse(json)

    if (!validation.success) {
      return c.fail(
        "VALIDATION_ERROR",
        validation.error.issues.slice(0, config.input.maxValidationIssues),
      )
    }

    c.set("formData", validation.data)

    return next()
  })
