import { db } from "@taiyomoe/db"
import { ScansNotFoundError } from "~/utils/errors"

const getByIds = async (ids: string[]) => {
  const result = await db.scan.findMany({
    where: { id: { in: ids } },
  })

  if (result.length !== ids.length) {
    throw new ScansNotFoundError()
  }

  return result
}

export const ScansService = {
  getByIds,
}
