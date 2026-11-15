import { chapterGroupAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getChapterTarget } from "../utils/chapter-target"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({
  groupId: z.uuid().meta({
    description: "The ID of the group.",
    example: "8d2f5a61-0c3b-4e7a-9f14-2b6c7d8e9f01",
  }),
})

export const unlinkChapterGroupHandler = new Hono().delete(
  "/:id/groups/:groupId",
  describeRoute({
    summary: "Unlink a group from a chapter",
    description:
      "Removes a group's credit from a chapter. Once the chapter is published or scheduled, a group member can only remove the credit of a group where they hold the `EDIT_CHAPTERS` permission.\n\n**Required access:** uploader or admin, a moderator or a member of the removed group with the `EDIT_CHAPTERS` permission when the chapter is published or scheduled, or the user who uploaded the chapter while it is uploading or pending.",
    tags: ["Chapter groups"],
    responses: {
      200: {
        description: "Group unlinked.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  chapterId: z.uuid().meta({ description: "The ID of the chapter." }),
                  groupId: z.uuid().meta({ description: "The ID of the group." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No chapter with the given ID exists, or the group is not credited on it.",
        422: "One of the provided IDs is not a valid UUID.",
      }),
    },
  }),
  audited(chapterGroupAudit.UNLINK, (c) => ({
    id: c.req.param("id"),
    groupId: c.req.param("groupId"),
  })),
  withAuth(),
  validateParam(paramSchema),
  checkChapter({ unpublished: true }),
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
