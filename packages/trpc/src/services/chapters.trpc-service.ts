import { cacheClient } from "@taiyomoe/cache"
import {
  DEFAULT_GROUPED_CHAPTERS_LIMIT,
  DEFAULT_GROUPED_CHAPTERS_LITE_LIMIT,
} from "@taiyomoe/constants"
import { type Languages, db } from "@taiyomoe/db"
import type { GetLatestChaptersGroupedByUserInput } from "@taiyomoe/schemas"
import {
  BaseChaptersService,
  BaseChaptersServiceUtils,
} from "@taiyomoe/services"

import type {
  RawLatestRelease,
  RawLatestReleaseGroupedChapter,
  RawLatestReleaseGroupedLite,
} from "@taiyomoe/types"

const getLatest = async (preferredTitles?: Languages | null) => {
  const cacheController = cacheClient.chapters.latest
  const cached = await cacheController.get()

  if (cached) {
    return BaseChaptersServiceUtils.formatRawLatestReleases(
      cached,
      preferredTitles,
    )
  }

  const result: RawLatestRelease[] = await db.mediaChapter.findMany({
    select: BaseChaptersServiceUtils.latestReleaseQuery,
    where: { deletedAt: null, media: { deletedAt: null } },
    orderBy: { createdAt: "desc" },
    take: 30,
  })

  void cacheController.set(result)

  return BaseChaptersServiceUtils.formatRawLatestReleases(
    result,
    preferredTitles,
  )
}

const getLatestGroupedLite = async () => {
  const cacheController = cacheClient.chapters.latestGroupedLite
  const cached = await cacheController.get()

  if (cached) {
    return cached
  }

  const rawChapters = await db.$queryRaw<RawLatestReleaseGroupedLite[]>`
    WITH RankedChapters AS (
      SELECT
        mc."id",
        mc."createdAt",
        mc."number",
        mc."mediaId",
        ROW_NUMBER() OVER (PARTITION BY mc."mediaId" ORDER BY mc."createdAt" DESC) AS rank
      FROM "MediaChapter" mc
      WHERE mc."deletedAt" IS NULL
      ORDER BY mc."mediaId", mc."createdAt" DESC
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
      LIMIT ${DEFAULT_GROUPED_CHAPTERS_LITE_LIMIT}
    )
    SELECT frc."id", frc."createdAt", frc."number", frc."mediaId"
    FROM FilteredRankedChapters frc
    JOIN FilteredMedia fm ON frc."mediaId" = fm."mediaId"
    ORDER BY frc."createdAt" DESC
  `
  const uniqueMedias = [...new Set(rawChapters.map((c) => c.mediaId))]
  const medias = await db.media.findMany({
    select: { id: true, covers: { select: { id: true, isMainCover: true } } },
    where: { id: { in: uniqueMedias } },
  })
  /**
   * This returns the formatted latest releases grouped lite.
   * We first apply a sort to the chapters, so the most recent is first
   * and the we apply a second sort on the results array so the media
   * with the most recent FIRST chapter is first.
   */
  const result = uniqueMedias
    .map((mediaId) => {
      const media = medias.find((m) => m.id === mediaId)!

      return {
        id: media.id,
        coverId: media.covers.at(0)!.id,
        chapters: rawChapters
          .filter((c) => c.mediaId === mediaId)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      }
    })
    .sort(
      (a, b) =>
        b.chapters[0]!.createdAt.getTime() - a.chapters[0]!.createdAt.getTime(),
    )

  void cacheController.set(result)

  return result
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
      LEFT JOIN "Media" m ON mc."mediaId" = m."id"
      WHERE mc."uploaderId" = ${userId} AND mc."deletedAt" IS NULL AND m."deletedAt" IS NULL
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

  return BaseChaptersServiceUtils.getFormattedLatestReleasesGrouped(
    rawChapters,
    page,
    perPage,
    requesterId,
    preferredTitles,
  )
}

export const ChaptersService = {
  ...BaseChaptersService,
  getLatest,
  getLatestGroupedLite,
  getLatestGroupedByUser,
}
