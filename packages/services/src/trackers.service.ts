import type { MediaTracker, Prisma } from "@taiyomoe/db"
import { logsClient } from "@taiyomoe/logs"

const getFormatted = (
  input: { malId?: number; alId?: number; mdId?: string },
  creatorId: string,
) => {
  const trackers: Prisma.MediaTrackerCreateManyMediaInput[] = []

  if (input.mdId) {
    trackers.push({
      tracker: "MANGADEX",
      externalId: input.mdId,
      creatorId,
    })
  }

  if (input.alId) {
    trackers.push({
      tracker: "ANILIST",
      externalId: input.alId.toString(),
      creatorId,
    })
  }

  if (input.malId) {
    trackers.push({
      tracker: "MYANIMELIST",
      externalId: input.malId.toString(),
      creatorId,
    })
  }

  return trackers
}

const postCreate = async (
  type: "created" | "imported" | "synced",
  trackers: MediaTracker[],
) => {
  for (const title of trackers) {
    await logsClient.trackers.insert({
      type,
      _new: title,
      userId: title.creatorId,
    })
  }
}

const postUpdate = async (
  type: "updated" | "synced",
  oldTracker: MediaTracker,
  newTracker: MediaTracker,
  userId: string,
) => {
  await logsClient.trackers.insert({
    type,
    old: oldTracker,
    _new: newTracker,
    userId,
  })
}

const postDelete = async (tracker: MediaTracker) => {
  await logsClient.trackers.insert({
    type: "deleted",
    old: tracker,
    userId: tracker.deleterId!,
  })
}

export const TrackersService = {
  getFormatted,
  postCreate,
  postUpdate,
  postDelete,
}
