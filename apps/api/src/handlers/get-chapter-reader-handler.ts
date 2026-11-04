import { LANGUAGES, sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { group } from "radashi"
import z from "zod"
import { authorizeChapterView } from "../middlewares/authorize-chapter-view-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { selectVisibleChapters } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingsQuerySchema } from "../utils/schemas"

const querySchema = z.object({ contentRating: contentRatingsQuerySchema })
const readerChapterSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the chapter." }),
  number: z.number().meta({ description: "The chapter number.", example: 118 }),
  volume: z.string().nullable().meta({ description: "The volume of the chapter, if any." }),
  title: z.string().nullable().meta({ description: "The title of the chapter, if any." }),
  language: z.enum(LANGUAGES).meta({ description: "The language of the chapter." }),
  isExternal: z
    .boolean()
    .meta({ description: "Whether the chapter is only hosted on the group's site." }),
  pageCount: z.int().meta({ description: "How many pages the chapter has on Taiyō." }),
  groups: z
    .object({ id: z.uuid(), name: z.string() })
    .array()
    .meta({ description: "The groups credited on the chapter." }),
})
const readerSchema = z.object({
  chapters: readerChapterSchema.array().meta({
    description:
      "Every chapter of the media matching the content ratings, by number then upload date. Always includes the requested chapter.",
  }),
  history: z
    .object({
      pageId: z.uuid().nullable().meta({ description: "The page you last stopped on." }),
      completed: z.boolean().meta({ description: "Whether you finished the chapter." }),
    })
    .nullable()
    .meta({ description: "Your progress on the requested chapter, if you are signed in." }),
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
    summary: "Get what the reader needs around a chapter",
    description:
      "Lists the media's chapters in a compact shape, so the reader can find the previous and next chapters and other versions of this one, along with your progress on it.\n\n**Authentication:** none. Signed-in users also get their progress.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "The chapter index and your progress.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(readerSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No chapter with the given id exists.",
        422: "The provided id is not a valid UUID or the query parameters failed validation.",
      }),
    },
  }),
  withOptionalAuth,
  validateQuery(querySchema),
  checkChapter({ unpublished: true }),
  authorizeChapterView,
  async (c) => {
    const { db, chapter, viewer } = c.var
    const { contentRating } = c.var.query
    const [visible, credits, history] = await Promise.all([
      selectVisibleChapters(db, { contentRatings: contentRating, mediaId: chapter.mediaId })
        .select(readerColumns)
        .orderBy("chapters.number", "asc")
        .orderBy("chapters.createdAt", "asc")
        .execute(),
      db
        .selectFrom("chapterGroups")
        .innerJoin("groups", "groups.id", "chapterGroups.groupId")
        .innerJoin("chapters", "chapters.id", "chapterGroups.chapterId")
        .where("chapters.mediaId", "=", chapter.mediaId)
        .where("groups.deletedAt", "is", null)
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
    const groupsByChapter = group(credits, (credit) => credit.chapterId)

    return c.ok({
      chapters: [...visible, ...hidden].map((row) => ({
        ...row,
        groups: (groupsByChapter[row.id] ?? []).map(({ id, name }) => ({ id, name })),
      })),
      history: history ?? null,
    })
  },
)
