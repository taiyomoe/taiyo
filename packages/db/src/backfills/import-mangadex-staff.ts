import { Manga } from "mangadex-full-api"
import type { StaffLinks } from "../json-types"
import { STAFF_LINK_KEYS, type StaffLink, type StaffRole } from "../constants"
import { getDb, sql } from "../index"

// Imports the authors and artists of every media linked to MangaDex. It used to run inside
// migration 1780359260289_add-staff; it now runs once the database is migrated, site up:
//   node --import tsx packages/db/src/backfills/import-mangadex-staff.ts
//
// It can be stopped and run again: medias that already have staff are skipped, and staff
// are matched by name, since "staffs" keeps no MangaDex id. New "mediaStaffs" rows queue
// their media in the search outbox, so the worker reindexes them.

const MANGADEX_ATTEMPTS = 6
const isMissingOnMangaDex = (error: unknown) =>
  error instanceof Error && error.name === "APIResponseError" && /\((400|404),/.test(error.message)
// Only a 400/404 means the entry is gone. Rate limits and network errors are retried, and
// a persistent one stops the import instead of dropping links.
const fetchFromMangaDex = async <T>(request: () => Promise<T>, attempt = 1): Promise<T | null> => {
  try {
    return await request()
  } catch (error) {
    if (isMissingOnMangaDex(error)) {
      return null
    }

    if (attempt === MANGADEX_ATTEMPTS) {
      throw error
    }

    await new Promise((r) => {
      setTimeout(r, 2 ** attempt * 1000)
    })

    return fetchFromMangaDex(request, attempt + 1)
  }
}
const log = (message: string) => process.stdout.write(`${message}\n`)
const db = getDb()
const admin = await db
  .selectFrom("users")
  .select("id")
  .where("role", "=", "ADMIN")
  .orderBy("createdAt", "asc")
  .executeTakeFirstOrThrow()
const medias = await db
  .selectFrom("medias")
  .select(["id", "links"])
  .where(sql<boolean>`"links" ? 'mangaDex'`)
  .where((eb) =>
    eb.not(
      eb.exists(
        eb.selectFrom("mediaStaffs").select("mediaId").whereRef("mediaId", "=", "medias.id"),
      ),
    ),
  )
  .execute()
const existingStaffs = await db.selectFrom("staffs").select(["id", "name"]).execute()
const staffIdsByName = new Map(existingStaffs.map((staff) => [staff.name, staff.id]))
const staffIdsByMangaDexId = new Map<string, string>()

log(`${medias.length} medias to import, ${existingStaffs.length} staff already known`)

for (const [index, media] of medias.entries()) {
  const { mangaDex: mangaDexId, ...otherLinks } = media.links

  if (mangaDexId === undefined || mangaDexId === "") {
    continue
  }

  const manga = await fetchFromMangaDex(() => Manga.get(mangaDexId))

  if (!manga) {
    log(`No MangaDex manga for media ${media.id} (mangaDex=${mangaDexId}); dropping the link`)

    await db.updateTable("medias").set({ links: otherLinks }).where("id", "=", media.id).execute()

    continue
  }

  const mediaStaffs: Array<{ mediaId: string; staffId: string; role: StaffRole }> = []

  for (const relation of [...manga.authors, ...manga.artists]) {
    let staffId = staffIdsByMangaDexId.get(relation.id)

    if (staffId === undefined) {
      const staff = await fetchFromMangaDex(() => relation.resolve())

      if (!staff) {
        continue
      }

      staffId = staffIdsByName.get(staff.name)

      if (staffId === undefined) {
        const candidates: Partial<Record<StaffLink, string | null>> = {
          website: staff.website,
          twitter: staff.twitter,
          youtube: staff.youtube,
          tumblr: staff.tumblr,
          fanbox: staff.fanBox,
          fantia: staff.fantia,
          pixiv: staff.pixiv,
          melonBooks: staff.melonBook,
          namicomi: staff.namicomi,
          naver: staff.naver,
          nicoVideo: staff.nicoVideo,
          skeb: staff.skeb,
          weibo: staff.weibo,
          booth: staff.booth,
        }
        const links: StaffLinks = {}

        for (const key of STAFF_LINK_KEYS) {
          const value = candidates[key]

          if (value !== undefined && value !== null && value !== "") {
            links[key] = value
          }
        }

        const bio = staff.biography.localString !== "" ? { en: staff.biography.localString } : {}
        const inserted = await db
          .insertInto("staffs")
          .values({ name: staff.name, bio, links, creatorId: admin.id })
          .returning("id")
          .executeTakeFirstOrThrow()

        staffId = inserted.id
        staffIdsByName.set(staff.name, staffId)
      }

      staffIdsByMangaDexId.set(relation.id, staffId)
    }

    mediaStaffs.push({
      mediaId: media.id,
      staffId,
      role: relation.type === "author" ? "AUTHOR" : "ARTIST",
    })
  }

  if (mediaStaffs.length > 0) {
    await db
      .insertInto("mediaStaffs")
      .values(mediaStaffs)
      .onConflict((oc) => oc.doNothing())
      .execute()
  }

  if ((index + 1) % 50 === 0) {
    log(`Processed ${index + 1}/${medias.length} medias`)
  }

  // Stays well under MangaDex's rate limit.
  await new Promise((r) => {
    setTimeout(r, 50)
  })
}

log(`Done: ${medias.length} medias processed`)

await db.destroy()
