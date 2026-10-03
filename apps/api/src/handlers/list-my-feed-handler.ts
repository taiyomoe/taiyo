import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, chapterFeedItemSchema } from "../utils/schemas"

export const listMyFeedHandler = new Hono().get(
  "/me/feed",
  describeRoute({
    summary: "List my feed",
    description:
      "Lists the most recently released chapters of the medias in your library, newest first.\n\n**Authentication:** signed-in user.",
    tags: ["Library"],
    responses: {
      200: {
        description: "Your feed.",
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
  withAuth("read", "Library"),
  validateQuery(paginationQuerySchema),
  async (c) => {
    const { db, user } = c.var
    const { page, perPage } = c.var.query
    const [items, totalRow] = await Promise.all([
      db
        .selectFrom("userLibraryEntries")
        .innerJoin("chapters", "chapters.mediaId", "userLibraryEntries.mediaId")
        .innerJoin("medias", "medias.id", "chapters.mediaId")
        .where("userLibraryEntries.userId", "=", user.id)
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
        .selectFrom("userLibraryEntries")
        .innerJoin("chapters", "chapters.mediaId", "userLibraryEntries.mediaId")
        .innerJoin("medias", "medias.id", "chapters.mediaId")
        .where("userLibraryEntries.userId", "=", user.id)
        .where("chapters.deletedAt", "is", null)
        .where("medias.deletedAt", "is", null)
        .select(db.fn.countAll<number>().as("count"))
        .executeTakeFirstOrThrow(),
    ])

    return c.ok(items, { page, perPage, total: Number(totalRow.count) })
  },
)
