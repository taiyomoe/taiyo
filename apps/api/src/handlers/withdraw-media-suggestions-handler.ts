import { mediaSuggestionAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkResultSchema, partitionFound, skippedSchema } from "../utils/bulk"
import {
  lockSuggestions,
  suggestionIdsSchema,
  withdrawSuggestions,
} from "../utils/media-suggestions"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const withdrawSchema = z.object({ suggestionIds: suggestionIdsSchema })
const skippedSuggestionSchema = skippedSchema(
  "suggestion",
  ["NOT_FOUND", "NOT_PENDING"],
  "Why the suggestion was left alone: it does not exist, is not yours or its media was deleted, or it was already reviewed or withdrawn.",
)

export const withdrawMediaSuggestionsHandler = new Hono().post(
  "/withdraw",
  describeRoute({
    summary: "Withdraw media suggestions in bulk",
    description:
      "Withdraws several of your suggestions that are still waiting for review. Suggestions that do not exist, are not yours, are on deleted medias or are no longer pending are skipped and reported.\n\n**Authentication:** signed-in user.",
    tags: ["Media suggestions"],
    responses: {
      201: {
        description: "The withdrawn and skipped suggestions.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                bulkResultSchema("suggestions", "withdrawn", skippedSuggestionSchema),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The request body failed validation.",
      }),
    },
  }),
  audited(mediaSuggestionAudit.WITHDRAW_MANY),
  withAuth(),
  validateJson(withdrawSchema),
  withTransaction,
  async (c) => {
    const { can, db, user } = c.var
    const { suggestionIds } = c.var.json
    const rows = await lockSuggestions(db, suggestionIds)
    const { found, missing } = partitionFound(
      suggestionIds,
      rows.filter((row) => row.authorId === user.id),
    )
    const done = found.filter((row) => can("mediaSuggestion.withdraw", row)).map((row) => row.id)

    await withdrawSuggestions(db, done)

    c.var.audit.set({ changes: { after: { suggestionIds: done } } })

    return c.ok({
      done,
      skipped: [
        ...found
          .filter((row) => !done.includes(row.id))
          .map((row) => ({ id: row.id, reason: "NOT_PENDING" as const })),
        ...missing.map((id) => ({ id, reason: "NOT_FOUND" as const })),
      ],
    })
  },
)
