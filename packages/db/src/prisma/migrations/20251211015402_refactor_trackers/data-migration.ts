import type { Prisma } from "@taiyomoe/db"
import { groupBy, pipe } from "remeda"

export default async (tx: Prisma.TransactionClient) => {
  const mediaTrackers = pipe(
    await tx.$queryRaw<
      {
        id: string
        tracker: string
        externalId: string
        mediaId: string
      }[]
    >`SELECT * FROM "Tracker"`,
    groupBy((t) => t.mediaId),
  )

  for (const mediaId of Object.keys(mediaTrackers)) {
    const trackers = mediaTrackers[mediaId] ?? []
    const trackerMap: Record<string, unknown> = {}

    for (const tracker of trackers) {
      if (tracker.tracker === "MYANIMELIST") {
        trackerMap.mal = Number(tracker.externalId)
      }

      if (tracker.tracker === "ANILIST") {
        trackerMap.al = Number(tracker.externalId)
      }

      if (tracker.tracker === "MANGADEX") {
        trackerMap.md = tracker.externalId
      }
    }

    if (trackers.length > 0) {
      await tx.$executeRaw`
        UPDATE "Media"
        SET "trackers" = ${JSON.stringify(trackerMap)}::jsonb
        WHERE "id" = ${mediaId}::uuid
      `
    }
  }

  await tx.$executeRaw`DROP TABLE "Tracker"`
}
