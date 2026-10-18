import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
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
  latestChapterFeedItemSchema,
} from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  contentRating: contentRatingsQuerySchema,
  mediaId: z.uuid().optional().meta({ description: "Only list the chapters of this media." }),
  groupId: z
    .uuid()
    .optional()
    .meta({ description: "Only list the chapters credited to this group." }),
})

export const listLatestChaptersHandler = new Hono().get(
  "/latest",
  describeRoute({
    summary: "List the latest chapters",
    description:
      "Lists the most recently released chapters across every media, newest first, filtered by content rating.\n\n**Authentication:** none.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "The latest chapters.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(latestChapterFeedItemSchema.array(), paginationMetaSchema),
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
    const { page, perPage, contentRating, mediaId, groupId } = c.var.query
    const [rows, totalRow] = await Promise.all([
      selectLatestChapters(db, { contentRatings: contentRating, mediaId, groupId })
        .orderBy("chapters.createdAt", "desc")
        .orderBy("chapters.id", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      selectVisibleChapters(db, { contentRatings: contentRating, mediaId, groupId })
        .select(db.fn.countAll().as("count"))
        .executeTakeFirstOrThrow(),
    ])
    const mediaIds = [...new Set(rows.map((row) => row.mediaId))]
    const [chapters, coverUrls, titles] = await Promise.all([
      withChapterDetails(db, rows),
      getMainCoverUrls(db, mediaIds),
      getMainTitles(db, mediaIds),
    ])

    return c.ok(
      chapters.map((chapter) => ({
        ...chapter,
        mediaTitle: titles.get(chapter.mediaId) ?? null,
        mediaCoverUrl: coverUrls.get(chapter.mediaId) ?? null,
      })),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
