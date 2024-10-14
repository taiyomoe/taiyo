import { zValidator } from "@hono/zod-validator"
import type { Context, ValidationTargets } from "hono"
import type { ZodSchema } from "zod"
import type { HelpersMiddleware } from "~/types"
import { formatError } from "~/utils/format-error"

export const withValidation = <TSchema extends ZodSchema>(
  where: keyof ValidationTargets,
  schema: TSchema,
) =>
  zValidator(where, schema, (r, c: Context<HelpersMiddleware>) => {
    if (!r.success) {
      return formatError("validation")(c)
    }
  })
