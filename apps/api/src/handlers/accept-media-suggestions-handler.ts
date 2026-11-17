import { mediaSuggestionAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkResultSchema, partitionFound, skippedSchema } from "../utils/bulk"
import { editedFields, lockMedia, readMediaEdit, sameValue } from "../utils/media-edit"
import {
  acceptSuggestion,
  lockSuggestions,
  suggestionIdsSchema,
  suggestionNoteSchema,
} from "../utils/media-suggestions"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const acceptSchema = z.object({
  suggestionIds: suggestionIdsSchema,
  note: suggestionNoteSchema.meta({
    description: "A note for the authors of the suggestions, if any.",
    example: "Thanks for the sources!",
  }),
})
const skippedSuggestionSchema = skippedSchema(
  "suggestion",
  ["NOT_FOUND", "NOT_PENDING", "CONFLICT"],
  "Why the suggestion was left alone: it does not exist or its media was deleted, it was already reviewed or withdrawn, or it no longer applies as suggested because one of its fields changed on the media since, one of its staff members was deleted or one of its links belongs to another media.",
)

type Skipped = z.infer<typeof skippedSuggestionSchema>

export const acceptMediaSuggestionsHandler = new Hono().post(
  "/accept",
  describeRoute({
    summary: "Accept media suggestions in bulk",
    description:
      "Accepts every field of several pending suggestions as suggested and applies them to their medias, oldest suggestion first. The changes are credited to the authors of the suggestions. Suggestions that do not exist, are on deleted medias, are no longer pending or no longer apply as suggested are skipped and reported: review those one by one.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Media suggestions"],
    responses: {
      201: {
        description: "The accepted and skipped suggestions.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                bulkResultSchema("suggestions", "accepted", skippedSuggestionSchema),
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
  audited(mediaSuggestionAudit.ACCEPT_MANY),
  withAuth("mediaSuggestion.review"),
  validateJson(acceptSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { suggestionIds, note } = c.var.json
    const rows = await lockSuggestions(db, suggestionIds)
    const done: string[] = []
    const skipped: Skipped[] = partitionFound(suggestionIds, rows).missing.map((id) => ({
      id,
      reason: "NOT_FOUND",
    }))

    for (const row of rows) {
      if (row.status !== "PENDING") {
        skipped.push({ id: row.id, reason: "NOT_PENDING" })

        continue
      }

      if ((await lockMedia(db, row.mediaId)) === undefined) {
        skipped.push({ id: row.id, reason: "NOT_FOUND" })

        continue
      }

      const current = await readMediaEdit(db, row.mediaId)

      if (editedFields(row.base).some((field) => !sameValue(row.base[field], current[field]))) {
        skipped.push({ id: row.id, reason: "CONFLICT" })

        continue
      }

      const result = await acceptSuggestion(db, {
        suggestion: row,
        changes: row.changes,
        reviewerId: user.id,
        note: note ?? null,
      })

      if (result.error === null) {
        done.push(row.id)
      } else {
        skipped.push({ id: row.id, reason: "CONFLICT" })
      }
    }

    c.var.audit.set({
      changes: { after: { suggestionIds: done } },
      ...(note === undefined || note === null ? {} : { reason: note }),
    })

    return c.ok({ done, skipped })
  },
)
