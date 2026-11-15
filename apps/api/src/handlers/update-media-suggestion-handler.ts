import { mediaSuggestionAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
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
    summary: "Update a media suggestion",
    description:
      "Updates one of your pending suggestions, replacing its changes. As when suggesting, only the fields that differ from the media are kept.\n\n**Required access:** the author of the suggestion.",
    tags: ["Media suggestions"],
    responses: {
      200: {
        description: "Suggestion updated.",
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
        403: "You are not the author of the suggestion, or you do not have permission to perform this action.",
        404: "No suggestion with the given ID exists, or its media was deleted, or you cannot see it, or one of the staff members does not exist.",
        409: "The suggestion is no longer pending, or one of the links already belongs to another media.",
        422: "The provided ID is not a valid UUID, or the request body failed validation, or the suggestion changes nothing.",
      }),
    },
  }),
  audited(mediaSuggestionAudit.UPDATE),
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

    c.var.audit.set({ target: { mediaId: mediaSuggestion.mediaId, fields } })

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
