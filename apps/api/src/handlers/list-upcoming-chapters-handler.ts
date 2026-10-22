import { LANGUAGES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { publishAtIso } from "../utils/chapter-release"
import {
  getMainCoverUrls,
  getMainTitles,
  selectVisibleChapters,
  withChapterDetails,
} from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  contentRatingsQuerySchema,
  latestChapterFeedItemSchema,
} from "../utils/schemas"

const MAX_UPCOMING = 50
const querySchema = z.object({
  contentRating: contentRatingsQuerySchema,
  mediaId: z.uuid().optional().meta({ description: "Only list the chapters of this media." }),
  groupId: z
    .uuid()
    .optional()
    .meta({ description: "Only list the chapters credited to this group." }),
  language: z
    .enum(LANGUAGES)
    .optional()
    .meta({ description: "Only list chapters in this language." }),
})
const upcomingChapterSchema = latestChapterFeedItemSchema
  .omit({ createdAt: true, externalUrl: true })
  .extend({
    publishAt: z.iso.datetime().meta({
      description: "When the chapter goes live.",
      example: "2026-11-02T18:00:00.000Z",
    }),
  })

export const listUpcomingChaptersHandler = new Hono().get(
  "/upcoming",
  describeRoute({
    summary: "List upcoming chapters",
    description: `Lists the chapters scheduled to go live, soonest first, up to ${MAX_UPCOMING}. Their pages and links stay hidden until then.\n\n**Authentication:** none.`,
    tags: ["Chapters"],
    responses: {
      200: {
        description: "The upcoming chapters.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(upcomingChapterSchema.array())),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The query parameters failed validation." }),
    },
  }),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const { contentRating, mediaId, groupId, language } = c.var.query
    const rows = await selectVisibleChapters(db, {
      contentRatings: contentRating,
      mediaId,
      groupId,
      status: "SCHEDULED",
    })
      .innerJoin("users", "users.id", "chapters.uploaderId")
      .where((eb) => (language === undefined ? eb.and([]) : eb("chapters.language", "=", language)))
      .select([
        "chapters.id",
        "chapters.title",
        "chapters.number",
        "chapters.volume",
        "chapters.language",
        "chapters.contentRating",
        "chapters.mediaId",
        "chapters.isExternal",
        publishAtIso.as("publishAt"),
        "users.id as uploaderId",
        "users.username as uploaderUsername",
        "users.displayUsername as uploaderDisplayUsername",
        "users.image as uploaderImage",
      ])
      .orderBy("chapters.publishAt", "asc")
      .orderBy("chapters.number", "asc")
      .orderBy("chapters.id", "asc")
      .limit(MAX_UPCOMING)
      .execute()
    const mediaIds = [...new Set(rows.map((row) => row.mediaId))]
    const [chapters, coverUrls, titles] = await Promise.all([
      withChapterDetails(db, rows),
      getMainCoverUrls(db, mediaIds),
      getMainTitles(db, mediaIds),
    ])

    return c.ok(
      chapters.flatMap(({ publishAt, ...chapter }) =>
        publishAt === null
          ? []
          : [
              {
                ...chapter,
                publishAt,
                mediaTitle: titles.get(chapter.mediaId) ?? null,
                mediaCoverUrl: coverUrls.get(chapter.mediaId) ?? null,
              },
            ],
      ),
    )
  },
)
