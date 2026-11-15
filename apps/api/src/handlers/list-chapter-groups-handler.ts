import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { authorizeChapterView } from "../middlewares/authorize-chapter-view-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const chapterGroupItemSchema = z.object({
  groupId: z.uuid().meta({ description: "The ID of the group." }),
  name: z.string().meta({ description: "The name of the group.", example: "Sunray Scans" }),
  logo: z.string().nullable().meta({
    description: "The image key of the group's logo, if any.",
    example:
      "groups/8d2f5a61-0c3b-4e7a-9f14-2b6c7d8e9f01/logos/3c4d5e6f-7a8b-4c9d-8e0f-1a2b3c4d5e6f.jpg",
  }),
})

export const listChapterGroupsHandler = new Hono().get(
  "/:id/groups",
  describeRoute({
    summary: "List the groups of a chapter",
    description:
      "Lists the groups credited on a chapter, alphabetically by name. A chapter that is not published yet follows the same visibility rules as when getting the chapter.\n\n**Authentication:** optional.",
    tags: ["Chapter groups"],
    responses: {
      200: {
        description: "The groups of the chapter.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(chapterGroupItemSchema.array())),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No chapter with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  withOptionalAuth,
  checkChapter({ unpublished: true }),
  authorizeChapterView,
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
