import { resolver } from "hono-openapi"
import { apiErrorEnvelope } from "./schemas"

const GENERIC_RESPONSES: Record<number, string> = {
  401: "The request is not authenticated.",
  403: "The authenticated user lacks permission to perform this action.",
  500: "An internal server error occurred.",
}

/**
 * Builds the `responses` block for `describeRoute`. Always emits the generic
 * 401/403/500 entries; pass any route-specific status → description pairs
 * (e.g. `409`, `422`) to add them alongside. Every response uses the shared
 * `apiErrorEnvelope` schema.
 */
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
