import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getChapterTarget } from "../utils/chapter-target"
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
      "Removes a group's credit from the chapter. Group members can only remove the credit of a group where they hold `EDIT_CHAPTERS`.\n\n**Authentication:** uploader, moderator, admin — or a member with `EDIT_CHAPTERS` in the group being removed.",
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
  withAuth(),
  validateParam(paramSchema),
  checkChapter(),
  withTransaction,
  async (c) => {
    const { can, db, chapter } = c.var
    const { groupId } = c.var.param

    if (!can("chapter.uncredit", { chapter: await getChapterTarget(db, chapter), groupId })) {
      return c.fail("FORBIDDEN")
    }

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
