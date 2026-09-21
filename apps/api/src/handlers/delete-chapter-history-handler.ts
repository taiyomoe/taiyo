import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ chapterId: z.uuid() })

export const deleteChapterHistoryHandler = new Hono().delete(
  "/me/history/:chapterId",
  describeRoute({
    summary: "Remove a chapter from my history",
    description:
      "Drops one entry from your reading history. The chapter itself is untouched.\n\n**Authentication:** signed-in user.",
    tags: ["Reading history"],
    responses: {
      200: {
        description: "History entry removed.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ chapterId: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "You don't have a history entry for this chapter.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth("delete", "History"),
  validateParam(paramSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { chapterId } = c.var.param
    const result = await db
      .deleteFrom("userHistories")
      .where("userId", "=", user.id)
      .where("chapterId", "=", chapterId)
      .executeTakeFirst()

    if (result.numDeletedRows === 0n) {
      return c.fail("HISTORY_ENTRY_NOT_FOUND")
    }

    return c.ok({ chapterId })
  },
)
