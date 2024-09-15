import { db } from "@taiyomoe/db"
import type { CreateMediaInput } from "../schemas"
import { DuplicatedMediaTrackerError } from "../utils/errors"

const getAll = async (id: string) => {
  const result = await db.mediaTracker.findMany({
    select: { id: true, tracker: true, externalId: true },
    where: { mediaId: id },
  })

  return result
}

const has = async (
  trackers: Pick<CreateMediaInput, "mdId" | "alId" | "malId">,
) => {
  const array = [
    trackers.mdId,
    trackers.alId?.toString(),
    trackers.malId?.toString(),
  ].filter(Boolean)
  const media = await db.media.findFirst({
    select: { id: true, trackers: true },
    where: { trackers: { some: { externalId: { in: array } } } },
  })

  if (!media) {
    return false
  }

  const duplicatedTracker = media.trackers.find((tracker) =>
    array.includes(tracker.externalId),
  )!

  throw new DuplicatedMediaTrackerError(media.id, duplicatedTracker.tracker)
}

export const MediaTrackersService = {
  getAll,
  has,
}
