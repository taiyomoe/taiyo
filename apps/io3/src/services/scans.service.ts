import { db } from "@taiyomoe/db"

const getByIds = async (ids: string[]) => {
  const result = await db.scan.findMany({
    where: { id: { in: ids } },
  })

  if (result.length !== ids.length) {
    throw new Error("One or more scans were not found.")
  }

  return result
}

export const ScansService = {
  getByIds,
}
