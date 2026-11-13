import { sql } from "@taiyomoe/db"
import {
  historyWeight,
  LIBRARY_WEIGHTS,
  LIST_WEIGHT,
  recommendFromSeeds,
} from "@taiyomoe/recommendations"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getMainTitles } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { getRecommendedMedias, recommendedMediaSchema } from "../utils/recommendations"
import { apiSuccessEnvelope, contentRatingsQuerySchema } from "../utils/schemas"

const SEED_LIMIT = 60
const CANDIDATE_LIMIT = 80
const querySchema = z.object({
  contentRating: contentRatingsQuerySchema,
  limit: z.coerce.number().int().min(1).max(30).default(18),
})
const recommendationSchema = recommendedMediaSchema.extend({
  because: z
    .object({ id: z.uuid(), title: z.string().nullable() })
    .nullable()
    .meta({ description: "The title you read that weighs the most in this pick, if any." }),
})

export const listMyRecommendationsHandler = new Hono().get(
  "/me/recommendations",
  describeRoute({
    summary: "List my recommendations",
    description:
      "Recommends titles from what you read, follow and put in your lists, most recent activity weighing the most. Titles already in your library, lists or history are left out. Without any activity yet, falls back to the most followed titles.\n\n**Authentication:** signed-in user.",
    tags: ["Library"],
    responses: {
      200: {
        description: "Your recommendations, best first.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(recommendationSchema.array())),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The query parameters failed validation." }),
    },
  }),
  withAuth(),
  validateQuery(querySchema),
  async (c) => {
    const { db, user } = c.var
    const { contentRating, limit } = c.var.query
    const [library, listItems, history] = await Promise.all([
      db
        .selectFrom("userLibraryEntries")
        .select(["mediaId", "status", "updatedAt as activeAt"])
        .where("userId", "=", user.id)
        .execute(),
      db
        .selectFrom("userListItems")
        .innerJoin("userLists", "userLists.id", "userListItems.listId")
        .select(["userListItems.mediaId", "userListItems.addedAt as activeAt"])
        .where("userLists.userId", "=", user.id)
        .where("userLists.deletedAt", "is", null)
        .execute(),
      db
        .selectFrom("userHistories")
        .innerJoin("chapters", "chapters.id", "userHistories.chapterId")
        .select((eb) => [
          "chapters.mediaId",
          sql<string>`count(distinct ${sql.ref("chapters.number")})`.as("chapters"),
          eb.fn.max("userHistories.updatedAt").as("activeAt"),
        ])
        .where("chapters.deletedAt", "is", null)
        .where("userHistories.userId", "=", user.id)
        .groupBy("chapters.mediaId")
        .execute(),
    ])
    const signals = new Map<string, { weight: number; activeAt: number }>()
    const add = (mediaId: string, weight: number, activeAt: Date) => {
      const current = signals.get(mediaId)

      signals.set(mediaId, {
        weight: Math.max(current?.weight ?? 0, weight),
        activeAt: Math.max(current?.activeAt ?? 0, activeAt.getTime()),
      })
    }

    for (const entry of library) {
      add(entry.mediaId, LIBRARY_WEIGHTS[entry.status], entry.activeAt)
    }

    for (const item of listItems) {
      add(item.mediaId, LIST_WEIGHT, item.activeAt)
    }

    for (const row of history) {
      add(row.mediaId, historyWeight(Number(row.chapters)), row.activeAt)
    }

    const known = [...signals.keys()]
    const dropped = new Set(
      library.filter((entry) => entry.status === "DROPPED").map((entry) => entry.mediaId),
    )
    const seeds = [...signals.entries()]
      .filter(([mediaId]) => !dropped.has(mediaId))
      .sort(([, a], [, b]) => b.activeAt - a.activeAt)
      .slice(0, SEED_LIMIT)
      .map(([mediaId, { weight }], rank) => ({
        mediaId,
        weight: weight * (1 - rank / (2 * SEED_LIMIT)),
      }))
    const similarityRows =
      seeds.length === 0
        ? []
        : await db
            .selectFrom("mediaSimilarities")
            .select(["mediaId", "items"])
            .where(
              "mediaId",
              "in",
              seeds.map((seed) => seed.mediaId),
            )
            .execute()
    const picks = recommendFromSeeds(
      [...seeds, ...known.map((mediaId) => ({ mediaId, weight: 0 }))],
      new Map(similarityRows.map((row) => [row.mediaId, row.items])),
      CANDIDATE_LIMIT,
    )
    const fallback =
      picks.length >= limit
        ? []
        : await db
            .selectFrom("userLibraryEntries")
            .select("mediaId")
            .where((eb) => (known.length === 0 ? eb.and([]) : eb("mediaId", "not in", known)))
            .groupBy("mediaId")
            .orderBy(sql`count(*)`, "desc")
            .limit(CANDIDATE_LIMIT)
            .execute()
    const candidates = [
      ...picks,
      ...fallback
        .filter((row) => !picks.some((pick) => pick.mediaId === row.mediaId))
        .map((row) => ({ mediaId: row.mediaId, because: null })),
    ]
    const [medias, becauseTitles] = await Promise.all([
      getRecommendedMedias(db, {
        mediaIds: candidates.map((candidate) => candidate.mediaId),
        contentRatings: contentRating,
        viewerId: null,
      }),
      getMainTitles(db, [...new Set(picks.map((pick) => pick.because))]),
    ])

    return c.ok(
      candidates
        .flatMap(({ mediaId, because }) => {
          const media = medias.get(mediaId)

          return media === undefined
            ? []
            : [
                {
                  ...media,
                  because:
                    because === null
                      ? null
                      : { id: because, title: becauseTitles.get(because) ?? null },
                },
              ]
        })
        .slice(0, limit),
    )
  },
)
