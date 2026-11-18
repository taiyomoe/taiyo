import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_KEYS,
  ACHIEVEMENT_METRICS,
  ACHIEVEMENTS,
  COSMETIC_KINDS,
  COSMETIC_RARITIES,
  RANKING_PERIOD_KINDS,
} from "@taiyomoe/db"
import { getAchievementProgress } from "@taiyomoe/queue"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkUser } from "../middlewares/check-user-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { timestampSql } from "../utils/comments"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const criteriaSchema = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal("metric").meta({ description: "Reach a value on a metric." }),
      metric: z
        .enum(ACHIEVEMENT_METRICS)
        .meta({ description: "The metric to grow.", example: "chaptersRead" }),
      threshold: z.int().meta({ description: "The value to reach.", example: 100 }),
    }),
    z.object({
      type: z
        .literal("rank")
        .meta({ description: "Finish a closed period of the readers ranking high enough." }),
      periods: z
        .enum(RANKING_PERIOD_KINDS)
        .array()
        .meta({ description: "The kinds of period that count.", example: ["WEEK", "MONTH"] }),
      rank: z.int().meta({ description: "The rank to reach or beat.", example: 3 }),
    }),
    z.object({
      type: z
        .literal("streak")
        .meta({ description: "Finish #1 of the readers ranking several days in a row." }),
      days: z.int().meta({ description: "The number of consecutive days.", example: 7 }),
    }),
  ])
  .meta({ description: "How the achievement is earned." })
const achievementSchema = z.object({
  key: z
    .enum(ACHIEVEMENT_KEYS)
    .meta({ description: "The key of the achievement.", example: "weeklyChampion" }),
  category: z
    .enum(ACHIEVEMENT_CATEGORIES)
    .meta({ description: "The category of the achievement.", example: "ranking" }),
  rarity: z
    .enum(COSMETIC_RARITIES)
    .meta({ description: "The rarity of the achievement.", example: "epic" }),
  repeatable: z
    .boolean()
    .meta({ description: "Whether the achievement can be earned more than once." }),
  criteria: criteriaSchema,
  rewards: z
    .object({
      points: z.int().nonnegative().meta({
        description: "The number of points earning the achievement adds to the balance.",
        example: 300,
      }),
      cosmetics: z
        .object({
          kind: z
            .enum(COSMETIC_KINDS)
            .meta({ description: "The kind of cosmetic.", example: "TITLE" }),
          key: z.string().meta({ description: "The key of the cosmetic.", example: "champion" }),
        })
        .array()
        .meta({ description: "The cosmetics the achievement unlocks." }),
    })
    .meta({ description: "What earning the achievement gives." }),
  earned: z
    .object({
      count: z
        .int()
        .positive()
        .meta({ description: "The number of times the user earned it.", example: 2 }),
      firstEarnedAt: z.iso.datetime().meta({ description: "When the user first earned it." }),
      lastEarnedAt: z.iso.datetime().meta({ description: "When the user last earned it." }),
    })
    .nullable()
    .meta({ description: "When and how often the user earned the achievement, if they did." }),
  progress: z
    .object({
      value: z.int().meta({ description: "The user's current value.", example: 64 }),
      threshold: z.int().meta({ description: "The value to reach.", example: 100 }),
    })
    .nullable()
    .meta({
      description:
        "The user's progress on the metric, or null for ranking achievements and for the chapters a user read when they hide their library from you.",
    }),
})

export const listUserAchievementsHandler = new Hono().get(
  "/:id/achievements",
  describeRoute({
    summary: "List a user's achievements",
    description:
      "Lists every achievement in catalog order, with when and how often the user earned it and, for metric achievements, their progress. The chapters a user read stay hidden when they hide their library, unless you are that user.\n\n**Authentication:** optional.",
    tags: ["Users"],
    responses: {
      200: {
        description: "The user's achievements.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(achievementSchema.array())) },
        },
      },
      ...getOpenApiResponses({
        404: "No user with the given ID exists, or the user is banned.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  checkUser(),
  withOptionalAuth,
  async (c) => {
    const { db, targetUser, viewer } = c.var
    const libraryVisible = targetUser.settings.showLibrary !== false || viewer?.id === targetUser.id
    const [earned, progress] = await Promise.all([
      db
        .selectFrom("userAchievements")
        .select([
          "key",
          "count",
          timestampSql("firstEarnedAt").as("firstEarnedAt"),
          timestampSql("lastEarnedAt").as("lastEarnedAt"),
        ])
        .where("userId", "=", targetUser.id)
        .execute(),
      getAchievementProgress(db, targetUser.id),
    ])
    const earnedByKey = new Map(earned.map((row) => [row.key, row]))

    return c.ok(
      ACHIEVEMENT_KEYS.map((key) => {
        const { category, rarity, repeatable, criteria, rewards } = ACHIEVEMENTS[key]
        const row = earnedByKey.get(key)
        const visible =
          criteria.type === "metric" && (criteria.metric !== "chaptersRead" || libraryVisible)

        return {
          key,
          category,
          rarity,
          repeatable,
          criteria:
            criteria.type === "rank" ? { ...criteria, periods: [...criteria.periods] } : criteria,
          rewards: {
            points: rewards.points ?? 0,
            cosmetics: (rewards.cosmetics ?? []).map(({ kind, key: cosmetic }) => ({
              kind,
              key: cosmetic,
            })),
          },
          earned:
            row === undefined
              ? null
              : {
                  count: row.count,
                  firstEarnedAt: row.firstEarnedAt,
                  lastEarnedAt: row.lastEarnedAt,
                },
          progress:
            criteria.type === "metric" && visible
              ? { value: progress[criteria.metric], threshold: criteria.threshold }
              : null,
        }
      }),
    )
  },
)
