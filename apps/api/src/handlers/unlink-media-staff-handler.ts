import { mediaStaffAudit } from "@taiyomoe/audit"
import { STAFF_ROLES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkMedia } from "../middlewares/check-media-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the media." }),
  staffId: z.uuid().meta({ description: "The ID of the staff." }),
  role: z
    .enum(STAFF_ROLES)
    .meta({ description: "The role of the staff on the media.", example: "AUTHOR" }),
})

export const unlinkMediaStaffHandler = new Hono().delete(
  "/:id/staffs/:staffId/:role",
  describeRoute({
    summary: "Unlink a staff from a media",
    description:
      "Unlinks a staff from a media for the given role. The other roles of the staff on the media are kept.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
    tags: ["Media staff"],
    responses: {
      200: {
        description: "Staff unlinked from the media.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  mediaId: z.uuid().meta({ description: "The ID of the media." }),
                  staffId: z.uuid().meta({ description: "The ID of the staff." }),
                  role: z.enum(STAFF_ROLES).meta({
                    description: "The role of the staff on the media.",
                    example: "AUTHOR",
                  }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No media with the given ID exists, or the staff is not linked to the media with this role.",
        422: "One of the provided IDs is not a valid UUID, or the role is not a valid staff role.",
      }),
    },
  }),
  audited(mediaStaffAudit.UNLINK, (c) => ({
    id: c.req.param("id"),
    staffId: c.req.param("staffId"),
    role: c.req.param("role"),
  })),
  withAuth("media.update"),
  validateParam(paramSchema),
  checkMedia(),
  withTransaction,
  async (c) => {
    const { db, media } = c.var
    const { staffId, role } = c.var.param
    const deleted = await db
      .deleteFrom("mediaStaffs")
      .where("mediaId", "=", media.id)
      .where("staffId", "=", staffId)
      .where("role", "=", role)
      .returning(["staffId"])
      .executeTakeFirst()

    if (!deleted) {
      return c.fail("MEDIA_STAFF_NOT_FOUND")
    }

    return c.ok({ mediaId: media.id, staffId, role })
  },
)
