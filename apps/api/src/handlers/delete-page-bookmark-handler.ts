import { bookmarkAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({
  id: z.uuid().meta({
    description: "The ID of the chapter.",
    example: "13548c83-8d1a-4163-8830-c8f16fcd2eb7",
  }),
  pageId: z.uuid().meta({
    description: "The ID of the page.",
    example: "9f1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d",
  }),
})

export const deletePageBookmarkHandler = new Hono().delete(
  "/:id/bookmarks/:pageId",
  describeRoute({
    summary: "Remove a page bookmark",
    description:
      "Removes your bookmark on a page. Removing a bookmark you do not have succeeds and changes nothing.\n\n**Authentication:** signed-in user.",
    tags: ["Bookmarks"],
    responses: {
      200: {
        description: "Bookmark removed.",
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
        422: "One of the provided IDs is not a valid UUID.",
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
