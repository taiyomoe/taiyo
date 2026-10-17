import type { BadgeVariant } from "@taiyomoe/ui/components/ui/badge"
import { config } from "@taiyomoe/config"
import type { LibraryStatus } from "@/lib/queries/library"
import type { Media } from "@/lib/queries/medias"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

type Label = () => string

export const MEDIA_TYPE_LABELS: Record<Media["type"], Label> = {
  MANGA: m.media_type_manga,
  MANHWA: m.media_type_manhwa,
  MANHUA: m.media_type_manhua,
  LIGHT_NOVEL: m.media_type_light_novel,
  OTHER: m.media_type_other,
}

export const MEDIA_STATUS_LABELS: Record<Media["status"], Label> = {
  RELEASING: m.media_status_releasing,
  FINISHED: m.media_status_finished,
  NOT_YET_RELEASED: m.media_status_not_yet_released,
  CANCELLED: m.media_status_cancelled,
  HIATUS: m.media_status_hiatus,
}

export const MEDIA_STATUS_BADGES: Record<Media["status"], BadgeVariant> = {
  RELEASING: "success",
  FINISHED: "info",
  NOT_YET_RELEASED: "secondary",
  CANCELLED: "error",
  HIATUS: "warning",
}

export const MEDIA_DEMOGRAPHY_LABELS: Record<Media["demography"], Label> = {
  SHOUNEN: m.media_demography_shounen,
  SHOUJO: m.media_demography_shoujo,
  SEINEN: m.media_demography_seinen,
  JOSEI: m.media_demography_josei,
}

export const MEDIA_SOURCE_LABELS: Record<Media["source"], Label> = {
  ORIGINAL: m.media_source_original,
  LIGHT_NOVEL: m.media_source_light_novel,
  VISUAL_NOVEL: m.media_source_visual_novel,
  WEB_NOVEL: m.media_source_web_novel,
  VIDEO_GAME: m.media_source_video_game,
}

export const MEDIA_COUNTRY_LABELS: Record<Media["countryOfOrigin"], Label> = {
  JAPAN: m.media_country_japan,
  KOREA: m.media_country_korea,
  CHINA: m.media_country_china,
  USA: m.media_country_usa,
  FRANCE: m.media_country_france,
  BRAZIL: m.media_country_brazil,
}

export const LIBRARY_STATUSES = [
  "READING",
  "PLAN_TO_READ",
  "REREADING",
  "ON_HOLD",
  "COMPLETED",
  "DROPPED",
] as const satisfies LibraryStatus[]

export const LIBRARY_STATUS_LABELS: Record<LibraryStatus, Label> = {
  READING: m.library_status_reading,
  REREADING: m.library_status_rereading,
  PLAN_TO_READ: m.library_status_plan_to_read,
  COMPLETED: m.library_status_completed,
  ON_HOLD: m.library_status_on_hold,
  DROPPED: m.library_status_dropped,
}

const LINKS: Record<string, { label: string; href: (value: string) => string }> = {
  mangaDex: { label: "MangaDex", href: (id) => `https://mangadex.org/title/${id}` },
  anilist: { label: "AniList", href: (id) => `https://anilist.co/manga/${id}` },
  myAnimeList: { label: "MyAnimeList", href: (id) => `https://myanimelist.net/manga/${id}` },
  animePlanet: { label: "Anime-Planet", href: (url) => url },
  bookWalker: { label: "BookWalker", href: (url) => url },
  mangaUpdates: { label: "MangaUpdates", href: (url) => url },
  novelUpdates: { label: "NovelUpdates", href: (url) => url },
  kitsu: { label: "Kitsu", href: (url) => url },
  amazon: { label: "Amazon", href: (url) => url },
  eBookJapan: { label: "eBookJapan", href: (url) => url },
  raw: { label: m.media_link_raw(), href: (url) => url },
  officialENTranslation: { label: m.media_link_official({ language: "EN" }), href: (url) => url },
  officialFRTranslation: { label: m.media_link_official({ language: "FR" }), href: (url) => url },
  officialPTBRTranslation: {
    label: m.media_link_official({ language: "PT-BR" }),
    href: (url) => url,
  },
  cdJapan: { label: "CDJapan", href: (url) => url },
}

export const getMediaLinks = (links: Media["links"]) =>
  Object.entries(links).flatMap(([key, value]) => {
    const link = LINKS[key]

    return link === undefined ? [] : [{ key, label: link.label, href: link.href(String(value)) }]
  })

const isTagKey = (key: string): key is keyof typeof config.tags => key in config.tags

export const getMediaTags = (tags: Media["tags"]) =>
  (tags ?? []).flatMap(({ key, isSpoiler }) => {
    if (!isTagKey(key)) {
      return []
    }

    const tag = config.tags[key]

    return [{ key, isSpoiler, isGenre: tag.category === "Genre", name: tag.name.en }]
  })

const pickLocalized = (values: Partial<Record<string, string>>) =>
  values[getLocale()] ?? values.en ?? Object.values(values).find((value) => value !== undefined)

export const getSynopsis = (synopsis: Media["synopsis"]) =>
  (pickLocalized(synopsis)?.split(/\n\s*(?:-{3,}|_{3,}|\*{3,})\s*\n/)[0] ?? "")
    .split(/\n\s*\n/)
    .map((paragraph) =>
      paragraph
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/[*_`#>~]+/g, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter((paragraph) => paragraph !== "")

export const getMainTitle = (titles: Media["titles"]) =>
  titles.find((title) => title.isMainTitle)?.title ?? null

export const getAltTitles = (titles: Media["titles"]) =>
  titles
    .filter((title) => !title.isMainTitle)
    .sort((a, b) => a.priority - b.priority || Number(a.isAcronym) - Number(b.isAcronym))

export const getMediaYears = ({ startDate, endDate, status }: Media) => {
  if (startDate === null) {
    return null
  }

  const start = new Date(startDate).getUTCFullYear()
  const end = endDate === null ? null : new Date(endDate).getUTCFullYear()

  if (end === null) {
    return status === "RELEASING" ? m.media_years_ongoing({ start }) : String(start)
  }

  return end === start ? String(start) : m.media_years({ start, end })
}
