import { DateTime } from "luxon"

import { env } from "~/lib/env.mjs"
import type {
  MediaChapterGroups,
  MediaChapterLimited,
  MediaChapterNavigation,
  MediaLimitedChapter,
} from "~/lib/types"

const getTitle = (mediaChapter: MediaLimitedChapter) => {
  return mediaChapter.title ?? "Cap. " + mediaChapter.number
}

const getUrl = (mediaChapter: { id: string }) => {
  return `/chapter/${mediaChapter.id}/1`
}

const getUploadEndpoint = () => env.NEXT_PUBLIC_IO_URL + "/upload"

const getNavigation = (
  mediaChapter: MediaChapterLimited,
  currentPage: number,
): MediaChapterNavigation => ({
  previousPage: currentPage === 1 ? null : currentPage - 1,
  currentPage,
  nextPage: currentPage === mediaChapter.pages.length ? null : currentPage + 1,
})

const computeUploadedTime = (mediaChapter: { createdAt: Date }) => {
  const uploadedAt = DateTime.fromJSDate(mediaChapter.createdAt)

  return uploadedAt.toRelative({ locale: "pt", style: "short" })
}

const computeVolumes = (mediaChapters: MediaLimitedChapter[]) => {
  const volumes: Record<string, MediaLimitedChapter[]> = {}

  for (const mediaChapter of mediaChapters) {
    const volume = mediaChapter.volume ?? "null"

    if (!volumes[volume]) {
      volumes[volume] = []
    }

    volumes[volume]?.push(mediaChapter)
  }

  return Object.entries(volumes)
    .sort((a, b) => {
      if (a[0] === "null" || b[0] === "null") return -1

      return Number(b[0]) - Number(a[0])
    })
    .map(([volume, mediaChptrs]) => {
      const groups: MediaChapterGroups = []
      const groupsObject: Record<string, MediaLimitedChapter[]> = {}

      for (const mediaChptr of mediaChptrs) {
        if (!groupsObject[mediaChptr.number]) {
          groupsObject[mediaChptr.number] = []
        }

        groupsObject[mediaChptr.number]?.push(mediaChptr)
      }

      for (const chptrs of Object.values(groupsObject)) {
        groups.push({
          number: chptrs[0]!.number,
          chapters: chptrs,
        })
      }

      return {
        volume,
        groups: groups.sort((a, b) => b.number - a.number),
      }
    })
}

const parseUrl = (pathname: string) => {
  const splitted = pathname.split("/")
  const currentPage = splitted[3]

  if (
    !currentPage ||
    splitted.length !== 4 || // if url has more parts than expected
    Number.isNaN(Number(currentPage)) || // if it's NaN
    parseInt(currentPage) !== parseFloat(currentPage) // if it's a float
  ) {
    return {
      rawPathname: splitted.slice(0, 3).join("/"),
      currentPageNumber: null,
    }
  }

  return {
    rawPathname: splitted.slice(0, 3).join("/"),
    currentPageNumber: parseInt(currentPage),
  }
}

export const MediaChapterUtils = {
  getTitle,
  getUrl,
  getUploadEndpoint,
  getNavigation,
  computeUploadedTime,
  computeVolumes,
  parseUrl,
}
