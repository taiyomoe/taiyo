import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const chapterGroupItemSchema = z.object({
  groupId: z.uuid().meta({ description: "The ID of the group." }),
  name: z.string().meta({ description: "Name of the group.", example: "scansPROJECT" }),
  logo: z.string().nullable().meta({ description: "Storage key of the group logo, if any." }),
})

export const listChapterGroupsHandler = new Hono().get(
  "/:id/groups",
  describeRoute({
    summary: "List groups linked to a chapter",
    description: "Lists every group that worked on this chapter.\n\n**Authentication:** none.",
    tags: ["Chapter groups"],
    responses: {
      200: {
        description: "Groups linked to the chapter.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(chapterGroupItemSchema.array())),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No chapter with the given id exists.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  checkChapter(),
  async (c) => {
    const { db, chapter } = c.var
    const rows = await db
      .selectFrom("chapterGroups")
      .innerJoin("groups", "groups.id", "chapterGroups.groupId")
      .where("chapterGroups.chapterId", "=", chapter.id)
      .where("groups.deletedAt", "is", null)
      .select(["groups.id as groupId", "groups.name", "groups.logo"])
      .orderBy("groups.name", "asc")
      .execute()

    return c.ok(rows)
  },
)
