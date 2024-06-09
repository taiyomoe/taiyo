import type { Languages } from "@prisma/client"
import { db } from "@taiyomoe/db"
import type {
  LatestRelease,
  MediaChaptersUploadersStats,
} from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"

const getLatestReleases = async (preferredTitles: Languages = "en") => {
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

const getUploaderStats = async () => {
  const result = await db.$queryRaw<MediaChaptersUploadersStats>`
    SELECT 
      DATE_TRUNC('day', c."createdAt") as "date",
      COUNT(*) as "chaptersCount",
      u."name" as "userName"
    FROM
      "MediaChapter" c
    JOIN
      "User" u ON c."uploaderId" = u."id"
    GROUP BY 
      "date", c."uploaderId", u."name"
    ORDER BY 
      "date", c."uploaderId";
  `

  return result.map((r) => ({
    ...r,
    chaptersCount: Number(r.chaptersCount),
  }))
}

export const MediaChapterService = {
  getLatestReleases,
  getUploaderStats,
}
