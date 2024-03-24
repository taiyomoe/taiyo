import { db } from "@taiyomoe/db"
import { MediaNotFoundError } from "../utils/errors"

const getById = async (id: string) => {
  const result = await db.media.findUnique({ where: { id } })

  if (!result) {
    throw new MediaNotFoundError()
  }

  return result
}

export const MediasService = {
  getById,
}
