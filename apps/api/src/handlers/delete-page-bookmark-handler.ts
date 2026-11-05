import { bookmarkAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid(), pageId: z.uuid() })

export const deletePageBookmarkHandler = new Hono().delete(
  "/:id/bookmarks/:pageId",
  describeRoute({
    summary: "Remove a page bookmark",
    description:
      "Removes your bookmark on a page. Removing a bookmark that doesn't exist succeeds.\n\n**Authentication:** signed-in user.",
    tags: ["Bookmarks"],
    responses: {
      200: {
        description: "Bookmark removed.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(z.object({ chapterId: z.uuid(), pageId: z.uuid() })),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        422: "An id is not a valid UUID.",
      }),
    },
  }),
  audited(bookmarkAudit.REMOVE, (c) => ({ id: c.req.param("id"), pageId: c.req.param("pageId") })),
  withAuth(),
  validateParam(paramSchema),
  async (c) => {
    const { db, user } = c.var
    const { id, pageId } = c.var.param

    await db
      .deleteFrom("pageBookmarks")
      .where("userId", "=", user.id)
      .where("chapterId", "=", id)
      .where("pageId", "=", pageId)
      .execute()

    return c.ok({ chapterId: id, pageId })
  },
)
