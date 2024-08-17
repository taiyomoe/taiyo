import type { Languages } from "@prisma/client"
import { cacheClient } from "@taiyomoe/cache"
import { DEFAULT_LATEST_CHAPTERS_GROUPED_PER_PAGE } from "@taiyomoe/constants"
import { type MediaChapter, db } from "@taiyomoe/db"
import type {
  MediaChaptersUploadersStats,
  RawLatestRelease,
  RawLatestReleaseGrouped,
} from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"
import { formatRawLatestReleases, latestReleaseQuery } from "./utils"

const getLatest = async (preferredTitles?: Languages | null) => {
  const cacheController = cacheClient.chapters.latest
  const cached = await cacheController.get()

  if (cached) {
    return formatRawLatestReleases(cached, preferredTitles)
  }

  const result: RawLatestRelease[] = await db.mediaChapter.findMany({
    take: 30,
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: latestReleaseQuery,
  })

  void cacheController.set(result)

  return formatRawLatestReleases(result, preferredTitles)
}

const getLatestGrouped = async (
  preferredTitles?: Languages | null,
  page = 1,
  perPage = DEFAULT_LATEST_CHAPTERS_GROUPED_PER_PAGE,
) => {
  const cacheController = cacheClient.chapters.latestGrouped
  const cached = await cacheController.get()

  const formatRaw = (input: RawLatestReleaseGrouped[]) => ({
    medias: input
      .map(({ titles, ...r }) => ({
        ...r,
        mainTitle: MediaUtils.getDisplayTitle(titles, preferredTitles),
      }))
      .slice((page - 1) * perPage, page * perPage),
    totalPages: Math.ceil(input.length / perPage),
  })

  if (cached) {
    return formatRaw(cached)
  }

  type RawChapter = Pick<
    MediaChapter,
    | "id"
    | "createdAt"
    | "number"
    | "volume"
    | "title"
    | "mediaId"
    | "uploaderId"
  >
  const rawChapters = await db.$queryRaw<RawChapter[]>`
    SELECT chapters.*
    FROM (
      SELECT *
      FROM (
          SELECT DISTINCT ON ("mediaId") "createdAt", "mediaId"
          FROM "MediaChapter"
          WHERE "deletedAt" IS NULL
          ORDER BY "mediaId", "createdAt" DESC
      )
      ORDER BY "createdAt" DESC
      LIMIT 100
    ) AS rawMedias
    CROSS JOIN LATERAL (
      WITH rankedChapters AS (
        SELECT "id", "createdAt", "number", "volume", "title", "mediaId", "uploaderId", ROW_NUMBER() OVER (PARTITION BY "mediaId" ORDER BY "createdAt" DESC) AS rank
        FROM "MediaChapter"
        WHERE "mediaId" = rawMedias."mediaId"
      )
      SELECT *
      FROM rankedChapters
      WHERE ("rank" = 1 OR "createdAt" > NOW() - INTERVAL '3 days')
      LIMIT 30
    ) as chapters
  `
  const uniqueMedias = [...new Set(rawChapters.map((c) => c.mediaId))]
  const uniqueUploaders = [...new Set(rawChapters.map((c) => c.uploaderId))]

  const medias = await db.media.findMany({
    where: { id: { in: uniqueMedias } },
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
  })
  const uploaders = await db.user.findMany({
    where: { id: { in: uniqueUploaders } },
    select: { id: true, name: true },
  })

  const rawReleases: RawLatestReleaseGrouped[] = uniqueMedias.map((mediaId) => {
    const media = medias.find((m) => m.id === mediaId)!
    const chapters = rawChapters.filter((c) => c.mediaId === mediaId)

    return {
      id: media.id,
      coverId: media.covers.at(0)!.id,
      titles: media.titles,
      chapters: chapters.map(({ mediaId: _, uploaderId, ...c }) => ({
        ...c,
        uploader: uploaders.find((u) => u.id === uploaderId)!,
        scans: [],
      })),
    }
  })

  return formatRaw(rawReleases)
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

const getDistinctCount = async (mediaId: string) => {
  const result = await db.$queryRaw<[{ count: number }]>`
    SELECT COUNT(DISTINCT "number")
    FROM "MediaChapter"
    WHERE "mediaId" = ${mediaId} AND "deletedAt" IS NULL;
  `

  return result[0].count
}

export const ChaptersService = {
  getLatest,
  getLatestGrouped,
  getUploaderStats,
  getDistinctCount,
}
