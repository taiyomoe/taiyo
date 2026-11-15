import { historyAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({
  chapterId: z.uuid().meta({ description: "The ID of the chapter." }),
})

export const deleteChapterHistoryHandler = new Hono().delete(
  "/me/history/:chapterId",
  describeRoute({
    summary: "Remove a chapter from my history",
    description:
      "Removes the chapter from your reading history. The chapter itself is not affected.\n\n**Authentication:** signed-in user.",
    tags: ["Reading history"],
    responses: {
      200: {
        description: "History entry removed.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  chapterId: z.uuid().meta({ description: "The ID of the chapter." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "Your reading history has no entry for the chapter with the given ID.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(historyAudit.ENTRY_DELETE, (c) => ({ id: c.req.param("chapterId") })),
  withAuth(),
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
