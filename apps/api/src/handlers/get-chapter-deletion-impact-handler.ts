import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { authorizeChapter } from "../middlewares/authorize-chapter-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const count = (description: string, example: number) => z.int().meta({ description, example })
const chapterDeletionImpactSchema = z.object({
  pages: count("The number of pages of the chapter.", 24),
  readers: count("The number of users who read the chapter.", 4_310),
  bookmarks: count("The number of page bookmarks users put on the chapter.", 18),
  comments: count("The number of comments on the chapter.", 96),
  openPageReports: count("The number of open reports on the pages of the chapter.", 1),
  groups: count("The number of groups credited on the chapter.", 2),
})

export const getChapterDeletionImpactHandler = new Hono().get(
  "/:id/deletion-impact",
  describeRoute({
    summary: "Get what deleting a chapter affects",
    description:
      "Returns what disappears from the site if you delete the chapter: its pages, the reading history and bookmarks of its readers, its comments and its page reports, counted.\n\n**Required access:** uploader or admin, or a moderator or a member of a credited group with the `DELETE_CHAPTERS` permission when the chapter is published or scheduled.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "What deleting the chapter affects.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(chapterDeletionImpactSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No chapter with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  withAuth(),
  checkChapter({ unpublished: true }),
  authorizeChapter("delete"),
  async (c) => {
    const { db, chapter, chapterTarget } = c.var
    const counted = sql<number>`count(*)::int`.as("count")
    const [readers, bookmarks, comments, openPageReports] = await Promise.all([
      db
        .selectFrom("userHistories")
        .select(counted)
        .where("chapterId", "=", chapter.id)
        .executeTakeFirstOrThrow(),
      db
        .selectFrom("pageBookmarks")
        .select(counted)
        .where("chapterId", "=", chapter.id)
        .executeTakeFirstOrThrow(),
      db
        .selectFrom("comments")
        .innerJoin("commentThreads", "commentThreads.id", "comments.threadId")
        .select(counted)
        .where("comments.deletedAt", "is", null)
        .where("commentThreads.chapterId", "=", chapter.id)
        .executeTakeFirstOrThrow(),
      db
        .selectFrom("pageReports")
        .select(counted)
        .where("chapterId", "=", chapter.id)
        .where("status", "=", "OPEN")
        .executeTakeFirstOrThrow(),
    ])

    return c.ok({
      pages: chapter.pages?.length ?? 0,
      readers: readers.count,
      bookmarks: bookmarks.count,
      comments: comments.count,
      openPageReports: openPageReports.count,
      groups: chapterTarget.groupIds.length,
    })
  },
)
