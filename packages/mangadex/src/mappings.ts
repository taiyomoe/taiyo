import { config, tags } from "@taiyomoe/config"
import {
  type ContentRating,
  type MediaDemography,
  MEDIA_LANGUAGES,
  type MediaLanguage,
  type MediaLinks,
  type MediaStatus,
  STAFF_LINK_KEYS,
  type StaffLinks,
  SUPPORTED_LANGUAGES,
} from "@taiyomoe/db"
import type { MangaDexGroup, MangaDexStaff } from "./client"

const MANGADEX_LANGUAGES = {
  en: "en",
  fr: "fr",
  pt_br: "pt-br",
  pt_pt: "pt",
  ja: "ja",
  ja_ro: "ja-ro",
  ko: "ko",
  ko_ro: "ko-ro",
  zh: "zh",
  zh_hk: "zh-hk",
  zh_ro: "zh-ro",
} as const satisfies Record<MediaLanguage, string>
const TAIYO_LANGUAGES = new Map<string, MediaLanguage>(
  MEDIA_LANGUAGES.map((language) => [MANGADEX_LANGUAGES[language], language]),
)

export const CHAPTER_LANGUAGES = SUPPORTED_LANGUAGES.map((language) => MANGADEX_LANGUAGES[language])

export const toMangaDexLanguage = (language: MediaLanguage) => MANGADEX_LANGUAGES[language]

export const toMediaLanguage = (language: string | null) =>
  language === null ? null : (TAIYO_LANGUAGES.get(language) ?? null)

export const toSupportedLanguage = (language: string) => {
  const mapped = toMediaLanguage(language)

  return SUPPORTED_LANGUAGES.find((supported) => supported === mapped) ?? null
}

const STATUSES: Record<string, MediaStatus> = {
  ongoing: "RELEASING",
  completed: "FINISHED",
  hiatus: "HIATUS",
  cancelled: "CANCELLED",
}

export const toMediaStatus = (status: string) => STATUSES[status] ?? null

const DEMOGRAPHIES: Record<string, MediaDemography> = {
  shounen: "SHOUNEN",
  shoujo: "SHOUJO",
  seinen: "SEINEN",
  josei: "JOSEI",
}

export const toMediaDemography = (demographic: string | null) =>
  demographic === null ? null : (DEMOGRAPHIES[demographic] ?? null)

const CONTENT_RATINGS: Record<string, ContentRating> = {
  safe: "NORMAL",
  suggestive: "SUGGESTIVE",
  erotica: "NSFW",
  pornographic: "NSFW",
}

export const toContentRating = (rating: string) => CONTENT_RATINGS[rating] ?? null

const isHttpUrl = (value: string) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol)
  } catch {
    return false
  }
}
const urlOrNull = (value: string | null | undefined) =>
  value !== null && value !== undefined && isHttpUrl(value.trim()) ? value.trim() : null
const positiveInt = (value: string) => {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}
const URL_LINK_KEYS = [
  "animePlanet",
  "bookWalker",
  "mangaUpdates",
  "novelUpdates",
  "kitsu",
  "amazon",
  "eBookJapan",
  "cdJapan",
  "raw",
  "officialENTranslation",
] as const
const toMangaUpdatesUrl = (id: string) =>
  positiveInt(id) === null
    ? `https://www.mangaupdates.com/series/${id}`
    : `https://www.mangaupdates.com/series.html?id=${id}`

/** MangaDex keeps some links as bare IDs or slugs: Taiyō keeps URLs, except for AniList and MAL. */
export const toMediaLinks = (links: Record<string, string>) => {
  const mapped: MediaLinks = {}
  const al = links.al === undefined ? null : positiveInt(links.al)
  const mal = links.mal === undefined ? null : positiveInt(links.mal)
  const urls: Record<(typeof URL_LINK_KEYS)[number], string | null> = {
    animePlanet: links.ap === undefined ? null : `https://www.anime-planet.com/manga/${links.ap}`,
    bookWalker: links.bw === undefined ? null : `https://bookwalker.jp/${links.bw}`,
    // Older MangaUpdates IDs are numbers, newer ones are slugs with their own URL.
    mangaUpdates: links.mu === undefined ? null : toMangaUpdatesUrl(links.mu),
    novelUpdates:
      links.nu === undefined ? null : `https://www.novelupdates.com/series/${links.nu}/`,
    kitsu: links.kt === undefined ? null : `https://kitsu.app/manga/${links.kt}`,
    amazon: urlOrNull(links.amz),
    eBookJapan: urlOrNull(links.ebj),
    cdJapan: urlOrNull(links.cdj),
    raw: urlOrNull(links.raw),
    officialENTranslation: urlOrNull(links.engtl),
  }

  if (al !== null) {
    mapped.anilist = al
  }

  if (mal !== null) {
    mapped.myAnimeList = mal
  }

  for (const key of URL_LINK_KEYS) {
    const url = urls[key]

    if (url !== null && url.length <= config.input.maxUrlLength && isHttpUrl(url)) {
      mapped[key] = url
    }
  }

  return mapped
}

export const toStaffLinks = (staff: MangaDexStaff) => {
  const candidates: Partial<Record<(typeof STAFF_LINK_KEYS)[number], string | null | undefined>> = {
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
    const url = urlOrNull(candidates[key])

    if (url !== null && url.length <= config.input.maxUrlLength) {
      links[key] = url
    }
  }

  return links
}

const truncate = (value: string | null | undefined, max: number) =>
  value === null || value === undefined || value.trim() === "" ? null : value.trim().slice(0, max)

export const toGroupValues = (group: MangaDexGroup) => {
  const email = group.contactEmail?.trim() ?? ""
  const discord = group.discord?.trim() ?? ""

  return {
    name: group.name.trim().slice(0, config.input.maxNameLength),
    description: truncate(group.description, config.input.maxDescriptionLength),
    website: urlOrNull(group.website),
    x: urlOrNull(group.twitter),
    discord:
      discord === ""
        ? null
        : (urlOrNull(discord) ??
          (/^[\w-]+$/.test(discord) ? `https://discord.gg/${discord}` : null)),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null,
  }
}

const normalizeTagName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "")
const TAG_KEYS = new Map(
  Object.entries(tags).flatMap(([key, tag]) => [
    [normalizeTagName(key), key],
    [normalizeTagName(tag.name.en), key],
  ]),
)

/** Taiyō's tags carry MangaDex's genres and formats, and most of its themes, under the same English name. */
export const toTagKey = (name: string) => TAG_KEYS.get(normalizeTagName(name)) ?? null

/** A oneshot has no number on MangaDex: it becomes chapter 0. */
export const toChapterNumber = (chapter: string | null, volume: string | null) => {
  if (chapter === null || chapter.trim() === "") {
    return volume === null || volume.trim() === "" ? 0 : null
  }

  const parsed = Number(chapter.trim())

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

export const toChapterTitle = (title: string | null) =>
  truncate(title, config.input.maxChapterTitleLength)

export const toVolume = (volume: string | null) => truncate(volume, config.input.maxVolumeLength)
