import { mediaSuggestionAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkMediaSuggestion } from "../middlewares/check-media-suggestion-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { rejectSuggestions } from "../utils/media-suggestions"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, reviewNoteSchema } from "../utils/schemas"

const rejectSchema = z.object({
  note: reviewNoteSchema.meta({
    description: "Why the suggestion is rejected, shown to its author.",
    example: "No source for the end date.",
  }),
})

export const rejectMediaSuggestionHandler = new Hono().post(
  "/:id/reject",
  describeRoute({
    summary: "Reject a media suggestion",
    description:
      "Rejects a whole pending suggestion with a note for its author. Nothing is applied to the media.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Media suggestions"],
    responses: {
      201: {
        description: "Suggestion rejected.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({ id: z.uuid().meta({ description: "The ID of the suggestion." }) }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No suggestion with the given ID exists, or its media was deleted.",
        409: "The suggestion is no longer pending.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(mediaSuggestionAudit.REJECT),
  withAuth("mediaSuggestion.review"),
  validateJson(rejectSchema),
  checkMediaSuggestion(),
  withTransaction,
  async (c) => {
    const { db, mediaSuggestion, user } = c.var

    c.var.audit.set({ target: { mediaId: mediaSuggestion.mediaId }, reason: c.var.json.note })

    const locked = await db
      .selectFrom("mediaSuggestions")
      .select("status")
      .where("id", "=", mediaSuggestion.id)
      .forUpdate()
      .executeTakeFirstOrThrow()

    if (locked.status !== "PENDING") {
      return c.fail("MEDIA_SUGGESTION_NOT_PENDING")
    }

    await rejectSuggestions(db, [mediaSuggestion.id], {
      reviewerId: user.id,
      note: c.var.json.note,
    })

    return c.ok({ id: mediaSuggestion.id })
  },
)
