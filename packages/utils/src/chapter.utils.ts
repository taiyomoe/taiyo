import type { MediaChapter } from "@prisma/client"
import type { BulkUpdateChaptersVolumesInput } from "@taiyomoe/schemas"
import type {
  MediaChapterGroups,
  MediaChapterNavigation,
  MediaLimitedChapter,
} from "@taiyomoe/types"
import { env } from "../env"

const getTitle = (chapter: { title: string | null; number: number }) => {
  return chapter.title ?? `Cap. ${chapter.number}`
}

const getUrl = (chapter: { id: string }) => {
  return `/chapter/${chapter.id}/1`
}

const getUploadEndpoint = () => `${env.NEXT_PUBLIC_IO_URL}/upload`

const getNavigation = (
  chapter: { pages: MediaChapter["pages"] },
  currentPage: number,
): MediaChapterNavigation => ({
  previousPage: currentPage === 1 ? null : currentPage - 1,
  currentPage,
  nextPage: currentPage === chapter.pages.length ? null : currentPage + 1,
})

const getVolumes = (chapter: { volume: number | null }[]) => {
  const volumes = chapter
    .map((c) => c.volume)
    .filter((v) => v !== null) as number[]

  return [...new Set(volumes)].sort((a, b) => b - a)
}

const getDuplicatedChapters = (
  input: BulkUpdateChaptersVolumesInput["volumes"],
  chapters: MediaChapter[],
) => {
  const duplicated: number[] = []

  for (const volume of input) {
    for (const id of volume.ids) {
      if (input.some((v) => v !== volume && v.ids.includes(id))) {
        duplicated.push(chapters.find((c) => c.id === id)!.number)
      }
    }
  }

  duplicated.sort()

  return duplicated
}

const getFromRange = (
  chapter: { id: string; number: number }[],
  range: number[],
) => {
  return chapter.filter((c) => range.includes(c.number)).map((c) => c.id)
}

const computeVolumeGroups = (input: MediaLimitedChapter[]) => {
  const volumes: Record<string, MediaLimitedChapter[]> = {}

  for (const mediaChapter of input) {
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

const computeOrder = (chapterIndex: number, total: number) => {
  if (total === 1) return "unique"
  if (chapterIndex === 0) return "first"
  if (chapterIndex === total - 1) return "last"

  return "middle"
}

const parseUrl = (pathname: string) => {
  const splitted = pathname.split("/")
  const currentPage = splitted[3]

  if (
    !currentPage ||
    splitted.length !== 4 || // if url has more parts than expected
    Number.isNaN(Number(currentPage)) || // if it's NaN
    Number.parseInt(currentPage) !== Number.parseFloat(currentPage) // if it's a float
  ) {
    return {
      rawPathname: splitted.slice(0, 3).join("/"),
      currentPageNumber: null,
    }
  }

  return {
    rawPathname: splitted.slice(0, 3).join("/"),
    currentPageNumber: Number.parseInt(currentPage),
  }
}

export const ChapterUtils = {
  getTitle,
  getUrl,
  getUploadEndpoint,
  getNavigation,
  getVolumes,
  getDuplicatedChapters,
  getFromRange,
  computeVolumeGroups,
  computeOrder,
  parseUrl,
}
