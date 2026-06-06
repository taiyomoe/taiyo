import type {
  ContentRating,
  Flag,
  Language,
  MediaCountryOfOrigin,
  MediaDemography,
  MediaSource,
  MediaStatus,
  MediaType,
} from "@taiyomoe/db"
import { type DB, type Kysely } from "@taiyomoe/db"
import { toUnixMs } from "@taiyomoe/utils"

export type MediaDocument = {
  id: string
  type: MediaType
  status: MediaStatus
  source: MediaSource
  demography: MediaDemography
  countryOfOrigin: MediaCountryOfOrigin
  contentRating: ContentRating
  flag: Flag
  createdAt: number
  updatedAt: number
  startDate: number | null
  endDate: number | null
  tagKeys: string[]
  spoilerTagKeys: string[]
  linkProviders: string[]
  titleLanguages: Language[]
  chapterLanguages: Language[]
  coverLanguages: Language[]
  titles: string[]
  synopsis: Partial<Record<Language, string>>
  staffNames: string[]
  authorIds: string[]
  artistIds: string[]
  mainTitle: { title: string; language: Language } | null
  mainCoverId: string | null
  _sortMainTitle: string
}

export const getMediaDocument = async (db: Kysely<DB>, mediaId: string) => {
  const media = await db
    .selectFrom("medias")
    .selectAll()
    .where("id", "=", mediaId)
    .where("deletedAt", "is", null)
    .executeTakeFirst()

  if (!media) return null

  const [titles, covers, staffs, chapterLanguageRows] = await Promise.all([
    db
      .selectFrom("titles")
      .select(["title", "language", "isMainTitle"])
      .where("mediaId", "=", mediaId)
      .where("deletedAt", "is", null)
      .execute(),
    db
      .selectFrom("covers")
      .select(["id", "language", "isMainCover"])
      .where("mediaId", "=", mediaId)
      .where("deletedAt", "is", null)
      .execute(),
    db
      .selectFrom("mediaStaffs")
      .innerJoin("staffs", "staffs.id", "mediaStaffs.staffId")
      .select(["mediaStaffs.role", "mediaStaffs.staffId", "staffs.name"])
      .where("mediaStaffs.mediaId", "=", mediaId)
      .where("staffs.deletedAt", "is", null)
      .execute(),
    db
      .selectFrom("chapters")
      .select("language")
      .distinct()
      .where("mediaId", "=", mediaId)
      .where("deletedAt", "is", null)
      .execute(),
  ])
  const mainTitle = titles.find((t) => t.isMainTitle)
  const mainCover = covers.find((c) => c.isMainCover)
  const authorIds = staffs.filter((s) => s.role === "AUTHOR").map((s) => s.staffId)
  const artistIds = staffs.filter((s) => s.role === "ARTIST").map((s) => s.staffId)
  const tags = media.tags ?? []
  const links = media.links ?? {}
  const createdAt = toUnixMs(media.createdAt)
  const updatedAt = toUnixMs(media.updatedAt)

  if (!mainTitle || !mainCover || !createdAt || !updatedAt) {
    return null
  }

  return {
    id: media.id,
    type: media.type,
    status: media.status,
    source: media.source,
    demography: media.demography,
    countryOfOrigin: media.countryOfOrigin,
    contentRating: media.contentRating,
    flag: media.flag,
    createdAt,
    updatedAt,
    startDate: toUnixMs(media.startDate),
    endDate: toUnixMs(media.endDate),
    tagKeys: tags.map((t) => t.key),
    spoilerTagKeys: tags.filter((t) => t.isSpoiler).map((t) => t.key),
    linkProviders: Object.keys(links),
    titleLanguages: Array.from(new Set(titles.map((t) => t.language))),
    chapterLanguages: chapterLanguageRows.map((r) => r.language),
    coverLanguages: Array.from(new Set(covers.map((c) => c.language))),
    titles: titles.map((t) => t.title),
    synopsis: media.synopsis ?? {},
    staffNames: staffs.map((s) => s.name),
    mainTitle: mainTitle ? { title: mainTitle.title, language: mainTitle.language } : null,
    mainCoverId: mainCover?.id ?? null,
    _sortMainTitle: mainTitle ? mainTitle.title.toLowerCase() : "",
    authorIds,
    artistIds,
  } satisfies MediaDocument
}
