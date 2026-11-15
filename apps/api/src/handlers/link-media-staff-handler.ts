import { mediaStaffAudit } from "@taiyomoe/audit"
import { STAFF_ROLES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkMedia } from "../middlewares/check-media-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const linkMediaStaffSchema = z.object({
  staffId: z
    .uuid()
    .meta({ description: "The ID of the staff.", example: "6f1d3c2b-8a4e-4f7a-9c1d-2e5b7a9c0d34" }),
  role: z
    .enum(STAFF_ROLES)
    .meta({ description: "The role of the staff on the media.", example: "AUTHOR" }),
})

export const linkMediaStaffHandler = new Hono().post(
  "/:id/staffs",
  describeRoute({
    summary: "Link a staff to a media",
    description:
      "Links a staff to a media with the given role. A staff can be linked to the same media with several roles.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
    tags: ["Media staff"],
    responses: {
      201: {
        description: "Staff linked to the media.",
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
        404: "No media with the given ID exists, or the staff does not exist.",
        409: "The staff is already linked to the media with this role.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(mediaStaffAudit.LINK),
  withAuth("media.update"),
  validateJson(linkMediaStaffSchema),
  checkMedia(),
  withTransaction,
  async (c) => {
    const { db, media } = c.var
    const { staffId, role } = c.var.json

    c.var.audit.set({ target: { staffId, role } })

    const staff = await db
      .selectFrom("staffs")
      .select("id")
      .where("id", "=", staffId)
      .where("deletedAt", "is", null)
      .executeTakeFirst()

    if (!staff) {
      return c.fail("STAFF_NOT_FOUND", { missingStaffIds: [staffId] })
    }

    const existing = await db
      .selectFrom("mediaStaffs")
      .select("staffId")
      .where("mediaId", "=", media.id)
      .where("staffId", "=", staffId)
      .where("role", "=", role)
      .executeTakeFirst()

    if (existing) {
      return c.fail("MEDIA_STAFF_EXISTS")
    }

    await db.insertInto("mediaStaffs").values({ mediaId: media.id, staffId, role }).execute()

    return c.ok({ mediaId: media.id, staffId, role })
  },
)
