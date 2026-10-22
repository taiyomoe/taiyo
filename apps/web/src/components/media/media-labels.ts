import type { BadgeVariant } from "@taiyomoe/ui/components/ui/badge"
import { config } from "@taiyomoe/config"
import type { LibraryStatus } from "@/lib/queries/library"
import type { Media } from "@/lib/queries/medias"
import { m } from "@/paraglide/messages"

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

const TAGS = new Map(Object.entries(config.tags))

export const getMediaTags = (tags: Media["tags"]) =>
  (tags ?? []).flatMap(({ key, isSpoiler }) => {
    const tag = TAGS.get(key)

    if (tag === undefined) {
      return []
    }

    return [{ key, isSpoiler, isGenre: tag.category === "Genre", name: tag.name.en }]
  })

export const getMainTitle = (titles: Media["titles"]) =>
  titles.find((title) => title.isMainTitle)?.title ?? null
