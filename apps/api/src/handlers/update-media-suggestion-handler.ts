import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMediaSuggestion } from "../middlewares/check-media-suggestion-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import {
  checkMediaEdit,
  diffMediaEdit,
  editedFields,
  lockMedia,
  normalizeMediaEdit,
  pickFields,
  readMediaEdit,
} from "../utils/media-edit"
import { mediaSuggestionBodySchema } from "../utils/media-suggestions"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const updateMediaSuggestionHandler = new Hono().patch(
  "/:id",
  describeRoute({
    summary: "Edit a media suggestion",
    description:
      "Replaces the changes of a pending suggestion. As when suggesting, only the fields that differ from the media are kept.\n\n**Authentication:** the author of the suggestion.",
    tags: ["Media suggestions"],
    requestBody: {
      content: {
        "application/json": await resolver(mediaSuggestionBodySchema).toOpenAPISchema(),
      },
    },
    responses: {
      200: {
        description: "Suggestion updated.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No suggestion with the given id exists, or one of the staff members does not exist.",
        409: "The suggestion was already reviewed or withdrawn, or a link already belongs to another media.",
        422: "The request data failed validation, or the suggestion changes nothing.",
      }),
    },
  }),
  withAuth(),
  validateJson(mediaSuggestionBodySchema),
  checkMediaSuggestion(),
  withTransaction,
  async (c) => {
    const { can, db, mediaSuggestion, user } = c.var
    const body = c.var.json
    const locked = await db
      .selectFrom("mediaSuggestions")
      .select(["authorId", "status"])
      .where("id", "=", mediaSuggestion.id)
      .forUpdate()
      .executeTakeFirstOrThrow()

    if (!can("mediaSuggestion.update", locked)) {
      return locked.authorId === user.id
        ? c.fail("MEDIA_SUGGESTION_NOT_PENDING")
        : c.fail("FORBIDDEN")
    }

    if ((await lockMedia(db, mediaSuggestion.mediaId)) === undefined) {
      return c.fail("MEDIA_NOT_FOUND")
    }

    const current = await readMediaEdit(db, mediaSuggestion.mediaId)
    const changes = diffMediaEdit(current, normalizeMediaEdit(body.changes))
    const fields = editedFields(changes)

    if (fields.length === 0) {
      return c.fail("MEDIA_SUGGESTION_EMPTY")
    }

    const error = await checkMediaEdit(db, mediaSuggestion.mediaId, changes)

    if (error?.code === "MEDIA_LINK_CONFLICT") {
      return c.fail(error.code, error.details)
    }

    if (error !== null) {
      return c.fail(error.code)
    }

    await db
      .updateTable("mediaSuggestions")
      .set({
        changes,
        base: pickFields(current, fields),
        ...(body.note === undefined ? {} : { note: body.note }),
      })
      .where("id", "=", mediaSuggestion.id)
      .execute()

    return c.ok({ id: mediaSuggestion.id })
  },
)
