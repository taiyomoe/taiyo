import { cacheClient } from "@taiyomoe/cache"
import { DEFAULT_GROUPED_CHAPTERS_LIMIT } from "@taiyomoe/constants"
import { type Languages, db } from "@taiyomoe/db"
import type {
  GetLatestChaptersGroupedByUserInput,
  GetLatestChaptersGroupedInput,
} from "@taiyomoe/schemas"
import type {
  MediaChaptersUploadersStats,
  RawLatestRelease,
  RawLatestReleaseGroupedChapter,
} from "@taiyomoe/types"
import {
  formatRawLatestReleases,
  formatRawLatestReleasesGrouped,
  getFormattedLatestReleasesGrouped,
  latestReleaseQuery,
} from "./utils"

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
  { page, perPage }: GetLatestChaptersGroupedInput,
  userId?: string,
  preferredTitles?: Languages | null,
) => {
  const cacheController = cacheClient.chapters.latestGrouped
  const cached = await cacheController.get()

  if (cached) {
    return formatRawLatestReleasesGrouped(
      cached,
      page,
      perPage,
      preferredTitles,
    )
  }

  const rawChapters = await db.$queryRaw<RawLatestReleaseGroupedChapter[]>`
    SELECT mc.*
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
    ) AS rc
    CROSS JOIN LATERAL (
      WITH RankedChapters AS (
        SELECT "id", "createdAt", "number", "volume", "title", "mediaId", "uploaderId", ROW_NUMBER() OVER (PARTITION BY "mediaId" ORDER BY "createdAt" DESC) AS rank
        FROM "MediaChapter"
        WHERE "mediaId" = rc."mediaId"
      )
      SELECT *
      FROM RankedChapters
      WHERE ("rank" = 1 OR "createdAt" > NOW() - INTERVAL '3 days')
      LIMIT 30
    ) as mc
  `

  return getFormattedLatestReleasesGrouped(
    rawChapters,
    page,
    perPage,
    userId,
    preferredTitles,
  )
}

const getLatestGroupedByUser = async (
  { userId, page, perPage }: GetLatestChaptersGroupedByUserInput,
  requesterId?: string,
  preferredTitles?: Languages | null,
) => {
  const rawChapters = await db.$queryRaw<RawLatestReleaseGroupedChapter[]>`
    WITH RankedChapters AS (
      SELECT
        mc."id",
        mc."createdAt",
        mc."title",
        mc."number",
        mc."volume",
        mc."mediaId",
        mc."uploaderId",
        ARRAY_AGG(cs."B") AS "scanIds",
        COUNT(*) OVER (PARTITION BY mc."mediaId") AS "uploadedCount",
        ROW_NUMBER() OVER (PARTITION BY mc."mediaId" ORDER BY mc."createdAt" DESC) AS "rank"
      FROM "public"."MediaChapter" mc
      LEFT JOIN "_MediaChapterToScan" cs ON mc."id" = cs."A"
      WHERE mc."uploaderId" = ${userId} AND mc."deletedAt" IS NULL
      GROUP BY mc."id"
    ),
    FilteredRankedChapters AS (
      SELECT *
      FROM RankedChapters
      WHERE "rank" <= ${DEFAULT_GROUPED_CHAPTERS_LIMIT}
    ),
    FilteredMedia AS (
      SELECT DISTINCT "mediaId", MAX("createdAt") AS "createdAt"
      FROM FilteredRankedChapters
      GROUP BY "mediaId"
      ORDER BY "createdAt" DESC
      LIMIT ${perPage}
      OFFSET ${(page - 1) * perPage}
    ),
    TotalCount AS (
      SELECT COUNT(DISTINCT "mediaId") AS "totalCount"
      FROM RankedChapters
    )
    SELECT frc.*, tc."totalCount"
    FROM FilteredRankedChapters frc
    JOIN FilteredMedia fm ON frc."mediaId" = fm."mediaId", TotalCount tc
    ORDER BY frc."createdAt" DESC
  `

  return getFormattedLatestReleasesGrouped(
    rawChapters,
    page,
    perPage,
    requesterId,
    preferredTitles,
  )
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
  getLatestGroupedByUser,
  getUploaderStats,
  getDistinctCount,
}
