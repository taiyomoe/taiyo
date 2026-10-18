import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMediaSuggestion } from "../middlewares/check-media-suggestion-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import {
  applyMediaEdit,
  checkMediaEdit,
  diffMediaEdit,
  editedFields,
  lockMedia,
  mediaEditSchema,
  normalizeMediaEdit,
  readMediaEdit,
} from "../utils/media-edit"
import { suggestionNoteSchema } from "../utils/media-suggestions"
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
  note: suggestionNoteSchema.meta({ description: "A note for the author." }),
})

export const acceptMediaSuggestionHandler = new Hono().post(
  "/:id/accept",
  describeRoute({
    summary: "Accept a media suggestion",
    description:
      "Applies some or all of a suggestion's fields to the media, with the reviewer's adjustments, and closes it.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Media suggestions"],
    requestBody: {
      content: { "application/json": await resolver(acceptSchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Suggestion accepted and applied.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No suggestion with the given id exists, its media was deleted, or one of the staff members does not exist.",
        409: "The suggestion was already reviewed or withdrawn, or a link already belongs to another media.",
        422: "The request data failed validation, or it accepts a field the suggestion does not change.",
      }),
    },
  }),
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
    const accepted = editedFields(body.changes)

    if (accepted.some((field) => !suggested.has(field))) {
      return c.fail("MEDIA_SUGGESTION_UNKNOWN_FIELDS")
    }

    if ((await lockMedia(db, mediaSuggestion.mediaId)) === undefined) {
      return c.fail("MEDIA_NOT_FOUND")
    }

    const edit = diffMediaEdit(
      await readMediaEdit(db, mediaSuggestion.mediaId),
      normalizeMediaEdit(body.changes),
    )
    const error = await checkMediaEdit(db, mediaSuggestion.mediaId, edit)

    if (error?.code === "MEDIA_LINK_CONFLICT") {
      return c.fail(error.code, error.details)
    }

    if (error !== null) {
      return c.fail(error.code)
    }

    await applyMediaEdit(db, { mediaId: mediaSuggestion.mediaId, actorId: locked.authorId, edit })
    await db
      .updateTable("mediaSuggestions")
      .set({
        status: "ACCEPTED",
        acceptedFields: accepted,
        reviewerId: user.id,
        reviewerNote: body.note ?? null,
        reviewedAt: sql<Date>`CURRENT_TIMESTAMP`,
      })
      .where("id", "=", mediaSuggestion.id)
      .execute()

    return c.ok({ id: mediaSuggestion.id })
  },
)
