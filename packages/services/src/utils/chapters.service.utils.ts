import type { Languages, Prisma } from "@taiyomoe/db"
import type { LatestRelease, RawLatestRelease } from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"

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
