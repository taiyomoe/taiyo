import { db } from "@taiyomoe/db"
import { BaseMediasService } from "@taiyomoe/services"
import { HttpError } from "~/utils/http-error"

const getById = async (input: string) => {
  const result = await db.media.findUnique({
    where: { id: input, deletedAt: null },
  })

  if (!result) {
    throw new HttpError(404, "medias.notFound")
  }

  return result
}

export const MediasService = {
  ...BaseMediasService,
  getById,
}
