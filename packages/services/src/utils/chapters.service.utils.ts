import { DEFAULT_GROUPED_CHAPTERS_LIMIT } from "@taiyomoe/constants"
import { type Languages, type Prisma, db } from "@taiyomoe/db"
import type {
  LatestRelease,
  RawLatestRelease,
  RawLatestReleaseGrouped,
  RawLatestReleaseGroupedChapter,
} from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"
import { TRPCError } from "@trpc/server"
import { omit } from "radash"

export const latestReleaseQuery = {
  id: true,
  createdAt: true,
  number: true,
  volume: true,
  title: true,
  media: {
    select: {
      id: true,
      covers: {
        select: { id: true },
        where: { isMainCover: true },
        take: 1,
      },
      titles: {
        select: {
          title: true,
          language: true,
          priority: true,
          isAcronym: true,
          isMainTitle: true,
        },
        where: { deletedAt: null },
      },
    },
  },
  uploader: { select: { id: true, name: true } },
  scans: { select: { id: true, name: true } },
} satisfies Prisma.MediaChapterFindManyArgs["select"]

export const formatRawLatestReleases = (
  input: RawLatestRelease[],
  preferredTitles?: Languages | null,
): LatestRelease[] =>
  input.map(({ media, ...r }) => ({
    ...r,
    media: {
      id: media.id,
      coverId: media.covers.at(0)!.id,
      mainTitle: MediaUtils.getDisplayTitle(media.titles, preferredTitles),
    },
  }))

export const formatRawLatestReleasesGrouped = (
  input: RawLatestReleaseGrouped[],
  page: number,
  perPage: number,
  preferredTitles?: Languages | null,
  totalCount = 1,
) => ({
  medias: input
    .map(({ titles, ...r }) => ({
      ...r,
      mainTitle: MediaUtils.getDisplayTitle(titles, preferredTitles),
    }))
    .slice((page - 1) * perPage, page * perPage),
  totalPages: Math.ceil(Number(totalCount) / perPage),
})

export const getFormattedLatestReleasesGrouped = async (
  input: RawLatestReleaseGroupedChapter[],
  page: number,
  perPage: number,
  userId?: string,
  preferredTitles?: Languages | null,
) => {
  const uniqueMedias = [...new Set(input.map((c) => c.mediaId))]
  const uniqueUploaders = [...new Set(input.map((c) => c.uploaderId))]
  const uniqueScans = [...new Set(input.flatMap((c) => c.scanIds))]

  const medias = await db.media.findMany({
    where: { id: { in: uniqueMedias } },
    select: {
      id: true,
      synopsis: true,
      covers: {
        select: { id: true },
        where: { isMainCover: true },
        take: 1,
      },
      titles: {
        select: {
          title: true,
          language: true,
          priority: true,
          isAcronym: true,
          isMainTitle: true,
        },
        where: { deletedAt: null },
      },
    },
  })
  const uploaders = await db.user.findMany({
    where: { id: { in: uniqueUploaders } },
    select: { id: true, name: true },
  })
  const scans = await db.scan.findMany({
    where: { id: { in: uniqueScans } },
    select: { id: true, name: true },
  })
  const userHistory = userId
    ? await db.userHistory.findMany({
        where: { mediaId: { in: uniqueMedias }, userId },
        select: { mediaId: true, progression: true },
      })
    : []

  if (uploaders.length !== uniqueUploaders.length) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Some uploaders were not found.",
    })
  }

  const rawReleases: RawLatestReleaseGrouped[] = uniqueMedias.map((mediaId) => {
    const media = medias.find((m) => m.id === mediaId)!
    const chapters = input.filter((c) => c.mediaId === mediaId)

    return {
      id: media.id,
      synopsis: media.synopsis,
      hasMoreChapters:
        chapters.at(0)!.uploadedCount > DEFAULT_GROUPED_CHAPTERS_LIMIT,
      coverId: media.covers.at(0)!.id,
      titles: media.titles,
      chapters: chapters.map(({ mediaId: _, uploaderId, ...c }) => ({
        ...omit(c, ["uploadedCount", "totalCount", "rank"]),
        completed:
          userHistory
            .find((h) => h.mediaId === mediaId)
            ?.progression?.map((p) => p.chapterId)
            ?.includes(c.id) ?? null,
        uploader: uploaders.find((u) => u.id === uploaderId)!,
        scans: scans.filter((s) => c.scanIds.includes(s.id)),
      })),
    }
  })

  return formatRawLatestReleasesGrouped(
    rawReleases,
    page,
    perPage,
    preferredTitles,
    input.at(0)?.totalCount,
  )
}
