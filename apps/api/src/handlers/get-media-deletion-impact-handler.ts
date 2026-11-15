import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const count = (description: string, example: number) => z.int().meta({ description, example })
const mediaDeletionImpactSchema = z.object({
  publishedChapters: count("The number of published chapters that readers lose access to.", 214),
  unpublishedChapters: count(
    "The number of chapters waiting for review, scheduled or still uploading that never go live.",
    3,
  ),
  covers: count("The number of covers of the media.", 12),
  banners: count("The number of banners of the media.", 2),
  libraryEntries: count("The number of users with the media in their library.", 12_400),
  lists: count("The number of user lists that contain the media.", 87),
  readers: count("The number of users who read at least one chapter of the media.", 31_200),
  comments: count("The number of comments on the media and on its chapters.", 1_250),
  pendingSuggestions: count("The number of edit suggestions waiting for review.", 1),
  openPageReports: count("The number of open reports on the pages of its chapters.", 4),
  featured: z
    .boolean()
    .meta({ description: "Whether the media is featured on the home page.", example: false }),
})

export const getMediaDeletionImpactHandler = new Hono().get(
  "/:id/deletion-impact",
  describeRoute({
    summary: "Get what deleting a media affects",
    description:
      "Returns what disappears from the site if you delete the media: its chapters, images, library entries, list items, reading history, comments, suggestions and reports, counted.\n\n**Required roles:** uploader, admin.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "What deleting the media affects.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(mediaDeletionImpactSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No media with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  withAuth("media.delete"),
  checkMedia(),
  async (c) => {
    const { db, media } = c.var
    const chapterIds = db
      .selectFrom("chapters")
      .select("chapters.id")
      .where("chapters.mediaId", "=", media.id)
      .where("chapters.deletedAt", "is", null)
    const counted = sql<number>`count(*)::int`.as("count")
    const [
      chapters,
      covers,
      banners,
      libraryEntries,
      lists,
      readers,
      comments,
      pendingSuggestions,
      openPageReports,
      featured,
    ] = await Promise.all([
      db
        .selectFrom("chapters")
        .select([
          sql<number>`count(*) filter (where "status" = 'PUBLISHED')::int`.as("published"),
          sql<number>`count(*) filter (where "status" in ('UPLOADING', 'PENDING', 'SCHEDULED'))::int`.as(
            "unpublished",
          ),
        ])
        .where("mediaId", "=", media.id)
        .where("deletedAt", "is", null)
        .executeTakeFirstOrThrow(),
      db
        .selectFrom("covers")
        .select(counted)
        .where("mediaId", "=", media.id)
        .where("deletedAt", "is", null)
        .executeTakeFirstOrThrow(),
      db
        .selectFrom("banners")
        .select(counted)
        .where("mediaId", "=", media.id)
        .where("deletedAt", "is", null)
        .executeTakeFirstOrThrow(),
      db
        .selectFrom("userLibraryEntries")
        .select(counted)
        .where("mediaId", "=", media.id)
        .executeTakeFirstOrThrow(),
      db
        .selectFrom("userListItems")
        .select(sql<number>`count(distinct "listId")::int`.as("count"))
        .where("mediaId", "=", media.id)
        .executeTakeFirstOrThrow(),
      db
        .selectFrom("userHistories")
        .select(sql<number>`count(distinct "userId")::int`.as("count"))
        .where("chapterId", "in", chapterIds)
        .executeTakeFirstOrThrow(),
      db
        .selectFrom("comments")
        .innerJoin("commentThreads", "commentThreads.id", "comments.threadId")
        .select(counted)
        .where("comments.deletedAt", "is", null)
        .where((eb) =>
          eb.or([
            eb("commentThreads.mediaId", "=", media.id),
            eb("commentThreads.chapterId", "in", chapterIds),
          ]),
        )
        .executeTakeFirstOrThrow(),
      db
        .selectFrom("mediaSuggestions")
        .select(counted)
        .where("mediaId", "=", media.id)
        .where("status", "=", "PENDING")
        .executeTakeFirstOrThrow(),
      db
        .selectFrom("pageReports")
        .select(counted)
        .where("chapterId", "in", chapterIds)
        .where("status", "=", "OPEN")
        .executeTakeFirstOrThrow(),
      db
        .selectFrom("featuredMedias")
        .select("mediaId")
        .where("mediaId", "=", media.id)
        .executeTakeFirst(),
    ])

    return c.ok({
      publishedChapters: chapters.published,
      unpublishedChapters: chapters.unpublished,
      covers: covers.count,
      banners: banners.count,
      libraryEntries: libraryEntries.count,
      lists: lists.count,
      readers: readers.count,
      comments: comments.count,
      pendingSuggestions: pendingSuggestions.count,
      openPageReports: openPageReports.count,
      featured: featured !== undefined,
    })
  },
)
