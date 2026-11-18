import { cacheClient } from "@taiyomoe/cache"
import {
  type ContentRating,
  type DB,
  type Kysely,
  MEDIA_STATUSES,
  MEDIA_TYPES,
  sql,
} from "@taiyomoe/db"
import { RANKING_SIZE } from "@taiyomoe/queue"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getMainCoverUrls, getMainTitles } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  getRankingWindow,
  RANKING_CACHE_TTL_SECONDS,
  rankingBoardSchema,
  rankingQuerySchema,
  rankSchema,
} from "../utils/rankings"
import {
  apiSuccessEnvelope,
  contentRatingSchema,
  contentRatingsQuerySchema,
} from "../utils/schemas"

const querySchema = rankingQuerySchema.extend({
  contentRating: contentRatingsQuerySchema.meta({
    description:
      "Comma-separated content ratings of the medias to rank. Defaults to the default user setting.",
  }),
})
const boardSchema = rankingBoardSchema(
  z.object({
    rank: rankSchema,
    value: z.int().meta({
      description: "The number of chapters of the media read and credited in the period.",
      example: 1280,
    }),
    readers: z.int().meta({
      description: "The number of users who read and got credit for a chapter of it in the period.",
      example: 214,
    }),
    media: z
      .object({
        id: z.uuid().meta({ description: "The ID of the media." }),
        title: z
          .string()
          .nullable()
          .meta({ description: "The main title of the media, if any.", example: "Vagabond" }),
        coverUrl: z
          .url()
          .nullable()
          .meta({ description: "The URL of the media's main cover, if any." }),
        type: z.enum(MEDIA_TYPES).meta({ description: "The type of the media.", example: "MANGA" }),
        status: z
          .enum(MEDIA_STATUSES)
          .meta({ description: "The publication status of the media.", example: "RELEASING" }),
        contentRating: contentRatingSchema("The content rating of the media."),
      })
      .meta({ description: "The media." }),
  }),
  "medias with at least one chapter read and credited in the period",
)

type Board = z.infer<typeof boardSchema>

const loadBoard = async (
  db: Kysely<DB>,
  period: Board["period"],
  contentRatings: ContentRating[],
) => {
  const window = getRankingWindow(period)
  const ranked = db
    .selectFrom((eb) =>
      eb
        .selectFrom("readingRewards")
        .where((where) =>
          window.from === null
            ? where.and([])
            : where("readingRewards.createdAt", ">=", window.from),
        )
        .groupBy("readingRewards.mediaId")
        .select((inner) => [
          "readingRewards.mediaId",
          inner.fn.countAll<string>().as("reads"),
          inner.fn.count<string>("readingRewards.userId").distinct().as("readers"),
          inner.fn.max("readingRewards.createdAt").as("lastAt"),
        ])
        .as("totals"),
    )
    .innerJoin("medias", "medias.id", "totals.mediaId")
    .where("medias.deletedAt", "is", null)
    .where("medias.flag", "!=", "LOCKED")
    .where("medias.contentRating", "in", contentRatings)
  const [top, totalRow] = await Promise.all([
    ranked
      .select([
        "totals.mediaId",
        "totals.reads",
        "totals.readers",
        "medias.type",
        "medias.status",
        "medias.contentRating",
      ])
      // Most reads, then most readers, then whichever got there first.
      .orderBy(
        sql`"totals"."reads" desc, "totals"."readers" desc, "totals"."lastAt" asc, "totals"."mediaId" asc`,
      )
      .limit(RANKING_SIZE)
      .execute(),
    ranked.select((eb) => eb.fn.countAll<string>().as("count")).executeTakeFirstOrThrow(),
  ])
  const mediaIds = top.map((row) => row.mediaId)
  const [titles, covers] = await Promise.all([
    getMainTitles(db, mediaIds),
    getMainCoverUrls(db, mediaIds),
  ])

  return {
    period,
    startsAt: window.startsAt,
    endsAt: window.endsAt,
    total: Number(totalRow.count),
    entries: top.map((row, index) => ({
      rank: index + 1,
      value: Number(row.reads),
      readers: Number(row.readers),
      media: {
        id: row.mediaId,
        title: titles.get(row.mediaId) ?? null,
        coverUrl: covers.get(row.mediaId) ?? null,
        type: row.type,
        status: row.status,
        contentRating: row.contentRating,
      },
    })),
  } satisfies Board
}

export const getMediasRankingHandler = new Hono().get(
  "/medias",
  describeRoute({
    summary: "Get the medias ranking",
    description: `Returns the ${RANKING_SIZE} medias whose chapters were read and credited the most in the period, then by the most readers, then whichever got there first. Medias are filtered by content rating, and locked medias are left out. The ranking can be up to ${RANKING_CACHE_TTL_SECONDS / 60} minutes old.\n\n**Authentication:** signed-in user.`,
    tags: ["Rankings"],
    responses: {
      200: {
        description: "The medias ranking.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(boardSchema)) } },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The query parameters failed validation.",
      }),
    },
  }),
  withAuth(),
  validateQuery(querySchema),
  async (c) => {
    const { db, cacheNamespace } = c.var
    const { period, contentRating } = c.var.query
    const contentRatings = [...new Set(contentRating)].sort()
    const cacheKey = `${cacheNamespace}medias:${period}:${getRankingWindow(period).startsAt ?? "all"}:${contentRatings.join(",")}`
    const cached = await cacheClient.rankings.get<Board>(cacheKey)

    if (cached !== null) {
      return c.ok(cached)
    }

    const board = await loadBoard(db, period, contentRatings)

    await cacheClient.rankings.set(cacheKey, board, RANKING_CACHE_TTL_SECONDS)

    return c.ok(board)
  },
)
