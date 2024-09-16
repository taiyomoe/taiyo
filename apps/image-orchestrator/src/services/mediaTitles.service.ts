import { db } from "@taiyomoe/db"

const getAll = async (mediaId: string) => {
  const result = await db.mediaTitle.findMany({
    where: { mediaId },
  })

  return result
}
export const MediaTitlesService = {
  getAll,
}
