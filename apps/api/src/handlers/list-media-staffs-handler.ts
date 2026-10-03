import { STAFF_ROLES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const mediaStaffItemSchema = z.object({
  staffId: z.uuid().meta({ description: "The ID of the staff member." }),
  name: z.string().meta({ description: "Name of the staff.", example: "Kishimoto Masashi" }),
  image: z.string().nullable().meta({ description: "Storage key of the staff image, if any." }),
  role: z.enum(STAFF_ROLES).meta({ description: "Role on this media." }),
})

export const listMediaStaffsHandler = new Hono().get(
  "/:id/staffs",
  describeRoute({
    summary: "List staff linked to a media",
    description:
      "Lists every staff member linked to the media with their role.\n\n**Authentication:** none.",
    tags: ["Media staff"],
    responses: {
      200: {
        description: "Staff linked to the media.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(mediaStaffItemSchema.array())),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given id exists.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  checkMedia(),
  async (c) => {
    const { db, media } = c.var
    const rows = await db
      .selectFrom("mediaStaffs")
      .innerJoin("staffs", "staffs.id", "mediaStaffs.staffId")
      .where("mediaStaffs.mediaId", "=", media.id)
      .where("staffs.deletedAt", "is", null)
      .select(["staffs.id as staffId", "staffs.name", "staffs.image", "mediaStaffs.role"])
      .orderBy("staffs.name", "asc")
      .execute()

    return c.ok(rows)
  },
)
