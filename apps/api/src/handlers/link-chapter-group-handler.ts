import { chapterGroupAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getChapterTarget } from "../utils/chapter-target"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const linkChapterGroupSchema = z.object({
  groupId: z.uuid().meta({
    description: "The ID of the group to credit.",
    example: "8d2f5a61-0c3b-4e7a-9f14-2b6c7d8e9f01",
  }),
})

export const linkChapterGroupHandler = new Hono().post(
  "/:id/groups",
  describeRoute({
    summary: "Link a group to a chapter",
    description:
      "Credits a group on a chapter. Anyone who can edit the chapter's credits can credit any group.\n\n**Required access:** uploader or admin, a moderator or a member of a credited group with the `EDIT_CHAPTERS` permission when the chapter is published or scheduled, or the user who uploaded the chapter while it is uploading or pending.",
    tags: ["Chapter groups"],
    responses: {
      201: {
        description: "Group linked.",
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
        404: "No chapter with the given ID exists, or the group does not exist.",
        409: "The group is already credited on the chapter.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(chapterGroupAudit.LINK),
  withAuth(),
  validateJson(linkChapterGroupSchema),
  checkChapter({ unpublished: true }),
  withTransaction,
  async (c) => {
    const { can, db, chapter } = c.var
    const { groupId } = c.var.json

    c.var.audit.set({ target: { groupId } })

    if (!can("chapter.credit", { chapter: await getChapterTarget(db, chapter), groupId })) {
      return c.fail("FORBIDDEN")
    }

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
