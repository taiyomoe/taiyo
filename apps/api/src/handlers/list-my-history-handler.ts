import { LANGUAGES } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const historyItemSchema = z.object({
  chapterId: z.uuid(),
  chapterNumber: z.number(),
  chapterTitle: z.string().nullable(),
  chapterLanguage: z.enum(LANGUAGES),
  mediaId: z.uuid(),
  pageId: z.uuid().nullable(),
  completed: z.boolean(),
  updatedAt: z.iso.datetime(),
})

export const listMyHistoryHandler = new Hono().get(
  "/me/history",
  describeRoute({
    summary: "List my reading history",
    description:
      "Returns your reading-history feed in reverse-chronological order. Entries whose chapter has been deleted are excluded.\n\n**Authentication:** signed-in user.",
    tags: ["Reading history"],
    responses: {
      200: {
        description: "Your reading history.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(historyItemSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        422: "The query parameters failed validation.",
      }),
    },
  }),
  withAuth("read", "History"),
  validateQuery(paginationQuerySchema),
  async (c) => {
    const { db, user } = c.var
    const { page, perPage } = c.var.query
    const [items, totalRow] = await Promise.all([
      db
        .selectFrom("userHistories")
        .innerJoin("chapters", "chapters.id", "userHistories.chapterId")
        .where("userHistories.userId", "=", user.id)
        .where("chapters.deletedAt", "is", null)
        .select([
          "userHistories.chapterId",
          "chapters.number as chapterNumber",
          "chapters.title as chapterTitle",
          "chapters.language as chapterLanguage",
          "chapters.mediaId",
          "userHistories.pageId",
          "userHistories.completed",
          "userHistories.updatedAt",
        ])
        .orderBy("userHistories.updatedAt", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      db
        .selectFrom("userHistories")
        .innerJoin("chapters", "chapters.id", "userHistories.chapterId")
        .where("userHistories.userId", "=", user.id)
        .where("chapters.deletedAt", "is", null)
        .select(db.fn.countAll<number>().as("count"))
        .executeTakeFirstOrThrow(),
    ])

    return c.ok(items, { page, perPage, total: Number(totalRow.count) })
  },
)
