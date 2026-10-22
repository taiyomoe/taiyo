import { type DB, type Expression, type Kysely, type Language, sql } from "@taiyomoe/db"
import { sum } from "radashi"
import { getMainCoverUrls, getMainTitles } from "./latest-chapters"

export const DASHBOARD_RANGES = ["24h", "7d", "30d", "90d", "12m"] as const

export type DashboardRange = (typeof DASHBOARD_RANGES)[number]

export const DASHBOARD_UNITS = ["hour", "day", "week", "month"] as const

type DashboardUnit = (typeof DASHBOARD_UNITS)[number]

export const DASHBOARD_ACTIVITY_KINDS = [
  "CHAPTERS_UPLOADED",
  "COVERS_UPLOADED",
  "MEDIA_CREATED",
] as const

const RANGE_BUCKETS = {
  "24h": { unit: "hour", count: 24, period: "24 hours" },
  "7d": { unit: "day", count: 7, period: "7 days" },
  "30d": { unit: "day", count: 30, period: "30 days" },
  "90d": { unit: "week", count: 13, period: "13 weeks" },
  "12m": { unit: "month", count: 12, period: "12 months" },
} as const satisfies Record<DashboardRange, { unit: DashboardUnit; count: number; period: string }>
const LOCAL_SETTINGS = {
  workMem: sql`set local work_mem = '32MB'`,
  noJit: sql`set local jit = off`,
}
const getDashboardFrame = async (db: Kysely<DB>, range: DashboardRange, timeZone: string) => {
  const { unit, count, period } = RANGE_BUCKETS[range]
  const frame = await db
    .selectFrom(sql<{ index: number }>`generate_series(0, ${sql.lit(count - 1)})`.as("index"))
    .select((eb) => {
      const local = sql`date_trunc(${sql.lit(unit)}, now() at time zone ${timeZone}) - interval ${sql.lit(`1 ${unit}`)} * ${eb.ref("index.index")}`
      const toUtc = (value: Expression<unknown>) =>
        sql`(((${value}) at time zone ${timeZone}) at time zone 'UTC')::text`

      return [
        sql<
          string[]
        >`array_agg(${toUtc(sql`${local} - interval ${sql.lit(period)}`)} order by ${eb.ref("index.index")} desc)
          || ${toUtc(sql`now() at time zone ${timeZone} - interval ${sql.lit(period)}`)}
          || array_agg(${toUtc(local)} order by ${eb.ref("index.index")} desc)
          || (now() at time zone 'UTC')::text`.as("boundaries"),
        sql<
          Date[]
        >`array_agg((${local}) at time zone ${timeZone} order by ${eb.ref("index.index")} desc)`.as(
          "starts",
        ),
      ]
    })
    .executeTakeFirstOrThrow()
  const at = (index: number) => sql<Date>`${frame.boundaries[index] ?? ""}::timestamp`
  const within = (createdAt: Expression<unknown>, from: number, to: number) =>
    sql<boolean>`(${createdAt} >= ${at(from)} and ${createdAt} < ${at(to)})`

  return {
    count,
    unit,
    timeZone,
    starts: frame.starts,
    boundaries: sql<Date[]>`${frame.boundaries}::timestamp[]`,
    inCurrent: (createdAt: Expression<unknown>) => within(createdAt, count + 1, 2 * count + 1),
    inPrevious: (createdAt: Expression<unknown>) => within(createdAt, 0, count),
    inEither: (createdAt: Expression<unknown>) =>
      sql<boolean>`(${within(createdAt, count + 1, 2 * count + 1)} or ${within(createdAt, 0, count)})`,
  }
}

type DashboardFrame = Awaited<ReturnType<typeof getDashboardFrame>>

const withLocalSettings = <T>(
  db: Kysely<DB>,
  settings: Array<keyof typeof LOCAL_SETTINGS>,
  query: (trx: Kysely<DB>) => Promise<T>,
) =>
  db.transaction().execute(async (trx) => {
    for (const setting of settings) {
      await LOCAL_SETTINGS[setting].execute(trx)
    }

    return query(trx)
  })
const selectRanges = (db: Kysely<DB>, frame: DashboardFrame) =>
  db
    .selectFrom(
      sql<{ range: number }>`generate_series(1, ${sql.lit(2 * frame.count + 1)})`.as("range"),
    )
    .where("range.range", "!=", frame.count + 1)
const toMetric = (perRange: Map<number, number>, frame: DashboardFrame, totals?: number[]) => {
  const current = Array.from(
    { length: frame.count },
    (_, index) => perRange.get(frame.count + 2 + index) ?? 0,
  )
  const previous = Array.from({ length: frame.count }, (_, index) => perRange.get(index + 1) ?? 0)

  return {
    total: totals?.[0] ?? sum(current),
    previousTotal: totals?.[1] ?? sum(previous),
    current,
    previous,
  }
}

export const getWindowedOverview = async (
  db: Kysely<DB>,
  range: DashboardRange,
  timeZone: string,
) => {
  const frame = await getDashboardFrame(db, range, timeZone)
  const [{ metrics, readingHours }, breakdowns, topUploaders] = await Promise.all([
    Promise.all([
      withLocalSettings(db, ["noJit"], (trx) =>
        trx
          .selectFrom(
            selectRanges(trx, frame)
              .innerJoinLateral(
                (eb) => {
                  const from = sql<Date>`(${frame.boundaries})[${eb.ref("range.range")}]`
                  const to = sql<Date>`(${frame.boundaries})[${eb.ref("range.range")} + 1]`
                  const isCurrent = sql<boolean>`${eb.ref("range.range")} > ${sql.lit(frame.count + 1)}`

                  return eb
                    .selectFrom(
                      sql<{
                        hour: Date
                      }>`generate_series(${from}, ${to} - interval '1 microsecond', case when ${isCurrent} then interval '1 hour' else greatest(${to} - ${from}, interval '1 hour') end)`.as(
                        "hour",
                      ),
                    )
                    .select((hb) => [
                      "hour.hour",
                      hb
                        .selectFrom("userHistories")
                        .whereRef("userHistories.createdAt", ">=", "hour.hour")
                        .where(
                          "userHistories.createdAt",
                          "<",
                          sql<Date>`case when ${isCurrent} then least(${hb.ref("hour.hour")} + interval '1 hour', ${to}) else ${to} end`,
                        )
                        .select(hb.fn.countAll<string>().as("reads"))
                        .$asScalar()
                        .as("reads"),
                    ])
                    .as("hourly")
                },
                (join) => join.onTrue(),
              )
              .select((eb) => {
                const local = sql`(${eb.ref("hourly.hour")} at time zone 'UTC') at time zone ${frame.timeZone}`
                const isCurrent = sql`${eb.ref("range.range")} > ${sql.lit(frame.count + 1)}`

                return [
                  "range.range",
                  sql<
                    number | null
                  >`case when ${isCurrent} then extract(isodow from ${local})::int - 1 end`.as(
                    "weekday",
                  ),
                  sql<
                    number | null
                  >`case when ${isCurrent} then extract(hour from ${local})::int end`.as("hour"),
                  "hourly.reads",
                ]
              })
              .as("hourlyReads"),
          )
          .select((eb) => [
            "hourlyReads.range",
            "hourlyReads.weekday",
            "hourlyReads.hour",
            eb.fn.sum<string>("hourlyReads.reads").as("reads"),
          ])
          .groupBy(["hourlyReads.range", "hourlyReads.weekday", "hourlyReads.hour"])
          .execute(),
      ),
      withLocalSettings(db, ["workMem"], (trx) =>
        trx
          .selectFrom(
            trx
              .selectFrom("userHistories")
              .where((eb) => frame.inEither(eb.ref("userHistories.createdAt")))
              .select((eb) =>
                sql<string>`bit_or(1::bigint << width_bucket(${eb.ref("userHistories.createdAt")}, ${frame.boundaries}))`.as(
                  "mask",
                ),
              )
              .groupBy("userHistories.userId")
              .as("reader"),
          )
          .select((eb) => {
            const mask = eb.ref("reader.mask")

            return [
              sql<string[]>`array[${sql.join(
                Array.from(
                  { length: 2 * frame.count + 1 },
                  (_, index) => sql`sum((${mask} >> ${sql.lit(index + 1)}) & 1)`,
                ),
              )}]`.as("perRange"),
              eb.fn
                .countAll<string>()
                .filterWhere(sql<boolean>`${mask} >> ${sql.lit(frame.count + 2)} <> 0`)
                .as("current"),
              eb.fn
                .countAll<string>()
                .filterWhere(
                  sql<boolean>`${mask} & ((1::bigint << ${sql.lit(frame.count + 1)}) - 2) <> 0`,
                )
                .as("previous"),
            ]
          })
          .executeTakeFirstOrThrow(),
      ),
      selectRanges(db, frame)
        .select((eb) => {
          const from = sql<Date>`(${frame.boundaries})[${eb.ref("range.range")}]`
          const to = sql<Date>`(${frame.boundaries})[${eb.ref("range.range")} + 1]`

          return [
            "range.range",
            eb
              .selectFrom("userLibraryEntries")
              .where("userLibraryEntries.createdAt", ">=", from)
              .where("userLibraryEntries.createdAt", "<", to)
              .select((cb) => cb.fn.countAll<string>().as("count"))
              .$asScalar()
              .as("libraryAdds"),
            eb
              .selectFrom("chapters")
              .where("chapters.deletedAt", "is", null)
              .where("chapters.createdAt", ">=", from)
              .where("chapters.createdAt", "<", to)
              .select((cb) => cb.fn.countAll<string>().as("count"))
              .$asScalar()
              .as("chaptersUploaded"),
            eb
              .selectFrom("users")
              .where("users.createdAt", ">=", from)
              .where("users.createdAt", "<", to)
              .select((cb) => cb.fn.countAll<string>().as("count"))
              .$asScalar()
              .as("newAccounts"),
          ]
        })
        .execute(),
    ]).then(([hourlyReads, readers, counts]) => {
      const readsPerRange = new Map<number, number>()
      const hours = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0))

      for (const row of hourlyReads) {
        readsPerRange.set(row.range, (readsPerRange.get(row.range) ?? 0) + Number(row.reads))

        const weekday = row.weekday === null ? undefined : hours[row.weekday]

        if (weekday !== undefined && row.hour !== null) {
          weekday[row.hour] = (weekday[row.hour] ?? 0) + Number(row.reads)
        }
      }

      const perCount = (key: "libraryAdds" | "chaptersUploaded" | "newAccounts") =>
        new Map(counts.map((row) => [row.range, Number(row[key])]))

      return {
        readingHours: hours,
        metrics: {
          reads: toMetric(readsPerRange, frame),
          uniqueReaders: toMetric(
            new Map(readers.perRange.map((value, index) => [index + 1, Number(value)])),
            frame,
            [Number(readers.current), Number(readers.previous)],
          ),
          libraryAdds: toMetric(perCount("libraryAdds"), frame),
          chaptersUploaded: toMetric(perCount("chaptersUploaded"), frame),
          newAccounts: toMetric(perCount("newAccounts"), frame),
        },
      }
    }),
    withLocalSettings(db, ["workMem", "noJit"], (trx) =>
      trx
        .with("chapterReads", (qb) =>
          qb
            .selectFrom("userHistories")
            .where((eb) => frame.inCurrent(eb.ref("userHistories.createdAt")))
            .select((eb) => ["userHistories.chapterId", eb.fn.countAll<string>().as("reads")])
            .groupBy("userHistories.chapterId"),
        )
        .with("mediaChapterReads", (qb) =>
          qb
            .selectFrom("chapterReads")
            .innerJoin("chapters", "chapters.id", "chapterReads.chapterId")
            .select(["chapters.language", "chapters.mediaId", "chapterReads.reads"]),
        )
        .selectFrom("mediaChapterReads")
        .select((eb) => [
          sql<Language | null>`${eb.ref("mediaChapterReads.language")}`.as("language"),
          sql<string | null>`null::uuid`.as("mediaId"),
          eb.fn.sum<string>("mediaChapterReads.reads").as("reads"),
        ])
        .groupBy("mediaChapterReads.language")
        .unionAll((eb) =>
          eb
            .selectFrom(
              eb
                .selectFrom("mediaChapterReads")
                .innerJoin("medias", "medias.id", "mediaChapterReads.mediaId")
                .where("medias.deletedAt", "is", null)
                .select((mb) => [
                  "mediaChapterReads.mediaId",
                  mb.fn.sum<string>("mediaChapterReads.reads").as("reads"),
                ])
                .groupBy("mediaChapterReads.mediaId")
                .orderBy("reads", "desc")
                .orderBy("mediaChapterReads.mediaId")
                .limit(8)
                .as("topMedias"),
            )
            .select((tb) => [
              sql<Language | null>`null::"Languages"`.as("language"),
              sql<string | null>`${tb.ref("topMedias.mediaId")}`.as("mediaId"),
              "topMedias.reads",
            ]),
        )
        .execute(),
    ).then(async (rows) => {
      const languages = rows
        .flatMap((row) =>
          row.language === null ? [] : [{ language: row.language, reads: Number(row.reads) }],
        )
        .sort((a, b) => b.reads - a.reads || a.language.localeCompare(b.language))
      const medias = rows
        .flatMap((row) =>
          row.mediaId === null ? [] : [{ id: row.mediaId, reads: Number(row.reads) }],
        )
        .sort((a, b) => b.reads - a.reads || a.id.localeCompare(b.id))
      const mediaIds = medias.map((media) => media.id)
      const [titles, coverUrls] = await Promise.all([
        getMainTitles(db, mediaIds),
        getMainCoverUrls(db, mediaIds),
      ])

      return {
        readsByLanguage: languages.slice(0, 5),
        otherLanguageReads: sum(languages.slice(5), (language) => language.reads),
        topMedias: medias.map((media) => ({
          id: media.id,
          title: titles.get(media.id) ?? null,
          coverUrl: coverUrls.get(media.id) ?? null,
          reads: media.reads,
        })),
      }
    }),
    db
      .selectFrom(
        db
          .selectFrom("chapters")
          .where("chapters.deletedAt", "is", null)
          .where((eb) => frame.inEither(eb.ref("chapters.createdAt")))
          .select((eb) => [
            "chapters.uploaderId",
            eb.fn
              .countAll<string>()
              .filterWhere(frame.inCurrent(eb.ref("chapters.createdAt")))
              .as("chapters"),
            eb.fn
              .countAll<string>()
              .filterWhere(frame.inPrevious(eb.ref("chapters.createdAt")))
              .as("previousChapters"),
          ])
          .groupBy("chapters.uploaderId")
          .as("uploads"),
      )
      .innerJoin("users", "users.id", "uploads.uploaderId")
      .where("uploads.chapters", ">", "0")
      .select([
        "users.id",
        "users.username",
        "users.displayUsername",
        "users.image",
        "uploads.chapters",
        "uploads.previousChapters",
      ])
      .orderBy("uploads.chapters", "desc")
      .orderBy("users.displayUsername")
      .limit(8)
      .execute()
      .then((rows) =>
        rows.map((row) => ({
          ...row,
          chapters: Number(row.chapters),
          previousChapters: Number(row.previousChapters),
        })),
      ),
  ])

  return {
    unit: frame.unit,
    buckets: frame.starts,
    metrics,
    ...breakdowns,
    readingHours,
    topUploaders,
  }
}

export type WindowedOverview = Awaited<ReturnType<typeof getWindowedOverview>>
