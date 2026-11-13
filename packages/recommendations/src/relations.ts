import { config } from "@taiyomoe/config"
import {
  type DB,
  INVERSE_MEDIA_RELATION_TYPES,
  type Kysely,
  type MediaRelationType,
  type NewMediaRelation,
  sql,
} from "@taiyomoe/db"
import { sleep } from "radashi"

const MANGADEX_RELATION_TYPES: Partial<Record<string, MediaRelationType>> = {
  prequel: "PREQUEL",
  sequel: "SEQUEL",
  main_story: "MAIN_STORY",
  side_story: "SIDE_STORY",
  spin_off: "SIDE_STORY",
  adapted_from: "ORIGINAL",
  based_on: "ORIGINAL",
  colored: "ALTERNATE_VERSION",
  monochrome: "ALTERNATE_VERSION",
  alternate_version: "ALTERNATE_VERSION",
  preserialization: "ALTERNATE_VERSION",
  serialization: "ALTERNATE_VERSION",
  alternate_story: "ALTERNATE_STORY",
  same_franchise: "SAME_FRANCHISE",
  shared_universe: "SAME_FRANCHISE",
}
const MANGADEX_API_URL = "https://api.mangadex.org"
const MANGADEX_BATCH_SIZE = 100
const MANGADEX_BATCH_DELAY_MS = 500

type MangaDexManga = {
  id: string
  relationships: Array<{ id: string; type: string; related?: string }>
}

type RelationPair = { mediaId: string; relatedMediaId: string; type: MediaRelationType }

export const withInverses = (pairs: readonly RelationPair[]) => {
  const rows = new Map<string, NewMediaRelation>()

  for (const { mediaId, relatedMediaId, type } of pairs) {
    const key = [mediaId, relatedMediaId].sort().join(":")

    if (mediaId === relatedMediaId || rows.has(`${key}:forward`)) {
      continue
    }

    rows.set(`${key}:forward`, { mediaId, relatedMediaId, type })
    rows.set(`${key}:inverse`, {
      mediaId: relatedMediaId,
      relatedMediaId: mediaId,
      type: INVERSE_MEDIA_RELATION_TYPES[type],
    })
  }

  return [...rows.values()]
}

export const parseMangaDexRelations = (mangas: readonly MangaDexManga[]) =>
  mangas.flatMap((manga) =>
    manga.relationships.flatMap((relationship) => {
      const type =
        relationship.type === "manga" && relationship.related !== undefined
          ? MANGADEX_RELATION_TYPES[relationship.related]
          : undefined

      return type === undefined ? [] : [{ from: manga.id, to: relationship.id, type }]
    }),
  )

const fetchMangaDexMangas = async (fetcher: typeof fetch, ids: readonly string[]) => {
  const url = new URL("/manga", MANGADEX_API_URL)

  url.searchParams.set("limit", String(ids.length))

  for (const id of ids) {
    url.searchParams.append("ids[]", id)
  }

  for (const rating of ["safe", "suggestive", "erotica", "pornographic"]) {
    url.searchParams.append("contentRating[]", rating)
  }

  const response = await fetcher(url, { headers: { "User-Agent": "Taiyo (+https://taiyo.moe)" } })

  if (!response.ok) {
    throw new Error(`MangaDex responded ${response.status} to ${url.pathname}`)
  }

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return ((await response.json()) as { data: MangaDexManga[] }).data
}
const mangaDexId = sql<string>`${sql.ref("medias.links")} ->> 'mangaDex'`

export const syncMediaRelations = async ({
  db,
  fetcher = fetch,
  maxBatches = Number.POSITIVE_INFINITY,
  maxRelations = config.input.maxMediaRelations,
}: {
  db: Kysely<DB>
  fetcher?: typeof fetch
  maxBatches?: number
  maxRelations?: number
}) => {
  const totals = { medias: 0, relations: 0 }

  for (let batch = 0; batch < maxBatches; batch++) {
    const pending = await db
      .selectFrom("medias")
      .select(["medias.id", mangaDexId.as("mangaDexId")])
      .where("medias.deletedAt", "is", null)
      .where(mangaDexId, "~*", "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
      .where((eb) =>
        eb.not(
          eb.exists(
            eb
              .selectFrom("mediaRelationSyncs")
              .select("mediaRelationSyncs.mediaId")
              .whereRef("mediaRelationSyncs.mediaId", "=", "medias.id"),
          ),
        ),
      )
      .orderBy("medias.createdAt")
      .limit(MANGADEX_BATCH_SIZE)
      .execute()

    if (pending.length === 0) {
      break
    }

    if (batch > 0) {
      await sleep(MANGADEX_BATCH_DELAY_MS)
    }

    const found = parseMangaDexRelations(
      await fetchMangaDexMangas(
        fetcher,
        pending.map((media) => media.mangaDexId),
      ),
    )
    const mangaDexIds = [...new Set(found.flatMap((relation) => [relation.from, relation.to]))]
    const known =
      mangaDexIds.length === 0
        ? []
        : await db
            .selectFrom("medias")
            .select(["medias.id", mangaDexId.as("mangaDexId")])
            .where("medias.deletedAt", "is", null)
            .where(mangaDexId, "in", mangaDexIds)
            .execute()
    const mediaIds = new Map(known.map((media) => [media.mangaDexId, media.id]))
    const pairs = found.flatMap(({ from, to, type }) => {
      const mediaId = mediaIds.get(from)
      const relatedMediaId = mediaIds.get(to)

      return mediaId === undefined || relatedMediaId === undefined
        ? []
        : [{ mediaId, relatedMediaId, type }]
    })

    totals.medias += pending.length
    totals.relations += await db.transaction().execute(async (trx) => {
      const involved = [...new Set(pairs.flatMap((pair) => [pair.mediaId, pair.relatedMediaId]))]
      const existing =
        involved.length === 0
          ? []
          : await trx
              .selectFrom("mediaRelations")
              .select(["mediaId", "relatedMediaId"])
              .where("mediaId", "in", involved)
              .execute()
      const linked = new Set(existing.map((row) => `${row.mediaId}:${row.relatedMediaId}`))
      const counts = new Map<string, number>()
      const kept = new Set<string>()

      for (const row of existing) {
        counts.set(row.mediaId, (counts.get(row.mediaId) ?? 0) + 1)
      }

      const rows = withInverses(
        pairs.filter((pair) => {
          const key = [pair.mediaId, pair.relatedMediaId].sort().join(":")
          const fits = [pair.mediaId, pair.relatedMediaId].every(
            (id) => (counts.get(id) ?? 0) < maxRelations,
          )

          if (
            pair.mediaId === pair.relatedMediaId ||
            kept.has(key) ||
            !fits ||
            linked.has(`${pair.mediaId}:${pair.relatedMediaId}`) ||
            linked.has(`${pair.relatedMediaId}:${pair.mediaId}`)
          ) {
            return false
          }

          kept.add(key)

          for (const id of [pair.mediaId, pair.relatedMediaId]) {
            counts.set(id, (counts.get(id) ?? 0) + 1)
          }

          return true
        }),
      )

      if (rows.length > 0) {
        await trx
          .insertInto("mediaRelations")
          .values(rows)
          .onConflict((oc) => oc.doNothing())
          .execute()
      }

      await trx
        .insertInto("mediaRelationSyncs")
        .values(pending.map((media) => ({ mediaId: media.id })))
        .onConflict((oc) => oc.doNothing())
        .execute()

      return rows.length / 2
    })
  }

  return totals
}
