import { getDb, sql } from "@taiyomoe/db"
import { evaluateRecommendations, loadEngineInput } from "@taiyomoe/recommendations"
import { defineCommand } from "citty"

const percent = (value: number) => `${(value * 100).toFixed(1)}%`
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export default defineCommand({
  meta: {
    name: "evaluate-recommendations",
    description:
      "Measure the recommendations offline (hide one title per reader and check whether it comes back in their top k) and report how the shown recommendations perform online.",
  },
  args: {
    k: { type: "string", description: "How many recommendations count as a hit.", default: "10" },
    users: { type: "string", description: "How many readers to sample.", default: "2000" },
    days: { type: "string", description: "Window of the online report, in days.", default: "30" },
    since: {
      type: "string",
      description: "Start of the online report (YYYY-MM-DD, UTC). Overrides --days.",
    },
    until: {
      type: "string",
      description:
        "End of the online report (YYYY-MM-DD, UTC, exclusive). Compare windows before and after a weight change.",
    },
  },
  run: async ({ args }) => {
    const db = getDb()
    const input = await loadEngineInput(db)
    const offline = evaluateRecommendations(input, {
      k: Number(args.k),
      maxUsers: Number(args.users),
    })

    console.log(`\nOffline: hit rate @${offline.k} over ${offline.users} readers`)
    console.table(
      offline.results.map((result) => ({
        variant: result.name,
        "hit rate": percent(result.hitRate),
        coverage: percent(result.coverage),
      })),
    )

    for (const date of [args.since, args.until]) {
      if (date !== undefined && !DATE_PATTERN.test(date)) {
        throw new Error(`Expected a YYYY-MM-DD date, got "${date}"`)
      }
    }

    const until =
      args.until === undefined
        ? sql<Date>`(CURRENT_TIMESTAMP AT TIME ZONE 'UTC')`
        : sql<Date>`${args.until}::timestamp`
    const since =
      args.since === undefined
        ? sql<Date>`${until} - make_interval(days => ${Number(args.days)})`
        : sql<Date>`${args.since}::timestamp`
    const label = `${args.since ?? `last ${args.days} days`}${args.until === undefined ? "" : ` to ${args.until}`}`
    const [impressions, clicks] = await Promise.all([
      db
        .selectFrom("recommendationImpressions")
        .select([
          "surface",
          sql<string>`count(*)`.as("views"),
          sql<string>`coalesce(sum(cardinality("mediaIds")), 0)`.as("shown"),
        ])
        .where("createdAt", ">=", since)
        .where("createdAt", "<", until)
        .groupBy("surface")
        .execute(),
      db
        .selectFrom("recommendationClicks as c")
        .leftJoin("userLibraryEntries as l", (join) =>
          join
            .onRef("l.userId", "=", "c.userId")
            .onRef("l.mediaId", "=", "c.mediaId")
            .on(
              sql<boolean>`"l"."createdAt" between "c"."createdAt" and "c"."createdAt" + interval '7 days'`,
            ),
        )
        .select([
          "c.surface",
          sql<string>`count(distinct "c"."id")`.as("clicks"),
          sql<string>`count(distinct "l"."mediaId" || ':' || "l"."userId")`.as("libraryAdds"),
        ])
        .where("c.createdAt", ">=", since)
        .where("c.createdAt", "<", until)
        .groupBy("c.surface")
        .execute(),
    ])

    console.log(`\nOnline: ${label}`)
    console.table(
      impressions.map((row) => {
        const clicked = clicks.find((click) => click.surface === row.surface)
        const shown = Number(row.shown)
        const clickCount = Number(clicked?.clicks ?? 0)

        return {
          surface: row.surface,
          views: Number(row.views),
          "titles shown": shown,
          clicks: clickCount,
          "click rate": percent(shown === 0 ? 0 : clickCount / shown),
          "added to library": Number(clicked?.libraryAdds ?? 0),
        }
      }),
    )
    process.exit(0)
  },
})
