import type { Languages, MediaTitle } from "@prisma/client"
import { CoverUtils } from "./cover.utils"
import { env } from "./env"

const getUrl = (media: { id: string }) => `/media/${media.id}`

const getBannerOrCoverUrl = (media: {
  id: string
  coverId: string
  bannerId: string | null
}) => {
  if (!media.bannerId) return CoverUtils.getUrl(media)

  return `${env.NEXT_PUBLIC_CDN_URL}/medias/${media.id}/banners/${media.bannerId}.jpg`
}

const getDisplayTitle = (
  titles: Pick<MediaTitle, "title" | "language" | "priority" | "isMainTitle">[],
  preferredTitles?: Languages | null,
) => {
  if (!preferredTitles) {
    return titles.find((t) => t.isMainTitle)!.title
  }

  const customSort = (
    a: (typeof titles)[number],
    b: (typeof titles)[number],
  ) => {
    // First, sort by language
    if (a.language === preferredTitles && b.language !== preferredTitles) {
      return -1
    }
    if (a.language !== preferredTitles && b.language === preferredTitles) {
      return 1
    }

    // preferredTitles comes first
    if (a.language === "en" && b.language !== "en") {
      return -1 // "en" comes first
    }
    if (a.language !== "en" && b.language === "en") {
      return 1 // "en" comes first
    }

    if (a.language === "ja_ro" && b.language !== "ja_ro") {
      return -1 // "ja_ro" comes next
    }
    if (a.language !== "ja_ro" && b.language === "ja_ro") {
      return 1 // "ja_ro" comes next
    }

    // If languages are the same, sort by priority
    if (b.priority < a.priority) {
      return -1
    }

    if (b.priority > a.priority) {
      return 1
    }

    // a and b are equal in terms of language and priority
    return 0
  }

  return titles.sort(customSort).at(0)!.title
}

export const MediaUtils = {
  getUrl,
  getBannerOrCoverUrl,
  getDisplayTitle,
}
