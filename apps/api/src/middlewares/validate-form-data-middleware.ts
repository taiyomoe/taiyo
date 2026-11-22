import type z from "zod"
import { config } from "@taiyomoe/config"
import { createMiddleware } from "hono/factory"
import { buildFormDataObject } from "../utils/build-form-data-object"
import { coerceFormDataValue } from "../utils/coerce-form-data-value"
import { withRequestSpec } from "../utils/openapi-helper"

type Env<TSchema extends z.ZodType> = {
  Variables: {
    formData: z.infer<TSchema>
  }
}

export const validateFormData = <TSchema extends z.ZodType>(schema: TSchema) =>
  withRequestSpec(
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
    }),
    "form",
    schema,
  )
