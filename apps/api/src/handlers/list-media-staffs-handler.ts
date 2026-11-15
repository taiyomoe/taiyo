import { STAFF_ROLES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const mediaStaffItemSchema = z.object({
  staffId: z.uuid().meta({ description: "The ID of the staff." }),
  name: z.string().meta({ description: "The name of the staff.", example: "Kishimoto Masashi" }),
  image: z.string().nullable().meta({ description: "The path of the staff's image, if any." }),
  role: z
    .enum(STAFF_ROLES)
    .meta({ description: "The role of the staff on the media.", example: "AUTHOR" }),
})

export const listMediaStaffsHandler = new Hono().get(
  "/:id/staffs",
  describeRoute({
    summary: "List a media's staff",
    description:
      "Lists the staff credited on a media with their role, alphabetically by name. A staff with several roles appears once per role.\n\n**Authentication:** none.",
    tags: ["Media staff"],
    responses: {
      200: {
        description: "The staff of the media.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(mediaStaffItemSchema.array())),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
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
