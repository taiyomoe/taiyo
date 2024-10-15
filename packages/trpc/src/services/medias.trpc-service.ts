import { type MediaStatus, db } from "@taiyomoe/db"
import { BaseMediasService } from "@taiyomoe/services"
import { TRPCError } from "@trpc/server"

/**
 * Gets the status of a media.
 * Used to check wether or not a user can complete a media.
 */
const getStatus = async (input: string): Promise<MediaStatus> => {
  const result = await db.media.findUnique({
    select: { status: true },
    where: { id: input },
  })

  if (!result) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Media '${input}' not found`,
    })
  }

  return result.status
}

export const MediasService = {
  ...BaseMediasService,
  getStatus,
}
