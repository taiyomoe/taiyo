import { mediaAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkMedia } from "../middlewares/check-media-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { auditChanges } from "../utils/audit"
import {
  applyMediaEdit,
  checkMediaEdit,
  diffMediaEdit,
  lockMedia,
  mediaEditSchema,
  normalizeMediaEdit,
  readMediaEdit,
} from "../utils/media-edit"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const updateMediaSchema = mediaEditSchema.refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided.",
})

export const updateMediaHandler = new Hono().patch(
  "/:id",
  describeRoute({
    summary: "Update a media",
    description:
      "Updates the details, titles and staff credits of a media. At least one field is required, and omitted fields are left unchanged. `titles` and `staffs` replace the current lists, and `null` clears `startDate` or `endDate`.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "Media updated.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the updated media." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No media with the given ID exists, or one of the staff members does not exist.",
        409: "One of the links already belongs to another media.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(mediaAudit.UPDATE),
  withAuth("media.update"),
  validateJson(updateMediaSchema),
  checkMedia(),
  withTransaction,
  async (c) => {
    const { db, media, user } = c.var

    if ((await lockMedia(db, media.id)) === undefined) {
      return c.fail("MEDIA_NOT_FOUND")
    }

    const current = await readMediaEdit(db, media.id)
    const edit = diffMediaEdit(current, normalizeMediaEdit(c.var.json))
    const error = await checkMediaEdit(db, media.id, edit)

    if (error?.code === "MEDIA_LINK_CONFLICT") {
      return c.fail(error.code, error.details)
    }

    if (error !== null) {
      return c.fail(error.code)
    }

    c.var.audit.set({ changes: auditChanges(current, edit) })

    await applyMediaEdit(db, { mediaId: media.id, actorId: user.id, edit })

    return c.ok({ id: media.id })
  },
)
