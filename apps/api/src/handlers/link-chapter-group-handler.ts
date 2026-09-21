import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { requireChapterAccess } from "../middlewares/require-chapter-access-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const linkChapterGroupSchema = z.object({
  groupId: z.uuid().meta({ description: "ID of an existing group.", example: crypto.randomUUID() }),
})

export const linkChapterGroupHandler = new Hono().post(
  "/:id/groups",
  describeRoute({
    summary: "Link a group to a chapter",
    description:
      "Adds a group to a chapter.\n\n**Authentication:** uploader intern, uploader, moderator, admin — or any signed-in member of a group already linked to the chapter.",
    tags: ["Chapter groups"],
    requestBody: {
      content: { "application/json": await resolver(linkChapterGroupSchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Group linked to the chapter.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(z.object({ chapterId: z.uuid(), groupId: z.uuid() })),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No chapter with the given id or no group with the given id exists.",
        409: "This group is already linked to the chapter.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth("read", "OwnershipRequest"),
  validateJson(linkChapterGroupSchema),
  checkChapter(),
  requireChapterAccess,
  withTransaction,
  async (c) => {
    const { db, chapter } = c.var
    const { groupId } = c.var.json
    const group = await db
      .selectFrom("groups")
      .select("id")
      .where("id", "=", groupId)
      .where("deletedAt", "is", null)
      .executeTakeFirst()

    if (!group) {
      return c.fail("GROUP_NOT_FOUND")
    }

    const existing = await db
      .selectFrom("chapterGroups")
      .select("groupId")
      .where("chapterId", "=", chapter.id)
      .where("groupId", "=", groupId)
      .executeTakeFirst()

    if (existing) {
      return c.fail("CHAPTER_GROUP_EXISTS")
    }

    await db.insertInto("chapterGroups").values({ chapterId: chapter.id, groupId }).execute()

    return c.ok({ chapterId: chapter.id, groupId })
  },
)
