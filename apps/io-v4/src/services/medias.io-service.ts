import { db } from "@taiyomoe/db"
import { HttpError } from "~/utils/http-error"

const get = (input: string) => {
  const result = db.media.findUnique({
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
