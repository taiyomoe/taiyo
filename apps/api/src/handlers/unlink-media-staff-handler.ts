import { STAFF_ROLES } from "@taiyomoe/db"
import { syncMedia } from "@taiyomoe/search"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({
  id: z.uuid(),
  staffId: z.uuid(),
  role: z.enum(STAFF_ROLES),
})

export const unlinkMediaStaffHandler = new Hono().delete(
  "/:id/staffs/:staffId/:role",
  describeRoute({
    summary: "Unlink a staff from a media",
    description:
      "Removes a single (staff, role) link from the media. Other roles for the same staff are unaffected.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Media staff"],
    responses: {
      200: {
        description: "Staff unlinked from the media.",
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
        404: "No media with the given id exists, or no link between the staff and the media with that role exists.",
        422: "The provided path parameters failed validation.",
      }),
    },
  }),
  withAuth("update", "Media"),
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

    c.var.afterCommit(() => syncMedia({ db: c.var.db, meili: c.var.meili }, media.id))

    return c.ok({ mediaId: media.id, staffId, role })
  },
)
