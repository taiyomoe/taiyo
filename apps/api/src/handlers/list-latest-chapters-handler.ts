import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import {
  getMainCoverUrls,
  getMainTitles,
  chapterPageCount,
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
  mediaId: z.uuid().optional().meta({
    description: "The ID of a media, to only list its chapters.",
    example: "4e26b80f-6661-4f5f-93b4-6dfed052bbed",
  }),
  groupId: z.uuid().optional().meta({
    description: "The ID of a group, to only list the chapters credited to it.",
    example: "8d2f5a61-0c3b-4e7a-9f14-2b6c7d8e9f01",
  }),
  uploaderId: z.uuid().optional().meta({
    description: "The ID of a user, to only list the chapters they uploaded.",
    example: "2b7e9c14-5d3a-4f6b-8e1c-9a0d3f5b7c21",
  }),
})

export const listLatestChaptersHandler = new Hono().get(
  "/latest",
  describeRoute({
    summary: "List the latest chapters",
    description:
      "Lists the most recently released chapters across every media, newest first, filtered by content rating and optionally by media, group or uploader.\n\n**Authentication:** none.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "The matching chapters.",
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
    const { page, perPage, contentRating, mediaId, groupId, uploaderId } = c.var.query
    const [rows, totalRow] = await Promise.all([
      selectLatestChapters(db, { contentRatings: contentRating, mediaId, groupId, uploaderId })
        .select(chapterPageCount.as("pageCount"))
        .orderBy("chapters.createdAt", "desc")
        .orderBy("chapters.id", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      selectVisibleChapters(db, { contentRatings: contentRating, mediaId, groupId, uploaderId })
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
