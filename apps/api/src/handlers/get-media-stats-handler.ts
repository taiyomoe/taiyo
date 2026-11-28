import { config, getRatingAverage } from "@taiyomoe/config"
import { USER_LIBRARY_STATUSES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { countMediaLibraryEntries } from "../utils/library"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { ratingSummarySchema } from "../utils/ratings"
import { apiSuccessEnvelope, contentRatingsQuerySchema } from "../utils/schemas"

const querySchema = z.object({
  contentRating: contentRatingsQuerySchema.meta({
    description:
      "Comma-separated content ratings you allow. A media outside them is not found. Defaults to the default user setting.",
  }),
})
const statsSchema = z.object({
  rating: ratingSummarySchema
    .extend({
      distribution: z
        .object({
          score: z
            .int()
            .min(config.ratings.minScore)
            .max(config.ratings.maxScore)
            .meta({ description: "The score.", example: 8 }),
          count: z
            .int()
            .nonnegative()
            .meta({ description: "The number of ratings with this score.", example: 57 }),
        })
        .array()
        .meta({ description: "The number of ratings of each score, lowest score first." }),
    })
    .meta({ description: "The community rating of the media." }),
  library: z
    .object({
      total: z.int().nonnegative().meta({
        description: "The number of users with the media in their library.",
        example: 1280,
      }),
      byStatus: z.record(z.enum(USER_LIBRARY_STATUSES), z.int().nonnegative()).meta({
        description: "The number of users with the media in their library per reading status.",
      }),
    })
    .meta({ description: "How users track the media in their library." }),
})

export const getMediaStatsHandler = new Hono().get(
  "/:id/stats",
  describeRoute({
    summary: "Get a media's stats",
    description:
      "Returns the community rating of a media, with the number of ratings of each score, and how many users track it in their library per reading status.\n\n**Authentication:** none.",
    tags: ["Ratings"],
    responses: {
      200: {
        description: "The stats of the media.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(statsSchema)) } },
      },
      ...getOpenApiResponses({
        404: "No media with the given ID exists, or it is outside the content ratings.",
        422: "The provided ID is not a valid UUID, or the query parameters failed validation.",
      }),
    },
  }),
  validateQuery(querySchema),
  checkMedia(),
  async (c) => {
    const { db, media } = c.var

    if (!c.var.query.contentRating.includes(media.contentRating)) {
      return c.fail("MEDIA_NOT_FOUND")
    }

    const [stats, library] = await Promise.all([
      db
        .selectFrom("mediaRatingStats")
        .select(["ratingCount", "ratingSum", "scoreCounts"])
        .where("mediaId", "=", media.id)
        .executeTakeFirst(),
      countMediaLibraryEntries(db, media.id),
    ])
    const totals = { count: stats?.ratingCount ?? 0, sum: stats?.ratingSum ?? 0 }

    return c.ok({
      rating: {
        count: totals.count,
        average: getRatingAverage(totals),
        distribution: Array.from({ length: config.ratings.maxScore }, (_, index) => ({
          score: index + 1,
          count: stats?.scoreCounts[index] ?? 0,
        })),
      },
      library,
    })
  },
)
