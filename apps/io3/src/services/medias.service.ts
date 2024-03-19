import { db } from "@taiyomoe/db"

const getById = async (id: string) => {
  const result = await db.media.findUnique({ where: { id } })

  if (!result) {
    throw new Error("Media not found.")
  }

  return result
}

export const MediasService = {
  getById,
}
