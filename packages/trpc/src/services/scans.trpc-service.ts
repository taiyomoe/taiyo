import { db } from "@taiyomoe/db"
import { HttpError } from "../utils/trpc-error"

const getAllById = async (input: string[]) => {
  const result = await db.scan.findMany({
    where: { id: { in: input }, deletedAt: null },
  })

  if (input.length !== result.length) {
    throw new HttpError("NOT_FOUND", "scans.multipleNotFound")
  }

  return result
}

export const ScansService = {
  getAllById,
}
