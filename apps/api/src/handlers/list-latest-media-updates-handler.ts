import { sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { group, omit } from "radashi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import {
  getMainCoverUrls,
  getMainTitles,
  selectLatestChapters,
  selectVisibleChapters,
  withChapterDetails,
} from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  contentRatingsQuerySchema,
  latestMediaUpdateSchema,
} from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  contentRating: contentRatingsQuerySchema,
  chaptersPerMedia: z.coerce.number().int().min(1).max(20).default(5).meta({
    description: "How many of each media's latest chapters to include (1-20).",
    example: 5,
  }),
})

export const listLatestMediaUpdatesHandler = new Hono().get(
  "/latest/medias",
  describeRoute({
    summary: "List the latest updates by media",
    description:
      "Lists the medias with the most recently released chapters, newest first, each with its latest chapters, filtered by content rating.\n\n**Authentication:** none.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "The latest updated medias.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(latestMediaUpdateSchema.array(), paginationMetaSchema),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        422: "The query parameters failed validation.",
      }),
    },
  }),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage, contentRating, chaptersPerMedia } = c.var.query
    const filters = { contentRatings: contentRating }
    const [updates, totalRow] = await Promise.all([
      selectVisibleChapters(db, filters)
        .groupBy(["medias.id", "medias.countryOfOrigin", "medias.contentRating"])
        .select((eb) => [
          "medias.id",
          "medias.countryOfOrigin",
          "medias.contentRating",
          eb.fn.max("chapters.createdAt").as("latestAt"),
          eb.fn.countAll<string>().as("chapterCount"),
        ])
        .orderBy("latestAt", "desc")
        .orderBy("medias.id", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      selectVisibleChapters(db, filters)
        .select((eb) => eb.fn.count("chapters.mediaId").distinct().as("count"))
        .executeTakeFirstOrThrow(),
    ])
    const mediaIds = updates.map((update) => update.id)
    const rows =
      mediaIds.length === 0
        ? []
        : await db
            .selectFrom(
              selectLatestChapters(db, filters)
                .where("chapters.mediaId", "in", mediaIds)
                .select(
                  sql<number>`row_number() over (partition by ${sql.ref("chapters.mediaId")} order by ${sql.ref("chapters.createdAt")} desc, ${sql.ref("chapters.id")} desc)`.as(
                    "rank",
                  ),
                )
                .as("ranked"),
            )
            .selectAll()
            .where("rank", "<=", chaptersPerMedia)
            .orderBy("createdAt", "desc")
            .orderBy("id", "desc")
            .execute()
    const [chapters, coverUrls, titles] = await Promise.all([
      withChapterDetails(db, rows),
      getMainCoverUrls(db, mediaIds),
      getMainTitles(db, mediaIds),
    ])
    const chaptersByMedia = group(chapters, (chapter) => chapter.mediaId)

    return c.ok(
      updates.map((update) => ({
        id: update.id,
        title: titles.get(update.id) ?? null,
        coverUrl: coverUrls.get(update.id) ?? null,
        countryOfOrigin: update.countryOfOrigin,
        contentRating: update.contentRating,
        chapterCount: Number(update.chapterCount),
        chapters: (chaptersByMedia[update.id] ?? []).map((chapter) =>
          omit(chapter, ["mediaId", "rank"]),
        ),
      })),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
