import { db } from "@taiyomoe/db"
import { BaseTrackersService } from "@taiyomoe/services"
import { HttpError } from "../utils/trpc-error"

const getMdByMediaId = async (input: string) => {
  const result = await db.mediaTracker.findFirst({
    select: { externalId: true },
    where: { tracker: "MANGADEX", media: { id: input, deletedAt: null } },
  })

  if (!result) {
    throw new HttpError("NOT_FOUND", "medias.notFound")
  }

  return result.externalId
}

export const TrackersService = {
  ...BaseTrackersService,
  getMdByMediaId,
}
