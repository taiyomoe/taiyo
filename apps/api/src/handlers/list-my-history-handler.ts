import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { isOpenedHistory } from "../utils/media-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, storedLanguageSchema } from "../utils/schemas"

const historyItemSchema = z.object({
  chapterId: z.uuid().meta({ description: "The ID of the chapter." }),
  chapterNumber: z.number().meta({ description: "The chapter number.", example: 112 }),
  chapterTitle: z
    .string()
    .nullable()
    .meta({ description: "The title of the chapter, if any.", example: "The Black Swordsman" }),
  chapterLanguage: storedLanguageSchema("The language of the chapter."),
  mediaId: z.uuid().meta({ description: "The ID of the media the chapter belongs to." }),
  pageId: z.uuid().nullable().meta({ description: "The ID of the page you were last on, if any." }),
  completed: z.boolean().meta({ description: "Whether you finished the chapter." }),
  updatedAt: z.iso.datetime().meta({ description: "When you last read the chapter." }),
})

export const listMyHistoryHandler = new Hono().get(
  "/me/history",
  describeRoute({
    summary: "List my reading history",
    description:
      "Lists the chapters you read, most recently read first. Deleted and unpublished chapters, and chapters you only marked as read, are left out.\n\n**Authentication:** signed-in user.",
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
        401: true,
        403: true,
        422: "The query parameters failed validation.",
      }),
    },
  }),
  withAuth(),
  validateQuery(paginationQuerySchema),
  async (c) => {
    const { db, user } = c.var
    const { page, perPage } = c.var.query
    const base = db
      .selectFrom("userHistories")
      .innerJoin("chapters", "chapters.id", "userHistories.chapterId")
      .innerJoin("medias", "medias.id", "chapters.mediaId")
      .where("userHistories.userId", "=", user.id)
      .where("chapters.deletedAt", "is", null)
      .where("chapters.status", "=", "PUBLISHED")
      .where("medias.deletedAt", "is", null)
      .where(isOpenedHistory)
    const [items, totalRow] = await Promise.all([
      base
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
        .orderBy("userHistories.chapterId", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base.select(db.fn.countAll().as("count")).executeTakeFirstOrThrow(),
    ])

    return c.ok(items, { page, perPage, total: Number(totalRow.count) })
  },
)
