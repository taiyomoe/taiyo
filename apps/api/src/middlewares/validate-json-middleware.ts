import type z from "zod"
import { config } from "@taiyomoe/config"
import { createMiddleware } from "hono/factory"
import { withRequestSpec } from "../utils/openapi-helper"

type Env<TSchema extends z.ZodType> = {
  Variables: {
    json: z.infer<TSchema>
  }
}

const isJsonContentType = (header: string | undefined) => {
  const type = header?.split(";")[0]?.trim().toLowerCase() ?? ""

  return type === "application/json" || type.endsWith("+json")
}

export const validateJson = <TSchema extends z.ZodType>(schema: TSchema) =>
  withRequestSpec(
    createMiddleware<
      Env<TSchema>,
      string,
      { in: { json: z.input<TSchema> }; out: { json: z.output<TSchema> } }
    >(async (c, next) => {
      let raw: unknown = {}

      if (isJsonContentType(c.req.header("content-type"))) {
        try {
          raw = await c.req.json()
        } catch {
          raw = {}
        }
      }

      const validation = schema.safeParse(raw)

      if (!validation.success) {
        return c.fail(
          "VALIDATION_ERROR",
          validation.error.issues.slice(0, config.input.maxValidationIssues),
        )
      }

      c.set("json", validation.data)

      return next()
    }),
    "json",
    schema,
  )
