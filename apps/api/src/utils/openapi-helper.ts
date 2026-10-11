import { resolver } from "hono-openapi"
import { apiErrorEnvelope } from "./schemas"

const GENERIC_RESPONSES: Record<number, string> = {
  401: "The request is not authenticated.",
  403: "The authenticated user lacks permission to perform this action.",
  500: "An internal server error occurred.",
}

export const getOpenApiResponses = (custom: Record<number, string> = {}) =>
  Object.fromEntries(
    Object.entries({ ...GENERIC_RESPONSES, ...custom }).map(([status, description]) => [
      status,
      {
        description,
        content: { "application/json": { schema: resolver(apiErrorEnvelope) } },
      },
    ]),
  )
