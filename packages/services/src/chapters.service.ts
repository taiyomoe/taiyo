import type { Languages } from "@prisma/client"
import { cacheClient } from "@taiyomoe/cache"
import { type MediaChapter, db } from "@taiyomoe/db"
import type {
  MediaChaptersUploadersStats,
  RawLatestRelease,
  RawLatestReleaseGrouped,
} from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"

// const getLatest = async (preferredTitles: Languages = "en") => {
//   const formatRaw = (input: RawLatestReleaseGrouped[]) =>
//     input.map(({ titles, ...r }) => ({
//       ...r,
//       mainTitle: MediaUtils.getMainTitle(titles, preferredTitles),
//     }))

//   const rawChapters = await db.$queryRaw<MediaChapter[]>`
//     SELECT *
//     FROM (
//       SELECT *
//       FROM (
//         SELECT DISTINCT ON ("mediaId") "mediaId", "createdAt"
//         FROM "MediaChapter"
//         WHERE "deletedAt" IS NULL
//         LIMIT 100
//       )
//       ORDER BY "createdAt" DESC
//     ) AS distinct_media
//     CROSS JOIN LATERAL (
//       WITH RankedChapters AS (
//       	SELECT *, ROW_NUMBER() OVER (PARTITION BY "mediaId" ORDER BY "createdAt" DESC) AS rn
//       	FROM "MediaChapter"
// 		    WHERE "mediaId" = distinct_media."mediaId"
//       )
//       SELECT *
//       FROM RankedChapters
//       WHERE (rn = 1 OR "createdAt" > NOW() - INTERVAL '3 days')
//       ORDER BY "createdAt" DESC
//       LIMIT 3
//     );
//   `
//   const medias = await db.media.findMany({
//     where: { id: { in: [...new Set(rawChapters.map((c) => c.mediaId))] } },
//     select: {
//       id: true,
//       covers: {
//         select: { id: true },
//         where: { isMainCover: true },
//         take: 1,
//       },
//       titles: {
//         select: {
//           title: true,
//           language: true,
//           priority: true,
//           isAcronym: true,
//           isMainTitle: true,
//         },
//         where: { deletedAt: null },
//       },
//     },
//   })
//   const uploaders = await db.user.findMany({
//     where: { id: { in: [...new Set(rawChapters.map((c) => c.uploaderId))] } },
//     select: { id: true, name: true },
//   })
//   const chaptersWithScans = await db.mediaChapter.findMany({
//     select: { id: true, scans: { select: { id: true, name: true } } },
//     where: { id: { in: rawChapters.map((c) => c.id) } },
//   })

//   const distinctMediaIds = [...new Set(rawChapters.map((c) => c.mediaId))]
//   const rawReleases: RawLatestReleaseGrouped[] = distinctMediaIds.map(
//     (mediaId) => {
//       const media = medias.find((m) => m.id === mediaId)!
//       const chapters = rawChapters.filter((c) => c.mediaId === mediaId)

//       return {
//         id: mediaId,
//         coverId: media.covers.at(0)!.id,
//         titles: media.titles,
//         chapters: chapters.map((c) => ({
//           id: c.id,
//           createdAt: c.createdAt,
//           number: c.number,
//           volume: c.volume,
//           title: c.title,
//           uploader: uploaders.find((u) => u.id === c.uploaderId)!,
//           scans: chaptersWithScans.find(({ id }) => id === c.id)!.scans,
//         })),
//       }
//     },
//   )

//   return formatRaw(rawReleases)
// }

const getLatest = async (preferredTitles: Languages = "en") => {
  const cacheController = cacheClient.chapters.latest
  const cached = await cacheController.get()

  const formatRaw = (input: RawLatestRelease[]) =>
    input.map(({ media, ...r }) => ({
      ...r,
      media: {
        id: media.id,
        coverId: media.coverId,
        mainTitle: MediaUtils.getMainTitle(media.titles, preferredTitles),
      },
    }))

  if (cached) {
    return formatRaw(cached)
  }

  const result = await db.mediaChapter.findMany({
    take: 30,
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
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
    },
  })
  const rawLatestReleases: RawLatestRelease[] = result.map(
    ({ media, ...r }) => ({
      ...r,
      media: {
        id: media.id,
        coverId: media.covers.at(0)!.id,
        titles: media.titles,
      },
    }),
  )

  void cacheController.set(rawLatestReleases)

  return formatRaw(rawLatestReleases)
}

const getLatestGrouped = async (preferredTitles: Languages = "en") => {
  const formatRaw = (input: RawLatestReleaseGrouped[]) =>
    input.map(({ titles, ...r }) => ({
      ...r,
      mainTitle: MediaUtils.getMainTitle(titles, preferredTitles),
    }))

  const rawChapters = await db.$queryRaw<MediaChapter[]>`
    SELECT mc.*
    FROM (
      SELECT DISTINCT "mediaId"
      FROM "MediaChapter"
      WHERE "deletedAt" IS NULL
      LIMIT 100
    ) AS distinct_media
    CROSS JOIN LATERAL (
      SELECT *
      FROM "MediaChapter" mc
      WHERE mc."mediaId" = distinct_media."mediaId"
      ORDER BY "id"
      LIMIT 5
    ) AS mc;
  `
  const medias = await db.media.findMany({
    where: { id: { in: [...new Set(rawChapters.map((c) => c.mediaId))] } },
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
    where: { id: { in: [...new Set(rawChapters.map((c) => c.uploaderId))] } },
    select: { id: true, name: true },
  })

  const distinctMediaIds = [...new Set(rawChapters.map((c) => c.mediaId))]
  const rawReleases: RawLatestReleaseGrouped[] = distinctMediaIds.map(
    (mediaId) => {
      const media = medias.find((m) => m.id === mediaId)!
      const chapters = rawChapters.filter((c) => c.mediaId === mediaId)

      return {
        id: mediaId,
        coverId: media.covers.at(0)!.id,
        titles: media.titles,
        chapters: chapters.map((c) => ({
          id: c.id,
          createdAt: c.createdAt,
          number: c.number,
          volume: c.volume,
          title: c.title,
          uploader: uploaders.find((u) => u.id === c.uploaderId)!,
          scans: [],
        })),
      }
    },
  )

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

export const MediaChapterService = {
  getLatest,
  getLatestGrouped,
  getUploaderStats,
}
