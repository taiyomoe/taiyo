import type { MediaDetail, MediaHit } from "@/lib/queries/medias"

import { m } from "../../paraglide/messages"

type MediaType = MediaHit["type"]
type MediaStatus = MediaHit["status"]
type MediaDemography = MediaHit["demography"]
type ContentRating = MediaHit["contentRating"]
type StaffRole = MediaDetail["staffs"][number]["role"]

export type ContentRatingBadge = { label: string; variant: "warning" | "error" }

const TYPE_LABELS: Record<MediaType, () => string> = {
  MANGA: m.media_type_manga,
  MANHWA: m.media_type_manhwa,
  MANHUA: m.media_type_manhua,
  LIGHT_NOVEL: m.media_type_light_novel,
  OTHER: m.media_type_other,
}
const STATUS_LABELS: Record<MediaStatus, () => string> = {
  RELEASING: m.media_status_releasing,
  FINISHED: m.media_status_finished,
  NOT_YET_RELEASED: m.media_status_not_yet_released,
  CANCELLED: m.media_status_cancelled,
  HIATUS: m.media_status_hiatus,
}
const DEMOGRAPHY_LABELS: Record<MediaDemography, () => string> = {
  SHOUNEN: m.media_demography_shounen,
  SHOUJO: m.media_demography_shoujo,
  SEINEN: m.media_demography_seinen,
  JOSEI: m.media_demography_josei,
}
const CONTENT_RATING_LABELS: Record<ContentRating, () => string> = {
  NORMAL: m.content_rating_normal,
  SUGGESTIVE: m.content_rating_suggestive,
  NSFW: m.content_rating_nsfw,
  NSFL: m.content_rating_nsfl,
}
const STAFF_ROLE_LABELS: Record<StaffRole, () => string> = {
  AUTHOR: m.staff_role_author,
  ARTIST: m.staff_role_artist,
}

export const mediaTypeLabel = (type: MediaType) => TYPE_LABELS[type]()

export const mediaStatusLabel = (status: MediaStatus) => STATUS_LABELS[status]()

export const mediaDemographyLabel = (demography: MediaDemography) => DEMOGRAPHY_LABELS[demography]()

export const staffRoleLabel = (role: StaffRole) => STAFF_ROLE_LABELS[role]()

export const contentRatingBadge = (rating: ContentRating): ContentRatingBadge | null =>
  rating === "NORMAL"
    ? null
    : {
        label: CONTENT_RATING_LABELS[rating](),
        variant: rating === "SUGGESTIVE" ? "warning" : "error",
      }

export const getMediaCardModel = (
  hit: Pick<MediaHit, "type" | "status" | "contentRating" | "mainTitle" | "mainCoverUrl">,
) => ({
  title: hit.mainTitle?.title ?? m.media_untitled(),
  coverUrl: hit.mainCoverUrl,
  typeLabel: mediaTypeLabel(hit.type),
  statusLabel: mediaStatusLabel(hit.status),
  rating: contentRatingBadge(hit.contentRating),
})

export const getMainTitle = (titles: MediaDetail["titles"]) =>
  (titles.find((title) => title.isMainTitle) ?? titles[0])?.title ?? m.media_untitled()

export const getMainCover = (covers: MediaDetail["covers"]) =>
  covers.find((cover) => cover.isMainCover) ?? covers[0] ?? null

export const getSynopsis = (synopsis: Partial<Record<string, string>>, locale: string) =>
  synopsis[locale] ?? synopsis.en ?? Object.values(synopsis)[0] ?? null
