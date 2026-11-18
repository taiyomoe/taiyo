import { ALL_TIME_START, type DB, isBannedSql, type Kysely, sql } from "@taiyomoe/db"
import { getLevelProgress } from "@taiyomoe/db/levels"
import { RANKING_SIZE, READER_ORDER, selectReaderTotals } from "@taiyomoe/queue"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  getCachedBoard,
  getRankingWindow,
  RANKING_CACHE_TTL_SECONDS,
  rankedUserSchema,
  rankingBoardSchema,
  rankingQuerySchema,
  rankSchema,
} from "../utils/rankings"
import { apiSuccessEnvelope, userSummarySchema } from "../utils/schemas"

const chaptersSchema = (description: string) => z.int().meta({ description, example: 87 })
const pagesSchema = z.int().meta({
  description: "The number of pages read and credited in the period.",
  example: 1960,
})
const boardSchema = rankingBoardSchema(
  z.object({
    rank: rankSchema,
    value: chaptersSchema("The number of chapters the user read and got credit for in the period."),
    pages: pagesSchema,
    user: rankedUserSchema.meta({ description: "The reader." }),
  }),
  "readers with at least one credited chapter in the period",
)
const readersRankingSchema = boardSchema.extend({
  me: z
    .object({
      rank: rankSchema,
      value: chaptersSchema("The number of chapters you read and got credit for in the period."),
      pages: pagesSchema,
      level: z.int().positive().meta({
        description: "Your lifetime reader level, from every page you read and got credit for.",
        example: 21,
      }),
      above: z
        .object({
          user: userSummarySchema.meta({ description: "The reader right above you." }),
          value: chaptersSchema("The number of chapters the reader got credit for."),
          gap: z.int().positive().meta({
            description: "The number of chapters you need to read to pass the reader.",
            example: 4,
          }),
        })
        .nullable()
        .meta({ description: "The reader ranked right above you, or null when you are #1." }),
    })
    .nullable()
    .meta({
      description: "Your own standing, or null when you have no credited chapter in the period.",
    }),
})

type Board = z.infer<typeof boardSchema>
type Window = ReturnType<typeof getRankingWindow>

const toUser = (row: {
  userId: string
  username: string
  displayUsername: string
  image: string | null
  nameEffect: string | null
  avatarBorder: string | null
}) => ({
  id: row.userId,
  username: row.username,
  displayUsername: row.displayUsername,
  image: row.image,
  nameEffect: row.nameEffect,
  avatarBorder: row.avatarBorder,
})
const SUMMARY_COLUMNS = [
  "users.username",
  "users.displayUsername",
  "users.image",
  "users.nameEffect",
  "users.avatarBorder",
] as const
const loadBoard = async (db: Kysely<DB>, period: Board["period"], window: Window) => {
  const [top, totalRow] = await Promise.all([
    selectReaderTotals(db, window.totals)
      .select(["totals.userId", "totals.chapters", "totals.pages", ...SUMMARY_COLUMNS])
      .orderBy(READER_ORDER)
      .limit(RANKING_SIZE)
      .execute(),
    selectReaderTotals(db, window.totals)
      .select((eb) => eb.fn.countAll<string>().as("count"))
      .executeTakeFirstOrThrow(),
  ])
  const details =
    top.length === 0
      ? []
      : await db
          .selectFrom("users")
          .leftJoin("userProfiles", "userProfiles.userId", "users.id")
          .leftJoin("readerTotals as lifetime", (join) =>
            join
              .onRef("lifetime.userId", "=", "users.id")
              .on("lifetime.kind", "=", "ALL")
              .on("lifetime.startsAt", "=", ALL_TIME_START),
          )
          .select(["users.id", "userProfiles.title", "lifetime.pages as xp"])
          .where(
            "users.id",
            "in",
            top.map((row) => row.userId),
          )
          .execute()
  const detailsById = new Map(details.map((row) => [row.id, row]))

  return {
    period,
    startsAt: window.startsAt,
    endsAt: window.endsAt,
    total: Number(totalRow.count),
    entries: top.map((row, index) => {
      const detail = detailsById.get(row.userId)

      return {
        rank: index + 1,
        value: row.chapters,
        pages: row.pages,
        user: {
          ...toUser(row),
          title: detail?.title ?? null,
          level: getLevelProgress(detail?.xp ?? 0).level,
        },
      }
    }),
  } satisfies Board
}
// The readers ranked ahead of "me" in the ranking order. The leading bound on chapters keeps it a
// range scan of the ranking index.
const aheadSql = sql<boolean>`"totals"."chapters" >= "me"."chapters" and ("totals"."chapters", "totals"."pages", "me"."lastAt", "me"."userId") > ("me"."chapters", "me"."pages", "totals"."lastAt", "totals"."userId")`
const getStanding = async (db: Kysely<DB>, window: Window, viewerId: string) => {
  const ahead = () => selectReaderTotals(db, window.totals).where(aheadSql)
  const row = await db
    .selectFrom("readerTotals as me")
    .innerJoin("users", "users.id", "me.userId")
    .leftJoinLateral(
      () =>
        ahead()
          .select(["totals.userId", "totals.chapters", ...SUMMARY_COLUMNS])
          .orderBy(
            sql`"totals"."chapters" asc, "totals"."pages" asc, "totals"."lastAt" desc, "totals"."userId" desc`,
          )
          .limit(1)
          .as("above"),
      (join) => join.onTrue(),
    )
    .where("me.kind", "=", window.totals.kind)
    .where("me.startsAt", "=", window.totals.startsAt)
    .where("me.userId", "=", viewerId)
    .where(sql<boolean>`not (${isBannedSql})`)
    .select(
      ahead()
        .select((eb) => eb.fn.countAll<string>().as("count"))
        .as("ahead"),
    )
    .leftJoin("readerTotals as lifetime", (join) =>
      join
        .onRef("lifetime.userId", "=", "me.userId")
        .on("lifetime.kind", "=", "ALL")
        .on("lifetime.startsAt", "=", ALL_TIME_START),
    )
    .select([
      "me.chapters",
      "me.pages",
      "lifetime.pages as xp",
      "above.userId as aboveId",
      "above.chapters as aboveChapters",
      "above.username",
      "above.displayUsername",
      "above.image",
      "above.nameEffect",
      "above.avatarBorder",
    ])
    .executeTakeFirst()

  if (row === undefined) {
    return null
  }

  return {
    rank: Number(row.ahead ?? 0) + 1,
    value: row.chapters,
    pages: row.pages,
    level: getLevelProgress(row.xp ?? 0).level,
    above:
      row.aboveId === null ||
      row.aboveChapters === null ||
      row.username === null ||
      row.displayUsername === null
        ? null
        : {
            user: toUser({
              userId: row.aboveId,
              username: row.username,
              displayUsername: row.displayUsername,
              image: row.image,
              nameEffect: row.nameEffect,
              avatarBorder: row.avatarBorder,
            }),
            value: row.aboveChapters,
            gap: row.aboveChapters - row.chapters + 1,
          },
  }
}

export const getReadersRankingHandler = new Hono().get(
  "/readers",
  describeRoute({
    summary: "Get the readers ranking",
    description: `Returns the ${RANKING_SIZE} users who read and got credit for the most chapters in the period, then the most pages, then whoever got there first. Banned users are left out. The ranking can be up to ${RANKING_CACHE_TTL_SECONDS / 60} minutes old. It also returns your own rank and how far you are from the reader right above you.\n\n**Authentication:** signed-in user.`,
    tags: ["Rankings"],
    responses: {
      200: {
        description: "The readers ranking.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(readersRankingSchema)) },
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
    const board = await getCachedBoard(
      `${cacheNamespace}readers:${period}:${window.startsAt ?? "all"}`,
      () => loadBoard(db, period, window),
    )

    return c.ok({
      ...board,
      me: await getStanding(db, window, user.id),
    })
  },
)
