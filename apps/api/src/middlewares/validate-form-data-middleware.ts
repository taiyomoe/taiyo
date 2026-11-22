import type z from "zod"
import { config } from "@taiyomoe/config"
import { buildFormDataObject, coerceFormDataValue } from "@taiyomoe/utils"
import { bodyLimit } from "hono/body-limit"
import { createMiddleware } from "hono/factory"
import { withRequestSpec } from "../utils/openapi-helper"

type Env<TSchema extends z.ZodType> = {
  Variables: {
    formData: z.infer<TSchema>
  }
}

// A limit applied after the body was read throws, so it lives here, before formData().
const multipartBodyLimit = bodyLimit({
  maxSize: config.input.maxMultipartBodyBytes,
  onError: (c) => c.fail("PAYLOAD_TOO_LARGE"),
})

export const validateFormData = <TSchema extends z.ZodType>(schema: TSchema) =>
  withRequestSpec(
    createMiddleware<Env<TSchema>>(async (c, next) => {
      const contentType = c.req.header("content-type") ?? ""
      const validate = (json: unknown) => {
        const validation = schema.safeParse(json)

        if (!validation.success) {
          return c.fail(
            "VALIDATION_ERROR",
            validation.error.issues.slice(0, config.input.maxValidationIssues),
          )
        }

        c.set("formData", validation.data)

        return next()
      }

      if (!contentType.includes("multipart/form-data")) {
        return validate({})
      }

      let validated: ReturnType<typeof validate> | undefined
      const tooLarge = await multipartBodyLimit(c, async () => {
        const formData = await c.req.formData()

        validated = validate(
          buildFormDataObject(
            [...formData.entries()].map(([key, value]) => [key, coerceFormDataValue(value)]),
          ),
        )
        await validated
      })

      return tooLarge ?? validated
    }),
    "form",
    schema,
  )
