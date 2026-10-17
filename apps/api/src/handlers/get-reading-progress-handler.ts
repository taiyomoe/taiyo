import { LANGUAGES, sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateParam } from "../middlewares/validate-param-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { selectVisibleChapters } from "../utils/latest-chapters"
import { selectReadChapterNumber } from "../utils/media-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingsQuerySchema } from "../utils/schemas"

const paramSchema = z.object({ mediaId: z.uuid() })
const querySchema = z.object({ contentRating: contentRatingsQuerySchema })
const chapterRefSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the chapter." }),
  number: z.number().meta({ description: "The chapter number.", example: 118 }),
  volume: z.string().nullable().meta({ description: "The volume of the chapter, if any." }),
  title: z.string().nullable().meta({ description: "The title of the chapter, if any." }),
  language: z.enum(LANGUAGES).meta({ description: "The language of the chapter." }),
})
const progressSchema = z.object({
  readCount: z.int().meta({ description: "How many distinct chapter numbers you have read." }),
  totalCount: z.int().meta({ description: "How many distinct chapter numbers the media has." }),
  lastRead: chapterRefSchema
    .extend({ readAt: z.iso.datetime().meta({ description: "When you last opened it." }) })
    .nullable()
    .meta({ description: "The chapter you opened most recently, if any." }),
  next: chapterRefSchema.nullable().meta({
    description:
      "The first unread chapter after the one you read last, in its language when available, or the first chapter if you have read none. Null once you are caught up.",
  }),
})

export const getReadingProgressHandler = new Hono().get(
  "/me/progress/:mediaId",
  describeRoute({
    summary: "Get my reading progress on a media",
    description:
      "Summarises what you have read of a media and which chapter to continue with, counting only chapters that match the content ratings. A chapter number counts as read once you opened it in any language.\n\n**Authentication:** signed-in user.",
    tags: ["Reading history"],
    responses: {
      200: {
        description: "Your reading progress.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(progressSchema)) },
        },
      },
      ...getOpenApiResponses({
        422: "The provided id is not a valid UUID or the query parameters failed validation.",
      }),
    },
  }),
  withAuth("read", "History"),
  validateParam(paramSchema),
  validateQuery(querySchema),
  async (c) => {
    const { db, user } = c.var
    const { mediaId } = c.var.param
    const { contentRating } = c.var.query
    const visible = selectVisibleChapters(db, { contentRatings: contentRating, mediaId })
    const chapterRef = [
      "chapters.id",
      "chapters.number",
      "chapters.volume",
      "chapters.title",
      "chapters.language",
    ] as const
    const [counts, lastRead] = await Promise.all([
      visible
        .select((eb) => [
          sql<string>`count(distinct ${sql.ref("chapters.number")})`.as("totalCount"),
          sql<string>`count(distinct ${sql.ref("chapters.number")}) filter (where ${eb.exists(selectReadChapterNumber(db, user.id))})`.as(
            "readCount",
          ),
        ])
        .executeTakeFirstOrThrow(),
      visible
        .innerJoin("userHistories", "userHistories.chapterId", "chapters.id")
        .where("userHistories.userId", "=", user.id)
        .select([...chapterRef, sql<Date>`${sql.ref("userHistories.updatedAt")}`.as("readAt")])
        .orderBy("userHistories.updatedAt", "desc")
        .orderBy("chapters.id", "desc")
        .limit(1)
        .executeTakeFirst(),
    ])
    const candidates =
      lastRead === undefined
        ? visible
        : visible
            .where("chapters.number", ">", lastRead.number)
            .where((eb) => eb.not(eb.exists(selectReadChapterNumber(db, user.id))))
    const next = await candidates
      .select(chapterRef)
      .orderBy("chapters.number", "asc")
      .$if(lastRead !== undefined, (qb) =>
        qb.orderBy(sql`${sql.ref("chapters.language")} = ${lastRead?.language}`, "desc"),
      )
      .orderBy("chapters.createdAt", "asc")
      .limit(1)
      .executeTakeFirst()

    return c.ok({
      readCount: Number(counts.readCount),
      totalCount: Number(counts.totalCount),
      lastRead: lastRead ?? null,
      next: next ?? null,
    })
  },
)
