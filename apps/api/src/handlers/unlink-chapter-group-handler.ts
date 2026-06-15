import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({
  id: z.uuid(),
  groupId: z.uuid(),
})

export const unlinkChapterGroupHandler = new Hono().delete(
  "/:id/groups/:groupId",
  describeRoute({
    summary: "Unlink a group from a chapter",
    description:
      "Removes a group link from the chapter.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
    tags: ["Chapter groups"],
    responses: {
      200: {
        description: "Group unlinked from the chapter.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(z.object({ chapterId: z.uuid(), groupId: z.uuid() })),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No chapter with the given id exists, or no link with the group exists.",
        422: "The provided path parameters failed validation.",
      }),
    },
  }),
  withAuth("update", "Chapter"),
  validateParam(paramSchema),
  checkChapter(),
  withTransaction,
  async (c) => {
    const { db, chapter } = c.var
    const { groupId } = c.var.param
    const deleted = await db
      .deleteFrom("chapterGroups")
      .where("chapterId", "=", chapter.id)
      .where("groupId", "=", groupId)
      .returning(["groupId"])
      .executeTakeFirst()

    if (!deleted) {
      return c.fail("CHAPTER_GROUP_NOT_FOUND")
    }

    return c.ok({ chapterId: chapter.id, groupId })
  },
)
