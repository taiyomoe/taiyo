import { mediaSuggestionAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkResultSchema, partitionFound, skippedSchema } from "../utils/bulk"
import { lockSuggestions, rejectSuggestions, suggestionIdsSchema } from "../utils/media-suggestions"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, reviewNoteSchema } from "../utils/schemas"

const rejectSchema = z.object({
  suggestionIds: suggestionIdsSchema,
  note: reviewNoteSchema.meta({
    description: "Why the suggestions are rejected, shown to their authors.",
    example: "No source for these changes.",
  }),
})
const skippedSuggestionSchema = skippedSchema(
  "suggestion",
  ["NOT_FOUND", "NOT_PENDING"],
  "Why the suggestion was left alone: it does not exist or its media was deleted, or it was already reviewed or withdrawn.",
)

export const rejectMediaSuggestionsHandler = new Hono().post(
  "/reject",
  describeRoute({
    summary: "Reject media suggestions in bulk",
    description:
      "Rejects several pending suggestions at once with the same note for their authors. Nothing is applied to the medias. Suggestions that do not exist, are on deleted medias or are no longer pending are skipped and reported.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Media suggestions"],
    responses: {
      201: {
        description: "The rejected and skipped suggestions.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                bulkResultSchema("suggestions", "rejected", skippedSuggestionSchema),
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
  audited(mediaSuggestionAudit.REJECT_MANY),
  withAuth("mediaSuggestion.review"),
  validateJson(rejectSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { suggestionIds, note } = c.var.json
    const { found, missing } = partitionFound(
      suggestionIds,
      await lockSuggestions(db, suggestionIds),
    )
    const done = found.filter((row) => row.status === "PENDING").map((row) => row.id)

    await rejectSuggestions(db, done, { reviewerId: user.id, note })

    c.var.audit.set({ reason: note, changes: { after: { suggestionIds: done } } })

    return c.ok({
      done,
      skipped: [
        ...found
          .filter((row) => row.status !== "PENDING")
          .map((row) => ({ id: row.id, reason: "NOT_PENDING" as const })),
        ...missing.map((id) => ({ id, reason: "NOT_FOUND" as const })),
      ],
    })
  },
)
