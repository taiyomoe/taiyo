import { db } from "@taiyomoe/db"
import { HttpError } from "~/utils/http-error"

const get = async (input: string) => {
  const result = await db.media.findUnique({
    where: { id: input, deletedAt: null },
  })

  if (!result) {
    throw new HttpError(404, "medias.notFound")
  }

  return result
}

export const MediasService = {
  get,
}
