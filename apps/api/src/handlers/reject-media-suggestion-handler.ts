import { mediaSuggestionAudit } from "@taiyomoe/audit"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkMediaSuggestion } from "../middlewares/check-media-suggestion-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, reviewNoteSchema } from "../utils/schemas"

const rejectSchema = z.object({
  note: reviewNoteSchema,
})

export const rejectMediaSuggestionHandler = new Hono().post(
  "/:id/reject",
  describeRoute({
    summary: "Reject a media suggestion",
    description:
      "Rejects a whole suggestion with a note for its author. Nothing is applied.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Media suggestions"],
    requestBody: {
      content: { "application/json": await resolver(rejectSchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Suggestion rejected.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No suggestion with the given id exists.",
        409: "The suggestion was already reviewed or withdrawn.",
        422: "The request data failed validation.",
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

    await db
      .updateTable("mediaSuggestions")
      .set({
        status: "REJECTED",
        reviewerId: user.id,
        reviewerNote: c.var.json.note,
        reviewedAt: sql<Date>`CURRENT_TIMESTAMP`,
      })
      .where("id", "=", mediaSuggestion.id)
      .execute()

    return c.ok({ id: mediaSuggestion.id })
  },
)
