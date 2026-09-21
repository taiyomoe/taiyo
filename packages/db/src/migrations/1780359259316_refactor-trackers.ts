import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("Media")
    .addColumn("links", "jsonb", (c) => c.notNull().defaultTo(sql`'{}'::jsonb`))
    .execute()

  const rows = await db.selectFrom("Tracker").select(["tracker", "externalId", "mediaId"]).execute()
  const grouped = new Map<string, { tracker: string; externalId: string }[]>()

  for (const row of rows) {
    const existing = grouped.get(row.mediaId)
    const entry = { tracker: row.tracker, externalId: row.externalId }

    if (existing) {
      existing.push(entry)
    } else {
      grouped.set(row.mediaId, [entry])
    }
  }

  const mediasWithTrailer = await db
    .selectFrom("Media")
    .select(["id", "trailer"])
    .where("trailer", "is not", null)
    .execute()
  const trailerById = new Map(mediasWithTrailer.map((m) => [m.id, m.trailer]))
  const allIds = new Set<string>([...grouped.keys(), ...trailerById.keys()])

  for (const mediaId of allIds) {
    const payload: {
      mangaDex?: string
      myAnimeList?: number
      anilist?: number
      trailer?: string
    } = {}

    for (const { tracker, externalId } of grouped.get(mediaId) ?? []) {
      if (tracker === "MYANIMELIST") {
        payload.myAnimeList = Number(externalId)
      } else if (tracker === "ANILIST") {
        payload.anilist = Number(externalId)
      } else if (tracker === "MANGADEX") {
        payload.mangaDex = externalId
      }
    }

    const trailer = trailerById.get(mediaId)

    if (trailer) {
      payload.trailer = `https://www.youtube.com/watch?v=${trailer}`
    }

    if (Object.keys(payload).length === 0) {
      continue
    }

    await db
      .updateTable("Media")
      .set({ links: sql`${JSON.stringify(payload)}::jsonb` })
      .where("id", "=", mediaId)
      .execute()
  }

  await db.schema.dropTable("Tracker").execute()

  await db.schema.alterTable("Media").dropColumn("trailer").execute()

  await db.schema.dropType("Trackers").execute()
}

export async function down(): Promise<void> {
  throw new Error("refactor-trackers is a destructive data-type migration and cannot be reversed")
}
