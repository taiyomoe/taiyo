import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid(), pageId: z.uuid() })

export const putPageBookmarkHandler = new Hono().put(
  "/:id/bookmarks/:pageId",
  describeRoute({
    summary: "Bookmark a page",
    description:
      "Bookmarks one page of a chapter. Bookmarking a page twice keeps a single bookmark.\n\n**Authentication:** signed-in user.",
    tags: ["Bookmarks"],
    responses: {
      200: {
        description: "Page bookmarked.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(z.object({ chapterId: z.uuid(), pageId: z.uuid() })),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No chapter with the given id exists, or it has no such page.",
        422: "An id is not a valid UUID.",
      }),
    },
  }),
  withAuth(),
  validateParam(paramSchema),
  checkChapter(),
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
