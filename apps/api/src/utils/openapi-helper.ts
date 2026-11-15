import type { MiddlewareHandler, ValidationTargets } from "hono"
import type z from "zod"
import { resolver, uniqueSymbol } from "hono-openapi"
import { apiErrorEnvelope } from "./schemas"

const GENERIC_RESPONSES: Record<number, string> = {
  401: "You are not signed in.",
  403: "You do not have permission to perform this action.",
  500: "An internal server error occurred.",
}

/**
 * Error responses of a route. `500` is always listed. Pass `true` for a status
 * to use its generic description, or a string to describe the route's own cases.
 */
export const getOpenApiResponses = (custom: Record<number, string | true> = {}) =>
  Object.fromEntries(
    Object.entries({ ...custom, 500: true }).map(([status, description]) => [
      status,
      {
        description:
          typeof description === "string" ? description : GENERIC_RESPONSES[Number(status)],
        content: { "application/json": { schema: resolver(apiErrorEnvelope) } },
      },
    ]),
  )

export const withRequestSpec = <TMiddleware extends MiddlewareHandler>(
  middleware: TMiddleware,
  target: keyof ValidationTargets,
  schema: z.ZodType,
) =>
  Object.assign(middleware, {
    [uniqueSymbol]: {
      target,
      ...resolver(schema),
      options: target === "form" ? { media: "multipart/form-data" } : {},
    },
  })
