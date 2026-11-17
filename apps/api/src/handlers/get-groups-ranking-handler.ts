import { cacheClient } from "@taiyomoe/cache"
import { type DB, type Kysely, type QueryCreator, sql } from "@taiyomoe/db"
import { RANKING_SIZE } from "@taiyomoe/queue"
import { getPublicImageUrl } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  getRankingWindow,
  RANKING_CACHE_TTL_SECONDS,
  rankingBoardSchema,
  rankingQuerySchema,
  rankSchema,
} from "../utils/rankings"
import { apiSuccessEnvelope } from "../utils/schemas"

const chaptersSchema = z.int().meta({
  description: "The number of chapters credited to the group that came out in the period.",
  example: 42,
})
const groupSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the group." }),
  name: z.string().meta({ description: "The name of the group.", example: "Sunray Scans" }),
})
const boardSchema = rankingBoardSchema(
  z.object({
    rank: rankSchema,
    value: chaptersSchema,
    medias: z.int().meta({
      description: "The number of medias those chapters belong to.",
      example: 6,
    }),
    group: groupSchema
      .extend({
        logoUrl: z.url().nullable().meta({ description: "The URL of the group's logo, if any." }),
        memberCount: z
          .int()
          .meta({ description: "The number of members of the group.", example: 8 }),
      })
      .meta({ description: "The group." }),
  }),
  "groups with at least one chapter out in the period",
)
const groupsRankingSchema = boardSchema.extend({
  me: z
    .object({
      rank: rankSchema,
      value: chaptersSchema,
      group: groupSchema
        .extend({
          logoUrl: z.url().nullable().meta({ description: "The URL of the group's logo, if any." }),
        })
        .meta({ description: "Your best-ranked group." }),
      above: z
        .object({
          group: groupSchema.meta({ description: "The group ranked right above yours." }),
          value: chaptersSchema,
          gap: z.int().positive().meta({
            description: "The number of chapters your group needs to release to pass it.",
            example: 3,
          }),
        })
        .nullable()
        .meta({ description: "The group ranked right above yours, or null when it is #1." }),
    })
    .nullable()
    .meta({
      description:
        "The standing of your best-ranked group, or null when none of your groups has a chapter out in the period.",
    }),
})

type Board = z.infer<typeof boardSchema>
type Window = ReturnType<typeof getRankingWindow>

/**
 * Every live group with at least one published chapter since `from`, aliased `totals`: chapters
 * count from when they came out, so a scheduled chapter counts once it is released.
 */
const selectGroupTotals = (db: QueryCreator<DB>, from: Date | null) =>
  db
    .selectFrom((eb) =>
      eb
        .selectFrom("chapters")
        .innerJoin("chapterGroups", "chapterGroups.chapterId", "chapters.id")
        .innerJoin("medias", "medias.id", "chapters.mediaId")
        .where("chapters.status", "=", "PUBLISHED")
        .where("chapters.deletedAt", "is", null)
        .where("medias.deletedAt", "is", null)
        .where((where) => (from === null ? where.and([]) : where("chapters.createdAt", ">=", from)))
        .groupBy("chapterGroups.groupId")
        .select((inner) => [
          "chapterGroups.groupId",
          inner.fn.countAll<string>().as("chapters"),
          inner.fn.count<string>("chapters.mediaId").distinct().as("medias"),
          inner.fn.max("chapters.createdAt").as("lastAt"),
        ])
        .as("totals"),
    )
    .innerJoin("groups", "groups.id", "totals.groupId")
    .where("groups.deletedAt", "is", null)
// Most chapters, then most medias, then whoever got there first.
const GROUP_ORDER = sql`"totals"."chapters" desc, "totals"."medias" desc, "totals"."lastAt" asc, "totals"."groupId" asc`
const loadBoard = async (db: Kysely<DB>, period: Board["period"], window: Window) => {
  const [top, totalRow] = await Promise.all([
    selectGroupTotals(db, window.from)
      .select([
        "totals.groupId",
        "totals.chapters",
        "totals.medias",
        "groups.name",
        "groups.logo",
        (eb) =>
          eb
            .selectFrom("groupMemberships")
            .whereRef("groupMemberships.groupId", "=", "totals.groupId")
            .select(eb.fn.countAll<string>().as("count"))
            .as("memberCount"),
      ])
      .orderBy(GROUP_ORDER)
      .limit(RANKING_SIZE)
      .execute(),
    selectGroupTotals(db, window.from)
      .select((eb) => eb.fn.countAll<string>().as("count"))
      .executeTakeFirstOrThrow(),
  ])

  return {
    period,
    startsAt: window.startsAt,
    endsAt: window.endsAt,
    total: Number(totalRow.count),
    entries: top.map((row, index) => ({
      rank: index + 1,
      value: Number(row.chapters),
      medias: Number(row.medias),
      group: {
        id: row.groupId,
        name: row.name,
        logoUrl: row.logo === null ? null : getPublicImageUrl(row.logo),
        memberCount: Number(row.memberCount ?? 0),
      },
    })),
  } satisfies Board
}
const getStanding = async (db: Kysely<DB>, window: Window, viewerId: string) => {
  const row = await db
    .with("ranked", (qc) =>
      selectGroupTotals(qc, window.from).select([
        "totals.groupId",
        "totals.chapters",
        "groups.name",
        "groups.logo",
        sql<string>`row_number() over (order by ${GROUP_ORDER})`.as("rank"),
      ]),
    )
    .selectFrom("ranked as mine")
    .innerJoin("groupMemberships", "groupMemberships.groupId", "mine.groupId")
    .leftJoin("ranked as above", (join) =>
      join.on(sql<boolean>`"above"."rank" = "mine"."rank" - 1`),
    )
    .where("groupMemberships.userId", "=", viewerId)
    .select([
      "mine.groupId",
      "mine.name",
      "mine.logo",
      "mine.chapters",
      "mine.rank",
      "above.groupId as aboveId",
      "above.name as aboveName",
      "above.chapters as aboveChapters",
    ])
    .orderBy("mine.rank", "asc")
    .limit(1)
    .executeTakeFirst()

  if (row === undefined) {
    return null
  }

  const value = Number(row.chapters)

  return {
    rank: Number(row.rank),
    value,
    group: {
      id: row.groupId,
      name: row.name,
      logoUrl: row.logo === null ? null : getPublicImageUrl(row.logo),
    },
    above:
      row.aboveId === null || row.aboveName === null || row.aboveChapters === null
        ? null
        : {
            group: { id: row.aboveId, name: row.aboveName },
            value: Number(row.aboveChapters),
            gap: Number(row.aboveChapters) - value + 1,
          },
  }
}

export const getGroupsRankingHandler = new Hono().get(
  "/groups",
  describeRoute({
    summary: "Get the groups ranking",
    description: `Returns the ${RANKING_SIZE} groups credited on the most chapters that came out in the period, then on the most medias, then whichever got there first. A scheduled chapter counts once it is released. The ranking can be up to ${RANKING_CACHE_TTL_SECONDS / 60} minutes old. It also returns the standing of your best-ranked group.\n\n**Authentication:** signed-in user.`,
    tags: ["Rankings"],
    responses: {
      200: {
        description: "The groups ranking.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(groupsRankingSchema)) },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The query parameters failed validation.",
      }),
    },
  }),
  withAuth(),
  validateQuery(rankingQuerySchema),
  async (c) => {
    const { db, user, cacheNamespace } = c.var
    const { period } = c.var.query
    const window = getRankingWindow(period)
    const cacheKey = `${cacheNamespace}groups:${period}:${window.startsAt ?? "all"}`
    const cached = await cacheClient.rankings.get<Board>(cacheKey)
    const board = cached ?? (await loadBoard(db, period, window))

    if (cached === null) {
      await cacheClient.rankings.set(cacheKey, board, RANKING_CACHE_TTL_SECONDS)
    }

    return c.ok({
      ...board,
      me: await getStanding(db, window, user.id),
    })
  },
)
