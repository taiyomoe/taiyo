import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateParam } from "../middlewares/validate-param-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { selectVisibleChapters } from "../utils/latest-chapters"
import { isOpenedHistory, selectReadChapterNumber } from "../utils/media-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  contentRatingsQuerySchema,
  storedLanguageSchema,
} from "../utils/schemas"

const paramSchema = z.object({
  mediaId: z.uuid().meta({ description: "The ID of the media." }),
})
const querySchema = z.object({ contentRating: contentRatingsQuerySchema })
const chapterRefSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the chapter." }),
  number: z.number().meta({ description: "The chapter number.", example: 118 }),
  volume: z
    .string()
    .nullable()
    .meta({ description: "The volume of the chapter, if any.", example: "12" }),
  title: z
    .string()
    .nullable()
    .meta({ description: "The title of the chapter, if any.", example: "The Black Swordsman" }),
  language: storedLanguageSchema("The language of the chapter."),
})
const progressSchema = z.object({
  readCount: z.int().meta({
    description: "The number of distinct chapter numbers you have read.",
    example: 87,
  }),
  totalCount: z.int().meta({
    description: "The number of distinct chapter numbers the media has.",
    example: 120,
  }),
  lastRead: chapterRefSchema
    .extend({
      readAt: z.iso.datetime().meta({ description: "When you last opened the chapter." }),
      completed: z.boolean().meta({ description: "Whether you finished the chapter." }),
      page: z.int().nullable().meta({
        description: "The page you were last on, counted from 1, if any.",
        example: 14,
      }),
    })
    .nullable()
    .meta({ description: "The chapter you opened most recently, if any." }),
  next: chapterRefSchema.nullable().meta({
    description:
      "The first chapter after the one you read last whose number you have not finished, in its language when available, or the first chapter if you have read none. Null once you are caught up.",
  }),
})

export const getReadingProgressHandler = new Hono().get(
  "/me/progress/:mediaId",
  describeRoute({
    summary: "Get my reading progress on a media",
    description:
      "Returns what you have read of a media and which chapter to continue with, counting only chapters that match the content ratings. A chapter number counts as read once you opened it in any language.\n\n**Authentication:** signed-in user.",
    tags: ["Reading history"],
    responses: {
      200: {
        description: "Your reading progress.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(progressSchema)) },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The provided ID is not a valid UUID, or the query parameters failed validation.",
      }),
    },
  }),
  withAuth(),
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
        .where(isOpenedHistory)
        .select([
          ...chapterRef,
          "userHistories.updatedAt as readAt",
          "userHistories.completed",
          sql<
            number | null
          >`(select ${sql.ref("p.ord")}::int from unnest(${sql.ref("chapters.pages")}) with ordinality as p(page, ord) where ${sql.ref("p.page")}->>'id' = ${sql.ref("userHistories.pageId")}::text)`.as(
            "page",
          ),
        ])
        .orderBy("userHistories.updatedAt", "desc")
        .orderBy("chapters.id", "desc")
        .limit(1)
        .executeTakeFirst(),
    ])
    const next = await visible
      .$if(lastRead !== undefined, (qb) => qb.where("chapters.number", ">", lastRead?.number ?? 0))
      .where((eb) =>
        eb.not(
          eb.exists(
            selectReadChapterNumber(db, user.id).where("userHistories.completed", "=", true),
          ),
        ),
      )
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
