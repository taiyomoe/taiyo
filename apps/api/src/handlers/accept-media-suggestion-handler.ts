import { mediaSuggestionAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkMediaSuggestion } from "../middlewares/check-media-suggestion-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { auditChanges } from "../utils/audit"
import { editedFields, mediaEditSchema } from "../utils/media-edit"
import { acceptSuggestion, suggestionNoteSchema } from "../utils/media-suggestions"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const acceptSchema = z.object({
  changes: mediaEditSchema
    .refine((changes) => Object.keys(changes).length > 0, {
      message: "Accept at least one field, or reject the suggestion.",
    })
    .meta({
      description:
        "The fields to accept, with the values to apply. A reviewer can adjust a suggested value before accepting it. Fields left out are rejected.",
    }),
  note: suggestionNoteSchema.meta({
    description: "A note for the author of the suggestion, if any.",
    example: "Kept the start date, the end date has no source.",
  }),
})

export const acceptMediaSuggestionHandler = new Hono().post(
  "/:id/accept",
  describeRoute({
    summary: "Accept a media suggestion",
    description:
      "Accepts some or all of the fields of a pending suggestion and applies them to the media, with your adjustments. The changes are credited to the author of the suggestion.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Media suggestions"],
    responses: {
      201: {
        description: "Suggestion accepted.",
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
        404: "No suggestion with the given ID exists, or its media was deleted, or one of the staff members does not exist.",
        409: "The suggestion is no longer pending, or one of the links already belongs to another media.",
        422: "The provided ID is not a valid UUID, or the request body failed validation, or it accepts a field the suggestion does not change.",
      }),
    },
  }),
  audited(mediaSuggestionAudit.ACCEPT),
  withAuth("mediaSuggestion.review"),
  validateJson(acceptSchema),
  checkMediaSuggestion(),
  withTransaction,
  async (c) => {
    const { db, mediaSuggestion, user } = c.var
    const body = c.var.json
    const locked = await db
      .selectFrom("mediaSuggestions")
      .select(["status", "changes", "authorId"])
      .where("id", "=", mediaSuggestion.id)
      .forUpdate()
      .executeTakeFirstOrThrow()

    if (locked.status !== "PENDING") {
      return c.fail("MEDIA_SUGGESTION_NOT_PENDING")
    }

    const suggested = new Set(editedFields(locked.changes))

    if (editedFields(body.changes).some((field) => !suggested.has(field))) {
      return c.fail("MEDIA_SUGGESTION_UNKNOWN_FIELDS")
    }

    const result = await acceptSuggestion(db, {
      suggestion: {
        id: mediaSuggestion.id,
        mediaId: mediaSuggestion.mediaId,
        authorId: locked.authorId,
      },
      changes: body.changes,
      reviewerId: user.id,
      note: body.note ?? null,
    })

    if (result.error?.code === "MEDIA_LINK_CONFLICT") {
      return c.fail(result.error.code, result.error.details)
    }

    if (result.error !== null) {
      return c.fail(result.error.code)
    }

    c.var.audit.set({
      target: { mediaId: mediaSuggestion.mediaId, authorId: locked.authorId },
      changes: auditChanges(result.current, result.edit),
      ...(body.note === undefined || body.note === null ? {} : { reason: body.note }),
    })

    return c.ok({ id: mediaSuggestion.id })
  },
)
