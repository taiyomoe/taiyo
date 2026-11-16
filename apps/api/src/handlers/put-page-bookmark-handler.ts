import { bookmarkAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({
  pageId: z.uuid().meta({
    description: "The ID of the page.",
    example: "9f1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d",
  }),
})

export const putPageBookmarkHandler = new Hono().put(
  "/:id/bookmarks/:pageId",
  describeRoute({
    summary: "Bookmark a page",
    description:
      "Bookmarks one page of a published chapter. Bookmarking a page twice keeps a single bookmark.\n\n**Authentication:** signed-in user.",
    tags: ["Bookmarks"],
    responses: {
      200: {
        description: "Page bookmarked.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  chapterId: z.uuid().meta({ description: "The ID of the chapter." }),
                  pageId: z.uuid().meta({ description: "The ID of the page." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No chapter with the given ID exists, or it has no page with the given ID.",
        451: "The chapter's media is locked, so the chapter is unavailable.",
        422: "One of the provided IDs is not a valid UUID.",
      }),
    },
  }),
  audited(bookmarkAudit.ADD, (c) => ({ id: c.req.param("id"), pageId: c.req.param("pageId") })),
  withAuth(),
  validateParam(paramSchema),
  checkChapter({ refuseLocked: true }),
  async (c) => {
    const { db, user, chapter } = c.var
    const { pageId } = c.var.param

    if (!(chapter.pages ?? []).some((page) => page.id === pageId)) {
      return c.fail("PAGE_NOT_FOUND")
    }

    await db
      .insertInto("pageBookmarks")
      .values({ userId: user.id, chapterId: chapter.id, pageId })
      .onConflict((oc) => oc.columns(["userId", "chapterId", "pageId"]).doNothing())
      .execute()

    return c.ok({ chapterId: chapter.id, pageId })
  },
)
