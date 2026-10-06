import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, chapterFeedItemSchema } from "../utils/schemas"

export const listLatestChaptersHandler = new Hono().get(
  "/latest",
  describeRoute({
    summary: "List the latest chapters",
    description:
      "Lists the most recently released chapters across every media, newest first.\n\n**Authentication:** none.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "The latest chapters.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(chapterFeedItemSchema.array(), paginationMetaSchema),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        422: "The query parameters failed validation.",
      }),
    },
  }),
  validateQuery(paginationQuerySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage } = c.var.query
    const [items, totalRow] = await Promise.all([
      db
        .selectFrom("chapters")
        .innerJoin("medias", "medias.id", "chapters.mediaId")
        .where("chapters.deletedAt", "is", null)
        .where("medias.deletedAt", "is", null)
        .select((eb) => [
          "chapters.id",
          "chapters.title",
          "chapters.number",
          "chapters.volume",
          "chapters.language",
          "chapters.contentRating",
          "chapters.createdAt",
          "chapters.mediaId",
          eb
            .selectFrom("titles")
            .whereRef("titles.mediaId", "=", "chapters.mediaId")
            .where("titles.isMainTitle", "=", true)
            .where("titles.deletedAt", "is", null)
            .select("titles.title")
            .limit(1)
            .as("mediaTitle"),
        ])
        .orderBy("chapters.createdAt", "desc")
        .orderBy("chapters.id", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      db
        .selectFrom("chapters")
        .innerJoin("medias", "medias.id", "chapters.mediaId")
        .where("chapters.deletedAt", "is", null)
        .where("medias.deletedAt", "is", null)
        .select(db.fn.countAll<number>().as("count"))
        .executeTakeFirstOrThrow(),
    ])

    return c.ok(items, { page, perPage, total: Number(totalRow.count) })
  },
)
