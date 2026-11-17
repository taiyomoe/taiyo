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
  chapterPageCount,
} from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  contentRatingsQuerySchema,
  languageSchema,
  latestChapterFeedItemSchema,
} from "../utils/schemas"

const MAX_UPCOMING = 50
const querySchema = z.object({
  contentRating: contentRatingsQuerySchema,
  mediaId: z.uuid().optional().meta({
    description: "The ID of a media, to only list its chapters.",
    example: "4e26b80f-6661-4f5f-93b4-6dfed052bbed",
  }),
  groupId: z.uuid().optional().meta({
    description: "The ID of a group, to only list the chapters credited to it.",
    example: "8d2f5a61-0c3b-4e7a-9f14-2b6c7d8e9f01",
  }),
  language: languageSchema("A language, to only list the chapters in it.").optional(),
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
        description: "The matching upcoming chapters.",
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
        chapterPageCount.as("pageCount"),
        publishAtIso.as("publishAt"),
        "users.id as uploaderId",
        "users.username as uploaderUsername",
        "users.displayUsername as uploaderDisplayUsername",
        "users.image as uploaderImage",
        "users.nameEffect as uploaderNameEffect",
        "users.avatarBorder as uploaderAvatarBorder",
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
