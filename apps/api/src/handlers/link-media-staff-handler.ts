import { STAFF_ROLES } from "@taiyomoe/db"
import { syncMedia } from "@taiyomoe/search"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const linkMediaStaffSchema = z.object({
  staffId: z
    .uuid()
    .meta({ description: "ID of an existing staff member.", example: crypto.randomUUID() }),
  role: z.enum(STAFF_ROLES).meta({ description: "Their role for this media.", example: "AUTHOR" }),
})

export const linkMediaStaffHandler = new Hono().post(
  "/:id/staffs",
  describeRoute({
    summary: "Link a staff to a media",
    description:
      "Adds a staff to a media with the given role.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Media staff"],
    requestBody: {
      content: { "application/json": await resolver(linkMediaStaffSchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Staff linked to the media.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  mediaId: z.uuid(),
                  staffId: z.uuid(),
                  role: z.enum(STAFF_ROLES),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given id or no staff with the given id exists.",
        409: "This staff is already linked to the media with that role.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth("update", "Media"),
  validateJson(linkMediaStaffSchema),
  checkMedia(),
  withTransaction,
  async (c) => {
    const { db, media } = c.var
    const { staffId, role } = c.var.json
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

    c.var.afterCommit(() => syncMedia({ db: c.var.db, meili: c.var.meili }, media.id))

    return c.ok({ mediaId: media.id, staffId, role })
  },
)
