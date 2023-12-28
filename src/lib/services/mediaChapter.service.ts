import type { Languages } from "@prisma/client"

import { db } from "~/lib/server/db"
import type { LatestRelease } from "~/lib/types"
import { MediaUtils } from "~/lib/utils/media.utils"

const getLatestReleases = async (
  preferredTitles: Languages | null | undefined,
) => {
  const result = await db.mediaChapter.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    distinct: ["mediaId"],
    select: {
      id: true,
      createdAt: true,
      number: true,
      volume: true,
      title: true,
      uploader: { select: { id: true, name: true } },
      scans: { select: { id: true, name: true } },
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
    },
    where: { deletedAt: null },
  })

  const latestReleases: LatestRelease[] = result.map((c) => ({
    id: c.id,
    createdAt: c.createdAt,
    number: c.number,
    volume: c.volume,
    title: c.title,
    uploader: { id: c.uploader.id, name: c.uploader.name },
    scans: c.scans.map((s) => ({ id: s.id, name: s.name })),
    media: {
      id: c.media.id,
      coverId: c.media.covers.at(0)!.id,
      mainTitle: MediaUtils.getMainTitle(c.media.titles, preferredTitles),
    },
  }))

  return latestReleases
}

export const MediaChapterService = {
  getLatestReleases,
}
