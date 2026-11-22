import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { groupBy } from "remeda"
import z from "zod"
import { authorizeChapterView } from "../middlewares/authorize-chapter-view-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { selectVisibleChapters } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  contentRatingsQuerySchema,
  storedLanguageSchema,
} from "../utils/schemas"

const querySchema = z.object({ contentRating: contentRatingsQuerySchema })
const readerChapterSchema = z.object({
  id: z.uuid().meta({
    description: "The ID of the chapter.",
    example: "13548c83-8d1a-4163-8830-c8f16fcd2eb7",
  }),
  number: z.number().meta({ description: "The chapter number.", example: 118 }),
  volume: z
    .string()
    .nullable()
    .meta({ description: "The volume of the chapter, if any.", example: "12" }),
  title: z.string().nullable().meta({
    description: "The title of the chapter, if any.",
    example: "The Boy with the Sharingan",
  }),
  language: storedLanguageSchema("The language of the chapter."),
  isExternal: z
    .boolean()
    .meta({ description: "Whether the chapter is only hosted on the group's site." }),
  pageCount: z
    .int()
    .meta({ description: "The number of pages the chapter has on Taiyō.", example: 19 }),
  groups: z
    .object({
      id: z.uuid().meta({ description: "The ID of the group." }),
      name: z.string().meta({ description: "The name of the group.", example: "Sunray Scans" }),
    })
    .array()
    .meta({ description: "The groups credited on the chapter, alphabetically by name." }),
})
const readerSchema = z.object({
  chapters: readerChapterSchema.array().meta({
    description:
      "Every published chapter of the media matching the content ratings, by number then release date. Always includes the requested chapter.",
  }),
  history: z
    .object({
      pageId: z
        .uuid()
        .nullable()
        .meta({ description: "The ID of the page you last stopped on, if any." }),
      completed: z.boolean().meta({ description: "Whether you finished the chapter." }),
    })
    .nullable()
    .meta({
      description: "Your progress on the requested chapter, if you are signed in and opened it.",
    }),
})
const readerColumns = [
  "chapters.id",
  "chapters.number",
  "chapters.volume",
  "chapters.title",
  "chapters.language",
  "chapters.isExternal",
  sql<number>`coalesce(cardinality(${sql.ref("chapters.pages")}), 0)`.as("pageCount"),
] as const

export const getChapterReaderHandler = new Hono().get(
  "/:id/reader",
  describeRoute({
    summary: "Get the reader data of a chapter",
    description:
      "Returns every chapter of the chapter's media in a compact shape, so the reader can find the previous and next chapters and the other versions of this one. A chapter that is not published yet follows the same visibility rules as when getting the chapter. Signed-in viewers also get their progress on the chapter.\n\n**Authentication:** optional.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "The chapters of the media and your progress.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(readerSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No chapter with the given ID exists.",
        451: "The chapter's media is locked, so the chapter is unavailable.",
        422: "The provided ID is not a valid UUID, or the query parameters failed validation.",
      }),
    },
  }),
  withOptionalAuth,
  validateQuery(querySchema),
  checkChapter({ unpublished: true, refuseLocked: true }),
  authorizeChapterView,
  async (c) => {
    const { db, chapter, viewer } = c.var
    const { contentRating } = c.var.query
    const visibleChapters = selectVisibleChapters(db, {
      contentRatings: contentRating,
      mediaId: chapter.mediaId,
    })
    const [visible, credits, history] = await Promise.all([
      visibleChapters
        .select(readerColumns)
        .orderBy("chapters.number", "asc")
        .orderBy("chapters.createdAt", "asc")
        .execute(),
      db
        .selectFrom("chapterGroups")
        .innerJoin("groups", "groups.id", "chapterGroups.groupId")
        .where("groups.deletedAt", "is", null)
        .where((eb) =>
          eb.or([
            eb("chapterGroups.chapterId", "=", chapter.id),
            eb("chapterGroups.chapterId", "in", visibleChapters.select("chapters.id")),
          ]),
        )
        .select(["chapterGroups.chapterId", "groups.id", "groups.name"])
        .orderBy("groups.name", "asc")
        .execute(),
      viewer === null
        ? undefined
        : db
            .selectFrom("userHistories")
            .where("userId", "=", viewer.id)
            .where("chapterId", "=", chapter.id)
            .select(["pageId", "completed"])
            .executeTakeFirst(),
    ])
    const hidden = visible.some((row) => row.id === chapter.id)
      ? []
      : await db
          .selectFrom("chapters")
          .where("chapters.id", "=", chapter.id)
          .select(readerColumns)
          .execute()
    const groupsByChapter = groupBy(credits, (credit) => credit.chapterId)

    return c.ok({
      chapters: [...visible, ...hidden].map((row) => ({
        ...row,
        groups: (groupsByChapter[row.id] ?? []).map(({ id, name }) => ({ id, name })),
      })),
      history: history ?? null,
    })
  },
)
